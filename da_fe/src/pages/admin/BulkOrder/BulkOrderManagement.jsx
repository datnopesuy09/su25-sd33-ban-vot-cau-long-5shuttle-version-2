import React, { useState, useEffect } from 'react';
import {
    Users,
    Phone,
    Mail,
    MessageCircle,
    Clock,
    TrendingUp,
    Filter,
    Search,
    Download,
    Eye,
    CheckCircle,
    XCircle,
    AlertCircle,
} from 'lucide-react';

const BulkOrderManagement = () => {
    const [bulkInquiries, setBulkInquiries] = useState([]);
    const [filteredInquiries, setFilteredInquiries] = useState([]);
    const [selectedInquiry, setSelectedInquiry] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [filters, setFilters] = useState({
        status: 'all',
        method: 'all',
        dateRange: 'all',
        search: '',
    });
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        contacted: 0,
        completed: 0,
        avgOrderValue: 0,
    });

    // Mock data - thay thế bằng API call thực tế
    const mockInquiries = [
        {
            id: 1,
            customerInfo: {
                name: 'Nguyễn Văn A',
                phone: '0123456789',
                email: 'customer1@email.com',
                note: 'Muốn mua số lượng lớn cho câu lạc bộ',
            },
            orderData: {
                totalQuantity: 15,
                totalValue: 4500000,
                itemCount: 8,
                cartItems: [
                    { name: 'Vợt cầu lông Yonex', quantity: 5, price: 450000 },
                    { name: 'Quả cầu lông', quantity: 10, price: 25000 },
                ],
            },
            contactMethod: 'phone',
            status: 'pending', // pending, contacted, completed, cancelled
            assignedStaff: null,
            createdAt: '2025-01-20T10:30:00',
            updatedAt: '2025-01-20T10:30:00',
            notes: [],
        },
        {
            id: 2,
            customerInfo: {
                name: 'Trần Thị B',
                phone: '0987654321',
                email: 'customer2@email.com',
                note: 'Cần tư vấn combo sản phẩm cho doanh nghiệp',
            },
            orderData: {
                totalQuantity: 25,
                totalValue: 8200000,
                itemCount: 12,
                cartItems: [
                    { name: 'Vợt cầu lông Yonex Pro', quantity: 8, price: 650000 },
                    { name: 'Giày cầu lông', quantity: 6, price: 1200000 },
                ],
            },
            contactMethod: 'zalo',
            status: 'contacted',
            assignedStaff: 'Nhân viên A',
            createdAt: '2025-01-19T14:20:00',
            updatedAt: '2025-01-20T09:15:00',
            notes: [{ text: 'Đã liên hệ, khách quan tâm combo', time: '2025-01-20T09:15:00', staff: 'Nhân viên A' }],
        },
    ];

    useEffect(() => {
        // Fetch bulk inquiries from API
        setBulkInquiries(mockInquiries);
        updateStats(mockInquiries);
    }, []);

    useEffect(() => {
        filterInquiries();
    }, [bulkInquiries, filters]);

    const updateStats = (inquiries) => {
        const stats = {
            total: inquiries.length,
            pending: inquiries.filter((i) => i.status === 'pending').length,
            contacted: inquiries.filter((i) => i.status === 'contacted').length,
            completed: inquiries.filter((i) => i.status === 'completed').length,
            avgOrderValue: inquiries.reduce((sum, i) => sum + i.orderData.totalValue, 0) / inquiries.length || 0,
        };
        setStats(stats);
    };

    const filterInquiries = () => {
        let filtered = [...bulkInquiries];

        if (filters.status !== 'all') {
            filtered = filtered.filter((inquiry) => inquiry.status === filters.status);
        }

        if (filters.method !== 'all') {
            filtered = filtered.filter((inquiry) => inquiry.contactMethod === filters.method);
        }

        if (filters.search) {
            filtered = filtered.filter(
                (inquiry) =>
                    inquiry.customerInfo.name.toLowerCase().includes(filters.search.toLowerCase()) ||
                    inquiry.customerInfo.phone.includes(filters.search) ||
                    inquiry.customerInfo.email.toLowerCase().includes(filters.search.toLowerCase()),
            );
        }

        // Date range filter
        if (filters.dateRange !== 'all') {
            const now = new Date();
            const filterDate = new Date();

            switch (filters.dateRange) {
                case 'today':
                    filterDate.setHours(0, 0, 0, 0);
                    break;
                case 'week':
                    filterDate.setDate(now.getDate() - 7);
                    break;
                case 'month':
                    filterDate.setMonth(now.getMonth() - 1);
                    break;
            }

            filtered = filtered.filter((inquiry) => new Date(inquiry.createdAt) >= filterDate);
        }

        setFilteredInquiries(filtered);
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending':
                return <AlertCircle className="w-4 h-4 text-yellow-500" />;
            case 'contacted':
                return <Clock className="w-4 h-4 text-blue-500" />;
            case 'completed':
                return <CheckCircle className="w-4 h-4 text-green-500" />;
            case 'cancelled':
                return <XCircle className="w-4 h-4 text-red-500" />;
            default:
                return <AlertCircle className="w-4 h-4 text-gray-500" />;
        }
    };

    const getStatusText = (status) => {
        const statusMap = {
            pending: 'Chờ xử lý',
            contacted: 'Đã liên hệ',
            completed: 'Hoàn thành',
            cancelled: 'Đã hủy',
        };
        return statusMap[status] || 'Không xác định';
    };

    const getContactMethodIcon = (method) => {
        switch (method) {
            case 'phone':
                return <Phone className="w-4 h-4 text-green-600" />;
            case 'zalo':
                return <MessageCircle className="w-4 h-4 text-blue-600" />;
            case 'email':
                return <Mail className="w-4 h-4 text-purple-600" />;
            default:
                return <Users className="w-4 h-4 text-gray-600" />;
        }
    };

    const handleStatusUpdate = (inquiryId, newStatus) => {
        setBulkInquiries((prev) =>
            prev.map((inquiry) =>
                inquiry.id === inquiryId
                    ? { ...inquiry, status: newStatus, updatedAt: new Date().toISOString() }
                    : inquiry,
            ),
        );
    };

    const handleAssignStaff = (inquiryId, staffName) => {
        setBulkInquiries((prev) =>
            prev.map((inquiry) =>
                inquiry.id === inquiryId
                    ? { ...inquiry, assignedStaff: staffName, updatedAt: new Date().toISOString() }
                    : inquiry,
            ),
        );
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('vi-VN');
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Quản lý Đơn hàng Số lượng lớn</h1>
                <p className="text-gray-600">Theo dõi và xử lý các yêu cầu tư vấn đơn hàng bulk từ khách hàng</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg shadow-sm border">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Tổng yêu cầu</p>
                            <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
                        </div>
                        <Users className="w-8 h-8 text-blue-500" />
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow-sm border">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Chờ xử lý</p>
                            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                        </div>
                        <AlertCircle className="w-8 h-8 text-yellow-500" />
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow-sm border">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Đã liên hệ</p>
                            <p className="text-2xl font-bold text-blue-600">{stats.contacted}</p>
                        </div>
                        <Clock className="w-8 h-8 text-blue-500" />
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow-sm border">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Giá trị TB</p>
                            <p className="text-lg font-bold text-green-600">{formatCurrency(stats.avgOrderValue)}</p>
                        </div>
                        <TrendingUp className="w-8 h-8 text-green-500" />
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                        <select
                            value={filters.status}
                            onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">Tất cả</option>
                            <option value="pending">Chờ xử lý</option>
                            <option value="contacted">Đã liên hệ</option>
                            <option value="completed">Hoàn thành</option>
                            <option value="cancelled">Đã hủy</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phương thức liên hệ</label>
                        <select
                            value={filters.method}
                            onChange={(e) => setFilters((prev) => ({ ...prev, method: e.target.value }))}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">Tất cả</option>
                            <option value="phone">Điện thoại</option>
                            <option value="zalo">Zalo</option>
                            <option value="email">Email</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Thời gian</label>
                        <select
                            value={filters.dateRange}
                            onChange={(e) => setFilters((prev) => ({ ...prev, dateRange: e.target.value }))}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">Tất cả</option>
                            <option value="today">Hôm nay</option>
                            <option value="week">7 ngày qua</option>
                            <option value="month">30 ngày qua</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tìm kiếm</label>
                        <div className="relative">
                            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Tên, SĐT, Email..."
                                value={filters.search}
                                onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <div className="flex items-end">
                        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center justify-center gap-2">
                            <Download className="w-4 h-4" />
                            Xuất Excel
                        </button>
                    </div>
                </div>
            </div>

            {/* Inquiries Table */}
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Khách hàng
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Đơn hàng
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Liên hệ
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Trạng thái
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Nhân viên
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Thời gian
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Thao tác
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredInquiries.map((inquiry) => (
                                <tr key={inquiry.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">
                                                {inquiry.customerInfo.name}
                                            </div>
                                            <div className="text-sm text-gray-500">{inquiry.customerInfo.phone}</div>
                                            <div className="text-sm text-gray-500">{inquiry.customerInfo.email}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">
                                                {inquiry.orderData.totalQuantity} sản phẩm
                                            </div>
                                            <div className="text-sm text-green-600">
                                                {formatCurrency(inquiry.orderData.totalValue)}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {inquiry.orderData.itemCount} loại
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-1">
                                            {getContactMethodIcon(inquiry.contactMethod)}
                                            <span className="text-sm text-gray-900 capitalize">
                                                {inquiry.contactMethod}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            {getStatusIcon(inquiry.status)}
                                            <span className="text-sm text-gray-900">
                                                {getStatusText(inquiry.status)}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {inquiry.assignedStaff || '---'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {formatDate(inquiry.createdAt)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button
                                            onClick={() => {
                                                setSelectedInquiry(inquiry);
                                                setShowDetailModal(true);
                                            }}
                                            className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                                        >
                                            <Eye className="w-4 h-4" />
                                            Chi tiết
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredInquiries.length === 0 && (
                    <div className="text-center py-8">
                        <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">Không có yêu cầu nào phù hợp</p>
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            {showDetailModal && selectedInquiry && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-bold">Chi tiết yêu cầu #{selectedInquiry.id}</h3>
                                <button
                                    onClick={() => setShowDetailModal(false)}
                                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>

                        <div className="p-6">
                            {/* Customer Info */}
                            <div className="mb-6">
                                <h4 className="font-semibold text-gray-800 mb-3">Thông tin khách hàng</h4>
                                <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-2 gap-4">
                                    <div>
                                        <span className="text-sm text-gray-500">Tên:</span>
                                        <p className="font-medium">{selectedInquiry.customerInfo.name}</p>
                                    </div>
                                    <div>
                                        <span className="text-sm text-gray-500">Điện thoại:</span>
                                        <p className="font-medium">{selectedInquiry.customerInfo.phone}</p>
                                    </div>
                                    <div>
                                        <span className="text-sm text-gray-500">Email:</span>
                                        <p className="font-medium">{selectedInquiry.customerInfo.email}</p>
                                    </div>
                                    <div>
                                        <span className="text-sm text-gray-500">Phương thức liên hệ:</span>
                                        <div className="flex items-center gap-1">
                                            {getContactMethodIcon(selectedInquiry.contactMethod)}
                                            <span className="font-medium capitalize">
                                                {selectedInquiry.contactMethod}
                                            </span>
                                        </div>
                                    </div>
                                    {selectedInquiry.customerInfo.note && (
                                        <div className="col-span-2">
                                            <span className="text-sm text-gray-500">Ghi chú:</span>
                                            <p className="font-medium">{selectedInquiry.customerInfo.note}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Order Info */}
                            <div className="mb-6">
                                <h4 className="font-semibold text-gray-800 mb-3">Thông tin đơn hàng</h4>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <div className="grid grid-cols-3 gap-4 mb-4">
                                        <div className="text-center">
                                            <p className="text-2xl font-bold text-blue-600">
                                                {selectedInquiry.orderData.totalQuantity}
                                            </p>
                                            <p className="text-sm text-gray-500">Tổng số lượng</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-2xl font-bold text-green-600">
                                                {formatCurrency(selectedInquiry.orderData.totalValue)}
                                            </p>
                                            <p className="text-sm text-gray-500">Tổng giá trị</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-2xl font-bold text-purple-600">
                                                {selectedInquiry.orderData.itemCount}
                                            </p>
                                            <p className="text-sm text-gray-500">Số loại sản phẩm</p>
                                        </div>
                                    </div>

                                    <div>
                                        <h5 className="font-medium mb-2">Sản phẩm trong giỏ:</h5>
                                        <div className="space-y-2">
                                            {selectedInquiry.orderData.cartItems.map((item, index) => (
                                                <div
                                                    key={index}
                                                    className="flex justify-between items-center bg-white p-2 rounded"
                                                >
                                                    <span>{item.name}</span>
                                                    <span className="text-sm text-gray-600">
                                                        {item.quantity} x {formatCurrency(item.price)}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Status Update */}
                            <div className="mb-6">
                                <h4 className="font-semibold text-gray-800 mb-3">Cập nhật trạng thái</h4>
                                <div className="flex gap-4">
                                    <select
                                        value={selectedInquiry.status}
                                        onChange={(e) => handleStatusUpdate(selectedInquiry.id, e.target.value)}
                                        className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="pending">Chờ xử lý</option>
                                        <option value="contacted">Đã liên hệ</option>
                                        <option value="completed">Hoàn thành</option>
                                        <option value="cancelled">Đã hủy</option>
                                    </select>
                                    <input
                                        type="text"
                                        placeholder="Nhân viên phụ trách"
                                        value={selectedInquiry.assignedStaff || ''}
                                        onChange={(e) => handleAssignStaff(selectedInquiry.id, e.target.value)}
                                        className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="flex gap-3">
                                <button className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg">
                                    <Phone className="w-4 h-4" />
                                    Gọi điện
                                </button>
                                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
                                    <MessageCircle className="w-4 h-4" />
                                    Nhắn tin
                                </button>
                                <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg">
                                    <Mail className="w-4 h-4" />
                                    Gửi email
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BulkOrderManagement;
