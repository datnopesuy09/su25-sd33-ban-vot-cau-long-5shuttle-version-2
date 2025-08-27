import React, { useEffect, useState } from 'react';
import { Box, TextField, Typography, Paper, Button, Grid, Tabs, Tab, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import axios from 'axios';
import dayjs from 'dayjs';

import { useUserAuth } from '../../../contexts/userAuthContext';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const tabs = ['Tất cả', 'Chờ xác nhận', 'Chờ giao hàng', 'Đang vận chuyển', 'Hoàn thành', 'Đã hủy', 'Trả hàng'];

const tabStatusMap = {
    'Tất cả': null,
    'Chờ xác nhận': [1],
    'Chờ giao hàng': [2],
    'Đang vận chuyển': [3, 4],
    'Hoàn thành': [6],
    'Đã hủy': [7],
    'Trả hàng': [8],
};

const statusMap = {
    1: { label: 'Chờ xác nhận', color: 'bg-yellow-100 text-yellow-800' },
    2: { label: 'Chờ giao hàng', color: 'bg-blue-100 text-blue-800' },
    3: { label: 'Đang vận chuyển', color: 'bg-purple-100 text-purple-800' },
    4: { label: 'Đã giao hàng', color: 'bg-gray-200 text-green-800' },
    // 5: { label: 'Đã thanh toán', color: 'bg-teal-100 text-teal-800' },
    6: { label: 'Hoàn thành', color: 'bg-pink-100 text-gray-800' },
    7: { label: 'Đã hủy', color: 'bg-red-200 text-red-800' },
    8: { label: 'Trả hàng', color: 'bg-red-400 text-white' },
    // 9: { label: 'Chờ nhập hàng', color: 'bg-orange-200 text-orange-800' },
};

const getStatus = (status) => statusMap[status]?.label || 'Không xác định';
const getStatusStyle = (status) => statusMap[status]?.color || 'bg-gray-100 text-gray-600';

const formatCurrency = (value) => value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

function UserOrder() {
    const [selectedTab, setSelectedTab] = useState('Tất cả');
    const [listHoaDon, setListHoaDon] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const { isLoggedIn } = useUserAuth();

    useEffect(() => {
        const socket = new SockJS('http://localhost:8080/ws');
        const stompClient = new Client({
            webSocketFactory: () => socket,
            reconnectDelay: 5000,
            onConnect: () => {
                stompClient.subscribe('/topic/orders', (message) => {
                    const update = JSON.parse(message.body);
                    setListHoaDon((prev) =>
                        prev.map((order) =>
                            order.id === update.orderId ? { ...order, trangThai: update.status } : order,
                        ),
                    );
                });
            },
        });

        stompClient.activate();

        return () => {
            stompClient.deactivate();
        };
    }, []);

    const filteredBills = listHoaDon.filter((bill) => {
        const validStatuses = tabStatusMap[selectedTab];
        const matchTab = !validStatuses ? bill.trangThai !== 5 : validStatuses.includes(bill.trangThai);
        const matchSearch = bill.ma.toLowerCase().includes(searchTerm.toLowerCase());
        return matchTab && matchSearch;
    });

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const token = localStorage.getItem('userToken');
                if (!token) return;

                const headers = { Authorization: `Bearer ${token}` };
                const res = await axios.get('http://localhost:8080/users/myOrders', { headers });
                const bills = res.data.result;

                const detailedBills = await Promise.all(
                    bills.map(async (bill) => {
                        try {
                            const detailRes = await axios.get(`http://localhost:8080/users/myOderDetail/${bill.id}`, {
                                headers,
                            });
                            const chiTiet = detailRes.data.result;
                            const firstItem = chiTiet?.[0];

                            return {
                                ...bill,
                                tenSanPhamDaiDien: firstItem?.sanPhamCT?.sanPham?.ten || 'Sản phẩm',
                                giaBan: firstItem?.giaBan || 1,
                                giaKhuyenMai: firstItem?.sanPhamCT?.giaKhuyenMai || null,
                                hinhAnhDaiDien: firstItem?.sanPhamCT?.hinhAnh || '',
                                ngayTao: firstItem?.hoaDon?.ngayTao || bill.ngayTao,
                            };
                        } catch {
                            return bill;
                        }
                    }),
                );

                setListHoaDon(detailedBills);
                console.log('detail: ', detailedBills);
            } catch (error) {
                console.error('Lỗi khi lấy đơn hàng:', error);
                toast.error('Không thể lấy đơn hàng');
            }
        };

        if (isLoggedIn) fetchOrders();
    }, [isLoggedIn]);

    return (
        <Box>
            {/* Tabs */}
            <Tabs
                value={tabs.indexOf(selectedTab)}
                onChange={(e, newValue) => setSelectedTab(tabs[newValue])}
                sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
            >
                {tabs.map((tab) => (
                    <Tab
                        key={tab}
                        label={tab}
                        sx={{
                            fontSize: '14px',
                            color: selectedTab === tab ? 'primary.main' : 'text.primary',
                        }}
                    />
                ))}
            </Tabs>

            {/* Search */}
            <TextField
                placeholder="Tìm theo mã đơn hàng"
                fullWidth
                size="small"
                variant="outlined"
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon color="action" />
                        </InputAdornment>
                    ),
                }}
                onChange={(e) => {
                    const value = e.target.value;
                    const specialCharsRegex = /[!@#\$%\^&*\(\),.?":{}|<>[\]]/;
                    if (specialCharsRegex.test(value)) {
                        toast.warning('Không được chứa ký tự đặc biệt');
                        return;
                    }
                    setSearchTerm(value);
                }}
                sx={{ mb: 2 }}
            />

            {/* Danh sách đơn */}
            <Box>
                {filteredBills.length > 0 ? (
                    filteredBills.map((item) => (
                        <Paper key={item.id} variant="outlined" sx={{ p: 2, mb: 2 }}>
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Typography fontWeight={600} fontSize={14}>
                                    {item.ma}
                                </Typography>
                                <Box className={`px-2 py-1 text-sm rounded ${getStatusStyle(item.trangThai)}`}>
                                    {getStatus(item.trangThai)}
                                </Box>
                            </Box>

                            <Grid container spacing={1} mt={1}>
                                <Grid item xs={3}>
                                    <img
                                        src={item.hinhAnhDaiDien || 'https://via.placeholder.com/80'}
                                        alt="ảnh sản phẩm"
                                        style={{ width: '100%', borderRadius: 4 }}
                                    />
                                </Grid>
                                <Grid item xs={9}>
                                    <Typography noWrap fontWeight={500}>
                                        {item.tenSanPhamDaiDien}
                                    </Typography>
                                    {item.giaKhuyenMai ? (
                                        <>
                                            <Typography
                                                sx={{ textDecoration: 'line-through', fontSize: 13, color: '#888' }}
                                            >
                                                {formatCurrency(item.giaBan)}
                                            </Typography>
                                            <Typography color="error">{formatCurrency(item.giaKhuyenMai)}</Typography>
                                        </>
                                    ) : (
                                        <Typography>{formatCurrency(item.giaBan)}</Typography>
                                    )}
                                </Grid>
                            </Grid>

                            <Grid container justifyContent="space-between" alignItems="center" mt={2}>
                                <Grid item xs={12} md={6}>
                                    <Typography fontSize={13}>
                                        Ngày đặt: {dayjs(item.ngayTao).format('DD/MM/YYYY HH:mm')}
                                    </Typography>
                                    <Button
                                        size="small"
                                        variant="outlined"
                                        component={Link}
                                        to={`/profile/order-detail/${item.id}`}
                                        sx={{ mt: 1, textTransform: 'none' }}
                                    >
                                        Xem chi tiết
                                    </Button>
                                </Grid>
                                <Grid item xs={12} md={6} textAlign={{ xs: 'left', md: 'right' }}>
                                    <Typography fontSize={13}>Phí ship: {formatCurrency(item.phiShip || 0)}</Typography>
                                    <Typography fontWeight={600}>
                                        Tổng tiền: <span style={{ color: 'red' }}>{formatCurrency(item.tongTien)}</span>
                                    </Typography>
                                </Grid>
                            </Grid>
                        </Paper>
                    ))
                ) : (
                    <Box textAlign="center" mt={4}>
                        <Typography color="text.secondary">Chưa có đơn hàng nào</Typography>
                    </Box>
                )}
            </Box>
        </Box>
    );
}

export default UserOrder;
