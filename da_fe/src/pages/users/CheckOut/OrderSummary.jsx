import React from 'react';
import { useNavigate } from 'react-router-dom';
        
import { 
    ShoppingCart, 
    Edit3, 
    Tag, 
    CreditCard, 
    Truck, 
    Percent,
    Gift,
    CheckCircle,
    Clock,
    Calculator 
} from 'lucide-react';const OrderSummary = ({
    carts,
    totalPrice,
    selectedPaymentMethod,
    setSelectedPaymentMethod,
    handleSubmit,
    promoCode,
    setPromoCode,
    promoDiscount,
    discountedPrice,
    selectedDiscount,
    setShowModal,
    shippingFee = 0,
    isSmartShipping = false
}) => {
    const navigate = useNavigate();
    
    // Calculate discounted price
    const isPromoValid = promoDiscount > 0 && totalPrice >= promoDiscount;
    const itemCount = carts.reduce((sum, item) => sum + item.soLuong, 0);

    return (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 sticky top-4">
            {/* Compact Header */}
            <div className="bg-gradient-to-r from-slate-50 to-blue-50 px-6 py-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                            <ShoppingCart className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Đơn hàng</h2>
                            <p className="text-xs text-gray-600">{itemCount} sản phẩm</p>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate('/gio-hang')}
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium text-sm px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                        <Edit3 className="w-3 h-3" />
                        Sửa
                    </button>
                </div>
            </div>

            <div className="p-6">
                {/* Compact Cart Items */}
                <div className="space-y-3 mb-6">
                    {carts.map((item) => (
                        <div
                            key={item.id}
                            className="bg-gray-50 hover:bg-blue-50 rounded-xl p-3 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <div className="relative flex-shrink-0">
                                    <img
                                        src={item.hinhAnhUrl}
                                        alt={item.soLuong}
                                        className="w-14 h-14 object-cover rounded-lg"
                                    />
                                    <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                                        {item.soLuong}
                                    </span>
                                </div>
                                
                                <div className="flex-grow min-w-0">
                                    <h3 className="font-medium text-gray-900 text-sm mb-1 line-clamp-1">
                                        {item.sanPhamCT.ten}
                                    </h3>
                                    <div className="flex items-center gap-2 text-xs text-gray-600">
                                        <div 
                                            className="w-3 h-3 rounded-full border border-gray-300" 
                                            style={{ backgroundColor: item.sanPhamCT.mauSac.ten.toLowerCase() }}
                                        />
                                        <span>{item.sanPhamCT.mauSac.ten}</span>
                                        <span>•</span>
                                        <span>{item.sanPhamCT.trongLuong.ten}</span>
                                    </div>
                                </div>
                                
                                <div className="text-right">
                                    {item.sanPhamCT.giaKhuyenMai ? (
                                        <div>
                                            <p className="font-semibold text-red-600 text-sm">
                                                {(item.sanPhamCT.giaKhuyenMai * item.soLuong).toLocaleString()}₫
                                            </p>
                                            <p className="text-xs text-gray-500 line-through">
                                                {(item.sanPhamCT.donGia * item.soLuong).toLocaleString()}₫
                                            </p>
                                        </div>
                                    ) : (
                                        <p className="font-semibold text-gray-900 text-sm">
                                            {(item.sanPhamCT.donGia * item.soLuong).toLocaleString()}₫
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Compact Price Summary */}
                <div className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl p-4 mb-6">
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Tạm tính:</span>
                            <span className="font-medium">{totalPrice.toLocaleString()}₫</span>
                        </div>
                        
                        {promoDiscount > 0 && (
                            <div className="flex justify-between text-sm">
                                <span className="text-green-600 flex items-center gap-1">
                                    <Gift className="w-3 h-3" />
                                    Giảm giá ({selectedDiscount?.giaTri || 0}%):
                                </span>
                                <span className="text-green-600 font-medium">
                                    -{promoDiscount.toLocaleString()}₫
                                </span>
                            </div>
                        )}
                        
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600 flex items-center gap-1">
                                <Truck className="w-3 h-3" />
                                Phí vận chuyển:
                                {isSmartShipping && (
                                    <span className="ml-1 px-1 py-0.5 text-xs bg-green-100 text-green-700 rounded">
                                        <Calculator  className="w-2 h-2 inline mr-0.5" />
                                        Thông minh
                                    </span>
                                )}
                            </span>
                            <span className="font-medium">{shippingFee.toLocaleString()}₫</span>
                        </div>
                        
                        <div className="border-t border-gray-200 pt-2">
                            <div className="flex justify-between items-center">
                                <span className="font-semibold text-gray-900">Tổng cộng:</span>
                                <span className="font-bold text-lg text-blue-600">
                                    {((promoDiscount > 0 ? discountedPrice : totalPrice) + shippingFee).toLocaleString()}₫
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Compact Promo Code */}
                <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                        <Tag className="w-4 h-4 text-orange-500" />
                        <h3 className="font-medium text-gray-900 text-sm">Mã giảm giá</h3>
                    </div>
                    
                    <div className="flex gap-2 mb-2">
                        <input
                            type="text"
                            value={promoCode}
                            onChange={(e) => setPromoCode(e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm"
                            placeholder="Nhập mã giảm giá"
                        />
                        <button
                            onClick={() => setShowModal(true)}
                            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-medium text-sm transition-all flex items-center gap-1"
                        >
                            <Percent className="w-3 h-3" />
                            Chọn
                        </button>
                    </div>
                    
                    {selectedDiscount && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-2 text-xs">
                            <div className="flex items-center gap-1 text-green-700">
                                <CheckCircle className="w-3 h-3" />
                                Áp dụng: {selectedDiscount.ten}
                            </div>
                        </div>
                    )}
                    
                    {promoDiscount > 0 && !isPromoValid && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-2 text-xs">
                            <div className="flex items-center gap-1 text-red-600">
                                <Clock className="w-3 h-3" />
                                Voucher không đủ điều kiện
                            </div>
                        </div>
                    )}
                </div>

                {/* Compact Payment Method */}
                <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                        <CreditCard className="w-4 h-4 text-blue-500" />
                        <h3 className="font-medium text-gray-900 text-sm">Thanh toán</h3>
                    </div>
                    
                    <div className="space-y-2">
                        <label className="cursor-pointer">
                            <div className={`flex items-center p-3 rounded-lg border transition-colors ${
                                selectedPaymentMethod === 'cash' 
                                    ? 'border-green-400 bg-green-50' 
                                    : 'border-gray-200 hover:border-gray-300 bg-white'
                            }`}>
                                <input
                                    type="radio"
                                    value="cash"
                                    checked={selectedPaymentMethod === 'cash'}
                                    onChange={() => setSelectedPaymentMethod('cash')}
                                    className="sr-only"
                                />
                                <Truck className={`w-4 h-4 mr-3 ${
                                    selectedPaymentMethod === 'cash' ? 'text-green-600' : 'text-gray-500'
                                }`} />
                                <span className="text-sm font-medium">Thanh toán khi nhận hàng</span>
                                {selectedPaymentMethod === 'cash' && (
                                    <CheckCircle className="w-4 h-4 text-green-600 ml-auto" />
                                )}
                            </div>
                        </label>
                        
                        {/* <label className="cursor-pointer">
                            <div className={`flex items-center p-3 rounded-lg border transition-colors ${
                                selectedPaymentMethod === 'vnpay' 
                                    ? 'border-blue-400 bg-blue-50' 
                                    : 'border-gray-200 hover:border-gray-300 bg-white'
                            }`}>
                                <input
                                    type="radio"
                                    value="vnpay"
                                    checked={selectedPaymentMethod === 'vnpay'}
                                    onChange={() => setSelectedPaymentMethod('vnpay')}
                                    className="sr-only"
                                />
                                <CreditCard className={`w-4 h-4 mr-3 ${
                                    selectedPaymentMethod === 'vnpay' ? 'text-blue-600' : 'text-gray-500'
                                }`} />
                                <span className="text-sm font-medium">Thanh toán qua VNPay</span>
                                {selectedPaymentMethod === 'vnpay' && (
                                    <CheckCircle className="w-4 h-4 text-blue-600 ml-auto" />
                                )}
                            </div>
                        </label> */}
                    </div>
                </div>

                {/* Order Button */}
                <button
                    onClick={handleSubmit}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-200 hover:shadow-lg flex items-center justify-center gap-2 transform hover:scale-[1.01]"
                >
                    <ShoppingCart className="w-4 h-4" />
                    Đặt hàng ngay
                </button>
            </div>
        </div>
    );
};

export default OrderSummary;