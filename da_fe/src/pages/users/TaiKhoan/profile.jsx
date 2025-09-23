import React, { useEffect, useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import {
    Box,
    Typography,
    Avatar,
    Divider,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Collapse,
    Paper,
} from '@mui/material';
import {
    ChevronDown,
    ChevronUp,
    Edit3,
    MapPin,
    KeyRound,
    Tag,
    Receipt,
    UserCheck,
    User,
    Home,
    Heart,
} from 'lucide-react';
import { useUserAuth } from '../../../contexts/userAuthContext';
import './profile-styles.css';

function Profile() {
    const [open, setOpen] = useState(true);
    const { user } = useUserAuth();

    return (
        <div className="w-full profile-container">
            {/* Breadcrumb */}
            <div className="mb-6 px-4">
                <nav className="flex items-center space-x-2 text-sm">
                    <Link to="/" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
                        <Home className="w-4 h-4 inline mr-1" />
                        Trang chủ
                    </Link>
                    <span className="text-gray-400">/</span>
                    <span className="text-gray-800 font-medium">Tài khoản của tôi</span>
                </nav>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Sidebar */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden profile-sidebar">
                        {/* User Info Header */}
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-gray-100">
                            <div className="flex items-center gap-4">
                            <div className="relative">
                                    <img
                                        src={user?.avatar || '/src/components/Assets/user_icon.png'}
                                        alt={user?.hoTen || 'User'}
                                        className="w-16 h-16 rounded-full object-cover border-3 border-white shadow-md user-avatar"
                                        onError={(e) => {
                                            e.target.src = '/src/components/Assets/user_icon.png';
                                        }}
                                    />
                                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white online-status"></div>
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-gray-800 text-lg">{user?.hoTen}</h3>
                                    <Link
                                        to="/profile/user"
                                        className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 mt-1 transition-colors"
                                    >
                                        <Edit3 className="w-3 h-3" />
                                        Sửa hồ sơ
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Navigation Menu */}
                        <div className="p-6 space-y-2">
                            {/* Account Section */}
                            <div>
                                <button
                                    onClick={() => setOpen(!open)}
                                    className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 rounded-lg transition-colors group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-blue-100 group-hover:bg-blue-200 transition-colors">
                                            <User className="w-4 h-4 text-blue-600" />
                                        </div>
                                        <span className="font-medium text-gray-800">Tài khoản của tôi</span>
                                    </div>
                                    {open ? (
                                        <ChevronUp className="w-4 h-4 text-gray-500" />
                                    ) : (
                                        <ChevronDown className="w-4 h-4 text-gray-500" />
                                    )}
                                </button>

                                {open && (
                                    <div className="ml-6 mt-2 space-y-1">
                                        <Link
                                            to="/profile/user"
                                            className="flex items-center gap-3 p-3 hover:bg-blue-50 rounded-lg transition-colors group"
                                        >
                                            <UserCheck className="w-4 h-4 text-gray-500 group-hover:text-blue-600" />
                                            <span className="text-gray-700 group-hover:text-blue-700">Hồ sơ</span>
                                        </Link>
                                        <Link
                                            to="/profile/address"
                                            className="flex items-center gap-3 p-3 hover:bg-blue-50 rounded-lg transition-colors group"
                                        >
                                            <MapPin className="w-4 h-4 text-gray-500 group-hover:text-blue-600" />
                                            <span className="text-gray-700 group-hover:text-blue-700">Địa chỉ</span>
                                        </Link>
                                    </div>
                                )}
                            </div>

                            {/* Divider */}
                            <div className="border-t border-gray-200 my-4"></div>

                            {/* Other Menu Items */}
                            <div className="space-y-1">
                                <Link
                                    to="/profile/order"
                                    className="flex items-center gap-3 p-3 hover:bg-blue-50 rounded-lg transition-colors group nav-item menu-item glow-on-hover"
                                >
                                    <div className="p-2 rounded-lg bg-green-100 group-hover:bg-green-200 transition-colors icon-wrapper">
                                        <Receipt className="w-4 h-4 text-green-600" />
                                    </div>
                                    <span className="font-medium text-gray-800 group-hover:text-green-700">
                                        Đơn mua
                                    </span>
                                </Link>

                                <Link
                                    to="/profile/my-voucher"
                                    className="flex items-center gap-3 p-3 hover:bg-blue-50 rounded-lg transition-colors group nav-item menu-item glow-on-hover"
                                >
                                    <div className="p-2 rounded-lg bg-orange-100 group-hover:bg-orange-200 transition-colors icon-wrapper">
                                        <Tag className="w-4 h-4 text-orange-600" />
                                    </div>
                                    <span className="font-medium text-gray-800 group-hover:text-orange-700">
                                        Phiếu giảm giá
                                    </span>
                                </Link>

                                <Link
                                    to="/profile/favorites"
                                    className="flex items-center gap-3 p-3 hover:bg-blue-50 rounded-lg transition-colors group nav-item menu-item glow-on-hover"
                                >
                                    <div className="p-2 rounded-lg bg-red-100 group-hover:bg-red-200 transition-colors icon-wrapper">
                                        <Heart className="w-4 h-4 text-red-600" />
                                    </div>
                                    <span className="font-medium text-gray-800 group-hover:text-red-700">
                                        Sản Phẩm Yêu Thích
                                    </span>
                                </Link>

                                <Link
                                    to="/profile/change-password"
                                    className="flex items-center gap-3 p-3 hover:bg-blue-50 rounded-lg transition-colors group nav-item menu-item glow-on-hover"
                                >
                                    <div className="p-2 rounded-lg bg-purple-100 group-hover:bg-purple-200 transition-colors icon-wrapper">
                                        <KeyRound className="w-4 h-4 text-purple-600" />
                                    </div>
                                    <span className="font-medium text-gray-800 group-hover:text-purple-700">
                                        Đổi mật khẩu
                                    </span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Content Area */}
                <div className="lg:col-span-4">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 profile-content">
                        <Outlet />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Profile;
