import React, { useEffect, useState } from 'react';
import {
    Box, Typography, Paper, Button, Stack, Avatar, Grid
} from '@mui/material';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import numeral from 'numeral';
import swal from 'sweetalert';
import { toast } from 'react-toastify';
import LocationOnIcon from '@mui/icons-material/LocationOn';

function OrderDetail() {
    const { id } = useParams();
    const [billDetail, setBillDetail] = useState([]);
    const [voucher, setVoucher] = useState(null);

    const formatCurrency = (money) => numeral(money).format('0,0') + ' ₫';

    useEffect(() => {
        if (id) {
            const fetchData = async () => {
                try {
                    const token = localStorage.getItem('userToken');
                    const res = await axios.get(`http://localhost:8080/users/myOderDetail/${id}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    setBillDetail(res.data.result);
                    setVoucher(res.data.result[0]?.hoaDon?.voucher || null);
                } catch (err) {
                    toast.error('Không thể tải dữ liệu đơn hàng');
                    console.error(err);
                }
            };
            fetchData();
        }
    }, [id]);

    const handleHuyDonHang = (hoaDonId) => {
        swal({
            title: 'Xác nhận hủy đơn hàng?',
            text: 'Bạn chắc chắn muốn hủy đơn hàng này?',
            icon: 'warning',
            buttons: { cancel: 'Hủy', confirm: 'Xác nhận' },
        }).then((willConfirm) => {
            if (willConfirm) {
                axios.put(`http://localhost:8080/api/hoa-don/update-status/${hoaDonId}`, {}, {
                    headers: { 'Content-Type': 'application/json' },
                })
                    .then(() => {
                        toast.success('Đã hủy đơn hàng thành công');
                        window.location.reload();
                    })
                    .catch(() => swal('Thất bại!', 'Hủy đơn hàng thất bại', 'error'));
            }
        });
    };

    const totalAmount = billDetail.reduce((total, item) => {
        const price = item.giaKhuyenMai || item.giaBan;
        return total + price * item.soLuong;
    }, 0);

    const discountAmount = !voucher ? 0 :
        voucher.kieuGiaTri === 0
            ? Math.min((totalAmount * voucher.giaTri) / 100, voucher.giaTriMax || Infinity)
            : voucher.giaTri;

    const hoaDon = billDetail[0]?.hoaDon;
    const phiShip = hoaDon?.phiShip || 0;
    const tongThanhToan = hoaDon?.tongTien || 0;

    return (
        <Box>
            <Typography variant="h6" fontWeight={600} mb={2}>Thông tin đơn hàng</Typography>

            {/* Địa chỉ nhận hàng */}

            {hoaDon && (
                <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                    <Typography sx={{ mb: 1 }}>Địa chỉ nhận hàng</Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <LocationOnIcon color="action" />
                        <Box>
                            <Typography fontWeight={400}>
                                {hoaDon.tenNguoiNhan} <span variant="body2" color="text.secondary"> | ({hoaDon.sdtNguoiNhan})</span>
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {hoaDon.diaChiNguoiNhan}
                            </Typography>
                        </Box>
                    </Stack>
                </Paper>
            )}

            {/* Danh sách sản phẩm */}
            {billDetail.map((bill, index) => (
                <Paper key={index} variant="outlined" sx={{ p: 2, mb: 2 }}>
                    <Grid container spacing={2}>
                        <Grid item xs={3}>
                            <Avatar
                                variant="rounded"
                                src={bill.sanPhamCT?.hinhAnh || ''}
                                alt={bill.sanPhamCT?.sanPham?.ten}
                                sx={{ width: 100, height: 100 }}
                            />
                        </Grid>
                        <Grid item xs={9}>
                            <Typography fontWeight={600} noWrap>
                                {bill.sanPhamCT?.sanPham?.ten}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Phân loại: {bill.sanPhamCT?.mauSac?.ten}, {bill.sanPhamCT?.trongLuong?.ten}, {bill.sanPhamCT?.doCung?.ten}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Số lượng: {bill.soLuong}
                            </Typography>
                            <Stack direction="row" spacing={1} mt={1}>
                                {bill.giaKhuyenMai ? (
                                    <>
                                        <Typography
                                            variant="body2"
                                            sx={{ textDecoration: 'line-through', color: 'text.disabled' }}
                                        >
                                            {formatCurrency(bill.giaBan)}
                                        </Typography>
                                        <Typography color="error">{formatCurrency(bill.giaKhuyenMai)}</Typography>
                                    </>
                                ) : (
                                    <Typography>{formatCurrency(bill.giaBan)}</Typography>
                                )}
                            </Stack>
                        </Grid>
                    </Grid>
                </Paper>
            ))}

            {/* Tổng kết */}
            <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                <Stack spacing={1}>
                    <Box display="flex" justifyContent="space-between">
                        <span>Tổng tiền hàng</span>
                        <span>{formatCurrency(totalAmount)}</span>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                        <span>Phí vận chuyển</span>
                        <span>{formatCurrency(phiShip)}</span>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                        <span>Giảm giá</span>
                        <span>-{formatCurrency(discountAmount)}</span>
                    </Box>
                </Stack>
            </Paper>

            {/* Thanh toán + Nút */}
            <Box
                position="sticky"
                bottom={0}
                left={0}
                bgcolor="#fff"
                borderTop="1px solid #eee"
                p={2}
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                flexWrap="wrap"
                gap={1}
            >
                <Stack direction="row" spacing={1}>
                    {hoaDon?.trangThai === 1 && (
                        <Button
                            onClick={() => handleHuyDonHang(hoaDon.id)}
                            variant="outlined"
                            color="error"
                        >
                            Hủy đơn hàng
                        </Button>
                    )}
                    {hoaDon?.trangThai === 6 && (
                        <Button
                            // onClick={() => handleHuyDonHang(hoaDon.id)}
                            variant="outlined"
                            color="error"
                        >
                            Trả hàng/Hoàn tiền
                        </Button>
                    )}
                    <Button component={Link} to="/profile/order" variant="outlined" color="primary">
                        Trở về
                    </Button>
                </Stack>
                <Typography fontWeight={600}>
                    Tổng thanh toán: <span style={{ color: 'red' }}>{formatCurrency(tongThanhToan)}</span>
                </Typography>
            </Box>
        </Box>
    );
}

export default OrderDetail;