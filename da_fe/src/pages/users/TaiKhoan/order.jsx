import React, { useEffect, useState } from 'react';
import { Box, TextField, Typography, Paper, Button, Grid, Tabs, Tab, InputAdornment, Divider } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import axios from 'axios';
import dayjs from 'dayjs';
import {
    Package,
    Search,
    Clock,
    Truck,
    CheckCircle,
    XCircle,
    RotateCcw,
    Eye,
    Calendar,
    DollarSign,
    Tag,
    ShoppingBag,
    AlertCircle,
    PackageCheck,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
} from 'lucide-react';
import './order-styles.css';

import { useUserAuth } from '../../../contexts/userAuthContext';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const tabs = [
    { key: 'Tất cả', label: 'Tất cả', icon: <Package className="w-4 h-4" />, count: 0 },
    { key: 'Chờ xác nhận', label: 'Chờ xác nhận', icon: <Clock className="w-4 h-4" />, count: 0 },
    { key: 'Chờ giao hàng', label: 'Chờ giao hàng', icon: <ShoppingBag className="w-4 h-4" />, count: 0 },
    { key: 'Đang vận chuyển', label: 'Đang vận chuyển', icon: <Truck className="w-4 h-4" />, count: 0 },
    { key: 'Đã giao hàng', label: 'Đã giao hàng', icon: <PackageCheck className="w-4 h-4" />, count: 0 },
    { key: 'Đã thanh toán', label: 'Đã thanh toán', icon: <CheckCircle className="w-4 h-4" />, count: 0 },
    { key: 'Hoàn thành', label: 'Hoàn thành', icon: <CheckCircle className="w-4 h-4" />, count: 0 },
    { key: 'Đã hủy', label: 'Đã hủy', icon: <XCircle className="w-4 h-4" />, count: 0 },
    { key: 'Trả hàng', label: 'Phiếu trả hàng', icon: <RotateCcw className="w-4 h-4" />, count: 0 },
];

const tabStatusMap = {
    'Tất cả': null,
    'Chờ xác nhận': [1],
    'Chờ giao hàng': [2],
    'Đang vận chuyển': [3],
    'Đã giao hàng': [4],
    'Đã thanh toán': [5],
    'Hoàn thành': [6],
    'Đã hủy': [7],
    'Trả hàng': [8],
};

const statusMap = {
    1: {
        label: 'Chờ xác nhận',
        color: 'bg-amber-50 text-amber-700 border-amber-200',
        icon: <Clock className="w-3 h-3" />,
        dotColor: 'bg-amber-400',
    },
    2: {
        label: 'Chờ giao hàng',
        color: 'bg-blue-50 text-blue-700 border-blue-200',
        icon: <ShoppingBag className="w-3 h-3" />,
        dotColor: 'bg-blue-400',
    },
    3: {
        label: 'Đang vận chuyển',
        color: 'bg-purple-50 text-purple-700 border-purple-200',
        icon: <Truck className="w-3 h-3" />,
        dotColor: 'bg-purple-400',
    },
    4: {
        label: 'Đã giao hàng',
        color: 'bg-green-50 text-green-700 border-green-200',
        icon: <PackageCheck className="w-3 h-3" />,
        dotColor: 'bg-green-400',
    },
    5: {
        label: 'Đã thanh toán',
        color: 'bg-teal-50 text-teal-700 border-teal-200',
        icon: <CheckCircle className="w-3 h-3" />,
        dotColor: 'bg-teal-400',
    },
    6: {
        label: 'Hoàn thành',
        color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        icon: <CheckCircle className="w-3 h-3" />,
        dotColor: 'bg-emerald-400',
    },
    7: {
        label: 'Đã hủy',
        color: 'bg-red-50 text-red-700 border-red-200',
        icon: <XCircle className="w-3 h-3" />,
        dotColor: 'bg-red-400',
    },
    8: {
        label: 'Trả hàng',
        color: 'bg-orange-50 text-orange-700 border-orange-200',
        icon: <RotateCcw className="w-3 h-3" />,
        dotColor: 'bg-orange-400',
    },
    9: {
        label: 'Chờ nhập hàng',
        color: 'bg-yellow-50 text-yellow-700 border-yellow-200',
        icon: <AlertCircle className="w-3 h-3" />,
        dotColor: 'bg-yellow-400',
    },
};

const getStatus = (status) => statusMap[status]?.label || 'Không xác định';
const getStatusStyle = (status) => statusMap[status]?.color || 'bg-gray-50 text-gray-600 border-gray-200';
const getStatusIcon = (status) => statusMap[status]?.icon || <AlertCircle className="w-3 h-3" />;
const getStatusDot = (status) => statusMap[status]?.dotColor || 'bg-gray-400';

const formatCurrency = (value) => {
    const n = Number(value ?? 0);
    return n.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
};

