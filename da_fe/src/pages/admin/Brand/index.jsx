import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import TrashIcon from '@heroicons/react/24/outline/TrashIcon';
import PencilIcon from '@heroicons/react/24/outline/PencilIcon';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

function Brand() {
    const [brands, setBrands] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [brandToDelete, setBrandToDelete] = useState(null);
    const [brandToUpdate, setBrandToUpdate] = useState(null);
    const [filterStatus, setFilterStatus] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    // Pagination
    const [currentPage, setCurrentPage] = useState(0);
    const brandsPerPage = 5;

    const {
        register,
        handleSubmit,
        setValue,
        reset,
        formState: { errors },
    } = useForm();

    // Filter brands based on status and search term
    const filteredBrands = brands.filter((brand) => {
        const matchesStatus = filterStatus === '' || brand.trangThai.toString() === filterStatus;
        const matchesSearch = brand.ten.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    // Calculate pagination based on filtered data
    const totalPages = Math.ceil(filteredBrands.length / brandsPerPage);
    const startIndex = currentPage * brandsPerPage;
    const currentBrands = filteredBrands.slice(startIndex, startIndex + brandsPerPage);

    // Reset to first page when filter changes
    useEffect(() => {
        setCurrentPage(0);
    }, [filterStatus, searchTerm]);

    const loadBrands = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/thuong-hieu');
            setBrands(response.data);
        } catch (error) {
            console.error('Failed to fetch brands', error);
            toast.error('Không thể tải danh sách thương hiệu!');
        }
    };

    useEffect(() => {
        loadBrands();
    }, []);

    // Delete a brand
    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://localhost:8080/api/thuong-hieu/${id}`);
            loadBrands();
            setShowModal(false);
            toast.success('Xóa thương hiệu thành công!');
        } catch (error) {
            console.error('Failed to delete brand', error);
            toast.error('Có lỗi xảy ra khi xóa thương hiệu!');
        }
    };

    // Add a new brand
    const handleAddBrand = async (values) => {
        const newBrand = {
            ten: values.brandName,
            trangThai: values.status === '1' ? 1 : 0,
        };

        try {
            await axios.post('http://localhost:8080/api/thuong-hieu', newBrand);
            toast.success('Thêm thương hiệu thành công!');
            setShowAddModal(false);
            loadBrands();
            reset(); // Reset form values after adding
        } catch (error) {
            console.error('Có lỗi xảy ra khi thêm thương hiệu!', error);
            toast.error('Có lỗi xảy ra khi thêm thương hiệu!');
        }
    };

    // Open modal to confirm deletion
    const confirmDelete = (id) => {
        setBrandToDelete(id);
        setShowModal(true);
    };

    const handleAddModal = () => {
        reset(); // Reset the form values and errors
        setShowAddModal(true);
    };

    // Open update modal and fill the form
    const handleUpdateModal = async (brand) => {
        reset();
        setValue('brandName', brand.ten);
        setValue('status', brand.trangThai.toString());
        setBrandToUpdate(brand.id);
        setShowUpdateModal(true);
    };

    // Update a brand
    const handleUpdateBrand = async (values) => {
        const updatedBrand = {
            ten: values.brandName,
            trangThai: values.status === '1' ? 1 : 0,
        };
        try {
            await axios.put(`http://localhost:8080/api/thuong-hieu/${brandToUpdate}`, updatedBrand);
            toast.success('Cập nhật thương hiệu thành công!');
            setShowUpdateModal(false);
            loadBrands();
            reset(); // Reset form values after updating
        } catch (error) {
            console.error('Có lỗi xảy ra khi cập nhật thương hiệu!', error);
            toast.error('Có lỗi xảy ra khi cập nhật thương hiệu!');
        }
    };

    // Pagination controls
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b border-gray-200 mb-6">
                <div className="px-6 py-4">
                    <h1 className="text-2xl font-bold text-gray-900">Quản lý thương hiệu</h1>
                    <p className="text-gray-600 mt-1">Danh sách và quản lý các thương hiệu trong hệ thống</p>
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
                                    placeholder="Nhập tên thương hiệu để tìm..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-700 placeholder-gray-500"
                                />
                            </div>
                            
                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-3">
                                <button
                                    onClick={handleAddModal}
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg flex items-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                                >
                                    <AddIcon className="h-5 w-5" />
                                    Thêm thương hiệu
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
                                        ID
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Tên thương hiệu
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
                                {currentBrands && currentBrands.length > 0 ? (
                                    currentBrands.map((brand, index) => (
                                        <tr key={brand.id} className="hover:bg-blue-50 transition-colors duration-200">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {startIndex + index + 1}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {brand.id}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{brand.ten}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <span
                                                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                                                        brand.trangThai === 1
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-red-100 text-red-800'
                                                    }`}
                                                >
                                                    <span
                                                        className={`w-2 h-2 rounded-full mr-2 ${
                                                            brand.trangThai === 1 ? 'bg-green-400' : 'bg-red-400'
                                                        }`}
                                                    ></span>
                                                    {brand.trangThai === 1 ? 'Đang hoạt động' : 'Ngừng hoạt động'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => handleUpdateModal(brand)}
                                                        className="inline-flex items-center justify-center w-10 h-10 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200 transform hover:scale-110"
                                                        title="Chỉnh sửa thương hiệu"
                                                    >
                                                        <PencilIcon className="h-5 w-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => confirmDelete(brand.id)}
                                                        className="inline-flex items-center justify-center w-10 h-10 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200 transform hover:scale-110"
                                                        title="Xóa thương hiệu"
                                                    >
                                                        <TrashIcon className="h-5 w-5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center">
                                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
                                                    </svg>
                                                </div>
                                                <h3 className="text-lg font-medium text-gray-900 mb-1">Không có thương hiệu nào</h3>
                                                <p className="text-gray-500">Hãy thêm thương hiệu đầu tiên để bắt đầu quản lý.</p>
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
                                    {Math.min(startIndex + brandsPerPage, filteredBrands.length)}
                                </span>{' '}
                                trong tổng số <span className="font-medium">{filteredBrands.length}</span> thương hiệu
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

            {/* Modal for delete confirmation */}
            {showModal && (
                <div className="fixed inset-0 bg-black/10 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4">
                        <div className="flex items-center mb-6">
                            <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <h3 className="text-xl font-bold text-gray-900">Xác nhận xóa</h3>
                                <p className="text-gray-600">Hành động này không thể hoàn tác</p>
                            </div>
                        </div>
                        <p className="text-gray-700 mb-8">Bạn có chắc chắn muốn xóa thương hiệu này không?</p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors duration-200"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={() => handleDelete(brandToDelete)}
                                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors duration-200"
                            >
                                Xóa
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal for adding a brand */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/10 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4">
                        <div className="flex items-center mb-6">
                            <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                <AddIcon className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="ml-4">
                                <h3 className="text-xl font-bold text-gray-900">Thêm thương hiệu mới</h3>
                                <p className="text-gray-600">Điền thông tin thương hiệu</p>
                            </div>
                        </div>
                        <form onSubmit={handleSubmit(handleAddBrand)} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tên thương hiệu <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                                        errors.brandName ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="Nhập tên thương hiệu..."
                                    {...register('brandName', { required: true })}
                                />
                                {errors.brandName && (
                                    <p className="mt-1 text-sm text-red-500">Tên thương hiệu là bắt buộc</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Trạng thái <span className="text-red-500">*</span>
                                </label>
                                <div className="space-y-3">
                                    <label className="flex items-center cursor-pointer group">
                                        <input
                                            type="radio"
                                            value="1"
                                            className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 focus:ring-green-500 focus:ring-2"
                                            {...register('status', { required: true })}
                                        />
                                        <span className="ml-3 text-sm font-medium text-gray-700 group-hover:text-green-600 transition-colors">
                                            Đang hoạt động
                                        </span>
                                    </label>
                                    <label className="flex items-center cursor-pointer group">
                                        <input
                                            type="radio"
                                            value="0"
                                            className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 focus:ring-red-500 focus:ring-2"
                                            {...register('status', { required: true })}
                                        />
                                        <span className="ml-3 text-sm font-medium text-gray-700 group-hover:text-red-600 transition-colors">
                                            Ngừng hoạt động
                                        </span>
                                    </label>
                                </div>
                                {errors.status && (
                                    <p className="mt-1 text-sm text-red-500">Trạng thái là bắt buộc</p>
                                )}
                            </div>
                            <div className="flex justify-end space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors duration-200"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200"
                                >
                                    Thêm thương hiệu
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal for updating a brand */}
            {showUpdateModal && (
                <div className="fixed inset-0 bg-black/10 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4">
                        <div className="flex items-center mb-6">
                            <div className="flex-shrink-0 w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                                <PencilIcon className="w-6 h-6 text-amber-600" />
                            </div>
                            <div className="ml-4">
                                <h3 className="text-xl font-bold text-gray-900">Cập nhật thương hiệu</h3>
                                <p className="text-gray-600">Chỉnh sửa thông tin thương hiệu</p>
                            </div>
                        </div>
                        <form onSubmit={handleSubmit(handleUpdateBrand)} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tên thương hiệu <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                                        errors.brandName ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="Nhập tên thương hiệu..."
                                    {...register('brandName', { required: true })}
                                />
                                {errors.brandName && (
                                    <p className="mt-1 text-sm text-red-500">Tên thương hiệu là bắt buộc</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Trạng thái <span className="text-red-500">*</span>
                                </label>
                                <div className="space-y-3">
                                    <label className="flex items-center cursor-pointer group">
                                        <input
                                            type="radio"
                                            value="1"
                                            className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 focus:ring-green-500 focus:ring-2"
                                            {...register('status', { required: true })}
                                        />
                                        <span className="ml-3 text-sm font-medium text-gray-700 group-hover:text-green-600 transition-colors">
                                            Đang hoạt động
                                        </span>
                                    </label>
                                    <label className="flex items-center cursor-pointer group">
                                        <input
                                            type="radio"
                                            value="0"
                                            className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 focus:ring-red-500 focus:ring-2"
                                            {...register('status', { required: true })}
                                        />
                                        <span className="ml-3 text-sm font-medium text-gray-700 group-hover:text-red-600 transition-colors">
                                            Ngừng hoạt động
                                        </span>
                                    </label>
                                </div>
                                {errors.status && (
                                    <p className="mt-1 text-sm text-red-500">Trạng thái là bắt buộc</p>
                                )}
                            </div>
                            <div className="flex justify-end space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowUpdateModal(false)}
                                    className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors duration-200"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition-colors duration-200"
                                >
                                    Cập nhật
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Brand;
