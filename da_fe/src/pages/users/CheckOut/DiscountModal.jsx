import React from 'react';
import { X, Tag } from 'lucide-react';
import swal from 'sweetalert';

const DiscountModal = ({ showModal, setShowModal, discounts, selectedDiscount, handleSelectDiscount, handleDeselectDiscount, totalPrice }) => {
    if (!showModal) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-opacity-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden transform transition-all">
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 relative">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Tag className="w-6 h-6" />
                        Chọn phiếu giảm giá
                    </h2>
                    <button
                        onClick={() => setShowModal(false)}
                        className="absolute top-4 right-4 text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="max-h-96 overflow-y-auto px-6 py-4">
                    <div className="space-y-3">
                        {discounts.map((discount) => (
                            <div
                                key={discount.id}
                                className={`border rounded-xl p-4 transition-all duration-200 cursor-pointer group relative ${
                                    selectedDiscount?.id === discount.id
                                        ? 'border-indigo-500 bg-indigo-50'
                                        : 'border-gray-200 hover:border-indigo-300 hover:shadow-md'
                                }`}
                            >
                                {/* Nút X để bỏ chọn */}
                                {selectedDiscount?.id === discount.id && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeselectDiscount();
                                        }}
                                        className="absolute top-2 right-2 text-gray-500 hover:text-red-500 transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}

                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-2 py-1 rounded-lg text-xs font-medium">
                                                <Tag className="w-3 h-3 inline mr-1" />
                                                VOUCHER
                                            </div>
                                        </div>

                                        <h3 className="font-semibold text-gray-800 mb-1 group-hover:text-indigo-600 transition-colors">
                                            {discount.ten}
                                        </h3>

                                        <div className="flex items-center gap-1 mb-2">
                                            <span className="text-2xl font-bold text-red-500">
                                                {discount.giaTri.toLocaleString('vi-VN')}%
                                            </span>
                                            <span className="text-sm text-gray-500">giảm</span>
                                        </div>

                                        {discount.moTa && (
                                            <p className="text-sm text-gray-600 mb-2">{discount.moTa}</p>
                                        )}

                                        <div className="flex items-center gap-4 text-xs text-gray-500">
                                            {discount.dieuKien && <span>• {discount.dieuKien}</span>}
                                            {discount.hanSuDung && <span>• HSD: {discount.hanSuDung}</span>}
                                        </div>

                                        <div className="text-xs text-gray-500 mt-2">
                                            <span>
                                                Ngày bắt đầu:{' '}
                                                {new Date(discount.ngayBatDau).toLocaleDateString('vi-VN')}
                                            </span>
                                            <span>
                                                {' '}
                                                • Ngày kết thúc:{' '}
                                                {new Date(discount.ngayKetThuc).toLocaleDateString('vi-VN')}
                                            </span>
                                        </div>

                                        {/* Hiển thị giá trị tối đa và điều kiện tối thiểu */}
                                        <div className="mt-2 text-xs text-gray-600">
                                            <span>• Giá trị tối đa: {discount.giaTriMax.toLocaleString('vi-VN')} VNĐ</span>
                                            <span> • Điều kiện tối thiểu: {discount.dieuKienNhoNhat.toLocaleString('vi-VN')} VNĐ</span>
                                        </div>
                                    </div>

                                    {selectedDiscount?.id !== discount.id && (
                                        <button
                                            onClick={() => {
                                                // Kiểm tra điều kiện tối thiểu
                                                if (totalPrice < discount.dieuKienNhoNhat) {
                                                    swal('Lỗi', `Đơn hàng phải có tổng giá trị từ ${discount.dieuKienNhoNhat.toLocaleString()} VNĐ`, 'error');
                                                    return;
                                                }

                                                // Tính toán giảm giá và kiểm tra giá trị tối đa
                                                let discountAmount = (totalPrice * discount.giaTri) / 100;
                                                if (discountAmount > discount.giaTriMax) {
                                                    discountAmount = discount.giaTriMax;
                                                    swal('Thông báo', `Giảm giá tối đa là ${discount.giaTriMax.toLocaleString()} VNĐ`, 'info');
                                                }

                                                handleSelectDiscount(discount);
                                            }}
                                            className="ml-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:shadow-lg hover:scale-105 transition-all duration-200"
                                        >
                                            Chọn
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 border-t">
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">{discounts.length} phiếu có sẵn</span>
                        <button
                            onClick={() => setShowModal(false)}
                            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
                        >
                            Đóng
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DiscountModal;
