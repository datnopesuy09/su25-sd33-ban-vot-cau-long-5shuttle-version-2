// Cart.js
import React, { useState, useEffect, useContext } from 'react';
import CartItem from './CartItem';
import CartSummary from './CartSummary'; // Import CartSummary
import { Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import swal from 'sweetalert';
import { CartContext } from './CartContext';
import { X, Tag } from 'lucide-react';

import { ShoppingCart, ShoppingBag, AlertCircle, CheckCircle2, Loader2, Truck, Shield, Gift } from 'lucide-react';

const Cart = () => {
    const navigate = useNavigate();
    const [carts, setCarts] = useState([]);
    const [totalPrice, setTotalPrice] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const [notification, setNotification] = useState(null);
    const idTaiKhoan = 1;
    const { setCartItemCount } = useContext(CartContext);

    // Calculate shipping (free if over 1M VND)
    const shipping = totalPrice > 1000000 ? 0 : 30000;
    const finalTotal = totalPrice + shipping; // Không cần thay đổi

    useEffect(() => {
        fetchCart();
    }, []);

    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const fetchCart = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get(`http://localhost:8080/api/gio-hang/${idTaiKhoan}`);
            setCarts(res.data);
            const totalRes = await axios.get(`http://localhost:8080/api/gio-hang/${idTaiKhoan}/total`);
            setTotalPrice(totalRes.data);
        } catch (error) {
            console.error('Lỗi lấy giỏ hàng:', error);
            showNotification('Không thể tải giỏ hàng', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    

    const handleQuantityChange = async (cartId, newQuantity) => {
        try {
            await axios.put(`http://localhost:8080/api/gio-hang/${cartId}`, { soLuong: newQuantity });
            setCarts(carts.map((c) => (c.id === cartId ? { ...c, soLuong: newQuantity } : c)));
            const totalRes = await axios.get(`http://localhost:8080/api/gio-hang/${idTaiKhoan}/total`);
            setTotalPrice(totalRes.data);
            const countResponse = await axios.get(`http://localhost:8080/api/gio-hang/${idTaiKhoan}/count`);
            setCartItemCount(countResponse.data);
            showNotification('Đã cập nhật số lượng sản phẩm');
        } catch (error) {
            swal('Lỗi', 'Không thể cập nhật số lượng sản phẩm.', 'error');
            console.error(error);
        }
    };

    const handleDeleteCart = async (cartId) => {
        try {
            await axios.delete(`http://localhost:8080/api/gio-hang/${cartId}`);
            setCarts(carts.filter((c) => c.id !== cartId));
            const totalRes = await axios.get(`http://localhost:8080/api/gio-hang/${idTaiKhoan}/total`);
            setTotalPrice(totalRes.data);
            const countResponse = await axios.get(`http://localhost:8080/api/gio-hang/${idTaiKhoan}/count`);
            setCartItemCount(countResponse.data);
            swal('Thành công', 'Đã xóa sản phẩm khỏi giỏ hàng.', 'success');
        } catch (error) {
            swal('Lỗi', 'Không thể xóa sản phẩm.', 'error');
            console.error(error);
        }
    };

    

    const handleCheckout = async () => {
        setIsCheckingOut(true);
        try {
            // Add any pre-checkout validation here
            await new Promise((resolve) => setTimeout(resolve, 1000)); // Mock delay
            navigate('/gio-hang/checkout');
        } catch (error) {
            showNotification('Có lỗi xảy ra khi chuyển đến thanh toán', 'error');
            console.error(error);
        } finally {
            setIsCheckingOut(false);
        }
    };

    
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg">Đang tải giỏ hàng...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Notification */}
            {notification && (
                <div
                    className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center gap-2 transition-all duration-300 ${
                        notification.type === 'error' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
                    }`}
                >
                    {notification.type === 'error' ? (
                        <AlertCircle className="w-5 h-5" />
                    ) : (
                        <CheckCircle2 className="w-5 h-5" />
                    )}
                    {notification.message}
                </div>
            )}

            {/* Header */}
            <div className="bg-white shadow-sm border-b sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-3">
                            <ShoppingCart className="w-8 h-8 text-indigo-600" />
                            <h1 className="text-2xl font-bold text-gray-900">Giỏ hàng của bạn</h1>
                            {carts.length > 0 && (
                                <span className="bg-indigo-100 text-indigo-800 text-sm font-medium px-3 py-1 rounded-full">
                                    {carts.length} sản phẩm
                                </span>
                            )}
                        </div>
                        <button
                            onClick={() => navigate('/')}
                            className="text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-2"
                        >
                            <ShoppingBag className="w-5 h-5" />
                            Tiếp tục mua sắm
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {carts.length === 0 ? (
                    // Empty Cart State
                    <div className="text-center py-20">
                        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <ShoppingBag className="w-12 h-12 text-gray-400" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-800 mb-4">Giỏ hàng trống</h2>
                        <p className="text-gray-600 mb-8 max-w-md mx-auto">
                            Looks like you haven't added anything to your cart yet. Start shopping to fill it up!
                        </p>
                        <Button
                            variant="contained"
                            onClick={() => navigate('/')}
                            sx={{
                                padding: '12px 32px',
                                backgroundColor: '#4f46e5',
                                fontSize: '16px',
                                textTransform: 'none',
                                borderRadius: '8px',
                                '&:hover': { backgroundColor: '#4338ca' },
                            }}
                            startIcon={<ShoppingBag />}
                        >
                            Bắt đầu mua sắm
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Cart Items */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                                <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-blue-50">
                                    <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                                        <ShoppingCart className="w-6 h-6 text-indigo-600" />
                                        Sản phẩm trong giỏ ({carts.length})
                                    </h2>
                                </div>

                                <div className="p-6">
                                    <div className="space-y-6">
                                        {carts.map((cart) => (
                                            <div
                                                key={cart.id}
                                                className="p-4 border border-gray-100 rounded-xl hover:shadow-md transition-shadow duration-200"
                                            >
                                                <CartItem
                                                    cart={cart}
                                                    showButton={true}
                                                    onQuantityChange={handleQuantityChange}
                                                    onDeleteCart={handleDeleteCart}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Benefits Section */}
                            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-white p-4 rounded-xl border border-gray-200 text-center">
                                    <Truck className="w-8 h-8 text-green-500 mx-auto mb-2" />
                                    <h3 className="font-semibold text-gray-800 mb-1">Miễn phí vận chuyển</h3>
                                    <p className="text-sm text-gray-600">Đơn hàng từ 1.000.000đ</p>
                                </div>
                                <div className="bg-white p-4 rounded-xl border border-gray-200 text-center">
                                    <Shield className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                                    <h3 className="font-semibold text-gray-800 mb-1">Bảo hành chính hãng</h3>
                                    <p className="text-sm text-gray-600">Đổi trả trong 30 ngày</p>
                                </div>
                                <div className="bg-white p-4 rounded-xl border border-gray-200 text-center">
                                    <Gift className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                                    <h3 className="font-semibold text-gray-800 mb-1">Quà tặng hấp dẫn</h3>
                                    <p className="text-sm text-gray-600">Cho đơn hàng lớn</p>
                                </div>
                            </div>
                        </div>

                        {/* Order Summary */}
                        <CartSummary
                            carts={carts}
                            totalPrice={totalPrice}
                            shipping={shipping}
                            finalTotal={finalTotal}
                            handleCheckout={handleCheckout}
                            isCheckingOut={isCheckingOut}
                        />
                    </div>
                )}
            </div>

            
        </div>
    );
};

export default Cart;
