import React, { useState } from 'react';

const OrderProgress = ({
    currentOrderStatus,
    // setCurrentOrderStatus,
    timeline,
    getStatusInfo,
    progressPercentage,
    shouldShowActionButton,
    handleActionButtonClick,
    getActionButtonStyle,
    getActionButtonText,
    handleCancelOrder
}) => {
    // State cho modal confirm
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [note, setNote] = useState('');
    const [pendingStatus, setPendingStatus] = useState(null);

    // Xử lý mở modal confirm
    const handlePrepareStatusChange = (newStatus) => {
        setPendingStatus(newStatus);
        setShowConfirmModal(true);
    };

    // Xử lý khi nhấn Lưu trong modal confirm
    const handleConfirmStatusChange = () => {
        setShowConfirmModal(false);
        handleActionButtonClick(pendingStatus, note); // Truyền note vào hàm xử lý
        setNote(''); // Reset note sau khi lưu
    };

    // Xử lý đóng modal confirm
    const handleCancelStatusChange = () => {
        setShowConfirmModal(false);
        setNote('');
    };

    return (
        <div>
            {/* Modal confirm */}
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
                            <div className="font-semibold text-blue-600">
                                {getStatusInfo(pendingStatus).label}
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-medium mb-2">
                                    Ghi chú
                                </label>
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
                                    }`}
                                    style={{
                                        backgroundColor: statusInfo.color,
                                        boxShadow: step.current
                                            ? `0 0 20px ${statusInfo.color}40`
                                            : `0 4px 15px ${statusInfo.color}20`,
                                    }}
                                >
                                    <IconComponent className="w-10 h-10 text-white" />
                                </div>

                                {/* Step Info */}
                                <div className="text-center max-w-32">
                                    <div
                                        className={`font-semibold mb-2 ${step.current ? 'text-gray-900' : 'text-gray-700'}`}
                                    >
                                        {statusInfo.label}
                                    </div>
                                    <div className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                        {step.time}
                                    </div>
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
                {shouldShowActionButton(currentOrderStatus) ? (
                    <button
                        className={`px-6 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 font-medium ${getActionButtonStyle(currentOrderStatus)}`}
                        disabled={currentOrderStatus === 6}
                        onClick={() => handlePrepareStatusChange(currentOrderStatus)}
                    >
                        {getActionButtonText(currentOrderStatus)}
                    </button>
                ) : (
                    <div className="px-6 py-3 bg-gray-100 text-gray-500 rounded-xl font-medium cursor-default">
                        {getActionButtonText(currentOrderStatus)}
                    </div>
                )}

                <div className="flex items-center space-x-4">
                    {(currentOrderStatus === 1 || currentOrderStatus === 2 || currentOrderStatus === 3) && (
                    <button
                        className="px-8 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105 shadow-lg font-medium"
                        onClick={handleCancelOrder} // Gọi hàm hủy đơn
                    >
                        Hủy đơn
                    </button>
                )}

                    <button className="text-purple-600 hover:text-purple-800 transition-colors duration-300 font-medium px-4 py-2 rounded-lg hover:bg-purple-50">
                        Chi tiết →
                    </button>
                </div>
            </div>

            {/* Current Status Badge */}
            <div className="mt-6 text-center">
                <div
                    className="inline-flex items-center px-6 py-3 rounded-full text-white font-semibold shadow-lg"
                    style={{ backgroundColor: getStatusInfo(currentOrderStatus).color }}
                >
                    <div className="w-3 h-3 bg-white rounded-full mr-3 animate-pulse" />
                    Trạng thái hiện tại: {getStatusInfo(currentOrderStatus).label}
                </div>
            </div>
        </div>
    );
};

export default OrderProgress;
