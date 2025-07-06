import { useEffect, useState } from 'react';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import { useNavigate } from 'react-router-dom';

function Order() {
    const [orders, setOrders] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [ordersPerPage] = useState(7);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedType, setSelectedType] = useState('online'); // Mặc định là "Trực tuyến"
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [selectedStatus, setSelectedStatus] = useState('1'); // Mặc định là "Chờ xác nhận"
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    // Hàm để tải đơn hàng từ API
    const loadOrders = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/hoa-don');
            const data = await response.json();
            // Sắp xếp hóa đơn để hóa đơn mới nhất xuống cuối
            const sortedOrders = data.sort((a, b) => new Date(a.ngayTao) - new Date(b.ngayTao));
            setOrders(sortedOrders);
            setFilteredOrders(sortedOrders);
        } catch (error) {
            console.error('Error fetching orders:', error);
        }
    };

    const handleViewOrder = async (order) => {
        try {
            const response = await fetch(`http://localhost:8080/api/hoa-don/${order.id}`);
            const orderDetails = await response.json();
            const response2 = await fetch(`http://localhost:8080/api/hoa-don-ct/hoa-don/${order.id}`);
            const orderDetails2 = await response2.json();
            const response3 = await fetch(`http://localhost:8080/api/thanh-toan/hoa-don/${order.id}`);
            const checkOut = await response3.json();
            navigate('/admin/quan-ly-don-hang/order-status', {
                state: { order: orderDetails, orderDetails: orderDetails2, checkOut: checkOut },
            });
        } catch (error) {
            console.error('Error fetching order details:', error);
        }
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

        // Chỉ lọc hóa đơn có loại "Trực tuyến"
        if (selectedType === 'online') {
            filtered = filtered.filter((order) => order.loaiHoaDon === 'Trực tuyến');
        } 

        if (selectedStatus !== 'all') {
            filtered = filtered.filter((order) => order.trangThai === parseInt(selectedStatus, 10));
        }

        if (searchTerm) {
            filtered = filtered.filter((order) => order.ma.toLowerCase().includes(searchTerm.toLowerCase()));
        }

        setFilteredOrders(filtered);
        setCurrentPage(1);
    }, [startDate, endDate, selectedType, selectedStatus, searchTerm, orders]);

    const handleTypeChange = (e) => {
        setSelectedType(e.target.value);
    };

    const handleEndDateChange = (e) => {
        setEndDate(e.target.value);
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 1:
                return { label: 'Chờ xác nhận', color: 'bg-yellow-200 text-yellow-800' };
            case 2:
                return { label: 'Chờ giao hàng', color: 'bg-blue-200 text-blue-800' };
            case 3:
                return { label: 'Đang vận chuyển', color: 'bg-purple-200 text-purple-800' };
            case 4:
                return { label: 'Đã giao hàng', color: 'bg-gray-200 text-green-800' };
            case 5:
                return { label: 'Đã thanh toán', color: 'bg-teal-200 text-teal-800' };
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
        { label: 'ĐÃ HUỶ', value: '7' },
        { label: 'CHỜ XÁC NHẬN', value: '1' },
        { label: 'CHỜ GIAO HÀNG', value: '2' },
        { label: 'ĐANG VẬN CHUYỂN', value: '3' },
        { label: 'ĐÃ GIAO HÀNG', value: '4' },
        { label: 'ĐÃ THANH TOÁN', value: '5' },
        { label: 'HOÀN THÀNH', value: '6' },
        { label: 'TRẢ HÀNG', value: '8' },
    ];

    const indexOfLastOrder = currentPage * ordersPerPage;
    const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
    const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
    const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

    return (
        <div className="p-2 bg-gray-50 min-h-screen">
            <div className="bg-white rounded-lg shadow-sm border p-3">
                {/* Header */}
                <div className="mb-3">
                    <h1 className="text-lg font-bold text-gray-800 mb-1">Quản lý đơn hàng</h1>
                    <p className="text-xs text-gray-500">Theo dõi và quản lý tất cả đơn hàng của bạn</p>
                </div>
                
                {/* Search and Filters */}
                <div className="bg-gray-50 rounded-lg p-2 mb-3 space-y-2">
                    {/* Search bar */}
                    <div className="flex items-center">
                        <div className="relative flex-grow">
                            <input
                                type="text"
                                placeholder="Tìm kiếm hoá đơn..."
                                className="w-full border border-gray-300 rounded-lg p-1.5 pl-6 text-xs focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                value={searchTerm}
                                onChange={handleSearchChange}
                            />
                            <svg className="absolute left-2 top-2 h-3 w-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>

                    {/* Date range and filters */}
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
                        
                        {/* Type filter */}
                        <div className="flex items-center gap-2 bg-white rounded-lg p-1.5 border">
                            <span className="text-xs font-medium text-gray-600">Loại:</span>
                            <label className="flex items-center gap-1 text-xs cursor-pointer">
                                <input
                                    type="radio"
                                    name="type"
                                    value="all"
                                    checked={selectedType === 'all'}
                                    onChange={handleTypeChange}
                                    className="text-blue-600 focus:ring-blue-500 w-3 h-3"
                                />
                                <span>Tất cả</span>
                            </label>
                            <label className="flex items-center gap-1 text-xs cursor-pointer">
                                <input
                                    type="radio"
                                    name="type"
                                    value="online"
                                    checked={selectedType === 'online'}
                                    onChange={handleTypeChange}
                                    className="text-blue-600 focus:ring-blue-500 w-3 h-3"
                                />
                                <span>Trực tuyến</span>
                            </label>
                            <label className="flex items-center gap-1 text-xs cursor-pointer">
                                <input
                                    type="radio"
                                    name="type"
                                    value="in-store"
                                    checked={selectedType === 'in-store'}
                                    onChange={handleTypeChange}
                                    className="text-blue-600 focus:ring-blue-500 w-3 h-3"
                                />
                                <span>Tại quầy</span>
                            </label>
                        </div>
                        
                        <button className="ml-auto bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-1">
                            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Export Excel
                        </button>
                    </div>
                </div>

                {/* Status tabs */}
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

                {/* Table */}
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                    <table className="min-w-full bg-white table-fixed">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="py-2 px-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide w-8">#</th>
                                <th className="py-2 px-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide w-20 whitespace-nowrap">Mã</th>
                                <th className="py-2 px-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide w-16 whitespace-nowrap">Tổng SP</th>
                                <th className="py-2 px-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide w-24 whitespace-nowrap">Tổng tiền</th>
                                <th className="py-2 px-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide w-32 whitespace-nowrap">Tên khách hàng</th>
                                <th className="py-2 px-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide w-20 whitespace-nowrap">Ngày tạo</th>
                                <th className="py-2 px-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide w-24 whitespace-nowrap">Loại HĐ</th>
                                <th className="py-2 px-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide w-24 whitespace-nowrap">Trạng thái</th>
                                <th className="py-2 px-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide w-16 whitespace-nowrap">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {currentOrders.map((order, index) => {
                                const { label, color } = getStatusLabel(order.trangThai);
                                return (
                                    <tr key={order.id} className="hover:bg-gray-50 transition-colors duration-150">
                                        <td className="py-2 px-2 text-xs text-gray-600 whitespace-nowrap">{index + 1}</td>
                                        <td className="py-2 px-2 text-xs font-medium text-gray-900 whitespace-nowrap truncate">{order.ma}</td>
                                        <td className="py-2 px-2 text-xs text-gray-600 whitespace-nowrap">{order.soLuong}</td>
                                        <td className="py-2 px-2 text-xs font-medium text-gray-900 whitespace-nowrap">
                                            {order.tongTien ? order.tongTien.toLocaleString() + ' VNĐ' : 'Chưa xác định'}
                                        </td>
                                        <td className="py-2 px-2 text-xs text-gray-600 whitespace-nowrap truncate" title={order.tenNguoiNhan || 'Khách lẻ'}>{order.tenNguoiNhan || 'Khách lẻ'}</td>
                                        <td className="py-2 px-2 text-xs text-gray-600 whitespace-nowrap">
                                            {new Date(order.ngayTao).toLocaleDateString('vi-VN')}
                                        </td>
                                        <td className="py-2 px-2 whitespace-nowrap">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 whitespace-nowrap">
                                                {order.loaiHoaDon || 'Không xác định'}
                                            </span>
                                        </td>
                                        <td className="py-2 px-2 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${color} whitespace-nowrap`}>
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

                {/* Pagination */}
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
        </div>
    );
}

export default Order;
