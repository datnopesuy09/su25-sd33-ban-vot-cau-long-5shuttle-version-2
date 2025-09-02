import React, { useState, useEffect, useCallback } from 'react';
import { AlertTriangle, MapPin, Clock, User, FileText, Camera, CheckCircle, XCircle, Eye } from 'lucide-react';
import axios from 'axios';

const DeliveryIncidentList = ({ hoaDonId, refreshTrigger }) => {
    const [incidents, setIncidents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedIncident, setSelectedIncident] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

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
        2: { label: 'Không thể giải quyết', color: 'bg-red-100 text-red-800', icon: XCircle },
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
                                                onClick={() => updateIncidentStatus(incident.id, 1)}
                                                className="px-3 py-2 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors flex items-center space-x-1"
                                            >
                                                <CheckCircle className="w-4 h-4" />
                                                <span>Đã giải quyết</span>
                                            </button>
                                            <button
                                                onClick={() => updateIncidentStatus(incident.id, 2)}
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
        </div>
    );
};

export default DeliveryIncidentList;
