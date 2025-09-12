import React, { useEffect, useState } from 'react';
import { Box, TextField, Typography, Paper, Button, Grid, Tabs, Tab, InputAdornment, Divider } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import axios from 'axios';
import dayjs from 'dayjs';

import { useUserAuth } from '../../../contexts/userAuthContext';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { red } from '@mui/material/colors';
import { redPalette } from '@mui/x-charts';

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
    9: { label: 'Chờ nhập hàng', color: 'bg-orange-200 text-orange-800' },
};

const getStatus = (status) => statusMap[status]?.label || 'Không xác định';
const getStatusStyle = (status) => statusMap[status]?.color || 'bg-gray-100 text-gray-600';

const formatCurrency = (value) => {
    const n = Number(value ?? 0);
    return n.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
};

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

                            let returnDetails = [];
                            if (bill.trangThai === 8) {
                                try {
                                    const returnRes = await axios.get(
                                        `http://localhost:8080/phieu-tra-hang/by-order/${bill.id}`,
                                        { headers },
                                    );
                                    const phieuTra = returnRes.data.result;

                                    returnDetails = phieuTra?.chiTietTraHang || []; // ✅ đúng field
                                    bill.tongTien = phieuTra?.soTienHoanLai || bill.tongTien; // nếu BE có số tiền hoàn
                                    bill.ngayTao = phieuTra?.ngayTao || bill.ngayTao; // cập nhật ngày tạo từ phiếu trả
                                    bill.ngaySua = phieuTra?.ngayXuLy || bill.ngaySua;
                                } catch (err) {
                                    console.error('Không lấy được phiếu trả hàng:', err);
                                }
                            }

                            return {
                                ...bill,
                                chiTiet,
                                returnDetails, // giữ thông tin sản phẩm hoàn trả
                                ngayTao: chiTiet?.[0]?.hoaDon?.ngayTao || null,
                                ngaySua: chiTiet?.[0]?.hoaDon?.ngaySua || null,
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
                            textTransform: 'none',
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
                        <Paper key={item.id} variant="outlined" sx={{ mb: 1 }}>
                            <Box sx={{ p: 1.5 }} display="flex" justifyContent="space-between" alignItems="center">
                                <Typography fontWeight={600} fontSize={14}>
                                    {item.ma}
                                </Typography>
                                <Box
                                    className={`px-2 py-1 text-sm rounded ${getStatusStyle(item.trangThai)}`}
                                    sx={{ textTransform: 'uppercase' }}
                                >
                                    {getStatus(item.trangThai)}
                                </Box>
                            </Box>
                            <Divider sx={{ mx: 1.5 }} />
                            <Box sx={{ px: 2, pt: 1.5 }}>
                                {(item.trangThai === 8 ? item.returnDetails : item.chiTiet)?.map((sp, idx, arr) => (
                                    <React.Fragment key={idx}>
                                        <Box
                                            display="flex"
                                            justifyContent="space-between"
                                            alignItems="center"
                                            sx={{ mb: 1 }}
                                        >
                                            <Box>
                                                <Grid container spacing={1}>
                                                    <Grid item xs={3}>
                                                        <img
                                                            src={
                                                                sp?.sanPhamCT?.hinhAnh ||
                                                                'https://via.placeholder.com/80'
                                                            }
                                                            alt="ảnh sản phẩm"
                                                            style={{ width: '100%', borderRadius: 4 }}
                                                        />
                                                    </Grid>
                                                    <Grid item xs={9}>
                                                        <Typography noWrap fontWeight={500} mb={0.5}>
                                                            {item.trangThai === 8
                                                                ? sp?.thongTinSanPhamTra?.tenSanPham
                                                                : sp?.sanPhamCT?.sanPham?.ten || 'Sản phẩm'}
                                                        </Typography>
                                                        <Typography variant="body2" color="text.secondary">
                                                            Phân loại:{' '}
                                                            {item.trangThai === 8
                                                                ? `${sp?.thongTinSanPhamTra?.tenMauSac}, ${sp?.thongTinSanPhamTra?.tenTrongLuong}, ${sp?.thongTinSanPhamTra?.tenDoCung}`
                                                                : `${sp?.sanPhamCT?.mauSac?.ten}, ${sp?.sanPhamCT?.trongLuong?.ten}, ${sp?.sanPhamCT?.doCung?.ten}`}
                                                        </Typography>
                                                        <Typography variant="body2" color="text.secondary">
                                                            x{item.trangThai === 8 ? sp.soLuongTra : sp.soLuong}
                                                        </Typography>
                                                    </Grid>
                                                </Grid>
                                            </Box>
                                            <Box ml={0}>
                                                {(() => {
                                                    const price =
                                                        item.trangThai === 8
                                                            ? sp?.thongTinSanPhamTra?.giaBan
                                                            : sp?.giaBan;

                                                    return <Typography>{formatCurrency(price)}</Typography>;
                                                })()}
                                            </Box>
                                        </Box>

                                        {idx < arr.length - 1 && <Divider sx={{ my: 1 }} />}
                                    </React.Fragment>
                                ))}
                            </Box>
                            {/* <Box sx={{ px: 2, pt: 1.5 }}>
                {item.chiTiet?.map((sp, idx) => (
                  <React.Fragment key={idx}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                      <Box>
                        <Grid container spacing={1}>
                          <Grid item sx={3}>
                            <img
                              src={sp?.sanPhamCT?.hinhAnh || 'https://via.placeholder.com/80'}
                              alt="ảnh sản phẩm"
                              style={{ width: '100%', borderRadius: 4 }}
                            />
                          </Grid>
                          <Grid item sx={9}>
                            <Typography noWrap fontWeight={500} mb={0.5}>
                              {sp?.sanPhamCT?.sanPham?.ten || 'Sản phẩm'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Phân loại: {sp?.sanPhamCT?.mauSac?.ten}, {sp?.sanPhamCT?.trongLuong?.ten}, {sp?.sanPhamCT?.doCung?.ten}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              x{sp.soLuong}
                            </Typography>
                          </Grid>
                        </Grid>
                      </Box>
                      <Box ml={0}>
                        {sp?.sanPhamCT?.giaKhuyenMai ? (
                          <>
                            <Typography sx={{ textDecoration: 'line-through', fontSize: 13, color: '#888' }}>
                              {formatCurrency(sp.giaBan)}
                            </Typography>
                            <Typography color="error">{formatCurrency(sp?.sanPhamCT?.giaKhuyenMai)}</Typography>
                          </>
                        ) : (
                          <Typography>{formatCurrency(sp.giaBan)}</Typography>
                        )}
                      </Box>
                    </Box> */}

                            {/* Divider giữa các sản phẩm, không hiển thị sau sản phẩm cuối */}
                            {/* {idx < item.chiTiet.length - 1 && <Divider sx={{ my: 1 }} />}
                  </React.Fragment>
                ))} */}
                            {/* </Box> */}
                            <Divider />
                            <Grid container justifyContent="space-between" sx={{ p: 1.5 }}>
                                <Grid item xs={12} md={6}>
                                    {item.trangThai !== 8 &&
                                        (item.trangThai === 7 ? (
                                            <Typography fontSize={13}>
                                                Thời gian hủy hàng: {dayjs(item.ngaySua).format('DD/MM/YYYY HH:mm')}
                                            </Typography>
                                        ) : (
                                            <Typography fontSize={13}>
                                                Ngày đặt: {dayjs(item.ngayTao).format('DD/MM/YYYY HH:mm')}
                                            </Typography>
                                        ))}
                                </Grid>
                                <Grid item xs={12} md={6} textAlign={{ xs: 'left', md: 'right' }}>
                                    {item.trangThai === 8 ? (
                                        <Typography fontWeight={500}>
                                            Số tiền hoàn lại:{' '}
                                            <span style={{ color: 'red' }}>{formatCurrency(item.tongTien)}</span>
                                        </Typography>
                                    ) : (
                                        <Typography fontWeight={500}>
                                            Tổng tiền:{' '}
                                            <span style={{ color: 'red' }}>{formatCurrency(item.tongTien)}</span>
                                        </Typography>
                                    )}
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
