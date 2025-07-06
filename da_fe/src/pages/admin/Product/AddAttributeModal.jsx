import React, { useState, useEffect } from 'react';
import axios from 'axios';
import swal from 'sweetalert'; // Đảm bảo bạn đã cài đặt sweetalert

const AddAttributeModal = ({ isOpen, onClose, onAdd, attributeName }) => {
    const [name, setName] = useState('');
    const [status, setStatus] = useState('Active');
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});

    // Reset form when modal opens
    useEffect(() => {
        if (isOpen) {
            setName('');
            setStatus('Active');
            setErrors({});
        }
    }, [isOpen]);

    const validateForm = () => {
        const newErrors = {};
        
        if (!name.trim()) {
            newErrors.name = `Tên ${attributeName.toLowerCase()} không được để trống`;
        } else if (name.trim().length < 2) {
            newErrors.name = `Tên ${attributeName.toLowerCase()} phải có ít nhất 2 ký tự`;
        } else if (name.trim().length > 100) {
            newErrors.name = `Tên ${attributeName.toLowerCase()} không được vượt quá 100 ký tự`;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setIsLoading(true);
        
        try {
            // Tạo đối tượng mới dựa trên loại thuộc tính
            const newAttribute = {
                ten: name.trim(),
                trangThai: status === 'Active' ? 1 : 0,
            };

            let apiUrl = '';
            switch (attributeName) {
                case 'Thương hiệu':
                    apiUrl = 'http://localhost:8080/api/thuong-hieu';
                    break;
                case 'Chất liệu':
                    apiUrl = 'http://localhost:8080/api/chat-lieu';
                    break;
                case 'Điểm cân bằng':
                    apiUrl = 'http://localhost:8080/api/diem-can-bang';
                    break;
                case 'Độ cứng':
                    apiUrl = 'http://localhost:8080/api/do-cung';
                    break;
                    case 'Màu sắc':
                    apiUrl = 'http://localhost:8080/api/mau-sac';
                    break;
                    case 'Trọng lượng':
                    apiUrl = 'http://localhost:8080/api/trong-luong';
                    break;
                default:
                    throw new Error('Loại thuộc tính không hợp lệ');
            }

            // Gọi API để thêm thuộc tính
            await axios.post(apiUrl, newAttribute);
            swal('Thành công!', `${attributeName} đã được thêm!`, 'success');
            onAdd(newAttribute); // Gọi hàm onAdd để cập nhật danh sách
            onClose();
        } catch (error) {
            console.error(`Có lỗi xảy ra khi thêm ${attributeName.toLowerCase()}!`, error);
            swal('Thất bại!', `Có lỗi xảy ra khi thêm ${attributeName.toLowerCase()}!`, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        if (!isLoading) {
            onClose();
        }
    };

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget && !isLoading) {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-opacity-30 backdrop-blur-sm" onClick={handleBackdropClick}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 transform transition-all duration-300 scale-100">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-t-2xl px-6 py-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-white flex items-center">
                            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                            </svg>
                            Thêm {attributeName}
                        </h2>
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={isLoading}
                            className="text-white hover:text-gray-200 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Name Input */}
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-800" htmlFor="name">
                                <span className="text-red-500 mr-1">*</span>
                                Tên {attributeName}
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    id="name"
                                    value={name}
                                    onChange={(e) => {
                                        setName(e.target.value);
                                        if (errors.name) {
                                            setErrors(prev => ({ ...prev, name: null }));
                                        }
                                    }}
                                    placeholder={`Nhập tên ${attributeName.toLowerCase()}...`}
                                    className={`w-full h-12 px-4 pr-10 border-2 rounded-lg transition-all duration-200 text-gray-700 bg-white ${
                                        errors.name 
                                            ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
                                            : 'border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 hover:border-gray-300'
                                    }`}
                                    disabled={isLoading}
                                    required
                                />
                                {name && (
                                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                        <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                                        </svg>
                                    </div>
                                )}
                            </div>
                            {errors.name && (
                                <p className="text-sm text-red-600 flex items-center mt-1">
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                    </svg>
                                    {errors.name}
                                </p>
                            )}
                            <div className="text-xs text-gray-500 mt-1">
                                {name.length}/100 ký tự
                            </div>
                        </div>

                        {/* Status Select */}
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-800" htmlFor="status">
                                <span className="text-red-500 mr-1">*</span>
                                Trạng thái
                            </label>
                            <div className="relative">
                                <select
                                    id="status"
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    className="w-full h-12 px-4 pr-10 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 text-gray-700 bg-white hover:border-gray-300 appearance-none"
                                    disabled={isLoading}
                                >
                                    <option value="Active" className="text-green-600">
                                        ✓ Active - Đang hoạt động
                                    </option>
                                    <option value="Inactive" className="text-red-600">
                                        ✗ Inactive - Ngưng hoạt động
                                    </option>
                                </select>
                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Error Message */}
                        {errors.submit && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                <p className="text-sm text-red-700 flex items-center">
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                    </svg>
                                    {errors.submit}
                                </p>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex justify-end space-x-3 pt-4">
                            <button 
                                type="button" 
                                onClick={handleClose}
                                disabled={isLoading}
                                className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                                </svg>
                                Hủy
                            </button>
                            <button 
                                type="submit"
                                disabled={isLoading || !name.trim()}
                                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg hover:from-blue-700 hover:to-indigo-800 transition-all duration-200 font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center min-w-[100px] justify-center"
                            >
                                {isLoading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Đang thêm...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                                        </svg>
                                        Thêm {attributeName}
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddAttributeModal;
