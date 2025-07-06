// =============================
// Thanh filter chọn thời gian và xuất Excel
// =============================

import React from 'react';
import { Button, Box } from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

// Props:
// - filters: Danh sách các filter thời gian (ngày, tuần, tháng...)
// - selectedFilter: Filter đang được chọn
// - onFilterChange: Hàm xử lý khi đổi filter
// - fromDate, toDate: Ngày bắt đầu, kết thúc
// - onFromDateChange, onToDateChange: Hàm đổi ngày
// - onExport: Hàm xuất Excel
const FilterBar = ({ filters, selectedFilter, onFilterChange, fromDate, toDate, onFromDateChange, onToDateChange, onExport }) => (
  <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
    {/* Các button filter thời gian */}
    {filters.map((filter) => (
      <Button
        key={filter.value}
        variant={selectedFilter === filter.value ? 'contained' : 'outlined'}
        color={filter.value === 'Tùy chỉnh' ? 'warning' : 'primary'}
        onClick={() => onFilterChange(filter.value)}
      >
        {filter.label}
      </Button>
    ))}
    {/* Bộ chọn ngày bắt đầu/kết thúc (chỉ dùng khi filter là Tùy chỉnh) */}
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
        label="Từ ngày"
        value={fromDate}
        onChange={onFromDateChange}
        slotProps={{ textField: { size: 'small' } }}
        maxDate={dayjs()}
      />
      <DatePicker
        label="Đến ngày"
        value={toDate}
        onChange={onToDateChange}
        slotProps={{ textField: { size: 'small' } }}
        maxDate={dayjs()}
        minDate={fromDate}
      />
    </LocalizationProvider>
    {/* Nút xuất Excel */}
    <Button variant="outlined" color="success" onClick={onExport}>EXPORT TO EXCEL</Button>
  </Box>
);

export default FilterBar; 