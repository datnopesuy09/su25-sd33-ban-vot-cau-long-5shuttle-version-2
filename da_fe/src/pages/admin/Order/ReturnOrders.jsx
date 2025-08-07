
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

    // Thêm state để quản lý việc chọn sản phẩm
    const [productSelections, setProductSelections] = useState({});
    const [productReasons, setProductReasons] = useState({});
    const [productQuantities, setProductQuantities] = useState({});

    // State cho thông báo phê duyệt thành công
    const [successMessage, setSuccessMessage] = useState('');

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
                // Map lại dữ liệu để đồng bộ field số lượng phê duyệt
                const mappedResult = response.data.result.map(order => ({
                    ...order,
                    chiTietTraHang: order.chiTietTraHang?.map(detail => ({
                        ...detail,
                        // Giữ nguyên số lượng yêu cầu (soLuongTra)
                        // Đổi field số lượng phê duyệt thành soLuongDuocPheDuyet để đồng bộ với code cũ
                        soLuongDuocPheDuyet: typeof detail.soLuongPheDuyet === 'number' ? detail.soLuongPheDuyet : 0,
                        // Đổi ghi chú nhân viên thành lyDoXuLy nếu cần
                        lyDoXuLy: detail.ghiChuNhanVien || '',
                    })) || []
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
            filtered = filtered.filter(order => {
                const matchId = order.id.toString().includes(searchLower);
                const matchMaPhieuTraHang = order.maPhieuTraHang && order.maPhieuTraHang.toLowerCase().includes(searchLower);
                const matchHoaDonMa = order.hoaDonMa && order.hoaDonMa.toString().toLowerCase().includes(searchLower);
                const matchHoTen = order.hoTenKhachHang && order.hoTenKhachHang.toLowerCase().includes(searchLower);
                const matchEmail = order.emailKhachHang && order.emailKhachHang.toLowerCase().includes(searchLower);
                return matchId || matchMaPhieuTraHang || matchHoaDonMa || matchHoTen || matchEmail;
            });
        }

        // Lọc theo ngày
        if (startDate) {
            const startDateTime = new Date(startDate + 'T00:00:00');
            filtered = filtered.filter(order => {
                const orderDate = new Date(order.ngayTao);
                return orderDate >= startDateTime;
            });
        }
        if (endDate) {
            const endDateTime = new Date(endDate + 'T23:59:59');
            filtered = filtered.filter(order => {
                const orderDate = new Date(order.ngayTao);
                return orderDate <= endDateTime;
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
        
        // Khởi tạo state cho việc chọn sản phẩm
        const initialSelections = {};
        const initialReasons = {};
        const initialQuantities = {};

        if (order.chiTietTraHang && order.chiTietTraHang.length > 0) {
            order.chiTietTraHang.forEach((detail) => {
                const key = detail.thongTinSanPhamTra?.hoaDonChiTietId ?? detail.id;
                // Nếu đã phê duyệt thì không cho tick nữa, chỉ hiển thị số lượng đã phê duyệt
                if (order.trangThai === 'APPROVED') {
                    // Nếu có trường soLuongDuocPheDuyet thì lấy, không thì lấy soLuongTra
                    initialSelections[key] = detail.soLuongDuocPheDuyet > 0;
                    initialQuantities[key] = detail.soLuongDuocPheDuyet ?? 0;
                } else {
                    initialSelections[key] = true; // Mặc định chọn tất cả sản phẩm
                    initialQuantities[key] = detail.soLuongTra; // Khởi tạo số lượng trả ban đầu
                }
                initialReasons[key] = detail.lyDoXuLy || ''; // Nếu đã xử lý thì lấy lý do xử lý
            });
        }
        
        setProductSelections(initialSelections);
        setProductReasons(initialReasons);
        setProductQuantities(initialQuantities);
    };

    // Hàm xử lý duy nhất cho cả phê duyệt và từ chối toàn bộ
    const handleProcessReturnOrder = async (orderId) => {
        try {
            const token = getAuthToken();
            if (!hasPermission()) {
                setError('Bạn không có quyền thực hiện hành động này');
                return;
            }

            // Kiểm tra lý do tổng thể
            if (!approvalNote.trim()) {
                alert('Vui lòng nhập ghi chú xử lý');
                return;
            }

            if (!selectedOrder || !selectedOrder.chiTietTraHang) {
                alert('Không có dữ liệu sản phẩm');
                return;
            }

            // Chuẩn bị chi tiết phê duyệt cho từng sản phẩm
            const chiTietPheDuyet = selectedOrder.chiTietTraHang.map(detail => {
                // Lấy key là hoaDonChiTietId
                const key = detail.thongTinSanPhamTra?.hoaDonChiTietId ?? detail.id;
                const isSelected = productSelections[key];
                const soLuongDuocPheDuyet = isSelected ? (productQuantities[key] ?? 0) : 0;
                const lyDoXuLy = (productReasons[key] || '').trim();
                return {
                    phieuTraHangChiTietId: detail.id,
                    hoaDonChiTietId: detail.thongTinSanPhamTra.hoaDonChiTietId,
                    soLuongDuocPheDuyet: soLuongDuocPheDuyet,
                    lyDoXuLy: lyDoXuLy || (isSelected ? 'Được phê duyệt' : 'Không được phê duyệt')
                };
            });

            // Kiểm tra lý do cho từng sản phẩm (bắt buộc nhập lý do cho tất cả)
            let missingReason = false;
            for (let item of chiTietPheDuyet) {
                if (!item.lyDoXuLy) {
                    missingReason = true;
                    break;
                }
            }
            if (missingReason) {
                alert('Vui lòng nhập lý do xử lý cho tất cả sản phẩm');
                return;
            }

            // Gọi API xử lý
            await axios.put(
                'http://localhost:8080/phieu-tra-hang',
                {
                    phieuTraHangId: orderId,
                    ghiChuNhanVien: approvalNote,
                    chiTietPheDuyet: chiTietPheDuyet
                },
                {
                    headers: { 'Authorization': `Bearer ${token}` }
                }
            );

            // Sau khi xử lý thành công, reload danh sách và đóng modal
            await fetchReturnOrders();
            setShowDetailModal(false);

            // Hiển thị thông báo phê duyệt thành công
            setSuccessMessage('Phê duyệt thành công');
            setTimeout(() => setSuccessMessage(''), 3000);

        } catch (error) {
            setError('Có lỗi khi xử lý phiếu trả hàng');
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
            // await axios.put(`http://localhost:8080/phieu-tra-hang/${orderId}/refund`, {}, {
            //     headers: { 'Authorization': `Bearer ${token}` }
            // });
            // fetchReturnOrders(); // Refresh data
            setShowDetailModal(false);
        } catch (error) {
            // Handle error
        }
    };

    // Hàm xử lý thay đổi lựa chọn sản phẩm
    const handleProductSelectionChange = (productKey, isSelected) => {
        // Nếu đã phê duyệt thì không cho tick nữa
        if (selectedOrder && selectedOrder.trangThai === 'APPROVED') return;
        setProductSelections(prev => ({
            ...prev,
            [productKey]: isSelected
        }));
        // Nếu bỏ tick thì reset số lượng về 0
        if (!isSelected) {
            setProductQuantities(prev => ({
                ...prev,
                [productKey]: 0
            }));
        } else {
            // Nếu tick lại thì set về số lượng trả mặc định
            if (selectedOrder && selectedOrder.chiTietTraHang) {
                const detail = selectedOrder.chiTietTraHang.find(d => {
                    const key = d.thongTinSanPhamTra?.hoaDonChiTietId ?? d.id;
                    return key === productKey;
                });
                setProductQuantities(prev => ({
                    ...prev,
                    [productKey]: detail ? detail.soLuongTra : 1
                }));
            }
        }
    };

    // Hàm xử lý thay đổi lý do cho sản phẩm
    const handleProductReasonChange = (productKey, reason) => {
        setProductReasons(prev => ({
            ...prev,
            [productKey]: reason
        }));
    };

    // Hàm xử lý thay đổi số lượng được phê duyệt cho sản phẩm
    const handleProductQuantityChange = (productKey, quantity) => {
        setProductQuantities(prev => ({
            ...prev,
            [productKey]: quantity
        }));
    };

    // Hàm kiểm tra xem có sản phẩm nào được chọn không
    const hasSelectedProducts = () => {
        return Object.values(productSelections).some(selected => selected);
    };

    // Hàm lấy danh sách sản phẩm được chọn
    const getSelectedProducts = () => {
        if (!selectedOrder || !selectedOrder.chiTietTraHang) return [];
        return selectedOrder.chiTietTraHang.filter(detail => {
            const key = detail.thongTinSanPhamTra?.hoaDonChiTietId ?? detail.id;
            return productSelections[key];
        });
    };

    // Hàm lấy danh sách sản phẩm không được chọn
    const getRejectedProducts = () => {
        if (!selectedOrder || !selectedOrder.chiTietTraHang) return [];
        return selectedOrder.chiTietTraHang.filter(detail => {
            const key = detail.thongTinSanPhamTra?.hoaDonChiTietId ?? detail.id;
            return !productSelections[key];
        });
    };

    // Hàm tính số lượng không được duyệt cho từng sản phẩm
    const getRejectedQuantity = (product) => {
        // Nếu đã phê duyệt, lấy soLuongTra - soLuongDuocPheDuyet
        if (selectedOrder && selectedOrder.trangThai === 'APPROVED') {
            const soLuongTra = product.soLuongTra || 0;
            const soLuongDuocPheDuyet = typeof product.soLuongDuocPheDuyet === 'number' ? product.soLuongDuocPheDuyet : 0;
            return Math.max(soLuongTra - soLuongDuocPheDuyet, 0);
        }
        // Nếu chưa phê duyệt, nếu không được chọn thì toàn bộ số lượng bị từ chối
        const key = product.thongTinSanPhamTra?.hoaDonChiTietId ?? product.id;
        if (!productSelections[key]) {
            return product.soLuongTra || 0;
        }
        // Nếu được chọn, số lượng bị từ chối là soLuongTra - số lượng đang chọn
        return Math.max((product.soLuongTra || 0) - (productQuantities[key] || 0), 0);
    };

    // Hàm lấy tổng số lượng bị từ chối
    const getTotalRejectedQuantity = () => {
        if (!selectedOrder || !selectedOrder.chiTietTraHang) return 0;
        return selectedOrder.chiTietTraHang.reduce((sum, detail) => sum + getRejectedQuantity(detail), 0);
    };

    // Hàm lấy tổng giá trị bị từ chối
    const getTotalRejectedValue = () => {
        if (!selectedOrder || !selectedOrder.chiTietTraHang) return 0;
        return selectedOrder.chiTietTraHang.reduce((sum, detail) => {
            const rejectedQty = getRejectedQuantity(detail);
            return sum + (detail.thongTinSanPhamTra.giaBan * rejectedQty);
        }, 0);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        // Hỗ trợ cả trường hợp dateString là "2025-08-06 18:34:12" (có thể thiếu T)
        // Đảm bảo chuyển thành ISO string nếu cần
        let dateObj;
        if (typeof dateString === 'string' && dateString.includes(' ')) {
            // Chuyển "2025-08-06 18:34:12" => "2025-08-06T18:34:12"
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
        // Hiển thị cả ngày và giờ
        return dateObj.toLocaleString('vi-VN', { hour12: false });
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
            {/* Thông báo phê duyệt thành công */}
            {successMessage && (
                <div className="mb-4">
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative text-center font-semibold">
                        {successMessage}
                    </div>
                </div>
            )}
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
                            placeholder="Tìm kiếm theo mã PTH, mã HĐ, tên KH, email..."
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
                                            <div className="text-sm font-medium text-gray-900">{order.maPhieuTraHang}</div>
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
                    <div className="bg-white rounded-lg shadow-lg p-6 w-[1200px] max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-gray-900">
                                Chi tiết phiếu trả hàng: {selectedOrder.maPhieuTraHang}
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
                                    <div>
                                        <span className="font-medium">Ngày tạo:</span> {formatDateTime(selectedOrder.ngayTao)}
                                    </div>
                                    <div>
                                        <span className="font-medium">Ngày xử lý:</span> {selectedOrder.ngayXuLy ? formatDateTime(selectedOrder.ngayXuLy) : 'Chưa xử lý'}
                                    </div>
                                    <div>
                                        <span className="font-medium">Ngày cập nhật:</span> {selectedOrder.ngayCapNhat ? formatDateTime(selectedOrder.ngayCapNhat) : 'Chưa cập nhật'}
                                    </div>
                                    <div><span className="font-medium">Hình thức:</span> {selectedOrder.hinhThucTra}</div>
                                    <div><span className="font-medium">Staff Email:</span> {selectedOrder.staffEmail || 'Chưa phân công'}</div>
                                </div>
                            </div>
                        </div>

                        {/* Ghi chú */}
                        <div className="mb-6">
                            <h4 className="font-medium text-gray-900 mb-2">Ghi chú khách hàng</h4>
                            <div className="bg-gray-50 p-3 rounded-lg text-sm">
                                {selectedOrder.ghiChuKhachHang || selectedOrder.ghiChu || 'Không có ghi chú'}
                            </div>
                        </div>

                        {/* Danh sách sản phẩm */}
                        <div className="mb-6">
                            <h4 className="font-medium text-gray-900 mb-2">Chi tiết sản phẩm trả</h4>
                            <div className="mb-3 p-3 bg-blue-50 rounded-lg">
                                <p className="text-sm text-blue-700">
                                    <strong>Hướng dẫn:</strong> Chọn các sản phẩm được phép trả hàng và nhập lý do cho từng sản phẩm. 
                                    Những sản phẩm không được chọn sẽ bị từ chối trả hàng.
                                </p>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full table-auto border-collapse border border-gray-200">
                                    <thead>
                                        <tr className="bg-gray-200 text-gray-700">
                                            <th className="py-2 px-3 text-left text-xs font-medium w-8">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedOrder.chiTietTraHang?.every(detail => {
                                                        const key = detail.thongTinSanPhamTra?.hoaDonChiTietId ?? detail.id;
                                                        return productSelections[key];
                                                    })}
                                                    onChange={(e) => {
                                                        // Nếu đã phê duyệt thì không cho tick nữa
                                                        if (selectedOrder.trangThai === 'APPROVED') return;
                                                        const newSelections = {};
                                                        const newQuantities = {};
                                                        selectedOrder.chiTietTraHang?.forEach(detail => {
                                                            const key = detail.thongTinSanPhamTra?.hoaDonChiTietId ?? detail.id;
                                                            newSelections[key] = e.target.checked;
                                                            newQuantities[key] = e.target.checked ? detail.soLuongTra : 0;
                                                        });
                                                        setProductSelections(newSelections);
                                                        setProductQuantities(newQuantities);
                                                    }}
                                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                    disabled={selectedOrder.trangThai === 'APPROVED'}
                                                />
                                            </th>
                                            <th className="py-2 px-3 text-left text-xs font-medium w-32">Mã Sản phẩm chi tiết</th>
                                            <th className="py-2 px-3 text-left text-xs font-medium w-48">Tên sản phẩm</th>
                                            <th className="py-2 px-3 text-left text-xs font-medium w-20">Thương hiệu</th>
                                            <th className="py-2 px-3 text-left text-xs font-medium w-20">Màu sắc</th>
                                            <th className="py-2 px-3 text-left text-xs font-medium w-20">Chất liệu</th>
                                            <th className="py-2 px-3 text-left text-xs font-medium w-20">Trọng lượng</th>
                                            <th className="py-2 px-3 text-left text-xs font-medium w-24">Điểm cân bằng</th>
                                            <th className="py-2 px-3 text-left text-xs font-medium w-16">Độ cứng</th>
                                            <th className="py-2 px-3 text-left text-xs font-medium w-25">Số lượng trả</th>
                                            <th className="py-2 px-3 text-left text-xs font-medium w-24">Giá bán</th>
                                            <th className="py-2 px-3 text-left text-xs font-medium w-48">Lý do trả hàng</th>
                                            <th className="py-2 px-3 text-left text-xs font-medium w-48">Lý do xử lý</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedOrder.chiTietTraHang.map((detail) => {
                                            const key = detail.thongTinSanPhamTra?.hoaDonChiTietId ?? detail.id;
                                            // Nếu đã phê duyệt thì lấy số lượng phê duyệt, không cho tick, input disabled
                                            const isApproved = selectedOrder.trangThai === 'APPROVED';
                                            const soLuongDuocPheDuyet = typeof detail.soLuongDuocPheDuyet === 'number' ? detail.soLuongDuocPheDuyet : (productQuantities[key] ?? 0);
                                            const soLuongKhongDuocDuyet = (detail.soLuongTra || 0) - (soLuongDuocPheDuyet || 0);
                                            return (
                                                <tr key={key} className="border-b border-gray-200">
                                                    <td className="py-2 px-3">
                                                        <input
                                                            type="checkbox"
                                                            checked={productSelections[key] || false}
                                                            onChange={(e) => handleProductSelectionChange(key, e.target.checked)}
                                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                            disabled={isApproved}
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
                                                        <div className="flex flex-col">
                                                            <div className="text-xs text-gray-500">
                                                                Yêu cầu: {detail.soLuongTra}
                                                            </div>
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
                                                                        value={productSelections[key] ? (productQuantities[key] ?? detail.soLuongTra) : ''}
                                                                        onChange={(e) => {
                                                                            const value = parseInt(e.target.value) || 0;
                                                                            const maxValue = detail.soLuongTra;
                                                                            if (value >= 0 && value <= maxValue) {
                                                                                handleProductQuantityChange(key, value);
                                                                            }
                                                                        }}
                                                                        className="w-16 px-2 py-1 border border-gray-300 rounded-md text-center text-sm"
                                                                        min="0"
                                                                        max={detail.soLuongTra}
                                                                        disabled={!productSelections[key]}
                                                                        placeholder={!productSelections[key] ? '-' : undefined}
                                                                    />
                                                                    {getRejectedQuantity(detail) > 0 && (
                                                                        <div className="text-xs text-red-700 font-semibold mt-1">
                                                                            Không được duyệt: {getRejectedQuantity(detail)}
                                                                        </div>
                                                                    )}
                                                                </>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="py-2 px-3 text-sm text-gray-900 font-medium">
                                                        {formatCurrency(detail.thongTinSanPhamTra.giaBan)}
                                                    </td>
                                                    <td className="py-2 px-3">
                                                        <div className="text-sm text-gray-900 break-words">
                                                            {detail.lyDoTraHang || 'Không có lý do'}
                                                        </div>
                                                    </td>
                                                    <td className="py-2 px-3">
                                                        <textarea
                                                            placeholder={productSelections[key] ? "Lý do được trả..." : "Lý do không được trả..."}
                                                            value={productReasons[key] || ''}
                                                            onChange={(e) => handleProductReasonChange(key, e.target.value)}
                                                            className="w-full p-2 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                                            rows="3"
                                                            disabled={false}
                                                        />
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                            
                            {/* Thống kê sản phẩm */}
                            <div className="mt-4 grid grid-cols-2 gap-4">
                                <div className="bg-green-50 p-3 rounded-lg">
                                    <div className="text-sm font-medium text-green-800">
                                        Sản phẩm được chọn: {getSelectedProducts().length}
                                    </div>
                                    <div className="text-xs text-green-600">
                                        Tổng số lượng: {getSelectedProducts().reduce((sum, p) => {
                                            const key = p.thongTinSanPhamTra?.hoaDonChiTietId ?? p.id;
                                            // Nếu đã phê duyệt thì lấy số lượng phê duyệt, không thì lấy số lượng đang chọn
                                            if (selectedOrder.trangThai === 'APPROVED') {
                                                return sum + (typeof p.soLuongDuocPheDuyet === 'number' ? p.soLuongDuocPheDuyet : 0);
                                            }
                                            return sum + (productQuantities[key] || 0);
                                        }, 0)} cái
                                    </div>
                                    <div className="text-xs text-green-600">
                                        Tổng giá trị: {formatCurrency(getSelectedProducts().reduce((sum, p) => {
                                            const key = p.thongTinSanPhamTra?.hoaDonChiTietId ?? p.id;
                                            if (selectedOrder.trangThai === 'APPROVED') {
                                                return sum + (p.thongTinSanPhamTra.giaBan * (typeof p.soLuongDuocPheDuyet === 'number' ? p.soLuongDuocPheDuyet : 0));
                                            }
                                            return sum + (p.thongTinSanPhamTra.giaBan * (productQuantities[key] || 0));
                                        }, 0))}
                                    </div>
                                </div>
                                <div className="bg-red-50 p-3 rounded-lg">
                                    <div className="text-sm font-medium text-red-800">
                                        Sản phẩm bị từ chối: {
                                            // Đếm số sản phẩm có số lượng không được duyệt > 0
                                            selectedOrder && selectedOrder.chiTietTraHang
                                                ? selectedOrder.chiTietTraHang.filter(detail => getRejectedQuantity(detail) > 0).length
                                                : 0
                                        }
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

                        {/* Form xử lý */}
                        {selectedOrder.trangThai === 'PENDING' && (
                            <div className="mb-6">
                                <h4 className="font-medium text-gray-900 mb-3">Xử lý phiếu trả hàng</h4>
                                
                                {/* Thông tin tóm tắt */}
                                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                                    <h5 className="font-medium text-gray-900 mb-2">Tóm tắt xử lý</h5>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="font-medium text-green-700">Sản phẩm được chọn:</span>
                                            <ul className="mt-1 space-y-1">
                                                {getSelectedProducts().map(product => {
                                                    const key = product.thongTinSanPhamTra?.hoaDonChiTietId ?? product.id;
                                                    // Số lượng được duyệt
                                                    const soLuongDuocPheDuyet = selectedOrder.trangThai === 'APPROVED'
                                                        ? (typeof product.soLuongDuocPheDuyet === 'number' ? product.soLuongDuocPheDuyet : 0)
                                                        : (productQuantities[key] || 0);
                                                    return (
                                                        <li key={key} className="text-green-600">
                                                            • {product.thongTinSanPhamTra.tenSanPham} 
                                                            ({soLuongDuocPheDuyet}/{product.soLuongTra} cái - {formatCurrency(soLuongDuocPheDuyet * product.thongTinSanPhamTra.giaBan)})
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        </div>
                                        <div>
                                            <span className="font-medium text-red-700">Sản phẩm bị từ chối:</span>
                                            <ul className="mt-1 space-y-1">
                                                {selectedOrder.chiTietTraHang
                                                    .filter(product => getRejectedQuantity(product) > 0)
                                                    .map(product => {
                                                        const key = product.thongTinSanPhamTra?.hoaDonChiTietId ?? product.id;
                                                        const rejectedQty = getRejectedQuantity(product);
                                                        return (
                                                            <li key={key} className="text-red-600">
                                                                • {product.thongTinSanPhamTra.tenSanPham} 
                                                                ({rejectedQty}/{product.soLuongTra} cái - {formatCurrency(product.thongTinSanPhamTra.giaBan * rejectedQty)})
                                                            </li>
                                                        );
                                                    })}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Form xử lý duy nhất */}
                                <div className="bg-green-50 p-4 rounded-lg mb-4">
                                    <h5 className="font-medium text-green-800 mb-2">
                                        {hasSelectedProducts() ? 'Phê duyệt phiếu trả hàng' : 'Từ chối toàn bộ phiếu trả hàng'}
                                    </h5>
                                    <textarea
                                        placeholder={hasSelectedProducts() ? "Nhập ghi chú phê duyệt tổng thể..." : "Nhập lý do từ chối toàn bộ phiếu trả hàng..."}
                                        className={`w-full p-2 border ${hasSelectedProducts() ? 'border-green-300 focus:ring-green-500' : 'border-red-300 focus:ring-red-500'} rounded-md focus:outline-none focus:ring-2 focus:border-transparent`}
                                        rows="3"
                                        value={approvalNote}
                                        onChange={(e) => setApprovalNote(e.target.value)}
                                    />
                                    <button
                                        onClick={() => handleProcessReturnOrder(selectedOrder.id)}
                                        className={`mt-2 px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md ${
                                            hasSelectedProducts()
                                                ? 'bg-green-600 hover:bg-green-700'
                                                : 'bg-red-600 hover:bg-red-700'
                                        }`}
                                    >
                                        {hasSelectedProducts()
                                            ? `Phê duyệt (${getSelectedProducts().length} sản phẩm)`
                                            : 'Từ chối toàn bộ'}
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
