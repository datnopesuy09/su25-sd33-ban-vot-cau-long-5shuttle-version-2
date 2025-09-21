import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { Link } from 'react-router-dom';
import { TbEyeEdit } from 'react-icons/tb';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

function Product() {
    const navigate = useNavigate();
    const [dataTable, setDataTable] = useState([]);
    const [filterStatus, setFilterStatus] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const itemsPerPage = 5;

    // Lọc sản phẩm theo trạng thái
    const filteredProducts = dataTable.filter((product) => {
        if (filterStatus === '') return true;
        return filterStatus === '1' ? product.trangThai === 1 : product.trangThai === 0;
    });

    // Tính toán phân trang dựa trên dữ liệu đã lọc
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const startIndex = currentPage * itemsPerPage;
    const currentData = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

    // Reset về trang đầu khi lọc thay đổi
    useEffect(() => {
        setCurrentPage(0);
    }, [filterStatus]);

    // Lấy danh sách sản phẩm
    const getAllSanPham = () => {
        axios
            .get(`http://localhost:8080/api/san-pham/hien-thi`)
            .then((response) => {
                setDataTable(response.data);
            })
            .catch((error) => {
                console.error('Có lỗi xảy ra khi lấy sản phẩm:', error);
                toast.error('Không thể tải danh sách sản phẩm!');
            });
    };

    useEffect(() => {
        getAllSanPham();
    }, []);

    const handleDetail = (id) => {
        navigate(`/admin/quan-ly-san-pham/san-pham-ct/${id}/detail`);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b border-gray-200 mb-6">
                <div className="px-6 py-4">
                    <h1 className="text-2xl font-bold text-gray-900">Quản lý sản phẩm</h1>
                    <p className="text-gray-600 mt-1">Danh sách và quản lý các sản phẩm trong hệ thống</p>
                </div>
            </div>

            <div className="px-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {/* Search and Action Bar */}
                    <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                        <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
                            {/* Search Bar */}
                            <div className="relative flex-1 max-w-md">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <SearchIcon className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Nhập tên sản phẩm để tìm..."
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-700 placeholder-gray-500"
                                />
                            </div>
                            
                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-3">
                                <Link to={'/admin/quan-ly-san-pham/san-pham-ct/add'}>
                                    <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg flex items-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                                        <AddIcon className="h-5 w-5" />
                                        Thêm sản phẩm
                                    </button>
                                </Link>
                                <button className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg flex items-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                                    <FileDownloadIcon className="h-5 w-5" />
                                    Xuất Excel
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Filter Section */}
                    <div className="p-6 bg-gray-50 border-b border-gray-200">
                        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                            <div className="flex items-center gap-2">
                                <FilterListIcon className="h-5 w-5 text-gray-600" />
                                <span className="font-semibold text-gray-700">Lọc theo trạng thái:</span>
                            </div>
                            <div className="flex flex-wrap gap-4">
                                <label className="flex items-center cursor-pointer group">
                                    <input
                                        type="radio"
                                        name="status"
                                        value=""
                                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 focus:ring-2"
                                        checked={filterStatus === ''}
                                        onChange={() => setFilterStatus('')}
                                    />
                                    <span className="ml-2 text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
                                        Tất cả
                                    </span>
                                </label>
                                <label className="flex items-center cursor-pointer group">
                                    <input
                                        type="radio"
                                        name="status"
                                        value="1"
                                        className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 focus:ring-green-500 focus:ring-2"
                                        checked={filterStatus === '1'}
                                        onChange={() => setFilterStatus('1')}
                                    />
                                    <span className="ml-2 text-sm font-medium text-gray-700 group-hover:text-green-600 transition-colors">
                                        Đang hoạt động
                                    </span>
                                </label>
                                <label className="flex items-center cursor-pointer group">
                                    <input
                                        type="radio"
                                        name="status"
                                        value="0"
                                        className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 focus:ring-red-500 focus:ring-2"
                                        checked={filterStatus === '0'}
                                        onChange={() => setFilterStatus('0')}
                                    />
                                    <span className="ml-2 text-sm font-medium text-gray-700 group-hover:text-red-600 transition-colors">
                                        Ngừng hoạt động
                                    </span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        STT
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Tên sản phẩm
                                    </th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Số lượng
                                    </th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Trạng thái
                                    </th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Hành động
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {currentData && currentData.length > 0 ? (
                                    currentData.map((sp, index) => (
                                        <tr key={sp.id} className="hover:bg-blue-50 transition-colors duration-200">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {startIndex + index + 1}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{sp.ten}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                                    {sp.soLuong}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <span
                                                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                                                        sp.trangThai === 1
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-red-100 text-red-800'
                                                    }`}
                                                >
                                                    <span
                                                        className={`w-2 h-2 rounded-full mr-2 ${
                                                            sp.trangThai === 1 ? 'bg-green-400' : 'bg-red-400'
                                                        }`}
                                                    ></span>
                                                    {sp.trangThai === 1 ? 'Đang hoạt động' : 'Ngừng hoạt động'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <button
                                                    onClick={() => handleDetail(sp.id)}
                                                    className="inline-flex items-center justify-center w-10 h-10 text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-all duration-200 transform hover:scale-110"
                                                    title="Xem chi tiết sản phẩm"
                                                >
                                                    <TbEyeEdit className="h-5 w-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center">
                                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
                                                    </svg>
                                                </div>
                                                <h3 className="text-lg font-medium text-gray-900 mb-1">Không có sản phẩm nào</h3>
                                                <p className="text-gray-500">Hãy thêm sản phẩm đầu tiên để bắt đầu quản lý.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination */}
                    <div className="bg-white px-6 py-4 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-700">
                                Hiển thị <span className="font-medium">{startIndex + 1}</span> đến{' '}
                                <span className="font-medium">
                                    {Math.min(startIndex + itemsPerPage, filteredProducts.length)}
                                </span>{' '}
                                trong tổng số <span className="font-medium">{filteredProducts.length}</span> sản phẩm
                            </div>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
                                    disabled={currentPage === 0}
                                    className="relative inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-l-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                                    </svg>
                                    Trước
                                </button>
                                
                                <div className="flex space-x-1">
                                    {Array.from({ length: totalPages }, (_, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setCurrentPage(index)}
                                            className={`relative inline-flex items-center px-4 py-2 text-sm font-medium transition-all duration-200 ${
                                                index === currentPage
                                                    ? 'z-10 bg-blue-600 text-white border-blue-600 shadow-md'
                                                    : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                                            } rounded-md`}
                                        >
                                            {index + 1}
                                        </button>
                                    ))}
                                </div>
                                
                                <button
                                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1))}
                                    disabled={currentPage === totalPages - 1}
                                    className="relative inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-r-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                                >
                                    Sau
                                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Product;
