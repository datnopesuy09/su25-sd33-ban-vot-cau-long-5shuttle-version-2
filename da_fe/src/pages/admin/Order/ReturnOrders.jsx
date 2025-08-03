import React, { useState, useEffect } from 'react';
import { 
    Visibility as VisibilityIcon,
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon,
    Schedule as ScheduleIcon,
    AttachMoney as AttachMoneyIcon,
    Search as SearchIcon,
    FilterList as FilterListIcon,
    Close as CloseIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useAdminAuth } from '../../../contexts/adminAuthContext';

function ReturnOrders() {
    const [returnOrders, setReturnOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [selectedStatus, setSelectedStatus] = useState('all');
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
    const [rejectionReason, setRejectionReason] = useState('');

    // Sử dụng adminAuth để kiểm tra quyền
    const { admin, role } = useAdminAuth();

    // Lấy token từ localStorage
    const getAuthToken = () => {
        return localStorage.getItem('adminToken');
    };

    // Kiểm tra quyền truy cập
    const hasPermission = () => {
        return admin && (role === 'ROLE_ADMIN' || role === 'ROLE_STAFF');
    };

    // Fetch dữ liệu từ API
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
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.data.code === 1000) {
                console.log('Dữ liệu phiếu trả hàng:', response.data.result);
                setReturnOrders(response.data.result);
                setFilteredOrders(response.data.result);
            } else {
                setError('Có lỗi khi lấy dữ liệu');
            }
        } catch (error) {
            console.error('Lỗi khi fetch dữ liệu:', error);
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

    // Load dữ liệu khi component mount hoặc khi admin/role thay đổi
    useEffect(() => {
        if (hasPermission()) {
            fetchReturnOrders();
        }
    }, [admin, role]);

    // Lọc dữ liệu
    useEffect(() => {
        let filtered = returnOrders;

        // Lọc theo trạng thái
        if (selectedStatus !== 'all') {
            filtered = filtered.filter(order => order.trangThai === selectedStatus);
        }

        // Lọc theo từ khóa tìm kiếm
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            console.log('Đang tìm kiếm với từ khóa:', searchLower);
            console.log('Số lượng đơn hàng trước khi lọc:', filtered.length);
            
            filtered = filtered.filter(order => {
                const matchId = order.id.toString().includes(searchLower);
                const matchHoaDonMa = order.hoaDonMa.toString().includes(searchLower);
                const matchHoaDonMaWithHD = `${order.hoaDonMa}`.toLowerCase().includes(searchLower);
                const matchHoTen = order.hoTenKhachHang && order.hoTenKhachHang.toLowerCase().includes(searchLower);
                const matchEmail = order.emailKhachHang && order.emailKhachHang.toLowerCase().includes(searchLower);
                
                const isMatch = matchId || matchHoaDonMa || matchHoaDonMaWithHD || matchHoTen || matchEmail;
                
                if (isMatch) {
                    console.log('Tìm thấy match:', order);
                }
                
                return isMatch;
            });
            
            console.log('Số lượng đơn hàng sau khi lọc:', filtered.length);
        }

        // Lọc theo ngày
        if (startDate) {
            const startDateTime = new Date(startDate + 'T00:00:00');
            console.log('Lọc từ ngày:', startDate, 'Start DateTime:', startDateTime);
            filtered = filtered.filter(order => {
                const orderDate = new Date(order.ngayTao);
                const isInRange = orderDate >= startDateTime;
                if (!isInRange) {
                    console.log('Loại bỏ order:', order.id, 'Ngày tạo:', order.ngayTao, 'Order Date:', orderDate);
                }
                return isInRange;
            });
        }
        if (endDate) {
            const endDateTime = new Date(endDate + 'T23:59:59');
            console.log('Lọc đến ngày:', endDate, 'End DateTime:', endDateTime);
            filtered = filtered.filter(order => {
                const orderDate = new Date(order.ngayTao);
                const isInRange = orderDate <= endDateTime;
                if (!isInRange) {
                    console.log('Loại bỏ order:', order.id, 'Ngày tạo:', order.ngayTao, 'Order Date:', orderDate);
                }
                return isInRange;
            });
        }

        setFilteredOrders(filtered);
        setCurrentPage(1);
    }, [selectedStatus, searchTerm, startDate, endDate, returnOrders]);

    const getStatusInfo = (status) => {
        switch (status) {
            case 'PENDING':
                return {
                    label: 'Chờ xử lý',
                    color: 'bg-yellow-200 text-yellow-800',
                    icon: ScheduleIcon
                };
            case 'APPROVED':
                return {
                    label: 'Đã phê duyệt',
                    color: 'bg-green-200 text-green-800',
                    icon: CheckCircleIcon
                };
            case 'REJECTED':
                return {
                    label: 'Đã từ chối',
                    color: 'bg-red-200 text-red-800',
                    icon: CancelIcon
                };
            case 'REFUNDED':
                return {
                    label: 'Đã hoàn tiền',
                    color: 'bg-blue-200 text-blue-800',
                    icon: AttachMoneyIcon
                };
            default:
                return {
                    label: 'Không xác định',
                    color: 'bg-gray-200 text-gray-800',
                    icon: ScheduleIcon
                };
        }
    };

    const handleViewDetail = (order) => {
        setSelectedOrder(order);
        setShowDetailModal(true);
        setApprovalNote('');
        setRejectionReason('');
    };

    const handleApprove = async (orderId) => {
        try {
            const token = getAuthToken();
            if (!hasPermission()) {
                setError('Bạn không có quyền thực hiện hành động này');
                return;
            }

            if (!approvalNote.trim()) {
                alert('Vui lòng nhập ghi chú phê duyệt');
                return;
            }

            // TODO: Gọi API để phê duyệt phiếu trả hàng
            console.log('Phê duyệt phiếu trả hàng:', orderId, 'Ghi chú:', approvalNote);
            // await axios.put(`http://localhost:8080/phieu-tra-hang/${orderId}/approve`, {
            //     ghiChu: approvalNote
            // }, {
            //     headers: { 'Authorization': `Bearer ${token}` }
            // });
            // fetchReturnOrders(); // Refresh data
            setShowDetailModal(false);
        } catch (error) {
            console.error('Lỗi khi phê duyệt:', error);
        }
    };

    const handleReject = async (orderId) => {
        try {
            const token = getAuthToken();
            if (!hasPermission()) {
                setError('Bạn không có quyền thực hiện hành động này');
                return;
            }

            if (!rejectionReason.trim()) {
                alert('Vui lòng nhập lý do từ chối');
                return;
            }

            // TODO: Gọi API để từ chối phiếu trả hàng
            console.log('Từ chối phiếu trả hàng:', orderId, 'Lý do:', rejectionReason);
            // await axios.put(`http://localhost:8080/phieu-tra-hang/${orderId}/reject`, {
            //     lyDo: rejectionReason
            // }, {
            //     headers: { 'Authorization': `Bearer ${token}` }
            // });
            // fetchReturnOrders(); // Refresh data
            setShowDetailModal(false);
        } catch (error) {
            console.error('Lỗi khi từ chối:', error);
        }
    };

    const handleRefund = async (orderId) => {
        try {
            const token = getAuthToken();
            if (!hasPermission()) {
                setError('Bạn không có quyền thực hiện hành động này');
                return;
            }

            const confirmRefund = window.confirm('Bạn có chắc chắn muốn hoàn tiền cho phiếu trả hàng này?');
            if (!confirmRefund) return;

            // TODO: Gọi API để hoàn tiền
            console.log('Hoàn tiền phiếu trả hàng:', orderId);
            // await axios.put(`http://localhost:8080/phieu-tra-hang/${orderId}/refund`, {}, {
            //     headers: { 'Authorization': `Bearer ${token}` }
            // });
            // fetchReturnOrders(); // Refresh data
            setShowDetailModal(false);
        } catch (error) {
            console.error('Lỗi khi hoàn tiền:', error);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    // Phân trang
    const indexOfLastOrder = currentPage * ordersPerPage;
    const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
    const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
    const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

    // Kiểm tra quyền truy cập
    if (!hasPermission()) {
        return (
            <div className="p-6">
                <div className="font-bold text-sm mb-4">Quản lý phiếu trả hàng</div>
                <div className="bg-white p-4 rounded-md shadow-md">
                    <div className="flex justify-center items-center h-32">
                        <div className="text-red-500">
                            {!admin ? 'Vui lòng đăng nhập để truy cập trang này' : 'Bạn không có quyền truy cập trang này'}
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
        <div className="p-6">
            <div className="font-bold text-sm mb-4">
                Quản lý phiếu trả hàng 
                <span className="text-xs text-gray-500 ml-2">
                    (Đăng nhập với quyền: {role})
                </span>
            </div>
            
            <div className="bg-white p-4 rounded-md shadow-md">
                {/* Header với thống kê */}
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800">Phiếu trả hàng</h2>
                        <p className="text-sm text-gray-600">Theo dõi và xử lý các yêu cầu trả hàng từ khách hàng</p>
                    </div>
                    <div className="flex space-x-4">
                        <div className="bg-blue-50 p-3 rounded-lg text-center">
                            <div className="text-2xl font-bold text-blue-600">
                                {returnOrders.filter(order => order.trangThai === 'PENDING').length}
                            </div>
                            <div className="text-sm text-blue-600">Chờ xử lý</div>
                        </div>
                        <div className="bg-green-50 p-3 rounded-lg text-center">
                            <div className="text-2xl font-bold text-green-600">
                                {returnOrders.filter(order => order.trangThai === 'APPROVED').length}
                            </div>
                            <div className="text-sm text-green-600">Đã phê duyệt</div>
                        </div>
                    </div>
                </div>

                {/* Bộ lọc */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div className="relative">
                        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo ID, mã HĐ, tên KH, email..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div>
                        <select
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                        >
                            <option value="all">Tất cả trạng thái</option>
                            <option value="PENDING">Chờ xử lý</option>
                            <option value="APPROVED">Đã phê duyệt</option>
                            <option value="REJECTED">Đã từ chối</option>
                            <option value="REFUNDED">Đã hoàn tiền</option>
                        </select>
                    </div>
                    <div>
                        <input
                            type="date"
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            placeholder="Từ ngày"
                        />
                    </div>
                    <div>
                        <input
                            type="date"
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            placeholder="Đến ngày"
                        />
                    </div>
                </div>

                {/* Bảng danh sách */}
                <div className="overflow-x-auto">
                    <table className="min-w-full table-auto border-collapse border border-gray-200">
                        <thead>
                            <tr className="bg-gray-200 text-gray-700">
                                <th className="py-4 px-6 text-left">ID Phiếu</th>
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
                                            <div className="text-sm font-medium text-gray-900">#{order.id}</div>
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
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                                                <StatusIcon className="h-3 w-3 mr-1" />
                                                {statusInfo.label}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <button
                                                onClick={() => handleViewDetail(order)}
                                                className="text-blue-600 hover:text-blue-900 p-1 rounded"
                                                title="Xem chi tiết"
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

                {/* Thông báo không có dữ liệu */}
                {currentOrders.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                        Không có phiếu trả hàng nào
                    </div>
                )}

                {/* Phân trang */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-4">
                        <div className="text-sm text-gray-700">
                            Hiển thị {indexOfFirstOrder + 1} đến {Math.min(indexOfLastOrder, filteredOrders.length)} trong tổng số {filteredOrders.length} kết quả
                        </div>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => setCurrentPage(currentPage - 1)}
                                disabled={currentPage === 1}
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
                                    }`}
                                >
                                    {page}
                                </button>
                            ))}
                            <button
                                onClick={() => setCurrentPage(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Sau
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal chi tiết */}
            {showDetailModal && selectedOrder && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-50">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-[900px] max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-gray-900">
                                Chi tiết phiếu trả hàng: #{selectedOrder.id}
                            </h3>
                            <button
                                onClick={() => setShowDetailModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <CloseIcon className="h-6 w-6" />
                            </button>
                        </div>

                        {/* Thông tin khách hàng và xử lý */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-medium text-gray-900 mb-2">Thông tin khách hàng</h4>
                                <div className="space-y-1 text-sm">
                                    <div><span className="font-medium">Họ tên:</span> {selectedOrder.hoTenKhachHang}</div>
                                    <div><span className="font-medium">Email:</span> {selectedOrder.emailKhachHang}</div>
                                    <div><span className="font-medium">SĐT:</span> {selectedOrder.sdtKhachHang || 'Chưa có'}</div>
                                    <div><span className="font-medium">Địa chỉ:</span> {selectedOrder.diaChiKhachHang || 'Chưa có'}</div>
                                </div>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-medium text-gray-900 mb-2">Thông tin xử lý</h4>
                                <div className="space-y-1 text-sm">
                                    <div><span className="font-medium">Ngày tạo:</span> {formatDate(selectedOrder.ngayTao)}</div>
                                    <div><span className="font-medium">Ngày cập nhật:</span> {selectedOrder.ngayCapNhat ? formatDate(selectedOrder.ngayCapNhat) : 'Chưa cập nhật'}</div>
                                    <div><span className="font-medium">Hình thức:</span> {selectedOrder.hinhThucTra}</div>
                                    <div><span className="font-medium">Staff Email:</span> {selectedOrder.staffEmail || 'Chưa phân công'}</div>
                                </div>
                            </div>
                        </div>

                        {/* Ghi chú */}
                        <div className="mb-6">
                            <h4 className="font-medium text-gray-900 mb-2">Ghi chú khách hàng</h4>
                            <div className="bg-gray-50 p-3 rounded-lg text-sm">
                                {selectedOrder.ghiChu}
                            </div>
                        </div>

                        {/* Danh sách sản phẩm */}
                        <div className="mb-6">
                            <h4 className="font-medium text-gray-900 mb-2">Chi tiết sản phẩm trả</h4>
                            <div className="overflow-x-auto">
                                <table className="min-w-full table-auto border-collapse border border-gray-200">
                                    <thead>
                                        <tr className="bg-gray-200 text-gray-700">
                                            <th className="py-2 px-3 text-left text-xs font-medium w-32">Mã SP</th>
                                            <th className="py-2 px-3 text-left text-xs font-medium w-48">Tên sản phẩm</th>
                                            <th className="py-2 px-3 text-left text-xs font-medium w-20">Thương hiệu</th>
                                            <th className="py-2 px-3 text-left text-xs font-medium w-20">Màu sắc</th>
                                            <th className="py-2 px-3 text-left text-xs font-medium w-20">Chất liệu</th>
                                            <th className="py-2 px-3 text-left text-xs font-medium w-20">Trọng lượng</th>
                                            <th className="py-2 px-3 text-left text-xs font-medium w-24">Điểm cân bằng</th>
                                            <th className="py-2 px-3 text-left text-xs font-medium w-16">Độ cứng</th>
                                            <th className="py-2 px-3 text-left text-xs font-medium w-20">Số lượng trả</th>
                                            <th className="py-2 px-3 text-left text-xs font-medium w-24">Giá bán</th>
                                            <th className="py-2 px-3 text-left text-xs font-medium w-64">Ghi chú</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                            {selectedOrder.chiTietTraHang.map((detail) => (
                                             <tr key={detail.id} className="border-b border-gray-200">
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
                                                        <span className="inline-block w-3 h-3 rounded-full mr-1" style={{backgroundColor: detail.thongTinSanPhamTra.tenMauSac === 'Đỏ' ? '#ef4444' : detail.thongTinSanPhamTra.tenMauSac === 'Xanh' ? '#3b82f6' : '#6b7280'}}></span>
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
                                                    {detail.soLuongTra}
                                                </td>
                                                <td className="py-2 px-3 text-sm text-gray-900 font-medium">
                                                    {formatCurrency(detail.thongTinSanPhamTra.giaBan)}
                                                </td>
                                                <td className="py-2 px-3 text-sm text-gray-900 break-words">
                                                    {detail.ghiChu}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Form xử lý */}
                        {selectedOrder.trangThai === 'PENDING' && (
                            <div className="mb-6">
                                <h4 className="font-medium text-gray-900 mb-3">Xử lý phiếu trả hàng</h4>
                                
                                {/* Form phê duyệt */}
                                <div className="bg-green-50 p-4 rounded-lg mb-4">
                                    <h5 className="font-medium text-green-800 mb-2">Phê duyệt phiếu trả hàng</h5>
                                    <textarea
                                        placeholder="Nhập ghi chú phê duyệt..."
                                        className="w-full p-2 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        rows="3"
                                        value={approvalNote}
                                        onChange={(e) => setApprovalNote(e.target.value)}
                                    />
                                    <button
                                        onClick={() => handleApprove(selectedOrder.id)}
                                        className="mt-2 px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700"
                                    >
                                        Phê duyệt
                                    </button>
                                </div>

                                {/* Form từ chối */}
                                <div className="bg-red-50 p-4 rounded-lg">
                                    <h5 className="font-medium text-red-800 mb-2">Từ chối phiếu trả hàng</h5>
                                    <textarea
                                        placeholder="Nhập lý do từ chối..."
                                        className="w-full p-2 border border-red-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                        rows="3"
                                        value={rejectionReason}
                                        onChange={(e) => setRejectionReason(e.target.value)}
                                    />
                                    <button
                                        onClick={() => handleReject(selectedOrder.id)}
                                        className="mt-2 px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700"
                                    >
                                        Từ chối
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Nút hoàn tiền cho phiếu đã phê duyệt */}
                        {selectedOrder.trangThai === 'APPROVED' && (
                            <div className="mb-6">
                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <h5 className="font-medium text-blue-800 mb-2">Hoàn tiền cho khách hàng</h5>
                                    <p className="text-sm text-blue-700 mb-3">
                                        Phiếu trả hàng đã được phê duyệt. Bạn có thể thực hiện hoàn tiền cho khách hàng.
                                    </p>
                                    <button
                                        onClick={() => handleRefund(selectedOrder.id)}
                                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                                    >
                                        Hoàn tiền
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Nút đóng */}
                        <div className="flex justify-end">
                            <button
                                onClick={() => setShowDetailModal(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ReturnOrders; 