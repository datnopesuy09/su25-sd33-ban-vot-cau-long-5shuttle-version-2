import React, { useState } from 'react';
import { X, AlertTriangle, Camera, FileText, Clock, MapPin, Truck } from 'lucide-react';
import axios from 'axios';
import swal from 'sweetalert';

const DeliveryIncidentModal = ({ isOpen, onClose, orderData, hoaDonId, onIncidentReported, stompClient }) => {
    const [incidentData, setIncidentData] = useState({
        loaiSuCo: '',
        moTa: '',
        diaDiem: '',
        ngayXayRa: new Date().toISOString().slice(0, 16),
        trangThai: 0, // 0: Đang xử lý, 1: Đã giải quyết
        ghiChu: '',
        hinhAnh: [],
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);

    const incidentTypes = [
        {
            value: 'KHONG_NHAN_HANG',
            label: 'Khách hàng không nhận hàng',
            icon: '👤',
            color: 'bg-yellow-100 text-yellow-800',
        },
        { value: 'CHUA_NHAN_HANG', label: 'Khách hàng chưa nhận hàng', icon: '⏰', color: 'bg-blue-100 text-blue-800' },
        { value: 'HANG_BI_MAT', label: 'Hàng bị mất/thất lạc', icon: '📦', color: 'bg-red-100 text-red-800' },
        { value: 'HANG_BI_HONG', label: 'Hàng bị hỏng/vỡ', icon: '💔', color: 'bg-orange-100 text-orange-800' },
        {
            value: 'SU_CO_VAN_CHUYEN',
            label: 'Sự cố vận chuyển khác',
            icon: '🚛',
            color: 'bg-purple-100 text-purple-800',
        },
        { value: 'KHAC', label: 'Sự cố khác', icon: '⚠️', color: 'bg-gray-100 text-gray-800' },
    ];

    const handleInputChange = (field, value) => {
        setIncidentData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length + selectedFiles.length > 5) {
            swal('Cảnh báo', 'Chỉ được tải lên tối đa 5 ảnh', 'warning');
            return;
        }
        setSelectedFiles((prev) => [...prev, ...files]);
    };

    const removeFile = (index) => {
        setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const uploadImages = async () => {
        if (selectedFiles.length === 0) return [];

        const formData = new FormData();
        // Backend expects param name 'images' (see FileUploadController)
        selectedFiles.forEach((file) => {
            formData.append('images', file);
        });

        try {
            // Backend POST endpoint is /api/upload (no /multiple)
            const response = await axios.post('http://localhost:8080/api/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            const urls = response.data?.urls || [];
            return urls; // array of image URLs
        } catch (error) {
            console.error('Lỗi khi tải ảnh:', error);
            throw new Error('Không thể tải ảnh lên');
        }
    };

    // Safe STOMP send helper for this component
    const safeStompSendLocal = (destination, headers = {}, body = '') => {
        try {
            if (!stompClient) return false;
            const isConnected = !!stompClient.connected || (stompClient.ws && stompClient.ws.readyState === 1);
            if (isConnected && typeof stompClient.send === 'function') {
                stompClient.send(destination, headers, body);
                return true;
            }
            console.warn('DeliveryIncidentModal: STOMP not connected, skipping send to', destination);
            return false;
        } catch (err) {
            console.warn('DeliveryIncidentModal: error sending STOMP message', err);
            return false;
        }
    };

    const handleSubmit = async () => {
        if (!incidentData.loaiSuCo || !incidentData.moTa) {
            swal('Lỗi', 'Vui lòng điền đầy đủ thông tin bắt buộc', 'error');
            return;
        }

        setIsSubmitting(true);

        try {
            // Upload images first
            const imageUrls = await uploadImages();

            // Chuẩn hóa định dạng ngày (datetime-local trả về yyyy-MM-ddTHH:mm)
            let ngayXayRa = incidentData.ngayXayRa;
            // Backend hiện dùng pattern yyyy-MM-dd'T'HH:mm nên KHÔNG thêm giây vào (tránh 400)
            // Nếu muốn hỗ trợ giây, đổi pattern trong backend thành yyyy-MM-dd'T'HH:mm:ss và thêm :00 tại đây.

            // Map loại sự cố sang enum backend (đã dùng chính value trùng enum nên chỉ cần toUpperCase safeguard)
            const enumLoaiSuCo = (incidentData.loaiSuCo || '').toUpperCase();

            // Create incident report
            const incidentReport = {
                hoaDonId: hoaDonId,
                loaiSuCo: enumLoaiSuCo,
                moTa: incidentData.moTa.trim(),
                diaDiem: incidentData.diaDiem?.trim() || null,
                ngayXayRa: ngayXayRa,
                trangThai: incidentData.trangThai,
                ghiChu: incidentData.ghiChu?.trim() || null,
                hinhAnh: imageUrls.join(','), // Store as comma-separated string
                nguoiBaoCao: JSON.parse(localStorage.getItem('admin'))?.id || 1,
            };

            console.log('[DeliveryIncident] Payload gửi lên:', incidentReport);

            const response = await axios.post('http://localhost:8080/api/su-co-van-chuyen', incidentReport, {
                headers: {
                    'Content-Type': 'application/json',
                },
                validateStatus: () => true, // luôn nhận response để tự xử lý
            });

            console.log('[DeliveryIncident] Response:', response.status, response.data, response.headers);

            if ((response.status === 200 || response.status === 201) && response.data?.result) {
                // Send notification to customer
                const userNotification = {
                    khachHang: {
                        id: orderData.taiKhoan.id,
                    },
                    tieuDe: 'Thông báo sự cố vận chuyển',
                    noiDung: `Đơn hàng #${orderData.ma} đã gặp sự cố trong quá trình vận chuyển. Chúng tôi đang xử lý và sẽ liên hệ với bạn sớm nhất.`,
                    idRedirect: `/user/hoa-don/${hoaDonId}`,
                    kieuThongBao: 'warning',
                    trangThai: 0,
                };

                try {
                    await axios.post('http://localhost:8080/api/thong-bao', userNotification, {
                        headers: { 'Content-Type': 'application/json' },
                    });

                    safeStompSendLocal(`/app/user/${orderData.taiKhoan.id}/notifications`, {}, JSON.stringify(userNotification));
                } catch (notificationError) {
                    console.error('Lỗi khi gửi thông báo:', notificationError);
                }

                swal('Thành công', 'Đã ghi nhận sự cố vận chuyển thành công', 'success');
                onIncidentReported && onIncidentReported(response.data.result);
                onClose();
            } else {
                const msg = response.data?.message || response.headers['x-error-message'] || 'Tạo sự cố thất bại';
                throw new Error(msg);
            }
        } catch (error) {
            console.error('Lỗi khi ghi nhận sự cố (detail):', {
                message: error.message,
                response: error.response,
                stack: error.stack,
            });
            const backendMsg =
                error.message || error.response?.data?.message || error.response?.data || 'Không thể ghi nhận sự cố';
            swal('Lỗi', backendMsg, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white p-6 rounded-t-2xl">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="bg-white/20 p-2 rounded-lg">
                                <AlertTriangle className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">Ghi nhận sự cố vận chuyển</h2>
                                <p className="text-red-100 text-sm">Đơn hàng #{orderData.ma}</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/20 rounded-lg transition-colors duration-200"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="overflow-y-auto max-h-[calc(90vh-140px)] p-6">
                    <div className="space-y-6">
                        {/* Loại sự cố */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                                <AlertTriangle className="w-4 h-4 inline mr-2" />
                                Loại sự cố <span className="text-red-500">*</span>
                            </label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {incidentTypes.map((type) => (
                                    <button
                                        key={type.value}
                                        type="button"
                                        onClick={() => handleInputChange('loaiSuCo', type.value)}
                                        className={`p-4 border-2 rounded-lg text-left transition-all duration-200 ${
                                            incidentData.loaiSuCo === type.value
                                                ? 'border-red-500 bg-red-50'
                                                : 'border-gray-200 hover:border-red-300 hover:bg-gray-50'
                                        }`}
                                    >
                                        <div className="flex items-center space-x-3">
                                            <span className="text-2xl">{type.icon}</span>
                                            <div>
                                                <div className="font-medium text-gray-800">{type.label}</div>
                                                <div
                                                    className={`text-xs px-2 py-1 rounded-full inline-block mt-1 ${type.color}`}
                                                >
                                                    {type.value}
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Mô tả sự cố */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                <FileText className="w-4 h-4 inline mr-2" />
                                Mô tả chi tiết sự cố <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={incidentData.moTa}
                                onChange={(e) => handleInputChange('moTa', e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
                                rows="4"
                                placeholder="Mô tả chi tiết về sự cố đã xảy ra..."
                            />
                        </div>

                        {/* Địa điểm và thời gian */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    <MapPin className="w-4 h-4 inline mr-2" />
                                    Địa điểm xảy ra sự cố
                                </label>
                                <input
                                    type="text"
                                    value={incidentData.diaDiem}
                                    onChange={(e) => handleInputChange('diaDiem', e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                    placeholder="Nhập địa điểm..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    <Clock className="w-4 h-4 inline mr-2" />
                                    Thời gian xảy ra
                                </label>
                                <input
                                    type="datetime-local"
                                    value={incidentData.ngayXayRa}
                                    onChange={(e) => handleInputChange('ngayXayRa', e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                />
                            </div>
                        </div>

                        {/* Ghi chú thêm */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                <FileText className="w-4 h-4 inline mr-2" />
                                Ghi chú thêm
                            </label>
                            <textarea
                                value={incidentData.ghiChu}
                                onChange={(e) => handleInputChange('ghiChu', e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
                                rows="3"
                                placeholder="Thông tin bổ sung khác..."
                            />
                        </div>

                        {/* Upload ảnh */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                <Camera className="w-4 h-4 inline mr-2" />
                                Hình ảnh minh chứng (tối đa 5 ảnh)
                            </label>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-red-400 transition-colors">
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="hidden"
                                    id="incident-images"
                                />
                                <label htmlFor="incident-images" className="cursor-pointer">
                                    <Camera className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                                    <p className="text-sm text-gray-600">Click để chọn ảnh hoặc kéo thả ảnh vào đây</p>
                                </label>
                            </div>

                            {/* Preview selected images */}
                            {selectedFiles.length > 0 && (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                                    {selectedFiles.map((file, index) => (
                                        <div key={index} className="relative">
                                            <img
                                                src={URL.createObjectURL(file)}
                                                alt={`Preview ${index + 1}`}
                                                className="w-full h-24 object-cover rounded-lg border border-gray-200"
                                            />
                                            <button
                                                onClick={() => removeFile(index)}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-6 py-4 rounded-b-2xl border-t border-gray-200">
                    <div className="flex justify-end space-x-3">
                        <button
                            onClick={onClose}
                            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            disabled={isSubmitting}
                        >
                            Hủy
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting || !incidentData.loaiSuCo || !incidentData.moTa}
                            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    <span>Đang xử lý...</span>
                                </>
                            ) : (
                                <>
                                    <AlertTriangle className="w-4 h-4" />
                                    <span>Ghi nhận sự cố</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeliveryIncidentModal;
