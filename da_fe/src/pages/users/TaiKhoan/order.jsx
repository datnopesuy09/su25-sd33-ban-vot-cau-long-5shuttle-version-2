import React, { useEffect, useState } from 'react';
import {
  Box, TextField, Typography, Paper, Button, Grid, Chip,
  InputAdornment, Tabs, Tab
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import axios from 'axios';
import dayjs from 'dayjs';
import { useUserAuth } from '../../../contexts/userAuthContext';

const tabs = ['Tất cả', 'Chờ xác nhận', 'Chờ giao hàng', 'Đang vận chuyển', 'Hoàn thành', 'Đã hủy', 'Trả hàng'];

const getStatus = (status) => {
  const statuses = [
    '', 'Chờ xác nhận', 'Chờ giao hàng', 'Đang vận chuyển',
    'Đã giao hàng', 'Chờ thanh toán', 'Đã thanh toán',
    'Hoàn thành', 'Đã hủy', 'Trả hàng'
  ];
  return statuses[status] || 'Không xác định';
};

// const getStatusColor = (status) => {
//   switch (status) {
//     case 5: return 'warning'; // Chờ thanh toán
//     case 1: return 'info';    // Chờ xác nhận
//     case 7: return 'success'; // Hoàn thành
//     case 8: return 'default'; // Đã hủy
//     default: return 'primary';
//   }
// };

const formatCurrency = (value) => {
  return value.toLocaleString('vi-VN', {
    style: 'currency',
    currency: 'VND',
  });
};

function UserOrder() {
  const [selectedTab, setSelectedTab] = useState('Tất cả');
  const [listHoaDon, setListHoaDon] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const { isLoggedIn } = useUserAuth();

  const filteredBills = listHoaDon.filter((bill) => {
    const matchTab =
      selectedTab === 'Tất cả' ||
      (selectedTab === 'Chờ xác nhận' && bill.trangThai === 1) ||
      (selectedTab === 'Chờ giao hàng' && bill.trangThai === 2) ||
      (selectedTab === 'Đang vận chuyển' && bill.trangThai === 3) ||
      (selectedTab === 'Hoàn thành' && bill.trangThai === 7) ||
      (selectedTab === 'Đã hủy' && bill.trangThai === 8) ||
      (selectedTab === 'Trả hàng' && bill.trangThai === 9);

    const matchSearch = bill.ma.toLowerCase().includes(searchTerm.toLowerCase());
    return matchTab && matchSearch;
  });

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('userToken');
        if (!token) return;

        const headers = { Authorization: `Bearer ${token}` };

        // Lấy danh sách hóa đơn
        const res = await axios.get('http://localhost:8080/users/myOrders', { headers });
        const bills = res.data.result;

        // Gọi API lấy chi tiết từng hóa đơn
        const detailedBills = await Promise.all(
          bills.map(async (bill) => {
            try {
              const detailRes = await axios.get(`http://localhost:8080/users/myOderDetail/${bill.id}`, { headers });
              const chiTiet = detailRes.data.result;

              const firstItem = chiTiet?.[0];

              return {
                ...bill,
                tenSanPhamDaiDien: firstItem?.sanPhamCT?.sanPham?.ten || 'Sản phẩm',
                giaBan: firstItem?.giaBan || 1,
                giaKhuyenMai: firstItem?.sanPhamCT?.giaKhuyenMai || null,
                hinhAnhDaiDien: firstItem?.sanPhamCT?.hinhAnh || '',
              };
            } catch (detailError) {
              console.warn('Không thể lấy chi tiết cho hóa đơn:', bill.id);
              return bill;
            }
          })
        );

        setListHoaDon(detailedBills);
      } catch (error) {
        console.error('Lỗi khi lấy đơn hàng:', error);
        toast.error('Không thể lấy đơn hàng');
      }
    };

    if (isLoggedIn) {
      fetchOrders();
    }
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
        placeholder="Tìm kiếm theo mã hóa đơn"
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
            toast.warning('Tìm kiếm không được có kí tự đặc biệt');
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
              {/* Mã hóa đơn + trạng thái */}
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography fontWeight={600} fontSize={14}>
                  {item.ma}
                </Typography>
                <Box
                  sx={{
                    display: 'inline-block',
                    backgroundColor: '#b5cdf7ff',
                    paddingX: 1,
                    paddingY: 0.5,
                    fontSize: '13px',
                    color: '#0c67c2ff',
                    fontWeight: 500,
                  }}
                >
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
                    {item.tenSanPhamDaiDien || 'Sản phẩm'}
                  </Typography>
                  <Typography fontSize={13} color="text.secondary">
                    {item.giaKhuyenMai ? (
                      <>
                        <Typography
                          variant="body2"
                          sx={{ textDecoration: 'line-through', color: 'text.disabled' }}
                        >
                          {formatCurrency(item.giaBan)}
                        </Typography>
                        <Typography color="error">{formatCurrency(item.giaKhuyenMai)}</Typography>
                      </>
                    ) : (
                      <Typography>{formatCurrency(item.giaBan)}</Typography>
                    )}
                  </Typography>
                </Grid>
              </Grid>

              <Grid container justifyContent="space-between" alignItems="center" mt={2}>
                <Grid item xs={12} md={6}>
                  <Typography fontSize={13}>
                    Ngày đặt hàng: {dayjs(item.ngayTao).format('DD/MM/YYYY HH:mm')}
                  </Typography>
                  <Button
                    size="small"
                    variant="outlined"
                    component={Link}
                    to={`/profile/order-detail/${item.id}`}
                    sx={{ mt: 1, textTransform: 'none' }}
                  >
                    Chi tiết đơn hàng
                  </Button>
                </Grid>
                <Grid item xs={12} md={6} textAlign={{ xs: 'left', md: 'right' }}>
                  <Typography fontSize={13}>Tiền ship: {formatCurrency(item.phiShip || 0)}</Typography>
                  <Typography fontWeight={600}>
                    Tổng số tiền: <span style={{ color: 'red' }}>{formatCurrency(item.tongTien)}</span>
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