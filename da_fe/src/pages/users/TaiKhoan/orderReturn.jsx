import { RemoveCircle } from '@mui/icons-material';
import {
    Box, Button, Checkbox, Divider, Grid, IconButton,
    InputAdornment, MenuItem, Paper, Select, Stack,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    TextField, Typography
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
    const hasSelected = products.some(p => p.selected);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('userToken');
            const res = await axios.get(`http://localhost:8080/users/myOderDetail/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const items = res.data.result.map(item => ({
                id: item.id,
                name: item.sanPhamCT?.sanPham?.ten,
                image: item.sanPhamCT?.hinhAnh,
                price: item.giaKhuyenMai || item.giaBan,
                quantity: item.soLuong,
                quantityReturn: 0,
                selected: false
            }));

            // Nếu đơn có đúng 1 sản phẩm thì auto chọn
            if (items.length === 1) {
                items[0].selected = true;
                items[0].quantityReturn = items[0].quantity; // auto set số lượng trả bằng số lượng đã mua
            }

            setProducts(items);

        } catch (err) {
            toast.error("Không thể tải dữ liệu trả hàng");
            console.error(err);
        }
    };

    useEffect(() => {
        if (id) fetchData();
    }, [id]);

    const changeQuantity = (prod, value) => {
        if (value < 0) value = 0;
        if (value > prod.quantity) value = prod.quantity;
        setProducts(prev =>
            prev.map(p =>
                p.id === prod.id ? { ...p, quantityReturn: value, selected: value > 0 } : p
            )
        );
    };

    const handleSubmit = async () => {
        const selectedProducts = products.filter(p => p.selected && p.quantityReturn > 0);
        if (selectedProducts.length === 0) {
            toast.warning("Vui lòng chọn ít nhất 1 sản phẩm để trả");
            return;
        }
        if (!reason) {
            toast.warning("Vui lòng chọn lý do trả hàng");
            return;
        }
        try {
            const token = localStorage.getItem('userToken');
            await axios.post(`http://localhost:8080/users/returns`, {
                orderId: id,
                reason,
                description,
                items: selectedProducts.map(p => ({
                    orderDetailId: p.id,
                    quantity: p.quantityReturn
                }))
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Yêu cầu trả hàng đã được gửi");
            navigate("/profile/order");
        } catch (err) {
            toast.error("Gửi yêu cầu thất bại");
            console.error(err);
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
            <Typography variant="h6" fontWeight={600} mb={2}>Yêu cầu trả hàng</Typography>

            <Paper variant="outlined" sx={{ mb: 2 }}>
                <Box sx={{ px: 3, py: 2 }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <GrSelect fontSize={20} />
                        <Typography variant="subtitle1" fontWeight="bold">
                            Chọn sản phẩm cần trả
                        </Typography>
                    </Stack>
                </Box>
                <Divider />
                <TableContainer sx={{ px: 1 }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell padding="checkbox">
                                    <Checkbox
                                        checked={products.length > 0 && products.every(p => p.selected)}
                                        indeterminate={products.some(p => p.selected) && !products.every(p => p.selected)}
                                        onChange={(e) =>
                                            setProducts(prev =>
                                                prev.map(p => ({
                                                    ...p,
                                                    selected: e.target.checked,
                                                    quantityReturn: e.target.checked ? p.quantity : 0
                                                }))
                                            )
                                        }
                                    />
                                </TableCell>
                                <TableCell>Sản phẩm</TableCell>
                                <TableCell align="center">Số lượng</TableCell>
                                <TableCell align="center">Đơn giá</TableCell>
                                <TableCell align="center">Tổng</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {products.map(prod => (
                                <TableRow key={prod.id}>
                                    <TableCell padding="checkbox">
                                        <Checkbox
                                            checked={prod.selected}
                                            onChange={(e) =>
                                                setProducts(prev =>
                                                    prev.map(p =>
                                                        p.id === prod.id
                                                            ? {
                                                                ...p,
                                                                selected: e.target.checked,
                                                                // Nếu tick chọn thì auto set quantityReturn = số lượng mua
                                                                quantityReturn: e.target.checked ? p.quantity : 0
                                                            }
                                                            : p
                                                    )
                                                )
                                            }
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <img src={prod.image} alt="" width={80} height={80} />
                                            <Typography>
                                                {prod.name}
                                            </Typography>
                                        </Stack>
                                    </TableCell>
                                    <TableCell align="center">
                                        <IconButton size="small" onClick={() => changeQuantity(prod, prod.quantityReturn - 1)}>
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
                                                )
                                            }}
                                        />
                                        <IconButton size="small" onClick={() => changeQuantity(prod, prod.quantityReturn + 1)}>
                                            <AddCircleIcon fontSize="small" />
                                        </IconButton>
                                    </TableCell>
                                    <TableCell align="center">{numeral(prod.price).format("0,0")} ₫</TableCell>
                                    <TableCell align="center">{numeral(prod.price * prod.quantityReturn).format("0,0")} ₫</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
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
                            <MenuItem value=""><em>Chọn lý do</em></MenuItem>
                            <MenuItem value="Sản phẩm bị lỗi">Sản phẩm bị lỗi</MenuItem>
                            <MenuItem value="Giao sai sản phẩm">Giao sai sản phẩm</MenuItem>
                            <MenuItem value="Không đúng mô tả">Không đúng mô tả</MenuItem>
                            <MenuItem value="Khác">Khác</MenuItem>
                        </Select>
                    </Grid>
                </Grid>

                {/* Nếu chọn lý do Khác thì cho nhập */}
                {reason === "Khác" && (
                    <Grid container spacing={2} mb={2}>
                        <Grid size={1} sm={2}>Lý do khác:</Grid>
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

                {/* Nếu không chọn Khác thì hiện ô mô tả như cũ */}
                {reason !== "Khác" && (
                    <Grid container spacing={2}>
                        <Grid size={1} sm={2}>Mô tả:</Grid>
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
                            />
                        </Grid>
                    </Grid>
                )}
                {/* <Grid container spacing={2} mb={2}>
                    <Grid size={1}><span style={{ color: 'red' }}>*</span>Lý do:</Grid>
                    <Grid size={8}>
                        <Select
                            size="small"
                            fullWidth
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            disabled={!hasSelected}
                        >
                            <MenuItem value=""><em>Chọn lý do</em></MenuItem>
                            <MenuItem value="Sản phẩm bị lỗi">Sản phẩm bị lỗi</MenuItem>
                            <MenuItem value="Giao sai sản phẩm">Giao sai sản phẩm</MenuItem>
                            <MenuItem value="Không đúng mô tả">Không đúng mô tả</MenuItem>
                            <MenuItem value="Khác">Khác</MenuItem>
                        </Select>
                        {products.reason === 'Khác' && (
                            <TextField
                                size="small"
                                placeholder="Nhập lý do..."
                                value={products.customReason}
                                onChange={(e) => changeCustomReason(e.target.value, product)}
                                disabled={products.quantityReturn <= 0}
                            />
                        )}
                    </Grid>
                </Grid>
                <Grid container spacing={2}>
                    <Grid size={1}>Mô tả:</Grid>
                    <Grid size={8}>
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Chi tiết vấn đề bạn gặp phải"
                            multiline
                            rows={4}
                            value={description}
                            disabled={!hasSelected}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </Grid>
                </Grid> */}
            </Paper>

            <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                <Typography fontWeight="bold" mb={2}>
                    Tổng tiền hoàn trả: <span style={{ color: 'red' }}>{numeral(totalRefund).format("0,0")} ₫</span>
                </Typography>
                <Stack direction="row" spacing={1}>
                    <Button variant="contained" color="error"
                        onClick={handleSubmit}
                        disabled={!hasSelected || !reason ||
                            (reason === "Khác" && !description.trim())}>
                        Xác nhận trả hàng
                    </Button>
                    <Button onClick={() => navigate(-1)} variant="outlined" color="primary">Trở về</Button>
                </Stack>
            </Paper>
        </Box>
    );
}
