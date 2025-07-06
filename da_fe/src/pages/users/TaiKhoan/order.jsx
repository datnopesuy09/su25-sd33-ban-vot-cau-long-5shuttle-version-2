import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
// import package_icon from '../../../components/Assets/package_icon.png'
import axios from 'axios';
import dayjs from 'dayjs';

function UserOrder() {
  const [selectedTab, setSelectedTab] = useState('Tất cả');
  const [listHoaDon, setListHoaDon] = useState([]);
  const [customerId, setCustomerId] = useState(null);

  const tabs = ['Tất cả', 'Chờ xác nhận', 'Chờ giao hàng', 'Đang vận chuyển', 'Hoàn thành', 'Đã hủy', 'Trả hàng'];

  const getStatus = (status) => {
    const statuses = ['', 'Chờ xác nhận', 'Chờ giao hàng', 'Đang vận chuyển', 'Đã giao hàng', 'Chờ thanh toán', 'Đã thanh toán', 'Hoàn thành', 'Đã hủy', 'Trả hàng'];
    return statuses[status] || 'Không xác định';
  };

  const formatCurrency = (value) => {
    return value.toLocaleString('vi-VN', {
      style: 'currency',
      currency: 'VND',
    });
  };

  const filteredBills = listHoaDon.filter((bill) => {
    if (selectedTab === 'Tất cả') return true;
    if (selectedTab === 'Chờ xác nhận') return bill.trangThai === 1;
    if (selectedTab === 'Chờ giao hàng') return bill.trangThai === 2;
    if (selectedTab === 'Đang vận chuyển') return bill.trangThai === 3;
    if (selectedTab === 'Hoàn thành') return bill.trangThai === 7;
    if (selectedTab === 'Đã hủy') return bill.trangThai === 8;
    if (selectedTab === 'Trả hàng') return bill.trangThai === 9;
    return false;
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const fetchUserInfo = async () => {
        try {
          const response = await axios.get('http://localhost:8080/api/tai-khoan/my-info', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setCustomerId(response.data.id);
          console.log("Customer ID:", response.data.id);
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      };
      fetchUserInfo();
    }
  }, []);

  const loadHoaDon = async (customerId) => {
    try {
      if (!customerId) {
        console.error("Customer ID is null");
        return;
      }
      const response = await axios.get(`http://localhost:8080/api/hoa-don/get-hd-by-id-kh/${customerId}`);
      setListHoaDon(response.data);
      console.log(response.data);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    }
  };

  useEffect(() => {
    if (customerId) {
      loadHoaDon(customerId);
    }
  }, [customerId]);

  return (
    <div className="order p-4">
      {/* Tabs */}
      <div className="mb-4">
        <div className="flex space-x-6 pb-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`py-2 text-base font-medium hover:text-indigo-600 ${selectedTab === tab ? "py-2 border-b-2 border-indigo-600 text-indigo-600" : ""
                }`}
              onClick={() => setSelectedTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Search Input */}
      <div className="relative mb-4">
        <span className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400">
          <MagnifyingGlassIcon className="h-5 w-5" />
        </span>
        <input
          type="text"
          placeholder="Tìm kiếm theo mã hóa đơn"
          className="w-full p-2 pl-10 focus:outline-none border border-gray-400 rounded-sm"
          onChange={(e) => {
            const valueNhap = e.target.value;
            const specialCharsRegex = /[!@#\$%\^&*\(\),.?":{}|<>[\]]/;
            if (specialCharsRegex.test(valueNhap)) {
              toast.warning('Tìm kiếm không được có kí tự đặc biệt');
            }
          }}
        />
      </div>

      {/* Bills List */}
      <div className="max-h-96 overflow-auto">
        {filteredBills.length > 0 ? (
          filteredBills.map((item) => (
            <div key={item.id} className="bg-white p-4 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-base font-semibold">{item.ma}</span>
                <span
                  className={`px-2 py-1 text-sm rounded-sm bg-orange-200
                    }`}
                >
                  {getStatus(item.trangThai)}
                </span>
              </div>
              <div className="border-t border-gray-300 my-2"></div>
              <div className="flex justify-between">
                <div>
                  <p className="text-sm">Ngày đặt hàng: {dayjs(item.ngayTao).format('DD/MM/YYYY HH:mm')}</p>
                  <Link
                    to={`/profile/order-detail/${item.id}`}
                    className="mt-2 inline-block bg-indigo-500 text-white px-4 py-2 rounded-sm"
                  >
                    Thông tin chi tiết
                  </Link>
                </div>
                <div>
                  <p className="text-sm">Tiền ship: {"25.000 VND"}</p>
                  <p className="text-sm">Tổng tiền: {formatCurrency(item.tongTien)}</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          // Thông báo khi không có hóa đơn
          <div className="flex flex-col items-center justify-center text-gray-500 mt-4">
            {/* <img src={package_icon} alt="" className="w-20 h-20 opacity-70" /> */}
            <p>Chưa có đơn hàng</p>
          </div>
        )}
      </div>

    </div>
  );
};
export default UserOrder