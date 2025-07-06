// ProductList.js
import React from 'react';
import { Plus, Minus, Star, Heart } from 'lucide-react';

const ProductList = ({ orderDetailDatas, handleQuantityChange, isLiked, setIsLiked }) => {

    console.log("orderdetial: ", orderDetailDatas)
    return (
        <div className="bg-gray-50 p-4">
            <div className="max-w-6xl mx-auto">
                
                {/* Product Card */}
                {orderDetailDatas.map((orderDetail) => (
                    <div
                        key={orderDetail.id}
                        className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden mb-2"
                    >
                        <div className="p-6">
                            <div className="flex items-center gap-6">
                                {/* Product Image */}
                                <div className="relative group">
                                    <div className="w-32 h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                                        <img
                                            src={orderDetail.hinhAnhUrl}
                                            alt={orderDetail.hinhAnhUrl}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <button
                                        onClick={() => setIsLiked(!isLiked)}
                                        className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-md hover:shadow-lg transition-all duration-200"
                                    >
                                        <Heart
                                            size={16}
                                            className={`${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-400'} transition-colors duration-200`}
                                        />
                                    </button>
                                </div>
                                {/* Product Info */}
                                <div className="flex-1">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="text-xl font-semibold text-gray-800 mb-1">
                                                {orderDetail.sanPhamCT.ten}
                                            </h3>
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-sm text-red-500 ">
                                                    {orderDetail.sanPhamCT.donGia.toLocaleString()} VNĐ
                                                </span>
                                                {/* sau này khi xong giảm giá cần dùng đến (Tạm thời thì chưa) */}
                                                {/* <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full font-medium">
                                                                    -11%
                                                                </span> */}
                                            </div>
                                           
                                            <p className="text-sm text-gray-600 mb-2">
                                                Màu sắc:{' '}
                                                <span className="font-medium">{orderDetail.sanPhamCT.mauSac.ten}</span>
                                            </p>
                                            <p className="text-sm text-gray-600 mb-2">
                                                Trọng lượng:{' '}
                                                <span className="font-medium">
                                                    {orderDetail.sanPhamCT.trongLuong.ten}
                                                </span>
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                                    Còn hàng
                                                </span>
                                                <span className="text-xs text-gray-500">{orderDetail.stock}</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-2xl font-bold text-red-600 mb-4">
                                                {orderDetail.giaBan.toLocaleString()} VNĐ
                                            </div>
                                            {/* Quantity Controls */}
                                            <div className="flex items-center gap-3 mb-4">
                                                <button
                                                    onClick={() => handleQuantityChange(-1, orderDetail.id)}
                                                    className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-blue-500 hover:text-blue-500 transition-colors duration-200"
                                                >
                                                    <Minus size={14} />
                                                </button>
                                                <span className="w-8 text-center font-medium text-lg">
                                                    {orderDetail.soLuong}
                                                </span>
                                                <button
                                                    onClick={() => handleQuantityChange(1, orderDetail.id)}
                                                    className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-blue-500 hover:text-blue-500 transition-colors duration-200"
                                                >
                                                    <Plus size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
                {/* Additional Product Cards */}
            </div>
        </div>
    );
};

export default ProductList;
