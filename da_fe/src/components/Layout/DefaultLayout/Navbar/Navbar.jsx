import React, { useEffect, useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../../../Assets/logo.png';
import defaultAvatar from '../../../Assets/user_icon.png';
import { CartContext } from '../../../../pages/users/Cart/CartContext';
import { useUserAuth } from '../../../../contexts/userAuthContext';
import { ShoppingCart, Bell, X, Check, Clock, AlertCircle } from 'react-feather';
import { Avatar, Tooltip, Menu, MenuItem, IconButton, Typography, Box } from '@mui/material';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import LogoutIcon from '@mui/icons-material/Logout';
import LoginIcon from '@mui/icons-material/Login';
import axios from 'axios';
import Swal from 'sweetalert2';

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

const Navbar = () => {
    const [menu, setMenu] = useState('trangchu');
    const [isScrolled, setIsScrolled] = useState(false);
    const [anchorElUser, setAnchorElUser] = useState(null);
    const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false);
    const { user, isLoggedIn, logoutUser } = useUserAuth();
    const navigate = useNavigate();
    const { cartItemCount } = useContext(CartContext);
    const [notificationCount, setNotificationCount] = useState(0);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    // const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

    useEffect(() => {
        const fetchNotifications = async () => {
            setLoading(true);

            // Lấy token ưu tiên từ user (nếu có), nếu không thì lấy từ localStorage
            const token = user?.token || localStorage.getItem('userToken');

            // Nếu chưa đăng nhập hoặc chưa có token thì clear và return
            if (!isLoggedIn || !token) {
                setNotifications([]);
                setNotificationCount(0);
                setLoading(false);
                return;
            }

            try {
                // Lấy id khách hàng: ưu tiên user.id (nếu fetchUserInfo trả về),
                // nếu không có thì decode token (nếu backend để id trong payload.sub hoặc payload.id)
                const idKhachHang = user?.id || parseJwt(token)?.sub || parseJwt(token)?.id;
                if (!idKhachHang) {
                    console.warn('Không tìm thấy id khách hàng (user.id và token payload đều không có).');
                    setNotifications([]);
                    setNotificationCount(0);
                    setLoading(false);
                    return;
                }

                const response = await axios.get(`http://localhost:8080/api/thong-bao/khach-hang/${idKhachHang}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                // tuỳ API của bạn, có thể response.data hoặc response.data.result
                setNotifications(response.data || []);
                setNotificationCount((response.data || []).filter((n) => n.trangThai === 0).length);
            } catch (error) {
                console.error('Lỗi khi lấy thông báo:', error);
                setNotifications([]);
                setNotificationCount(0);
                Swal.fire({
                    icon: 'error',
                    title: 'Lỗi',
                    text: 'Không thể tải thông báo. Vui lòng thử lại sau.',
                    confirmButtonColor: '#2f19ae',
                });
            } finally {
                setLoading(false);
            }
        };

        // Gọi nếu đã login (đây vẫn an toàn vì bên trong đã kiểm tra token)
        if (isLoggedIn) {
            fetchNotifications();
        }
    }, [isLoggedIn, user]);

    const handleNotificationClick = () => {
        setNotificationDropdownOpen(!notificationDropdownOpen);
        setNotificationCount(0); // Reset số lượng thông báo
    };

    const handleNotificationClose = () => {
        setNotificationDropdownOpen(false);
    };

    const handleMarkAsRead = async (notificationId) => {
        try {
            await axios.put(
                `http://localhost:8080/api/thong-bao/${notificationId}`,
                { trangThai: 1 },
                {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                    },
                },
            );

            setNotifications((prev) =>
                prev.map((notification) =>
                    notification.id === notificationId ? { ...notification, trangThai: 1 } : notification,
                ),
            );
        } catch (error) {
            console.error('Lỗi khi đánh dấu thông báo đã đọc:', error);
            Swal.fire({
                icon: 'error',
                title: 'Lỗi',
                text: 'Không thể đánh dấu thông báo đã đọc. Vui lòng thử lại.',
                confirmButtonColor: '#2f19ae',
            });
        }
    };

    const formatTimeAgo = (timestamp) => {
        const now = new Date();
        const notificationTime = new Date(timestamp);
        const diffInMinutes = Math.floor((now - notificationTime) / (1000 * 60));

        if (diffInMinutes < 1) return 'Vừa xong';
        if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} giờ trước`;
        return `${Math.floor(diffInMinutes / 1440)} ngày trước`;
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'success':
                return <Check className="w-5 h-5 text-green-500" />;
            case 'warning':
                return <AlertCircle className="w-5 h-5 text-yellow-500" />;
            case 'info':
            default:
                return <Bell className="w-5 h-5 text-blue-500" />;
        }
    };

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleAccount = () => {
        Swal.fire({
            title: 'Xác nhận đăng xuất tài khoản?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#2f19ae',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Đăng xuất',
            cancelButtonText: 'Hủy',
            customClass: {
                popup: 'rounded-xl',
                confirmButton: 'rounded-lg px-6 py-2',
                cancelButton: 'rounded-lg px-6 py-2',
            },
        }).then((result) => {
            if (result.isConfirmed) {
                handleConfirm();
            }
        });
    };

    const handleConfirm = () => {
        logoutUser();
        navigate('/');
    };

    const navItems = [
        { key: 'trangchu', label: 'Trang chủ', path: '/' },
        { key: 'sanpham', label: 'Sản phẩm', path: '/san-pham' },
        { key: 'gioithieu', label: 'Giới thiệu', path: '/gioi-thieu' },
        { key: 'tintuc', label: 'Tin tức', path: '/tin-tuc' },
        { key: 'lienhe', label: 'Liên hệ', path: '/lien-he' },
    ];

    console.log('user: ', user);
    console.log('dữ liệu thông báo: ', notifications);
    return (
        <>
            <nav
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
                    isScrolled
                        ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100'
                        : 'bg-white shadow-md'
                }`}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        <div className="flex items-center gap-3 group">
                            <div className="relative">
                                <img
                                    src={logo}
                                    alt="Logo"
                                    className="w-[100px] h-[50px] transition-transform duration-300 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-r from-[#2f19ae]/20 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </div>
                            <div className="flex flex-col">
                                <p className="text-[#171717] text-3xl font-bold tracking-tight">5Shuttle</p>
                                <div className="h-1 bg-gradient-to-r from-[#2f19ae] to-purple-400 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                            </div>
                        </div>

                        <ul className="flex items-center gap-2">
                            {navItems.map((item) => (
                                <li key={item.key} className="relative">
                                    <Link
                                        to={item.path}
                                        onClick={() => setMenu(item.key)}
                                        className={`relative px-6 py-3 text-[15px] font-medium transition-all duration-300 rounded-xl group ${
                                            menu === item.key
                                                ? 'text-white bg-gradient-to-r from-[#2f19ae] to-purple-500 shadow-lg'
                                                : 'text-[#292929] hover:text-[#2f19ae] hover:bg-gray-50'
                                        }`}
                                    >
                                        {item.label}
                                        <div
                                            className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 h-0.5 bg-gradient-to-r from-[#2f19ae] to-purple-400 transition-all duration-300 ${
                                                menu === item.key ? 'w-8' : 'w-0 group-hover:w-6'
                                            }`}
                                        ></div>
                                    </Link>
                                </li>
                            ))}
                        </ul>

                        <div className="flex items-center gap-6">
                            <div className="relative group">
                                <div
                                    className="cursor-pointer p-3 rounded-xl transition-all duration-300 hover:bg-gradient-to-r hover:from-[#2f19ae]/10 hover:to-purple-500/10 hover:shadow-md"
                                    onClick={handleNotificationClick}
                                >
                                    <Bell className="w-6 h-6 text-gray-700 group-hover:text-[#2f19ae] transition-colors duration-300" />
                                    {notificationCount > 0 && (
                                        <div className="absolute -top-1 -right-1 min-w-[20px] h-5 flex items-center justify-center rounded-full text-xs bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold animate-pulse">
                                            {notificationCount > 99 ? '99+' : notificationCount}
                                        </div>
                                    )}
                                </div>
                                {notificationDropdownOpen && (
                                    <>
                                        <div className="fixed inset-0 z-10" onClick={handleNotificationClose}></div>
                                        <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 z-20 max-h-[500px] flex flex-col animate-in slide-in-from-top-2 duration-200">
                                            <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gradient-to-r from-[#2f19ae] to-purple-500 rounded-t-2xl">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-white/20 rounded-xl">
                                                        <Bell className="w-4 h-4 text-white" />
                                                    </div>
                                                    <h3 className="text-base font-semibold text-white">Thông báo</h3>
                                                </div>
                                                <button
                                                    onClick={handleNotificationClose}
                                                    className="p-1 hover:bg-white/20 rounded-lg transition-colors duration-200"
                                                >
                                                    <X className="w-4 h-4 text-white" />
                                                </button>
                                            </div>
                                            <div className="flex-1 overflow-y-auto">
                                                {loading ? (
                                                    <div className="flex items-center justify-center py-8">
                                                        <div className="flex flex-col items-center gap-3">
                                                            <div className="w-6 h-6 border-2 border-[#2f19ae] border-t-transparent rounded-full animate-spin"></div>
                                                            <p className="text-gray-500 text-sm">Đang tải...</p>
                                                        </div>
                                                    </div>
                                                ) : notifications.length > 0 ? (
                                                    <div className="divide-y divide-gray-100">
                                                        {notifications.slice(0, 10).map((notification) => (
                                                            <div
                                                                key={notification.id}
                                                                className={`p-4 hover:bg-gray-50 transition-colors duration-200 cursor-pointer ${
                                                                    notification.trangThai === 0 ? 'bg-blue-50/50' : ''
                                                                }`}
                                                                onClick={() => {
                                                                    if (notification.trangThai === 0) {
                                                                        handleMarkAsRead(notification.id);
                                                                    }
                                                                    if (notification.idRedirect) {
                                                                        navigate(notification.idRedirect);
                                                                        handleNotificationClose();
                                                                    }
                                                                }}
                                                            >
                                                                <div className="flex gap-3">
                                                                    <div className="flex-shrink-0 pt-1">
                                                                        {getNotificationIcon(notification.kieuThongBao)}
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <div className="flex items-start justify-between gap-2">
                                                                            <h4
                                                                                className={`text-sm font-medium text-gray-900 line-clamp-1 ${
                                                                                    notification.trangThai === 0
                                                                                        ? 'font-semibold'
                                                                                        : ''
                                                                                }`}
                                                                            >
                                                                                {notification.tieuDe}
                                                                            </h4>
                                                                            {notification.trangThai === 0 && (
                                                                                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1"></div>
                                                                            )}
                                                                        </div>
                                                                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                                                            {notification.noiDung}
                                                                        </p>
                                                                        <div className="flex items-center gap-2 mt-2">
                                                                            <Clock className="w-3 h-3 text-gray-400" />
                                                                            <span className="text-xs text-gray-400">
                                                                                {formatTimeAgo(
                                                                                    notification.createdAt ||
                                                                                        new Date(),
                                                                                )}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col items-center justify-center py-8">
                                                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                                                            <Bell className="w-6 h-6 text-gray-400" />
                                                        </div>
                                                        <h4 className="text-gray-700 font-medium mb-1 text-sm">
                                                            Không có thông báo
                                                        </h4>
                                                        <p className="text-gray-500 text-xs text-center">
                                                            Bạn sẽ nhận được thông báo khi có cập nhật mới
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                            {notifications.length > 0 && (
                                                <div className="border-t border-gray-100 p-3">
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => {
                                                                notifications.forEach((notification) => {
                                                                    if (notification.trangThai === 0) {
                                                                        handleMarkAsRead(notification.id);
                                                                    }
                                                                });
                                                            }}
                                                            className="flex-1 py-2 px-3 text-xs font-medium text-[#2f19ae] hover:bg-[#2f19ae]/5 rounded-lg transition-colors duration-200"
                                                        >
                                                            Đánh dấu tất cả đã đọc
                                                        </button>
                                                        {notifications.length > 10 && (
                                                            <button
                                                                onClick={() => {
                                                                    navigate('/notifications');
                                                                    handleNotificationClose();
                                                                }}
                                                                className="flex-1 py-2 px-3 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                                                            >
                                                                Xem tất cả
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                            <Link to="/gio-hang" className="group">
                                <div className="relative p-3 rounded-xl transition-all duration-300 hover:bg-gradient-to-r hover:from-[#2f19ae]/10 hover:to-purple-500/10 hover:shadow-md">
                                    <ShoppingCart className="w-6 h-6 text-gray-700 group-hover:text-[#2f19ae] transition-colors duration-300" />
                                    {cartItemCount > 0 && (
                                        <div className="absolute -top-1 -right-1 min-w-[20px] h-5 flex items-center justify-center rounded-full text-xs bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold animate-pulse">
                                            {cartItemCount > 99 ? '99+' : cartItemCount}
                                        </div>
                                    )}
                                </div>
                            </Link>
                            <div className="flex items-center gap-2">
                                <Tooltip title="Tùy chọn tài khoản">
                                    <IconButton onClick={(e) => setAnchorElUser(e.currentTarget)} sx={{ p: 0 }}>
                                        <Avatar src={user?.avatar || defaultAvatar} alt="avatar" />
                                    </IconButton>
                                </Tooltip>
                                <Menu
                                    sx={{ mt: '45px' }}
                                    anchorEl={anchorElUser}
                                    anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                                    keepMounted
                                    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                                    open={Boolean(anchorElUser)}
                                    onClose={() => setAnchorElUser(null)}
                                >
                                    {isLoggedIn ? (
                                        [
                                            <MenuItem
                                                key="profile"
                                                onClick={() => {
                                                    setAnchorElUser(null);
                                                    navigate('/profile/user');
                                                }}
                                            >
                                                <ManageAccountsIcon sx={{ mr: 1 }} />
                                                <Typography textAlign="center">Tài khoản của tôi</Typography>
                                            </MenuItem>,
                                            <MenuItem
                                                key="logout"
                                                onClick={() => {
                                                    setAnchorElUser(null);
                                                    handleAccount();
                                                }}
                                            >
                                                <LogoutIcon sx={{ mr: 1 }} />
                                                <Typography textAlign="center">Đăng xuất</Typography>
                                            </MenuItem>,
                                        ]
                                    ) : (
                                        <MenuItem
                                            onClick={() => {
                                                setAnchorElUser(null);
                                                navigate('/login');
                                            }}
                                        >
                                            <LoginIcon sx={{ mr: 1 }} />
                                            <Typography textAlign="center">Đăng nhập</Typography>
                                        </MenuItem>
                                    )}
                                </Menu>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
        </>
    );
};

export default Navbar;
