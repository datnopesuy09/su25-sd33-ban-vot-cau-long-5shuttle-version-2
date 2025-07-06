import React, { useEffect, useState } from 'react';
import PaymentModal from '../Order/PaymentModal';
import axios from 'axios';
import Swal from 'sweetalert2';
import DiscountModal from '../../users/CheckOut/DiscountModal';

const PaymentSummary = ({ total, selectedBill, setSelectedBill, updateBills }) => {
    const [remaining, setRemaining] = useState(total);
    const [voucherId, setVoucherId] = useState(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showDiscountModal, setShowDiscountModal] = useState(false); // State for discount modal
    const [paymentInput, setPaymentInput] = useState('');
    const [isAnimating, setIsAnimating] = useState(false);
    const [note, setNote] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('Tiền mặt'); // Mặc định là 'Tiền mặt'
    const [customerMoney, setCustomerMoney] = useState(0);
    const [isInsufficientFunds, setIsInsufficientFunds] = useState(false);
    const [discounts, setDiscounts] = useState([]); // State for discounts
    const [selectedDiscount, setSelectedDiscount] = useState(null); // State for selected discount
    const [promoDiscount, setPromoDiscount] = useState(0); // State for discount amount

    useEffect(() => {
        setRemaining(total - customerMoney);
    }, [customerMoney, total]);

    useEffect(() => {
        fetchDiscounts(); // Fetch discounts on component mount
    }, []);

    const fetchDiscounts = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/phieu-giam-gia/hien-thi');
            setDiscounts(response.data);
        } catch (error) {
            console.error('Lỗi khi lấy phiếu giảm giá:', error);
        }
    };

    const handleSelectDiscount = (discount) => {
        // Kiểm tra điều kiện tối thiểu
        if (total < discount.dieuKienNhoNhat) {
            Swal.fire('Lỗi', `Đơn hàng phải có tổng giá trị từ ${discount.dieuKienNhoNhat.toLocaleString()} VNĐ`, 'error');
            return;
        }

        // Tính toán giảm giá và kiểm tra giá trị tối đa
        let discountAmount = (total * discount.giaTri) / 100;

        // Đảm bảo không vượt quá giá trị tối đa
        if (discountAmount > discount.giaTriMax) {
            discountAmount = discount.giaTriMax;
            Swal.fire('Thông báo', `Giảm giá tối đa là ${discount.giaTriMax.toLocaleString()} VNĐ`, 'info');
        }

        setSelectedDiscount(discount);
        setPromoDiscount(discountAmount);
        setShowDiscountModal(false); // Đóng modal
    };

    const handleDeselectDiscount = () => {
        setSelectedDiscount(null);
        setPromoDiscount(0); // Reset the discount
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(amount);
    };

    const handleConfirmOrder = async () => {
        const finalAmount = total - promoDiscount; // Tính toán số tiền cuối cùng sau khi giảm giá

        if (customerMoney < finalAmount) {
            Swal.fire({
                icon: 'warning',
                title: 'Cảnh báo',
                text: 'Số tiền thanh toán không đủ!',
            });
            return;
        }
        try {
            const response = await axios.post('http://localhost:8080/api/hoa-don/thanh-toan', {
                idHoaDon: selectedBill.id, // Lấy từ state
                tongTien: finalAmount, // Sử dụng số tiền đã giảm
                khachThanhToan: customerMoney,
                idVoucher: selectedDiscount ? selectedDiscount.id : null, // Nếu có
                phuongThucThanhToan: paymentMethod // Hoặc từ dropdown
            });
            Swal.fire({
                icon: 'success',
                title: 'Thanh toán thành công',
                text: `Hóa đơn #${response.data.ma} đã được xác nhận`
            });
            // Reset state after successful payment
            setSelectedBill(null); // Set selectedBill to null
            setCustomerMoney(0); // Reset customer money if needed
            updateBills(); // Gọi hàm cập nhật hóa đơn từ component cha
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Lỗi',
                text: error.response?.data?.message || 'Có lỗi xảy ra khi thanh toán'
            });
        }
    };

    return (
        <>
            <div className="h-115 bg-white rounded-lg shadow-sm overflow-hidden mt-[20px]">
                <div className="flex h-full">
                    {/* Customer Section */}
                    <div className="flex-1 p-6 border-r border-gray-200">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-800">Khách hàng</h3>
                            <button className="text-[#2f19ae] text-sm border border-[#2f19ae] px-3 py-1 rounded hover:bg-purple-50 transition-colors">
                                CHỌN KHÁCH HÀNG
                            </button>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-2">Phiếu giảm giá</label>
                                <input
                                    type="text"
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Nhập phiếu giảm giá"
                                    onChange={(e) => setVoucherId(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-2">Phần trăm giảm</label>
                                <input
                                    type="text"
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    value={promoDiscount > 0 ? `${promoDiscount}%` : '0%'}
                                    disabled
                                />
                            </div>
                        </div>

                        {/* Button to open Discount Modal */}
                        <div className="mt-4">
                            <button
                                onClick={() => setShowDiscountModal(true)} // Open discount modal
                                className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition-colors"
                            >
                                Chọn phiếu giảm giá
                            </button>
                        </div>
                    </div>

                    {/* Payment Summary Section */}
                    <div className="w-96 p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Thanh toán</h3>

                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Tiền hàng</span>
                                <span className="font-medium">{total.toLocaleString()} VNĐ</span>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Phí vận chuyển</span>
                                <span className="font-medium">0 VND</span>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Giảm giá</span>
                                <span className="font-medium text-green-600">{promoDiscount.toLocaleString()} VNĐ</span>
                            </div>

                            <hr className="border-gray-200 my-3" />

                            <div className="flex justify-between items-center">
                                <span className="font-semibold text-gray-800">Tổng số tiền</span>
                                <span className="font-bold text-lg text-red-600">{(total - promoDiscount).toLocaleString()} VNĐ</span>
                            </div>

                            <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-600 mb-2">Khách thanh toán</label>
                                <button
                                    onClick={() => setShowPaymentModal(true)}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-left hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    {customerMoney > 0 ? `${customerMoney.toLocaleString()} VND` : 'Nhấn để thanh toán'}
                                </button>
                            </div>

                            <button
                                onClick={() => setShowPaymentModal(true)}
                                className="w-full bg-[#2f19ae] text-white py-3 px-4 rounded-md font-semibold hover:bg-[#2f19aed6] transition-colors mt-4"
                            >
                                XÁC NHẬN ĐẶT HÀNG
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Payment Modal */}
            <PaymentModal
                isOpen={showPaymentModal}
                handleClose={() => setShowPaymentModal(false)}
                total={total - promoDiscount} // Pass the discounted total to PaymentModal
                paymentMethod={paymentMethod}
                setPaymentMethod={setPaymentMethod}
                customerMoney={customerMoney}
                setCustomerMoney={setCustomerMoney}
                note={note}
                setNote={setNote}
                handleSave={handleConfirmOrder}
                isInsufficientFunds={isInsufficientFunds}
                isAnimating={isAnimating}
                formatCurrency={formatCurrency}
                calculateChange={() => customerMoney - (total - promoDiscount)} // Calculate change based on discounted total
            />

            {/* Discount Modal */}
            <DiscountModal
                showModal={showDiscountModal}
                setShowModal={setShowDiscountModal}
                discounts={discounts}
                selectedDiscount={selectedDiscount}
                handleSelectDiscount={handleSelectDiscount}
                handleDeselectDiscount={handleDeselectDiscount}
                totalPrice={total} // Pass total price to DiscountModal
            />
        </>
    );
};

export default PaymentSummary;
