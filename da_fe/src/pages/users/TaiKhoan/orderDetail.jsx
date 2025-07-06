import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import './Order.css';
import axios from 'axios';
import numeral from 'numeral';
import swal from 'sweetalert';

function OrderDetail() {
    const { id } = useParams();
    const [billDetail, setBillDetail] = useState([]);
    const [voucher, setVoucher] = useState(null);

    const formatCurrency = (money) => {
        return numeral(money).format('0,0') + ' ₫'
    }

    const loadHoaDonById = (id) => {
        return axios.get(`http://localhost:8080/api/hoa-don-kh/hoa-don/${id}`)
            .then((response) => {
                console.log("ds sp", response.data)
                setBillDetail(response.data);
                // Lấy voucher từ sản phẩm đầu tiên
                if (response.data.length > 0) {
                    const firstItem = response.data[0];
                    setVoucher({
                        giaTri: firstItem.giaTriVoucher,
                        kieuGiaTri: firstItem.kieuGiaTriVoucher
                    });
                }
            })
            .catch((error) => {
                console.error("Failed to fetch orders:", error);
            })
    }

    useEffect(() => {
        loadHoaDonById(id)
    }, [id]);

    const handleHuyDonHang = (id) => {
        const title = 'Xác nhận hủy đơn hàng?';
        const text = 'Bạn chắc chắn muốn hủy đơn hàng này?';

        // Hiển thị SweetAlert để xác nhận
        swal({
            title: title,
            text: text,
            icon: 'warning',
            buttons: {
                cancel: "Hủy",
                confirm: "Xác nhận",
            },
        }).then((willConfirm) => {
            if (willConfirm) {
                // Thực hiện gọi API với axios
                axios.put(`http://localhost:8080/api/hoa-don/update-status/${id}`, {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                })
                    .then(() => {
                        swal('Thành công!', 'Hủy đơn hàng thành công', 'success');
                        loadHoaDonById(id)
                    })
                    .catch((error) => {
                        console.error("Lỗi cập nhật:", error);
                        swal('Thất bại!', 'Hủy đơn hàng thất bại', 'error');
                    });
            }
        });
    }

    // Hàm tính tổng tiền hàng gốc
    const calculateTotalPrice = () => {
        return billDetail.reduce((total, item) => {
            return total + (item.giaKhuyenMai ? item.giaKhuyenMai : item.giaBan) * item.soLuongMua;
        }, 0);
    }

    const calculateDiscountAmount = (totalAmount, voucher) => {
        if (!voucher) return 0; // Nếu không có voucher, không giảm giá

        if (voucher.kieuGiaTri === 0) { // Nếu là phần trăm
            return (totalAmount * voucher.giaTri) / 100;
        } else if (voucher.kieuGiaTri === 1) { // Nếu là tiền
            return voucher.giaTri;
        }

        return 0; // Mặc định không giảm giá
    };

    const totalAmount = calculateTotalPrice();
    const discountAmount = calculateDiscountAmount(totalAmount, voucher);

    return (
        <div>
            <h2 className="text-2xl font-semibold">Địa chỉ nhận hàng</h2>
            {billDetail.length > 0 ? (
                <div className="mt-4">
                    <p>Tên người nhận: {billDetail[0].tenNguoiNhan}</p>
                    <p>Số điện thoại: {billDetail[0].sdtNguoiNhan}</p>
                    <p>Địa chỉ: {billDetail[0].diaChiNguoiNhan}</p>
                </div>
            ) : (
                <p>Không có thông tin đơn hàng.</p>
            )}

            <h3 className="mt-6 text-xl font-semibold">Chi tiết đơn hàng</h3>
            <div className="overflow-auto max-h-96">
                {billDetail.map((bill, index) => (
                    <div key={index} className="border rounded p-4 mb-4 bg-white shadow">
                        <div className="flex">
                            <img
                                src={bill.hinhAnhLink}
                                alt="anhSanPham"
                                className="w-24 h-24 object-cover"
                            />
                            <div className="ml-4">
                                <h4 className="font-bold">{bill.sanPhamTen}</h4>
                                <p>
                                    Giá:
                                    {bill.giaKhuyenMai > 0 ? (
                                        <span>
                                            <span className="line-through">{formatCurrency(bill.giaBan)}</span>
                                            <span className="text-red-500"> {formatCurrency(bill.giaKhuyenMai)}</span>
                                        </span>
                                    ) : (
                                        formatCurrency(bill.giaBan)
                                    )}
                                </p>
                                <p>Số lượng: {bill.soLuongMua}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-4">
                <h3 className="text-lg font-semibold">Tổng kết</h3>
                {billDetail.length > 0 ? (
                    <div className="mt-4">
                        <div className="flex justify-between">
                            <span>Tổng tiền hàng:</span>
                            <span>{formatCurrency(calculateTotalPrice())}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Phí vận chuyển:</span>
                            <span>{formatCurrency(billDetail[0].phiShip)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Giảm giá:</span>
                            <span>{formatCurrency(discountAmount)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Tổng tiền phải trả:</span>
                            <span>{formatCurrency(billDetail[0].tongTien)}</span>
                        </div>
                    </div>
                ) : (
                    <p>Không có thông tin đơn hàng.</p>
                )}
            </div>


            <div className='flex justify-between items-center'>
                <Link
                    to={`/profile/order`}
                    className="mt-2 inline-block bg-indigo-500 text-white px-4 py-2 rounded-sm"
                >
                    Trở về
                </Link>
                {billDetail.length > 0 && billDetail[0].trangThai === 1 && (
                    <button onClick={() => handleHuyDonHang(billDetail[0].hoaDonId)} className="mt-2 inline-block bg-orange-400 text-white px-4 py-2 rounded-sm ml-2">
                        Hủy đơn hàng
                    </button>
                )}
            </div>
        </div>
    );
};

export default OrderDetail