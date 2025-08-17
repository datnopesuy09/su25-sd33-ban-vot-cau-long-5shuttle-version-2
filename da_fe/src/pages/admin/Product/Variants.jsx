import React, { useState } from 'react';
import { Trash2, Upload, X, Eye, Edit3, Save, Package, Image as ImageIcon, DollarSign, Hash } from 'lucide-react';
import axios from 'axios';

const Variants = ({ variants, handleRemoveVariant, handleChange, imagesByColor, setImagesByColor }) => {
    const [previewImage, setPreviewImage] = useState(null);
    const [uploadingColor, setUploadingColor] = useState(null);
    const [draggedOver, setDraggedOver] = useState(null);

    const uniqueColors = [...new Set(variants.map((v) => v.color))];

    const uploadImages = async (files) => {
        if (!files || files.length === 0) {
            alert('Vui lòng chọn ít nhất một hình ảnh');
            return [];
        }
        const formData = new FormData();
        files.forEach((file) => {
            formData.append('images', file);
        });

        try {
            const response = await axios.post('http://localhost:8080/api/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data.urls;
        } catch (error) {
            console.error('Error uploading images:', error);
            alert(`Lỗi khi tải ảnh: ${error.response?.data?.message || error.message}`);
            return [];
        }
    };

    const handleImageUpload = async (color, files) => {
        if (!files || files.length === 0) return;

        setUploadingColor(color);
        try {
            const uploadedUrls = await uploadImages(Array.from(files));
            setImagesByColor((prev) => ({
                ...prev,
                [color]: prev[color] ? [...prev[color], ...uploadedUrls] : uploadedUrls,
            }));
        } finally {
            setUploadingColor(null);
        }
    };

    const handleDragOver = (e, color) => {
        e.preventDefault();
        setDraggedOver(color);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setDraggedOver(null);
    };

    const handleDrop = (e, color) => {
        e.preventDefault();
        setDraggedOver(null);
        const files = e.dataTransfer.files;
        handleImageUpload(color, files);
    };

    const removeImage = (color, imageIndex) => {
        setImagesByColor((prev) => ({
            ...prev,
            [color]: prev[color].filter((_, index) => index !== imageIndex),
        }));
    };

    const getColorStyle = (color) => {
        const colorMap = {
            Đỏ: 'bg-red-100 border-red-300 text-red-800',
            Xanh: 'bg-blue-100 border-blue-300 text-blue-800',
            Vàng: 'bg-yellow-100 border-yellow-300 text-yellow-800',
            'Xanh lá': 'bg-green-100 border-green-300 text-green-800',
            Đen: 'bg-gray-100 border-gray-300 text-gray-800',
            Trắng: 'bg-gray-50 border-gray-300 text-gray-800',
        };
        return colorMap[color] || 'bg-gray-100 border-gray-300 text-gray-800';
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(price);
    };

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Package className="w-6 h-6" />
                        Quản lý biến thể sản phẩm
                    </h2>
                    <p className="text-blue-100 mt-1">
                        Tổng cộng {variants.length} biến thể trong {uniqueColors.length} màu
                    </p>
                </div>

                <div className="p-6">
                    {uniqueColors.map((color) => {
                        const colorVariants = variants.filter((variant) => variant.color === color);
                        const totalQuantity = colorVariants.reduce((sum, v) => sum + (v.quantity || 0), 0);
                        const avgPrice =
                            colorVariants.reduce((sum, v) => sum + (v.price || 0), 0) / colorVariants.length;

                        return (
                            <div key={color} className="mb-8 last:mb-0">
                                <div className={`rounded-lg border-2 ${getColorStyle(color)} mb-4`}>
                                    <div className="p-4">
                                        <div className="flex flex-wrap items-center justify-between gap-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-full ${getColorStyle(color)}`}></div>

                                                <div>
                                                    <h3 className="font-bold text-lg">Màu {color}</h3>
                                                    <p className="text-sm opacity-75">
                                                        {colorVariants.length} biến thể • {totalQuantity} sản phẩm • Giá
                                                        TB: {formatPrice(avgPrice || 0)}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <div
                                                    className={`relative border-2 border-dashed rounded-lg p-4 transition-all duration-200 ${
                                                        draggedOver === color
                                                            ? 'border-blue-500 bg-blue-50'
                                                            : 'border-gray-300 hover:border-gray-400'
                                                    } ${uploadingColor === color ? 'opacity-50' : ''}`}
                                                    onDragOver={(e) => handleDragOver(e, color)}
                                                    onDragLeave={handleDragLeave}
                                                    onDrop={(e) => handleDrop(e, color)}
                                                >
                                                    <label
                                                        htmlFor={`upload-${color}`}
                                                        className="cursor-pointer flex items-center gap-2 text-gray-600 hover:text-gray-800"
                                                    >
                                                        <Upload className="w-5 h-5" />
                                                        <span className="text-sm font-medium">
                                                            {uploadingColor === color ? 'Đang tải...' : 'Thêm ảnh'}
                                                        </span>
                                                    </label>
                                                    <input
                                                        id={`upload-${color}`}
                                                        type="file"
                                                        multiple
                                                        accept="image/*"
                                                        className="hidden"
                                                        onChange={(e) => handleImageUpload(color, e.target.files)}
                                                        disabled={uploadingColor === color}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {imagesByColor[color] && imagesByColor[color].length > 0 && (
                                            <div className="mt-4 flex flex-wrap gap-2">
                                                {imagesByColor[color].map((src, idx) => {
                                                    console.log('Ảnh nhỏ:', src);
                                                    return (
                                                        <div
                                                            key={idx}
                                                            className="relative group cursor-pointer"
                                                            onClick={() => {
                                                                console.log('Preview ảnh:', src);
                                                                setPreviewImage(src);
                                                            }}
                                                        >
                                                            <div
                                                                style={{ width: '80px', height: '80px' }}
                                                                className="border border-gray-300 border-dashed rounded-md"
                                                            >
                                                                <img
                                                                    src={src}
                                                                    alt={`${color} ${idx + 1}`}
                                                                    crossOrigin="anonymous"
                                                                    onError={(e) => {
                                                                        e.target.src =
                                                                            'https://via.placeholder.com/80x80?text=Lỗi';
                                                                    }}
                                                                    className="w-full h-full object-contain rounded-md transition-opacity duration-200 group-hover:opacity-60"
                                                                />
                                                            </div>

                                                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                                <Eye className="w-5 h-5 text-gray opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                                                            </div>

                                                            <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.stopPropagation(); // Ngăn không cho click nút X bị lan sang ảnh
                                                                    removeImage(color, idx);
                                                                }}
                                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                                            >
                                                                <X className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {colorVariants.map((variant) => (
                                        <div
                                            key={variant.id}
                                            className="bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow duration-200"
                                        >
                                            <div className="p-4">
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="flex-1">
                                                        <h4 className="font-medium text-gray-900 text-sm leading-tight">
                                                            {variant.name}
                                                        </h4>
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            Trọng lượng: {variant.weight}
                                                        </p>
                                                    </div>
                                                    <button
                                                        type="button" // Đảm bảo không submit form
                                                        onClick={() => handleRemoveVariant(variant.id)}
                                                        className="text-gray-400 hover:text-red-500 transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>

                                                <div className="space-y-3">
                                                    <div className="flex items-center gap-2">
                                                        <Hash className="w-4 h-4 text-gray-400" />
                                                        <div className="flex-1">
                                                            <label className="block text-xs text-gray-500 mb-1">
                                                                Số lượng
                                                            </label>
                                                            <input
                                                                type="number"
                                                                value={variant.quantity || 0}
                                                                onChange={(e) =>
                                                                    handleChange(variant.id, 'quantity', e.target.value)
                                                                }
                                                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                                min="0"
                                                                placeholder="0"
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <DollarSign className="w-4 h-4 text-gray-400" />
                                                        <div className="flex-1">
                                                            <label className="block text-xs text-gray-500 mb-1">
                                                                Đơn giá (VND)
                                                            </label>
                                                            <input
                                                                type="number"
                                                                value={variant.price || 0}
                                                                onChange={(e) =>
                                                                    handleChange(variant.id, 'price', e.target.value)
                                                                }
                                                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                                min="0"
                                                                placeholder="0"
                                                            />
                                                        </div>
                                                    </div>

                                                    {variant.quantity > 0 && variant.price > 0 && (
                                                        <div className="pt-2 border-t border-gray-100">
                                                            <p className="text-xs text-gray-500">
                                                                Tổng giá trị:{' '}
                                                                {formatPrice(
                                                                    (variant.quantity || 0) * (variant.price || 0),
                                                                )}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {previewImage && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                    <div className="relative max-w-4xl max-h-full">
                        <img
                            src={previewImage}
                            alt="Preview"
                            className="max-w-full max-h-full object-contain rounded-lg"
                            style={{ backgroundColor: '#fff' }}
                        />

                        <button
                            type="button" // Đảm bảo không submit form
                            onClick={() => setPreviewImage(null)}
                            className="absolute top-4 right-4 bg-black bg-opacity-20 hover:bg-opacity-30 text-white rounded-full p-2 transition-all"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            )}

            {variants.length === 0 && (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có biến thể nào</h3>
                    <p className="text-gray-500">Hãy chọn màu sắc và trọng lượng để tạo biến thể sản phẩm</p>
                </div>
            )}
        </div>
    );
};

export default Variants;
