// =============================
// Bảng danh sách sản phẩm bán chạy
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
    CircularProgress,
    Alert,
    Box,
    Skeleton,
} from '@mui/material';
import axios from 'axios';
import dayjs from 'dayjs';

// Hàm lấy URL API cho top sản phẩm bán chạy theo filter
const getTopSellingApiUrl = (filter, fromDate, toDate) => {
    switch (filter) {
        case 'Ngày':
            return 'http://localhost:8080/thong-ke/top-selling/ngay';
        case 'Tuần':
            return 'http://localhost:8080/thong-ke/top-selling/tuan';
        case 'Tháng':
            return 'http://localhost:8080/thong-ke/top-selling/thang';
        case 'Năm':
            return 'http://localhost:8080/thong-ke/top-selling/nam';
        case 'Tùy chỉnh':
            return `http://localhost:8080/thong-ke/top-selling/tuy-chinh?fromDate=${fromDate.format('YYYY-MM-DD')}&toDate=${toDate.format('YYYY-MM-DD')}`;
        default:
            return '';
    }
};

// Props:
// - filterLabel: Nhãn filter (ngày, tuần, tháng...)
// - fromDate, toDate: Ngày bắt đầu, kết thúc
// - loading: Trạng thái loading (hiển thị overlay khi đang tải dữ liệu)
const TableBestSelling = ({ filterLabel, fromDate, toDate, loading = false }) => {
    // State phân trang và dữ liệu
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [products, setProducts] = useState([]);
    const [error, setError] = useState(null);

    // Gọi API lấy danh sách sản phẩm bán chạy khi filter hoặc ngày thay đổi
    useEffect(() => {
        const fetchTopSellingProducts = async () => {
            setError(null);
            try {
                const url = getTopSellingApiUrl(filterLabel, fromDate, toDate);
                const response = await axios.get(url);
                setProducts(response.data || []);
            } catch (err) {
                console.error('Lỗi khi lấy dữ liệu top-selling:', err);
                setError('Không thể tải dữ liệu sản phẩm bán chạy');
                setProducts([]);
            }
        };

        fetchTopSellingProducts();
    }, [filterLabel, fromDate, toDate]);

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
        <>
            {/* Tiêu đề bảng */}
            <Typography textAlign={'center'} variant="h6" gutterBottom sx={{ color: 'black' }}>
                Danh sách sản phẩm bán chạy theo {filterLabel}
            </Typography>
            <Box sx={{ width: '100%', minWidth: 530, minHeight: 400, position: 'relative' }}>
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
                            borderRadius: 1,
                        }}
                    >
                        <CircularProgress />
                    </Box>
                )}
                {/* Bảng sản phẩm */}
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Tên sản phẩm</TableCell>
                            <TableCell>Số lượng</TableCell>
                            <TableCell>Giá tiền</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {/* Nếu không có dữ liệu */}
                        {products.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={3} align="center">
                                    {loading ? (
                                        <Box sx={{ py: 2 }}>
                                            <Skeleton variant="text" width="60%" />
                                            <Skeleton variant="text" width="40%" />
                                        </Box>
                                    ) : (
                                        'Không có dữ liệu'
                                    )}
                                </TableCell>
                            </TableRow>
                        ) : (
                            // Hiển thị danh sách sản phẩm
                            products
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((product, index) => (
                                    <TableRow key={index}>
                                        {/* Tên sản phẩm cho phép xuống dòng */}
                                        <TableCell>
                                            <Typography
                                                variant="body2"
                                                sx={{ maxWidth: 300, whiteSpace: 'normal', wordBreak: 'break-word' }}
                                            >
                                                {product.name || product.tenSanPham}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>{product.quantity || product.soLuongDaBan}</TableCell>
                                        <TableCell>
                                            {(product.price || product.giaTien || 0).toLocaleString()} ₫
                                        </TableCell>
                                    </TableRow>
                                ))
                        )}
                    </TableBody>
                </Table>
                {/* Phân trang */}
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={products.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </Box>
        </>
    );
};

export default TableBestSelling;
