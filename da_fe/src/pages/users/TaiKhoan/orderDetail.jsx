import React, { useEffect, useState } from 'react';
import {
    Box, Typography, Paper, Button, Stack, Avatar, Grid,
    Divider
} from '@mui/material';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import numeral from 'numeral';
import swal from 'sweetalert';
import { toast } from 'react-toastify';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
dayjs.extend(isSameOrBefore);
import ModalReturn from './modalReturn';

function OrderDetail() {
    const { id } = useParams();
    const [billDetail, setBillDetail] = useState([]);
    const [voucher, setVoucher] = useState(null);
    const [openReturnModal, setOpenReturnModal] = useState(false);
    const navigate = useNavigate();

    const formatCurrency = (money) => numeral(money).format('0,0') + ' ₫';

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

    useEffect(() => {
        if (id) fetchData();
    }, [id]);

    useEffect(() => {
        const socket = new SockJS('http://localhost:8080/ws');
        const stompClient = new Client({
            webSocketFactory: () => socket,
            reconnectDelay: 5000,
            onConnect: () => {
                stompClient.subscribe('/topic/orders', (message) => {
                    const update = JSON.parse(message.body);
                    if (update.orderId === Number(id)) {
                        fetchData();
                    }
                });
            },
        });

        stompClient.activate();

        return () => {
            stompClient.deactivate();
        };
    }, [id]);

    const handleHuyDonHang = (hoaDonId) => {
        swal({
            title: 'Xác nhận hủy đơn hàng?',
            text: 'Bạn chắc chắn muốn hủy đơn hàng này?',
            icon: 'warning',
            buttons: { cancel: 'Hủy', confirm: 'Xác nhận' },
        }).then(async (willConfirm) => {
            if (willConfirm) {
                try {
                    const token = localStorage.getItem('userToken');
                    await axios.put(
                        `http://localhost:8080/users/myOrders/${hoaDonId}/status`,
                        7, // Trạng thái "Đã hủy"
                        {
                            headers: {
                                'Content-Type': 'application/json',
                                Authorization: `Bearer ${token}`,
                            },
                        },
                    );
                    toast.success('Đã hủy đơn hàng thành công');
                    fetchData();
                } catch (error) {
                    console.error(error);
                    swal('Thất bại!', 'Hủy đơn hàng thất bại', 'error');
                }
            }
        });
    };

    const isReturnAllowed = () => {
        if (!hoaDon) return false;
        const returnableStatuses = [4, 6]; // Đã giao hoặc hoàn thành
        const daysAllowed = 7;

        return (
            returnableStatuses.includes(hoaDon.trangThai) && dayjs().diff(dayjs(hoaDon.ngayTao), 'day') <= daysAllowed
        );
    };

    const totalAmount = billDetail.reduce((total, item) => {
        const price = item.giaKhuyenMai || item.giaBan;
        return total + price * item.soLuong;
    }, 0);

    const discountAmount = !voucher
        ? 0
        : voucher.kieuGiaTri === 0
            ? Math.min((totalAmount * voucher.giaTri) / 100, voucher.giaTriMax || Infinity)
            : voucher.giaTri;

    const hoaDon = billDetail[0]?.hoaDon;
    const phiShip = hoaDon?.phiShip || 0;
    const tongThanhToan = hoaDon?.tongTien || 0;

    return (
        <Box>
            <Typography variant="h6" fontWeight={600} mb={2}>
                Thông tin đơn hàng
            </Typography>

            {hoaDon && (
                <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                    <Typography sx={{ mb: 1 }}>Địa chỉ nhận hàng</Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <LocationOnIcon color="action" />
                        <Box>
                            <Typography fontWeight={400}>
                                {hoaDon.tenNguoiNhan}{' '}
                                <span variant="body2" color="text.secondary">
                                    {' '}
                                    | ({hoaDon.sdtNguoiNhan})
                                </span>
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {hoaDon.diaChiNguoiNhan}
                            </Typography>
                        </Box>
                    </Stack>
                </Paper>
            )}

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
                                Phân loại: {bill.sanPhamCT?.mauSac?.ten}, {bill.sanPhamCT?.trongLuong?.ten},{' '}
                                {bill.sanPhamCT?.doCung?.ten}
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
                    <Divider sx={{ mt: 2 }} />
                    <Box display="flex" justifyContent="flex-end">
                        <Typography > Thành tiền: <span style={{ fontWeight: 'bold' }}>{formatCurrency(tongThanhToan)}</span>
                        </Typography>
                    </Box>
                </Stack>
            </Paper>

            <Box
                position="sticky"
                bottom={0}
                left={0}
                bgcolor="#fff"
                borderTop="1px solid #eee"
                p={2}
                // display="flex"
                // justifyContent="space-between"
                // alignItems="center"
                flexWrap="wrap"
                gap={1}
            >
                <Stack>
                    <Box display="flex" justifyContent="space-between">
                        <Typography fontSize={13}>
                            Phương thức thanh toán:
                        </Typography>
                        <Typography fontSize={13}>
                            {hoaDon?.phuongThucThanhToan}
                        </Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                        <Typography fontSize={13}>
                            Thời gian đặt hàng:
                        </Typography>
                        <Typography fontSize={13}>
                            {dayjs(hoaDon?.ngayTao).format('DD/MM/YYYY HH:mm')}
                        </Typography>
                    </Box>
                    {/* <Typography fontWeight={600}>
                        Tổng thanh toán: <span style={{ color: 'red' }}>{formatCurrency(tongThanhToan)}</span>
                    </Typography> */}
                </Stack>
                <Stack direction="row" spacing={1} sx={{ mt: 2 }} justify-content="end">
                    {hoaDon?.trangThai === 1 && (
                        <Button onClick={() => handleHuyDonHang(hoaDon.id)} variant="outlined" color="error">
                            Hủy đơn hàng
                        </Button>
                    )}
                    {isReturnAllowed() && (
                        <Button
                            variant="outlined"
                            color="error"
                            onClick={() => navigate(`/profile/order-return/${hoaDon.id}`)}
                        >
                            Trả hàng/Hoàn tiền
                        </Button>
                    )}
                    <Button component={Link} to="/profile/order" variant="outlined" color="primary">
                        Trở về
                    </Button>
                </Stack>
                {/* 
                <ModalReturn open={openReturnModal} setOpen={setOpenReturnModal} setTab={() => {}} /> */}
            </Box>
        </Box>
    );
}

export default OrderDetail;
