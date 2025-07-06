// PaymentDetails.js
import React from 'react';
import { Percent, Calculator, Receipt } from 'lucide-react';

const PaymentDetails = ({
    discountCode,
    setDiscountCode,
    discountPercent,
    setDiscountPercent,
    total,
    discountAmount,
}) => {
    
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
                        <div className="flex items-center gap-3">
                            <Receipt className="w-8 h-8" />
                            <h2 className="text-2xl font-bold">Chi tiết thanh toán</h2>
                        </div>
                    </div>

                    {/* Content - Horizontal Layout */}
                    <div className="p-8">
                        {/* Main Horizontal Section */}
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
                            {/* Discount Code Section */}
                            <div className="lg:col-span-1">
                                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100 h-full">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Percent className="w-5 h-5 text-purple-600" />
                                        <h3 className="font-semibold text-gray-800">Mã giảm giá</h3>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Phiếu giảm giá:
                                            </label>
                                            <input
                                                type="text"
                                                value={discountCode}
                                                onChange={(e) => setDiscountCode(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-sm"
                                                placeholder="Nhập mã"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Giảm giá (%):
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    value={discountPercent}
                                                    onChange={(e) =>
                                                        setDiscountPercent(
                                                            Math.max(0, Math.min(100, e.target.value)),
                                                        )
                                                    }
                                                    className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-sm"
                                                    placeholder="0"
                                                    min="0"
                                                    max="100"
                                                />
                                                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                                                    %
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Summary Section */}
                            <div className="lg:col-span-3 grid grid-cols-1 gap-6">
                                <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl p-6 border border-orange-100 h-full">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Calculator className="w-5 h-5 text-orange-600" />
                                        <h3 className="font-semibold text-gray-800">Tóm tắt</h3>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-700">Tổng tiền hàng:</span>
                                            <span className="font-semibold text-gray-900">
                                                {(total - 30000).toLocaleString()} VNĐ
                                            </span>
                                        </div>

                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-700">Giảm giá:</span>
                                            <span className="font-semibold text-red-600">
                                                -{discountAmount.toLocaleString()} VNĐ
                                            </span>
                                        </div>

                                        <div className="flex justify-between items-center text-sm border-b border-orange-200 pb-2">
                                            <span className="text-gray-700">Phí vận chuyển:</span>
                                            <span className="font-semibold text-gray-900">+30.000 VNĐ</span>
                                        </div>

                                        <div className="bg-gradient-to-r from-red-500 to-pink-500 rounded-lg p-3 mt-4">
                                            <div className="flex justify-between items-center">
                                                <span className="text-white font-bold">Tổng tiền:</span>
                                                <span className="text-white font-bold text-lg">
                                                    {total.toLocaleString()} VNĐ
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentDetails;