// Resolve possible price fields for a product item and return unit original/discounted prices
// Notes:
// - Prefer the transaction unit price if we have it (sp.returnUnitPrice)
// - Treat sp.giaBan (and thongTinSanPhamTra.giaBan) as UNIT price when it’s in a reasonable range
// - Avoid mutating the source objects
const resolveItemPrices = (sp, isReturn = false) => {
    const qty = Number(isReturn ? sp?.soLuongTra || 0 : sp?.soLuong || 0) || 1;
    const sanPhamCT = isReturn ? sp?.thongTinSanPhamTra?.sanPhamCT : sp?.sanPhamCT;
    const originalPrice = Number(
        sanPhamCT?.donGia ?? sanPhamCT?.sanPham?.donGia ?? 0
    );

    // 1) Prefer transaction unit price that we attached from return history
    if (sp?.returnUnitPrice) {
        const unit = Number(sp.returnUnitPrice);
        return {
            originalPrice,
            discountedPrice: unit,
            unitPrice: unit,
        };
    }

    // 2) Try direct unit price from order line
    const orderGiaBan = isReturn
        ? (sp?.thongTinSanPhamTra?.giaBan ?? sp?.giaBan)
        : sp?.giaBan;

    if (orderGiaBan !== undefined && orderGiaBan !== null) {
        const candidate = Number(orderGiaBan);
        // If candidate is within 150% of original, assume it’s a unit price
        if (!originalPrice || candidate <= originalPrice * 1.5) {
            return {
                originalPrice,
                discountedPrice: candidate,
                unitPrice: candidate,
            };
        }
        // Otherwise, attempt to derive a unit price by dividing by quantity as a fallback
        if (qty > 0) {
            const divided = candidate / qty;
            return {
                originalPrice,
                discountedPrice: divided,
                unitPrice: divided,
            };
        }
    }

    // 3) Fallback to product current price (may not reflect historical discount)
    const fallback = Number(sanPhamCT?.giaKhuyenMai ?? originalPrice);
    return {
        originalPrice,
        discountedPrice: fallback,
        unitPrice: fallback,
    };
};

