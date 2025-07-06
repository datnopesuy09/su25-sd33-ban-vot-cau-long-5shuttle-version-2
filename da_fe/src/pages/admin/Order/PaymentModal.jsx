// PaymentModal.js
import React from 'react';
import { X, Receipt, Calculator, Banknote, CreditCard } from 'lucide-react';

const PaymentModal = ({
    isOpen,
    handleClose,
    total,
    paymentMethod,
    setPaymentMethod,
    customerMoney,
    setCustomerMoney,
    note,
    setNote,
    handleSave,
    isInsufficientFunds,
    isAnimating,
    formatCurrency,
    calculateChange

}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            {/* Backdrop với hiệu ứng blur */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
                onClick={handleClose}
            />

            {/* Modal Container */}
            <div
                className={`relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-auto transform transition-all duration-300 ${
                    isAnimating ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
                } ${paymentMethod === 'Tiền mặt' ? 'max-h-[85vh]' : 'max-h-[70vh]'} overflow-hidden`}
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="bg-white/20 p-2 rounded-lg">
                                <Receipt className="w-6 h-6" />
                            </div>
                            <h2 className="text-xl font-bold">Thanh toán</h2>
                        </div>
                        <button
                            onClick={handleClose}
                            className="p-2 hover:bg-white/20 rounded-lg transition-colors duration-200"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4 overflow-y-auto max-h-[calc(85vh-200px)]">
                    {/* Tổng tiền */}
                    <div className="bg-gray-50 rounded-xl p-4">
                        <label className="block text-sm font-medium text-gray-600 mb-2">Tổng tiền cần thanh toán</label>
                        <div className="flex items-center space-x-2">
                            <Calculator className="w-5 h-5 text-gray-400" />
                            <span className="text-2xl font-bold text-gray-900">{formatCurrency(total)}</span>
                        </div>
                    </div>

                    {/* Phương thức thanh toán */}
                    <div className="space-y-3">
                        <label className="block text-sm font-medium text-gray-700">Phương thức thanh toán</label>
                        <div className="grid grid-cols-2 gap-3">
                            <label
                                className={`flex items-center space-x-3 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                                    paymentMethod === 'Tiền mặt'
                                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                                        : 'border-gray-200 hover:border-gray-300'
                                }`}
                            >
                                <input
                                    type="radio"
                                    value="Tiền mặt"
                                    checked={paymentMethod === 'Tiền mặt'}
                                    onChange={() => setPaymentMethod('Tiền mặt')}
                                    className="sr-only"
                                />
                                <Banknote className="w-5 h-5" />
                                <span className="font-medium">Tiền mặt</span>
                            </label>

                            <label
                                className={`flex items-center space-x-3 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                                    paymentMethod === 'Chuyển khoản'
                                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                                        : 'border-gray-200 hover:border-gray-300'
                                }`}
                            >
                                <input
                                    type="radio"
                                    value="Chuyển khoản"
                                    checked={paymentMethod === 'Chuyển khoản'}
                                    onChange={() => setPaymentMethod('Chuyển khoản')}
                                    className="sr-only"
                                />
                                <CreditCard className="w-5 h-5" />
                                <span className="font-medium">Chuyển khoản</span>
                            </label>
                        </div>
                    </div>

                    {/* Tiền khách đưa - chỉ hiện khi thanh toán tiền mặt */}
                    {paymentMethod === 'Tiền mặt' && (
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Tiền khách đưa</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={customerMoney || ''}
                                    onChange={(e) => setCustomerMoney(Number(e.target.value))}
                                    placeholder="Nhập số tiền..."
                                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
                                        isInsufficientFunds
                                            ? 'border-red-300 bg-red-50'
                                            : 'border-gray-200 focus:border-blue-500'
                                    }`}
                                />
                                <div className="absolute right-3 top-3 text-gray-400 text-sm">VNĐ</div>
                            </div>
                            {isInsufficientFunds && (
                                <p className="text-red-500 text-sm flex items-center space-x-1">
                                    <span>⚠️</span>
                                    <span>Số tiền không đủ để thanh toán</span>
                                </p>
                            )}
                        </div>
                    )}

                    {/* Tiền thừa - chỉ hiện khi thanh toán tiền mặt */}
                    {paymentMethod === 'Tiền mặt' && customerMoney > 0 && (
                        <div
                            className={`rounded-xl p-4 ${
                                calculateChange() > 0 ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
                            }`}
                        >
                            <label className="block text-sm font-medium text-gray-700 mb-2">Tiền thừa</label>
                            <span
                                className={`text-xl font-bold ${
                                    calculateChange() > 0 ? 'text-green-600' : 'text-gray-600'
                                }`}
                            >
                                {formatCurrency(calculateChange())}
                            </span>
                        </div>
                    )}

                    {/* Ghi chú */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Ghi chú (tùy chọn)</label>
                        <textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Nhập ghi chú về đơn hàng..."
                            rows="3"
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end space-x-3 p-6 bg-gray-50 rounded-b-2xl">
                    <button
                        onClick={handleClose}
                        className="px-6 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-200 font-medium"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isInsufficientFunds}
                        className={`px-6 py-2.5 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 ${
                            isInsufficientFunds
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 focus:ring-blue-500 shadow-lg hover:shadow-xl'
                        }`}
                    >
                        {isAnimating ? (
                            <div className="flex items-center space-x-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>Đang xử lý...</span>
                            </div>
                        ) : (
                            'Xác nhận thanh toán'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentModal;
