import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
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
  MenuItem,
  Select,
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
        reason: '',
        customReason: '',
      },
      {
        id: 2,
        name: 'Quần Jean',
        quantity: 2,
        quantityReturn: 0,
        price: 500000,
        image: 'https://via.placeholder.com/60',
        note: '',
        reason: '',
        customReason: '',
      },
    ]);
  }, []);

  const changeNote = (value, product) => {
    const updated = billDetail.map((item) =>
      item.id === product.id ? { ...item, note: value } : item
    );
    setBillDetail(updated);
  };

  const changeReason = (value, product) => {
    const updated = billDetail.map((item) =>
      item.id === product.id
        ? { ...item, reason: value, customReason: value === 'Khác' ? item.customReason : '' }
        : item
    );
    setBillDetail(updated);
  };

  const changeCustomReason = (value, product) => {
    const updated = billDetail.map((item) =>
      item.id === product.id ? { ...item, customReason: value } : item
    );
    setBillDetail(updated);
  };

  const changeSL = (value, product) => {
    let quantityReturn = parseInt(value);
    if (isNaN(quantityReturn) || quantityReturn < 0) quantityReturn = 0;
    quantityReturn = Math.min(quantityReturn, product.quantity);

    const updated = billDetail.map((item) =>
      item.id === product.id ? { ...item, quantityReturn } : item
    );
    setBillDetail(updated);

    setTraKhach(
      updated.reduce((total, e) => total + e.quantityReturn * e.price, 0) *
        (1 - phi / 100)
    );
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
        reason: bd.reason === 'Khác' ? bd.customReason : bd.reason,
      }));

    const returnBill = {
      idBill: bill.id,
      returnMoney:
        billDetail.reduce((total, e) => total + e.quantityReturn * e.price, 0) *
        (1 - phi / 100),
      moneyPayment: traKhach,
      fee: phi,
      listDetail: detail,
    };

    console.log('Yêu cầu trả hàng:', returnBill);
    toast.success('Giả lập gửi yêu cầu trả hàng thành công!');
    setOpen(false);
    setTab('traHang');
  };

  const totalReturn = billDetail.reduce(
    (total, e) => total + e.quantityReturn * e.price,
    0
  );

  return (
    <Dialog open={open} onClose={() => setOpen(false)} maxWidth="lg" fullWidth>
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

        <TableContainer component={Paper} sx={{ maxHeight: 500 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    onChange={(e) => {
                      setBillDetail((prev) =>
                        prev.map((item) => ({
                          ...item,
                          quantityReturn: e.target.checked ? item.quantity : 0,
                        }))
                      );
                    }}
                    checked={billDetail.every(
                      (e) => e.quantity === e.quantityReturn
                    )}
                  />
                </TableCell>
                <TableCell>Sản phẩm</TableCell>
                <TableCell align="center">Số lượng</TableCell>
                <TableCell align="center">Đơn giá</TableCell>
                <TableCell align="center">Tổng</TableCell>
                <TableCell align="center">Lý do trả hàng</TableCell>
                <TableCell align="center">Ghi chú</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {billDetail.map((product) => (
                <TableRow key={product.id}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={product.quantity === product.quantityReturn}
                      onChange={(e) =>
                        changeSL(
                          e.target.checked ? product.quantity : 0,
                          product
                        )
                      }
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
                    <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
                      <IconButton
                        size="small"
                        onClick={() =>
                          changeSL(product.quantityReturn - 1, product)
                        }
                      >
                        <RemoveCircle fontSize="small" />
                      </IconButton>
                      <TextField
                        size="small"
                        value={product.quantityReturn}
                        onChange={(e) =>
                          changeSL(e.target.value, product)
                        }
                        variant="standard"
                        sx={{ width: 60 }}
                        inputProps={{ inputMode: 'numeric' }}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              / {product.quantity}
                            </InputAdornment>
                          ),
                        }}
                      />
                      <IconButton
                        size="small"
                        onClick={() =>
                          changeSL(product.quantityReturn + 1, product)
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
                      {(product.price * product.quantityReturn).toLocaleString(
                        'it-IT',
                        { style: 'currency', currency: 'VND' }
                      )}
                    </Typography>
                  </TableCell>

                  {/* Lý do */}
                  <TableCell align="center">
                    <Stack spacing={1}>
                      <Select
                        size="small"
                        value={product.reason}
                        onChange={(e) => changeReason(e.target.value, product)}
                        displayEmpty
                        disabled={product.quantityReturn <= 0}
                      >
                        <MenuItem value="">
                          <em>Chọn lý do</em>
                        </MenuItem>
                        <MenuItem value="Sản phẩm bị lỗi">Sản phẩm bị lỗi</MenuItem>
                        <MenuItem value="Giao sai sản phẩm">Giao sai sản phẩm</MenuItem>
                        <MenuItem value="Không đúng mô tả">Không đúng mô tả</MenuItem>
                        <MenuItem value="Khác">Khác</MenuItem>
                      </Select>
                      {product.reason === 'Khác' && (
                        <TextField
                          size="small"
                          placeholder="Nhập lý do..."
                          value={product.customReason}
                          onChange={(e) => changeCustomReason(e.target.value, product)}
                          disabled={product.quantityReturn <= 0}
                        />
                      )}
                    </Stack>
                  </TableCell>

                  {/* Ghi chú */}
                  <TableCell align="center">
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Ghi chú"
                      value={product.note}
                      onChange={(e) => changeNote(e.target.value, product)}
                      disabled={product.quantityReturn <= 0}
                      multiline
                      rows={2}
                    />
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