function UserOrder() {
    const [selectedTab, setSelectedTab] = useState('Tất cả');
    const [listHoaDon, setListHoaDon] = useState([]);
    const [listPhieuTraHang, setListPhieuTraHang] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const { isLoggedIn } = useUserAuth();

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5); // Số đơn hàng mỗi trang
    const [isChangingPage, setIsChangingPage] = useState(false);
    const itemsPerPageOptions = [5, 10, 15, 20];

    // State for tracking expanded orders (show all products)
    const [expandedOrders, setExpandedOrders] = useState(new Set());

    // Function to toggle product list expansion for an order
    const toggleOrderExpansion = (orderId) => {
        setExpandedOrders(prev => {
            const newSet = new Set(prev);
            if (newSet.has(orderId)) {
                newSet.delete(orderId);
            } else {
                newSet.add(orderId);
            }
            return newSet;
        });
    };

    // Tính số lượng đơn hàng cho mỗi tab
    const getOrderCounts = () => {
        const counts = {};
        tabs.forEach((tab) => {
            if (tab.key === 'Trả hàng') {
                counts[tab.key] = listPhieuTraHang.length;
            } else {
                const validStatuses = tabStatusMap[tab.key];
                if (!validStatuses) {
                    counts[tab.key] = listHoaDon.filter((bill) => bill.trangThai !== 5).length;
                } else {
                    counts[tab.key] = listHoaDon.filter((bill) => validStatuses.includes(bill.trangThai)).length;
                }
            }
        });
        return counts;
    };

    const orderCounts = getOrderCounts();

    useEffect(() => {
        const socket = new SockJS('http://localhost:8080/ws');
        const stompClient = new Client({
            webSocketFactory: () => socket,
            reconnectDelay: 5000,
            onConnect: () => {
                stompClient.subscribe('/topic/orders', (message) => {
                    const update = JSON.parse(message.body);
                    setListHoaDon((prev) =>
                        prev.map((order) =>
                            order.id === update.orderId ? { ...order, trangThai: update.status } : order,
                        ),
                    );
                });
            },
        });

        stompClient.activate();

        return () => {
            stompClient.deactivate();
        };
    }, []);

    const filteredBills =
        selectedTab === 'Trả hàng'
            ? listPhieuTraHang.filter(
                  (phieu) =>
                      phieu.maPhieuTraHang.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      phieu.hoaDonMa.toLowerCase().includes(searchTerm.toLowerCase()),
              )
            : listHoaDon.filter((bill) => {
                  const validStatuses = tabStatusMap[selectedTab];
                  const matchTab = !validStatuses ? bill.trangThai !== 5 : validStatuses.includes(bill.trangThai);
                  const matchSearch = bill.ma.toLowerCase().includes(searchTerm.toLowerCase());
                  return matchTab && matchSearch;
              });

    // Pagination calculations
    const totalPages = Math.ceil(filteredBills.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentBills = filteredBills.slice(startIndex, endIndex);

    console.log('Current Bills:', currentBills);

    // Reset current page when tab changes, search changes, or items per page changes
    useEffect(() => {
        setCurrentPage(1);
    }, [selectedTab, searchTerm, itemsPerPage]);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const token = localStorage.getItem('userToken');
                if (!token) return;

                const headers = { Authorization: `Bearer ${token}` };
                const res = await axios.get('http://localhost:8080/users/myOrders', { headers });
                const bills = res.data.result;

                const detailedBills = await Promise.all(
                    bills.map(async (bill) => {
                        try {
                            const detailRes = await axios.get(`http://localhost:8080/users/myOderDetail/${bill.id}`, {
                                headers,
                            });
                            const chiTiet = detailRes.data.result;

                            // Fetch returns (Hoàn hàng) for this order to obtain transaction unit prices
                            let returnUnitMap = {};
                            try {
                                const hhRes = await axios.get(`http://localhost:8080/api/hoan-hang/hoa-don/${bill.id}`);
                                if (hhRes.data?.success && Array.isArray(hhRes.data.data)) {
                                    hhRes.data.data.forEach((r) => {
                                        if (r.hoaDonChiTietId && r.donGia) {
                                            if (!returnUnitMap[r.hoaDonChiTietId]) {
                                                returnUnitMap[r.hoaDonChiTietId] = Number(r.donGia);
                                            }
                                        }
                                    });
                                }
                            } catch (e) {
                                console.warn('Không thể tải hoàn hàng cho bill', bill.id, e?.message || e);
                            }

                            // Attach return unit price to corresponding line items for stable display
                            const chiTietWithReturnUnit = Array.isArray(chiTiet)
                                ? chiTiet.map((ct) =>
                                      returnUnitMap[ct.id]
                                          ? { ...ct, returnUnitPrice: returnUnitMap[ct.id] }
                                          : ct,
                                  )
                                : chiTiet;

                            let returnDetails = [];
                            if (bill.trangThai === 8) {
                                try {
                                    const returnRes = await axios.get(
                                        `http://localhost:8080/phieu-tra-hang/by-order/${bill.id}`,
                                        { headers },
                                    );
                                    const phieuTra = returnRes.data.result;

                                    returnDetails = phieuTra?.chiTietTraHang || []; // ✅ đúng field
                                    bill.tongTien = phieuTra?.soTienHoanLai || bill.tongTien; // nếu BE có số tiền hoàn
                                    bill.ngayTao = phieuTra?.ngayTao || bill.ngayTao; // cập nhật ngày tạo từ phiếu trả
                                    bill.ngaySua = phieuTra?.ngayXuLy || bill.ngaySua;
                                } catch (err) {
                                    console.error('Không lấy được phiếu trả hàng:', err);
                                }
                            }

                            return {
                                ...bill,
                                chiTiet: chiTietWithReturnUnit,
                                returnDetails, // giữ thông tin sản phẩm hoàn trả
                                ngayTao: chiTiet?.[0]?.hoaDon?.ngayTao || null,
                                ngaySua: chiTiet?.[0]?.hoaDon?.ngaySua || null,
                            };
                        } catch {
                            return bill;
                        }
                    }),
                );

                setListHoaDon(detailedBills);
                console.log('detail: ', detailedBills);
            } catch (error) {
                console.error('Lỗi khi lấy đơn hàng:', error);
                toast.error('Không thể lấy đơn hàng');
            }
        };

        const fetchPhieuTraHang = async () => {
            try {
                const token = localStorage.getItem('userToken');
                if (!token) return;

                const headers = { Authorization: `Bearer ${token}` };
                const res = await axios.get('http://localhost:8080/phieu-tra-hang', { headers });
                const phieuTraHang = res.data.result;

                setListPhieuTraHang(phieuTraHang);
                console.log('Phiếu trả hàng: ', phieuTraHang);
            } catch (error) {
                const status = error?.response?.status;
                const payload = error?.response?.data;
                console.error('Lỗi khi lấy phiếu trả hàng:', payload || error);
                // 401/403: token hết hạn/không hợp lệ -> im lặng
                if (status === 401 || status === 403) return;
                // 400 với mã 9999 (UNCATEGORIZED_EXCEPTION) từ BE -> tránh toast gây nhiễu, chỉ log
                if (status === 400 && payload?.code === 9999) return;
                // Chỉ thông báo khi là lỗi phía server
                if (status && status >= 500) {
                    toast.error('Không thể lấy phiếu trả hàng');
                }
            }
        };

        if (isLoggedIn) {
            fetchOrders();
            fetchPhieuTraHang();
        }
    }, [isLoggedIn]);

    // Pagination Component
    const Pagination = () => {
        if (totalPages <= 1) return null;

        const getPageNumbers = () => {
            const pages = [];
            const maxVisiblePages = 5;

            if (totalPages <= maxVisiblePages) {
                for (let i = 1; i <= totalPages; i++) {
                    pages.push(i);
                }
            } else {
                const start = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
                const end = Math.min(totalPages, start + maxVisiblePages - 1);

                for (let i = start; i <= end; i++) {
                    pages.push(i);
                }
            }

            return pages;
        };

        return (
            <div className="pagination-container">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-6 py-4">
                    {/* Info */}
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="text-sm text-gray-600">
                            Hiển thị <span className="font-semibold text-gray-800">{startIndex + 1}</span> đến{' '}
                            <span className="font-semibold text-gray-800">
                                {Math.min(endIndex, filteredBills.length)}
                            </span>{' '}
                            trong <span className="font-semibold text-blue-600">{filteredBills.length}</span> đơn hàng
                        </div>

                        {/* Items per page selector */}
                        <div className="flex items-center gap-2 text-sm">
                            <span className="text-gray-600 hidden sm:inline">Hiển thị:</span>
                            <select
                                value={itemsPerPage}
                                onChange={(e) => {
                                    setIsChangingPage(true);
                                    setItemsPerPage(Number(e.target.value));
                                    setTimeout(() => setIsChangingPage(false), 300);
                                }}
                                className="border border-gray-200 rounded-lg px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                            >
                                {itemsPerPageOptions.map((option) => (
                                    <option key={option} value={option}>
                                        {option}
                                    </option>
                                ))}
                            </select>
                            <span className="text-gray-600 hidden sm:inline">mỗi trang</span>
                        </div>

                        {filteredBills.length > itemsPerPage && (
                            <div className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
                                Trang {currentPage}/{totalPages}
                            </div>
                        )}
                    </div>

                    {/* Pagination Controls */}
                    <div className="flex items-center justify-center w-full sm:w-auto">
                        <div className="flex items-center space-x-1">
                            {/* First Page */}
                            <button
                                onClick={() => {
                                    setIsChangingPage(true);
                                    setCurrentPage(1);
                                    setTimeout(() => setIsChangingPage(false), 300);
                                }}
                                disabled={currentPage === 1 || isChangingPage}
                                className="pagination-button hidden sm:flex"
                                title="Trang đầu"
                            >
                                <ChevronsLeft className="w-4 h-4" />
                            </button>

                            {/* Previous Page */}
                            <button
                                onClick={() => {
                                    setIsChangingPage(true);
                                    setCurrentPage(currentPage - 1);
                                    setTimeout(() => setIsChangingPage(false), 300);
                                }}
                                disabled={currentPage === 1 || isChangingPage}
                                className="pagination-button"
                                title="Trang trước"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>

                            {/* Page Numbers */}
                            <div className="flex space-x-1 mx-2">
                                {getPageNumbers().map((page) => (
                                    <button
                                        key={page}
                                        onClick={() => {
                                            setIsChangingPage(true);
                                            setCurrentPage(page);
                                            setTimeout(() => setIsChangingPage(false), 300);
                                        }}
                                        disabled={isChangingPage}
                                        className={`pagination-button px-3 ${currentPage === page ? 'active' : ''}`}
                                        title={`Trang ${page}`}
                                    >
                                        {page}
                                    </button>
                                ))}
                            </div>

                            {/* Next Page */}
                            <button
                                onClick={() => {
                                    setIsChangingPage(true);
                                    setCurrentPage(currentPage + 1);
                                    setTimeout(() => setIsChangingPage(false), 300);
                                }}
                                disabled={currentPage === totalPages || isChangingPage}
                                className="pagination-button"
                                title="Trang sau"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>

                            {/* Last Page */}
                            <button
                                onClick={() => {
                                    setIsChangingPage(true);
                                    setCurrentPage(totalPages);
                                    setTimeout(() => setIsChangingPage(false), 300);
                                }}
                                disabled={currentPage === totalPages || isChangingPage}
                                className="pagination-button hidden sm:flex"
                                title="Trang cuối"
                            >
                                <ChevronsRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                <div className="flex items-center gap-3 mb-4">
                    <div className="bg-blue-100 rounded-xl p-3">
                        <Package className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Đơn mua của tôi</h1>
                        <p className="text-gray-600">Theo dõi đơn hàng và lịch sử mua hàng</p>
                    </div>
                </div>

                {/* Search */}
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder={
                            selectedTab === 'Trả hàng'
                                ? 'Tìm theo mã phiếu trả hàng hoặc mã đơn hàng...'
                                : 'Tìm theo mã đơn hàng...'
                        }
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        onChange={(e) => {
                            const value = e.target.value;
                            const specialCharsRegex = /[!@#\$%\^&*\(\),.?":{}|<>[\]]/;
                            if (specialCharsRegex.test(value)) {
                                toast.warning('Không được chứa ký tự đặc biệt');
                                return;
                            }
                            setSearchTerm(value);
                        }}
                    />
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="flex overflow-x-auto scrollbar-hide">
                    {tabs.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setSelectedTab(tab.key)}
                            className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all whitespace-nowrap border-b-2 ${
                                selectedTab === tab.key
                                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                                    : 'border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                            }`}
                        >
                            {tab.icon}
                            <span>{tab.label}</span>
                            {orderCounts[tab.key] > 0 && (
                                <span className="ml-1 px-2 py-0.5 text-xs bg-blue-100 text-blue-600 rounded-full">
                                    {orderCounts[tab.key]}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Orders List */}
            <div className="space-y-4 relative">
                {/* Loading overlay */}
                {isChangingPage && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-10 flex items-center justify-center rounded-2xl">
                        <div className="flex items-center gap-2 text-blue-600">
                            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-sm font-medium">Đang tải...</span>
                        </div>
                    </div>
                )}

                {currentBills.length > 0 ? (
                    <>
                        {currentBills.map((item) => {
                            // Nếu là tab Phiếu trả hàng, hiển thị phiếu trả hàng
                            if (selectedTab === 'Trả hàng') {
                                return (
                                    <div
                                        key={item.id}
                                        className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                                    >
                                        {/* Phiếu trả hàng Header */}
                                        <div className="px-6 py-4 bg-gradient-to-r from-orange-50 to-red-50 border-b border-gray-100">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-3 h-3 rounded-full bg-orange-400"></div>
                                                    <div>
                                                        <h3 className="font-semibold text-gray-800 text-lg">
                                                            {item.maPhieuTraHang}
                                                        </h3>
                                                        <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                                                            <Calendar className="w-3 h-3" />
                                                            Tạo lúc: {dayjs(item.ngayTao).format('DD/MM/YYYY HH:mm')}
                                                        </p>
                                                        <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                                                            <Package className="w-3 h-3" />
                                                            Đơn hàng: {item.hoaDonMa}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg border bg-orange-50 text-orange-700 border-orange-200">
                                                    <RotateCcw className="w-3 h-3" />
                                                    {item.trangThai === 'APPROVED' ? 'Đã duyệt' : item.trangThai}
                                                </div>
                                            </div>
                                        </div>

                                        {/* const originalPrice =
                                    sanPhamCT?.donGia ??
                                    sp?.giaGoc ??
                                    (isReturn ? sp?.thongTinSanPhamTra?.giaBan : sp?.giaBan) ??
                                    0;
                                const discountedPrice =
                                    sanPhamCT?.giaKhuyenMai ??
                                    (isReturn ? sp?.thongTinSanPhamTra?.giaBan : sp?.giaBan) ??
                                    originalPrice; */}

                                        {/* Chi tiết sản phẩm trả */}
                                        <div className="p-6">
                                            <div className="space-y-4">
                                                {(() => {
                                                    const allReturnProducts = item.chiTietTraHang;
                                                    const isExpanded = expandedOrders.has(item.id);
                                                    const productsToShow = isExpanded ? allReturnProducts : allReturnProducts?.slice(0, 1);
                                                    const hasMoreProducts = allReturnProducts?.length > 1;

                                                    // Fallback ratio at slip level (when BE doesn't provide per-line soTienHoanTra/tyLeGiamGia)
                                                    let slipRatio = null;
                                                    if (Array.isArray(allReturnProducts) && allReturnProducts.length > 0) {
                                                        const base = allReturnProducts.reduce((sum, ct) => {
                                                            const sp = ct?.thongTinSanPhamTra || {};
                                                            const unitOriginal = Number(sp?.giaBan ?? ct?.donGiaGoc ?? 0);
                                                            const qtyApproved = Number(ct?.soLuongPheDuyet || 0);
                                                            return sum + unitOriginal * qtyApproved;
                                                        }, 0);
                                                        const totalRefund = Number(item?.soTienHoanLai ?? NaN);
                                                        if (base > 0 && Number.isFinite(totalRefund) && totalRefund >= 0) {
                                                            slipRatio = Math.min(Math.max(totalRefund / base, 0), 1);
                                                        }
                                                    }

                                                    return (
                                                        <>
                                                            {productsToShow?.map((chiTiet, idx) => {
                                                                const sanPham = chiTiet?.thongTinSanPhamTra || {};
                                                                const soLuongTra = Number(chiTiet?.soLuongTra || 0);
                                                                const soLuongPheDuyet = Number(chiTiet?.soLuongPheDuyet || 0);
                                                                const isApproved = item?.trangThai === 'APPROVED';

                                                                // Unit price calculation
                                                                const unitOriginal = Number(sanPham?.giaBan ?? chiTiet?.donGiaGoc ?? 0);
                                                                let unitAdjusted = unitOriginal;
                                                                if (typeof chiTiet?.soTienHoanTra === 'number' && soLuongPheDuyet > 0) {
                                                                    unitAdjusted = Number(chiTiet.soTienHoanTra) / soLuongPheDuyet;
                                                                } else if (typeof chiTiet?.tyLeGiamGia === 'number') {
                                                                    unitAdjusted = unitOriginal * (1 - Number(chiTiet.tyLeGiamGia));
                                                                } else if (typeof slipRatio === 'number') {
                                                                    unitAdjusted = unitOriginal * slipRatio;
                                                                }

                                                                const qtyForTotal = isApproved ? soLuongPheDuyet : soLuongTra;
                                                                const lineAdjusted =
                                                                    typeof chiTiet?.soTienHoanTra === 'number'
                                                                        ? Number(chiTiet.soTienHoanTra)
                                                                        : unitAdjusted * qtyForTotal;

                                                                return (
                                                                    <div
                                                                        key={idx}
                                                                        className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                                                                    >
                                                                        {/* Product Image */}
                                                                        <div className="flex-shrink-0">
                                                                            <img
                                                                                src={
                                                                                    chiTiet?.hinhAnhUrl ||
                                                                                    sanPham?.hinhAnhUrl ||
                                                                                    sanPham?.hinhAnh ||
                                                                                    sanPham?.sanPhamCT?.hinhAnhUrl ||
                                                                                    sanPham?.sanPhamCT?.hinhAnh ||
                                                                                    sanPham?.sanPhamCT?.sanPham?.hinhAnhUrl ||
                                                                                    sanPham?.sanPhamCT?.sanPham?.hinhAnh ||
                                                                                    (sanPham?.sanPhamCT?.sanPham?.hinhAnhs && sanPham.sanPhamCT.sanPham.hinhAnhs.length > 0
                                                                                        ? `http://localhost:8080/uploads/${sanPham.sanPhamCT.sanPham.hinhAnhs[0]}`
                                                                                        : 'https://via.placeholder.com/80')
                                                                                }
                                                                                alt={sanPham?.tenSanPham || 'Sản phẩm'}
                                                                                className="w-20 h-20 object-cover rounded-xl border border-gray-200"
                                                                            />
                                                                        </div>

                                                                        {/* Product Info */}
                                                                        <div className="flex-grow min-w-0">
                                                                            <h4 className="font-medium text-gray-800 text-base line-clamp-2 mb-2">
                                                                                {sanPham?.tenSanPham || 'Sản phẩm'}
                                                                            </h4>

                                                                            <div className="flex items-center gap-4 text-sm text-gray-600">
                                                                                <div className="flex items-center gap-1">
                                                                                    <Tag className="w-3 h-3" />
                                                                                    <span>
                                                                                        {sanPham?.tenMauSac || ''},{' '}
                                                                                        {sanPham?.tenTrongLuong || ''},{' '}
                                                                                        {sanPham?.tenDoCung || ''}
                                                                                    </span>
                                                                                </div>
                                                                                <div className="flex items-center gap-1">
                                                                                    <Package className="w-3 h-3" />
                                                                                    <span>Yêu cầu: x{soLuongTra}</span>
                                                                                </div>
                                                                                <div className="flex items-center gap-1">
                                                                                    <CheckCircle className="w-3 h-3" />
                                                                                    <span>
                                                                                        Duyệt:{' '}
                                                                                        {soLuongPheDuyet > 0
                                                                                            ? `x${soLuongPheDuyet}`
                                                                                            : 'Chờ duyệt'}
                                                                                    </span>
                                                                                </div>
                                                                            </div>

                                                                            {chiTiet.lyDoTraHang && (
                                                                                <div className="mt-2 text-sm text-gray-600">
                                                                                    <span className="font-medium">Lý do:</span>{' '}
                                                                                    {chiTiet.lyDoTraHang}
                                                                                </div>
                                                                            )}

                                                                            {chiTiet.ghiChuNhanVien ? (
                                                                                <div className="mt-1 text-sm text-gray-600">
                                                                                    <span className="font-medium">Ghi chú NV:</span>{' '}
                                                                                    {chiTiet.ghiChuNhanVien}
                                                                                </div>
                                                                            ) : (
                                                                                <div className="mt-1 text-sm text-gray-500 italic">
                                                                                    <span className="font-medium">Ghi chú NV:</span>{' '}
                                                                                    Chưa có ghi chú
                                                                                </div>
                                                                            )}
                                                                        </div>

                                                                        {/* Price */}
                                                                        <div className="text-right min-w-[140px]">
                                                                            <div className="text-sm text-gray-500 mb-1">
                                                                                Đơn giá:
                                                                            </div>
                                                                            <div className="text-md font-semibold text-red-600 mb-2">
                                                                                {formatCurrency(unitAdjusted)}
                                                                            </div>
                                                                            <div className="text-sm text-gray-600">Tổng:</div>
                                                                            <div className="text-lg font-bold text-gray-800">
                                                                                {qtyForTotal > 0 ? formatCurrency(lineAdjusted) : 'Chờ duyệt'}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                            
                                                            {/* Show "xem thêm" button if there are more return products */}
                                                            {hasMoreProducts && (
                                                                <div className="flex justify-center pt-2">
                                                                    <button
                                                                        onClick={() => toggleOrderExpansion(item.id)}
                                                                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                                                                    >
                                                                        {isExpanded ? (
                                                                            <>
                                                                                <span>Thu gọn</span>
                                                                                <ChevronLeft className="w-4 h-4 rotate-90" />
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <span>Xem thêm {allReturnProducts.length - 1} sản phẩm</span>
                                                                                <ChevronRight className="w-4 h-4 rotate-90" />
                                                                            </>
                                                                        )}
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </>
                                                    );
                                                })()}
                                            </div>
                                        </div>

                                        {/* Phiếu trả hàng Footer */}
                                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <DollarSign className="w-4 h-4" />
                                                    <span>Tổng tiền hoàn:</span>
                                                </div>

                                                <div className="flex items-center gap-4">
                                                    <div className="text-right">
                                                        <div className="text-xl font-bold text-red-600">
                                                            {(() => {
                                                                const isApproved = item?.trangThai === 'APPROVED';
                                                                const total = (item?.chiTietTraHang || []).reduce((sum, ct) => {
                                                                    const sp = ct?.thongTinSanPhamTra || {};
                                                                    const unitOriginal = Number(sp?.giaBan ?? ct?.donGiaGoc ?? 0);
                                                                    const qty = isApproved ? Number(ct?.soLuongPheDuyet || 0) : Number(ct?.soLuongTra || 0);
                                                                    if (typeof ct?.soTienHoanTra === 'number') return sum + Number(ct.soTienHoanTra);
                                                                    let unitAdj = unitOriginal;
                                                                    if (typeof ct?.tyLeGiamGia === 'number') unitAdj = unitOriginal * (1 - Number(ct.tyLeGiamGia));
                                                                    else if (typeof slipRatio === 'number') unitAdj = unitOriginal * slipRatio;
                                                                    return sum + unitAdj * qty;
                                                                }, 0);
                                                                return total > 0 ? formatCurrency(total) : 'Chờ duyệt';
                                                            })()}
                                                        </div>
                                                    </div>

                                                    <div className="text-sm text-gray-600">
                                                        <div>Hình thức: {item.hinhThucTra}</div>
                                                        <div>
                                                            Xử lý:{' '}
                                                            {item.ngayXuLy
                                                                ? dayjs(item.ngayXuLy).format('DD/MM/YYYY HH:mm')
                                                                : 'Chưa xử lý'}
                                                        </div>
                                                    </div>

                                                    <Link
                                                        to={`/profile/return-order-detail/${item.id}`}
                                                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium rounded-lg transition-colors"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                        Xem chi tiết
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            }

                            // Sử dụng tongTien từ API response thay vì tính toán lại
                            const totalAmount = item.tongTien || 0;

                            return (
                                <div
                                    key={item.id}
                                    className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                                >
                                    {/* Order Header */}
                                    <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-100">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className={`w-3 h-3 rounded-full ${getStatusDot(item.trangThai)}`}
                                                ></div>
                                                <div>
                                                    <h3 className="font-semibold text-gray-800 text-lg">{item.ma}</h3>
                                                    <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                                                        <Calendar className="w-3 h-3" />
                                                        {item.trangThai === 7
                                                            ? `Hủy lúc: ${dayjs(item.ngaySua).format('DD/MM/YYYY HH:mm')}`
                                                            : `Đặt lúc: ${dayjs(item.ngayTao).format('DD/MM/YYYY HH:mm')}`}
                                                    </p>
                                                </div>
                                            </div>

                                            <div
                                                className={`inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg border ${getStatusStyle(item.trangThai)}`}
                                            >
                                                {getStatusIcon(item.trangThai)}
                                                {getStatus(item.trangThai)}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Products */}
                                    <div className="p-6">
                                        <div className="space-y-4">
                                            {(() => {
                                                const isReturnBill = selectedTab === 'Trả hàng' || item.trangThai === 8 || !!item.maPhieuTraHang;
                                                const allProducts = isReturnBill
                                                    ? (item?.chiTietTraHang || item?.returnDetails)
                                                    : item?.chiTiet;
                                                // If this is a return slip, compute a global ratio as fallback (soTienHoanLai / sum(original*approvedQty))
                                                let returnSlipRatio = null;
                                                if (isReturnBill && Array.isArray(allProducts) && allProducts.length > 0) {
                                                    const sumOriginalApproved = allProducts.reduce((sum, p) => {
                                                        const spInfo = p?.thongTinSanPhamTra || {};
                                                        const unitOriginal = Number(spInfo?.giaBan ?? p?.donGiaGoc ?? 0);
                                                        const qtyApproved = Number(p?.soLuongPheDuyet || 0);
                                                        return sum + unitOriginal * qtyApproved;
                                                    }, 0);
                                                    const totalRefundSlip = Number(item?.soTienHoanLai ?? NaN);
                                                    if (sumOriginalApproved > 0 && Number.isFinite(totalRefundSlip) && totalRefundSlip >= 0) {
                                                        returnSlipRatio = Math.min(Math.max(totalRefundSlip / sumOriginalApproved, 0), 1);
                                                    }
                                                }
                                                const isExpanded = expandedOrders.has(item.id);
                                                const productsToShow = isExpanded ? allProducts : allProducts?.slice(0, 1);
                                                const hasMoreProducts = allProducts?.length > 1;

                                                return (
                                                    <>
                                                        {productsToShow?.map((sp, idx) => {
                                                            const isReturn = isReturnBill || !!sp?.thongTinSanPhamTra;
                                                            const approvedQty = Number(sp?.soLuongPheDuyet || 0);
                                                            const requestedQty = Number(sp?.soLuongTra || 0);
                                                            const quantity = isReturn ? (approvedQty || requestedQty || 0) : Number(sp?.soLuong || 0);

                                                            // Pricing
                                                            let originalPrice, unitPrice, discountedPrice, lineTotal, discountPercent;
                                                            if (isReturn) {
                                                                const sanPham = sp?.thongTinSanPhamTra || {};
                                                                const unitOriginal = Number(sanPham?.giaBan ?? sp?.donGiaGoc ?? 0);
                                                                let unitAdjusted = unitOriginal;
                                                                if (typeof sp?.soTienHoanTra === 'number' && approvedQty > 0) {
                                                                    unitAdjusted = Number(sp.soTienHoanTra) / approvedQty;
                                                                } else if (typeof sp?.tyLeGiamGia === 'number') {
                                                                    unitAdjusted = unitOriginal * (1 - Number(sp.tyLeGiamGia));
                                                                } else if (typeof returnSlipRatio === 'number') {
                                                                    unitAdjusted = unitOriginal * returnSlipRatio;
                                                                }
                                                                const lineAdjusted =
                                                                    typeof sp?.soTienHoanTra === 'number'
                                                                        ? Number(sp.soTienHoanTra)
                                                                        : unitAdjusted * quantity;

                                                                originalPrice = unitOriginal;
                                                                unitPrice = unitAdjusted;
                                                                discountedPrice = unitAdjusted;
                                                                lineTotal = lineAdjusted;
                                                                discountPercent =
                                                                    unitOriginal > 0 && unitAdjusted < unitOriginal
                                                                        ? Math.round(((unitOriginal - unitAdjusted) / unitOriginal) * 100)
                                                                        : 0;
                                                            } else {
                                                                // Resolve prices using helper (handles variant or order-level totals)
                                                                const resolved = resolveItemPrices(sp, false);
                                                                originalPrice = resolved.originalPrice;
                                                                discountedPrice = resolved.discountedPrice;
                                                                unitPrice = resolved.unitPrice;
                                                                lineTotal = unitPrice * quantity;
                                                                discountPercent =
                                                                    originalPrice > 0 && originalPrice > discountedPrice
                                                                        ? Math.round(((originalPrice - discountedPrice) / originalPrice) * 100)
                                                                        : 0;
                                                            }

                                                            return (
                                                                <div
                                                                    key={idx}
                                                                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                                                                >
                                                                    {/* Product Image */}
                                                                    <div className="flex-shrink-0">
                                                                        <img
                                                                            src={
                                                                                sp?.hinhAnhUrl ||
                                                                                // For return items, try nested fields in thongTinSanPhamTra
                                                                                sp?.thongTinSanPhamTra?.hinhAnhUrl ||
                                                                                sp?.thongTinSanPhamTra?.hinhAnh ||
                                                                                sp?.thongTinSanPhamTra?.sanPhamCT?.hinhAnhUrl ||
                                                                                sp?.thongTinSanPhamTra?.sanPhamCT?.hinhAnh ||
                                                                                sp?.thongTinSanPhamTra?.sanPhamCT?.sanPham?.hinhAnhUrl ||
                                                                                sp?.thongTinSanPhamTra?.sanPhamCT?.sanPham?.hinhAnh ||
                                                                                // Non-return fallback
                                                                                sp?.sanPhamCT?.hinhAnhUrl ||
                                                                                sp?.sanPhamCT?.hinhAnh ||
                                                                                // Uploaded filenames array
                                                                                (sp?.thongTinSanPhamTra?.sanPhamCT?.sanPham?.hinhAnhs && sp.thongTinSanPhamTra.sanPhamCT.sanPham.hinhAnhs.length > 0
                                                                                    ? `http://localhost:8080/uploads/${sp.thongTinSanPhamTra.sanPhamCT.sanPham.hinhAnhs[0]}`
                                                                                    : null) ||
                                                                                'https://via.placeholder.com/80'
                                                                            }
                                                                            alt={
                                                                                isReturn
                                                                                    ? sp?.thongTinSanPhamTra?.tenSanPham
                                                                                    : sp?.sanPhamCT?.sanPham?.ten || 'Sản phẩm'
                                                                            }
                                                                            className="w-20 h-20 object-cover rounded-xl border border-gray-200"
                                                                        />
                                                                    </div>

                                                                    {/* Product Info */}
                                                                    <div className="flex-grow min-w-0">
                                                                        <div className="flex items-center gap-2 mb-2">
                                                                            <h4 className="font-medium text-gray-800 text-base line-clamp-2">
                                                                                {isReturn
                                                                                    ? sp?.thongTinSanPhamTra?.tenSanPham
                                                                                    : sp?.sanPhamCT?.sanPham?.ten || 'Sản phẩm'}
                                                                            </h4>
                                                                            {!isReturn && sp?.trangThaiTraHang && (
                                                                                <div className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-orange-100 text-orange-700 rounded-full border border-orange-200">
                                                                                    <RotateCcw className="w-3 h-3" />
                                                                                    <span>Đã tạo phiếu trả</span>
                                                                                </div>
                                                                            )}
                                                                        </div>

                                                                        <div className="flex items-center gap-4 text-sm text-gray-600">
                                                                            <div className="flex items-center gap-1">
                                                                                <Tag className="w-3 h-3" />
                                                                                <span>
                                                                                    {isReturn
                                                                                        ? `${sp?.thongTinSanPhamTra?.tenMauSac || ''}, ${sp?.thongTinSanPhamTra?.tenTrongLuong || ''}, ${sp?.thongTinSanPhamTra?.tenDoCung || ''}`
                                                                                        : `${sp?.sanPhamCT?.mauSac?.ten || ''}, ${sp?.sanPhamCT?.trongLuong?.ten || ''}, ${sp?.sanPhamCT?.doCung?.ten || ''}`}
                                                                                </span>
                                                                            </div>
                                                                            <div className="flex items-center gap-1">
                                                                                <Package className="w-3 h-3" />
                                                                                <span>x{quantity}</span>
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    {/* Price */}
                                                                    <div className="text-right min-w-[140px]">
                                                                        <div className="flex items-center justify-end gap-2">
                                                                            <div className="text-sm text-gray-500">
                                                                                Đơn giá:
                                                                            </div>
                                                                            <div className="text-md font-semibold text-red-600">
                                                                                {formatCurrency(unitPrice)}
                                                                            </div>
                                                                            {discountPercent > 0 && (
                                                                                <div className="text-xs font-semibold text-white bg-red-500 px-2 py-0.5 rounded">
                                                                                    -{discountPercent}%
                                                                                </div>
                                                                            )}
                                                                        </div>

                                                                        {discountPercent > 0 && (
                                                                            <div className="text-xs text-gray-500 line-through mt-1 text-right">
                                                                                Giá gốc: {formatCurrency(originalPrice)}
                                                                            </div>
                                                                        )}

                                                                        <div className="text-sm text-gray-600 mt-2 text-right">
                                                                            Thành tiền:
                                                                        </div>
                                                                        <div className="text-lg font-bold text-gray-800 text-right">
                                                                            {formatCurrency(lineTotal)}
                                                                        </div>
                                                                        {discountPercent > 0 && (
                                                                            <div className="text-xs text-gray-500 mt-1 text-right">
                                                                                Tiết kiệm:{' '}
                                                                                {formatCurrency(
                                                                                    (originalPrice - unitPrice) * quantity,
                                                                                )}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                        
                                                        {/* Show "xem thêm" button if there are more products */}
                                                        {hasMoreProducts && (
                                                            <div className="flex justify-center pt-2">
                                                                <button
                                                                    onClick={() => toggleOrderExpansion(item.id)}
                                                                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                                                                >
                                                                    {isExpanded ? (
                                                                        <>
                                                                            <span>Thu gọn</span>
                                                                            <ChevronLeft className="w-4 h-4 rotate-90" />
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <span>Xem thêm {allProducts.length - 1} sản phẩm</span>
                                                                            <ChevronRight className="w-4 h-4 rotate-90" />
                                                                        </>
                                                                    )}
                                                                </button>
                                                            </div>
                                                        )}
                                                    </>
                                                );
                                            })()}
                                        </div>
                                    </div>

                                    {/* Order Footer */}
                                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <DollarSign className="w-4 h-4" />
                                                <span>{item.trangThai === 8 ? 'Số tiền hoàn lại:' : 'Tổng tiền:'}</span>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                <div className="text-right">
                                                    <div className="text-xl font-bold text-red-600">
                                                        {/* {formatCurrency(totalAmount)} */}

                                                        {formatCurrency(item.tongTien ?? subtotalFromProducts)}
                                                    </div>
                                                </div>

                                                <Link
                                                    to={`/profile/order-detail/${item.id}`}
                                                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                    Xem chi tiết
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {/* Pagination */}
                        {filteredBills.length > 0 && <Pagination />}
                    </>
                ) : (
                    <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Package className="w-10 h-10 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-800 mb-2">
                            {selectedTab === 'Trả hàng' ? 'Chưa có phiếu trả hàng nào' : 'Chưa có đơn hàng nào'}
                        </h3>
                        <p className="text-gray-600 mb-6">
                            {selectedTab === 'Trả hàng'
                                ? 'Bạn chưa có phiếu trả hàng nào'
                                : 'Bạn chưa có đơn hàng nào trong danh mục này'}
                        </p>
                        <Link
                            to="/san-pham"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors"
                        >
                            <ShoppingBag className="w-5 h-5" />
                            Mua sắm ngay
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}

export default UserOrder;