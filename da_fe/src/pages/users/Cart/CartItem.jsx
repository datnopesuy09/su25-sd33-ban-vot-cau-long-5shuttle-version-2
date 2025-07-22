import React, { useState } from 'react';
import { Plus, Minus, Trash2, Heart, Truck, Package } from 'lucide-react';

const CartItem = ({ cart, onQuantityChange = () => {}, onDeleteCart = () => {} }) => {
    const [quantity, setQuantity] = useState(cart.soLuong);
    const maxQuantity = cart?.sanPhamCT?.soLuong || 0;
    const [isEditing, setIsEditing] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);

    // Calculate total price
    const totalPrice = cart.sanPhamCT.giaKhuyenMai ? cart.sanPhamCT.giaKhuyenMai * quantity : cart.sanPhamCT.donGia * quantity;

    const handleQuantityChange = (e) => {
        const newValue = e.target.value;
        if (/^\d*$/.test(newValue)) {
            const num = newValue === '' ? 1 : parseInt(newValue);
            if (num > maxQuantity) {
                alert(`Số lượng không được vượt quá ${maxQuantity}`);
                setQuantity(maxQuantity);
                onQuantityChange(cart.id, maxQuantity);
            } else if (num < 1) {
                onDeleteCart(cart.id);
            } else {
                setQuantity(num);
                onQuantityChange(cart.id, num);
            }
        }
    };

    const handleBlur = () => {
        setIsEditing(false);
        const adjusted = Math.min(Math.max(quantity, 1), maxQuantity);
        setQuantity(adjusted);
        onQuantityChange(cart.id, adjusted);
    };

    const handleIncrease = () => {
        if (quantity < maxQuantity) {
            const newQuantity = quantity + 1;
            setQuantity(newQuantity);
            onQuantityChange(cart.id, newQuantity);
        } else {
            alert(`Số lượng không được vượt quá ${maxQuantity}`);
        }
    };

    const handleDecrease = () => {
        if (quantity > 1) {
            const newQuantity = quantity - 1;
            setQuantity(newQuantity);
            onQuantityChange(cart.id, newQuantity);
        } else {
            onDeleteCart(cart.id);
        }
    };

    const getStockStatus = () => {
        if (maxQuantity <= 5) return { color: 'text-orange-600', icon: '⚠️' };
        return { color: 'text-green-600', icon: '✅' };
    };

    const stockStatus = getStockStatus();

    return (
        <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 p-4">
            <div className="flex gap-4">
                {/* Product Image - Compact */}
                <div className="relative flex-shrink-0">
                    <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-lg overflow-hidden bg-white border border-gray-200">
                        <img
                            className="w-full h-full object-contain p-1"
                            src={cart.hinhAnhUrl}
                            alt={cart.sanPhamCT.ten}
                            onError={(e) => {
                                e.target.src =
                                    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f3f4f6'/%3E%3Ctext x='50' y='55' text-anchor='middle' fill='%23999' font-size='10'%3ENo Image%3C/text%3E%3C/svg%3E";
                            }}
                        />
                    </div>
                    <div className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                        #{cart.id}
                    </div>
                </div>

                {/* Product Info - Main Content */}
                <div className="flex-1 min-w-0">
                    {/* Header với tên và actions */}
                    <div className="flex items-start justify-between mb-2">
                        <h3 className="font-bold text-gray-900 text-sm lg:text-base line-clamp-2 pr-2">
                            {cart.sanPhamCT.ten}
                        </h3>
                        <div className="flex items-center space-x-1 flex-shrink-0">
                            <button
                                onClick={() => setIsFavorite(!isFavorite)}
                                className={`p-1.5 rounded-full transition-colors ${isFavorite ? 'text-red-500 bg-red-50' : 'text-gray-400 hover:text-red-500 hover:bg-red-50'}`}
                            >
                                <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                            </button>
                            <button
                                onClick={() => onDeleteCart(cart.id)}
                                className="p-1.5 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Product Details - Vertical */}
                    <div className="mb-3 text-xs space-y-1">
                        <div className="flex items-center space-x-1">
                            <span className="text-gray-500">Thương hiệu:</span>
                            <span className="font-medium text-blue-600">{cart.sanPhamCT.thuongHieu.ten}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                            <span className="text-gray-500">Trọng lượng:</span>
                            <span className="font-medium">{cart.sanPhamCT.trongLuong.ten}</span>
                        </div>
                    </div>

                    {/* Price Section - Inline */}
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex flex-col">
                            {cart.sanPhamCT.giaKhuyenMai ? (
                                <>
                                    <span className="text-lg font-bold text-red-600">
                                        {cart.sanPhamCT.giaKhuyenMai.toLocaleString()}₫
                                    </span>
                                    <span className="text-xs text-gray-500 line-through">
                                        {cart.sanPhamCT.donGia.toLocaleString()}₫
                                    </span>
                                </>
                            ) : (
                                <span className="text-lg font-bold text-red-600">
                                    {cart.sanPhamCT.donGia.toLocaleString()}₫
                                </span>
                            )}
                            <span className="text-xs text-gray-500">Đơn giá</span>
                        </div>
                        <div className="flex flex-col text-right">
                            <span className="text-lg font-bold text-green-600">{totalPrice.toLocaleString()}₫</span>
                            <span className="text-xs text-gray-500">Tổng tiền</span>
                        </div>
                    </div>

                    {/* Quantity Controls và Stock - Inline */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-700">SL:</span>
                            <div className="flex items-center bg-gray-50 rounded-lg border">
                                <button
                                    onClick={handleDecrease}
                                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-l-lg transition-colors"
                                >
                                    <Minus className="w-3 h-3" />
                                </button>

                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={quantity}
                                        onChange={handleQuantityChange}
                                        onBlur={handleBlur}
                                        className="w-12 py-1.5 text-center text-sm font-semibold bg-transparent border-0 focus:outline-none"
                                        autoFocus
                                    />
                                ) : (
                                    <span
                                        className="w-12 py-1.5 text-center text-sm font-semibold cursor-pointer hover:bg-gray-100 transition-colors"
                                        onClick={() => setIsEditing(true)}
                                    >
                                        {quantity}
                                    </span>
                                )}

                                <button
                                    onClick={handleIncrease}
                                    className={`p-1.5 rounded-r-lg transition-colors ${quantity < maxQuantity ? 'text-blue-500 hover:bg-blue-50' : 'text-gray-400 cursor-not-allowed'}`}
                                    disabled={quantity >= maxQuantity}
                                >
                                    <Plus className="w-3 h-3" />
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3 text-xs">
                            <div className={`flex items-center space-x-1 ${stockStatus.color}`}>
                                <Package className="w-3 h-3" />
                                <span className="font-medium">{maxQuantity}</span>
                            </div>
                            <div className="flex items-center space-x-1 text-green-600">
                                <Truck className="w-3 h-3" />
                                <span>Free ship</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartItem;
