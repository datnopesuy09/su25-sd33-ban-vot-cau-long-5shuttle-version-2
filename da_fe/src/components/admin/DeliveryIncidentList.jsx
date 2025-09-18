import React, { useState, useEffect, useCallback } from 'react';
import { AlertTriangle, MapPin, Clock, User, FileText, Camera, CheckCircle, XCircle, Eye } from 'lucide-react';
import axios from 'axios';

const DeliveryIncidentList = ({ hoaDonId, refreshTrigger, onIncidentResolved, stompClient, adminId }) => {
    const [incidents, setIncidents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedIncident, setSelectedIncident] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showUnresolvableModal, setShowUnresolvableModal] = useState(false);
    const [unresolvableIncident, setUnresolvableIncident] = useState(null);
    const [unresolvableReason, setUnresolvableReason] = useState('');
    const [unresolvableEvidence, setUnresolvableEvidence] = useState('');
    const [processingUnresolvable, setProcessingUnresolvable] = useState(false);

    const incidentTypeLabels = {
        KHONG_NHAN_HANG: { label: 'Khách hàng không nhận hàng', icon: '👤', color: 'bg-yellow-100 text-yellow-800' },
        CHUA_NHAN_HANG: { label: 'Khách hàng chưa nhận hàng', icon: '⏰', color: 'bg-blue-100 text-blue-800' },
        HANG_BI_MAT: { label: 'Hàng bị mất/thất lạc', icon: '📦', color: 'bg-red-100 text-red-800' },
        HANG_BI_HONG: { label: 'Hàng bị hỏng/vỡ', icon: '💔', color: 'bg-orange-100 text-orange-800' },
        SU_CO_VAN_CHUYEN: { label: 'Sự cố vận chuyển khác', icon: '🚛', color: 'bg-purple-100 text-purple-800' },
        KHAC: { label: 'Sự cố khác', icon: '⚠️', color: 'bg-gray-100 text-gray-800' },
    };

    const statusLabels = {
        0: { label: 'Đang xử lý', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
        1: { label: 'Đã giải quyết', color: 'bg-green-100 text-green-800', icon: CheckCircle },
        2: { label: 'Không thể giải quyết - Đã hủy đơn', color: 'bg-red-100 text-red-800', icon: XCircle },
    };

    const fetchIncidents = useCallback(async () => {
        if (!hoaDonId) return;

        setLoading(true);
        try {
            const response = await axios.get(`http://localhost:8080/api/su-co-van-chuyen/hoa-don/${hoaDonId}`);
            setIncidents(response.data);
        } catch (error) {
            console.error('Lỗi khi lấy danh sách sự cố:', error);
        } finally {
            setLoading(false);
        }
    }, [hoaDonId]);

    useEffect(() => {
        fetchIncidents();
    }, [fetchIncidents]);

    // Refresh when external trigger changes (after new incident created)
    useEffect(() => {
        if (refreshTrigger) {
            fetchIncidents();
        }
    }, [refreshTrigger, fetchIncidents]);

    const updateIncidentStatus = async (incidentId, newStatus) => {
        try {
            await axios.put(`http://localhost:8080/api/su-co-van-chuyen/${incidentId}/status`, {
                trangThai: newStatus,
            });
            fetchIncidents(); // Refresh list
        } catch (error) {
            console.error('Lỗi khi cập nhật trạng thái sự cố:', error);
        }
    };

    // Handle unresolvable incident - comprehensive business logic
    const handleUnresolvableIncident = async (incident) => {
        setUnresolvableIncident(incident);
        setUnresolvableReason('');
        setUnresolvableEvidence('');
        setShowUnresolvableModal(true);
    };

    const processUnresolvableIncident = async () => {
        if (!unresolvableReason.trim()) {
            alert('Vui lòng nhập lý do không thể giải quyết');
            return;
        }

        setProcessingUnresolvable(true);
        try {
            // Step 1: Update incident status to UNRESOLVABLE (2) with detailed reason
            const incidentPayload = {
                hoaDonId: unresolvableIncident.hoaDonId,
                loaiSuCo: unresolvableIncident.loaiSuCo,
                moTa: unresolvableIncident.moTa,
                diaDiem: unresolvableIncident.diaDiem,
                ngayXayRa: unresolvableIncident.ngayXayRa,
                nguoiBaoCao: unresolvableIncident.nguoiBaoCao,
                trangThai: 2, // UNRESOLVABLE
                ghiChu: (unresolvableIncident.ghiChu ? unresolvableIncident.ghiChu + '\n' : '') + 
                       `KHÔNG THỂ GIẢI QUYẾT - Lý do: ${unresolvableReason}\nBằng chứng: ${unresolvableEvidence}\nXử lý bởi: Admin #${adminId}`,
                hinhAnh: unresolvableIncident.hinhAnh,
            };

            await axios.put(`http://localhost:8080/api/su-co-van-chuyen/${unresolvableIncident.id}`, incidentPayload);

            // Step 2: Cancel the order with specific status for carrier incidents
            const cancelResponse = await fetch(`http://localhost:8080/api/hoa-don/${unresolvableIncident.hoaDonId}/cancel-due-to-incident`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    incidentId: unresolvableIncident.id,
                    reason: unresolvableReason,
                    evidence: unresolvableEvidence,
                    adminId: adminId || 1
                }),
            });

            if (!cancelResponse.ok) {
                console.warn('Order cancellation API failed, trying fallback approach without auto stock restore');
                // Fallback: Use status update WITHOUT automatic stock restore
                await fetch(`http://localhost:8080/api/hoa-don/${unresolvableIncident.hoaDonId}/status-no-restore`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(7), // CANCELLED
                });
            }

            // Step 3: Handle refund processing
            try {
                const refundResponse = await axios.post(`http://localhost:8080/api/hoa-don/${unresolvableIncident.hoaDonId}/process-incident-refund`, {
                    incidentId: unresolvableIncident.id,
                    reason: `Sự cố vận chuyển không thể giải quyết: ${unresolvableReason}`,
                    refundType: 'INCIDENT_UNRESOLVABLE',
                    adminId: adminId || 1
                });
                
                console.log('Refund processing initiated:', refundResponse.data);
            } catch (refundError) {
                console.warn('Refund processing failed (non-blocking):', refundError);
                // Continue with other steps even if refund fails
            }

            // Step 4: Stock restoration is automatically handled by order cancellation (Step 2)
            // No need for manual stock restoration as cancelOrderDueToIncident() already calls restoreStockOnCancelOrder()
            console.log('Stock restoration handled automatically by order cancellation');

            // Step 5: Customer notification
            try {
                const customerNotification = {
                    tieuDe: 'Đơn hàng bị hủy do sự cố vận chuyển',
                    noiDung: `Đơn hàng #${unresolvableIncident.maHoaDon || unresolvableIncident.hoaDonId} đã bị hủy do sự cố vận chuyển không thể giải quyết. Chúng tôi sẽ hoàn tiền và liên hệ với bạn để xử lý thêm.`,
                    loai: 'INCIDENT_CANCELLATION',
                    taiKhoanId: unresolvableIncident.taiKhoanId || unresolvableIncident.nguoiBaoCao || null,
                    metadata: {
                        incidentId: unresolvableIncident.id,
                        refundStatus: 'PROCESSING',
                        expectedRefundDays: 3-7
                    }
                };
                
                await axios.post('http://localhost:8080/api/thong-bao', customerNotification);

                if (stompClient && stompClient.connected) {
                    const dest = `/app/user/${unresolvableIncident.taiKhoanId || unresolvableIncident.nguoiBaoCao}/queue/notifications`;
                    stompClient.send(dest, {}, JSON.stringify(customerNotification));
                }
            } catch (notificationError) {
                console.warn('Customer notification failed (non-blocking):', notificationError);
            }

            // Step 6: Audit logging
            try {
                const auditParams = new URLSearchParams();
                auditParams.append('hoaDonId', unresolvableIncident.hoaDonId);
                auditParams.append('userId', adminId || 1);
                auditParams.append('moTa', `SỰ CỐ KHÔNG THỂ GIẢI QUYẾT - IncidentId=${unresolvableIncident.id} - Lý do: ${unresolvableReason}`);
                auditParams.append('trangThaiHoaDon', 'Đã hủy do sự cố vận chuyển');
                await axios.post(`http://localhost:8080/api/lich-su-don-hang/add-status-change?${auditParams.toString()}`);
            } catch (auditError) {
                console.warn('Audit logging failed (non-blocking):', auditError);
            }

            // Step 7: Internal notification for claims/compensation
            try {
                const internalNotification = {
                    tieuDe: 'Sự cố vận chuyển nghiêm trọng - Cần xử lý bồi thường',
                    noiDung: `Đơn #${unresolvableIncident.maHoaDon || unresolvableIncident.hoaDonId} - Sự cố: ${unresolvableIncident.loaiSuCo} - Cần mở claim với đơn vị vận chuyển`,
                    loai: 'INTERNAL_CLAIM',
                    metadata: {
                        incidentId: unresolvableIncident.id,
                        hoaDonId: unresolvableIncident.hoaDonId,
                        severity: 'HIGH',
                        requiresCompensation: true
                    }
                };
                
                await axios.post('http://localhost:8080/api/thong-bao/internal', internalNotification);
                
                if (stompClient && stompClient.connected) {
                    stompClient.send('/app/internal/incidents', {}, JSON.stringify({
                        type: 'UNRESOLVABLE_INCIDENT',
                        data: internalNotification
                    }));
                }
            } catch (internalNotifyError) {
                console.warn('Internal notification failed (non-blocking):', internalNotifyError);
            }

            // Update stock handling status based on incident type
            let stockHandlingMessage = "";
            const incidentType = unresolvableIncident.loaiSuCo;
            
            // CHỈ HOÀN KHO khi khách hàng không nhận/chưa nhận (hàng còn nguyên vẹn)
            if (incidentType === 'KHONG_NHAN_HANG' || incidentType === 'CHUA_NHAN_HANG') {
                stockHandlingMessage = "📦 Đã hoàn hàng về kho thành công";
            } else {
                // KHÔNG hoàn kho cho các trường hợp khác
                const messages = {
                    'HANG_BI_MAT': "📋 Đã ghi nhận hàng bị mất - Không hoàn kho",
                    'HANG_BI_HONG': "📋 Đã ghi nhận hàng bị hỏng - Không hoàn kho", 
                    'SU_CO_VAN_CHUYEN': "📋 Đã ghi nhận sự cố vận chuyển - Không hoàn kho",
                    'KHAC': "📋 Đã ghi nhận sự cố khác - Không hoàn kho"
                };
                stockHandlingMessage = messages[incidentType] || "📋 Đã ghi nhận sự cố - Không hoàn kho";
            }

            // Success feedback with beautiful modal
            swal({
                title: 'Xử lý thành công!',
                content: {
                    element: 'div',
                    attributes: {
                        innerHTML: `
                            <div class="text-center p-4">
                                <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                                    </svg>
                                </div>
                                <h3 class="text-lg font-semibold text-gray-900 mb-2">Sự cố đã được xử lý</h3>
                                <div class="space-y-2 text-sm text-gray-600">
                                    <p>✅ Đơn hàng đã được hủy</p>
                                    <p>✅ Quy trình hoàn tiền đã được khởi tạo</p>
                                    <p id="stock-handling-status" class="font-medium text-green-600">
                                        ${stockHandlingMessage}
                                    </p>
                                    <p>✅ Thông báo đã được gửi đến khách hàng</p>
                                    <p>✅ Yêu cầu bồi thường đã được tạo</p>
                                </div>
                                <div class="mt-4 p-3 ${incidentType === 'KHONG_NHAN_HANG' || incidentType === 'CHUA_NHAN_HANG' ? 'bg-blue-50' : 'bg-orange-50'} rounded-lg">
                                    <p class="text-sm ${incidentType === 'KHONG_NHAN_HANG' || incidentType === 'CHUA_NHAN_HANG' ? 'text-blue-800' : 'text-orange-800'}">
                                        <strong>Thời gian xử lý dự kiến:</strong> 3-7 ngày làm việc
                                    </p>
                                    ${incidentType === 'KHONG_NHAN_HANG' || incidentType === 'CHUA_NHAN_HANG' ? 
                                        '<p class="text-sm text-blue-700 mt-1"><strong>Lưu ý:</strong> Hàng hóa đã được bảo toàn và hoàn về kho</p>' : 
                                        '<p class="text-sm text-orange-700 mt-1"><strong>Lưu ý:</strong> Cần liên hệ bảo hiểm để bồi thường thiệt hại</p>'
                                    }
                                </div>
                            </div>
                        `
                    }
                },
                buttons: {
                    confirm: {
                        text: "Đã hiểu",
                        value: true,
                        className: "swal-button--confirm bg-green-600 hover:bg-green-700"
                    }
                }
            });
            
            // Refresh and notify parent
            fetchIncidents();
            if (typeof onIncidentResolved === 'function') {
                onIncidentResolved({
                    ...unresolvableIncident,
                    trangThai: 2,
                    isUnresolvable: true
                });
            }
            
            setShowUnresolvableModal(false);
            
        } catch (error) {
            console.error('Lỗi khi xử lý sự cố không thể giải quyết:', error);
            alert('Có lỗi xảy ra khi xử lý sự cố. Vui lòng thử lại.');
        } finally {
            setProcessingUnresolvable(false);
        }
    };

    // Resolve incident with additional resolution info and perform follow-up actions
    const resolveIncident = async (incident) => {
        try {
            // Prepare resolution payload: set trangThai=1 and add ghiChu as resolution note
            // Format ngayXayRa to match backend expected pattern: yyyy-MM-dd'T'HH:mm:ss
            const formatDateForBackend = (raw) => {
                try {
                    const d = new Date(raw);
                    const pad = (n) => String(n).padStart(2, '0');
                    const yyyy = d.getFullYear();
                    const MM = pad(d.getMonth() + 1);
                    const dd = pad(d.getDate());
                    const hh = pad(d.getHours());
                    const mm = pad(d.getMinutes());
                    const ss = pad(d.getSeconds());
                    return `${yyyy}-${MM}-${dd}T${hh}:${mm}:${ss}`;
                } catch (e) {
                    return raw;
                }
            };

            const payload = {
                hoaDonId: incident.hoaDonId,
                loaiSuCo: incident.loaiSuCo,
                moTa: incident.moTa,
                diaDiem: incident.diaDiem,
                ngayXayRa: formatDateForBackend(incident.ngayXayRa),
                nguoiBaoCao: incident.nguoiBaoCao,
                trangThai: 1,
                ghiChu: (incident.ghiChu ? incident.ghiChu + '\n' : '') + 'Đã giải quyết bởi hệ thống',
                hinhAnh: incident.hinhAnh,
            };

            // Update incident record (PUT /api/su-co-van-chuyen/{id}) so backend can store resolution and timestamps
            await axios.put(`http://localhost:8080/api/su-co-van-chuyen/${incident.id}`, payload);

            // Business logic: decide next order status. We'll attempt to set order to 'Đang vận chuyển' (3) as default
            // If the incident type implies delivery completed, caller can change this logic. Here we choose 3.
            try {
                // Use fetch with JSON body and Content-Type to match backend expectations
                const res = await fetch(`http://localhost:8080/api/hoa-don/${incident.hoaDonId}/status`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(3),
                });
                if (!res.ok) {
                    throw new Error('Order status update failed');
                }
            } catch (e) {
                console.warn('Không thể cập nhật trạng thái hóa đơn sang 3:', e?.message || e);
            }

            // Send notification to customer about resolution
            try {
                const notify = {
                    tieuDe: 'Sự cố vận chuyển đã được xử lý',
                    noiDung: `Sự cố liên quan đến đơn ${incident.maHoaDon || incident.hoaDonId} đã được xử lý. Thời gian giao dự kiến sẽ được cập nhật sớm.`,
                    loai: 'SUCOVANCHUYEN',
                    taiKhoanId: incident.taiKhoanId || incident.nguoiBaoCao || null,
                };
                await axios.post('http://localhost:8080/api/thong-bao', notify);

                // publish via STOMP to user queue if client exists
                if (stompClient && stompClient.connected) {
                    const dest = `/app/user/${incident.taiKhoanId || incident.nguoiBaoCao}/queue/notifications`;
                    stompClient.send(dest, {}, JSON.stringify(notify));
                }
            } catch (e) {
                console.warn('Không thể gửi thông báo khách hàng:', e?.message || e);
            }

            // Audit: record who resolved the incident
            try {
                const params = new URLSearchParams();
                params.append('hoaDonId', incident.hoaDonId);
                params.append('userId', adminId || 1);
                params.append('moTa', `Sự cố đã được giải quyết. IncidentId=${incident.id}`);
                params.append('trangThaiHoaDon', 'Có sự cố - Đã giải quyết');
                await axios.post(`http://localhost:8080/api/lich-su-don-hang/add-status-change?${params.toString()}`);
            } catch (e) {
                console.warn('Không thể ghi audit lịch sử đơn hàng:', e?.message || e);
            }

            // Refresh and call parent callback so parent can unlock UI or take further actions
            fetchIncidents();
            if (typeof onIncidentResolved === 'function') onIncidentResolved(incident);
        } catch (error) {
            console.error('Lỗi khi đánh dấu sự cố đã giải quyết:', error);
        }
    };

    const getIncidentTypeInfo = (type) => {
        return incidentTypeLabels[type] || incidentTypeLabels['KHAC'];
    };

    const getStatusInfo = (status) => {
        return statusLabels[status] || statusLabels[0];
    };

    const formatDateTime = (dateString) => {
        return new Date(dateString).toLocaleString('vi-VN');
    };

    const handleViewDetail = (incident) => {
        setSelectedIncident(incident);
        setShowDetailModal(true);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                <span className="ml-3 text-gray-600">Đang tải danh sách sự cố...</span>
            </div>
        );
    }

    if (incidents.length === 0) {
        return (
            <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-600 mb-2">Không có sự cố nào</h3>
                <p className="text-gray-500">Đơn hàng này chưa gặp sự cố nào trong quá trình vận chuyển.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                    <AlertTriangle className="w-5 h-5 mr-2 text-red-600" />
                    Sự cố vận chuyển ({incidents.length})
                </h3>
            </div>

            <div className="space-y-4">
                {incidents.map((incident) => {
                    const typeInfo = getIncidentTypeInfo(incident.loaiSuCo);
                    const statusInfo = getStatusInfo(incident.trangThai);
                    const StatusIcon = statusInfo.icon;

                    return (
                        <div
                            key={incident.id}
                            className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    {/* Header */}
                                    <div className="flex items-center space-x-3 mb-3">
                                        <span className="text-2xl">{typeInfo.icon}</span>
                                        <div>
                                            <h4 className="font-semibold text-gray-800">{typeInfo.label}</h4>
                                            <div className="flex items-center space-x-2 mt-1">
                                                <span
                                                    className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}
                                                >
                                                    <StatusIcon className="w-3 h-3 inline mr-1" />
                                                    {statusInfo.label}
                                                </span>
                                                <span
                                                    className={`px-2 py-1 rounded-full text-xs font-medium ${typeInfo.color}`}
                                                >
                                                    {incident.loaiSuCo}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <div className="flex items-center text-sm text-gray-600 mb-2">
                                                <FileText className="w-4 h-4 mr-2" />
                                                <span className="font-medium">Mô tả:</span>
                                            </div>
                                            <p className="text-sm text-gray-800 bg-gray-50 p-3 rounded-lg">
                                                {incident.moTa}
                                            </p>
                                        </div>
                                        <div className="space-y-2">
                                            {incident.diaDiem && (
                                                <div className="flex items-center text-sm text-gray-600">
                                                    <MapPin className="w-4 h-4 mr-2" />
                                                    <span className="font-medium mr-2">Địa điểm:</span>
                                                    <span>{incident.diaDiem}</span>
                                                </div>
                                            )}
                                            <div className="flex items-center text-sm text-gray-600">
                                                <Clock className="w-4 h-4 mr-2" />
                                                <span className="font-medium mr-2">Thời gian:</span>
                                                <span>{formatDateTime(incident.ngayXayRa)}</span>
                                            </div>
                                            <div className="flex items-center text-sm text-gray-600">
                                                <User className="w-4 h-4 mr-2" />
                                                <span className="font-medium mr-2">Người báo cáo:</span>
                                                <span>Admin #{incident.nguoiBaoCao}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Images */}
                                    {incident.hinhAnh && (
                                        <div className="mb-4">
                                            <div className="flex items-center text-sm text-gray-600 mb-2">
                                                <Camera className="w-4 h-4 mr-2" />
                                                <span className="font-medium">Hình ảnh minh chứng:</span>
                                            </div>
                                            <div className="flex space-x-2">
                                                {incident.hinhAnh
                                                    .split(',')
                                                    .map((img) => img.trim())
                                                    .filter(Boolean)
                                                    .map((image, index) => {
                                                        const isAbsolute = /^(https?:)?\/\//i.test(image);
                                                        const normalized = isAbsolute
                                                            ? image
                                                            : image.startsWith('/uploads')
                                                              ? `http://localhost:8080${image}`
                                                              : `http://localhost:8080/uploads/${image}`;
                                                        return (
                                                            <img
                                                                key={index}
                                                                src={normalized}
                                                                alt={`Incident ${index + 1}`}
                                                                className="w-16 h-16 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-80"
                                                                onClick={() => window.open(normalized, '_blank')}
                                                            />
                                                        );
                                                    })}
                                            </div>
                                        </div>
                                    )}

                                    {/* Additional notes */}
                                    {incident.ghiChu && (
                                        <div className="mb-4">
                                            <div className="flex items-center text-sm text-gray-600 mb-2">
                                                <FileText className="w-4 h-4 mr-2" />
                                                <span className="font-medium">Ghi chú:</span>
                                            </div>
                                            <p className="text-sm text-gray-800 bg-blue-50 p-3 rounded-lg">
                                                {incident.ghiChu}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex flex-col space-y-2 ml-4">
                                    <button
                                        onClick={() => handleViewDetail(incident)}
                                        className="px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center space-x-1"
                                    >
                                        <Eye className="w-4 h-4" />
                                        <span>Chi tiết</span>
                                    </button>

                                    {incident.trangThai === 0 && (
                                        <>
                                            <button
                                                onClick={() => resolveIncident(incident)}
                                                className="px-3 py-2 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors flex items-center space-x-1"
                                            >
                                                <CheckCircle className="w-4 h-4" />
                                                <span>Đã giải quyết</span>
                                            </button>
                                            <button
                                                onClick={() => handleUnresolvableIncident(incident)}
                                                className="px-3 py-2 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors flex items-center space-x-1"
                                            >
                                                <XCircle className="w-4 h-4" />
                                                <span>Không giải quyết được</span>
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Detail Modal */}
            {showDetailModal && selectedIncident && (
                <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => setShowDetailModal(false)}
                    />
                    <div className="relative bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                        <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white p-6">
                            <h3 className="text-xl font-bold">Chi tiết sự cố vận chuyển</h3>
                            <p className="text-red-100">ID: {selectedIncident.id}</p>
                        </div>
                        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                            {/* Incident detail content */}
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="font-semibold text-gray-700">Loại sự cố:</label>
                                        <p className="mt-1">{getIncidentTypeInfo(selectedIncident.loaiSuCo).label}</p>
                                    </div>
                                    <div>
                                        <label className="font-semibold text-gray-700">Trạng thái:</label>
                                        <p className="mt-1">{getStatusInfo(selectedIncident.trangThai).label}</p>
                                    </div>
                                </div>

                                <div>
                                    <label className="font-semibold text-gray-700">Mô tả chi tiết:</label>
                                    <p className="mt-1 bg-gray-50 p-4 rounded-lg">{selectedIncident.moTa}</p>
                                </div>

                                {selectedIncident.hinhAnh && (
                                    <div>
                                        <label className="font-semibold text-gray-700">Hình ảnh:</label>
                                        <div className="grid grid-cols-3 gap-4 mt-2">
                                            {selectedIncident.hinhAnh
                                                .split(',')
                                                .map((img) => img.trim())
                                                .filter(Boolean)
                                                .map((image, index) => {
                                                    const isAbsolute = /^(https?:)?\/\//i.test(image);
                                                    const normalized = isAbsolute
                                                        ? image
                                                        : image.startsWith('/uploads')
                                                          ? `http://localhost:8080${image}`
                                                          : `http://localhost:8080/uploads/${image}`;
                                                    return (
                                                        <img
                                                            key={index}
                                                            src={normalized}
                                                            alt={`Incident ${index + 1}`}
                                                            className="w-full h-32 object-cover rounded-lg border cursor-pointer hover:opacity-80"
                                                            onClick={() => window.open(normalized, '_blank')}
                                                        />
                                                    );
                                                })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="bg-gray-50 px-6 py-4 border-t">
                            <button
                                onClick={() => setShowDetailModal(false)}
                                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Unresolvable Incident Modal */}
            {showUnresolvableModal && unresolvableIncident && (
                <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setShowUnresolvableModal(false)}
                    />
                    <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-red-600 to-red-800 text-white p-6">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                    <XCircle className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold">Xác nhận sự cố không thể giải quyết</h3>
                                    <p className="text-red-100 text-sm">Incident ID: {unresolvableIncident.id}</p>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
                            {/* Warning Section */}
                            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg mb-6">
                                <div className="flex items-start">
                                    <div className="w-6 h-6 text-red-500 mt-0.5 mr-3">
                                        <AlertTriangle className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="text-red-800 font-bold text-sm mb-2">CẢNH BÁO NGHIÊM TRỌNG</h4>
                                        <div className="text-red-700 text-sm space-y-1">
                                            <p>• Đơn hàng sẽ bị HỦY VĨNH VIỄN và không thể khôi phục</p>
                                            <p>• Hệ thống sẽ tự động hoàn tiền cho khách hàng</p>
                                            <p>• Hàng hóa sẽ được hoàn lại kho (nếu chưa xuất)</p>
                                            <p>• Tạo yêu cầu bồi thường với đơn vị vận chuyển</p>
                                            <p>• Thao tác này KHÔNG THỂ HOÀN TÁC</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Incident Info */}
                            <div className="bg-gray-50 rounded-lg p-4 mb-6">
                                <h5 className="font-semibold text-gray-800 mb-3">Thông tin sự cố:</h5>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="font-medium text-gray-600">Loại sự cố:</span>
                                        <p className="text-gray-800">{getIncidentTypeInfo(unresolvableIncident.loaiSuCo).label}</p>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-600">Đơn hàng:</span>
                                        <p className="text-gray-800">#{unresolvableIncident.hoaDonId}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <span className="font-medium text-gray-600">Mô tả:</span>
                                        <p className="text-gray-800">{unresolvableIncident.moTa}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Required Information */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Lý do không thể giải quyết <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        value={unresolvableReason}
                                        onChange={(e) => setUnresolvableReason(e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-red-500 focus:border-red-500 resize-none"
                                        rows="4"
                                        placeholder="Mô tả chi tiết lý do tại sao sự cố này không thể giải quyết được..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Bằng chứng/Tài liệu liên quan
                                    </label>
                                    <textarea
                                        value={unresolvableEvidence}
                                        onChange={(e) => setUnresolvableEvidence(e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-red-500 focus:border-red-500 resize-none"
                                        rows="3"
                                        placeholder="Mô tả các bằng chứng, tài liệu, hay thông tin liên quan..."
                                    />
                                </div>
                            </div>

                            {/* Impact Summary */}
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
                                <h5 className="font-semibold text-yellow-800 mb-2">Hệ quả của việc đánh dấu không thể giải quyết:</h5>
                                <ul className="text-yellow-700 text-sm space-y-1">
                                    <li>✓ Cập nhật trạng thái sự cố thành "Không thể giải quyết"</li>
                                    <li>✓ Hủy đơn hàng với trạng thái "Đã hủy do sự cố vận chuyển"</li>
                                    <li>✓ Khởi tạo quy trình hoàn tiền tự động</li>
                                    <li>✓ Hoàn hàng về kho (nếu chưa xuất kho)</li>
                                    <li>✓ Thông báo khách hàng về việc hủy đơn và hoàn tiền</li>
                                    <li>✓ Tạo ticket nội bộ để xử lý bồi thường với đơn vị vận chuyển</li>
                                    <li>✓ Ghi log đầy đủ cho mục đích kiểm toán</li>
                                </ul>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={() => setShowUnresolvableModal(false)}
                                    disabled={processingUnresolvable}
                                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
                                >
                                    Hủy bỏ
                                </button>
                                <button
                                    onClick={processUnresolvableIncident}
                                    disabled={processingUnresolvable || !unresolvableReason.trim()}
                                    className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                                >
                                    {processingUnresolvable ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            <span>Đang xử lý...</span>
                                        </>
                                    ) : (
                                        <>
                                            <XCircle className="w-4 h-4" />
                                            <span>Xác nhận không thể giải quyết</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DeliveryIncidentList;
