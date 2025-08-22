import React, { useState, useEffect, useContext } from 'react';
import CartItem from './CartItem';
import CartSummary from './CartSummary';
import { Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import swal from 'sweetalert';
import { CartContext } from './CartContext';

import { X, Tag } from 'lucide-react';

import { ShoppingCart, ShoppingBag, AlertCircle, CheckCircle2, Loader2, Truck, Shield, Gift } from 'lucide-react';
import { useUserAuth } from '../../../contexts/userAuthContext';

function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map(function (c) {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                })
                .join(''),
        );
        return JSON.parse(jsonPayload);
    } catch (e) {
        return {};
    }
}


const Cart = () => {
    const navigate = useNavigate();
    const { user } = useUserAuth();
    const { setCartItemCount } = useContext(CartContext);
    const userId = user?.id;

    const [carts, setCarts] = useState([]);
    const [totalPrice, setTotalPrice] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isCheckingOut, setIsCheckingOut] = useState(false);

    // const [notification, setNotification] = useState(null);



    const token = user?.token || localStorage.getItem('userToken');
    const idTaiKhoan = user?.id || parseJwt(token)?.sub || parseJwt(token)?.id || localStorage.getItem('idKhachHang');

    console.log('id user: ', idTaiKhoan);
    // Calculate shipping (free if over 1M VND)


    const [selectedItems, setSelectedItems] = useState([]);
    const isAllSelected = carts.length > 0 && selectedItems.length === carts.length;


    const shipping = totalPrice > 1000000 ? 0 : 30000;
    const finalTotal = totalPrice + shipping;

    const handleSelectItem = (cartId) => {
        setSelectedItems((prev) =>
            prev.includes(cartId) ? prev.filter((id) => id !== cartId) : [...prev, cartId]
        );
    };

    const handleSelectAll = () => {
        setSelectedItems(isAllSelected ? [] : carts.map((item) => item.id));
    };
 console.log('Selected items cart:', selectedItems);
    useEffect(() => {
        const total = carts
            .filter((item) => selectedItems.includes(item.id))
            .reduce((sum, item) => {
                const price = item.sanPhamCT.giaKhuyenMai || item.sanPhamCT.donGia;
                return sum + price * item.soLuong;
            }, 0);
        setTotalPrice(total);
    }, [selectedItems, carts]);

    useEffect(() => {
        if (userId) {
            fetchCart(userId);
        }
    }, [userId]);

    const fetchCart = async (userId) => {
        setIsLoading(true);
        try {
            const res = await axios.get(`http://localhost:8080/api/gio-hang/${userId}`);
            setCarts(res.data || []);

            // const totalRes = await axios.get(`http://localhost:8080/api/gio-hang/${userId}/total`);
            // setTotalPrice(totalRes.data || 0);

            const countRes = await axios.get(`http://localhost:8080/api/gio-hang/${userId}/count`);
            setCartItemCount(countRes.data || 0);
        } catch (error) {
            console.error('Lỗi lấy giỏ hàng:', error);
            swal('Lỗi', 'Không thể tải giỏ hàng.', 'error');
            setCartItemCount(0);
        } finally {
            setIsLoading(false);
        }
    };

    const handleQuantityChange = async (cartId, newQuantity) => {
        try {
            await axios.put(`http://localhost:8080/api/gio-hang/${cartId}`, { soLuong: newQuantity });
            setCarts((prev) => prev.map((c) => (c.id === cartId ? { ...c, soLuong: newQuantity } : c)));

            const countRes = await axios.get(`http://localhost:8080/api/gio-hang/${userId}/count`);
            setCartItemCount(countRes.data || 0);
        } catch (error) {
            console.error('Không thể cập nhật số lượng sản phẩm.', error);
            swal('Lỗi', 'Không thể cập nhật số lượng sản phẩm.', 'error');
        }
    };

    const handleDeleteCart = async (cartId) => {
        try {
            await axios.delete(`http://localhost:8080/api/gio-hang/${cartId}`);
            setCarts((prev) => prev.filter((c) => c.id !== cartId));

            const countRes = await axios.get(`http://localhost:8080/api/gio-hang/${userId}/count`);
            setCartItemCount(countRes.data || 0);

            // swal('Thành công', 'Đã xóa sản phẩm khỏi giỏ hàng.', 'success');
        } catch (error) {
            swal('Lỗi', 'Không thể xóa sản phẩm.', 'error');
            console.error('Không thể xóa sản phẩm.', error);
        }
    };

    const handleCheckout = async () => {
        setIsCheckingOut(true);
        try {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            navigate('/gio-hang/checkout', { state: { selectedItems }});
        } catch (error) {
            console.error('Có lỗi xảy ra khi chuyển đến thanh toán', error);
            swal('Lỗi', 'Có lỗi xảy ra khi chuyển đến thanh toán', 'error');
        } finally {
            setIsCheckingOut(false);
        }
    };


    if (!userId) return null;


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
                            onClick={() => navigate('/san-pham')}
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
                    <div className="text-center py-20">
                        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <ShoppingBag className="w-12 h-12 text-gray-400" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-800 mb-4">Giỏ hàng trống</h2>
                        <p className="text-gray-600 mb-8 max-w-md mx-auto">
                            Bạn chưa thêm sản phẩm nào. Hãy bắt đầu mua sắm để lấp đầy giỏ hàng nhé!
                        </p>
                        <Button
                            variant="contained"
                            onClick={() => navigate('/san-pham')}
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
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                                <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-blue-50">
                                    <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                                        <ShoppingCart className="w-6 h-6 text-indigo-600" />
                                        Sản phẩm trong giỏ ({carts.length})
                                    </h2>
                                </div>
                                <div className="py-2 px-6 flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={isAllSelected}
                                        onChange={handleSelectAll}
                                        className="accent-indigo-600 w-5 h-5 mr-3"
                                    />
                                    <span className="text-gray-700 font-medium">Chọn tất cả</span>
                                </div>
                                <div className="p-2 space-y-6">
                                    {carts.map((cart) => (
                                        <div key={cart.id} className="p-4 border border-gray-100 rounded-xl hover:shadow-sm transition-shadow duration-200">
                                            <CartItem
                                                cart={cart}
                                                showButton={true}
                                                onQuantityChange={handleQuantityChange}
                                                onDeleteCart={handleDeleteCart}
                                                selected={selectedItems.includes(cart.id)}
                                                onSelect={() => handleSelectItem(cart.id)}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                                <InfoCard icon={<Truck />} title="Miễn phí vận chuyển" desc="Đơn hàng từ 1.000.000đ" />
                                <InfoCard icon={<Shield />} title="Bảo hành chính hãng" desc="Đổi trả trong 30 ngày" />
                                <InfoCard icon={<Gift />} title="Quà tặng hấp dẫn" desc="Cho đơn hàng lớn" />
                            </div>
                        </div>

                        <CartSummary
                            carts={carts.filter(item => selectedItems.includes(item.id))}
                            totalPrice={totalPrice}
                            shipping={shipping}
                            finalTotal={finalTotal}
                            handleCheckout={handleCheckout}
                            isCheckingOut={isCheckingOut}
                            selectedItems={selectedItems}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

const InfoCard = ({ icon, title, desc }) => (
    <div className="bg-white p-4 rounded-xl border border-gray-200 text-center">
        <div className="w-8 h-8 mx-auto mb-2 text-indigo-600">{icon}</div>
        <h3 className="font-semibold text-gray-800 mb-1">{title}</h3>
        <p className="text-sm text-gray-600">{desc}</p>
    </div>
);

export default Cart;
