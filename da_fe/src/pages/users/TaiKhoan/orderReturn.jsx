import { RemoveCircle } from '@mui/icons-material';
import {
    Box,
    Button,
    Checkbox,
    Divider,
    Grid,
    IconButton,
    InputAdornment,
    MenuItem,
    Paper,
    Select,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { GrSelect } from 'react-icons/gr';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import numeral from 'numeral';

export default function OrderReturn() {
    const { id } = useParams(); // orderId
    const navigate = useNavigate();

    const [products, setProducts] = useState([]);
    const [reason, setReason] = useState('');
    const [description, setDescription] = useState('');
    const hasSelected = products.some((p) => p.selected);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('userToken');
            const res = await axios.get(`http://localhost:8080/users/myOderDetail/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const items = res.data.result.map((item) => ({
                id: item.id,
                name: item.sanPhamCT?.sanPham?.ten,
                image: item.sanPhamCT?.hinhAnh,
                price: item.giaKhuyenMai || item.giaBan,
                quantity: item.soLuong,
                quantityReturn: 0,
                selected: false,
            }));

            // Nếu đơn có đúng 1 sản phẩm thì auto chọn
            if (items.length === 1) {
                items[0].selected = true;
                items[0].quantityReturn = items[0].quantity; // auto set số lượng trả bằng số lượng đã mua
            }

            setProducts(items);
        } catch (err) {
            toast.error('Không thể tải dữ liệu trả hàng');
            console.error(err);
        }
    };

    useEffect(() => {
        if (id) fetchData();
    }, [id]);

    const changeQuantity = (prod, value) => {
        if (value < 0) value = 0;
        if (value > prod.quantity) value = prod.quantity;
        setProducts((prev) =>
            prev.map((p) => (p.id === prod.id ? { ...p, quantityReturn: value, selected: value > 0 } : p)),
        );
    };

    const handleSubmit = async () => {
        const token = localStorage.getItem('userToken');

        const selectedProducts = products.filter((p) => p.selected && p.quantityReturn > 0);

        if (selectedProducts.length === 0) {
            toast.warning('Vui lòng chọn ít nhất 1 sản phẩm để trả');
            return;
        }

        // với mỗi sản phẩm, BE bắt buộc phải có lý do => mình dùng lý do chung hoặc lý do riêng
        const payload = {
            hoaDonId: parseInt(id),
            ghiChuKhachHang: description, // ghi chú chung (nếu có)
            chiTietPhieuTraHang: selectedProducts.map((p) => ({
                hoaDonChiTietId: p.id, // id chi tiết hóa đơn
                soLuongTra: p.quantityReturn, // số lượng trả
                lyDoTraHang: reason || 'Không có lý do cụ thể', // BE bắt buộc, tránh null
            })),
        };

        try {
            const response = await axios.post(`http://localhost:8080/phieu-tra-hang`, payload, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            console.log('Phản hồi từ BE:', response.data);
            toast.success('Gửi phiếu trả hàng thành công!');
            navigate('/profile/order');
        } catch (error) {
            if (error.response?.data?.code === 1014) {
                toast.error('Hóa đơn này đã được tạo phiếu trả hàng, không thể tạo thêm.');
            } else {
                console.error('Lỗi khi gửi phiếu trả hàng:', error.response?.data || error);
                toast.error('Không thể gửi phiếu trả hàng');
            }
        }
    };

    const totalRefund = products.reduce((sum, p) => {
        if (p.selected) {
            return sum + p.price * p.quantityReturn;
        }
        return sum;
    }, 0);

    return (
        <Box>
            <Typography variant="h6" fontWeight={600} mb={2}>
                Yêu cầu trả hàng
            </Typography>

            <Paper variant="outlined" sx={{ mb: 2 }}>
                <Box sx={{ px: 2, py: 2 }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <GrSelect fontSize={20} />
                        <Typography variant="subtitle1" fontWeight="bold">
                            Chọn sản phẩm cần trả
                        </Typography>
                    </Stack>
                </Box>
                <Divider />
                <Table sx={{ tableLayout: 'fixed', width: '100%' }}>
                    <TableHead>
                        <TableRow>
                            <TableCell padding="checkbox" sx={{ width: '60px' }}>
                                <Checkbox
                                    checked={products.length > 0 && products.every((p) => p.selected)}
                                    indeterminate={
                                        products.some((p) => p.selected) && !products.every((p) => p.selected)
                                    }
                                    onChange={(e) =>
                                        setProducts((prev) =>
                                            prev.map((p) => ({
                                                ...p,
                                                selected: e.target.checked,
                                                quantityReturn: e.target.checked ? p.quantity : 0,
                                            })),
                                        )
                                    }
                                />
                            </TableCell>
                            <TableCell sx={{ width: '400px' }}>Sản phẩm</TableCell>
                            <TableCell align="center" sx={{ width: '160px' }}>
                                Số lượng
                            </TableCell>
                            <TableCell align="center" sx={{ width: '180px' }}>
                                Đơn giá
                            </TableCell>
                            <TableCell align="center" sx={{ width: '200px' }}>
                                Tổng
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {products.map((prod) => (
                            <TableRow key={prod.id}>
                                <TableCell padding="checkbox" sx={{ width: '50px' }}>
                                    <Checkbox
                                        checked={prod.selected}
                                        onChange={(e) =>
                                            setProducts((prev) =>
                                                prev.map((p) =>
                                                    p.id === prod.id
                                                        ? {
                                                              ...p,
                                                              selected: e.target.checked,
                                                              quantityReturn: e.target.checked ? p.quantity : 0,
                                                          }
                                                        : p,
                                                ),
                                            )
                                        }
                                    />
                                </TableCell>
                                <TableCell sx={{ width: '400px' }}>
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <img src={prod.image} alt="" width={80} height={80} />
                                        <Typography>{prod.name}</Typography>
                                    </Stack>
                                </TableCell>
                                <TableCell align="center" sx={{ width: '160px' }}>
                                    <IconButton
                                        size="small"
                                        onClick={() => changeQuantity(prod, prod.quantityReturn - 1)}
                                    >
                                        <RemoveCircle fontSize="small" />
                                    </IconButton>
                                    <TextField
                                        size="small"
                                        value={prod.quantityReturn}
                                        onChange={(e) => changeQuantity(prod, Number(e.target.value))}
                                        variant="standard"
                                        sx={{ width: 40 }}
                                        inputProps={{ inputMode: 'numeric' }}
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">/{prod.quantity}</InputAdornment>
                                            ),
                                        }}
                                    />
                                    <IconButton
                                        size="small"
                                        onClick={() => changeQuantity(prod, prod.quantityReturn + 1)}
                                    >
                                        <AddCircleIcon fontSize="small" />
                                    </IconButton>
                                </TableCell>
                                <TableCell align="center" sx={{ width: '180px' }}>
                                    {numeral(prod.price).format('0,0')} ₫
                                </TableCell>
                                <TableCell align="center" sx={{ width: '200px' }}>
                                    {numeral(prod.price * prod.quantityReturn).format('0,0')} ₫
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Paper>

            <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                <Grid container spacing={2} mb={2}>
                    <Grid size={1} sm={2}>
                        <span style={{ color: 'red' }}>*</span> Lý do:
                    </Grid>
                    <Grid size={8} sm={8}>
                        <Select
                            size="small"
                            fullWidth
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            disabled={!hasSelected}
                        >
                            <MenuItem value="">
                                <em>Chọn lý do</em>
                            </MenuItem>
                            <MenuItem value="Sản phẩm bị lỗi">Sản phẩm bị lỗi, không hoạt động</MenuItem>
                            <MenuItem value="Giao sai sản phẩm">Giao sai sản phẩm</MenuItem>
                            <MenuItem value="Không đúng mô tả">Không đúng mô tả</MenuItem>
                            <MenuItem value="Hàng đã qua sử dụng">Hàng đã qua sử dụng</MenuItem>
                            <MenuItem value="Khác">Khác</MenuItem>
                        </Select>
                    </Grid>
                </Grid>

                {reason === 'Khác' && (
                    <Grid container spacing={2} mb={2}>
                        <Grid size={1} sm={2}>
                            Lý do khác:
                        </Grid>
                        <Grid size={8} sm={8}>
                            <TextField
                                fullWidth
                                size="small"
                                placeholder="Nhập chi tiết lý do khác..."
                                multiline
                                rows={3}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </Grid>
                    </Grid>
                )}

                {reason !== 'Khác' && (
                    <Grid container spacing={2}>
                        <Grid size={1} sm={2}>
                            Mô tả:
                        </Grid>
                        <Grid size={8} sm={8}>
                            <TextField
                                fullWidth
                                size="small"
                                placeholder="Chi tiết vấn đề bạn gặp phải"
                                multiline
                                rows={4}
                                value={description}
                                disabled={!hasSelected}
                                onChange={(e) => setDescription(e.target.value)}
                                inputProps={{ maxLength: 1000 }}
                            />
                            <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ display: 'block', textAlign: 'right' }}
                            >
                                {description.length}/1000
                            </Typography>
                        </Grid>
                    </Grid>
                )}
            </Paper>

            <Box
                position="sticky"
                bottom={0}
                left={0}
                bgcolor="#fff"
                borderTop="1px solid #eee"
                p={2}
                flexWrap="wrap"
                gap={1}
            >
                <Typography fontWeight="bold" mb={2}>
                    Tổng tiền hoàn trả: <span style={{ color: 'red' }}>{numeral(totalRefund).format('0,0')} ₫</span>
                </Typography>
                <Stack direction="row" spacing={1}>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={handleSubmit}
                        disabled={!hasSelected || !reason || (reason === 'Khác' && !description.trim())}
                    >
                        Xác nhận trả hàng
                    </Button>
                    <Button onClick={() => navigate(-1)} variant="outlined" color="primary">
                        Trở về
                    </Button>
                </Stack>
            </Box>
        </Box>
    );
}
