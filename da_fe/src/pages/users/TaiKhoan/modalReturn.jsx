import React, { useEffect, useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Grid,
    Paper,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    TableContainer,
    Checkbox,
    IconButton,
    TextField,
    InputAdornment,
    Chip,
    Stack,
    Typography,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from '@mui/material';
import { RemoveCircle } from '@mui/icons-material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { FaMoneyBillWave } from 'react-icons/fa';
import { GrSelect } from 'react-icons/gr';
import { toast } from 'react-toastify';

export default function ModalReturn({ open, setOpen, setTab }) {
    const [bill, setBill] = useState({});
    const [billDetail, setBillDetail] = useState([]);
    const [phi, setPhi] = useState(0);
    const [traKhach, setTraKhach] = useState(0);

    const reasonOptions = [
        'Sản phẩm bị lỗi',
        'Giao nhầm sản phẩm',
        'Muốn đổi sản phẩm khác',
        'Sản phẩm không đúng mô tả',
        'Khác...',
    ];

    useEffect(() => {
        setBill({
            id: 1,
            code: 'HD12345',
            customer: 'Nguyen Van A',
        });

        setBillDetail([
            {
                id: 1,
                name: 'Áo Thun Nam',
                quantity: 5,
                quantityReturn: 0,
                price: 200000,
                image: 'https://via.placeholder.com/60',
                note: '',
                isSelected: false,
            },
            {
                id: 2,
                name: 'Quần Jean',
                quantity: 2,
                quantityReturn: 0,
                price: 500000,
                image: 'https://via.placeholder.com/60',
                note: '',
                isSelected: false,
            },
        ]);
    }, []);

    const changeNote = (value, product) => {
        const updated = billDetail.map((item) => (item.id === product.id ? { ...item, note: value } : item));
        setBillDetail(updated);
    };

    const changeSL = (value, product) => {
        let quantityReturn = parseInt(value);
        if (isNaN(quantityReturn) || quantityReturn < 0) quantityReturn = 0;
        // Nếu quantityReturn lớn hơn quantity, mặc định lấy quantity
        quantityReturn = Math.min(quantityReturn, product.quantity);

        const updated = billDetail.map((item) =>
            item.id === product.id
                ? {
                      ...item,
                      quantityReturn,
                      isSelected: quantityReturn > 0 ? true : false, // Bỏ chọn khi quantityReturn = 0
                  }
                : item,
        );
        setBillDetail(updated);

        setTraKhach(updated.reduce((total, e) => total + e.quantityReturn * e.price, 0) * (1 - phi / 100));
    };

    const toggleSelection = (product) => {
        const updated = billDetail.map((item) =>
            item.id === product.id
                ? {
                      ...item,
                      isSelected: !item.isSelected,
                      quantityReturn: !item.isSelected ? item.quantity : 0,
                      note: '',
                  }
                : item,
        );
        setBillDetail(updated);
    };

    const guiYeuCau = () => {
        const detail = billDetail
            .filter((bd) => bd.quantityReturn > 0)
            .map((bd) => ({
                name: bd.name,
                quantity: bd.quantityReturn,
                price: bd.price,
                idBillDetail: bd.id,
                note: bd.note,
            }));

        const returnBill = {
            idBill: bill.id,
            returnMoney: billDetail.reduce((total, e) => total + e.quantityReturn * e.price, 0) * (1 - phi / 100),
            moneyPayment: traKhach,
            fee: phi,
            listDetail: detail,
        };

        console.log('Yêu cầu trả hàng:', returnBill);
        toast.success('Giả lập gửi yêu cầu trả hàng thành công!');
        setOpen(false);
        setTab('traHang');
    };

    const totalReturn = billDetail.reduce((total, e) => total + e.quantityReturn * e.price, 0);

    return (
        <Dialog
            open={open}
            onClose={() => setOpen(false)}
            maxWidth="md"
            fullWidth
            sx={{
                '& .MuiDialog-paper': {
                    width: 1000, // Fixed width
                    height: 400, // Fixed height
                    maxWidth: 'none', // Override default maxWidth
                    maxHeight: 'none', // Override default maxHeight
                },
            }}
        >
            <DialogTitle>Yêu cầu trả hàng</DialogTitle>

            <DialogContent dividers>
                <Box sx={{ mb: 2 }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <GrSelect fontSize={20} />
                        <Typography variant="subtitle1" fontWeight="bold">
                            Chọn sản phẩm cần trả
                        </Typography>
                    </Stack>
                </Box>

                <TableContainer component={Paper} sx={{ maxHeight: 250, overflowY: 'auto' }}>
                    <Table stickyHeader size="small" sx={{ tableLayout: 'fixed', width: '100%' }}>
                        <TableHead>
                            <TableRow>
                                <TableCell padding="checkbox" sx={{ width: 50 }}>
                                    <Checkbox
                                        onChange={(e) => {
                                            setBillDetail((prev) =>
                                                prev.map((item) => ({
                                                    ...item,
                                                    isSelected: e.target.checked,
                                                    quantityReturn: e.target.checked ? item.quantity : 0,
                                                    note: e.target.checked ? 'Sản phẩm bị lỗi' : '',
                                                })),
                                            );
                                        }}
                                        checked={billDetail.every((e) => e.isSelected)}
                                    />
                                </TableCell>
                                <TableCell sx={{ width: 150 }}>Sản phẩm</TableCell>
                                <TableCell align="center" sx={{ width: 120 }}>
                                    Số lượng
                                </TableCell>
                                <TableCell align="center" sx={{ width: 100 }}>
                                    Đơn giá
                                </TableCell>
                                <TableCell align="center" sx={{ width: 100 }}>
                                    Tổng
                                </TableCell>
                                <TableCell align="center" sx={{ width: 200 }}>
                                    Lý do trả
                                </TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {billDetail.map((product) => (
                                <TableRow key={product.id}>
                                    <TableCell padding="checkbox">
                                        <Checkbox
                                            checked={product.isSelected}
                                            onChange={() => toggleSelection(product)}
                                        />
                                    </TableCell>

                                    <TableCell>
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <img
                                                src={product.image}
                                                alt="sp"
                                                width={60}
                                                height={60}
                                                style={{ objectFit: 'cover', borderRadius: 4 }}
                                            />
                                            <Typography variant="body2">{product.name}</Typography>
                                        </Stack>
                                    </TableCell>

                                    <TableCell align="center">
                                        <Stack
                                            direction="row"
                                            spacing={1}
                                            alignItems="center"
                                            justifyContent="center"
                                            sx={{ minWidth: 120 }}
                                        >
                                            <IconButton
                                                size="small"
                                                onClick={() => changeSL(product.quantityReturn - 1, product)}
                                                disabled={!product.isSelected || product.quantityReturn <= 0}
                                            >
                                                <RemoveCircle fontSize="small" />
                                            </IconButton>
                                            <TextField
                                                size="small"
                                                value={product.quantityReturn}
                                                onChange={(e) => changeSL(e.target.value, product)}
                                                variant="standard"
                                                sx={{ width: 60, textAlign: 'center' }}
                                                inputProps={{ inputMode: 'numeric', style: { textAlign: 'center' } }}
                                                InputProps={{
                                                    endAdornment: (
                                                        <InputAdornment position="end">
                                                            / {product.quantity}
                                                        </InputAdornment>
                                                    ),
                                                }}
                                                disabled={!product.isSelected}
                                            />
                                            <IconButton
                                                size="small"
                                                onClick={() => changeSL(product.quantityReturn + 1, product)}
                                                disabled={
                                                    !product.isSelected || product.quantityReturn >= product.quantity
                                                }
                                            >
                                                <AddCircleIcon fontSize="small" />
                                            </IconButton>
                                        </Stack>
                                    </TableCell>

                                    <TableCell align="center">
                                        {product.price.toLocaleString('it-IT', {
                                            style: 'currency',
                                            currency: 'VND',
                                        })}
                                    </TableCell>

                                    <TableCell align="center">
                                        <Typography fontWeight="bold" color="error">
                                            {(product.price * product.quantityReturn).toLocaleString('it-IT', {
                                                style: 'currency',
                                                currency: 'VND',
                                            })}
                                        </Typography>
                                    </TableCell>

                                    <TableCell align="center">
                                        <FormControl fullWidth size="small" disabled={!product.isSelected}>
                                            <InputLabel>Lý do</InputLabel>
                                            <Select
                                                value={product.note || ''}
                                                onChange={(e) => changeNote(e.target.value, product)}
                                                label="Lý do"
                                            >
                                                {reasonOptions.map((reason, idx) => (
                                                    <MenuItem key={idx} value={reason}>
                                                        {reason}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>

                                        {product.note === 'Khác...' && (
                                            <TextField
                                                fullWidth
                                                size="small"
                                                placeholder="Nhập lý do khác"
                                                sx={{ mt: 1 }}
                                                onChange={(e) => changeNote(e.target.value, product)}
                                                disabled={!product.isSelected}
                                            />
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                <Box sx={{ mt: 2 }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <FaMoneyBillWave />
                        <Typography fontWeight="bold">Tổng tiền hoàn trả:</Typography>
                        <Chip
                            color="error"
                            label={totalReturn.toLocaleString('it-IT', {
                                style: 'currency',
                                currency: 'VND',
                            })}
                        />
                    </Stack>
                </Box>
            </DialogContent>

            <DialogActions>
                <Button onClick={() => setOpen(false)}>Hủy</Button>
                <Button variant="contained" color="success" onClick={guiYeuCau}>
                    Xác nhận trả hàng
                </Button>
            </DialogActions>
        </Dialog>
    );
}
