import React, { useState, useEffect } from 'react';
import { Plus, Minus, Star, Heart, RotateCcw, Trash2 } from 'lucide-react';
import axios from 'axios';
import swal from 'sweetalert';

const ProductList = ({
    orderDetailDatas,
    handleOpenProductModal,
    handleQuantityChange,
    handleDeleteProduct,
    isLiked,
    setIsLiked,
    isOrderInTransit,
    hoaDonId,
    setReturnHistory,
    currentOrderStatus,
    showAddButton = true,
}) => {
    const [showReturnModal, setShowReturnModal] = useState(false);
    const [selectedOrderDetail, setSelectedOrderDetail] = useState(null);
    const [returnQuantity, setReturnQuantity] = useState(1);
    const [returnNote, setReturnNote] = useState('');
    const [returnHistory, setLocalReturnHistory] = useState([]);

    useEffect(() => {
        if (hoaDonId) {
            const fetchReturnHistory = async () => {
                try {
                    const response = await axios.get(`http://localhost:8080/api/tra-hang/hoa-don/${hoaDonId}`);
                    setLocalReturnHistory(response.data);
                    setReturnHistory(response.data);
                } catch (error) {
                    console.error('Lỗi khi lấy danh sách trả hàng:', error);
                    swal('Lỗi!', 'Không thể lấy danh sách trả hàng', 'error');
                }
            };
            fetchReturnHistory();
        }
    }, [hoaDonId, setReturnHistory]);

    const handleOpenReturnModal = (orderDetail) => {
        setSelectedOrderDetail(orderDetail);
        setReturnQuantity(1);
        setReturnNote('');
        setShowReturnModal(true);
    };

    const handleCloseReturnModal = () => {
        setShowReturnModal(false);
        setSelectedOrderDetail(null);
        setReturnQuantity(1);
        setReturnNote('');
    };

    const handleConfirmReturn = async () => {
        if (!selectedOrderDetail) return;

        if (returnQuantity <= 0 || returnQuantity > selectedOrderDetail.soLuong) {
            swal('Lỗi!', 'Số lượng trả hàng không hợp lệ!', 'error');
            return;
        }

        const isConfirmed = await swal({
            title: 'Xác nhận trả hàng',
            text: `Bạn có chắc chắn muốn trả ${returnQuantity} sản phẩm ${selectedOrderDetail.sanPhamCT.ten}?`,
            icon: 'warning',
            buttons: ['Hủy', 'Xác nhận'],
            dangerMode: true,
        });

        if (isConfirmed) {
            try {
                const response = await axios.post('http://localhost:8080/api/hoa-don-ct/return', {
                    hoaDonCTId: selectedOrderDetail.id,
                    soLuong: returnQuantity,
                    lyDo: returnNote,
                });

                if (response.status === 200) {
                    swal('Thành công!', 'Yêu cầu trả hàng đã được gửi!', 'success');
                    const fetchResponse = await axios.get(`http://localhost:8080/api/tra-hang/hoa-don/${hoaDonId}`);
                    setLocalReturnHistory(fetchResponse.data);
                    setReturnHistory(fetchResponse.data);
                    handleCloseReturnModal();
                }
            } catch (error) {
                console.error('Lỗi khi gửi yêu cầu trả hàng:', error);
                swal('Lỗi!', error.response?.data?.message || 'Không thể gửi yêu cầu trả hàng', 'error');
            }
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(amount);
    };

    // Resolve possible price fields and return original and discounted prices
    const resolvePrices = (item) => {
        // Ưu tiên sử dụng giá bán đã lưu trong hóa đơn chi tiết (giá tại thời điểm mua)
        const qty = Number(item.soLuong) || 1;

        // Giá đã lưu trong hóa đơn (giá tại thời điểm mua hàng)
        if (item.giaBan !== undefined && item.giaBan !== null) {
            const savedTotalPrice = Number(item.giaBan);
            const unitPrice = savedTotalPrice / qty;

            // Lấy giá gốc từ sản phẩm để tính phần trăm giảm giá
            const originalPrice = item.sanPhamCT?.donGia ?? item.sanPhamCT?.sanPham?.donGia ?? unitPrice;

            return {
                originalPrice: Number(originalPrice),
                discountedPrice: unitPrice,
                unitPrice: unitPrice,
            };
        }

        // Fallback: nếu không có giá lưu, sử dụng giá gốc từ sản phẩm
        const originalPrice = item.sanPhamCT?.donGia ?? item.sanPhamCT?.sanPham?.donGia ?? 0;

        return {
            originalPrice: Number(originalPrice),
            discountedPrice: Number(originalPrice),
            unitPrice: Number(originalPrice),
        };
    };

    const canReturn = [4, 5].includes(currentOrderStatus);

    const isOrderOnHold = currentOrderStatus === 10; // 10 = Có sự cố - Tạm dừng vận chuyển (frontend)

    const getReturnStatusLabel = (trangThai) => {
        switch (trangThai) {
            case 0:
                return { label: 'Chờ duyệt', color: 'bg-yellow-200 text-yellow-800' };
            case 1:
                return { label: 'Đã duyệt', color: 'bg-green-200 text-green-800' };
            case 2:
                return { label: 'Từ chối', color: 'bg-red-200 text-red-800' };
            default:
                return { label: 'Không xác định', color: 'bg-gray-200 text-gray-800' };
        }
    };

    console.log('trả hàng: ', returnHistory);
    console.log('hàng: ', orderDetailDatas);
    if (isOrderOnHold) {
        console.log('Order is on-hold due to incident, locking product actions');
    }

    return (
        <div className="bg-gray-50 p-6">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-800">Danh sách sản phẩm</h1>
                    {showAddButton && (
                        <button
                            onClick={handleOpenProductModal}
                            disabled={currentOrderStatus >= 3 || isOrderOnHold}
                            className={`bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2 ${currentOrderStatus >= 3 || isOrderOnHold ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <Plus size={18} />
                            Thêm sản phẩm
                        </button>
                    )}
                </div>

                {isOrderOnHold && (
                    <div className="mb-4 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                        <div className="text-sm text-yellow-800 font-medium">
                            Đơn hàng đang tạm dừng do có sự cố vận chuyển.
                        </div>
                        <div className="text-xs text-yellow-700">
                            Vui lòng xử lý sự cố trong mục Quản lý sự cố vận chuyển trước khi thực hiện thao tác trên
                            đơn hàng.
                        </div>
                    </div>
                )}

                {orderDetailDatas.length === 0 ? (
                    <p className="text-center text-gray-500">Không có sản phẩm trong đơn hàng.</p>
                ) : (
                    orderDetailDatas.map((orderDetail) => (
                        <div
                            key={orderDetail.id}
                            className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden mb-4"
                        >
                            <div className="p-6 flex items-center gap-6">
                                <div className="relative group">
                                    <div className="w-32 h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                                        <img
                                            src={orderDetail.hinhAnhUrl || 'https://via.placeholder.com/128'}
                                            alt={orderDetail.sanPhamCT.ten}
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

                                <div className="flex-1 flex items-start justify-between">
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                            {orderDetail.sanPhamCT.ten}
                                        </h3>
                                        <div className="flex items-center gap-2 mb-2">
                                            {(() => {
                                                const { originalPrice, discountedPrice } = resolvePrices(orderDetail);
                                                const discountPercent =
                                                    originalPrice > 0 && originalPrice > discountedPrice
                                                        ? Math.round(
                                                              ((originalPrice - discountedPrice) / originalPrice) * 100,
                                                          )
                                                        : 0;

                                                return (
                                                    <div className="flex flex-col gap-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm text-red-500 font-medium">
                                                                Đơn giá: {formatCurrency(discountedPrice)}
                                                            </span>
                                                            {discountPercent > 0 && (
                                                                <span className="text-xs font-semibold text-white bg-red-500 px-2 py-0.5 rounded">
                                                                    -{discountPercent}%
                                                                </span>
                                                            )}
                                                        </div>
                                                        {discountPercent > 0 && (
                                                            <div className="text-xs text-gray-500 line-through">
                                                                Giá gốc: {formatCurrency(originalPrice)}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                        <div className="flex items-center gap-1 mb-3">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    size={14}
                                                    className={`${i < 4 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                                                />
                                            ))}
                                            <span className="text-sm text-gray-500 ml-1">(4.0)</span>
                                        </div>
                                        <p className="text-sm text-gray-600 mb-2">
                                            Màu sắc:{' '}
                                            <span className="font-medium">
                                                {orderDetail.sanPhamCT.mauSac?.ten || 'N/A'}
                                            </span>
                                        </p>
                                        <p className="text-sm text-gray-600 mb-2">
                                            Trọng lượng:{' '}
                                            <span className="font-medium">
                                                {orderDetail.sanPhamCT.trongLuong?.ten || 'N/A'}
                                            </span>
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                                {orderDetail.sanPhamCT.soLuong > 0 ? 'Còn hàng' : 'Hết hàng'}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                Tồn kho: {orderDetail.sanPhamCT.soLuong}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <div className="mb-4">
                                            {(() => {
                                                const { originalPrice, discountedPrice } = resolvePrices(orderDetail);
                                                const discountPercent =
                                                    originalPrice > 0 && originalPrice > discountedPrice
                                                        ? Math.round(
                                                              ((originalPrice - discountedPrice) / originalPrice) * 100,
                                                          )
                                                        : 0;
                                                const totalPrice = discountedPrice * orderDetail.soLuong;
                                                const originalTotal = originalPrice * orderDetail.soLuong;

                                                return (
                                                    <div>
                                                        <div className="text-2xl font-bold text-red-600 mb-1">
                                                            {formatCurrency(totalPrice)}
                                                        </div>
                                                        {discountPercent > 0 && (
                                                            <div className="text-sm text-gray-500 line-through">
                                                                {formatCurrency(originalTotal)}
                                                            </div>
                                                        )}
                                                        <div className="text-xs text-gray-600 mt-1">
                                                            ({orderDetail.soLuong} x {formatCurrency(discountedPrice)})
                                                        </div>
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                        <div className="flex items-center gap-3 mb-4">
                                            <button
                                                onClick={() => handleQuantityChange(-1, orderDetail.id)}
                                                disabled={
                                                    currentOrderStatus >= 3 || orderDetail.soLuong <= 1 || isOrderOnHold
                                                }
                                                className={`w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-blue-500 hover:text-blue-500 transition-colors duration-200 ${currentOrderStatus >= 3 || orderDetail.soLuong <= 1 || isOrderOnHold ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            >
                                                <Minus size={14} />
                                            </button>
                                            <span className="w-8 text-center font-medium text-lg">
                                                {orderDetail.soLuong}
                                            </span>
                                            <button
                                                onClick={() => handleQuantityChange(1, orderDetail.id)}
                                                disabled={
                                                    currentOrderStatus >= 3 ||
                                                    orderDetail.sanPhamCT.soLuong <= 0 ||
                                                    isOrderOnHold
                                                }
                                                className={`w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-blue-500 hover:text-blue-500 transition-colors duration-200 ${currentOrderStatus >= 3 || orderDetail.sanPhamCT.soLuong <= 0 || isOrderOnHold ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            >
                                                <Plus size={14} />
                                            </button>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteProduct(orderDetail.id)}
                                            disabled={currentOrderStatus >= 3 || isOrderOnHold}
                                            className={`p-2 bg-red-100 rounded-full hover:bg-red-200 transition-colors duration-200 ${currentOrderStatus >= 3 || isOrderOnHold ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            title="Xóa sản phẩm"
                                        >
                                            <Trash2 size={16} className="text-red-600" />
                                        </button>
                                        <div className="mt-2 text-sm text-gray-600">
                                            Tổng:{' '}
                                            <span className="font-semibold text-gray-800">
                                                {formatCurrency(
                                                    resolvePrices(orderDetail).discountedPrice *
                                                        (orderDetail.soLuong || 0),
                                                )}
                                            </span>
                                        </div>
                                        {/* <button
                                            onClick={() => handleOpenReturnModal(orderDetail)}
                                            disabled={!canReturn || isOrderOnHold}
                                            className={`p-2 bg-red-100 rounded-full hover:bg-red-200 transition-colors duration-200 ${!canReturn || isOrderOnHold ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            title="Trả hàng"
                                        >
                                            <RotateCcw size={16} className="text-red-600" />
                                        </button> */}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}

                {returnHistory.length > 0 && (
                    <div className="mt-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Danh sách sản phẩm trả hàng</h2>
                        <div className="space-y-4">
                            {returnHistory.map((returnItem) => (
                                <div
                                    key={returnItem.id}
                                    className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden"
                                >
                                    <div className="p-6 flex items-center gap-6">
                                        <div className="relative group">
                                            <div className="w-32 h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                                                <img
                                                    src={
                                                        returnItem.hoaDonCT.hinhAnhUrl ||
                                                        'https://via.placeholder.com/128'
                                                    }
                                                    alt={returnItem.hoaDonCT.sanPhamCT.ten}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex-1 flex items-start justify-between">
                                            <div>
                                                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                                    {returnItem.hoaDonCT.sanPhamCT.ten}
                                                </h3>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="text-sm text-red-500 font-medium">
                                                        {formatCurrency(returnItem.hoaDonCT.sanPhamCT.donGia)}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-600 mb-2">
                                                    <span className="font-medium">Số lượng trả:</span>{' '}
                                                    {returnItem.soLuong}
                                                </p>
                                                <p className="text-sm text-gray-600 mb-2">
                                                    <span className="font-medium">Lý do:</span>{' '}
                                                    {returnItem.lyDo || 'Không có'}
                                                </p>
                                                <p className="text-sm text-gray-600 mb-2">
                                                    <span className="font-medium">Ngày yêu cầu:</span>{' '}
                                                    {new Date(returnItem.ngayTao).toLocaleString('vi-VN')}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    <span className="font-medium">Trạng thái:</span>{' '}
                                                    <span
                                                        className={`px-2 py-1 rounded-full ${
                                                            getReturnStatusLabel(returnItem.trangThai).color
                                                        }`}
                                                    >
                                                        {getReturnStatusLabel(returnItem.trangThai).label}
                                                    </span>
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {showReturnModal && selectedOrderDetail && (
                    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                        <div
                            className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
                            onClick={handleCloseReturnModal}
                        />
                        <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-auto transform transition-all duration-300">
                            <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6 rounded-t-2xl">
                                <h3 className="text-lg font-bold">Yêu cầu trả hàng</h3>
                            </div>
                            <div className="p-6 space-y-4">
                                <p className="text-gray-600 mb-2">
                                    Sản phẩm: <span className="font-semibold">{selectedOrderDetail.sanPhamCT.ten}</span>
                                </p>
                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-medium mb-2">
                                        Số lượng trả hàng
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        max={selectedOrderDetail.soLuong}
                                        value={returnQuantity}
                                        onChange={(e) =>
                                            setReturnQuantity(
                                                Math.max(
                                                    1,
                                                    Math.min(
                                                        selectedOrderDetail.soLuong,
                                                        parseInt(e.target.value) || 1,
                                                    ),
                                                ),
                                            )
                                        }
                                        className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-red-500 focus:border-red-500"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-medium mb-2">
                                        Lý do trả hàng
                                    </label>
                                    <textarea
                                        className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-red-500 focus:border-red-500"
                                        rows="3"
                                        placeholder="Nhập lý do trả hàng (nếu có)"
                                        value={returnNote}
                                        onChange={(e) => setReturnNote(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end space-x-3 p-6 bg-gray-50 rounded-b-2xl">
                                <button
                                    onClick={handleCloseReturnModal}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Đóng
                                </button>
                                <button
                                    onClick={handleConfirmReturn}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                >
                                    Xác nhận
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductList;
