import React, { useEffect, useState } from 'react';
import {
    Box, Typography, Paper, Button, Stack, Avatar, Grid,
    Divider, Chip
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

// Local status map (labels only) used for displaying order status
const statusMap = {
    1: { label: 'Chờ xác nhận' },
    2: { label: 'Chờ giao hàng' },
    3: { label: 'Đang vận chuyển' },
    4: { label: 'Đã giao hàng' },
    6: { label: 'Hoàn thành' },
    7: { label: 'Đã hủy' },
    8: { label: 'Trả hàng' },
    9: { label: 'Chờ nhập hàng' },
};

const getStatus = (status) => statusMap[status]?.label || 'Không xác định';

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
console.log(billDetail);
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
            {/* Header similar to order.jsx */}
            <Paper sx={{ p: 4, mb: 3, borderRadius: 3, background: 'linear-gradient(90deg, #f0f7ff 0%, #eef4ff 100%)', border: '1px solid #e6f0ff' }} elevation={0}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div style={{ background: '#e8f3ff', padding: 12, borderRadius: 12 }}>
                        <Avatar sx={{ bgcolor: '#dff2ff' }}>
                            <LocationOnIcon color="primary" />
                        </Avatar>
                    </div>
                    <div>
                        <Typography variant="h5" fontWeight={700}>Chi tiết đơn hàng</Typography>
                        <Typography color="text.secondary">Xem thông tin, trạng thái và các sản phẩm trong đơn</Typography>
                    </div>
                </div>
            </Paper>

            {/* Order meta */}
            {hoaDon && (
                <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }} elevation={1}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                        <div>
                            <Typography variant="subtitle1" fontWeight={700}>{hoaDon.ma || `#${hoaDon.id}`}</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                {hoaDon.trangThai === 7 ? `Hủy: ${dayjs(hoaDon.ngaySua).format('DD/MM/YYYY HH:mm')}` : `Đặt: ${dayjs(hoaDon.ngayTao).format('DD/MM/YYYY HH:mm')}`}
                            </Typography>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <Chip label={hoaDon?.phuongThucThanhToan || 'Chưa có phương thức'} variant="outlined" />
                            <Chip label={getStatus(hoaDon?.trangThai)} color="primary" />
                        </div>
                    </div>
                </Paper>
            )}

            {/* Address card */}
            {hoaDon && (
                <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }} elevation={0}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>Địa chỉ nhận hàng</Typography>
                    <Stack direction="row" spacing={2} alignItems="flex-start">
                        <LocationOnIcon color="action" />
                        <div>
                            <Typography fontWeight={600}>{hoaDon.tenNguoiNhan} <span style={{ color: '#666' }}>| {hoaDon.sdtNguoiNhan}</span></Typography>
                            <Typography variant="body2" color="text.secondary">{hoaDon.diaChiNguoiNhan}</Typography>
                        </div>
                    </Stack>
                </Paper>
            )}

            {/* Product list */}
            <div style={{ display: 'grid', gap: 12 }}>
                {billDetail.map((bill, index) => (
                    <Paper key={index} sx={{ p: 2.5, borderRadius: 2 }} elevation={0}>
                        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                            <Avatar
                                variant="rounded"
                                src={bill.hinhAnh || bill.hinhAnhUrl || ''}
                                alt={bill.sanPhamCT?.sanPham?.ten}
                                sx={{ width: 96, height: 96, borderRadius: 2 }}
                            />

                            <div style={{ flex: 1, minWidth: 0 }}>
                                <Typography fontWeight={700} noWrap>{bill.sanPhamCT?.sanPham?.ten}</Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }} noWrap>
                                    {`Phân loại: ${bill.sanPhamCT?.mauSac?.ten || '-'}, ${bill.sanPhamCT?.trongLuong?.ten || '-'}, ${bill.sanPhamCT?.doCung?.ten || '-'}`}
                                </Typography>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
                                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                        <Typography variant="body2" color="text.secondary">Số lượng: {bill.soLuong}</Typography>
                                    </div>

                                    <div style={{ textAlign: 'right' }}>
                                        {bill.giaKhuyenMai ? (
                                            <div>
                                                <Typography variant="body2" sx={{ textDecoration: 'line-through', color: 'gray' }}>{formatCurrency(bill.giaBan)}</Typography>
                                                <Typography color="error" fontWeight={700}>{formatCurrency(bill.giaKhuyenMai)}</Typography>
                                            </div>
                                        ) : (
                                            <Typography fontWeight={700}>{formatCurrency(bill.giaBan)}</Typography>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Paper>
                ))}
            </div>

            {/* Summary */}
            <Paper sx={{ p: 2.5, mt: 3, borderRadius: 2 }} elevation={0}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                    <div style={{ color: '#555' }}>
                        <div style={{ marginBottom: 6 }}>Tổng tiền hàng</div>
                        <div style={{ marginBottom: 6 }}>Phí vận chuyển</div>
                        <div style={{ marginBottom: 6 }}>Giảm giá</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ marginBottom: 6 }}>{formatCurrency(totalAmount)}</div>
                        <div style={{ marginBottom: 6 }}>{formatCurrency(phiShip)}</div>
                        <div style={{ marginBottom: 6 }}>-{formatCurrency(discountAmount)}</div>
                    </div>
                </div>
                <Divider sx={{ my: 2 }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div />
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 14, color: '#666' }}>Thành tiền</div>
                        <div style={{ fontSize: 20, fontWeight: 800, color: '#d32f2f' }}>{formatCurrency(tongThanhToan)}</div>
                    </div>
                </div>
            </Paper>

            {/* Sticky actions */}
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
                <div>
                    <Typography fontSize={13}>Phương thức thanh toán: <strong>{hoaDon?.phuongThucThanhToan}</strong></Typography>
                    <Typography fontSize={13}>Thời gian đặt: {dayjs(hoaDon?.ngayTao).format('DD/MM/YYYY HH:mm')}</Typography>
                </div>

                <Stack direction="row" spacing={1}>
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
                    <Button component={Link} to="/profile/order" variant="contained" color="primary">
                        Trở về
                    </Button>
                </Stack>
            </Box>
        </Box>
    );
}

export default OrderDetail;
