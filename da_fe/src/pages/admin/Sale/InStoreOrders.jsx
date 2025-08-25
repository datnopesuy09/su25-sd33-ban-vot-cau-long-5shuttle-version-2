import { useEffect, useState } from 'react';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import { X, Receipt } from 'lucide-react';

function InStoreOrders() {
    const [orders, setOrders] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [ordersPerPage] = useState(7);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [orderDetails, setOrderDetails] = useState(null);
    const [orderItems, setOrderItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    const loadOrders = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/hoa-don');
            if (!response.ok) throw new Error('Lỗi khi tải dữ liệu hóa đơn');
            const data = await response.json();
            const inStoreOrders = data.filter((order) => order.loaiHoaDon === 'Tại quầy');
            const sortedOrders = inStoreOrders.sort((a, b) => new Date(a.ngayTao) - new Date(b.ngayTao));
            setOrders(sortedOrders);
            setFilteredOrders(sortedOrders);
        } catch (error) {
            console.error('Error fetching in-store orders:', error);
        }
    };

    const handleViewOrder = async (order) => {
        setLoading(true);
        setIsAnimating(true);
        try {
            const response = await fetch(`http://localhost:8080/api/hoa-don/${order.id}`);
            if (!response.ok) throw new Error('Lỗi khi tải chi tiết hóa đơn');
            const orderDetails = await response.json();
            
            const response2 = await fetch(`http://localhost:8080/api/hoa-don-ct/hoa-don/${order.id}`);
            if (!response2.ok) throw new Error('Lỗi khi tải chi tiết hóa đơn con');
            const orderItems = await response2.json();
            
            setSelectedOrder(order);
            setOrderDetails(orderDetails);
            setOrderItems(orderItems);
            setShowModal(true);
        } catch (error) {
            console.error('Error fetching order details:', error);
            alert('Có lỗi xảy ra khi tải chi tiết hóa đơn');
        } finally {
            setLoading(false);
            setTimeout(() => setIsAnimating(false), 300);
        }
    };

    const closeModal = () => {
        setIsAnimating(true);
        setTimeout(() => {
            setShowModal(false);
            setSelectedOrder(null);
            setOrderDetails(null);
            setOrderItems([]);
            setIsAnimating(false);
        }, 300);
    };

    useEffect(() => {
        loadOrders();
    }, []);

    useEffect(() => {
        let filtered = orders;

        if (startDate) {
            filtered = filtered.filter((order) => new Date(order.ngayTao) >= new Date(startDate));
        }
        if (endDate) {
            filtered = filtered.filter((order) => new Date(order.ngayTao) <= new Date(endDate));
        }
        if (selectedStatus !== 'all') {
            filtered = filtered.filter((order) => order.trangThai === parseInt(selectedStatus, 10));
        }
        if (searchTerm) {
            filtered = filtered.filter((order) => order.ma.toLowerCase().includes(searchTerm.toLowerCase()));
        }

        setFilteredOrders(filtered);
        setCurrentPage(1);
    }, [startDate, endDate, selectedStatus, searchTerm, orders]);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleEndDateChange = (e) => {
        setEndDate(e.target.value);
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 1:
                return { label: 'Chờ xác nhận', color: 'bg-yellow-200 text-yellow-800' };
            case 6:
                return { label: 'Hoàn thành', color: 'bg-pink-200 text-gray-800' };
            case 7:
                return { label: 'Đã hủy', color: 'bg-red-200 text-red-800' };
            case 8:
                return { label: 'Trả hàng', color: 'bg-red-400 text-white' };
            default:
                return { label: 'Không xác định', color: 'bg-gray-200 text-gray-800' };
        }
    };

    const statusOptions = [
        { label: 'TẤT CẢ', value: 'all' },
        { label: 'CHỜ XÁC NHẬN', value: '1' },
        { label: 'HOÀN THÀNH', value: '6' },
        { label: 'ĐÃ HỦY', value: '7' },
        { label: 'TRẢ HÀNG', value: '8' },
    ];

    const indexOfLastOrder = currentPage * ordersPerPage;
    const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
    const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
    const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

    return (
        <div className="p-2 bg-gray-50 min-h-screen">
            <div className="bg-white rounded-lg shadow-sm border p-3">
                <div className="mb-3">
                    <h1 className="text-lg font-bold text-gray-800 mb-1">Quản lý đơn hàng tại quầy</h1>
                    <p className="text-xs text-gray-500">Theo dõi và quản lý tất cả đơn hàng tại quầy</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2 mb-3 space-y-2">
                    <div className="flex items-center">
                        <div className="relative flex-grow">
                            <input
                                type="text"
                                placeholder="Tìm kiếm hoá đơn..."
                                className="w-full border border-gray-300 rounded-lg p-1.5 pl-6 text-xs focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                value={searchTerm}
                                onChange={handleSearchChange}
                            />
                            <svg
                                className="absolute left-2 top-2 h-3 w-3 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                />
                            </svg>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                        <div className="flex items-center gap-1">
                            <label className="text-xs font-medium text-gray-600">Từ:</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="border border-gray-300 rounded-md p-1 text-xs focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <div className="flex items-center gap-1">
                            <label className="text-xs font-medium text-gray-600">Đến:</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={handleEndDateChange}
                                className="border border-gray-300 rounded-md p-1 text-xs focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <button className="ml-auto bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-1">
                            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                            </svg>
                            Export Excel
                        </button>
                    </div>
                </div>
                <div className="border-b border-gray-200 mb-2">
                    <nav className="flex space-x-4 overflow-x-auto">
                        {statusOptions.map((status) => (
                            <button
                                key={status.value}
                                onClick={() => setSelectedStatus(status.value)}
                                className={`py-1.5 px-1 text-xs font-medium border-b-2 transition-colors duration-200 whitespace-nowrap flex-shrink-0 ${
                                    selectedStatus === status.value
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                {status.label}
                            </button>
                        ))}
                    </nav>
                </div>
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                    <table className="min-w-full bg-white table-fixed">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="py-2 px-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide w-8">
                                    #
                                </th>
                                <th className="py-2 px-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide w-20 whitespace-nowrap">
                                    Mã
                                </th>
                                <th className="py-2 px-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide w-16 whitespace-nowrap">
                                    Tổng SP
                                </th>
                                <th className="py-2 px-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide w-24 whitespace-nowrap">
                                    Tổng tiền
                                </th>
                                <th className="py-2 px-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide w-32 whitespace-nowrap">
                                    Tên khách hàng
                                </th>
                                <th className="py-2 px-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide w-20 whitespace-nowrap">
                                    Ngày tạo
                                </th>
                                <th className="py-2 px-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide w-24 whitespace-nowrap">
                                    Trạng thái
                                </th>
                                <th className="py-2 px-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide w-16 whitespace-nowrap">
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {currentOrders.map((order, index) => {
                                const { label, color } = getStatusLabel(order.trangThai);
                                return (
                                    <tr key={order.id} className="hover:bg-gray-50 transition-colors duration-150">
                                        <td className="py-2 px-2 text-xs text-gray-600 whitespace-nowrap">
                                            {index + 1}
                                        </td>
                                        <td className="py-2 px-2 text-xs font-medium text-gray-900 whitespace-nowrap truncate">
                                            {order.ma}
                                        </td>
                                        <td className="py-2 px-2 text-xs text-gray-600 whitespace-nowrap">
                                            {order.soLuong}
                                        </td>
                                        <td className="py-2 px-2 text-xs font-medium text-gray-900 whitespace-nowrap">
                                            {order.tongTien
                                                ? order.tongTien.toLocaleString() + ' VNĐ'
                                                : 'Chưa xác định'}
                                        </td>
                                        <td
                                            className="py-2 px-2 text-xs text-gray-600 whitespace-nowrap truncate"
                                            title={order.tenNguoiNhan || 'Khách lẻ'}
                                        >
                                            {order.tenNguoiNhan || 'Khách lẻ'}
                                        </td>
                                        <td className="py-2 px-2 text-xs text-gray-600 whitespace-nowrap">
                                            {new Date(order.ngayTao).toLocaleDateString('vi-VN')}
                                        </td>
                                        <td className="py-2 px-2 whitespace-nowrap">
                                            <span
                                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${color} whitespace-nowrap`}
                                            >
                                                {label}
                                            </span>
                                        </td>
                                        <td className="py-2 px-2 whitespace-nowrap">
                                            <button
                                                onClick={() => handleViewOrder(order)}
                                                className="inline-flex items-center justify-center w-6 h-6 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all duration-200"
                                            >
                                                <RemoveRedEyeIcon className="h-3 w-3" />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                <div className="flex justify-center mb-2 mt-4">
                    <button
                        className={`${
                            currentPage === 1 ? 'bg-gray-200 text-gray-800' : 'bg-white text-blue-600'
                        } border border-blue-200 hover:bg-blue-600 hover:text-white font-medium py-1 px-2 rounded mx-1`}
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        <SkipPreviousIcon />
                    </button>
                    {Array(totalPages)
                        .fill(0)
                        .map((_, index) => (
                            <button
                                key={index}
                                className={`${
                                    currentPage === index + 1 ? 'bg-blue-600 text-white' : 'bg-white text-blue-600'
                                } border border-blue-200 hover:bg-blue-600 hover:text-white font-medium py-1 px-2 rounded mx-1`}
                                onClick={() => setCurrentPage(index + 1)}
                            >
                                {index + 1}
                            </button>
                        ))}
                    <button
                        className={`${
                            currentPage === totalPages ? 'bg-gray-200 text-gray-800' : 'bg-white text-blue-600'
                        } border border-blue-200 hover:bg-blue-600 hover:text-white font-medium py-1 px-2 rounded mx-1`}
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                    >
                        <SkipNextIcon />
                    </button>
                </div>
            </div>

            {/* Modal hiển thị chi tiết hóa đơn */}
            {showModal && (
                <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                    {/* Backdrop với hiệu ứng blur */}
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
                        onClick={closeModal}
                    />

                    {/* Modal Container */}
                    <div
                        className={`relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[85vh] overflow-hidden transform transition-all duration-300 ${
                            isAnimating ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
                        }`}
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="bg-white/20 p-2 rounded-lg">
                                        <Receipt className="w-6 h-6" />
                                    </div>
                                    <h2 className="text-xl font-bold">Chi tiết hóa đơn</h2>
                                </div>
                                <button
                                    onClick={closeModal}
                                    className="p-2 hover:bg-white/20 rounded-lg transition-colors duration-200"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        {loading ? (
                            <div className="p-8 text-center">
                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                <p className="mt-2 text-gray-600">Đang tải...</p>
                            </div>
                        ) : (
                            <div className="p-6 space-y-4 overflow-y-auto max-h-[calc(85vh-200px)]">
                                {/* Thông tin hóa đơn */}
                                {orderDetails && (
                                    <div className="bg-gray-50 rounded-xl p-4">
                                        <h3 className="text-md font-semibold text-gray-800 mb-3">Thông tin hóa đơn</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <span className="font-medium text-gray-600">Mã hóa đơn:</span>
                                                <span className="ml-2 text-gray-800">{orderDetails.ma}</span>
                                            </div>
                                            <div>
                                                <span className="font-medium text-gray-600">Ngày tạo:</span>
                                                <span className="ml-2 text-gray-800">
                                                    {new Date(orderDetails.ngayTao).toLocaleDateString('vi-VN')}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="font-medium text-gray-600">Tên khách hàng:</span>
                                                <span className="ml-2 text-gray-800">
                                                    {orderDetails.tenNguoiNhan || 'Khách lẻ'}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="font-medium text-gray-600">Số điện thoại:</span>
                                                <span className="ml-2 text-gray-800">
                                                    {orderDetails.sdtNguoiNhan || 'Không có'}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="font-medium text-gray-600">Loại hóa đơn:</span>
                                                <span className="ml-2 text-gray-800">{orderDetails.loaiHoaDon}</span>
                                            </div>
                                            <div>
                                                <span className="font-medium text-gray-600">Trạng thái:</span>
                                                <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusLabel(orderDetails.trangThai).color}`}>
                                                    {getStatusLabel(orderDetails.trangThai).label}
                                                </span>
                                            </div>
                                            <div className="md:col-span-2">
                                                <span className="font-medium text-gray-600">Tổng tiền:</span>
                                                <span className="ml-2 text-lg font-bold text-blue-600">
                                                    {orderDetails.tongTien ? orderDetails.tongTien.toLocaleString() + ' VNĐ' : 'Chưa xác định'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Danh sách sản phẩm */}
                                {orderItems && orderItems.length > 0 && (
                                    <div className="bg-white border rounded-xl">
                                        <h3 className="text-md font-semibold text-gray-800 p-4 border-b">Sản phẩm đã mua</h3>
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase">STT</th>
                                                        <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase">Hình ảnh</th>
                                                        <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase">Tên sản phẩm</th>
                                                        <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase">Thương hiệu</th>
                                                        <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase">Màu sắc</th>
                                                        <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase">Trọng lượng</th>
                                                        <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase">Số lượng</th>
                                                        <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase">Đơn giá</th>
                                                        <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase">Thành tiền</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-200">
                                                    {orderItems.map((item, index) => (
                                                        <tr key={item.id} className="hover:bg-gray-50">
                                                            <td className="py-3 px-4 text-sm text-gray-600">{index + 1}</td>
                                                            <td className="py-3 px-4">
                                                                <img
                                                                    src={item.hinhAnhUrl || 'https://via.placeholder.com/40'}
                                                                    alt={item.sanPhamCT?.ten || 'Sản phẩm'}
                                                                    className="w-10 h-10 object-cover rounded"
                                                                    onError={(e) => (e.target.src = 'https://via.placeholder.com/40')}
                                                                />
                                                            </td>
                                                            <td className="py-3 px-4 text-sm font-medium text-gray-900">
                                                                {item.sanPhamCT?.ten || 'Không xác định'}
                                                            </td>
                                                            <td className="py-3 px-4 text-sm text-gray-600">
                                                                {item.sanPhamCT?.thuongHieu?.ten || 'Không xác định'}
                                                            </td>
                                                            <td className="py-3 px-4 text-sm text-gray-600">
                                                                {item.sanPhamCT?.mauSac?.ten || 'Không xác định'}
                                                            </td>
                                                            <td className="py-3 px-4 text-sm text-gray-600">
                                                                {item.sanPhamCT?.trongLuong?.ten || 'Không xác định'}
                                                            </td>
                                                            <td className="py-3 px-4 text-sm text-gray-600">{item.soLuong}</td>
                                                            <td className="py-3 px-4 text-sm text-gray-600">
                                                                {item.giaBan ? item.giaBan.toLocaleString() + ' VNĐ' : 'Không xác định'}
                                                            </td>
                                                            <td className="py-3 px-4 text-sm font-medium text-gray-900">
                                                                {item.giaBan && item.soLuong
                                                                    ? (item.giaBan * item.soLuong).toLocaleString() + ' VNĐ'
                                                                    : 'Không xác định'}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {/* Footer với tổng tiền */}
                                {orderDetails && (
                                    <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                                        <div className="flex justify-between items-center">
                                            <span className="text-lg font-semibold text-gray-800">Tổng cộng:</span>
                                            <span className="text-xl font-bold text-blue-600">
                                                {orderDetails.tongTien ? orderDetails.tongTien.toLocaleString() + ' VNĐ' : 'Chưa xác định'}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default InStoreOrders;