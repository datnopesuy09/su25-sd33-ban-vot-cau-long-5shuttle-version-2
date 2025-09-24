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
import RefundCalculationInfo from './RefundCalculationInfo';

export default function OrderReturn() {
    const { id } = useParams(); // orderId
    const navigate = useNavigate();

    const [products, setProducts] = useState([]);
    const [reason, setReason] = useState('');
    const [description, setDescription] = useState('');
    const [orderInfo, setOrderInfo] = useState(null);
    const [actualRefundAmount, setActualRefundAmount] = useState(0);
    const [isCalculatingRefund, setIsCalculatingRefund] = useState(false);
    const hasSelected = products.some((p) => p.selected);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('userToken');
            const res = await axios.get(`http://localhost:8080/users/myOderDetail/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            // Suy ra thông tin đơn hàng (voucher, tổng tiền, tổng tiền hàng trước voucher)
            const result = Array.isArray(res.data.result) ? res.data.result : [];
            const first = result[0] || null;
            const hoaDon = first?.hoaDon || null;
            // Tính tổng tiền hàng (subtotal) trước voucher: sum(giaBan * soLuong)
            const orderSubtotal = result.reduce((sum, it) => sum + Number(it.giaBan || 0) * Number(it.soLuong || 0), 0);
            setOrderInfo(hoaDon ? { voucher: hoaDon.voucher, tongTien: hoaDon.tongTien, orderSubtotal } : null);

            const items = res.data.result.map((item) => ({
                id: item.id,
                name:
                    item.sanPhamCT?.sanPham?.ten +
                    '-' +
                    item.sanPhamCT?.mauSac.ten +
                    ' - ' +
                    item.sanPhamCT?.doCung.ten +
                    ' - ' +
                    item.sanPhamCT?.chatLieu.ten,
                image: item.hinhAnhUrl,
                price: item.giaBan,
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

    // Tính số tiền hoàn trả có xét voucher
    const calculateActualRefund = () => {
        if (!orderInfo || !hasSelected) {
            setActualRefundAmount(0);
            return;
        }

        const selectedProducts = products.filter((p) => p.selected);
        let totalOriginalAmount = selectedProducts.reduce((sum, p) => sum + p.price * p.quantityReturn, 0);

        // Nếu đơn hàng có voucher, tính tỷ lệ giảm giá theo cấu hình voucher và subtotal của đơn hàng
        if (orderInfo.voucher && Number(orderInfo.orderSubtotal) > 0) {
            const discountRatio = getDiscountRatio(orderInfo.voucher, Number(orderInfo.orderSubtotal));
            const actualRefund = totalOriginalAmount * (1 - discountRatio);
            setActualRefundAmount(Math.max(0, actualRefund));
        } else {
            setActualRefundAmount(totalOriginalAmount);
        }
    };

    // Helper function để tính tỷ lệ giảm giá
    const getDiscountRatio = (voucher, orderSubtotal) => {
        if (!voucher || !orderSubtotal || orderSubtotal <= 0) return 0;

        // Chuẩn hóa: FE dùng 0 = phần trăm, 1 = số tiền; BE có thể dùng 1 = %, 2 = số tiền
        const type = voucher.kieuGiaTri;
        let discountAmount = 0;

        // Phần trăm
        if (type === 0 || (type === 1 && voucher?.schema === 'percent')) {
            discountAmount = orderSubtotal * (Number(voucher.giaTri || 0) / 100);
            if (voucher.giaTriMax) {
                discountAmount = Math.min(discountAmount, Number(voucher.giaTriMax));
            }
        }

        // Số tiền cố định (bao gồm cả trường hợp BE dùng 1/2)
        if (type === 1 || type === 2) {
            // Nếu thực sự là percent theo FE (type===1) thì nhánh percent ở trên đã xử lý khi schema='percent'.
            // Ở đây xử lý số tiền cố định phổ biến: FE type 1, BE type 2
            // Nếu có cả 2 nhánh chạy, lấy lớn hơn? Để an toàn, ưu tiên max giảm nhưng không vượt quá subtotal.
            const fixed = Number(voucher.giaTri || 0);
            discountAmount = Math.max(discountAmount, fixed);
        }

        // Không vượt quá tổng tiền hàng
        discountAmount = Math.min(discountAmount, orderSubtotal);
        return Math.min(discountAmount / orderSubtotal, 1);
    };

    // Cập nhật actual refund khi products thay đổi
    useEffect(() => {
        calculateActualRefund();
    }, [products, orderInfo]);

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
                            <TableCell align="center" sx={{ width: '180px' }}>
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
                                        sx={{ width: 60 }}
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

            {hasSelected && (
                <RefundCalculationInfo
                    orderInfo={orderInfo}
                    totalRefund={totalRefund}
                    actualRefundAmount={actualRefundAmount}
                />
            )}

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
                <div>
                    <Typography variant="body2" color="text.secondary">
                        Tổng giá trị sản phẩm trả:{' '}
                        <span style={{ color: '#666' }}>{numeral(totalRefund).format('0,0')} ₫</span>
                    </Typography>
                    {orderInfo?.voucher && (
                        <Typography variant="body2" color="warning.main" sx={{ mt: 0.5 }}>
                            ⚠️ Đơn hàng có voucher "{orderInfo.voucher.ten}" - Số tiền hoàn trả sẽ được điều chỉnh
                        </Typography>
                    )}
                    <Typography fontWeight="bold" sx={{ mt: 1 }}>
                        Số tiền hoàn trả thực tế:{' '}
                        <span style={{ color: 'red' }}>{numeral(actualRefundAmount).format('0,0')} ₫</span>
                    </Typography>
                </div>
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
