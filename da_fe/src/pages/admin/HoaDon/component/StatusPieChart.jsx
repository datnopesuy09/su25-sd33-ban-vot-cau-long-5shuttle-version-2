// =============================
// Biểu đồ trạng thái đơn hàng (PieChart)
// =============================

import React from 'react';
import { Typography, Box, CircularProgress, Skeleton } from '@mui/material';
import { PieChart } from '@mui/x-charts/PieChart';

// LEGEND: Danh sách trạng thái và màu sắc cho chú thích
const LEGEND = [
  { name: 'Thành công', color: '#4caf50' },
  { name: 'Đơn hủy', color: '#f44336' },
  { name: 'Đơn trả', color: '#9c27b0' },
];

const COLORS = ['#4caf50', '#f44336', '#9c27b0'];

// Props:
// - data: Dữ liệu biểu đồ (mảng các trạng thái và số lượng)
// - label: Nhãn filter (ví dụ: ngày, tuần...)
// - colors: Màu cho từng trạng thái
// - loading: Trạng thái loading (hiển thị overlay khi đang tải dữ liệu)
const StatusPieChart = ({ data, label, colors, loading = false }) => {
  // Tính tổng số đơn để tính phần trăm
  const total = data.reduce((sum, item) => sum + item.value, 0) || 1;
  return (
    <Box sx={{ width: '100%', minWidth: 350, minHeight: 400, position: 'relative' }}>
      {/* Tiêu đề biểu đồ */}
      <Typography variant="h6" gutterBottom sx={{ color: 'black', mb: 2 }}>
        Biểu đồ trạng thái {label}
      </Typography>
      
      {/* Overlay loading khi đang tải dữ liệu */}
      {loading && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1,
            borderRadius: 1
          }}
        >
          <CircularProgress />
        </Box>
      )}
      
      {/* Biểu đồ hình tròn PieChart */}
      <PieChart
        series={[{
          data: data.map((item, idx) => ({ ...item, color: colors[idx % colors.length] })),
          arcLabel: (item) => `${Math.round(item.value / total * 100)}%`,
          arcLabelMinAngle: 10,
        }]}
        width={350}
        height={300}
        slotProps={{ legend: { hidden: true } }}
      />
      {/* Chú thích trạng thái (legend) */}
      <Box
        sx={{
          display: 'flex', flexWrap: 'wrap', gap: 2, p: 2, border: '1px solid #eee', borderRadius: 2,
          background: '#fafafa', mt: 2, justifyContent: 'center',
        }}
      >
        {loading ? (
          // Hiển thị skeleton cho legend khi loading
          Array.from({ length: 3 }).map((_, idx) => (
            <Box key={idx} sx={{ display: 'flex', alignItems: 'center', minWidth: 150 }}>
              <Skeleton variant="rectangular" width={18} height={18} sx={{ borderRadius: 1, mr: 1 }} />
              <Skeleton variant="text" width={80} />
            </Box>
          ))
        ) : (
          data.map((item, idx) => {
            const percent = total ? ((item.value / total) * 100).toFixed(2) : 0;
            return (
              <Box key={item.name} sx={{ display: 'flex', alignItems: 'center', minWidth: 150 }}>
                <Box sx={{ width: 18, height: 18, background: colors[idx % colors.length], borderRadius: 1, mr: 1 }} />
                <Typography variant="body2" sx={{ color: 'black' }}>
                  {item.name} - {percent}%
                </Typography>
              </Box>
            );
          })
        )}
      </Box>
    </Box>
  );
};

export default StatusPieChart; 