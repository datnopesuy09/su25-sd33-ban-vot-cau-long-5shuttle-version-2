import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Divider,
  Grid,
  Typography,
  Tabs,
  Tab,
  Paper,
  Stack,
} from '@mui/material';
import ModalVoucher from './modalVoucherDetail';
import voucher_icon from '../../../components/Assets/voucher_icon.png';
import Swal from 'sweetalert2';

function CustomTabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ py: 2 }}>{children}</Box>}
    </div>
  );
}

// Hàm định dạng tiền tệ
function formatCurrency(giaTri) {
  if (typeof giaTri !== 'number') return '0 đ';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(giaTri);
}

// Dữ liệu giả lập
const FAKE_PUBLIC_VOUCHERS = [
  {
    id: 1,
    ma: 'PUBLIC123',
    kieuGiaTri: 0,
    giaTri: 10,
    giaTriMax: 50000,
    dieuKienNhoNhat: 100000,
    ngayBatDau: '2025-07-01',
    ngayKetThuc: '2025-07-31',
  },
];

const FAKE_PRIVATE_VOUCHERS = [
  {
    id: 2,
    ma: 'PRIVATE456',
    kieuGiaTri: 1,
    giaTri: 30000,
    dieuKienNhoNhat: 150000,
    ngayBatDau: '2025-07-05',
    ngayKetThuc: '2025-07-20',
  },
];

export default function MyVoucher() {
  const [openModal, setOpenModal] = useState(false);
  const [valueTabs, setValueTabs] = useState(0);
  const [voucherByCode, setVoucherByCode] = useState({});
  const [voucherPublic, setVoucherPublic] = useState([]);
  const [voucherPrivate, setVoucherPrivate] = useState([]);

  const handleChange = (event, newValue) => {
    setValueTabs(newValue);
  };

  const handleOpenModal = (maVoucher) => {
    const voucher = [...voucherPublic, ...voucherPrivate].find((v) => v.ma === maVoucher);
    if (voucher) {
      setVoucherByCode(voucher);
      setOpenModal(true);
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Lỗi!',
        text: 'Không tìm thấy voucher!',
      });
    }
  };

  useEffect(() => {
    // Fake dữ liệu
    setVoucherPublic(FAKE_PUBLIC_VOUCHERS);
    setVoucherPrivate(FAKE_PRIVATE_VOUCHERS);
  }, []);

  const renderVoucherCard = (v) => (
    <Paper
      key={v.id}
      elevation={2}
      sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, mb: 2 }}
    >
      <Stack direction="row" spacing={2} alignItems="center">
        <img src={voucher_icon} alt="voucher_icon" style={{ width: 90, height: 80 }} />
        <Box>
          <Typography variant="body1">
            Giảm {v.kieuGiaTri === 0 ? `${v.giaTri}%` : formatCurrency(v.giaTri)}{' '}
            {v.giaTriMax && `Giảm tối đa ${formatCurrency(v.giaTriMax)}`}
            <br />
            Đơn Tối Thiểu {formatCurrency(v.dieuKienNhoNhat)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Hạn sử dụng: {new Date(v.ngayBatDau).toLocaleDateString()} -{' '}
            {new Date(v.ngayKetThuc).toLocaleDateString()}
          </Typography>
        </Box>
      </Stack>
      <Button variant="text" color="primary" onClick={() => handleOpenModal(v.ma)}>
        Xem chi tiết
      </Button>
    </Paper>
  );

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" mb={3} mt={1.5}>
        Phiếu giảm giá
      </Typography>
      <Divider />
      <Box mt={1}>
        <Tabs value={valueTabs} onChange={handleChange} indicatorColor="primary" textColor="primary">
          <Tab label="Công khai" />
          <Tab label="Cá nhân" />
        </Tabs>
        <CustomTabPanel value={valueTabs} index={0}>
          {voucherPublic.length > 0 ? (
            voucherPublic.map(renderVoucherCard)
          ) : (
            <Typography align="center" color="text.secondary">
              Không có phiếu giảm giá nào
            </Typography>
          )}
        </CustomTabPanel>
        <CustomTabPanel value={valueTabs} index={1}>
          {voucherPrivate.length > 0 ? (
            voucherPrivate.map(renderVoucherCard)
          ) : (
            <Typography align="center" color="text.secondary">
              Không có phiếu giảm giá nào
            </Typography>
          )}
        </CustomTabPanel>
      </Box>
      <ModalVoucher openModal={openModal} setOpenModal={setOpenModal} voucher={voucherByCode} />
    </Box>
  );
}