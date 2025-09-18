import React, { useEffect, useState } from 'react';
import PaymentModal from '../Order/PaymentModal';
import axios from 'axios';
import Swal from 'sweetalert2';
import DiscountModal from '../../users/CheckOut/DiscountModal';

const PaymentSummary = ({ total, selectedBill, setSelectedBill, updateBills }) => {
    const [remaining, setRemaining] = useState(total);
    const [voucherId, setVoucherId] = useState(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showDiscountModal, setShowDiscountModal] = useState(false);
    const [paymentInput, setPaymentInput] = useState('');
    const [isAnimating, setIsAnimating] = useState(false);
    const [note, setNote] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('Tiền mặt');
    const [customerMoney, setCustomerMoney] = useState(0);
    const [discounts, setDiscounts] = useState([]);
    const [selectedDiscount, setSelectedDiscount] = useState(null);
    const [promoDiscount, setPromoDiscount] = useState(0);

    useEffect(() => {
        setRemaining(total - customerMoney);
    }, [customerMoney, total]);

    useEffect(() => {
        fetchDiscounts();
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
        if (total < discount.dieuKienNhoNhat) {
            Swal.fire(
                'Lỗi',
                `Đơn hàng phải có tổng giá trị từ ${discount.dieuKienNhoNhat.toLocaleString()} VNĐ`,
                'error',
            );
            return;
        }

        let discountAmount = (total * discount.giaTri) / 100;
        if (discountAmount > discount.giaTriMax) {
            discountAmount = discount.giaTriMax;
            Swal.fire('Thông báo', `Giảm giá tối đa là ${discount.giaTriMax.toLocaleString()} VNĐ`, 'info');
        }

        setSelectedDiscount(discount);
        setPromoDiscount(discountAmount);
        setShowDiscountModal(false);
    };

    const handleDeselectDiscount = () => {
        setSelectedDiscount(null);
        setPromoDiscount(0);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(amount);
    };

    const handleConfirmOrder = async () => {
        const finalAmount = total - promoDiscount;

        // Allow confirmation for "Chuyển khoản" or "Tiền mặt" with customerMoney >= finalAmount or customerMoney = 0
        if (paymentMethod === 'Tiền mặt' && customerMoney > 0 && customerMoney < finalAmount) {
            Swal.fire({
                icon: 'warning',
                title: 'Cảnh báo',
                text: 'Số tiền thanh toán không đủ!',
            });
            return;
        }

        try {
            const response = await axios.post('http://localhost:8080/api/hoa-don/thanh-toan', {
                idHoaDon: selectedBill.id,
                tongTien: finalAmount,
                khachThanhToan: customerMoney || finalAmount, // Use finalAmount if customerMoney is 0
                idVoucher: selectedDiscount ? selectedDiscount.id : null,
                phuongThucThanhToan: paymentMethod,
            });
            Swal.fire({
                icon: 'success',
                title: 'Thanh toán thành công',
                text: `Hóa đơn #${response.data.ma} đã được xác nhận`,
            });
            setSelectedBill(null);
            setCustomerMoney(0);
            updateBills();
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Lỗi',
                text: error.response?.data?.message || 'Có lỗi xảy ra khi thanh toán',
            });
        }
    };

    return (
        <>
            <div className="h-115 bg-white rounded-lg shadow-sm overflow-hidden mt-[20px]">
                <div className="flex h-full">
                    {/* Customer Section */}
                    <div className="flex-1 p-6 border-r border-gray-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-semibold text-gray-800">Khách hàng</h3>
                            {/* <button className="text-[#2f19ae] text-sm border border-[#2f19ae] px-3 py-1 rounded hover:bg-purple-50 transition-colors">
                                CHỌN KHÁCH HÀNG
                            </button> */}
                        </div>

                        {/* Discount Section */}
                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-5 border border-blue-100">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-md font-semibold text-gray-800 flex items-center">
                                    <svg
                                        className="w-5 h-5 mr-2 text-blue-600"
                                        fill="none"
                                        stroke="currentColor"
                                        CMSIS
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                                        ></path>
                                    </svg>
                                    Phiếu giảm giá
                                </h4>
                                {selectedDiscount && (
                                    <button
                                        onClick={handleDeselectDiscount}
                                        className="text-red-500 hover:text-red-700 text-sm font-medium"
                                    >
                                        Xóa
                                    </button>
                                )}
                            </div>

                            {selectedDiscount ? (
                                <div className="bg-white rounded-lg p-4 mb-4 border border-green-200 shadow-sm">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                                            <div>
                                                <p className="font-medium text-gray-800">{selectedDiscount.ten}</p>
                                                <p className="text-sm text-gray-600">Mã: {selectedDiscount.ma}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-bold text-green-600">
                                                -{promoDiscount.toLocaleString()} VNĐ
                                            </p>
                                            <p className="text-sm text-gray-500">{selectedDiscount.giaTri}% giảm</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-white rounded-lg p-4 mb-4 border border-dashed border-gray-300">
                                    <div className="text-center text-gray-500">
                                        <svg
                                            className="w-8 h-8 mx-auto mb-2 text-gray-400"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                            ></path>
                                        </svg>
                                        <p className="text-sm">Chưa chọn phiếu giảm giá</p>
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={() => setShowDiscountModal(true)}
                                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                            >
                                <svg
                                    className="w-5 h-5 inline mr-2"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                    ></path>
                                </svg>
                                Chọn phiếu giảm giá
                            </button>

                            <div className="mt-4 grid grid-cols-2 gap-4">
                                <div className="bg-white rounded-lg p-3 border border-gray-200">
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Mã giảm giá</label>
                                    <div className="text-sm font-medium text-gray-800">
                                        {selectedDiscount ? selectedDiscount.ma : 'Chưa chọn'}
                                    </div>
                                </div>
                                <div className="bg-white rounded-lg p-3 border border-gray-200">
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Số tiền giảm</label>
                                    <div className="text-sm font-medium text-green-600">
                                        {promoDiscount > 0 ? `${promoDiscount.toLocaleString()} VNĐ` : '0 VNĐ'}
                                    </div>
                                </div>
                            </div>
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
                                <span className="font-medium text-green-600">
                                    -{promoDiscount.toLocaleString()} VNĐ
                                </span>
                            </div>

                            <hr className="border-gray-200 my-3" />

                            <div className="flex justify-between items-center">
                                <span className="font-semibold text-gray-800">Tổng số tiền</span>
                                <span className="font-bold text-lg text-red-600">
                                    {(total - promoDiscount).toLocaleString()} VNĐ
                                </span>
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
                total={total - promoDiscount}
                paymentMethod={paymentMethod}
                setPaymentMethod={setPaymentMethod}
                customerMoney={customerMoney}
                setCustomerMoney={setCustomerMoney}
                note={note}
                setNote={setNote}
                handleSave={handleConfirmOrder}
                isAnimating={isAnimating}
                formatCurrency={formatCurrency}
                calculateChange={() => customerMoney - (total - promoDiscount)}
            />

            {/* Discount Modal */}
            <DiscountModal
                showModal={showDiscountModal}
                setShowModal={setShowDiscountModal}
                discounts={discounts}
                selectedDiscount={selectedDiscount}
                handleSelectDiscount={handleSelectDiscount}
                handleDeselectDiscount={handleDeselectDiscount}
                totalPrice={total}
            />
        </>
    );
};

export default PaymentSummary;
