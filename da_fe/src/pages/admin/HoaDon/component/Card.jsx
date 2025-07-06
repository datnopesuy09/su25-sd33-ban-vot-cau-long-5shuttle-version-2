// =============================
// Card thống kê tổng quan (dùng trong StatisticCardsGroup)
// =============================

import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';

// Props:
// - title: Tiêu đề card (ví dụ: Tổng quan ngày)
// - icon: Icon đại diện cho card
// - amount: Tổng tiền
// - stats: Các chỉ số phụ (sản phẩm, thành công, hủy, trả)
// - color: Màu nền card
// - customWidth: Độ rộng riêng cho card (nếu có)
const StatisticCard = ({ title, icon, amount, stats, color, customWidth }) => {
  return (
    <Card
      sx={{
        backgroundColor: color, // Màu nền
        color: '#fff',          // Màu chữ
        borderRadius: 2,        // Bo góc
        height: '100%',         // Chiều cao full
        display: 'flex',
        flexDirection: 'column',
        width: customWidth ? customWidth : '100%', // Độ rộng riêng nếu có
        maxWidth: customWidth ? undefined : 1170,  // Giới hạn max width
        minWidth: customWidth ? undefined : 575,   // Giới hạn min width
      }}
    >
      <CardContent 
        sx={{ 
          textAlign: 'center', 
          flexGrow: 1, 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'space-between' 
        }}
      >
        {/* Phần icon, tiêu đề, tổng tiền */}
        <Box>
            <Box display="flex" justifyContent="center" alignItems="center" mb={1}>
              {icon}
            </Box>
            <Typography variant="h6" mb={1} sx={{ fontSize: { xs: '0.9rem', sm: '1.1rem' } }}>
              {title}
            </Typography>
            <Typography variant="h4" fontWeight="bold" sx={{ fontSize: { xs: '1.8rem', sm: '2.5rem' } }}>
              {amount.toLocaleString()} ₫
            </Typography>
        </Box>

        {/* Các chỉ số phụ: sản phẩm, thành công, hủy, trả */}
        <Box display="flex" justifyContent="space-around" flexWrap="wrap" mt={2}>
          <Box textAlign="center" flex="1" p={0.5}>
            <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>Sản phẩm</Typography>
            <Typography variant="subtitle1" sx={{ fontSize: '1rem' }}>{stats.products}</Typography>
          </Box>
          <Box textAlign="center" flex="1" p={0.5}>
            <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>Thành công</Typography>
            <Typography variant="subtitle1" sx={{ fontSize: '1rem' }}>{stats.success}</Typography>
          </Box>
          <Box textAlign="center" flex="1" p={0.5}>
            <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>Đơn huỷ</Typography>
            <Typography variant="subtitle1" sx={{ fontSize: '1rem' }}>{stats.cancel}</Typography>
          </Box>
          <Box textAlign="center" flex="1" p={0.5}>
            <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>Đơn trả</Typography>
            <Typography variant="subtitle1" sx={{ fontSize: '1rem' }}>{stats.return}</Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default StatisticCard;
