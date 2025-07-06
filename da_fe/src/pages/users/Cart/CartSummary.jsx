// CartSummary.js
import React from 'react';
import { Button } from '@mui/material';
import { CreditCard, Truck, Tag, Shield, ArrowRight, Loader2 } from 'lucide-react';

const CartSummary = ({
    carts,
    totalPrice,
    shipping,
    promoDiscount,
    finalTotal,
    promoCode,
    setPromoCode,
    handleApplyPromoCode,
    handleCheckout,
    isCheckingOut,
    
}) => {
    return (
        <div className="lg:col-span-1">
            <div className="sticky top-24">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                    <div className="p-6 bg-gradient-to-r from-indigo-50 to-blue-50 border-b border-gray-200">
                        <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                            <CreditCard className="w-6 h-6 text-indigo-600" />
                            Tóm tắt đơn hàng
                        </h3>
                    </div>

                    <div className="p-6">
                        <div className="space-y-4">
                            <div className="flex justify-between text-gray-600">
                                <span>Tạm tính ({carts.length} sản phẩm)</span>
                                <span className="font-medium">{totalPrice.toLocaleString()} ₫</span>
                            </div>

                            <div className="flex justify-between text-gray-600">
                                <span className="flex items-center gap-1">
                                    <Truck className="w-4 h-4" />
                                    Phí vận chuyển
                                </span>
                                <span className={`font-medium ${shipping === 0 ? 'text-green-600' : ''}`}>
                                    {shipping === 0 ? 'Miễn phí' : `${shipping.toLocaleString()} ₫`}
                                </span>
                            </div>

                            {promoDiscount > 0 && (
                                <div className="flex justify-between text-green-600">
                                    <span className="flex items-center gap-1">
                                        <Tag className="w-4 h-4" />
                                        Giảm giá
                                    </span>
                                    <span className="font-medium">-{promoDiscount.toLocaleString()} ₫</span>
                                </div>
                            )}

                            <hr className="border-gray-200" />

                            <div className="flex justify-between text-xl font-bold">
                                <span className="text-gray-800">Tổng cộng</span>
                                <span className="text-indigo-600">{finalTotal.toLocaleString()} ₫</span>
                            </div>
                        </div>

                        

                        {/* Promo Code */}
                        <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                            <div className="flex items-center gap-2 mb-2">
                                <Tag className="w-4 h-4 text-gray-600" />
                                <span className="text-sm font-medium text-gray-700">Mã giảm giá</span>
                            </div>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={promoCode}
                                    onChange={(e) => setPromoCode(e.target.value)}
                                    placeholder="Nhập mã giảm giá"
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                                <button
                                    onClick={handleApplyPromoCode}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition-colors duration-200 whitespace-nowrap"
                                >
                                    Chọn
                                </button>
                            </div>
                        </div>

                        {/* Checkout Button */}
                        <Button
                            variant="contained"
                            onClick={handleCheckout}
                            disabled={isCheckingOut}
                            fullWidth
                            sx={{
                                padding: '16px',
                                marginTop: '24px',
                                backgroundColor: '#4f46e5',
                                fontSize: '16px',
                                fontWeight: 'bold',
                                textTransform: 'none',
                                borderRadius: '12px',
                                '&:hover': { backgroundColor: '#4338ca' },
                                '&:disabled': { backgroundColor: '#9ca3af' },
                            }}
                            endIcon={
                                isCheckingOut ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <ArrowRight />
                                )
                            }
                        >
                            {isCheckingOut ? 'Đang xử lý...' : 'Tiến hành thanh toán'}
                        </Button>

                        {/* Security Info */}
                        <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500">
                            <Shield className="w-4 h-4 text-green-500" />
                            Thanh toán được bảo mật bởi SSL
                        </div>
                    </div>
                </div>

                {/* Payment Methods */}
                <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <CreditCard className="w-5 h-5" />
                        Phương thức thanh toán
                    </h4>
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { name: 'Visa', color: 'from-blue-500 to-blue-600' },
                            { name: 'MasterCard', color: 'from-red-500 to-orange-500' },
                            { name: 'Momo', color: 'from-pink-500 to-purple-500' },
                        ].map((method) => (
                            <div
                                key={method.name}
                                className="p-3 border border-gray-200 rounded-lg text-center hover:shadow -md transition-shadow duration-200"
                            >
                                <div
                                    className={`w-8 h-6 bg-gradient-to-r ${method.color} rounded mx-auto mb-2`}
                                ></div>
                                <span className="text-xs text-gray-600 font-medium">{method.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartSummary;
