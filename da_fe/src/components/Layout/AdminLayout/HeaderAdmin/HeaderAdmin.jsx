import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Notifications } from '@mui/icons-material';
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
    "ROLE_ADMIN": "Admin",
    "ROLE_USER": "Người dùng",
    "ROLE_STAFF": "Nhân viên"
};

function HeaderAdmin() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [anchorElUser, setAnchorElUser] = useState(null);
    const { admin, role, logoutAdmin } = useAdminAuth();

    const [notifications] = useState([
        { id: 1, title: 'Đơn hàng mới', message: 'Có 3 đơn hàng mới cần xử lý', time: '5 phút trước', unread: true },
        { id: 2, title: 'Sản phẩm hết hàng', message: 'Sản phẩm ABC sắp hết hàng', time: '1 giờ trước', unread: true },
        {
            id: 3,
            title: 'Đánh giá mới',
            message: 'Có đánh giá 5 sao từ khách hàng',
            time: '2 giờ trước',
            unread: false,
        },
    ]);


    const menuRef = useRef(null);
    const notificationRef = useRef(null);
    const navigate = useNavigate();


    const unreadCount = notifications.filter((n) => n.unread).length;

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
        <header className="flex items-center justify-between w-full h-[70px] bg-white px-6 shadow-md">
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
                <div className="relative cursor-pointer">
                    <Notifications className="w-24 h-24 text-gray-600" />
                </div>

                {/* User Info */}
                <div className="flex items-center space-x-1 pr-5">
                    <div className="mr-4 text-center">
                        <p className="text-gray-800 text-base font-semibold">{admin?.hoTen || "..."}</p>
                        <p className="text-gray-500 text-sm">-<span className="mx-1">{roleMap[role] || role || ""}</span>-</p>
                    </div>
                    {/* avatar */}
                    <div>
                        <Tooltip title="Mở menu người dùng">
                            <IconButton onClick={(e) => setAnchorElUser(e.currentTarget)} sx={{ p: 0 }}>
                                <Avatar alt={admin?.hoTen || "Avatar"} src={admin?.avatar || defaultAvatar} />
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

                            <MenuItem key="change-password" onClick={() => { setAnchorElUser(null); navigate(''); }}>
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