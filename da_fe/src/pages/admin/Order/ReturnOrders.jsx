import React, { useState, useEffect, useMemo } from 'react';
import { CircularProgress } from '@mui/material';
import {
    Visibility as VisibilityIcon,
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon,
    Schedule as ScheduleIcon,
    AttachMoney as AttachMoneyIcon,
    Search as SearchIcon,
    Close as CloseIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { useAdminAuth } from '../../../contexts/adminAuthContext';

function ReturnOrders() {
    const [returnOrders, setReturnOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [selectedStatus, setSelectedStatus] = useState('PENDING');
    const [searchTerm, setSearchTerm] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [ordersPerPage] = useState(10);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [approvalNote, setApprovalNote] = useState('');
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmOrderId, setConfirmOrderId] = useState(null);
    const [productSelections, setProductSelections] = useState({});
    const [productReasons, setProductReasons] = useState({});
    const [productQuantities, setProductQuantities] = useState({});
    const [productRestock, setProductRestock] = useState({});
    const [productBroken, setProductBroken] = useState({});
    const [successMessage, setSuccessMessage] = useState('');
    const [reasonErrors, setReasonErrors] = useState({});
    const [isProcessing, setIsProcessing] = useState(false);
    const [refundAmount, setRefundAmount] = useState(0);
    const [isCalculatingRefund, setIsCalculatingRefund] = useState(false);
    const [orderSubtotal, setOrderSubtotal] = useState(null);
    const [orderVoucher, setOrderVoucher] = useState(null);

    const { admin, role } = useAdminAuth();

    const getAuthToken = () => {
        return localStorage.getItem('adminToken');
    };

    const hasPermission = () => {
        return admin && (role === 'ROLE_ADMIN' || role === 'ROLE_STAFF');
    };

    const fetchReturnOrders = async () => {
        try {
            setLoading(true);
            const token = getAuthToken();

            if (!token) {
                setError('Không có token xác thực');
                return;
            }

            if (!hasPermission()) {
                setError('Bạn không có quyền truy cập trang này');
                return;
            }

            const response = await axios.get('http://localhost:8080/phieu-tra-hang/all', {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.data.code === 1000) {
                const mappedResult = response.data.result.map((order) => ({
                    ...order,
                    chiTietTraHang:
                        order.chiTietTraHang?.map((detail) => ({
                            ...detail,
                            soLuongDuocPheDuyet:
                                typeof detail.soLuongPheDuyet === 'number' ? detail.soLuongPheDuyet : 0,
                            lyDoXuLy: detail.ghiChuNhanVien || '',
                        })) || [],
                }));
                setReturnOrders(mappedResult);
                setFilteredOrders(mappedResult);
            } else {
                setError('Có lỗi khi lấy dữ liệu');
            }
        } catch (error) {
            if (error.response?.status === 403) {
                setError('Bạn không có quyền truy cập dữ liệu này');
            } else if (error.response?.status === 401) {
                setError('Token không hợp lệ hoặc đã hết hạn');
            } else {
                setError('Không thể kết nối đến server');
            }
        } finally {
            setLoading(false);
        }
    };

    const calculateRefundAmount = async (phieuTraHangId) => {
        try {
            setIsCalculatingRefund(true);
            const token = getAuthToken();
            
            const response = await axios.get(
                `http://localhost:8080/phieu-tra-hang/${phieuTraHangId}/calculate-refund`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );
            
            if (response.data.code === 1000) {
                setRefundAmount(response.data.result);
            }
        } catch (error) {
            console.error('Lỗi khi tính toán số tiền hoàn trả:', error);
            setRefundAmount(0);
        } finally {
            setIsCalculatingRefund(false);
        }
    };

    useEffect(() => {
        if (hasPermission()) {
            fetchReturnOrders();
        }
    }, [admin, role]);

    // Ước tính tỷ lệ voucher giống trang khách nếu thiếu dữ liệu giảm giá trước khi duyệt
    const getDiscountRatio = (voucher, subtotal) => {
        if (!voucher || !subtotal || subtotal <= 0) return 0;
        let discountAmount = 0;
        const type = voucher.kieuGiaTri;
        if (type === 0 || (type === 1 && voucher?.schema === 'percent')) {
            discountAmount = subtotal * (Number(voucher.giaTri || 0) / 100);
            if (voucher.giaTriMax) discountAmount = Math.min(discountAmount, Number(voucher.giaTriMax));
        } else {
            discountAmount = Number(voucher.giaTri || 0);
        }
        discountAmount = Math.min(discountAmount, subtotal);
        return Math.min(discountAmount / subtotal, 1);
    };

    const predictedRatio = useMemo(() => {
        if (!orderVoucher || !orderSubtotal) return null;
        return getDiscountRatio(orderVoucher, Number(orderSubtotal));
    }, [orderVoucher, orderSubtotal]);

    // Khi mở modal chi tiết, nếu thiếu tyLeGiamGia/soTienHoanTra thì lấy thông tin đơn gốc để ước tính
    useEffect(() => {
        const fetchOrderInfo = async () => {
            try {
                if (!selectedOrder?.hoaDonId) return;
                const token = getAuthToken();
                const headers = token ? { Authorization: `Bearer ${token}` } : {};
                const ctRes = await axios.get(`http://localhost:8080/api/hoa-don-ct/hoa-don/${selectedOrder.hoaDonId}`, { headers });
                const items = Array.isArray(ctRes.data) ? ctRes.data : [];
                const subtotal = items.reduce((sum, it) => sum + Number(it.giaBan || 0) * Number(it.soLuong || 0), 0);
                const hdRes = await axios.get(`http://localhost:8080/api/hoa-don/${selectedOrder.hoaDonId}`, { headers });
                const voucher = hdRes?.data?.voucher || null;
                setOrderSubtotal(subtotal);
                setOrderVoucher(voucher);
            } catch (e) {
                console.warn('Không thể lấy thông tin đơn gốc để ước tính voucher ratio (admin):', e);
            }
        };

        if (showDetailModal && selectedOrder?.chiTietTraHang?.length) {
            const missingAdjusted = selectedOrder.chiTietTraHang.some(
                (ct) => ct?.tyLeGiamGia == null && ct?.soTienHoanTra == null,
            );
            if (missingAdjusted) fetchOrderInfo();
        }
    }, [showDetailModal, selectedOrder]);

    useEffect(() => {
        let filtered = returnOrders;

        filtered = filtered.filter((order) => order.trangThai === selectedStatus);

        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            filtered = filtered.filter((order) => {
                const matchId = order.id.toString().includes(searchLower);
                const matchMaPhieuTraHang =
                    order.maPhieuTraHang && order.maPhieuTraHang.toLowerCase().includes(searchLower);
                const matchHoaDonMa = order.hoaDonMa && order.hoaDonMa.toString().toLowerCase().includes(searchLower);
                const matchHoTen = order.hoTenKhachHang && order.hoTenKhachHang.toLowerCase().includes(searchLower);
                const matchEmail = order.emailKhachHang && order.emailKhachHang.toLowerCase().includes(searchLower);
                return matchId || matchMaPhieuTraHang || matchHoaDonMa || matchHoTen || matchEmail;
            });
        }

        if (startDate) {
            const startDateTime = new Date(startDate + 'T00:00:00');
            filtered = filtered.filter((order) => {
                const orderDate = new Date(order.ngayTao.replace(' ', 'T'));
                return orderDate >= startDateTime;
            });
        }
        if (endDate) {
            const endDateTime = new Date(endDate + 'T23:59:59');
            filtered = filtered.filter((order) => {
                const orderDate = new Date(order.ngayTao.replace(' ', 'T'));
                return orderDate <= endDateTime;
            });
        }

        // Sắp xếp theo thời gian tạo tăng dần (gửi trước đứng trước)
        filtered = [...filtered].sort((a, b) => {
            const da = new Date((a.ngayTao || '').toString().replace(' ', 'T')).getTime();
            const db = new Date((b.ngayTao || '').toString().replace(' ', 'T')).getTime();
            return (isNaN(da) ? 0 : da) - (isNaN(db) ? 0 : db);
        });

        setFilteredOrders(filtered);
        setCurrentPage(1);
    }, [selectedStatus, searchTerm, startDate, endDate, returnOrders]);

    const getStatusInfo = (status) => {
        switch (status) {
            case 'PENDING':
                return {
                    label: 'Chờ xử lý',
                    color: 'bg-yellow-200 text-yellow-800',
                    icon: ScheduleIcon,
                };
            case 'APPROVED':
                return {
                    label: 'Đã phê duyệt',
                    color: 'bg-green-200 text-green-800',
                    icon: CheckCircleIcon,
                };
            case 'REJECTED':
                return {
                    label: 'Đã từ chối',
                    color: 'bg-red-200 text-red-800',
                    icon: CancelIcon,
                };
            case 'REFUNDED':
                return {
                    label: 'Đã hoàn tiền',
                    color: 'bg-blue-200 text-blue-800',
                    icon: AttachMoneyIcon,
                };
            default:
                return {
                    label: 'Không xác định',
                    color: 'bg-gray-200 text-gray-800',
                    icon: ScheduleIcon,
                };
        }
    };

    const handleViewDetail = (order) => {
        setSelectedOrder(order);
        setShowDetailModal(true);
        setApprovalNote('');
        setReasonErrors({});
        
        // Reset refund amount và tính toán lại
        setRefundAmount(0);
        if (order && order.id) {
            calculateRefundAmount(order.id);
        }

        const initialSelections = {};
        const initialReasons = {};
        const initialQuantities = {};
        const initialRestock = {};
        const initialBroken = {};

        if (order.chiTietTraHang && order.chiTietTraHang.length > 0) {
            order.chiTietTraHang.forEach((detail) => {
                const key = detail.thongTinSanPhamTra?.hoaDonChiTietId ?? detail.id;
                if (order.trangThai === 'APPROVED') {
                    initialSelections[key] = detail.soLuongDuocPheDuyet > 0;
                    initialQuantities[key] = detail.soLuongDuocPheDuyet ?? 0;
                    initialRestock[key] = typeof detail.soLuongNhapKho === 'number' ? detail.soLuongNhapKho : 0;
                    initialBroken[key] = typeof detail.soLuongHong === 'number' ? detail.soLuongHong : 0;
                } else {
                    initialSelections[key] = true;
                    initialQuantities[key] = detail.soLuongTra;
                    initialRestock[key] = detail.soLuongTra; // mặc định nhập kho toàn bộ
                    initialBroken[key] = 0;
                }
                initialReasons[key] = detail.lyDoXuLy || '';
            });
        }

        setProductSelections(initialSelections);
        setProductReasons(initialReasons);
        setProductQuantities(initialQuantities);
        setProductRestock(initialRestock);
        setProductBroken(initialBroken);
    };

    const openConfirmModal = (orderId) => {
        const newReasonErrors = {};
        let hasError = false;
        if (selectedOrder && selectedOrder.chiTietTraHang) {
            selectedOrder.chiTietTraHang.forEach((detail) => {
                const key = detail.thongTinSanPhamTra?.hoaDonChiTietId ?? detail.id;
                const reason = (productReasons[key] || '').trim();
                if (!reason) {
                    newReasonErrors[key] = true;
                    hasError = true;
                }
                // Validate tổng nhập kho + hỏng = số lượng được duyệt
                const approvedQty = productSelections[key] ? (productQuantities[key] ?? 0) : 0;
                const restockQty = productRestock[key] ?? 0;
                const brokenQty = productBroken[key] ?? 0;
                if (approvedQty !== restockQty + brokenQty) {
                    hasError = true;
                    newReasonErrors[key] = true;
                }
            });
        }

        if (hasError) {
            setReasonErrors(newReasonErrors);
            return;
        }

        setConfirmOrderId(orderId);
        setShowConfirmModal(true);
    };

    const handleProcessReturnOrder = async (orderId) => {
        if (isProcessing) return;

        try {
            setIsProcessing(true);
            const token = getAuthToken();
            if (!hasPermission()) {
                setError('Bạn không có quyền thực hiện hành động này');
                setShowConfirmModal(false);
                return;
            }

            if (!selectedOrder || !selectedOrder.chiTietTraHang) {
                setError('Không có dữ liệu sản phẩm');
                setShowConfirmModal(false);
                return;
            }

            const chiTietPheDuyet = selectedOrder.chiTietTraHang.map((detail) => {
                const key = detail.thongTinSanPhamTra?.hoaDonChiTietId ?? detail.id;
                const isSelected = productSelections[key];
                const soLuongDuocPheDuyet = isSelected ? (productQuantities[key] ?? 0) : 0;
                const lyDoXuLy = (productReasons[key] || '').trim();
                const soLuongNhapKho = isSelected ? (productRestock[key] ?? 0) : 0;
                const soLuongHong = isSelected ? (productBroken[key] ?? 0) : 0;
                return {
                    phieuTraHangChiTietId: detail.id,
                    hoaDonChiTietId: detail.thongTinSanPhamTra.hoaDonChiTietId,
                    soLuongDuocPheDuyet: soLuongDuocPheDuyet,
                    soLuongNhapKho: soLuongNhapKho,
                    soLuongHong: soLuongHong,
                    lyDoXuLy: lyDoXuLy || (isSelected ? 'Được phê duyệt' : 'Không được phê duyệt'),
                };
            });

            await axios.put(
                'http://localhost:8080/phieu-tra-hang',
                {
                    phieuTraHangId: orderId,
                    ghiChuNhanVien: approvalNote.trim(),
                    chiTietPheDuyet: chiTietPheDuyet,
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                },
            );

            await fetchReturnOrders();
            setShowDetailModal(false);
            setShowConfirmModal(false);
            setReasonErrors({});

            setSuccessMessage('Phê duyệt thành công');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error) {
            setError('Có lỗi khi xử lý phiếu trả hàng');
            setShowConfirmModal(false);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleRefund = async (orderId) => {
        if (isProcessing) return;

        try {
            setIsProcessing(true);
            const token = getAuthToken();
            if (!hasPermission()) {
                setError('Bạn không có quyền thực hiện hành động này');
                return;
            }

            const confirmRefund = window.confirm('Bạn có chắc chắn muốn hoàn tiền cho phiếu trả hàng này?');
            if (!confirmRefund) return;

            setShowDetailModal(false);
        } catch (error) {
            setError('Có lỗi khi thực hiện hoàn tiền');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleProductSelectionChange = (productKey, isSelected) => {
        if (selectedOrder && selectedOrder.trangThai === 'APPROVED') return;
        setProductSelections((prev) => ({
            ...prev,
            [productKey]: isSelected,
        }));
        if (!isSelected) {
            setProductQuantities((prev) => ({
                ...prev,
                [productKey]: 0,
            }));
            setProductRestock((prev) => ({
                ...prev,
                [productKey]: 0,
            }));
            setProductBroken((prev) => ({
                ...prev,
                [productKey]: 0,
            }));
        } else {
            if (selectedOrder && selectedOrder.chiTietTraHang) {
                const detail = selectedOrder.chiTietTraHang.find((d) => {
                    const key = d.thongTinSanPhamTra?.hoaDonChiTietId ?? d.id;
                    return key === productKey;
                });
                setProductQuantities((prev) => ({
                    ...prev,
                    [productKey]: detail ? detail.soLuongTra : 1,
                }));
                setProductRestock((prev) => ({
                    ...prev,
                    [productKey]: detail ? detail.soLuongTra : 1,
                }));
                setProductBroken((prev) => ({
                    ...prev,
                    [productKey]: 0,
                }));
            }
        }
    };

    const handleProductReasonChange = (productKey, reason) => {
        setProductReasons((prev) => ({
            ...prev,
            [productKey]: reason,
        }));
        if (reason.trim()) {
            setReasonErrors((prev) => ({
                ...prev,
                [productKey]: false,
            }));
        }
    };

    const handleProductQuantityChange = (productKey, quantity) => {
        setProductQuantities((prev) => ({
            ...prev,
            [productKey]: quantity,
        }));
    };

    const handleProductRestockChange = (productKey, quantity) => {
        setProductRestock((prev) => ({
            ...prev,
            [productKey]: quantity,
        }));
    };

    const handleProductBrokenChange = (productKey, quantity) => {
        setProductBroken((prev) => ({
            ...prev,
            [productKey]: quantity,
        }));
    };

    const hasSelectedProducts = () => {
        return Object.values(productSelections).some((selected) => selected);
    };

    const getSelectedProducts = () => {
        if (!selectedOrder || !selectedOrder.chiTietTraHang) return [];
        return selectedOrder.chiTietTraHang.filter((detail) => {
            const key = detail.thongTinSanPhamTra?.hoaDonChiTietId ?? detail.id;
            return productSelections[key];
        });
    };

    const getRejectedProducts = () => {
        if (!selectedOrder || !selectedOrder.chiTietTraHang) return [];
        return selectedOrder.chiTietTraHang.filter((detail) => {
            const key = detail.thongTinSanPhamTra?.hoaDonChiTietId ?? detail.id;
            return !productSelections[key];
        });
    };

    const getRejectedQuantity = (product) => {
        if (selectedOrder && selectedOrder.trangThai === 'APPROVED') {
            const soLuongTra = product.soLuongTra || 0;
            const soLuongDuocPheDuyet =
                typeof product.soLuongDuocPheDuyet === 'number' ? product.soLuongDuocPheDuyet : 0;
            return Math.max(soLuongTra - soLuongDuocPheDuyet, 0);
        }
        const key = product.thongTinSanPhamTra?.hoaDonChiTietId ?? product.id;
        if (!productSelections[key]) {
            return product.soLuongTra || 0;
        }
        return Math.max((product.soLuongTra || 0) - (productQuantities[key] || 0), 0);
    };

    const getTotalRejectedQuantity = () => {
        if (!selectedOrder || !selectedOrder.chiTietTraHang) return 0;
        return selectedOrder.chiTietTraHang.reduce((sum, detail) => sum + getRejectedQuantity(detail), 0);
    };

    const getTotalRejectedValue = () => {
        if (!selectedOrder || !selectedOrder.chiTietTraHang) return 0;
        return selectedOrder.chiTietTraHang.reduce((sum, detail) => {
            const rejectedQty = getRejectedQuantity(detail);
            return sum + detail.thongTinSanPhamTra.giaBan * rejectedQty;
        }, 0);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(amount);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        let dateObj;
        if (typeof dateString === 'string' && dateString.includes(' ')) {
            dateObj = new Date(dateString.replace(' ', 'T'));
        } else {
            dateObj = new Date(dateString);
        }
        if (isNaN(dateObj.getTime())) return '';
        return dateObj.toLocaleDateString('vi-VN');
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return '';
        let dateObj;
        if (typeof dateString === 'string' && dateString.includes(' ')) {
            dateObj = new Date(dateString.replace(' ', 'T'));
        } else {
            dateObj = new Date(dateString);
        }
        if (isNaN(dateObj.getTime())) return '';
        return dateObj.toLocaleString('vi-VN', { hour12: false });
    };

    const indexOfLastOrder = currentPage * ordersPerPage;
    const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
    const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
    const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

    if (!hasPermission()) {
        return (
            <div className="p-6">
                <div className="font-bold text-sm mb-4">Quản lý phiếu trả hàng</div>
                <div className="bg-white p-4 rounded-md shadow-md">
                    <div className="flex justify-center items-center h-32">
                        <div className="text-red-500">
                            {!admin
                                ? 'Vui lòng đăng nhập để truy cập trang này'
                                : 'Bạn không có quyền truy cập trang này'}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="p-6">
                <div className="font-bold text-sm mb-4">Quản lý phiếu trả hàng</div>
                <div className="bg-white p-4 rounded-md shadow-md">
                    <div className="flex justify-center items-center h-32">
                        <div className="text-gray-500">Đang tải dữ liệu...</div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <div className="font-bold text-sm mb-4">Quản lý phiếu trả hàng</div>
                <div className="bg-white p-4 rounded-md shadow-md">
                    <div className="flex justify-center items-center h-32">
                        <div className="text-red-500">{error}</div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="font-bold text-sm mb-4">
                Quản lý phiếu trả hàng
                <span className="text-xs text-gray-500 ml-2">(Đăng nhập với quyền: {role})</span>
            </div>

            <div className="bg-white p-4 rounded-md shadow-md">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800">Phiếu trả hàng</h2>
                        <p className="text-sm text-gray-600">Theo dõi và xử lý các yêu cầu trả hàng từ khách hàng</p>
                    </div>
                    <div className="flex space-x-4">
                        <div className="bg-blue-50 p-3 rounded-lg text-center">
                            <div className="text-2xl font-bold text-blue-600">
                                {returnOrders.filter((order) => order.trangThai === 'PENDING').length}
                            </div>
                            <div className="text-sm text-blue-600">Chờ xử lý</div>
                        </div>
                        <div className="bg-green-50 p-3 rounded-lg text-center">
                            <div className="text-2xl font-bold text-green-600">
                                {returnOrders.filter((order) => order.trangThai === 'APPROVED').length}
                            </div>
                            <div className="text-sm text-green-600">Đã phê duyệt</div>
                        </div>
                    </div>
                </div>

                {/* Tabs trạng thái */}
                <div className="flex gap-2 mb-4 overflow-x-auto">
                    {[
                        { key: 'PENDING', label: 'Chờ phê duyệt' },
                        { key: 'APPROVED', label: 'Đã duyệt' },
                        { key: 'REFUNDED', label: 'Đã hoàn tiền' },
                        { key: 'REJECTED', label: 'Đã từ chối' },
                    ].map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setSelectedStatus(tab.key)}
                            className={`px-4 py-2 text-sm rounded-md border transition-colors ${
                                selectedStatus === tab.key
                                    ? 'bg-blue-600 text-white border-blue-600'
                                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                            }`}
                            disabled={isProcessing}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div className="relative">
                        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo mã PTH, mã HĐ, tên KH, email..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            disabled={isProcessing}
                        />
                    </div>
                    <div></div>
                    <div>
                        <input
                            type="date"
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            placeholder="Từ ngày"
                            disabled={isProcessing}
                        />
                    </div>
                    <div>
                        <input
                            type="date"
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            placeholder="Đến ngày"
                            disabled={isProcessing}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full table-auto border-collapse border border-gray-200">
                        <thead>
                            <tr className="bg-gray-200 text-gray-700">
                                <th className="py-4 px-6 text-left">Mã Phiếu Trả Hàng</th>
                                <th className="py-4 px-6 text-left">Mã HĐ</th>
                                <th className="py-4 px-6 text-left">Khách hàng</th>
                                <th className="py-4 px-6 text-left">Ngày tạo</th>
                                <th className="py-4 px-6 text-left">Hình thức</th>
                                <th className="py-4 px-6 text-left">Trạng thái</th>
                                <th className="py-4 px-6 text-left">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentOrders.map((order) => {
                                const statusInfo = getStatusInfo(order.trangThai);
                                const StatusIcon = statusInfo.icon;

                                return (
                                    <tr key={order.id} className="hover:bg-gray-50 border-b border-gray-200">
                                        <td className="py-4 px-6">
                                            <div className="text-sm font-medium text-gray-900">
                                                {order.maPhieuTraHang}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="text-sm text-gray-900">{order.hoaDonMa}</div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="text-sm text-gray-900">
                                                <div className="font-medium">{order.hoTenKhachHang}</div>
                                                <div className="text-gray-500 text-xs">{order.emailKhachHang}</div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="text-sm text-gray-900">{formatDate(order.ngayTao)}</div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="text-sm text-gray-900">{order.hinhThucTra}</div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}
                                            >
                                                <StatusIcon className="h-3 w-3 mr-1" />
                                                {statusInfo.label}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <button
                                                onClick={() => handleViewDetail(order)}
                                                className="text-blue-600 hover:text-blue-900 p-1 rounded"
                                                title="Xem chi tiết"
                                                disabled={isProcessing}
                                            >
                                                <VisibilityIcon className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {currentOrders.length === 0 && (
                    <div className="text-center py-8 text-gray-500">Không có phiếu trả hàng nào</div>
                )}

                {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-4">
                        <div className="text-sm text-gray-700">
                            Hiển thị {indexOfFirstOrder + 1} đến {Math.min(indexOfLastOrder, filteredOrders.length)}{' '}
                            trong tổng số {filteredOrders.length} kết quả
                        </div>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => setCurrentPage(currentPage - 1)}
                                disabled={currentPage === 1 || isProcessing}
                                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Trước
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`px-3 py-2 text-sm font-medium rounded-md ${
                                        currentPage === page
                                            ? 'bg-blue-600 text-white'
                                            : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                                    } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    disabled={isProcessing}
                                >
                                    {page}
                                </button>
                            ))}
                            <button
                                onClick={() => setCurrentPage(currentPage + 1)}
                                disabled={currentPage === totalPages || isProcessing}
                                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Sau
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {showDetailModal && selectedOrder && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-50">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-[1200px] max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-gray-900">
                                Chi tiết phiếu trả hàng: {selectedOrder.maPhieuTraHang}
                            </h3>
                            <button
                                onClick={() => setShowDetailModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                                disabled={isProcessing}
                            >
                                <CloseIcon className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-medium text-gray-900 mb-2">Thông tin khách hàng</h4>
                                <div className="space-y-1 text-sm">
                                    <div>
                                        <span className="font-medium">Họ tên:</span> {selectedOrder.hoTenKhachHang}
                                    </div>
                                    <div>
                                        <span className="font-medium">Email:</span> {selectedOrder.emailKhachHang}
                                    </div>
                                    <div>
                                        <span className="font-medium">SĐT:</span>{' '}
                                        {selectedOrder.sdtKhachHang || 'Chưa có'}
                                    </div>
                                    <div>
                                        <span className="font-medium">Địa chỉ:</span>{' '}
                                        {selectedOrder.diaChiKhachHang || 'Chưa có'}
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-medium text-gray-900 mb-2">Thông tin xử lý</h4>
                                <div className="space-y-1 text-sm">
                                    <div>
                                        <span className="font-medium">Ngày tạo:</span>{' '}
                                        {formatDateTime(selectedOrder.ngayTao)}
                                    </div>
                                    <div>
                                        <span className="font-medium">Ngày xử lý:</span>{' '}
                                        {selectedOrder.ngayXuLy ? formatDateTime(selectedOrder.ngayXuLy) : 'Chưa xử lý'}
                                    </div>
                                    <div>
                                        <span className="font-medium">Ngày cập nhật:</span>{' '}
                                        {selectedOrder.ngayCapNhat
                                            ? formatDateTime(selectedOrder.ngayCapNhat)
                                            : 'Chưa cập nhật'}
                                    </div>
                                    <div>
                                        <span className="font-medium">Hình thức:</span> {selectedOrder.hinhThucTra}
                                    </div>
                                    <div>
                                        <span className="font-medium">Staff Email:</span>{' '}
                                        {selectedOrder.staffEmail || 'Chưa phân công'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mb-6">
                            <h4 className="font-medium text-gray-900 mb-2">Ghi chú khách hàng</h4>
                            <div className="bg-gray-50 p-3 rounded-lg text-sm">
                                {selectedOrder.ghiChuKhachHang || selectedOrder.ghiChu || 'Không có ghi chú'}
                            </div>
                        </div>

                        <div className="mb-6">
                            <h4 className="font-medium text-gray-900 mb-2">Chi tiết sản phẩm trả</h4>
                            <div className="mb-3 p-3 bg-blue-50 rounded-lg">
                                <p className="text-sm text-blue-700">
                                    <strong>Hướng dẫn:</strong> Chọn các sản phẩm được phép trả hàng, nhập số lượng duyệt, số lượng nhập kho và số lượng hỏng. Tổng nhập kho + hỏng phải bằng số lượng được duyệt. Ghi chú nhân viên để mô tả lý do hàng hỏng.
                                </p>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full table-auto border-collapse border border-gray-200">
                                    <thead>
                                        <tr className="bg-gray-200 text-gray-700">
                                            <th className="py-2 px-3 text-left text-xs font-medium w-8">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedOrder.chiTietTraHang?.every((detail) => {
                                                        const key =
                                                            detail.thongTinSanPhamTra?.hoaDonChiTietId ?? detail.id;
                                                        return productSelections[key];
                                                    })}
                                                    onChange={(e) => {
                                                        if (selectedOrder.trangThai === 'APPROVED' || isProcessing)
                                                            return;
                                                        const newSelections = {};
                                                        const newQuantities = {};
                                                        const newRestock = {};
                                                        const newBroken = {};
                                                        selectedOrder.chiTietTraHang?.forEach((detail) => {
                                                            const key =
                                                                detail.thongTinSanPhamTra?.hoaDonChiTietId ?? detail.id;
                                                            newSelections[key] = e.target.checked;
                                                            newQuantities[key] = e.target.checked
                                                                ? detail.soLuongTra
                                                                : 0;
                                                            newRestock[key] = e.target.checked ? detail.soLuongTra : 0;
                                                            newBroken[key] = 0;
                                                        });
                                                        setProductSelections(newSelections);
                                                        setProductQuantities(newQuantities);
                                                        setProductRestock(newRestock);
                                                        setProductBroken(newBroken);
                                                    }}
                                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                    disabled={selectedOrder.trangThai === 'APPROVED' || isProcessing}
                                                />
                                            </th>
                                            <th className="py-2 px-3 text-left text-xs font-medium w-32">
                                                Mã Sản phẩm chi tiết
                                            </th>
                                            <th className="py-2 px-3 text-left text-xs font-medium w-48">
                                                Tên sản phẩm
                                            </th>
                                            <th className="py-2 px-3 text-left text-xs font-medium w-20">
                                                Thương hiệu
                                            </th>
                                            <th className="py-2 px-3 text-left text-xs font-medium w-20">Màu sắc</th>
                                            <th className="py-2 px-3 text-left text-xs font-medium w-20">Chất liệu</th>
                                            <th className="py-2 px-3 text-left text-xs font-medium w-20">
                                                Trọng lượng
                                            </th>
                                            <th className="py-2 px-3 text-left text-xs font-medium w-24">
                                                Điểm cân bằng
                                            </th>
                                            <th className="py-2 px-3 text-left text-xs font-medium w-16">Độ cứng</th>
                                            <th className="py-2 px-3 text-left text-xs font-medium w-20">
                                                SL trả
                                            </th>
                                            <th className="py-2 px-3 text-left text-xs font-medium w-20">Đơn giá</th>
                                            <th className="py-2 px-3 text-left text-xs font-medium w-100">
                                                Lý do trả hàng
                                            </th>
                                            <th className="py-2 px-3 text-left text-xs font-medium w-28">
                                                SL duyệt
                                            </th>
                                            <th className="py-2 px-3 text-left text-xs font-medium w-96">
                                                Lý do xử lí
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedOrder.chiTietTraHang.map((detail) => {
                                            const key = detail.thongTinSanPhamTra?.hoaDonChiTietId ?? detail.id;
                                            const isApproved = selectedOrder.trangThai === 'APPROVED';
                                            const soLuongDuocPheDuyet =
                                                typeof detail.soLuongDuocPheDuyet === 'number'
                                                    ? detail.soLuongDuocPheDuyet
                                                    : (productQuantities[key] ?? 0);
                                            const soLuongKhongDuocDuyet =
                                                (detail.soLuongTra || 0) - (soLuongDuocPheDuyet || 0);

                                            // Giá gốc và giá hoàn (đã trừ voucher) cho mỗi dòng
                                            const unitOriginal = Number(
                                                detail.thongTinSanPhamTra?.giaBan ?? detail.donGiaGoc ?? 0,
                                            );
                                            const qtyApproved = Number(soLuongDuocPheDuyet || 0);
                                            const unitAdjusted = (() => {
                                                if (typeof detail.soTienHoanTra === 'number' && qtyApproved > 0) {
                                                    return Number(detail.soTienHoanTra) / qtyApproved;
                                                }
                                                if (typeof detail.tyLeGiamGia === 'number') {
                                                    return unitOriginal * (1 - Number(detail.tyLeGiamGia));
                                                }
                                                if (typeof predictedRatio === 'number') {
                                                    return unitOriginal * (1 - predictedRatio);
                                                }
                                                return unitOriginal;
                                            })();
                                            return (
                                                <tr key={key} className="border-b border-gray-200">
                                                    <td className="py-2 px-3">
                                                        <input
                                                            type="checkbox"
                                                            checked={productSelections[key] || false}
                                                            onChange={(e) =>
                                                                handleProductSelectionChange(key, e.target.checked)
                                                            }
                                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                            disabled={isApproved || isProcessing}
                                                        />
                                                    </td>
                                                    <td className="py-2 px-3 text-sm text-gray-900">
                                                        {detail.thongTinSanPhamTra.maSanPhamChiTiet}
                                                    </td>
                                                    <td className="py-2 px-3 text-sm text-gray-900 font-medium break-words">
                                                        {detail.thongTinSanPhamTra.tenSanPham}
                                                    </td>
                                                    <td className="py-2 px-3 text-sm text-gray-900">
                                                        {detail.thongTinSanPhamTra.tenThuongHieu}
                                                    </td>
                                                    <td className="py-2 px-3 text-sm text-gray-900">
                                                        <div className="flex items-center">
                                                            <span
                                                                className="inline-block w-3 h-3 rounded-full mr-1"
                                                                style={{
                                                                    backgroundColor:
                                                                        detail.thongTinSanPhamTra.tenMauSac === 'Đỏ'
                                                                            ? '#ef4444'
                                                                            : detail.thongTinSanPhamTra.tenMauSac ===
                                                                                'Xanh'
                                                                              ? '#3b82f6'
                                                                              : '#6b7280',
                                                                }}
                                                            ></span>
                                                            {detail.thongTinSanPhamTra.tenMauSac}
                                                        </div>
                                                    </td>
                                                    <td className="py-2 px-3 text-sm text-gray-900">
                                                        {detail.thongTinSanPhamTra.tenChatLieu}
                                                    </td>
                                                    <td className="py-2 px-3 text-sm text-gray-900">
                                                        {detail.thongTinSanPhamTra.tenTrongLuong}
                                                    </td>
                                                    <td className="py-2 px-3 text-sm text-gray-900">
                                                        {detail.thongTinSanPhamTra.tenDiemCanBang}
                                                    </td>
                                                    <td className="py-2 px-3 text-sm text-gray-900">
                                                        {detail.thongTinSanPhamTra.tenDoCung}
                                                    </td>
                                                    <td className="py-2 px-3 text-sm text-gray-900 font-medium">
                                                        <div className="flex flex-col">
                                                            <div className="text-xs text-gray-500">Yêu cầu: {detail.soLuongTra}</div>
                                                            {isApproved ? (
                                                                <>
                                                                    <div className="text-xs text-green-700 font-semibold mt-1">
                                                                        Đã phê duyệt: {soLuongDuocPheDuyet}
                                                                    </div>
                                                                    {soLuongKhongDuocDuyet > 0 && (
                                                                        <div className="text-xs text-red-700 font-semibold mt-1">
                                                                            Không được duyệt: {soLuongKhongDuocDuyet}
                                                                        </div>
                                                                    )}
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <input
                                                                        type="number"
                                                                        value={
                                                                            productSelections[key]
                                                                                ? (productQuantities[key] ?? detail.soLuongTra)
                                                                                : ''
                                                                        }
                                                                        onChange={(e) => {
                                                                            const value = parseInt(e.target.value) || 0;
                                                                            const maxValue = detail.soLuongTra;
                                                                            if (value >= 0 && value <= maxValue) {
                                                                                handleProductQuantityChange(key, value);
                                                                                // điều chỉnh mặc định: nhập kho = value nếu hiện tại lớn hơn value
                                                                                if ((productRestock[key] ?? 0) > value) {
                                                                                    handleProductRestockChange(key, value);
                                                                                }
                                                                                // đảm bảo tổng restock+broken không vượt approved
                                                                                const broken = productBroken[key] ?? 0;
                                                                                if (broken > value) {
                                                                                    handleProductBrokenChange(key, Math.max(0, value - (productRestock[key] ?? 0)));
                                                                                }
                                                                            }
                                                                        }}
                                                                        className="w-16 px-2 py-1 border border-gray-300 rounded-md text-center text-sm"
                                                                        min="0"
                                                                        max={detail.soLuongTra}
                                                                        disabled={!productSelections[key] || isProcessing}
                                                                        placeholder={!productSelections[key] ? '-' : undefined}
                                                                    />
                                                                </>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="py-2 px-3 text-sm text-gray-900 font-medium">
                                                        <div className="flex flex-col">
                                                            <span className="text-gray-400 line-through">
                                                                {formatCurrency(unitOriginal)}
                                                            </span>
                                                            <span className="text-red-600 font-semibold">
                                                                {formatCurrency(unitAdjusted)}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="py-2 px-3">
                                                        <div className="text-sm text-gray-900 break-words">
                                                            {detail.lyDoTraHang || 'Không có lý do'}
                                                        </div>
                                                    </td>
                                                    <td className="py-2 px-3 text-sm text-gray-900">
                                                        {isApproved ? (
                                                            <div className="text-center font-medium">{soLuongDuocPheDuyet}</div>
                                                        ) : (
                                                            <div className="text-center font-medium">{productSelections[key] ? (productQuantities[key] ?? 0) : 0}</div>
                                                        )}
                                                    </td>
                                                    <td className="py-2 px-3">
                                                        <textarea
                                                            placeholder={
                                                                productSelections[key]
                                                                    ? 'Nhập lý do xử lí...'
                                                                    : 'Lý do không được trả...'
                                                            }
                                                            value={productReasons[key] || ''}
                                                            onChange={(e) => handleProductReasonChange(key, e.target.value)}
                                                            className={`w-full p-2 text-xs border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                                                                reasonErrors[key] ? 'border-red-500' : 'border-gray-300'
                                                            }`}
                                                            rows="3"
                                                            disabled={isApproved || isProcessing}
                                                        />
                                                        {reasonErrors[key] && (
                                                            <p className="text-xs text-red-500 mt-1">
                                                                Vui lòng nhập lý do xử lí và đảm bảo tổng nhập kho + hỏng = số lượng duyệt
                                                            </p>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Khu vực nhập SL nhập kho và SL hỏng cho từng sản phẩm (ngoài bảng) */}
                            <div className="mt-4 p-4 border border-gray-200 rounded-lg">
                                <div className="font-medium text-gray-800 mb-2">Phân bổ SL nhập kho / SL hỏng</div>
                                <div className="space-y-3">
                                    {selectedOrder.chiTietTraHang.map((detail) => {
                                        const key = detail.thongTinSanPhamTra?.hoaDonChiTietId ?? detail.id;
                                        const isApproved = selectedOrder.trangThai === 'APPROVED';
                                        const approved = productQuantities[key] ?? 0;
                                        return (
                                            <div key={key} className={`grid grid-cols-1 md:grid-cols-3 gap-3 items-center ${!productSelections[key] ? 'opacity-60' : ''}`}>
                                                <div className="text-sm text-gray-800">
                                                    <div className="font-medium">{detail.thongTinSanPhamTra.tenSanPham}</div>
                                                    <div className="text-xs text-gray-500">SL duyệt: {isApproved ? (typeof detail.soLuongDuocPheDuyet === 'number' ? detail.soLuongDuocPheDuyet : 0) : approved}</div>
                                                </div>
                                                <div>
                                                    {isApproved ? (
                                                        <div className="text-sm">SL nhập kho: {typeof detail.soLuongNhapKho === 'number' ? detail.soLuongNhapKho : 0}</div>
                                                    ) : (
                                                        <input
                                                            type="number"
                                                            value={productSelections[key] ? (productRestock[key] ?? 0) : ''}
                                                            onChange={(e) => {
                                                                let val = parseInt(e.target.value) || 0;
                                                                if (val < 0) val = 0;
                                                                if (val > approved) val = approved;
                                                                handleProductRestockChange(key, val);
                                                                const broken = productBroken[key] ?? 0;
                                                                if (val + broken > approved) {
                                                                    handleProductBrokenChange(key, Math.max(0, approved - val));
                                                                }
                                                            }}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                                            min="0"
                                                            max={approved}
                                                            disabled={!productSelections[key] || isProcessing}
                                                            placeholder={!productSelections[key] ? '-' : 'SL nhập kho'}
                                                        />
                                                    )}
                                                </div>
                                                <div>
                                                    {isApproved ? (
                                                        <div className="text-sm">SL hỏng: {typeof detail.soLuongHong === 'number' ? detail.soLuongHong : 0}</div>
                                                    ) : (
                                                        <input
                                                            type="number"
                                                            value={productSelections[key] ? (productBroken[key] ?? 0) : ''}
                                                            onChange={(e) => {
                                                                let val = parseInt(e.target.value) || 0;
                                                                if (val < 0) val = 0;
                                                                if (val > approved) val = approved;
                                                                handleProductBrokenChange(key, val);
                                                                const restock = productRestock[key] ?? 0;
                                                                if (val + restock > approved) {
                                                                    handleProductRestockChange(key, Math.max(0, approved - val));
                                                                }
                                                            }}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                                            min="0"
                                                            max={approved}
                                                            disabled={!productSelections[key] || isProcessing}
                                                            placeholder={!productSelections[key] ? '-' : 'SL hỏng'}
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="mt-4 grid grid-cols-2 gap-4">
                                <div className="bg-green-50 p-3 rounded-lg">
                                    <div className="text-sm font-medium text-green-800">
                                        Sản phẩm được chọn: {getSelectedProducts().length}
                                    </div>
                                    <div className="text-xs text-green-600">
                                        Tổng số lượng:{' '}
                                        {getSelectedProducts().reduce((sum, p) => {
                                            const key = p.thongTinSanPhamTra?.hoaDonChiTietId ?? p.id;
                                            if (selectedOrder.trangThai === 'APPROVED') {
                                                return (
                                                    sum +
                                                    (typeof p.soLuongDuocPheDuyet === 'number'
                                                        ? p.soLuongDuocPheDuyet
                                                        : 0)
                                                );
                                            }
                                            return sum + (productQuantities[key] || 0);
                                        }, 0)}{' '}
                                        cái
                                    </div>
                                    <div className="text-xs text-green-600">
                                        Tổng giá trị gốc:{' '}
                                        {formatCurrency(
                                            getSelectedProducts().reduce((sum, p) => {
                                                const key = p.thongTinSanPhamTra?.hoaDonChiTietId ?? p.id;
                                                if (selectedOrder.trangThai === 'APPROVED') {
                                                    return (
                                                        sum +
                                                        p.thongTinSanPhamTra.giaBan *
                                                            (typeof p.soLuongDuocPheDuyet === 'number'
                                                                ? p.soLuongDuocPheDuyet
                                                                : 0)
                                                    );
                                                }
                                                return (
                                                    sum + p.thongTinSanPhamTra.giaBan * (productQuantities[key] || 0)
                                                );
                                            }, 0),
                                        )}
                                    </div>
                                    {selectedOrder.trangThai === 'APPROVED' && (
                                        <div className="text-xs text-blue-600 font-medium">
                                            {isCalculatingRefund ? (
                                                <span className="flex items-center">
                                                    <CircularProgress size={12} className="mr-1" />
                                                    Đang tính toán...
                                                </span>
                                            ) : (
                                                <>
                                                    Số tiền hoàn trả (đã trừ voucher): {formatCurrency(refundAmount)}
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <div className="bg-red-50 p-3 rounded-lg">
                                    <div className="text-sm font-medium text-red-800">
                                        Sản phẩm bị từ chối:{' '}
                                        {selectedOrder && selectedOrder.chiTietTraHang
                                            ? selectedOrder.chiTietTraHang.filter(
                                                  (detail) => getRejectedQuantity(detail) > 0,
                                              ).length
                                            : 0}
                                    </div>
                                    <div className="text-xs text-red-600">
                                        Tổng số lượng bị từ chối: {getTotalRejectedQuantity()} cái
                                    </div>
                                    <div className="text-xs text-red-600">
                                        Tổng giá trị: {formatCurrency(getTotalRejectedValue())}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {selectedOrder.trangThai === 'PENDING' && (
                            <div className="mb-6">
                                <h4 className="font-medium text-gray-900 mb-3">Xử lý phiếu trả hàng</h4>

                                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                                    <h5 className="font-medium text-gray-900 mb-2">Tóm tắt xử lý</h5>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="font-medium text-green-700">Sản phẩm được chọn:</span>
                                            <ul className="mt-1 space-y-1">
                                                {getSelectedProducts().map((product) => {
                                                    const key =
                                                        product.thongTinSanPhamTra?.hoaDonChiTietId ?? product.id;
                                                    const soLuongDuocPheDuyet =
                                                        selectedOrder.trangThai === 'APPROVED'
                                                            ? typeof product.soLuongDuocPheDuyet === 'number'
                                                                ? product.soLuongDuocPheDuyet
                                                                : 0
                                                            : productQuantities[key] || 0;
                                                    return (
                                                        <li key={key} className="text-green-600">
                                                            • {product.thongTinSanPhamTra.tenSanPham}(
                                                            {soLuongDuocPheDuyet}/{product.soLuongTra} duyệt -{' '}
                                                            {formatCurrency(
                                                                soLuongDuocPheDuyet * product.thongTinSanPhamTra.giaBan,
                                                            )}
                                                            )
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        </div>
                                        <div>
                                            <span className="font-medium text-red-700">Sản phẩm bị từ chối:</span>
                                            <ul className="mt-1 space-y-1">
                                                {selectedOrder.chiTietTraHang
                                                    .filter((product) => getRejectedQuantity(product) > 0)
                                                    .map((product) => {
                                                        const key =
                                                            product.thongTinSanPhamTra?.hoaDonChiTietId ?? product.id;
                                                        const rejectedQty = getRejectedQuantity(product);
                                                        return (
                                                            <li key={key} className="text-red-600">
                                                                • {product.thongTinSanPhamTra.tenSanPham}({rejectedQty}/
                                                                {product.soLuongTra} cái -{' '}
                                                                {formatCurrency(
                                                                    product.thongTinSanPhamTra.giaBan * rejectedQty,
                                                                )}
                                                                )
                                                            </li>
                                                        );
                                                    })}
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-green-50 p-4 rounded-lg mb-4">
                                    <h5 className="font-medium text-green-800 mb-2">
                                        {hasSelectedProducts()
                                            ? 'Phê duyệt phiếu trả hàng'
                                            : 'Từ chối toàn bộ phiếu trả hàng'}
                                    </h5>
                                    <textarea
                                        placeholder={
                                            hasSelectedProducts()
                                                ? 'Nhập ghi chú phê duyệt tổng thể (không bắt buộc)...'
                                                : 'Nhập lý do từ chối toàn bộ (không bắt buộc)...'
                                        }
                                        className={`w-full p-2 border ${hasSelectedProducts() ? 'border-green-300 focus:ring-green-500' : 'border-red-300 focus:ring-red-500'} rounded-md focus:outline-none focus:ring-2 focus:border-transparent`}
                                        rows="3"
                                        value={approvalNote}
                                        onChange={(e) => setApprovalNote(e.target.value)}
                                        disabled={isProcessing}
                                    />
                                    <button
                                        onClick={() => openConfirmModal(selectedOrder.id)}
                                        className={`mt-2 px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md ${
                                            hasSelectedProducts()
                                                ? 'bg-green-600 hover:bg-green-700'
                                                : 'bg-red-600 hover:bg-red-700'
                                        } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        disabled={isProcessing}
                                    >
                                        {hasSelectedProducts()
                                            ? `Phê duyệt (${getSelectedProducts().length} sản phẩm)`
                                            : 'Từ chối toàn bộ'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {selectedOrder.trangThai === 'APPROVED' && (
                            <div className="mb-6">
                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <h5 className="font-medium text-blue-800 mb-2">Hoàn tiền cho khách hàng</h5>
                                    <p className="text-sm text-blue-700 mb-3">
                                        Phiếu trả hàng đã được phê duyệt. Bạn có thể thực hiện hoàn tiền cho khách hàng.
                                    </p>
                                    <button
                                        onClick={() => handleRefund(selectedOrder.id)}
                                        className={`px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        disabled={isProcessing}
                                    >
                                        Hoàn tiền
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end">
                            <button
                                onClick={() => setShowDetailModal(false)}
                                className={`px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                                disabled={isProcessing}
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showConfirmModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-50">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-96">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Xác nhận hành động</h3>
                        <p className="text-sm text-gray-600 mb-6">
                            {hasSelectedProducts()
                                ? `Bạn có chắc chắn muốn phê duyệt ${getSelectedProducts().length} sản phẩm trong phiếu trả hàng này?`
                                : 'Bạn có chắc chắn muốn từ chối toàn bộ phiếu trả hàng này?'}
                        </p>
                        <div className="flex justify-end space-x-4">
                            <button
                                onClick={() => setShowConfirmModal(false)}
                                className={`px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                                disabled={isProcessing}
                            >
                                Hủy
                            </button>
                            <button
                                onClick={() => handleProcessReturnOrder(confirmOrderId)}
                                className={`px-4 py-2 text-sm font-medium text-white rounded-md flex items-center ${
                                    hasSelectedProducts()
                                        ? 'bg-green-600 hover:bg-green-700'
                                        : 'bg-red-600 hover:bg-red-700'
                                } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                                disabled={isProcessing}
                            >
                                {isProcessing ? (
                                    <>
                                        <CircularProgress size={20} className="mr-2 text-white" />
                                        Đang xử lý...
                                    </>
                                ) : (
                                    'Xác nhận'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default ReturnOrders;
