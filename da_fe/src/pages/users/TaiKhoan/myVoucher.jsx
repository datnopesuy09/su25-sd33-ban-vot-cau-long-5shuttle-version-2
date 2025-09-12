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
import { 
  Tag, 
  Gift, 
  Calendar, 
  DollarSign, 
  Eye, 
  Ticket, 
  Clock, 
  Star,
  Sparkles,
  TrendingUp
} from 'lucide-react';
import ModalVoucher from './modalVoucherDetail';
import voucher_icon from '../../../components/Assets/voucher_icon.png';
import Swal from 'sweetalert2';
import './myVoucher-styles.css';

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

  const renderVoucherCard = (v, index) => (
    <div 
      key={v.id || index} 
      className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden voucher-card"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {/* Voucher Header */}
      <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-orange-100 rounded-lg p-2 icon-wrapper">
              <Gift className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
                <Ticket className="w-3 h-3" />
                VOUCHER
              </span>
              <h3 className="font-semibold text-gray-800 mt-1">{v.ten}</h3>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-orange-600">
              {v.kieuGiaTri === 0 ? `${v.giaTri}%` : formatCurrency(v.giaTri)}
            </div>
            <div className="text-xs text-gray-500">giảm giá</div>
          </div>
        </div>
      </div>

      {/* Voucher Content */}
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <DollarSign className="w-4 h-4 text-gray-400" />
          <span>Tối đa: <strong className="text-gray-800">{formatCurrency(v.giaTriMax)}</strong></span>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <TrendingUp className="w-4 h-4 text-gray-400" />
          <span>Đơn tối thiểu: <strong className="text-gray-800">{formatCurrency(v.dieuKienNhoNhat)}</strong></span>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span className="text-xs">
            {new Date(v.ngayBatDau).toLocaleDateString('vi-VN')} - {new Date(v.ngayKetThuc).toLocaleDateString('vi-VN')}
          </span>
        </div>

        {/* Action Button */}
        <div className="pt-3 border-t border-gray-100">
          <button
            onClick={() => handleOpenModal(v.ma)}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors action-button"
          >
            <Eye className="w-4 h-4" />
            Xem chi tiết
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full myVoucher-container">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-xl shadow-sm border border-orange-100 mb-6">
        <div className="flex items-center gap-4">
          <div className="bg-orange-100 rounded-lg p-3 icon-wrapper">
            <Tag className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold gradient-text">Phiếu giảm giá</h1>
            <p className="text-gray-600 mt-1">Quản lý và sử dụng các voucher của bạn</p>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm stats-card">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 rounded-lg p-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Công khai</p>
              <p className="text-xl font-bold text-gray-800">{voucherPublic.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm stats-card">
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 rounded-lg p-2">
              <Star className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Cá nhân</p>
              <p className="text-xl font-bold text-gray-800">{voucherPrivate.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm stats-card">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 rounded-lg p-2">
              <Clock className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Tổng cộng</p>
              <p className="text-xl font-bold text-gray-800">{voucherPublic.length + voucherPrivate.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-200">
          <Tabs 
            value={valueTabs} 
            onChange={handleChange} 
            indicatorColor="primary" 
            textColor="primary"
            sx={{
              '& .MuiTab-root': {
                fontWeight: 600,
                textTransform: 'none',
                fontSize: '1rem',
                minHeight: 60,
              },
            }}
          >
            <Tab 
              label={
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Công khai
                </div>
              } 
            />
            <Tab 
              label={
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  Cá nhân
                </div>
              } 
            />
          </Tabs>
        </div>

        <div className="p-6">
          <div className="voucher-list">
            <div value={valueTabs} index={0}>
              {valueTabs === 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {voucherPublic.length > 0 ? (
                    voucherPublic.map(renderVoucherCard)
                  ) : (
                    <div className="col-span-full text-center py-12">
                      <div className="bg-gray-100 rounded-full p-4 w-16 h-16 mx-auto mb-4">
                        <Tag className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-600">Không có phiếu giảm giá công khai nào</p>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div value={valueTabs} index={1}>
              {valueTabs === 1 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {voucherPrivate.length > 0 ? (
                    voucherPrivate.map(renderVoucherCard)
                  ) : (
                    <div className="col-span-full text-center py-12">
                      <div className="bg-gray-100 rounded-full p-4 w-16 h-16 mx-auto mb-4">
                        <Star className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-600">Không có phiếu giảm giá cá nhân nào</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <ModalVoucher openModal={openModal} setOpenModal={setOpenModal} voucher={voucherByCode} />
    </div>
  );
}