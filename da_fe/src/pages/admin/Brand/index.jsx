import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import AddIcon from '@mui/icons-material/Add';
import TrashIcon from '@heroicons/react/24/outline/TrashIcon';
import PencilIcon from '@heroicons/react/24/outline/PencilIcon';
import { useForm } from 'react-hook-form';
import swal from 'sweetalert';

function Brand() {
    const [brands, setBrands] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [brandToDelete, setBrandToDelete] = useState(null);
    const [brandToUpdate, setBrandToUpdate] = useState(null);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const brandsPerPage = 4;

    const {
        register,
        handleSubmit,
        setValue,
        reset,
        formState: { errors },
    } = useForm();

    const loadBrands = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/thuong-hieu');
            setBrands(response.data);
        } catch (error) {
            console.error('Failed to fetch brands', error);
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
        } catch (error) {
            console.error('Failed to delete brand', error);
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
            swal('Thành công!', 'Thương hiệu đã được thêm!', 'success');
            setShowAddModal(false);
            loadBrands();
            reset(); // Reset form values after adding
        } catch (error) {
            console.error('Có lỗi xảy ra khi thêm thương hiệu!', error);
            swal('Thất bại!', 'Có lỗi xảy ra khi thêm thương hiệu!', 'error');
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
            swal('Thành công!', 'Thương hiệu đã được cập nhật!', 'success');
            setShowUpdateModal(false);
            loadBrands();
            reset(); // Reset form values after updating
        } catch (error) {
            console.error('Có lỗi xảy ra khi cập nhật thương hiệu!', error);
            swal('Thất bại!', 'Có lỗi xảy ra khi cập nhật thương hiệu!', 'error');
        }
    };

    // Get current brands based on pagination
    const indexOfLastBrand = currentPage * brandsPerPage;
    const indexOfFirstBrand = indexOfLastBrand - brandsPerPage;
    const currentBrands = brands.slice(indexOfFirstBrand, indexOfLastBrand);

    // Calculate total pages
    const totalPages = Math.ceil(brands.length / brandsPerPage);

    // Pagination controls
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <div className="p-2 max-w-7xl mx-auto bg-white rounded-lg">
            <h4 className="text-center text-5xl font-bold text-gray-800">Danh sách thương hiệu</h4>
            <div>
                <div className="flex justify-end mb-4">
                    <button
                        onClick={handleAddModal}
                        className="border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white font-medium py-2 px-4 rounded"
                    >
                        <AddIcon />
                    </button>
                </div>
                <table className="w-full table-auto bg-white rounded-lg shadow-md">
                    <thead>
                        <tr className="bg-gray-200 text-gray-700">
                            <th className="py-4 px-6 text-left">STT</th>
                            <th className="py-4 px-6 text-left">ID</th>
                            <th className="py-4 px-6 text-left">Tên</th>
                            <th className="py-4 px-6 text-left">Trạng thái</th>
                            <th className="py-4 px-6 text-left">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentBrands.map((brand, index) => (
                            <tr key={brand.id} className="border-t border-gray-200 hover:bg-gray-100">
                                <td className="py-4 px-6">{indexOfFirstBrand + index + 1}</td>
                                <td className="py-4 px-6">{brand.id}</td>
                                <td className="py-4 px-6">{brand.ten}</td>
                                <td className="py-4 px-6">
                                    <span
                                        className={`px-2 py-1 rounded-full text-xs font-semibold
                        ${
                            brand.trangThai
                                ? 'text-green-600 bg-green-100 border border-green-600'
                                : 'text-red-600 bg-red-100 border border-red-600'
                        }`}
                                    >
                                        {brand.trangThai ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="py-4 px-6">
                                    <div className="flex">
                                        <button
                                            onClick={() => handleUpdateModal(brand)}
                                            className="hover:bg-gray-400 font-medium py-2 px-4 rounded"
                                        >
                                            <PencilIcon className="h-5 w-5" />
                                        </button>
                                        <button
                                            onClick={() => confirmDelete(brand.id)}
                                            className="hover:bg-gray-400 font-medium py-2 px-4 rounded"
                                        >
                                            <TrashIcon className="w-5" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Modal for delete confirmation */}
                {showModal && (
                    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-50">
                        <div className="bg-white rounded-lg shadow-lg p-6">
                            <h3 className="text-lg font-bold mb-4">Xác nhận xóa</h3>
                            <p>Bạn có chắc chắn muốn xóa thương hiệu này không?</p>
                            <div className="mt-4 flex justify-end space-x-2">
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="bg-gray-300 hover:bg-gray-400 text-black py-2 px-4 rounded-lg"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={() => handleDelete(brandToDelete)}
                                    className="bg-red-400 hover:bg-red-600 text-white py-2 px-4 rounded-lg"
                                >
                                    Xóa
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal for adding a brand */}
                {showAddModal && (
                    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-50">
                        <div className="bg-white rounded-lg shadow-lg p-6">
                            <h3 className="text-lg font-bold mb-4">Thêm thương hiệu</h3>
                            <form onSubmit={handleSubmit(handleAddBrand)}>
                                <div className="mb-4">
                                    <label className="block text-gray-700">Tên thương hiệu</label>
                                    <input
                                        type="text"
                                        className={`border border-gray-300 p-2 w-full rounded-lg ${
                                            errors.brandName ? 'border-red-500' : ''
                                        }`}
                                        {...register('brandName', { required: true })}
                                    />
                                    {errors.brandName && (
                                        <span className="text-red-500">Tên thương hiệu là bắt buộc.</span>
                                    )}
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-700">Trạng thái</label>
                                    <div className="flex space-x-4">
                                        <label className="flex items-center">
                                            <input
                                                type="radio"
                                                value="1"
                                                className="form-radio"
                                                {...register('status', { required: true })}
                                            />
                                            <span className="ml-2">Active</span>
                                        </label>
                                        <label className="flex items-center">
                                            <input
                                                type="radio"
                                                value="0"
                                                className="form-radio"
                                                {...register('status', { required: true })}
                                            />
                                            <span className="ml-2">Inactive</span>
                                        </label>
                                    </div>
                                    {errors.status && <span className="text-red-500">Trạng thái là bắt buộc.</span>}
                                </div>
                                <div className="mt-4 flex justify-end space-x-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowAddModal(false)}
                                        className="bg-gray-300 hover:bg-gray-400 text-black py-2 px-4 rounded-lg"
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        type="submit"
                                        className="bg-green-500 hover:bg-green-700 text-white py-2 px-4 rounded-lg"
                                    >
                                        Thêm
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Modal for updating a brand */}
                {showUpdateModal && (
                    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-50">
                        <div className="bg-white rounded-lg shadow-lg p-6">
                            <h3 className="text-lg font-bold mb-4">Cập nhật thương hiệu</h3>
                            <form onSubmit={handleSubmit(handleUpdateBrand)}>
                                <div className="mb-4">
                                    <label className="block text-gray-700">Tên thương hiệu</label>
                                    <input
                                        type="text"
                                        className={`border border-gray-300 p-2 w-full rounded-lg ${
                                            errors.brandName ? 'border-red-500' : ''
                                        }`}
                                        {...register('brandName', { required: true })}
                                    />
                                    {errors.brandName && (
                                        <span className="text-red-500">Tên thương hiệu là bắt buộc.</span>
                                    )}
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-700">Trạng thái</label>
                                    <div className="flex space-x-4">
                                        <label className="flex items-center">
                                            <input
                                                type="radio"
                                                value="1"
                                                className="form-radio"
                                                {...register('status', { required: true })}
                                            />
                                            <span className="ml-2">Active</span>
                                        </label>
                                        <label className="flex items-center">
                                            <input
                                                type="radio"
                                                value="0"
                                                className="form-radio"
                                                {...register('status', { required: true })}
                                            />
                                            <span className="ml-2">Inactive</span>
                                        </label>
                                    </div>
                                    {errors.status && <span className="text-red-500">Trạng thái là bắt buộc.</span>}
                                </div>
                                <div className="mt-4 flex justify-end space-x-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowUpdateModal(false)}
                                        className="bg-gray-300 hover:bg-gray-400 text-black py-2 px-4 rounded-lg"
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        type="submit"
                                        className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded-lg"
                                    >
                                        Cập nhật
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>

            {/* Pagination controls */}
            <div className="flex justify-center mt-4">
                <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="border border-gray-400 rounded-l-lg p-2 hover:bg-gray-200"
                >
                    <SkipPreviousIcon />
                </button>
                {Array.from({ length: totalPages }).map((_, index) => (
                    <button
                        key={index}
                        onClick={() => paginate(index + 1)}
                        className={`border-t border-b border-gray-400 px-4 py-2 ${
                            index + 1 === currentPage ? 'bg-gray-200' : ''
                        }`}
                    >
                        {index + 1}
                    </button>
                ))}
                <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="border border-gray-400 rounded-r-lg p-2 hover:bg-gray-200"
                >
                    <SkipNextIcon />
                </button>
            </div>
        </div>
    );
}

export default Brand;
