import React from 'react';
import dayjs from 'dayjs';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
  Divider,
  Button
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate } from 'react-router-dom';

// Hàm định dạng tiền tệ
function formatCurrency(giaTri) {
  if (typeof giaTri !== 'number') return '0 đ';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(giaTri);
}

export default function ModalVoucherDetail({ openModal, setOpenModal, voucher }) {
  const navigate = useNavigate();

  return (
    <Dialog
      open={openModal}
      onClose={() => setOpenModal(false)}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          maxHeight: '90vh',
          borderRadius: 1,
        }
      }}
    >
      <DialogTitle
        sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: 1, borderColor: 'divider' }}
      >
        <Typography variant="h6">Thông tin phiếu giảm giá</Typography>
        <IconButton onClick={() => setOpenModal(false)}>
          <CloseIcon color="error" />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ maxHeight: '65vh', overflowY: 'auto' }}>
        <Typography variant="body2" color="text.secondary">
          Giá trị: {voucher.kieuGiaTri === 0 ? `${voucher.giaTri}%` : formatCurrency(voucher.giaTri)}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Tối đa: {formatCurrency(voucher.giaTriMax)}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Áp dụng cho đơn tối thiểu: {formatCurrency(voucher.dieuKienNhoNhat)}
        </Typography>

        <Box mt={3}>
          <Typography variant="subtitle2">Hạn sử dụng</Typography>
          <Typography variant="body2" color="text.secondary">
            {dayjs(voucher.ngayBatDau).format('DD-MM-YYYY HH:mm')} -{' '}
            {dayjs(voucher.ngayKetThuc).format('DD-MM-YYYY HH:mm')}
          </Typography>
        </Box>

        <Box mt={3}>
          <Typography variant="subtitle2">Ưu đãi</Typography>
          <Typography variant="body2" color="text.secondary">
            Lượt sử dụng có hạn. Nhanh tay kẻo lỡ bạn nhé! Giảm{' '}
            {voucher.kieuGiaTri === 0 ? `${voucher.giaTri}%` : formatCurrency(voucher.giaTri)}. Đơn tối thiểu{' '}
            {formatCurrency(voucher.dieuKienNhoNhat)}.
          </Typography>
        </Box>

        <Box mt={3}>
          <Typography variant="subtitle2">Áp dụng cho sản phẩm</Typography>
          <Typography variant="body2" color="text.secondary">Áp dụng cho mọi sản phẩm</Typography>
        </Box>

        <Box mt={3}>
          <Typography variant="subtitle2">Hình thức thanh toán</Typography>
          <Typography variant="body2" color="text.secondary">Tất cả hình thức thanh toán</Typography>
        </Box>

        <Box mt={3}>
          <Typography variant="subtitle2">Đơn vị vận chuyển</Typography>
          <Typography variant="body2" color="text.secondary">Tất cả đơn vị vận chuyển</Typography>
        </Box>

        <Box mt={3}>
          <Typography variant="subtitle2">Xem chi tiết</Typography>
          <Typography variant="body2" color="text.secondary">Mã: {voucher.ma}</Typography>
          <Typography variant="body2" color="text.secondary">Tên: {voucher.ten}</Typography>
          <Typography variant="body2" color="text.secondary">Kiểu: {voucher.kieu === 0 ? 'Công khai' : 'Cá nhân'}</Typography>
          <Typography variant="body2" color="text.secondary">Loại: {voucher.kieuGiaTri === 0 ? 'Phần trăm' : 'Giá tiền'}</Typography>
          <Typography variant="body2" color="text.secondary">Số lượng: {voucher.soLuong}</Typography>
        </Box>

        <Box mt={3}>
          <Typography variant="subtitle2">Lưu ý</Typography>
          <Typography variant="body2" color="text.secondary">
            Đối với những phiếu giảm giá thuộc kiểu <strong>công khai</strong>, phiếu giảm giá sẽ được sử dụng bởi tất cả khách hàng!
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
