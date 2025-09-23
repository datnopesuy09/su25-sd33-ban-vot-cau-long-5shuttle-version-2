import React, { useState, useEffect, useRef } from 'react';
import { Plus, Minus, Star, Heart, RotateCcw, Trash2 } from 'lucide-react';
import axios from 'axios';
import swal from 'sweetalert';
import StockAllocationIndicator from '../../../components/StockAllocationIndicator';

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
    onReturnSuccess, // Callback để thông báo khi hoàn hàng thành công
}) => {
    const [showReturnModal, setShowReturnModal] = useState(false);
    const [selectedOrderDetail, setSelectedOrderDetail] = useState(null);
    const [returnQuantity, setReturnQuantity] = useState(1);
    const [returnNote, setReturnNote] = useState('');
    const [returnHistory, setLocalReturnHistory] = useState([]);
    const [pendingReturns, setPendingReturns] = useState([]); // Danh sách sản phẩm đang chờ hoàn hàng
    // Local, non-reactive cache to avoid mutating props; key: hoaDonCT id -> { unitPrice, originalPrice }
    const priceCacheRef = useRef(new Map());
    // Map đơn giá giao dịch lấy từ lịch sử hoàn hàng: hoaDonCTId -> donGia
    const [returnPriceMap, setReturnPriceMap] = useState({});

    useEffect(() => {
        if (hoaDonId) {
            const fetchReturnHistory = async () => {
                try {
                    const response = await axios.get(`http://localhost:8080/api/hoan-hang/hoa-don/${hoaDonId}`);
                    if (response.data.success) {
                        setLocalReturnHistory(response.data.data);
                        setReturnHistory(response.data.data);
                        // Xây dựng map đơn giá giao dịch từ lịch sử hoàn hàng (ưu tiên dùng sau reload)
                        try {
                            const map = {};
                            response.data.data.forEach((r) => {
                                if (r.hoaDonChiTietId && r.donGia) {
                                    // Lấy đơn giá đầu tiên (tại thời điểm mua), các lần sau cùng 1 đơn giá
                                    if (!map[r.hoaDonChiTietId]) map[r.hoaDonChiTietId] = Number(r.donGia);
                                }
                            });
                            setReturnPriceMap(map);
                        } catch (e) {
                            console.warn('Không thể build returnPriceMap:', e);
                        }
                        // Clear cache để render lại theo dữ liệu mới
                        priceCacheRef.current.clear();
                    }
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
            swal('Lỗi!', 'Số lượng hoàn hàng không hợp lệ!', 'error');
            return;
        }

        const isConfirmed = await swal({
            title: 'Xác nhận hoàn hàng',
            text: `Bạn có chắc chắn muốn hoàn ${returnQuantity} sản phẩm ${selectedOrderDetail.sanPhamCT.ten}?`,
            icon: 'warning',
            buttons: ['Hủy', 'Xác nhận'],
            dangerMode: true,
        });

        if (isConfirmed) {
            try {
                // Debug giá trị thực tế
                console.log('selectedOrderDetail:', selectedOrderDetail);
                console.log('resolvePrices result:', resolvePrices(selectedOrderDetail));
                
                // Gọi API hoàn hàng mới - xử lý trực tiếp
                const response = await axios.post('http://localhost:8080/api/hoan-hang', {
                    hoaDonId: hoaDonId,
                    hoaDonChiTietId: selectedOrderDetail.id,
                    soLuongHoan: returnQuantity,
                    donGia: resolvePrices(selectedOrderDetail).unitPrice,
                    lyDoHoan: returnNote || 'Hoàn hàng do đang vận chuyển',
                    ghiChu: returnNote,
                    nguoiTao: 'Admin'
                });

                if (response.data.success) {
                    const apiData = response.data.data;
                    
                    // Tạo thông tin sản phẩm hoàn hàng để hiển thị ngay lập tức
                    const returnItem = {
                        id: apiData.id,
                        maHoanHang: apiData.maHoanHang,
                        orderDetailId: selectedOrderDetail.id,
                        productName: selectedOrderDetail.sanPhamCT.ten,
                        productImage: selectedOrderDetail.sanPhamCT.hinhAnh || 
                                     selectedOrderDetail.sanPhamCT.hinhAnhUrl ||
                                     selectedOrderDetail.sanPhamCT.sanPham?.hinhAnh ||
                                     selectedOrderDetail.sanPhamCT.sanPham?.hinhAnhUrl ||
                                     (selectedOrderDetail.sanPhamCT.sanPham?.hinhAnhs && selectedOrderDetail.sanPhamCT.sanPham.hinhAnhs.length > 0 ? 
                                         `http://localhost:8080/uploads/${selectedOrderDetail.sanPhamCT.sanPham.hinhAnhs[0]}` : null),
                        // Lưu thêm nhiều trường ảnh để fallback
                        hinhAnh: selectedOrderDetail.sanPhamCT.hinhAnh,
                        hinhAnhUrl: selectedOrderDetail.sanPhamCT.hinhAnhUrl,
                        unitPrice: resolvePrices(selectedOrderDetail).unitPrice,
                        quantity: returnQuantity,
                        totalAmount: apiData.thanhTien,
                        note: returnNote,
                        returnDate: new Date().toLocaleString('vi-VN'),
                        productInfo: selectedOrderDetail.sanPhamCT,
                        sanPhamCT: selectedOrderDetail.sanPhamCT, // Lưu toàn bộ thông tin sản phẩm chi tiết
                        tongTienMoi: apiData.tongTienMoi,
                        tongTienHoanHang: apiData.tongTienHoanHang
                    };

                    // Thêm vào danh sách pending returns
                    setPendingReturns(prev => [...prev, returnItem]);

                    // Gọi callback để cập nhật tổng tiền ở component cha với thông tin từ API
                    if (onReturnSuccess) {
                        onReturnSuccess({
                            ...returnItem,
                            updatedOrderTotal: apiData.tongTienMoi,
                            totalReturnAmount: apiData.tongTienHoanHang
                        });
                    }

                    // Cập nhật return history từ server với API mới
                    const fetchResponse = await axios.get(`http://localhost:8080/api/hoan-hang/hoa-don/${hoaDonId}`);
                    if (fetchResponse.data.success) {
                        setLocalReturnHistory(fetchResponse.data.data);
                        setReturnHistory(fetchResponse.data.data);
                        // Cập nhật returnPriceMap từ dữ liệu vừa fetch
                        const map = {};
                        fetchResponse.data.data.forEach((r) => {
                            if (r.hoaDonChiTietId && r.donGia) {
                                if (!map[r.hoaDonChiTietId]) map[r.hoaDonChiTietId] = Number(r.donGia);
                            }
                        });
                        setReturnPriceMap(map);
                        // Xóa cache giá để render lại ngay
                        priceCacheRef.current.clear();
                    }

                    // THÊM: Cập nhật tồn kho trong orderDetailDatas - tăng số lượng tồn kho
                    if (orderDetailDatas && orderDetailDatas.length > 0) {
                        const updatedOrderDetails = orderDetailDatas.map(item => {
                            if (item.id === selectedOrderDetail.id) {
                                return {
                                    ...item,
                                    // GIẢM số lượng đang mua ngay lập tức để UI cập nhật real-time
                                    soLuong: Math.max(0, (item.soLuong || 0) - returnQuantity),
                                    sanPhamCT: {
                                        ...item.sanPhamCT,
                                        // Tăng tồn kho
                                        soLuong: (item.sanPhamCT.soLuong || 0) + returnQuantity
                                    }
                                };
                            }
                            return item;
                        });
                        
                        // Gọi callback để cập nhật orderDetailDatas ở component cha
                        if (onReturnSuccess) {
                            onReturnSuccess({
                                ...returnItem,
                                updatedOrderTotal: apiData.tongTienMoi,
                                totalReturnAmount: apiData.tongTienHoanHang,
                                updatedOrderDetails: updatedOrderDetails // Thêm data cập nhật
                            });
                        }
                        // Clear cache để đảm bảo đơn giá hiển thị đúng ngay sau khi hoàn
                        priceCacheRef.current.delete(selectedOrderDetail.id);
                        // Lưu đơn giá giao dịch cho item vừa hoàn (đảm bảo dùng đúng giá 2.250.000 đ)
                        setReturnPriceMap(prev => ({ ...prev, [selectedOrderDetail.id]: resolvePrices(selectedOrderDetail).unitPrice }));
                    }

                    swal('Thành công!', 'Sản phẩm đã được hoàn hàng và cập nhật đơn hàng thành công!', 'success');
                    handleCloseReturnModal();
                }
            } catch (error) {
                console.error('Lỗi khi xử lý hoàn hàng:', error);
                swal('Lỗi!', error.response?.data?.message || 'Không thể xử lý hoàn hàng', 'error');
            }
        }
    };

    const formatCurrency = (amount) => {
        const n = Number.isFinite(amount) ? amount : Number(amount);
        const safe = Number.isFinite(n) ? n : 0;
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(safe);
    };

    // Clear cache nếu danh sách chi tiết đơn thay đổi (tránh giữ giá cũ)
    useEffect(() => {
        priceCacheRef.current.clear();
    }, [orderDetailDatas]);

    // Resolve possible price fields and return original and discounted prices
    const resolvePrices = (item) => {
        const qty = Number(item?.soLuong ?? item?.quantity ?? 1);

        // Backend now stores hoaDonCT.giaBan as unit price at transaction time
        let unitPrice = 0;
        if (item?.giaBan != null) {
            unitPrice = Number(item.giaBan);
        } else if (item?.donGia != null) {
            unitPrice = Number(item.donGia);
        } else if (item?.sanPhamCT?.donGia != null) {
            unitPrice = Number(item.sanPhamCT.donGia);
        }

        // Original price for strike-through (if available)
        let unitOriginal = unitPrice;
        if (item?.giaGoc != null) {
            unitOriginal = Number(item.giaGoc);
        } else if (item?.sanPhamCT?.donGia != null) {
            unitOriginal = Number(item.sanPhamCT.donGia);
        }

        const toMoney = (n) => Math.round((Number(n) || 0) * 100) / 100;
        unitPrice = toMoney(unitPrice);
        unitOriginal = toMoney(unitOriginal);

        const lineTotal = toMoney(unitPrice * qty);
        const lineOriginal = toMoney(unitOriginal * qty);

        // Return both new names and legacy aliases used by JSX
        return {
            // New explicit names
            unitOriginalPrice: unitOriginal,
            unitDiscountedPrice: unitPrice,
            lineOriginalTotal: lineOriginal,
            lineDiscountedTotal: lineTotal,
            quantity: qty,
            // Legacy aliases used across the file/UI
            originalPrice: unitOriginal,
            discountedPrice: unitPrice,
            unitPrice: unitPrice,
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
                                            src={
                                                orderDetail.hinhAnhUrl ||
                                                orderDetail.sanPhamCT?.hinhAnh ||
                                                orderDetail.sanPhamCT?.hinhAnhUrl ||
                                                orderDetail.sanPhamCT?.sanPham?.hinhAnh ||
                                                orderDetail.sanPhamCT?.sanPham?.hinhAnhUrl ||
                                                (orderDetail.sanPhamCT?.sanPham?.hinhAnhs && orderDetail.sanPhamCT.sanPham.hinhAnhs.length > 0 ? 
                                                    `http://localhost:8080/uploads/${orderDetail.sanPhamCT.sanPham.hinhAnhs[0]}` : null) ||
                                                'https://via.placeholder.com/128?text=No+Image'
                                            }
                                            alt={orderDetail.sanPhamCT.ten}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                console.log('Product list image failed to load:', e.target.src);
                                                e.target.src = 'https://via.placeholder.com/128?text=No+Image';
                                            }}
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

                                        {/* THÊM: Stock Allocation Indicator */}
                                        {/* <div className="mt-3">
                                            <StockAllocationIndicator
                                                sanPhamCTId={orderDetail.sanPhamCT.id}
                                                hoaDonCTId={orderDetail.id}
                                                currentQuantity={orderDetail.soLuong}
                                                isOrderConfirmed={currentOrderStatus >= 3}
                                                showDetails={true}
                                                className="w-full"
                                            />
                                        </div> */}
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
                                        {currentOrderStatus === 3 ? (
                                            // Nút hoàn hàng khi đang vận chuyển
                                            <button
                                                onClick={() => handleOpenReturnModal(orderDetail)}
                                                disabled={isOrderOnHold}
                                                className={`p-2 bg-orange-100 rounded-full hover:bg-orange-200 transition-colors duration-200 ${isOrderOnHold ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                title="Hoàn hàng"
                                            >
                                                <RotateCcw size={16} className="text-orange-600" />
                                            </button>
                                        ) : (
                                            // Nút xóa cho các trạng thái khác
                                            <button
                                                onClick={() => handleDeleteProduct(orderDetail.id)}
                                                disabled={currentOrderStatus >= 3 || isOrderOnHold}
                                                className={`p-2 bg-red-100 rounded-full hover:bg-red-200 transition-colors duration-200 ${currentOrderStatus >= 3 || isOrderOnHold ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                title="Xóa sản phẩm"
                                            >
                                                <Trash2 size={16} className="text-red-600" />
                                            </button>
                                        )}
                                        <div className="mt-2 text-sm text-gray-600">
                                            Tổng:{' '}
                                            <span className="font-semibold text-gray-800">
                                                {formatCurrency(
                                                    resolvePrices(orderDetail).discountedPrice *
                                                        (orderDetail.soLuong || 0),
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}

                {/* Hiển thị danh sách sản phẩm hoàn hàng */}
                {pendingReturns.length > 0 && (
                    <div className="mt-8">
                        <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
                            {/* <h2 className="text-xl font-bold text-orange-800 mb-4 flex items-center gap-2">
                                <RotateCcw className="w-5 h-5" />
                                Danh sách sản phẩm hoàn hàng
                            </h2> */}
                            {/* <div className="space-y-4">
                                {pendingReturns.map((returnItem) => (
                                    <div
                                        key={returnItem.id}
                                        className="bg-white rounded-lg shadow-sm border border-orange-200 overflow-hidden"
                                    >
                                        <div className="p-4 flex items-center gap-4">
                                            <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                                                <img
                                                    src={returnItem.productImage || 'https://via.placeholder.com/64'}
                                                    alt={returnItem.productName}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-gray-800 mb-1">
                                                    {returnItem.productName}
                                                </h3>
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-600">
                                                    <div>
                                                        <span className="font-medium">Màu sắc:</span>{' '}
                                                        {returnItem.productInfo.mauSac?.ten || 'N/A'}
                                                    </div>
                                                    <div>
                                                        <span className="font-medium">Trọng lượng:</span>{' '}
                                                        {returnItem.productInfo.trongLuong?.ten || 'N/A'}
                                                    </div>
                                                    <div>
                                                        <span className="font-medium">SL hoàn:</span>{' '}
                                                        <span className="text-orange-600 font-semibold">{returnItem.quantity}</span>
                                                    </div>
                                                    <div>
                                                        <span className="font-medium">Đơn giá:</span>{' '}
                                                        {formatCurrency(returnItem.unitPrice)}
                                                    </div>
                                                </div>
                                                {returnItem.note && (
                                                    <p className="text-sm text-gray-600 mt-2">
                                                        <span className="font-medium">Ghi chú:</span> {returnItem.note}
                                                    </p>
                                                )}
                                                <p className="text-sm text-gray-500 mt-1">
                                                    Thời gian: {returnItem.returnDate}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-lg font-bold text-orange-600 mb-1">
                                                    {formatCurrency(returnItem.totalAmount)}
                                                </div>
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                                    Chờ xử lý
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div> */}
                            
                            {/* Tổng tiền hoàn hàng */}
                            {/* <div className="mt-4 pt-4 border-t border-orange-200">
                                <div className="flex justify-between items-center">
                                    <span className="text-lg font-semibold text-gray-700">Tổng tiền hoàn hàng:</span>
                                    <span className="text-xl font-bold text-orange-600">
                                        {formatCurrency(pendingReturns.reduce((total, item) => total + item.totalAmount, 0))}
                                    </span>
                                </div>
                            </div> */}
                        </div>
                    </div>
                )}

                {returnHistory.length > 0 && (
                    <div className="mt-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Lịch sử hoàn hàng</h2>
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
                                                        returnItem.hinhAnh ||
                                                        returnItem.hinhAnhUrl ||
                                                        returnItem.productImage ||
                                                        returnItem.sanPhamCT?.hinhAnh ||
                                                        returnItem.sanPhamCT?.hinhAnhUrl ||
                                                        returnItem.sanPhamCT?.sanPham?.hinhAnh ||
                                                        returnItem.sanPhamCT?.sanPham?.hinhAnhUrl ||
                                                        (returnItem.sanPhamCT?.sanPham?.hinhAnhs && returnItem.sanPhamCT.sanPham.hinhAnhs.length > 0 ? 
                                                            `http://localhost:8080/uploads/${returnItem.sanPhamCT.sanPham.hinhAnhs[0]}` : null) ||
                                                        (returnItem.hinhAnhs && returnItem.hinhAnhs.length > 0 ? 
                                                            `http://localhost:8080/uploads/${returnItem.hinhAnHs[0]}` : null) ||
                                                        'https://via.placeholder.com/128?text=No+Image'
                                                    }
                                                    alt={returnItem.tenSanPham || 'Sản phẩm'}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        console.log('Return history image failed to load:', e.target.src);
                                                        e.target.src = 'https://via.placeholder.com/128?text=No+Image';
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        <div className="flex-1 flex items-start justify-between">
                                            <div>
                                                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                                    {returnItem.tenSanPham || 'Không xác định'}
                                                </h3>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="text-sm text-blue-600 font-medium">
                                                        Màu sắc: {returnItem.mauSac || 'Không có'}
                                                    </span>
                                                    <span className="text-sm text-purple-600 font-medium">
                                                        Trọng lượng: {returnItem.trongLuong || 'Không có'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="text-sm text-red-500 font-medium">
                                                        {formatCurrency(returnItem.donGia || 0)}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-600 mb-2">
                                                    <span className="font-medium">Mã hoàn hàng:</span>{' '}
                                                    {returnItem.maHoanHang}
                                                </p>
                                                <p className="text-sm text-gray-600 mb-2">
                                                    <span className="font-medium">Số lượng hoàn:</span>{' '}
                                                    {returnItem.soLuongHoan}
                                                </p>
                                                <p className="text-sm text-gray-600 mb-2">
                                                    <span className="font-medium">Thành tiền:</span>{' '}
                                                    {formatCurrency(returnItem.thanhTien || 0)}
                                                </p>
                                                <p className="text-sm text-gray-600 mb-2">
                                                    <span className="font-medium">Lý do:</span>{' '}
                                                    {returnItem.lyDoHoan || 'Không có'}
                                                </p>
                                                <p className="text-sm text-gray-600 mb-2">
                                                    <span className="font-medium">Ghi chú:</span>{' '}
                                                    {returnItem.ghiChu || 'Không có'}
                                                </p>
                                                <p className="text-sm text-gray-600 mb-2">
                                                    <span className="font-medium">Ngày hoàn:</span>{' '}
                                                    {returnItem.ngayTao ? new Date(returnItem.ngayTao).toLocaleString('vi-VN') : 'Không xác định'}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    <span className="font-medium">Người tạo:</span>{' '}
                                                    {returnItem.nguoiTao || 'Không xác định'}
                                                </p>
                                                <div className="mt-2">
                                                    <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                                        Đã hoàn hàng
                                                    </span>
                                                </div>
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
                        <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-auto transform transition-all duration-300">
                            <div className="bg-gradient-to-r from-orange-600 to-orange-700 text-white p-6 rounded-t-2xl">
                                <h3 className="text-lg font-bold">Hoàn hàng sản phẩm</h3>
                                <p className="text-orange-100 text-sm">Vui lòng điền thông tin hoàn hàng</p>
                            </div>
                            <div className="p-6 space-y-6">
                                {/* Thông tin sản phẩm với hình ảnh */}
                                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                                    <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                                        <img
                                            src={
                                                selectedOrderDetail.sanPhamCT.hinhAnh || 
                                                selectedOrderDetail.sanPhamCT.hinhAnhUrl ||
                                                selectedOrderDetail.sanPhamCT.sanPham?.hinhAnh ||
                                                selectedOrderDetail.sanPhamCT.sanPham?.hinhAnhUrl ||
                                                (selectedOrderDetail.sanPhamCT.sanPham?.hinhAnhs && selectedOrderDetail.sanPhamCT.sanPham.hinhAnhs.length > 0 ? 
                                                    `http://localhost:8080/uploads/${selectedOrderDetail.sanPhamCT.sanPham.hinhAnhs[0]}` : null) ||
                                                'https://via.placeholder.com/80?text=No+Image'
                                            }
                                            alt={selectedOrderDetail.sanPhamCT.ten}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                console.log('Image failed to load:', e.target.src);
                                                e.target.src = 'https://via.placeholder.com/80?text=No+Image';
                                            }}
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-gray-800 mb-1">
                                            {selectedOrderDetail.sanPhamCT.ten}
                                        </h4>
                                        <div className="text-sm text-gray-600 space-y-1">
                                            <p>Màu sắc: <span className="font-medium">{selectedOrderDetail.sanPhamCT.mauSac?.ten || 'N/A'}</span></p>
                                            <p>Trọng lượng: <span className="font-medium">{selectedOrderDetail.sanPhamCT.trongLuong?.ten || 'N/A'}</span></p>
                                            <p>Số lượng đã mua: <span className="font-medium">{selectedOrderDetail.soLuong}</span></p>
                                            <p>Đơn giá: <span className="font-medium text-red-600">{formatCurrency(resolvePrices(selectedOrderDetail).unitPrice)}</span></p>
                                        </div>
                                    </div>
                                </div>

                                {/* Form nhập thông tin hoàn hàng */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-gray-700 text-sm font-medium mb-2">
                                            Số lượng hoàn <span className="text-red-500">*</span>
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
                                            className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                                            placeholder="Nhập số lượng muốn hoàn"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            Tối đa có thể hoàn: {selectedOrderDetail.soLuong} sản phẩm
                                        </p>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-gray-700 text-sm font-medium mb-2">
                                            Ghi chú
                                        </label>
                                        <textarea
                                            className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all resize-none"
                                            rows="3"
                                            placeholder="Nhập lý do hoàn hàng hoặc ghi chú thêm (tùy chọn)"
                                            value={returnNote}
                                            onChange={(e) => setReturnNote(e.target.value)}
                                        />
                                    </div>

                                    {/* Thông tin tổng tiền hoàn */}
                                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-600">Số tiền hoàn:</span>
                                            <span className="font-bold text-orange-600 text-lg">
                                                {formatCurrency(resolvePrices(selectedOrderDetail).discountedPrice * returnQuantity)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end space-x-3 p-6 bg-gray-50 rounded-b-2xl">
                                <button
                                    onClick={handleCloseReturnModal}
                                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={handleConfirmReturn}
                                    className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                                >
                                    Xác nhận hoàn hàng
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
