import React from 'react';
import { useNavigate } from 'react-router-dom';

const OrderSummary = ({
    carts,
    totalPrice,
    selectedPaymentMethod,
    setSelectedPaymentMethod,
    handleSubmit,
    promoCode,
    setPromoCode,
    handleApplyPromoCode,
    promoDiscount,
    discountedPrice,
    selectedDiscount
}) => {
    const navigate = useNavigate();

    // Calculate discounted price
    const isPromoValid = promoDiscount > 0 && totalPrice >= promoDiscount;

    return (
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 sticky top-4">
            <div className="p-8">
                <div className="flex items-center mb-6">
                    <div className="w-8 h-8 bg-[#2f19ae] rounded-full flex items-center justify-center mr-3">
                        <span className="text-white font-bold">2</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">Đơn hàng của bạn</h2>
                    <button
                        onClick={() => navigate('/gio-hang')}
                        className="ml-4 bg-[#19aea4] text-white py-2 px-4 rounded-lg flex items-center"
                    >
                        <span className="mr-2">✏️</span> Sửa giỏ hàng
                    </button>
                </div>

                <div className="space-y-4 mb-6">
                    {carts.map((item) => (
                        <div
                            key={item.id}
                            className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors duration-300"
                        >
                            <div className="flex items-start space-x-4">
                                <div className="relative">
                                    <img
                                        src={item.hinhAnhUrl}
                                        alt={item.soLuong}
                                        className="w-20 h-20 object-cover rounded-lg shadow-md"
                                    />
                                    <span className="absolute -top-2 -right-2 bg-[#2f19ae] text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                                        {item.soLuong}
                                    </span>
                                </div>
                                <div className="flex-grow">
                                    <h3 className="font-semibold text-gray-800 text-sm mb-1">{item.sanPhamCT.ten}</h3>
                                    <div className="space-y-1 text-xs text-gray-600">
                                        <p>
                                            🎨 Màu: <span className="font-semibold">{item.sanPhamCT.mauSac.ten}</span>
                                        </p>
                                        <p>
                                            ⚖️ Trọng lượng: <span className="font-semibold">{item.sanPhamCT.trongLuong.ten}</span>
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    {item.sanPhamCT.giaKhuyenMai ? (
                                        <>
                                            <p className="font-bold text-red-600">
                                                {(item.sanPhamCT.giaKhuyenMai * item.soLuong).toLocaleString()} VNĐ
                                            </p>
                                            <p className="text-xs text-gray-500 line-through">
                                                {(item.sanPhamCT.donGia * item.soLuong).toLocaleString()} VNĐ
                                            </p>
                                        </>
                                    ) : (
                                        <p className="font-bold text-[#2f19ae]">
                                            {(item.sanPhamCT.donGia * item.soLuong).toLocaleString()} VNĐ
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="border-t border-gray-200 pt-6">
                    <div className="flex justify-between items-center mb-6">
                        <span className="text-xl font-bold text-gray-800">Tổng tiền:</span>
                        <span className="text-2xl font-bold text-[#2f19ae]">
                            {totalPrice.toLocaleString()} VNĐ
                        </span>
                    </div>

                    {promoDiscount > 0 && (
                        <div className="space-y-2 mb-4">
                            <div className="flex justify-between">
                                <span>Giảm giá:</span>
                                <span className="text-red-600">-{promoDiscount.toLocaleString()} VNĐ</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Phần trăm giảm:</span>
                                <span>{selectedDiscount ? selectedDiscount.giaTri : 0}%</span>
                            </div>
                            <div className="flex justify-between font-bold text-lg">
                                <span>Tổng tiền sau giảm:</span>
                                <span className="text-green-600">{discountedPrice.toLocaleString()} VNĐ</span>
                            </div>
                        </div>
                    )}

                    {/* Mã giảm giá */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Mã giảm giá</h3>
                        <div className="flex items-center">
                            <input
                                type="text"
                                value={promoCode}
                                onChange={(e) => setPromoCode(e.target.value)}
                                className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-[#2f19ae] focus:ring-4 focus:ring-[#2f19ae]/20 transition-all duration-300 outline-none"
                                placeholder="Nhập mã giảm giá"
                            />
                            <button
                                onClick={handleApplyPromoCode}
                                className="ml-2 bg-blue-500 text-white py-2 px-4 rounded-lg"
                            >
                                Chọn
                            </button>
                        </div>
                    </div>

                    {promoDiscount > 0 && !isPromoValid && (
                        <div className="text-red-500 text-sm mb-4">
                            ⚠️ Voucher không đủ điều kiện sử dụng cho đơn hàng này.
                        </div>
                    )}

                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Phương thức thanh toán</h3>
                        <div className="space-y-3">
                            <label
                                className={`w-full flex items-center justify-center py-3 px-6 rounded-xl font-semibold transition-all duration-300 shadow-lg ${selectedPaymentMethod === 'cash' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
                            >
                                <input
                                    type="radio"
                                    value="cash"
                                    checked={selectedPaymentMethod === 'cash'}
                                    onChange={() => setSelectedPaymentMethod('cash')}
                                    className="hidden"
                                />
                                🚚 Thanh toán khi nhận hàng
                            </label>
                            <label
                                className={`w-full flex items-center justify-center py-3 px-6 rounded-xl font-semibold transition-all duration-300 shadow-lg ${selectedPaymentMethod === 'vnpay' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
                            >
                                <input
                                    type="radio"
                                    value="vnpay"
                                    checked={selectedPaymentMethod === 'vnpay'}
                                    onChange={() => setSelectedPaymentMethod('vnpay')}
                                    className="hidden"
                                />
                                💳 Thanh toán qua VNPay
                            </label>
                        </div>
                    </div>

                    <button
                        onClick={handleSubmit}
                        className="w-full bg-gradient-to-r from-[#ae1919] to-[#b52e6f] text-white py-4 px-6 rounded-xl font-bold text-lg hover:from-[#251589] hover:to-[#3d2491] transform hover:scale-[1.02] transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                        🛒 Đặt hàng
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrderSummary;
