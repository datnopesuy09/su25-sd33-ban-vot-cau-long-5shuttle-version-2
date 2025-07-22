import React, { useEffect, useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../../../Assets/logo.png';
import defaultAvatar from '../../../Assets/user_icon.png';
import { CartContext } from '../../../../pages/users/Cart/CartContext';
import { useUserAuth } from '../../../../contexts/userAuthContext';
import { ShoppingCart } from 'react-feather';
import {
    Avatar,
    Tooltip,
    Menu,
    MenuItem,
    IconButton,
    Typography,
    Box
} from '@mui/material';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import LogoutIcon from '@mui/icons-material/Logout';
import KeyIcon from '@mui/icons-material/Key';
import LoginIcon from '@mui/icons-material/Login';
import Swal from 'sweetalert2';

function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        return {};
    }
}

const Navbar = () => {
    const [menu, setMenu] = useState('trangchu');
    const [isScrolled, setIsScrolled] = useState(false);
    const [anchorElUser, setAnchorElUser] = useState(null);
    const { user, isLoggedIn, logoutUser } = useUserAuth();
    const [role, setRole] = useState('');
    const navigate = useNavigate();
    const { cartItemCount } = useContext(CartContext);

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

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100' : 'bg-white shadow-md'
            }`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">

                    <div className="flex items-center gap-3 group">
                        <div className="relative">
                            <img src={logo} alt="Logo" className="w-[100px] h-[50px] transition-transform duration-300 group-hover:scale-105" />
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
                                    className={`relative px-6 py-3 text-[15px] font-medium transition-all duration-300 rounded-xl group ${menu === item.key ? 'text-white bg-gradient-to-r from-[#2f19ae] to-purple-500 shadow-lg' : 'text-[#292929] hover:text-[#2f19ae] hover:bg-gray-50'
                                        }`}
                                >
                                    {item.label}
                                    <div className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 h-0.5 bg-gradient-to-r from-[#2f19ae] to-purple-400 transition-all duration-300 ${menu === item.key ? 'w-8' : 'w-0 group-hover:w-6'
                                        }`}></div>
                                </Link>
                            </li>
                        ))}
                    </ul>

                    <div className="flex items-center gap-6">
                        {/* Cart */}
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
                                {isLoggedIn ? ([
                                    <MenuItem key="profile" onClick={() => { setAnchorElUser(null); navigate('/profile/user'); }}>
                                        <ManageAccountsIcon sx={{ mr: 1 }} />
                                        <Typography textAlign="center">Tài khoản của tôi</Typography>
                                    </MenuItem>,
                                    // <MenuItem key="change-password" onClick={() => { setAnchorElUser(null); navigate(''); }}>
                                    //     <KeyIcon sx={{ mr: 1 }} />
                                    //     <Typography textAlign="center">Đổi mật khẩu</Typography>
                                    // </MenuItem>,
                                    <MenuItem key="logout" onClick={() => { setAnchorElUser(null); handleAccount(); }}>
                                        <LogoutIcon sx={{ mr: 1 }} />
                                        <Typography textAlign="center">Đăng xuất</Typography>
                                    </MenuItem>
                                ]) : (
                                    <MenuItem onClick={() => { setAnchorElUser(null); navigate('/login'); }}>
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
    );
};

export default Navbar;
