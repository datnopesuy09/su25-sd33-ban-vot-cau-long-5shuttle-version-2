import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { Bell, Settings, Moon, Sun } from 'react-feather';
import user_icon from '../../../Assets/user_icon.png';

import { Search, Notifications } from '@mui/icons-material';

import { Avatar } from '@mui/material';
import { LogOut, LogIn, User, Shield, Activity } from 'react-feather';
import Swal from 'sweetalert2';
import defaultAvatar from '../../../Assets/user_icon.png';

function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        return {};
    }
}

function HeaderAdmin() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(true);
    const [userRole, setUserRole] = useState('Admin');
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [user, setUser] = useState(null);
    const [role, setRole] = useState('');

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


    useEffect(() => {
        const token = localStorage.getItem("token");
        console.log(token)
        if (token) {
            fetch("http://localhost:8080/users/myInfo", {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
            })
                .then(res => {
                    if (!res.ok) throw new Error("Không thể lấy thông tin người dùng");
                    return res.json();
                })
                .then(data => {
                    setUser(data.result);
                    setIsLoggedIn(true);
                })
                .catch(err => {
                    console.error(err);
                    setIsLoggedIn(false);
                });


            let decoded;
            try {
                decoded = parseJwt(token);
                setRole(decoded.scope);
            } catch (e) {
                setRole("");
            }
        }
}, []);


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
        localStorage.removeItem("token");
        setIsLoggedIn(false);
        setUser(null);
        navigate('/');
    };
    const roleMap = {
        "ROLE_Admin": "Admin",
        "ROLE_USER": "Người dùng",
        "ROLE_Staff": "Nhân viên"
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
                        <p className="text-gray-800 text-base font-semibold">{user?.hoTen || "..."}</p>
                        <p className="text-gray-500 text-sm">-<span className="mx-1">{roleMap[role] || role || ""}</span>-</p>
                    </div>

                    <div className='relative'>
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="relative">
<Avatar src={user?.avatar || defaultAvatar} alt="avatar" className="w-10 h-8" />
                            {isMenuOpen && (
                                <ul className="absolute right-0 mt-2 bg-white shadow-lg rounded-md w-48 py-2 text-gray-700 z-50" ref={menuRef}>
                                    {isLoggedIn ? (
                                        <>
                                            <li className="flex px-4 py-2 hover:bg-gray-100 space-x-3">
                                                <User className='h-5 w-5' />
                                                <Link to="/profile/user" onClick={() => setIsMenuOpen(false)}>Tài khoản của tôi</Link>
                                            </li>
                                            <li className="flex px-4 py-2 hover:bg-gray-100 space-x-3">
                                                <LogOut className='w-5 h-5' />
                                                <button onClick={handleAccount}>Đăng xuất</button>
                                            </li>
                                        </>
                                    ) : (
                                        <li className="flex px-4 py-2 hover:bg-gray-100 space-x-3">
                                            <LogIn className='w-5 h-5' />
                                            <Link to="/admin/login" onClick={() => setIsMenuOpen(false)}>Đăng nhập</Link>
                                        </li>
                                    )}
                                </ul>
                            )}

                        </button>

                        {/* User Dropdown Menu */}
                        {isMenuOpen && (
                            <div className="absolute right-0 mt-3 bg-white shadow-2xl rounded-2xl w-72 py-3 text-gray-700 z-50 border border-gray-100 animate-in slide-in-from-top-2 duration-200">
                                <div className="absolute top-0 right-4 w-3 h-3 bg-white transform rotate-45 -translate-y-1/2 border-l border-t border-gray-100"></div>

                                {/* User Info Header */}
                                <div className="px-4 py-4 border-b border-gray-100">
                                    <div className="flex items-center space-x-3">
                                        <Avatar src={admin.avatar} className="w-12 h-12" />
                                        <div className="flex-1">
                                            <p className="font-semibold text-gray-800">{admin.hoTen}</p>
                                            <p className="text-sm text-gray-500">{admin.email}</p>
                                            <div className="flex items-center space-x-1 mt-1">
                                                <Shield className="w-3 h-3 text-[#2f19ae]" />
                                                <span className="text-xs text-[#2f19ae] font-medium">
{admin.vaiTro}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {isLoggedIn ? (
                                    <>
                                        {userRole === 'Admin' && (
                                            <li className="flex items-center px-4 py-3 hover:bg-gradient-to-r hover:from-[#2f19ae]/5 hover:to-purple-500/5 transition-all duration-200 group cursor-pointer">
                                                <User className="h-5 w-5 text-gray-500 group-hover:text-[#2f19ae] transition-colors duration-200" />
                                                <Link
                                                    to="/profile/user"
                                                    onClick={() => setIsMenuOpen(false)}
                                                    className="ml-3 text-gray-700 group-hover:text-[#2f19ae] font-medium transition-colors duration-200 flex-1"
                                                >
                                                    Tài khoản của tôi
                                                </Link>
                                            </li>
                                        )}

                                        <li className="flex items-center px-4 py-3 hover:bg-gradient-to-r hover:from-[#2f19ae]/5 hover:to-purple-500/5 transition-all duration-200 group cursor-pointer">
                                            <Settings className="h-5 w-5 text-gray-500 group-hover:text-[#2f19ae] transition-colors duration-200" />
                                            <span className="ml-3 text-gray-700 group-hover:text-[#2f19ae] font-medium transition-colors duration-200">
                                                Cài đặt
                                            </span>
                                        </li>

                                        <li className="flex items-center px-4 py-3 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 transition-all duration-200 group cursor-pointer border-t border-gray-100 mt-2">
                                            <LogOut className="w-5 h-5 text-gray-500 group-hover:text-red-500 transition-colors duration-200" />
                                            <button
                                                onClick={handleAccount}
                                                className="ml-3 text-gray-700 group-hover:text-red-500 font-medium transition-colors duration-200 flex-1 text-left"
                                            >
                                                Đăng xuất
                                            </button>
                                        </li>
                                    </>
) : (
                                    <li className="flex items-center px-4 py-3 hover:bg-gradient-to-r hover:from-[#2f19ae]/5 hover:to-purple-500/5 transition-all duration-200 group cursor-pointer">
                                        <LogIn className="w-5 h-5 text-gray-500 group-hover:text-[#2f19ae] transition-colors duration-200" />
                                        <Link
                                            to="/login"
                                            onClick={() => setIsMenuOpen(false)}
                                            className="ml-3 text-gray-700 group-hover:text-[#2f19ae] font-medium transition-colors duration-200"
                                        >
                                            Đăng nhập
                                        </Link>
                                    </li>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}

export default HeaderAdmin;