// =============================
// Bảng danh sách sản phẩm sắp hết hàng
// =============================

import React, { useState, useEffect } from 'react';
import {
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Avatar,
    TablePagination,
    Typography,
    Box,
    Select,
    MenuItem,
    CircularProgress,
    Alert,
    Skeleton,
} from '@mui/material';
import axios from 'axios';
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';

// Dữ liệu mẫu (mock) cho sản phẩm sắp hết hàng - fallback nếu API lỗi
const mockOutOfStock = [];

// Props: Không có props mới, nhưng có thể mở rộng sau
const TableOutOfStock = () => {
    // State quản lý dữ liệu, loading, error và phân trang
    const [products, setProducts] = useState(mockOutOfStock);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    // Fetch dữ liệu từ API khi component mount
    useEffect(() => {
        const fetchOutOfStockProducts = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await axios.get('http://localhost:8080/thong-ke/products-out-of-stock');
                setProducts(response.data || []);
            } catch (err) {
                console.error('Lỗi khi lấy dữ liệu sản phẩm sắp hết hàng:', err);
                setError('Không thể tải dữ liệu sản phẩm sắp hết hàng');
                setProducts(mockOutOfStock);
            } finally {
                setLoading(false);
            }
        };

        fetchOutOfStockProducts();
    }, []);

    // Xử lý đổi trang
    const handleChangePage = (event, newPage) => setPage(newPage);
    // Xử lý đổi số dòng/trang
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    // Nếu có lỗi thì hiển thị Alert
    if (error) {
        return (
            <Alert severity="error" sx={{ mb: 2 }}>
                {error}
            </Alert>
        );
    }

    return (
        <Box sx={{ mt: 4, p: 2, border: '1px solid #eee', borderRadius: 2, position: 'relative' }}>
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
                        borderRadius: 2,
                    }}
                >
                    <CircularProgress />
                </Box>
            )}

            {/* Tiêu đề và chọn số dòng/trang */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ flex: 1, color: 'black' }}>
                    Danh sách sản phẩm sắp hết hàng
                </Typography>
                <Select size="small" value={rowsPerPage} onChange={handleChangeRowsPerPage}>
                    {[5, 10, 25].map((opt) => (
                        <MenuItem key={opt} value={opt}>
                            {opt}
                        </MenuItem>
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
                    </TableRow>
                </TableHead>
                <TableBody>
                    {/* Nếu đang loading, hiển thị Skeleton */}
                    {loading ? (
                        Array.from({ length: rowsPerPage }).map((_, idx) => (
                            <TableRow key={idx}>
                                <TableCell>
                                    <Skeleton variant="rectangular" width={50} height={50} />
                                </TableCell>
                                <TableCell>
                                    <Skeleton variant="text" width="80%" />
                                </TableCell>
                                <TableCell>
                                    <Skeleton variant="text" width={50} />
                                </TableCell>
                                <TableCell>
                                    <Skeleton variant="text" width={80} />
                                </TableCell>
                            </TableRow>
                        ))
                    ) : products.length === 0 ? (
                        /* Nếu không có dữ liệu thì hiển thị icon và text */
                        <TableRow>
                            <TableCell colSpan={4} align="center">
                                <Box sx={{ py: 5 }}>
                                    <SentimentDissatisfiedIcon sx={{ fontSize: 48, color: '#bdbdbd' }} />
                                    <Typography color="text.secondary">Không có sản phẩm sắp hết hàng</Typography>
                                </Box>
                            </TableCell>
                        </TableRow>
                    ) : (
                        /* Hiển thị danh sách sản phẩm sắp hết hàng */
                        products.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((product, idx) => (
                            <TableRow key={idx}>
                                <TableCell>
                                    <Avatar
                                        src={product.hinhAnh || ''}
                                        variant="square"
                                        sx={{
                                            bgcolor: product.hinhAnh ? 'transparent' : '#ccc',
                                            width: 50,
                                            height: 50,
                                        }}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Typography
                                        variant="body2"
                                        sx={{ maxWidth: 180, whiteSpace: 'normal', wordBreak: 'break-word' }}
                                    >
                                        {product.tenSanPham}
                                    </Typography>
                                </TableCell>
                                <TableCell>{product.soLuong}</TableCell>
                                <TableCell>{product.donGia.toLocaleString()} ₫</TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>

            {/* Phân trang */}
            {!loading && products.length > 0 && (
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={products.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            )}
        </Box>
    );
};

export default TableOutOfStock;
