// =============================
// Bảng danh sách sản phẩm sắp hết hàng
// =============================

import React, { useState } from 'react';
import {
  Table, TableHead, TableRow, TableCell, TableBody,
  Avatar, TablePagination, Typography, Box, Select, MenuItem
} from '@mui/material';
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';

// Dữ liệu mẫu (mock) cho sản phẩm sắp hết hàng
const mockOutOfStock = []; // Để mảng rỗng để test giao diện No Data

const TableOutOfStock = () => {
  // State quản lý số dòng/trang
  const [rowsPerPage, setRowsPerPage] = useState(10);

  return (
    <Box sx={{ mt: 4, p: 2, border: '1px solid #eee', borderRadius: 2 }}>
      {/* Tiêu đề và chọn số dòng/trang */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ flex: 1 }}>
          Danh sách sản phẩm sắp hết hàng
        </Typography>
        <Select
          size="small"
          value={rowsPerPage}
          onChange={e => setRowsPerPage(Number(e.target.value))}
        >
          {[5, 10, 25].map(opt => (
            <MenuItem key={opt} value={opt}>{opt}</MenuItem>
          ))}
        </Select>
      </Box>
      {/* Bảng sản phẩm sắp hết hàng */}
      <Table>
        <TableHead>
          <TableRow sx={{ background: '#ff7800' }}>
            <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Ảnh</TableCell>
            <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Tên sản phẩm</TableCell>
            <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Số lượng</TableCell>
            <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Giá tiền</TableCell>
            <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Kích cỡ</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {/* Nếu không có dữ liệu thì hiển thị icon và text "No Data Found" */}
          {mockOutOfStock.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} align="center">
                <Box sx={{ py: 5 }}>
                  <SentimentDissatisfiedIcon sx={{ fontSize: 48, color: '#bdbdbd' }} />
                  <Typography color="text.secondary">No Data Found</Typography>
                </Box>
              </TableCell>
            </TableRow>
          ) : (
            // Hiển thị danh sách sản phẩm sắp hết hàng
            mockOutOfStock.slice(0, rowsPerPage).map((product, idx) => (
              <TableRow key={idx}>
                <TableCell>
                  <Avatar src={product.img} variant="square" />
                </TableCell>
                <TableCell>
                  <Typography
                    variant="body2"
                    sx={{ maxWidth: 180, whiteSpace: 'normal', wordBreak: 'break-word' }}
                  >
                    {product.name}
                  </Typography>
                </TableCell>
                <TableCell>{product.quantity}</TableCell>
                <TableCell>{product.price.toLocaleString()} ₫</TableCell>
                <TableCell>{product.sizes}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </Box>
  );
};

export default TableOutOfStock;