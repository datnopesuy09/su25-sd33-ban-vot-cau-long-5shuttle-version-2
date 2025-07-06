import React, { useState } from 'react';
import { Trash2, Plus } from 'lucide-react';
import axios from 'axios';

const Variants = ({ filteredVariants, handleRemoveVariant, handleChange }) => {
    const uniqueColors = [...new Set(filteredVariants.map((v) => v.color))];
    
    const [imagesByColor, setImagesByColor] = useState({});

    const uploadImages = async (files) => {
        const formData = new FormData();
        files.forEach(file => {
            formData.append('images', file);
        });

        try {
            const response = await axios.post(
                'http://localhost:8080/api/upload',
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );
            return response.data.urls;
        } catch (error) {
            console.error('Error uploading images:', error);
            return [];
        }
    };

    const handleImageUpload = async (color, files) => {
        const uploadedUrls = await uploadImages(files);
        setImagesByColor(prev => ({
            ...prev,
            [color]: prev[color] ? [...prev[color], ...uploadedUrls] : uploadedUrls
        }));
    };

    return (
        <div className="w-full bg-white rounded-lg shadow-sm">
            {uniqueColors.map((color) => {
                const colorProducts = filteredVariants.filter(product => product.color === color);
                
                return (
                    <div key={color} className="mb-8">
                        <div className="bg-gray-200 px-4 py-3 rounded-t-lg flex items-center justify-between">
                            <h2 className="text-center text-gray-700 font-medium">Các sản phẩm màu {color}</h2>
                            <label
                                htmlFor={`upload-${color}`}
                                className="cursor-pointer flex items-center gap-2 bg-blue-600 text-white rounded-md px-4 py-1"
                                title={`Chọn ảnh cho màu ${color}`}
                            >
                                <Plus size={20} />
                                <span>Thêm ảnh</span>
                            </label>
                            <input
                                id={`upload-${color}`}
                                type="file"
                                multiple
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handleImageUpload(color, e.target.files)}
                            />
                        </div>
                        
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-200">
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 w-12">Chọn</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 w-14">Sản phẩm</th>
                                        <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 w-10">Số lượng</th>
                                        <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 w-10">Đơn giá</th>
                                        <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 w-48">Ảnh</th>
                                        <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 w-16"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {colorProducts.map((product) => (
                                        <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="px-4 py-3 text-sm text-gray-700">
                                                <input type="checkbox" />
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-700 max-w-xs truncate">
                                                {product.name}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <input
                                                    type="number"
                                                    value={product.quantity}
                                                    onChange={(e) => handleChange(product.id, 'quantity', e.target.value)}
                                                    className="w-16 px-2 py-1 text-sm border border-gray-300 rounded text-center focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                    min={0}
                                                />
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <input
                                                    type="number"
                                                    value={product.price}
                                                    onChange={(e) => handleChange(product.id, 'price', e.target.value)}
                                                    className="w-24 px-2 py-1 text-sm border border-gray-300 rounded text-center focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                    min={0}
                                                />
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <div className="flex flex-wrap gap-2 justify-center">
                                                    {(imagesByColor[color] || []).map((src, idx) => (
                                                        <img
                                                            key={idx}
                                                            src={src}
                                                            alt={`Ảnh màu ${color} ${idx + 1}`}
                                                            className="h-16 w-16 object-cover rounded-md border"
                                                        />
                                                    ))}
                                                    {(!imagesByColor[color] || imagesByColor[color].length === 0) && (
                                                        <span className="text-gray-400 text-sm">Chưa có ảnh</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <button
                                                    onClick={() => handleRemoveVariant(product.id)}
                                                    className="p-1 text-gray-400 hover:text-red-500"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default Variants;
