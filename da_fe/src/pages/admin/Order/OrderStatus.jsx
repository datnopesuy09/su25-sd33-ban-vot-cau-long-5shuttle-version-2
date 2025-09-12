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
import KhoHangManagement from '../../../components/KhoHangManagement';
import swal from 'sweetalert';
import axios from 'axios';
import ProductModal from '../Sale/ProductModal';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';

function OrderStatus() {
    const location = useLocation();
    const orderData = location.state?.order || {};
    const [orderDetailDatas, setOrderDetailDatas] = useState(location.state?.orderDetails || []);
    const [checkOut, setCheckOuts] = useState(location.state?.checkOut || []);
    const [currentOrderStatus, setCurrentOrderStatus] = useState(orderData.trangThai || 3);
    const [isOrderInTransit, setIsOrderInTransit] = useState(orderData.trangThai === 3);
    const [hoaDonId, setHoaDonId] = useState(orderData.id || null);
    const [returnHistory, setReturnHistory] = useState([]);
    const [preOrders, setPreOrders] = useState([]);
    const [quantity, setQuantity] = useState(1);
    const [isLiked, setIsLiked] = useState(false);
    const [discountCode, setDiscountCode] = useState('');
    const [discountPercent, setDiscountPercent] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [customerMoney, setCustomerMoney] = useState(0);
    const [note, setNote] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('');
    const [isAnimating, setIsAnimating] = useState(false);
    const [showProductModal, setShowProductModal] = useState(false);
    const [subtotal, setSubtotal] = useState(0);
    const [discountAmount, setDiscountAmount] = useState(0);
    const [total, setTotal] = useState(0);
    const [showImportModal, setShowImportModal] = useState(false);
    const [importQuantity, setImportQuantity] = useState(1);
    const [selectedProductId, setSelectedProductId] = useState(null);
    const shippingFee = 30000;
    const [stompClient, setStompClient] = useState(null);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [orderHistory, setOrderHistory] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    const fetchPreOrders = async () => {
        try {
            const response = await axios.get(`http://localhost:8080/api/pre-order/hoa-don/${hoaDonId}`);
            setPreOrders(response.data);
        } catch (error) {
            console.error('Lỗi khi lấy danh sách đặt trước:', error);
            swal('Lỗi!', 'Không thể lấy danh sách đặt trước', 'error');
        }
    };

    const fetchBillDetails = async (idHoaDon) => {
        try {
            const response = await axios.get(`http://localhost:8080/api/hoa-don-ct/hoa-don/${idHoaDon}`);
            setOrderDetailDatas(response.data);
        } catch (error) {
            console.error('Lỗi khi lấy chi tiết hóa đơn:', error);
            swal('Lỗi!', 'Không thể lấy chi tiết hóa đơn', 'error');
        }
    };

    const fetchOrderHistory = async () => {
        if (!hoaDonId) return;

        setLoadingHistory(true);
        try {
            const response = await axios.get(`http://localhost:8080/api/lich-su-don-hang/hoa-don/${hoaDonId}`);
            setOrderHistory(response.data);
        } catch (error) {
            console.error('Lỗi khi lấy lịch sử đơn hàng:', error);
            swal('Lỗi!', 'Không thể lấy lịch sử đơn hàng', 'error');
        } finally {
            setLoadingHistory(false);
        }
    };

    const handleShowHistoryModal = () => {
        setShowHistoryModal(true);
        fetchOrderHistory();
    };

    const handleCloseHistoryModal = () => {
        setShowHistoryModal(false);
        setOrderHistory([]);
    };

    useEffect(() => {
        if (hoaDonId) {
            const fetchReturnHistory = async () => {
                try {
                    const response = await axios.get(`http://localhost:8080/api/tra-hang/hoa-don/${hoaDonId}`);
                    setReturnHistory(response.data);
                } catch (error) {
                    console.error('Lỗi khi lấy lịch sử trả hàng:', error);
                    swal('Lỗi!', 'Không thể lấy lịch sử trả hàng', 'error');
                }
            };
            fetchReturnHistory();
            fetchPreOrders();

            // Kết nối WebSocket
            const socket = new SockJS('http://localhost:8080/ws');
            const client = Stomp.over(socket);
            client.connect({}, () => {
                client.subscribe(`/user/${orderData.taiKhoan?.id}/queue/notifications`, (message) => {
                    const notification = JSON.parse(message.body);
                    swal('Thông báo', notification.noiDung, 'info');
                    fetchPreOrders();
                    fetchBillDetails(hoaDonId);
                });
            });
            setStompClient(client);

            return () => {
                if (client) client.disconnect();
            };
        }
    }, [hoaDonId, orderData.taiKhoan?.id]);

    useEffect(() => {
        setIsOrderInTransit(currentOrderStatus === 3);
    }, [currentOrderStatus]);

    useEffect(() => {
        if (orderData.id) {
            setHoaDonId(orderData.id);
        }
    }, [orderData.id]);

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

    useEffect(() => {
        if (orderData.voucher) {
            setDiscountCode(orderData.voucher.ma);
            setDiscountPercent(orderData.voucher.giaTri);
        }
    }, [orderData]);

    const handleConfirmAddProduct = async (selectedProduct, quantity) => {
        if (!selectedProduct || !orderData.id) {
            swal('Lỗi', 'Vui lòng chọn sản phẩm và hóa đơn', 'error');
            return;
        }

        try {
            const response = await axios.post('http://localhost:8080/api/hoa-don-ct/add-to-bill', {
                idHoaDon: orderData.id,
                idSanPhamCT: selectedProduct.id,
                soLuong: quantity,
            });

            if (response.status === 200) {
                if (response.data.trangThai === 9) {
                    swal({
                        title: 'Sản phẩm tạm hết hàng',
                        text: 'Sản phẩm này hiện không đủ hàng. Yêu cầu đặt trước đã được ghi nhận.',
                        icon: 'warning',
                        button: 'OK',
                    });
                    fetchPreOrders();
                } else {
                    swal('Thành công!', 'Thêm sản phẩm vào hóa đơn thành công', 'success');
                }
                setShowProductModal(false);
                fetchBillDetails(orderData.id);
            }
        } catch (error) {
            console.error('Lỗi khi thêm sản phẩm:', error);
            if (error.response?.data === 'Sản phẩm tạm hết hàng. Đã tạo yêu cầu đặt trước.') {
                swal({
                    title: 'Sản phẩm tạm hết hàng',
                    text: 'Yêu cầu đặt trước đã được ghi nhận. Vui lòng nhập thêm hàng.',
                    icon: 'warning',
                    button: 'OK',
                });
                fetchPreOrders();
            } else {
                swal('Lỗi', error.response?.data || 'Không thể thêm sản phẩm', 'error');
            }
        }
    };

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
            swal('Lỗi!', 'Không thể cập nhật số lượng', 'error');
        }
    };

    const handleQuantityChange = async (delta, orderDetailId) => {
        const currentItem = orderDetailDatas.find((item) => item.id === orderDetailId);
        const newQuantity = Math.max(1, currentItem.soLuong + delta);
        await updateQuantity(orderDetailId, newQuantity);
    };

    const handleOpenProductModal = () => {
        setShowProductModal(true);
    };

    const handleCloseProductModal = () => {
        setShowProductModal(false);
    };

    const handleOpenImportModal = (productId) => {
        setSelectedProductId(productId);
        setImportQuantity(1);
        setShowImportModal(true);
    };

    const handleCloseImportModal = () => {
        setShowImportModal(false);
        setSelectedProductId(null);
        setImportQuantity(1);
    };

    const handleConfirmImport = async () => {
        if (importQuantity <= 0) {
            swal('Lỗi', 'Số lượng nhập hàng phải lớn hơn 0', 'error');
            return;
        }
        try {
            await axios.post('http://localhost:8080/api/hoa-don/import-stock', {
                sanPhamCTId: selectedProductId,
                quantity: importQuantity,
            });
            // Gửi thông báo đến người dùng khi nhập hàng thành công
            const userNotification = {
                khachHang: {
                    id: orderData.taiKhoan.id,
                },
                tieuDe: 'Cập nhật trạng thái nhập hàng',
                noiDung: `Sản phẩm trong đơn hàng #${hoaDonId} đã được nhập hàng. Vui lòng kiểm tra đơn hàng.`,
                idRedirect: `/user/hoa-don/${hoaDonId}`,
                kieuThongBao: 'success',
                trangThai: 0,
            };
            try {
                await axios.post('http://localhost:8080/api/thong-bao', userNotification, {
                    headers: { 'Content-Type': 'application/json' },
                });
                if (stompClient) {
                    stompClient.send(
                        `/app/user/${orderData.taiKhoan?.id}/notifications`,
                        {},
                        JSON.stringify(userNotification),
                    );
                }
            } catch (notificationError) {
                console.error('Lỗi khi gửi thông báo đến người dùng:', notificationError);
                swal('Cảnh báo', 'Không thể gửi thông báo đến người dùng.', 'warning');
            }
            swal('Thành công', 'Nhập hàng thành công!', 'success');
            fetchBillDetails(hoaDonId);
            fetchPreOrders();
            handleCloseImportModal();
        } catch (error) {
            console.error('Lỗi khi nhập hàng:', error);
            swal('Lỗi', error.response?.data || 'Không thể nhập hàng', 'error');
        }
    };

    const handleUpdateDeliveryInfo = async (deliveryInfo) => {
        try {
            const response = await axios.put(
                `http://localhost:8080/api/hoa-don/${orderData.id}/delivery-info`,
                deliveryInfo,
                {
                    headers: { 'Content-Type': 'application/json' },
                },
            );

            if (response.status === 200) {
                // Cập nhật orderData với thông tin mới
                Object.assign(orderData, deliveryInfo);

                swal('Thành công', 'Cập nhật thông tin người nhận thành công!', 'success');
            }
        } catch (error) {
            console.error('Lỗi khi cập nhật thông tin giao hàng:', error);
            swal('Lỗi', error.response?.data || 'Không thể cập nhật thông tin giao hàng', 'error');
            throw error; // Re-throw để OrderInfo có thể handle
        }
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
            case 9:
                return { label: 'Chờ nhập hàng', color: 'bg-orange-200 text-orange-800' };
            default:
                return { label: 'Không xác định', color: 'bg-gray-200 text-gray-800' };
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
            case 9:
                return { label: 'Chờ nhập hàng', color: '#ff9800', icon: AlertCircle };
            default:
                return { label: 'Không xác định', color: '#f54278', icon: AlertCircle };
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

    const getActionButtonText = (status) => {
        switch (status) {
            case 1:
                return 'Xác nhận đơn hàng';
            case 2:
                return 'Xác nhận giao hàng';
            case 3:
                return 'Xác nhận lấy hàng';
            case 4:
                return 'Thanh toán';
            case 5:
                return 'Hoàn thành';
            case 6:
                return 'Đơn hàng đã hoàn thành';
            case 7:
                return 'Đơn hàng đã hủy';
            case 8:
                return 'Đơn hàng đã trả';
            case 9:
                return 'Nhập hàng';
            default:
                return 'Không xác định';
        }
    };

    const updateOrderStatus = async (newStatus) => {
        try {
            const response = await fetch(`http://localhost:8080/api/hoa-don/${hoaDonId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newStatus),
            });
            if (!response.ok) {
                throw new Error('Không thể cập nhật trạng thái hóa đơn');
            }
            setCurrentOrderStatus(newStatus);

            // Gửi thông báo đến người dùng
            const userNotification = {
                khachHang: {
                    id: orderData.taiKhoan.id,
                },
                tieuDe: 'Cập nhật trạng thái đơn hàng',
                noiDung: `Đơn hàng #${hoaDonId} đã được cập nhật sang trạng thái: ${getStatusLabel(newStatus).label}`,
                // idRedirect: `/user/hoa-don/${hoaDonId}`,
                kieuThongBao: newStatus === 7 ? 'error' : newStatus === 8 ? 'warning' : 'info',
                trangThai: 0,
            };
            try {
                await axios.post('http://localhost:8080/api/thong-bao', userNotification, {
                    headers: { 'Content-Type': 'application/json' },
                });
                if (stompClient) {
                    stompClient.send(
                        `/app/user/${orderData.taiKhoan.id}/notifications`,
                        {},
                        JSON.stringify(userNotification),
                    );
                }
            } catch (notificationError) {
                console.error('Lỗi khi gửi thông báo đến người dùng:', notificationError);
                swal('Cảnh báo', 'Không thể gửi thông báo đến người dùng.', 'warning');
            }

            if (newStatus === 8) {
                const response = await axios.get(`http://localhost:8080/api/tra-hang/hoa-don/${hoaDonId}`);
                setReturnHistory(response.data);
            }
        } catch (error) {
            console.error('Error updating order status:', error);
            swal('Lỗi!', 'Không thể cập nhật trạng thái đơn hàng', 'error');
        }
    };

    const handleActionButtonClick = () => {
        if (currentOrderStatus === 3) {
            updateOrderStatus(4);
        } else if (currentOrderStatus === 4) {
            setIsModalOpen(true);
        } else if (currentOrderStatus === 9) {
            setShowImportModal(true);
        } else if (currentOrderStatus < 7) {
            updateOrderStatus(currentOrderStatus + 1);
        }
    };

    const calculateChange = () => {
        return customerMoney - total;
    };

    const handleSave = async () => {
        try {
            const newPayment = {
                hoaDon: { id: hoaDonId },
                taiKhoan: { id: orderData.taiKhoan?.id || 1 },
                ma: `PT-${Date.now()}`,
                tongTien: total,
                phuongThucThanhToan: paymentMethod,
                ghiChu: note,
                trangThai: 1,
                ngayTao: new Date().toISOString(),
            };

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

            await updateOrderStatus(5);
            setIsModalOpen(false);
            const savedPayment = await response.json();
            setCheckOuts((prev) => [...prev, savedPayment]);
            swal('Thành công!', 'Lưu thanh toán thành công', 'success');
        } catch (error) {
            console.error('Error saving payment:', error);
            swal('Lỗi!', 'Không thể thêm thanh toán', 'error');
        }
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
        if (status === 9) {
            return 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700';
        }
        return 'text-blue-600 border-2 border-blue-300 hover:bg-blue-50';
    };

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
            let completed = currentStatus > step;
            let current = currentStatus === step;
            let time = new Date(baseTime.getTime() + timeOffsets[i]).toLocaleString('vi-VN');
            if (step === 6 && currentStatus < 6) {
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

    const totalSteps = timeline.length;
    const currentStepIndex = ORDER_STEPS.indexOf(ORDER_STEPS.find((s) => s === currentOrderStatus));
    let progressPercentage = 0;
    if (currentStepIndex !== -1) {
        progressPercentage = ((currentStepIndex + 1) / totalSteps) * 100;
    } else if (currentOrderStatus === 6) {
        progressPercentage = 100;
    }

    const handleCancelOrder = async () => {
        try {
            await updateOrderStatus(7);
            swal('Thành công!', 'Đơn hàng đã được hủy!', 'success');
        } catch (error) {
            console.error('Error canceling order:', error);
            swal('Lỗi!', 'Không thể hủy đơn hàng', 'error');
        }
    };

    const handleApproveReturn = async (traHangId) => {
        const isConfirmed = await swal({
            title: 'Xác nhận duyệt trả hàng',
            text: 'Bạn có chắc chắn muốn duyệt yêu cầu trả hàng này?',
            icon: 'warning',
            buttons: ['Hủy', 'Xác nhận'],
            dangerMode: true,
        });

        if (isConfirmed) {
            try {
                await axios.put(`http://localhost:8080/api/hoa-don-ct/return/${traHangId}/approve`);
                const response = await axios.get(`http://localhost:8080/api/tra-hang/hoa-don/${hoaDonId}`);
                setReturnHistory(response.data);
                const fetchResponse = await axios.get(`http://localhost:8080/api/hoa-don-ct/hoa-don/${hoaDonId}`);
                setOrderDetailDatas(fetchResponse.data);
                const hoaDonResponse = await axios.get(`http://localhost:8080/api/hoa-don/${hoaDonId}`);
                setCurrentOrderStatus(hoaDonResponse.data.trangThai);
                // Gửi thông báo đến người dùng khi duyệt trả hàng
                const userNotification = {
                    khachHang: {
                        id: orderData.taiKhoan.id,
                    },
                    tieuDe: 'Yêu cầu trả hàng được duyệt',
                    noiDung: `Yêu cầu trả hàng cho đơn hàng #${hoaDonId} đã được duyệt.`,
                    idRedirect: `/user/hoa-don/${hoaDonId}`,
                    kieuThongBao: 'success',
                    trangThai: 0,
                };
                try {
                    await axios.post('http://localhost:8080/api/thong-bao', userNotification, {
                        headers: { 'Content-Type': 'application/json' },
                    });
                    if (stompClient) {
                        stompClient.send(
                            `/app/user/${orderData.taiKhoan?.id}/notifications`,
                            {},
                            JSON.stringify(userNotification),
                        );
                    }
                } catch (notificationError) {
                    console.error('Lỗi khi gửi thông báo đến người dùng:', notificationError);
                    swal('Cảnh báo', 'Không thể gửi thông báo đến người dùng.', 'warning');
                }
                swal('Thành công!', 'Yêu cầu trả hàng đã được duyệt', 'success');
            } catch (error) {
                console.error('Lỗi khi duyệt yêu cầu trả hàng:', error);
                swal('Lỗi!', error.response?.data?.message || 'Không thể duyệt yêu cầu trả hàng', 'error');
            }
        }
    };

    const handleRejectReturn = async (traHangId) => {
        const isConfirmed = await swal({
            title: 'Xác nhận từ chối trả hàng',
            text: 'Bạn có chắc chắn muốn từ chối yêu cầu trả hàng này?',
            icon: 'warning',
            buttons: ['Hủy', 'Xác nhận'],
            dangerMode: true,
        });

        if (isConfirmed) {
            try {
                await axios.put(`http://localhost:8080/api/hoa-don-ct/return/${traHangId}/reject`);
                const response = await axios.get(`http://localhost:8080/api/tra-hang/hoa-don/${hoaDonId}`);
                setReturnHistory(response.data);
                // Gửi thông báo đến người dùng khi từ chối trả hàng
                const userNotification = {
                    khachHang: {
                        id: orderData.taiKhoan.id,
                    },
                    tieuDe: 'Yêu cầu trả hàng bị từ chối',
                    noiDung: `Yêu cầu trả hàng cho đơn hàng #${hoaDonId} đã bị từ chối.`,
                    idRedirect: `/user/hoa-don/${hoaDonId}`,
                    kieuThongBao: 'error',
                    trangThai: 0,
                };
                try {
                    await axios.post('http://localhost:8080/api/thong-bao', userNotification, {
                        headers: { 'Content-Type': 'application/json' },
                    });
                    if (stompClient) {
                        stompClient.send(
                            `/app/user/${orderData.taiKhoan?.id}/notifications`,
                            {},
                            JSON.stringify(userNotification),
                        );
                    }
                } catch (notificationError) {
                    console.error('Lỗi khi gửi thông báo đến người dùng:', notificationError);
                    swal('Cảnh báo', 'Không thể gửi thông báo đến người dùng.', 'warning');
                }
                swal('Thành công!', 'Yêu cầu trả hàng đã bị từ chối', 'success');
            } catch (error) {
                console.error('Lỗi khi từ chối yêu cầu trả hàng:', error);
                swal('Lỗi!', error.response?.data?.message || 'Không thể từ chối yêu cầu trả hàng', 'error');
            }
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
                    handleShowHistoryModal={handleShowHistoryModal}
                />
            </div>

            {/* Quản lý kho hàng - chỉ hiển thị cho admin */}
            <div className="max-w-5xl mx-auto mt-8">
                <KhoHangManagement
                    hoaDon={orderData}
                    onRestoreComplete={() => {
                        // Refresh dữ liệu sau khi hoàn kho
                        fetchBillDetails(hoaDonId);
                    }}
                    currentOrderStatus={currentOrderStatus}
                />
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 max-w-5xl mx-auto mt-8">
                <OrderInfo
                    orderData={orderData}
                    currentOrderStatus={currentOrderStatus}
                    checkOut={checkOut}
                    getInvoiceTypeStyle={getInvoiceTypeStyle}
                    getStatusLabel={getStatusLabel}
                    getStatusStyle={getStatusStyle}
                    getStatus={getStatus}
                    onUpdateDeliveryInfo={handleUpdateDeliveryInfo}
                />
                <ProductList
                    orderDetailDatas={orderDetailDatas}
                    handleOpenProductModal={handleOpenProductModal}
                    handleQuantityChange={handleQuantityChange}
                    isLiked={isLiked}
                    setIsLiked={setIsLiked}
                    isOrderInTransit={isOrderInTransit}
                    setOrderDetailDatas={setOrderDetailDatas}
                    hoaDonId={hoaDonId}
                    setReturnHistory={setReturnHistory}
                    currentOrderStatus={currentOrderStatus}
                />
                {/* {preOrders.length > 0 && (
                    <div className="p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Danh sách đặt trước</h2>
                        <div className="space-y-4">
                            {preOrders.map((preOrder) => (
                                <div
                                    key={preOrder.id}
                                    className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200"
                                >
                                    <p className="text-sm text-gray-600">
                                        <span className="font-medium">Sản phẩm:</span>{' '}
                                        {preOrder.sanPhamCT?.sanPham?.ten}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        <span className="font-medium">Số lượng đặt trước:</span> {preOrder.soLuong}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        <span className="font-medium">Trạng thái:</span>{' '}
                                        <span
                                            className={`px-2 py-1 rounded-full ${
                                                preOrder.trangThai === 0
                                                    ? 'bg-orange-200 text-orange-800'
                                                    : 'bg-green-200 text-green-800'
                                            }`}
                                        >
                                            {preOrder.trangThai === 0 ? 'Chờ nhập hàng' : 'Đã nhập hàng'}
                                        </span>
                                    </p>
                                    {preOrder.trangThai === 0 && (
                                        <button
                                            onClick={() => handleOpenImportModal(preOrder.sanPhamCT.id)}
                                            className="mt-2 px-3 py-1 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors"
                                        >
                                            Nhập hàng
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )} */}
                {returnHistory.length > 0 && (
                    <div className="p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Lịch sử trả hàng</h2>
                        <div className="space-y-4">
                            {returnHistory.map((returnItem) => (
                                <div
                                    key={returnItem.id}
                                    className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200"
                                >
                                    <p className="text-sm text-gray-600">
                                        <span className="font-medium">Sản phẩm:</span>{' '}
                                        {returnItem.hoaDonCT.sanPhamCT.ten}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        <span className="font-medium">Số lượng trả:</span> {returnItem.soLuong}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        <span className="font-medium">Lý do:</span> {returnItem.lyDo || 'Không có'}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        <span className="font-medium">Ngày trả:</span>{' '}
                                        {new Date(returnItem.ngayTao).toLocaleString('vi-VN')}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        <span className="font-medium">Trạng thái:</span>{' '}
                                        <span
                                            className={`px-2 py-1 rounded-full ${
                                                returnItem.trangThai === 0
                                                    ? 'bg-yellow-200 text-yellow-800'
                                                    : returnItem.trangThai === 1
                                                      ? 'bg-green-200 text-green-800'
                                                      : 'bg-red-200 text-red-800'
                                            }`}
                                        >
                                            {returnItem.trangThai === 0
                                                ? 'Chờ duyệt'
                                                : returnItem.trangThai === 1
                                                  ? 'Đã duyệt'
                                                  : 'Từ chối'}
                                        </span>
                                    </p>
                                    {returnItem.trangThai === 0 && (
                                        <div className="flex space-x-2 mt-2">
                                            <button
                                                onClick={() => handleApproveReturn(returnItem.id)}
                                                className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                                            >
                                                Duyệt
                                            </button>
                                            <button
                                                onClick={() => handleRejectReturn(returnItem.id)}
                                                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                                            >
                                                Từ chối
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            {showProductModal && (
                <ProductModal
                    showProductModal={showProductModal}
                    handleCloseProductModal={handleCloseProductModal}
                    selectedBill={orderData}
                    fetchBillDetails={fetchBillDetails}
                    handleConfirmAddProduct={handleConfirmAddProduct}
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
            {showImportModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-lg font-semibold mb-4">Nhập hàng</h2>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Số lượng nhập</label>
                            <input
                                type="number"
                                value={importQuantity}
                                onChange={(e) => setImportQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-sm"
                                min="1"
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={handleCloseImportModal}
                                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleConfirmImport}
                                className="bg-orange-500 text-white px-4 py-2 rounded-md text-sm hover:bg-orange-600"
                            >
                                Xác nhận
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal hiển thị lịch sử đơn hàng */}
            {showHistoryModal && (
                <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
                        onClick={handleCloseHistoryModal}
                    />

                    {/* Modal Container */}
                    <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[85vh] overflow-hidden">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="bg-white/20 p-2 rounded-lg">
                                        <Clock className="w-6 h-6" />
                                    </div>
                                    <h2 className="text-xl font-bold">Lịch sử đơn hàng #{orderData.ma}</h2>
                                </div>
                                <button
                                    onClick={handleCloseHistoryModal}
                                    className="p-2 hover:bg-white/20 rounded-lg transition-colors duration-200"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-4 overflow-y-auto max-h-[calc(85vh-120px)]">
                            {loadingHistory ? (
                                <div className="flex items-center justify-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                    <span className="ml-3 text-gray-600">Đang tải lịch sử...</span>
                                </div>
                            ) : orderHistory.length > 0 ? (
                                <div className="space-y-4">
                                    {orderHistory.map((history, index) => (
                                        <div
                                            key={history.id}
                                            className="bg-gray-50 rounded-xl p-4 border-l-4 border-blue-500 hover:bg-gray-100 transition-colors duration-200"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-2 mb-2">
                                                        <span className="text-sm font-semibold text-gray-500">
                                                            #{index + 1}
                                                        </span>
                                                        <span className="text-sm text-gray-400">•</span>
                                                        <span className="text-sm text-gray-600">
                                                            {new Date(history.ngayTao).toLocaleString('vi-VN', {
                                                                year: 'numeric',
                                                                month: '2-digit',
                                                                day: '2-digit',
                                                                hour: '2-digit',
                                                                minute: '2-digit',
                                                            })}
                                                        </span>
                                                    </div>
                                                    <p className="text-gray-800 mb-2">{history.moTa}</p>
                                                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                                                        <span>
                                                            Người thực hiện: {history.user?.hoTen || 'Hệ thống'}
                                                        </span>
                                                        <span
                                                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                                history.trangThai === 1
                                                                    ? 'bg-green-100 text-green-800'
                                                                    : 'bg-gray-100 text-gray-800'
                                                            }`}
                                                        >
                                                            {history.trangThai === 1 ? 'Hoạt động' : 'Không hoạt động'}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center text-blue-600">
                                                    <Clock className="w-4 h-4" />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-600 mb-2">Chưa có lịch sử</h3>
                                    <p className="text-gray-500">Đơn hàng này chưa có thông tin lịch sử nào.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default OrderStatus;
