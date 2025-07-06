import React from 'react';
import AssessmentIcon from '@mui/icons-material/Assessment';
import ReceiptIcon from '@mui/icons-material/Receipt';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import AssignmentReturnIcon from '@mui/icons-material/AssignmentReturn';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

export const SidebarData = [
    {
        title: 'Thống kê',
        icon: <AssessmentIcon />,
        link: '/admin/thong-ke',
        vaiTro: 'Admin',
    },
    {
        title: 'Bán hàng tại quầy',
        icon: <ReceiptIcon />,
        link: '/admin/ban-hang-tai-quay',
    },
    {
        title: 'Quản lý đơn hàng',
        icon: <ShoppingCartIcon />,
        link: '/admin/quan-ly-don-hang',
    },
    {
        title: 'Quản lý sản phẩm',
        icon: <Inventory2Icon />,
        link: '/admin/quan-ly-san-pham',
        subItems: [
            { title: 'Sản phẩm', link: '/admin/quan-ly-san-pham/san-pham' },
            { title: 'Thương hiệu', link: '/admin/quan-ly-san-pham/thuong-hieu' },
            { title: 'Màu sắc', link: '/admin/quan-ly-san-pham/mau-sac' },
            { title: 'Chất liệu', link: '/admin/quan-ly-san-pham/chat-lieu' },
            { title: 'Trọng lượng', link: '/admin/quan-ly-san-pham/trong-luong' },
            { title: 'Điểm cân bằng', link: '/admin/quan-ly-san-pham/diem-can-bang' },
            { title: 'Độ cứng', link: '/admin/quan-ly-san-pham/do-cung' },
        ],
    },
    {
        title: 'Trả hàng',
        icon: <AssignmentReturnIcon />,
        link: '/admin/tra-hang',
    },
    {
        title: 'Giảm giá',
        icon: <TrendingDownIcon />,
        link: '/admin/giam-gia',
        subItems: [
            { title: 'Phiếu giảm giá', link: '/admin/giam-gia/phieu-giam-gia' },
            { title: 'Đợt giảm giá', link: '/admin/giam-gia/dot-giam-gia' },
        ],
    },
    {
        title: 'Tài khoản',
        icon: <AccountCircleIcon />,
        link: '/admin/tai-khoan',
        subItems: [
            { title: 'Nhân viên', link: '/admin/tai-khoan/nhan-vien', vaiTro: 'Admin' },
            { title: 'Khách hàng', link: '/admin/tai-khoan/khach-hang' },
        ],
    },
];
