import React, { useEffect, useState } from 'react';
import { CheckCircle, Clock, Package, Truck, CreditCard, XCircle, RotateCcw, AlertCircle } from 'lucide-react';
import { Plus, Minus, ShoppingCart, Star, Heart } from 'lucide-react';
import { Calculator, Percent, Receipt } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { X, Banknote } from 'lucide-react';
import PaymentModal from './PaymentModal';
import OrderInfo from './OrderInfor';
import OrderProgress from './OrderProgress';
import ProductList from './ProductList';
import PaymentDetails from './PaymentDetai';
import swal from 'sweetalert';
import axios from 'axios';
import ProductModal from '../Sale/ProductModal';

function OrderStatus() {
    // Trạng thái hiện tại của đơn hàng

    const [quantity, setQuantity] = useState(4);
    const [isLiked, setIsLiked] = useState(false);

    const [discountCode, setDiscountCode] = useState('');
    const [discountPercent, setDiscountPercent] = useState(0);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [customerMoney, setCustomerMoney] = useState(0);
    const [note, setNote] = useState('');
    const [paymentMethod, setPaymentMethod] = useState(''); // 'cash' or 'Chuyển khoản'

    const [isAnimating, setIsAnimating] = useState(false);
    const [showProductModal, setShowProductModal] = useState(false);

    const location = useLocation();
    const orderData = location.state?.order || {}; // Lấy dữ liệu đơn hàng từ state
    // const orderDetailDatas = location.state?.orderDetails || {};
    const [orderDetailDatas, setOrderDetailDatas] = useState(location.state?.orderDetails || []);
    const [checkOut, setCheckOuts] = useState(location.state?.checkOut || []);
    const [currentOrderStatus, setCurrentOrderStatus] = useState(orderData.trangThai || 3);

    // State để lưu tổng tiền
    const [subtotal, setSubtotal] = useState(0);
    const [discountAmount, setDiscountAmount] = useState(0);
    const [total, setTotal] = useState(0);
    const shippingFee = 30000; // Phí ship cố định

    console.log('blabal: ', orderDetailDatas);

    const updateQuantity = async (orderDetailId, newQuantity) => {
        try {
            const response = await fetch(`http://localhost:8080/api/hoa-don-ct/update-quantity/${orderDetailId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ soLuong: newQuantity }),
            });

            if (!response.ok) {
                throw new Error('Không thể cập nhật số lượng');
            }

            // Cập nhật số lượng trong orderDetailDatas
            const updatedOrderDetails = orderDetailDatas.map((item) => {
                if (item.id === orderDetailId) {
                    return {
                        ...item,
                        soLuong: newQuantity,
                        giaBan: item.sanPhamCT.donGia * newQuantity,
                    };
                }
                return item;
            });

            setOrderDetailDatas(updatedOrderDetails);
        } catch (error) {
            console.error('Error updating quantity:', error);
        }
    };

    const handleQuantityChange = async (delta, orderDetailId) => {
        const newQuantity = Math.max(1, quantity + delta);
        await updateQuantity(orderDetailId, newQuantity);
        setQuantity(newQuantity);
    };

    useEffect(() => {
        if (orderData.voucher) {
            setDiscountCode(orderData.voucher.ma); // Thiết lập mã giảm giá
            setDiscountPercent(orderData.voucher.giaTri); // Thiết lập giá trị giảm giá
        }
    }, [orderData]);

    console.log('hahahah', orderData);

    // const calculateTotalAmount = () => {
    //     const shippingFee = 30000; // Phí ship mặc định
    //     const totalAmount = orderDetailDatas.reduce((total, orderDetail) => {
    //         return total + orderDetail.sanPhamCT.donGia * orderDetail.soLuong; // Cộng giá bán của từng sản phẩm
    //     }, 0);
    //     return totalAmount + shippingFee; // Cộng phí ship
    // };
    // const total = calculateTotalAmount();

    // Tính toán lại tổng tiền khi có thay đổi
    useEffect(() => {
        const newSubtotal = orderDetailDatas.reduce((sum, item) => {
            return sum + item.sanPhamCT.donGia * item.soLuong;
        }, 0);

        const newDiscountAmount = (newSubtotal * discountPercent) / 100;
        const newTotal = newSubtotal - newDiscountAmount + shippingFee;

        setSubtotal(newSubtotal);
        setDiscountAmount(newDiscountAmount);
        setTotal(newTotal);
    }, [orderDetailDatas, discountPercent]);

    // Hàm mở ProductModal
    const handleOpenProductModal = () => {
        setShowProductModal(true);
    };
    // Hàm đóng ProductModal
    const handleCloseProductModal = () => {
        setShowProductModal(false);
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 1:
                return { label: 'Chờ xác nhận', color: 'bg-yellow-200 text-yellow-800' };
            case 2:
                return { label: 'Chờ giao hàng', color: 'bg-blue-200 text-blue-800' };
            case 3:
                return { label: 'Đang vận chuyển', color: 'bg-purple-200 text-purple-800' };
            case 4:
                return { label: 'Đã giao hàng', color: 'bg-gray-200 text-green-800' };
            case 5:
                return { label: 'Đã thanh toán', color: 'bg-teal-200 text-teal-800' };
            case 6:
                return { label: 'Hoàn thành', color: 'bg-pink-200 text-gray-800' };
            case 7:
                return { label: 'Đã hủy', color: 'bg-red-200 text-red-800' };
            case 8:
                return { label: 'Trả hàng', color: 'bg-red-400 text-white' };
            default:
                return { label: 'Không xác định', color: 'bg-gray-200 text-gray-800' };
        }
    };

    const getStatus = (status) => {
        switch (status) {
            case 1:
                return { label: 'Thành công', color: 'bg-yellow-200 text-yellow-800' };

            default:
                return { label: 'Không xác định', color: 'bg-gray-200 text-gray-800' };
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Hoàn thành':
                return 'bg-purple-100 text-purple-700 border border-purple-300';
            case 'Giao hàng':
                return 'bg-blue-100 text-blue-700 border border-blue-300';
            case 'Thanh toán':
                return 'bg-blue-100 text-blue-700 border border-blue-300';
            case 'Tiền mặt':
                return 'bg-orange-100 text-orange-700 border border-orange-300';
            case 'Thành công':
                return 'bg-green-100 text-green-700 border border-green-300';
            case 1:
                return 'bg-green-100 text-green-700 border border-green-300';
            default:
                return 'bg-gray-100 text-gray-700 border border-gray-300';
        }
    };

    const getStatusInfo = (status) => {
        switch (status) {
            case 1:
                return { label: 'Chờ xác nhận', color: '#ebd534', icon: Clock };
            case 2:
                return { label: 'Chờ giao hàng', color: '#34e5eb', icon: Package };
            case 3:
                return { label: 'Đang vận chuyển', color: '#345feb', icon: Truck };
            case 4:
                return { label: 'Đã giao hàng', color: '#e342f5', icon: CheckCircle };
            case 5:
                return { label: 'Đã thanh toán', color: '#42f5e0', icon: CreditCard };
            case 6:
                return { label: 'Hoàn thành', color: '#4caf50', icon: CheckCircle };
            case 7:
                return { label: 'Đã hủy', color: '#f5425d', icon: XCircle };
            case 8:
                return { label: 'Trả hàng', color: '#f54278', icon: RotateCcw };
            default:
                return { label: 'Không xác định', color: '#f54278', icon: AlertCircle };
        }
    };

    // Sửa lại logic nút hành động chính
    const getActionButtonText = (status) => {
        switch (status) {
            case 1:
                return 'Xác nhận đơn hàng';
            case 2:
                return 'Xác nhận giao hàng';
            case 3:
                return 'Xác nhận lấy hàng';
            case 4:
                // Nếu đã lấy hàng xong thì không hiện nút ở đây nữa
                return 'Thanh toán';
            case 5:
                return 'Hoàn thành';
            case 6:
                return 'Đơn hàng đã hoàn thành';
            case 7:
                return 'Đơn hàng đã hủy';
            case 8:
                return 'Đơn hàng đã trả';
            default:
                return 'Không xác định';
        }
    };

    const updateOrderStatus = async (newStatus) => {
        try {
            const response = await fetch(`http://localhost:8080/api/hoa-don/${orderData.id}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newStatus),
            });
            if (!response.ok) {
                throw new Error('Không thể cập nhật trạng thái hóa đơn');
            }
            const updatedOrder = await response.json();

            // Cập nhật trạng thái đơn hàng trong state ngay lập tức
            setCurrentOrderStatus(newStatus); // Cập nhật trạng thái hiện tại
            setOrderDetailDatas((prev) => {
                return prev.map((order) => {
                    if (order.id === updatedOrder.id) {
                        return { ...order, trangThai: newStatus }; // Cập nhật trạng thái cho đơn hàng
                    }
                    return order;
                });
            });
        } catch (error) {
            console.error('Error updating order status:', error);
        }
    };

    // Sửa lại logic click nút hành động chính
    const handleActionButtonClick = () => {
        if (currentOrderStatus === 3) {
            // Khi click "Xác nhận lấy hàng", cập nhật trạng thái sang 4
            updateOrderStatus(4);
        } else if (currentOrderStatus === 4) {
            setIsModalOpen(true);
            // Khi đã thanh toán xong, cho phép nhấn "Hoàn thành"
        } else if (currentOrderStatus < 7) {
            updateOrderStatus(currentOrderStatus + 1);
        }
    };

    const calculateChange = () => {
        return customerMoney - total; // Tổng tiền đã tính toán
    };

    // Khi lưu thanh toán xong, cập nhật trạng thái và chuyển nút "Hoàn thành" về vị trí cũ
    const handleSave = async () => {
        try {
            // Tạo đối tượng thanh toán mới
            const newPayment = {
                hoaDon: { id: orderData.id }, // Truyền đối tượng hoaDon với ID
                taiKhoan: { id: 1 }, // Truyền đối tượng taiKhoan với ID (data cứng tạm thời)
                ma: `PT-${Date.now()}`, // Mã thanh toán (có thể thay đổi theo logic của bạn)
                tongTien: total, // Tổng tiền
                phuongThucThanhToan: paymentMethod, // Phương thức thanh toán
                ghiChu: note, // Ghi chú
                trangThai: 1, // Trạng thái thanh toán
                ngayTao: new Date().toISOString(), // Ngày tạo
            };

            // Gửi yêu cầu POST đến API để thêm thanh toán mới
            const response = await fetch('http://localhost:8080/api/thanh-toan', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newPayment),
            });

            if (!response.ok) {
                throw new Error('Không thể thêm thanh toán');
            }

            // Cập nhật trạng thái đơn hàng
            await updateOrderStatus(5); // Cập nhật trạng thái thành "Đã thanh toán"
            setIsModalOpen(false); // Đóng modal

            // Cập nhật danh sách thanh toán trong state
            const savedPayment = await response.json(); // Lấy dữ liệu thanh toán vừa lưu
            setCheckOuts((prev) => [...prev, savedPayment]); // Cập nhật danh sách thanh toán

            // Thông báo thành công
            console.log('Lưu thanh toán thành công');
        } catch (error) {
            console.error('Error saving payment:', error);
        }
    };

    // const handleAddProduct = async (product) => {
    //     const newBillDetail = {
    //         sanPhamCT: { id: product.id },
    //         hoaDon: { id: orderData.id },
    //         soLuong: 1, // Hoặc số lượng mặc định bạn muốn
    //         giaBan: product.donGia,
    //         trangThai: 1,
    //     };
    //     try {
    //         const response = await fetch('http://localhost:8080/api/hoa-don-ct', {
    //             method: 'POST',
    //             headers: {
    //                 'Content-Type': 'application/json',
    //             },
    //             body: JSON.stringify(newBillDetail),
    //         });
    //         if (!response.ok) {
    //             throw new Error('Không thể thêm sản phẩm vào hóa đơn');
    //         }
    //         const addedProduct = await response.json();
    //         setOrderDetailDatas((prev) => [...prev, addedProduct]); // Cập nhật danh sách sản phẩm
    //     } catch (error) {
    //         console.error('Error adding product to invoice:', error);
    //     }
    // };

    const handleAddBillDetail = (billDetail) => {
        // Kiểm tra xem sản phẩm đã tồn tại trong billDetails chưa
        const productExists = orderDetailDatas.some((detail) => detail.sanPhamCT.id === billDetail.idSanPhamCT);

        if (productExists) {
            swal('Thất bại!', 'Sản phẩm đã tồn tại trong hóa đơn!', 'warning');
            return; // Không thêm sản phẩm nếu đã tồn tại
        }

        const newBillDetail = {
            sanPhamCT: { id: billDetail.idSanPhamCT },
            hoaDon: { id: billDetail.idHoaDon },
            soLuong: billDetail.soLuong,
            giaBan: billDetail.giaBan,
            trangThai: 1,
        };

        axios
            .post('http://localhost:8080/api/hoa-don-ct', newBillDetail)
            .then((response) => {
                // Chỉ hiển thị thông báo thành công nếu sản phẩm được thêm thành công

                swal('Thành công!', 'Sản phẩm đã được thêm vào hóa đơn!', 'success');
            })
            .catch((error) => {
                console.error('Lỗi khi thêm chi tiết hóa đơn:', error);
                swal('Lỗi!', 'Không thể thêm sản phẩm vào hóa đơn', 'error');
            });
    };

    const handleClose = () => {
        setIsAnimating(true);
        setTimeout(() => {
            setIsModalOpen(false);
        }, 200);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(amount);
    };

    const isInsufficientFunds = paymentMethod === 'Tiền mặt' && customerMoney > 0 && customerMoney < total;

    // Sửa lại logic hiển thị nút hành động chính
    const shouldShowActionButton = (status) => {
        return status !== 7 && status !== 8 && status !== 9;
    };

    const getActionButtonStyle = (status) => {
        if (status === 4) {
            return 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700';
        }
        if (status === 6) {
            return 'bg-gradient-to-r from-gray-400 to-gray-500 text-white cursor-not-allowed';
        }
        return 'text-blue-600 border-2 border-blue-300 hover:bg-blue-50';
    };

    console.log('Trạng thái hiện tại:', currentOrderStatus);
    console.log('Trạng thái từ API:', orderData.trangThai);

    const getInvoiceTypeStyle = (type) => {
        switch (type) {
            case 'Trực tuyến':
                return 'bg-purple-100 text-purple-700';
            case 'Tại quầy':
                return 'bg-green-100 text-green-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    const ORDER_STEPS = [1, 2, 3, 4, 5, 6];
    const generateTimeline = (currentStatus) => {
        const timeline = [];
        const baseTime = new Date('2023-12-21T13:48:17');
        // Tạo mốc thời gian mẫu cho từng bước
        const timeOffsets = [
            0,
            4 * 60 * 1000,
            8 * 60 * 1000,
            24 * 60 * 60 * 1000,
            25 * 60 * 60 * 1000,
            26 * 60 * 60 * 1000,
        ];
        for (let i = 0; i < ORDER_STEPS.length; i++) {
            const step = ORDER_STEPS[i];
            let completed = currentOrderStatus > step;
            let current = currentOrderStatus === step;
            // Nếu trạng thái đã vượt qua bước này thì completed=true
            // Nếu trạng thái đang ở bước này thì current=true
            let time = new Date(baseTime.getTime() + timeOffsets[i]).toLocaleString('vi-VN');
            // Nếu là bước cuối cùng (Hoàn thành) và chưa hoàn thành thì để "Đang chờ..."
            if (step === 6 && currentOrderStatus < 6) {
                time = 'Đang chờ...';
            }
            timeline.push({
                status: step,
                time,
                completed,
                current,
            });
        }
        return timeline;
    };

    const timeline = generateTimeline(currentOrderStatus);

    // Tiến độ: số bước đã hoàn thành (completed=true) + bước hiện tại (current=true) / tổng số bước
    // Nếu trạng thái là 1 (Chờ xác nhận) thì chỉ 1/6, trạng thái 2 là 2/6, v.v.
    const totalSteps = timeline.length;
    const currentStepIndex = ORDER_STEPS.indexOf(ORDER_STEPS.find((s) => s === currentOrderStatus));
    // Nếu trạng thái không nằm trong các bước (ví dụ: hủy, trả hàng, ...) thì tiến độ là 0
    let progressPercentage = 0;
    if (currentStepIndex !== -1) {
        progressPercentage = ((currentStepIndex + 1) / totalSteps) * 100;
    } else if (currentOrderStatus === 6) {
        progressPercentage = 100;
    }

     const handleCancelOrder = async () => {
        try {
            await updateOrderStatus(7); // Cập nhật trạng thái thành "Đã hủy"
            swal('Thành công!', 'Đơn hàng đã được hủy!', 'success');
        } catch (error) {
            console.error('Error canceling order:', error);
            swal('Lỗi!', 'Không thể hủy đơn hàng', 'error');
        }
    };

    return (
        <>
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-xl border border-gray-100 p-8 max-w-5xl mx-auto">
                <OrderProgress
                    currentOrderStatus={currentOrderStatus}
                    setCurrentOrderStatus={setCurrentOrderStatus}
                    timeline={timeline}
                    getStatusInfo={getStatusInfo}
                    progressPercentage={progressPercentage}
                    shouldShowActionButton={shouldShowActionButton}
                    handleActionButtonClick={handleActionButtonClick}
                    getActionButtonStyle={getActionButtonStyle}
                    getActionButtonText={getActionButtonText}
                    handleCancelOrder={handleCancelOrder}
                />
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 max-w-5xl mx-auto mt-8">
                {/* Header */}
                <OrderInfo
                    orderData={orderData}
                    currentOrderStatus={currentOrderStatus}
                    checkOut={checkOut}
                    getInvoiceTypeStyle={getInvoiceTypeStyle}
                    getStatusLabel={getStatusLabel}
                    getStatusStyle={getStatusStyle}
                    getStatus={getStatus}
                />
                <ProductList
                    orderDetailDatas={orderDetailDatas}
                    handleOpenProductModal={handleOpenProductModal}
                    handleQuantityChange={handleQuantityChange}
                    isLiked={isLiked}
                    setIsLiked={setIsLiked}
                    isOrderInTransit={currentOrderStatus === 3} // Truyền trạng thái đơn hàng
                />
            </div>
            {showProductModal && (
                <ProductModal
                    showProductModal={showProductModal}
                    handleCloseProductModal={handleCloseProductModal}
                    selectedBill={orderData}
                    onAddBillDetail={handleAddBillDetail}
                />
            )}
            <PaymentDetails
                discountCode={discountCode}
                setDiscountCode={setDiscountCode}
                discountPercent={discountPercent}
                setDiscountPercent={setDiscountPercent}
                total={total}
                discountAmount={discountAmount}
            />
            <PaymentModal
                isOpen={isModalOpen}
                handleClose={handleClose}
                total={total}
                paymentMethod={paymentMethod}
                setPaymentMethod={setPaymentMethod}
                customerMoney={customerMoney}
                setCustomerMoney={setCustomerMoney}
                note={note}
                setNote={setNote}
                handleSave={handleSave}
                isInsufficientFunds={isInsufficientFunds}
                isAnimating={isAnimating}
                formatCurrency={formatCurrency}
                calculateChange={calculateChange}
            />
        </>
    );
}

export default OrderStatus;
