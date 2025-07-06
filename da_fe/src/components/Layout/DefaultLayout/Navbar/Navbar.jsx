import React, { useEffect, useState, useRef, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../../../Assets/logo.png';
import user_icon from '../../../Assets/user_icon.png';
import { Avatar } from '@mui/material';
import { Edit, LogOut, LogIn, User, ShoppingCart, Menu, X } from 'react-feather';
import Swal from 'sweetalert2';
import { CartContext } from '../../../../pages/users/Cart/CartContext';

const Navbar = () => {
    const [menu, setMenu] = useState('trangchu');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const menuRef = useRef(null);
    const navigate = useNavigate();

    // 👉 Dữ liệu cứng giả lập user đăng nhập
    const isLoggedIn = true; // đổi thành false để mô phỏng người chưa đăng nhập
    const fakeUser = {
        username: 'Nguyễn Văn A',
        role: 'Customer', // hoặc 'Admin', 'User'
        avatar: user_icon,
    };

    const { cartItemCount } = useContext(CartContext);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        };

        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };

        document.addEventListener('mousedown', handleClickOutside);
        window.addEventListener('scroll', handleScroll);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            window.removeEventListener('scroll', handleScroll);
        };
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
        console.log('Đăng xuất thành công');
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
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
                isScrolled ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100' : 'bg-white shadow-md'
            }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    {/* Logo Section */}
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

                    {/* Desktop Navigation */}
                    <ul className="hidden lg:flex items-center gap-2">
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

                    {/* Right Section */}
                    <div className="flex items-center gap-6">
                        {/* Cart Icon */}
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

                        {/* User Menu */}
                        <div className="relative" ref={menuRef}>
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="flex items-center gap-2 p-2 rounded-xl transition-all duration-300 hover:bg-gradient-to-r hover:from-[#2f19ae]/10 hover:to-purple-500/10 hover:shadow-md group"
                            >
                                <Avatar
                                    src={fakeUser.avatar}
                                    alt="User Icon"
                                    className="w-8 h-8 ring-2 ring-transparent group-hover:ring-[#2f19ae]/30 transition-all duration-300"
                                />
                                {isLoggedIn && (
                                    <div className="hidden sm:flex flex-col items-start">
                                        <span className="text-sm font-medium text-gray-700 group-hover:text-[#2f19ae] transition-colors duration-300">
                                            {fakeUser.username}
                                        </span>
                                        <span className="text-xs text-gray-500">{fakeUser.role}</span>
                                    </div>
                                )}
                            </button>

                            {/* Dropdown Menu */}
                            {isMenuOpen && (
                                <div className="absolute right-0 mt-3 bg-white shadow-2xl rounded-2xl w-64 py-3 text-gray-700 z-50 border border-gray-100 animate-in slide-in-from-top-2 duration-200">
                                    <div className="absolute top-0 right-4 w-3 h-3 bg-white transform rotate-45 -translate-y-1/2 border-l border-t border-gray-100"></div>

                                    {isLoggedIn ? (
                                        <>
                                            <div className="px-4 py-3 border-b border-gray-100">
                                                <div className="flex items-center gap-3">
                                                    <Avatar src={fakeUser.avatar} className="w-10 h-10" />
                                                    <div>
                                                        <p className="font-semibold text-gray-800">
                                                            {fakeUser.username}
                                                        </p>
                                                        <p className="text-sm text-gray-500">{fakeUser.role}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {fakeUser.role === 'Customer' && (
                                                <li className="flex items-center px-4 py-3 hover:bg-gradient-to-r hover:from-[#2f19ae]/5 hover:to-purple-500/5 transition-all duration-200 group cursor-pointer">
                                                    <User className="h-5 w-5 text-gray-500 group-hover:text-[#2f19ae] transition-colors duration-200" />
                                                    <Link
                                                        to="/profile/user"
                                                        onClick={() => setIsMenuOpen(false)}
                                                        className="ml-3 text-gray-700 group-hover:text-[#2f19ae] font-medium transition-colors duration-200"
                                                    >
                                                        Tài khoản của tôi
                                                    </Link>
                                                </li>
                                            )}

                                            {(fakeUser.role === 'Admin' || fakeUser.role === 'User') && (
                                                <li className="flex items-center px-4 py-3 hover:bg-gradient-to-r hover:from-[#2f19ae]/5 hover:to-purple-500/5 transition-all duration-200 group cursor-pointer">
                                                    <Edit className="w-5 h-5 text-gray-500 group-hover:text-[#2f19ae] transition-colors duration-200" />
                                                    <Link
                                                        to="/admin"
                                                        onClick={() => setIsMenuOpen(false)}
                                                        className="ml-3 text-gray-700 group-hover:text-[#2f19ae] font-medium transition-colors duration-200"
                                                    >
                                                        Trang quản lý
                                                    </Link>
                                                </li>
                                            )}

                                            <li className="flex items-center px-4 py-3 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 transition-all duration-200 group cursor-pointer border-t border-gray-100 mt-2">
                                                <LogOut className="w-5 h-5 text-gray-500 group-hover:text-red-500 transition-colors duration-200" />
                                                <button
                                                    onClick={handleAccount}
                                                    className="ml-3 text-gray-700 group-hover:text-red-500 font-medium transition-colors duration-200"
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

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="lg:hidden p-2 rounded-xl transition-all duration-300 hover:bg-gradient-to-r hover:from-[#2f19ae]/10 hover:to-purple-500/10"
                        >
                            {isMobileMenuOpen ? (
                                <X className="w-6 h-6 text-gray-700" />
                            ) : (
                                <Menu className="w-6 h-6 text-gray-700" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {isMobileMenuOpen && (
                    <div className="lg:hidden pb-4 animate-in slide-in-from-top-2 duration-200">
                        <div className="bg-gradient-to-r from-gray-50 to-purple-50 rounded-2xl p-4 mt-4">
                            {navItems.map((item) => (
                                <Link
                                    key={item.key}
                                    to={item.path}
                                    onClick={() => {
                                        setMenu(item.key);
                                        setIsMobileMenuOpen(false);
                                    }}
                                    className={`block px-4 py-3 text-[15px] font-medium transition-all duration-300 rounded-xl mb-2 ${
                                        menu === item.key
                                            ? 'text-white bg-gradient-to-r from-[#2f19ae] to-purple-500 shadow-md'
                                            : 'text-[#292929] hover:text-[#2f19ae] hover:bg-white/50'
                                    }`}
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
