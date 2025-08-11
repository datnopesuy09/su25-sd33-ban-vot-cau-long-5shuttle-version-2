import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Notifications, Close, CheckCircle, Warning, Info, AccessTime } from '@mui/icons-material';
import { Avatar, Tooltip, MenuItem, Menu, Typography, IconButton } from '@mui/material';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import LogoutIcon from '@mui/icons-material/Logout';
import KeyIcon from '@mui/icons-material/Key';
import Swal from 'sweetalert2';
import defaultAvatar from '../../../Assets/user_icon.png';
import { useAdminAuth } from '../../../../contexts/adminAuthContext';
import { useRef } from 'react';
import { useEffect } from 'react';

const roleMap = {
    ROLE_ADMIN: 'Admin',
    ROLE_USER: 'Người dùng',
    ROLE_STAFF: 'Nhân viên',
};

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

function HeaderAdmin() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [anchorElUser, setAnchorElUser] = useState(null);
    const { admin, role, logoutAdmin } = useAdminAuth();

    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    const menuRef = useRef(null);
    const notificationRef = useRef(null);
    const navigate = useNavigate();

    const unreadCount = notifications.filter((n) => n.trangThai === 0).length;

    // Fetch notifications from API
    useEffect(() => {
        const fetchNotifications = async () => {
            // Lấy token ưu tiên từ user (nếu có), nếu không thì lấy từ localStorage
            const token = admin?.token || localStorage.getItem('userToken');
            try {
                setLoading(true);
                const idKhachHang = admin?.id || parseJwt(token)?.sub || parseJwt(token)?.id;
                const response = await fetch(`http://localhost:8080/api/thong-bao/khach-hang/${idKhachHang}`, {
                    headers: {
                        'Content-Type': 'application/json',
                        // Nếu cần token xác thực cho admin, thêm vào đây
                        // 'Authorization': `Bearer ${admin.token}`
                    },
                });
                if (!response.ok) {
                    throw new Error('Lỗi khi lấy thông báo');
                }
                const data = await response.json();
                setNotifications(data);
            } catch (error) {
                console.error('Lỗi khi lấy thông báo:', error);
                setNotifications([]);
            } finally {
                setLoading(false);
            }
        };

        // Chỉ fetch khi có admin đăng nhập
        if (admin) {
            fetchNotifications();
        }
    }, [admin]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setIsNotificationOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleNotificationClick = () => {
        setIsNotificationOpen(!isNotificationOpen);
        // Reset số lượng thông báo chưa đọc khi mở dropdown
        // (Tùy chọn) Có thể gọi API để đánh dấu tất cả thông báo đã được xem
    };

    const handleNotificationClose = () => {
        setIsNotificationOpen(false);
    };

    const handleMarkAsRead = async (notificationId) => {
        try {
            // Gọi API để đánh dấu thông báo đã đọc
            await fetch(`http://localhost:8080/api/thong-bao/${notificationId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    // Nếu cần token xác thực cho admin, thêm vào đây
                    // 'Authorization': `Bearer ${admin.token}`
                },
                body: JSON.stringify({ trangThai: 1 }),
            });

            // Cập nhật state local
            setNotifications((prev) =>
                prev.map((notification) =>
                    notification.id === notificationId ? { ...notification, trangThai: 1 } : notification,
                ),
            );
        } catch (error) {
            console.error('Lỗi khi đánh dấu thông báo đã đọc:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            // Gọi API để đánh dấu tất cả thông báo đã đọc
            const unreadNotifications = notifications.filter((n) => n.trangThai === 0);

            await Promise.all(
                unreadNotifications.map((notification) =>
                    fetch(`http://localhost:8080/api/thong-bao/${notification.id}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            // Nếu cần token xác thực cho admin, thêm vào đây
                            // 'Authorization': `Bearer ${admin.token}`
                        },
                        body: JSON.stringify({ trangThai: 1 }),
                    }),
                ),
            );

            // Cập nhật state local
            setNotifications((prev) => prev.map((notification) => ({ ...notification, trangThai: 1 })));
        } catch (error) {
            console.error('Lỗi khi đánh dấu tất cả thông báo đã đọc:', error);
        }
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'success':
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'warning':
                return <Warning className="w-5 h-5 text-yellow-500" />;
            case 'info':
            default:
                return <Info className="w-5 h-5 text-blue-500" />;
        }
    };

    const formatTimeAgo = (timestamp) => {
        if (!timestamp) return 'Vừa xong';

        const now = new Date();
        const notificationTime = new Date(timestamp);
        const diffInMinutes = Math.floor((now - notificationTime) / (1000 * 60));

        if (diffInMinutes < 1) return 'Vừa xong';
        if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} giờ trước`;
        return `${Math.floor(diffInMinutes / 1440)} ngày trước`;
    };

    const handleAccount = () => {
        Swal.fire({
            title: 'Xác nhận đăng xuất tài khoản?',
            text: 'Bạn sẽ cần đăng nhập lại để tiếp tục sử dụng',
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
        logoutAdmin();
        navigate('/admin/login');
    };

    return (
        <header className="flex items-center justify-between w-full h-[70px] bg-white px-6 shadow-md relative">
            {/* Search Input */}
            <div className="flex items-center bg-gray-100 rounded-lg p-2 w-1/3">
                <Search className="text-gray-500" />
                <input
                    type="text"
                    placeholder="Search..."
                    className="ml-2 w-full bg-transparent outline-none text-gray-700"
                />
            </div>

            {/* Notification Bell & User Info */}
            <div className="flex items-center space-x-5">
                {/* Notification Bell */}
                <div className="relative" ref={notificationRef}>
                    <div
                        className="cursor-pointer p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                        onClick={handleNotificationClick}
                    >
                        <Notifications className="w-6 h-6 text-gray-600 hover:text-[#2f19ae] transition-colors duration-200" />
                        {unreadCount > 0 && (
                            <div className="absolute -top-1 -right-1 min-w-[20px] h-5 flex items-center justify-center rounded-full text-xs bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold animate-pulse">
                                {unreadCount > 99 ? '99+' : unreadCount}
                            </div>
                        )}
                    </div>

                    {/* Notification Dropdown */}
                    {isNotificationOpen && (
                        <>
                            {/* Backdrop để đóng dropdown khi click ra ngoài */}
                            <div className="fixed inset-0 z-10" onClick={handleNotificationClose}></div>

                            {/* Dropdown content */}
                            <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 z-20 max-h-[500px] flex flex-col animate-in slide-in-from-top-2 duration-200">
                                {/* Header */}
                                <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gradient-to-r from-[#2f19ae] to-purple-500 rounded-t-2xl">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white/20 rounded-xl">
                                            <Notifications className="w-4 h-4 text-white" />
                                        </div>
                                        <h3 className="text-base font-semibold text-white">Thông báo quản trị</h3>
                                    </div>
                                    <button
                                        onClick={handleNotificationClose}
                                        className="p-1 hover:bg-white/20 rounded-lg transition-colors duration-200"
                                    >
                                        <Close className="w-4 h-4 text-white" />
                                    </button>
                                </div>

                                {/* Content */}
                                <div className="flex-1 overflow-y-auto">
                                    {loading ? (
                                        <div className="flex items-center justify-center py-8">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="w-6 h-6 border-2 border-[#2f19ae] border-t-transparent rounded-full animate-spin"></div>
                                                <p className="text-gray-500 text-sm">Đang tải thông báo...</p>
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
                                                            {getNotificationIcon(notification.loai || 'info')}
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
                                                                <AccessTime className="w-3 h-3 text-gray-400" />
                                                                <span className="text-xs text-gray-400">
                                                                    {formatTimeAgo(notification.createdAt)}
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
                                                <Notifications className="w-6 h-6 text-gray-400" />
                                            </div>
                                            <h4 className="text-gray-700 font-medium mb-1 text-sm">
                                                Không có thông báo
                                            </h4>
                                            <p className="text-gray-500 text-xs text-center">
                                                Bạn sẽ nhận được thông báo khi có hoạt động mới
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Footer */}
                                {notifications.length > 0 && (
                                    <div className="border-t border-gray-100 p-3">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={handleMarkAllAsRead}
                                                className="flex-1 py-2 px-3 text-xs font-medium text-[#2f19ae] hover:bg-[#2f19ae]/5 rounded-lg transition-colors duration-200"
                                            >
                                                Đánh dấu tất cả đã đọc
                                            </button>
                                            <button
                                                onClick={() => {
                                                    // Navigate to full notifications page
                                                    navigate('/admin/thong-bao');
                                                    handleNotificationClose();
                                                }}
                                                className="flex-1 py-2 px-3 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                                            >
                                                Xem tất cả
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>

                {/* User Info */}
                <div className="flex items-center space-x-1 pr-5">
                    <div className="mr-4 text-center">
                        <p className="text-gray-800 text-base font-semibold">{admin?.hoTen || '...'}</p>
                        <p className="text-gray-500 text-sm">
                            -<span className="mx-1">{roleMap[role] || role || ''}</span>-
                        </p>
                    </div>
                    {/* avatar */}
                    <div>
                        <Tooltip title="Mở menu người dùng">
                            <IconButton onClick={(e) => setAnchorElUser(e.currentTarget)} sx={{ p: 0 }}>
                                <Avatar alt={admin?.hoTen || 'Avatar'} src={admin?.avatar || defaultAvatar} />
                            </IconButton>
                        </Tooltip>
                        <Menu
                            sx={{ mt: '45px' }}
                            anchorEl={anchorElUser}
                            anchorOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            keepMounted
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            open={Boolean(anchorElUser)}
                            onClose={() => setAnchorElUser(null)}
                        >
                            <MenuItem
                                onClick={() => {
                                    setAnchorElUser(null);
                                    navigate('/admin/tai-khoan-ca-nhan');
                                }}
                                sx={{ display: 'flex', alignItems: 'center' }}
                            >
                                <ManageAccountsIcon sx={{ mr: 1 }} />
                                <Typography textAlign="center">Tài khoản của tôi</Typography>
                            </MenuItem>

                            <MenuItem
                                key="change-password"
                                onClick={() => {
                                    setAnchorElUser(null);
                                    navigate('');
                                }}
                            >
                                <KeyIcon sx={{ mr: 1 }} />
                                <Typography textAlign="center">Đổi mật khẩu</Typography>
                            </MenuItem>

                            <MenuItem
                                onClick={() => {
                                    setAnchorElUser(null);
                                    handleAccount();
                                }}
                                sx={{ display: 'flex', alignItems: 'center' }}
                            >
                                <LogoutIcon sx={{ mr: 1 }} />
                                <Typography textAlign="center">Đăng xuất</Typography>
                            </MenuItem>
                        </Menu>
                    </div>
                </div>
            </div>
        </header>
    );
}

export default HeaderAdmin;
