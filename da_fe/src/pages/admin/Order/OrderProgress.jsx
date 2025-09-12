import React, { useState } from 'react';

// CSS animation cho fadeIn effect và các animations cho trạng thái đã hủy
const fadeInStyles = `
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
    }
    .animate-fadeIn {
        animation: fadeIn 0.3s ease-out;
    }
    
    @keyframes cancelShake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-2px); }
        75% { transform: translateX(2px); }
    }
    .animate-cancelShake {
        animation: cancelShake 0.5s ease-in-out;
    }
    
    @keyframes cancelGlow {
        0%, 100% { box-shadow: 0 0 20px rgba(239, 68, 68, 0.4); }
        50% { box-shadow: 0 0 30px rgba(239, 68, 68, 0.7); }
    }
    .animate-cancelGlow {
        animation: cancelGlow 2s ease-in-out infinite;
    }
`;

// Thêm styles vào head nếu chưa có
if (typeof document !== 'undefined' && !document.getElementById('fadeIn-styles')) {
    const style = document.createElement('style');
    style.id = 'fadeIn-styles';
    style.textContent = fadeInStyles;
    document.head.appendChild(style);
}

const OrderProgress = ({
    currentOrderStatus,
    setCurrentOrderStatus,
    timeline,
    getStatusInfo,
    progressPercentage,
    shouldShowActionButton,
    handleActionButtonClick,
    getActionButtonStyle,
    getActionButtonText,
    handleCancelOrder,
    handleShowHistoryModal,
    handleRevertStatus,
    canRevertStatus,
}) => {
    // State cho modal confirm thay đổi trạng thái
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [note, setNote] = useState('');
    const [pendingStatus, setPendingStatus] = useState(null);

    // State cho modal confirm hủy đơn
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelReason, setCancelReason] = useState('');
    const [selectedCancelReason, setSelectedCancelReason] = useState('');

    // Danh sách lý do hủy đơn phổ biến
    const cancelReasons = [
        'Khách hàng yêu cầu hủy',
        'Hết hàng trong kho',
        'Thông tin đơn hàng không chính xác',
        'Khách hàng không phản hồi',
        'Vấn đề về thanh toán',
        'Lý do khác',
    ];

    // Xử lý mở modal confirm thay đổi trạng thái
    const handlePrepareStatusChange = (newStatus) => {
        setPendingStatus(newStatus);
        setShowConfirmModal(true);
    };

    // Xử lý khi nhấn Lưu trong modal confirm thay đổi trạng thái
    const handleConfirmStatusChange = () => {
        setShowConfirmModal(false);
        handleActionButtonClick(pendingStatus, note); // Truyền note vào hàm xử lý
        setNote(''); // Reset note sau khi lưu
    };

    // Xử lý đóng modal confirm thay đổi trạng thái
    const handleCancelStatusChange = () => {
        setShowConfirmModal(false);
        setNote('');
    };

    // Xử lý mở modal hủy đơn
    const handlePrepareCancelOrder = () => {
        setShowCancelModal(true);
        setCancelReason('');
        setSelectedCancelReason('');
    };

    // Xử lý xác nhận hủy đơn
    const handleConfirmCancelOrder = () => {
        const finalReason = selectedCancelReason === 'Lý do khác' ? cancelReason : selectedCancelReason;

        if (!finalReason.trim()) {
            alert('Vui lòng chọn hoặc nhập lý do hủy đơn');
            return;
        }

        setShowCancelModal(false);
        handleCancelOrder(finalReason); // Truyền lý do hủy vào hàm xử lý
        setCancelReason('');
        setSelectedCancelReason('');
    };

    // Xử lý đóng modal hủy đơn
    const handleCloseCancelModal = () => {
        setShowCancelModal(false);
        setCancelReason('');
        setSelectedCancelReason('');
    };

    return (
        <div>
            {/* Modal confirm thay đổi trạng thái */}
            {showConfirmModal && (
                <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                    {/* Backdrop với hiệu ứng blur */}
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
                        onClick={handleCancelStatusChange}
                    />

                    {/* Modal Container */}
                    <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-auto transform transition-all duration-300">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl">
                            <h3 className="text-lg font-bold">Xác nhận thay đổi trạng thái</h3>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-4">
                            <p className="text-gray-600 mb-2">Bạn có chắc chắn muốn thay đổi trạng thái thành:</p>
                            <div className="font-semibold text-blue-600">{getStatusInfo(pendingStatus).label}</div>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-medium mb-2">Ghi chú</label>
                                <textarea
                                    className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                                    rows="3"
                                    placeholder="Nhập ghi chú (nếu có)"
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex justify-end space-x-3 p-6 bg-gray-50 rounded-b-2xl">
                            <button
                                onClick={handleCancelStatusChange}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Đóng
                            </button>
                            <button
                                onClick={handleConfirmStatusChange}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Lưu thay đổi
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal confirm hủy đơn hàng */}
            {showCancelModal && (
                <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                    {/* Backdrop với hiệu ứng blur */}
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
                        onClick={handleCloseCancelModal}
                    />

                    {/* Modal Container */}
                    <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-auto transform transition-all duration-300">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6 rounded-t-2xl">
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path
                                            fillRule="evenodd"
                                            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold">Xác nhận hủy đơn hàng</h3>
                            </div>
                            <p className="text-red-100 mt-2 text-sm">
                                Thao tác này không thể hoàn tác. Vui lòng cân nhắc kỹ trước khi thực hiện.
                            </p>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-6">
                            {/* Cảnh báo */}
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <div className="flex items-start space-x-3">
                                    <div className="w-6 h-6 text-red-600 mt-0.5">
                                        <svg fill="currentColor" viewBox="0 0 20 20">
                                            <path
                                                fillRule="evenodd"
                                                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    </div>
                                    <div>
                                        <h4 className="text-red-800 font-semibold text-sm">Cảnh báo quan trọng</h4>
                                        <p className="text-red-700 text-sm mt-1">
                                            Hủy đơn hàng sẽ hoàn lại số lượng sản phẩm vào kho và thông báo cho khách
                                            hàng. Đảm bảo bạn đã liên hệ với khách hàng trước khi thực hiện.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Chọn lý do hủy */}
                            <div>
                                <label className="block text-gray-700 text-sm font-semibold mb-3">
                                    Lý do hủy đơn hàng <span className="text-red-500">*</span>
                                </label>
                                <div className="space-y-2">
                                    {cancelReasons.map((reason, index) => (
                                        <label key={index} className="flex items-start space-x-3 cursor-pointer group">
                                            <input
                                                type="radio"
                                                name="cancelReason"
                                                value={reason}
                                                checked={selectedCancelReason === reason}
                                                onChange={(e) => setSelectedCancelReason(e.target.value)}
                                                className="mt-1 w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500"
                                            />
                                            <span className="text-gray-700 text-sm group-hover:text-gray-900 transition-colors">
                                                {reason}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Textarea cho lý do khác */}
                            {selectedCancelReason === 'Lý do khác' && (
                                <div className="animate-fadeIn">
                                    <label className="block text-gray-700 text-sm font-medium mb-2">
                                        Nhập lý do cụ thể
                                    </label>
                                    <textarea
                                        className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-red-500 focus:border-red-500 resize-none"
                                        rows="3"
                                        placeholder="Vui lòng mô tả chi tiết lý do hủy đơn hàng..."
                                        value={cancelReason}
                                        onChange={(e) => setCancelReason(e.target.value)}
                                    />
                                </div>
                            )}

                            {/* Thông tin bổ sung */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <h5 className="text-blue-800 font-medium text-sm mb-2">Thông tin bổ sung:</h5>
                                <ul className="text-blue-700 text-sm space-y-1">
                                    <li>• Khách hàng sẽ nhận được email thông báo hủy đơn</li>
                                    <li>• Số lượng sản phẩm sẽ được hoàn lại vào kho tự động</li>
                                    <li>• Nếu đã thanh toán, cần hoàn tiền cho khách hàng</li>
                                </ul>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex justify-end space-x-3 p-6 bg-gray-50 rounded-b-2xl">
                            <button
                                onClick={handleCloseCancelModal}
                                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all duration-200 font-medium"
                            >
                                Giữ lại đơn hàng
                            </button>
                            <button
                                onClick={handleConfirmCancelOrder}
                                disabled={
                                    !selectedCancelReason ||
                                    (selectedCancelReason === 'Lý do khác' && !cancelReason.trim())
                                }
                                className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:from-gray-400 disabled:to-gray-500"
                            >
                                Xác nhận hủy đơn
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-gray-800 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Lịch sử đơn hàng
                </h2>

                {/* Status Selector for Demo */}
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">Trạng thái:</span>
                        <select
                            value={currentOrderStatus}
                            onChange={(e) => handlePrepareStatusChange(parseInt(e.target.value))}
                            className="px-3 py-1 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((status) => (
                                <option key={status} value={status}>
                                    {getStatusInfo(status).label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="relative mb-12">
                <div className="flex items-center justify-between">
                    {timeline.map((step, index) => {
                        const statusInfo = getStatusInfo(step.status);
                        const IconComponent = statusInfo.icon;

                        return (
                            <div key={step.status} className="flex flex-col items-center relative z-10 flex-1">
                                {/* Icon with animated glow */}
                                <div
                                    className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 shadow-lg transform transition-all duration-500 ${
                                        step.current ? 'scale-110 animate-pulse' : 'scale-100'
                                    } ${
                                        step.status === 7 && step.current
                                            ? 'ring-4 ring-red-300 ring-opacity-60 animate-bounce'
                                            : ''
                                    }`}
                                    style={{
                                        backgroundColor: statusInfo.color,
                                        boxShadow: step.current
                                            ? step.status === 7
                                                ? `0 0 30px ${statusInfo.color}60, inset 0 0 0 2px rgba(255,255,255,0.3)`
                                                : `0 0 20px ${statusInfo.color}40`
                                            : `0 4px 15px ${statusInfo.color}20`,
                                        filter:
                                            step.status === 7 && step.current
                                                ? 'brightness(1.1) saturate(1.2)'
                                                : 'none',
                                    }}
                                >
                                    <IconComponent
                                        className={`w-10 h-10 text-white transition-all duration-300 ${
                                            step.status === 7 && step.current ? 'animate-pulse' : ''
                                        }`}
                                    />
                                </div>

                                {/* Step Info */}
                                <div className="text-center max-w-32">
                                    <div
                                        className={`font-semibold mb-2 transition-all duration-300 ${
                                            step.current
                                                ? step.status === 7
                                                    ? 'text-red-800 animate-pulse'
                                                    : 'text-gray-900'
                                                : 'text-gray-700'
                                        }`}
                                    >
                                        {statusInfo.label}
                                        {step.status === 7 && step.current && (
                                            <div className="text-xs text-red-600 mt-1 font-normal">
                                                Đơn hàng đã bị hủy
                                            </div>
                                        )}
                                    </div>
                                    <div
                                        className={`text-sm transition-all duration-300 px-2 py-1 rounded-full ${
                                            step.status === 7 && step.current
                                                ? 'text-red-700 bg-red-100 border border-red-300'
                                                : 'text-gray-500 bg-gray-100'
                                        }`}
                                    >
                                        {step.time}
                                    </div>

                                    {/* Badge đặc biệt cho trạng thái đã hủy */}
                                    {step.status === 7 && step.current && (
                                        <div className="mt-2 animate-fadeIn">
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-300">
                                                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                                Đã hủy
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Connector Line */}
                                {index < timeline.length - 1 && (
                                    <div
                                        className="absolute top-10 left-full w-full h-1 -translate-x-1/2 transition-all duration-700"
                                        style={{
                                            background: step.completed
                                                ? `linear-gradient(to right, ${statusInfo.color}, ${getStatusInfo(timeline[index + 1].status).color})`
                                                : '#e5e7eb',
                                            zIndex: -1,
                                        }}
                                    />
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Progress Indicator */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Tiến độ đơn hàng</span>
                    <span className="text-sm font-medium text-gray-700">{Math.round(progressPercentage)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${progressPercentage}%` }}
                    />
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                {/* Thông báo đặc biệt cho đơn hàng đã hủy */}
                {currentOrderStatus === 7 && (
                    <div className="flex-1 mr-4">
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                            <div className="flex items-start">
                                <div className="w-5 h-5 text-red-500 mt-0.5 mr-3">
                                    <svg fill="currentColor" viewBox="0 0 20 20">
                                        <path
                                            fillRule="evenodd"
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </div>
                                <div>
                                    <h4 className="text-red-800 font-semibold text-sm">Đơn hàng đã bị hủy</h4>
                                    <p className="text-red-700 text-sm mt-1">
                                        Số lượng sản phẩm đã được hoàn lại vào kho. Không thể thực hiện thêm thao tác
                                        nào trên đơn hàng này.
                                    </p>
                                    <div className="mt-2 text-xs text-red-600">
                                        <span className="font-medium">Lưu ý:</span> Chức năng Force hoàn kho đã bị vô
                                        hiệu hóa
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Button actions cho các trạng thái khác */}
                {currentOrderStatus !== 7 && shouldShowActionButton(currentOrderStatus) ? (
                    <button
                        className={`px-6 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 font-medium ${getActionButtonStyle(currentOrderStatus)}`}
                        disabled={currentOrderStatus === 6}
                        onClick={() => {
                            // Xác định trạng thái tiếp theo dựa trên logic nghiệp vụ
                            let nextStatus = currentOrderStatus + 1;
                            if (currentOrderStatus === 4) {
                                // Trạng thái 4 (Đã giao hàng) -> 5 (Đã thanh toán): Mở modal thanh toán trực tiếp
                                nextStatus = 5;
                                handleActionButtonClick(nextStatus, '');
                            } else {
                                // Các trạng thái khác: Hiển thị modal xác nhận trước
                                handlePrepareStatusChange(nextStatus);
                            }
                        }}
                    >
                        {getActionButtonText(currentOrderStatus)}
                    </button>
                ) : currentOrderStatus !== 7 ? (
                    <div className="px-6 py-3 bg-gray-100 text-gray-500 rounded-xl font-medium cursor-default">
                        {getActionButtonText(currentOrderStatus)}
                    </div>
                ) : null}

                <div className="flex items-center space-x-4">
                    {/* Button quay lại trạng thái trước */}
                    {canRevertStatus && canRevertStatus(currentOrderStatus) && (
                        <button
                            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-300 transform hover:scale-105 shadow-lg font-medium"
                            onClick={handleRevertStatus}
                        >
                            ← Quay lại trạng thái trước
                        </button>
                    )}

                    {/* Button hủy đơn - chỉ hiện khi chưa hủy */}
                    {(currentOrderStatus === 1 || currentOrderStatus === 2 || currentOrderStatus === 3) && (
                        <button
                            className="px-8 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105 shadow-lg font-medium"
                            onClick={handlePrepareCancelOrder}
                        >
                            Hủy đơn
                        </button>
                    )}

                    {/* Button chi tiết - luôn có nhưng style khác khi đã hủy */}
                    <button
                        className={`transition-colors duration-300 font-medium px-4 py-2 rounded-lg ${
                            currentOrderStatus === 7
                                ? 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                                : 'text-purple-600 hover:text-purple-800 hover:bg-purple-50'
                        }`}
                        onClick={handleShowHistoryModal}
                    >
                        {currentOrderStatus === 7 ? 'Xem chi tiết hủy →' : 'Chi tiết →'}
                    </button>
                </div>
            </div>

            {/* Current Status Badge */}
            <div className="mt-6 text-center">
                <div
                    className={`inline-flex items-center px-6 py-3 rounded-full text-white font-semibold shadow-lg transition-all duration-500 ${
                        currentOrderStatus === 7 ? 'animate-pulse ring-4 ring-red-300 ring-opacity-40' : ''
                    }`}
                    style={{
                        backgroundColor: getStatusInfo(currentOrderStatus).color,
                        boxShadow:
                            currentOrderStatus === 7
                                ? `0 0 25px ${getStatusInfo(currentOrderStatus).color}60`
                                : `0 4px 15px ${getStatusInfo(currentOrderStatus).color}30`,
                    }}
                >
                    <div
                        className={`w-3 h-3 bg-white rounded-full mr-3 ${
                            currentOrderStatus === 7 ? 'animate-bounce' : 'animate-pulse'
                        }`}
                    />
                    Trạng thái hiện tại: {getStatusInfo(currentOrderStatus).label}
                    {currentOrderStatus === 7 && (
                        <div className="ml-3 text-red-100 text-sm">• Không thể Force hoàn kho</div>
                    )}
                </div>

                {/* Thông báo bổ sung cho trạng thái đã hủy */}
                {currentOrderStatus === 7 && (
                    <div className="mt-4 animate-fadeIn">
                        <div className="inline-flex items-center px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <svg className="w-4 h-4 text-yellow-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path
                                    fillRule="evenodd"
                                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                    clipRule="evenodd"
                                />
                            </svg>
                            <span className="text-yellow-800 text-sm font-medium">
                                Chức năng Force hoàn kho không khả dụng cho đơn hàng đã hủy
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderProgress;
