// OrderInfo.js

import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../../../contexts/adminAuthContext';
import axios from 'axios';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';

const OrderInfo = ({
  orderData,
  currentOrderStatus,
  checkOut,
  getInvoiceTypeStyle,
  getStatusLabel,
  getStatusStyle,
  getStatus,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [addressMode, setAddressMode] = useState('select'); // 'select', 'add', 'edit'

  // Address list and selection
  const [addressList, setAddressList] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);

  // Location data
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [selectedProvinceId, setSelectedProvinceId] = useState(null);
  const [selectedDistrictId, setSelectedDistrictId] = useState(null);

  // Form data for main order info
  const [formData, setFormData] = useState({
    tenNguoiNhan: orderData?.tenNguoiNhan || '',
    soDienThoai: orderData?.sdtNguoiNhan || '',
    tinh: orderData?.tinh || '',
    huyen: orderData?.huyen || '',
    xa: orderData?.xa || '',
    diaChi: orderData?.diaChi || '',
    ghiChu: orderData?.ghiChu || '',
    thoiGianGiaoHang: '23-12-2023',
    phiGiaoHang: '34.000',
  });

  // Form data for address management
  const [addressFormData, setAddressFormData] = useState({
    id: null,
    ten: '',
    sdt: '',
    diaChiCuThe: '',
    tinh: '',
    huyen: '',
    xa: '',
    loai: 0,
  });

  const [errors, setErrors] = useState({});
  const { admin } = useAdminAuth();

  // Get customer ID from orderData
  const customerId = orderData?.taiKhoan?.id || orderData?.khachHangId;
  const token = 'eyJhbGciOiJIUzUxMiJ9.eyJpc3MiOiI1c2h1dHRsZS5jb20iLCJzdWIiOiJwaGFtaHVuZ2cyNzA5QGdtYWlsLmNvbSIsImV4cCI6MTc1NTk0MjgyMCwiaWF0IjoxNzU1OTM1NjIwLCJzY29wZSI6IlJPTEVfVVNFUiJ9.-sLCn5IAnusJUBiCN55OcNfJeV_jiWbl2f0tp_Ja4ih_2EZTlY3hnRXi1XpaBWCwnkBpI8j4YnFYd4P3Iv1lBA';

  // Fetch customer addresses from API
  const fetchCustomerAddresses = async () => {
    if (!customerId || !token) {
      console.warn('Missing customerId or token for fetching addresses');
      return;
    }

    try {
      const res = await axios.get(`http://localhost:8080/dia-chi/getMyAddress`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const sorted = res.data.result.sort((a, b) => b.loai - a.loai); // Sort default address first
      console.log('==> Dữ liệu địa chỉ khách hàng:', sorted);
      setAddressList(sorted);

      // Set default address if exists
      const defaultAddress = sorted.find((addr) => addr.loai === 1);
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress.id);
        setFormData((prev) => ({
          ...prev,
          tenNguoiNhan: defaultAddress.ten,
          soDienThoai: defaultAddress.sdt,
          tinh: defaultAddress.tinh,
          huyen: defaultAddress.huyen,
          xa: defaultAddress.xa,
          diaChi: defaultAddress.diaChiCuThe,
        }));
      }
    } catch (error) {
      console.error('Lỗi khi tải danh sách địa chỉ:', error);
      toast.error('Lỗi khi tải danh sách địa chỉ');
    }
  };

  // Fetch provinces from API
  useEffect(() => {
    if (customerId) {
      fetchCustomerAddresses();
    }
    fetch('https://provinces.open-api.vn/api/?depth=1')
      .then((res) => res.json())
      .then((data) => {
        setProvinces(data);
      })
      .catch((error) => console.error('Error fetching provinces:', error));
  }, [customerId]);

  const fetchDistricts = async (provinceCode) => {
    try {
      const res = await fetch(`https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`);
      const data = await res.json();
      setDistricts(data.districts || []);
      return data.districts;
    } catch (error) {
      console.error('Error fetching districts:', error);
      return [];
    }
  };

  const fetchWards = async (districtCode) => {
    try {
      const res = await fetch(`https://provinces.open-api.vn/api/d/${districtCode}?depth=2`);
      const data = await res.json();
      setWards(data.wards || []);
      return data.wards;
    } catch (error) {
      console.error('Error fetching wards:', error);
      return [];
    }
  };

  // Handle address selection
  const handleAddressSelect = (addressId) => {
    const selectedAddr = addressList.find((addr) => addr.id === addressId);
    if (selectedAddr) {
      setSelectedAddressId(addressId);
      setFormData((prev) => ({
        ...prev,
        tenNguoiNhan: selectedAddr.ten,
        soDienThoai: selectedAddr.sdt,
        tinh: selectedAddr.tinh,
        huyen: selectedAddr.huyen,
        xa: selectedAddr.xa,
        diaChi: selectedAddr.diaChiCuThe,
      }));
    }
  };

  // Handle opening address management modal
  const handleOpenAddressModal = (mode, address = null) => {
    setAddressMode(mode);
    if (mode === 'edit' && address) {
      setAddressFormData({
        id: address.id,
        ten: address.ten,
        sdt: address.sdt,
        diaChiCuThe: address.diaChiCuThe,
        tinh: address.tinh,
        huyen: address.huyen,
        xa: address.xa,
        loai: address.loai,
      });
      loadLocationDataForEdit(address);
    } else if (mode === 'add') {
      setAddressFormData({
        id: null,
        ten: '',
        sdt: '',
        diaChiCuThe: '',
        tinh: '',
        huyen: '',
        xa: '',
        loai: 0,
      });
      setSelectedProvinceId(null);
      setSelectedDistrictId(null);
      setDistricts([]);
      setWards([]);
    }
    setErrors({});
    setIsAddressModalOpen(true);
  };

  const loadLocationDataForEdit = async (address) => {
    const foundProvince = provinces.find((p) => p.name === address.tinh);
    if (foundProvince) {
      setSelectedProvinceId(foundProvince.code);
      const districtsData = await fetchDistricts(foundProvince.code);
      const foundDistrict = districtsData.find((d) => d.name === address.huyen);
      if (foundDistrict) {
        setSelectedDistrictId(foundDistrict.code);
        await fetchWards(foundDistrict.code);
      }
    }
  };

  // Handle province change for address form
  const handleAddressProvinceChange = (e) => {
    const selectedOption = e.target.selectedOptions[0];
    const provinceName = selectedOption.value;
    const provinceCode = selectedOption.dataset.code;

    setAddressFormData((prev) => ({ ...prev, tinh: provinceName, huyen: '', xa: '' }));
    setSelectedProvinceId(provinceCode);
    setDistricts([]);
    setWards([]);
    if (provinceCode) {
      fetchDistricts(provinceCode);
    }
  };

  const handleAddressDistrictChange = (e) => {
    const selectedOption = e.target.selectedOptions[0];
    const districtName = selectedOption.value;
    const districtCode = selectedOption.dataset.code;

    setAddressFormData((prev) => ({ ...prev, huyen: districtName, xa: '' }));
    setSelectedDistrictId(districtCode);
    setWards([]);
    if (districtCode) {
      fetchWards(districtCode);
    }
  };

  const handleAddressWardChange = (e) => {
    const wardName = e.target.value;
    setAddressFormData((prev) => ({ ...prev, xa: wardName }));
  };

  // Handle input change for address form
  const handleAddressInputChange = (e) => {
    const { name, value } = e.target;
    setAddressFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle input change for main order form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Validate address form
  const validateAddressForm = () => {
    const newErrors = {};
    if (!addressFormData.ten.trim()) newErrors.ten = 'Vui lòng nhập tên.';
    if (!addressFormData.sdt.trim()) newErrors.sdt = 'Vui lòng nhập số điện thoại.';
    if (!addressFormData.tinh.trim()) newErrors.tinh = 'Chọn tỉnh/thành.';
    if (!addressFormData.huyen.trim()) newErrors.huyen = 'Chọn quận/huyện.';
    if (!addressFormData.xa.trim()) newErrors.xa = 'Chọn phường/xã.';
    if (!addressFormData.diaChiCuThe.trim()) newErrors.diaChiCuThe = 'Nhập địa chỉ cụ thể.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle address form submit
  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    if (!validateAddressForm()) return;

    const isEdit = !!addressFormData.id;

    const confirm = await Swal.fire({
      title: isEdit ? 'Cập nhật địa chỉ?' : 'Thêm địa chỉ mới?',
      text: isEdit ? 'Bạn có chắc chắn muốn cập nhật địa chỉ này?' : 'Bạn có chắc chắn muốn thêm địa chỉ mới?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: isEdit ? 'Cập nhật' : 'Thêm',
      cancelButtonText: 'Hủy',
    });

    if (!confirm.isConfirmed) return;

    const requestBody = {
      ten: addressFormData.ten,
      sdt: addressFormData.sdt,
      diaChiCuThe: addressFormData.diaChiCuThe,
      tinh: addressFormData.tinh,
      huyen: addressFormData.huyen,
      xa: addressFormData.xa,
    };

    try {
      if (isEdit) {
        await axios.put(`http://localhost:8080/dia-chi/update/${addressFormData.id}`, requestBody, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success('Cập nhật địa chỉ thành công!');
      } else {
        requestBody.khachHangId = customerId;
        await axios.post('http://localhost:8080/dia-chi/create', requestBody, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success('Thêm địa chỉ thành công!');
      }
      setIsAddressModalOpen(false);
      fetchCustomerAddresses();
    } catch (error) {
      console.error('Lỗi khi xử lý địa chỉ:', error);
      toast.error('Không thể xử lý địa chỉ');
    }
  };

  // Handle address deletion
  const handleDeleteAddress = async (addressId) => {
    const confirm = await Swal.fire({
      title: 'Xác nhận xóa',
      text: 'Bạn có chắc chắn muốn xóa địa chỉ này?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy',
      confirmButtonColor: '#d33',
    });

    if (!confirm.isConfirmed) return;

    try {
      await axios.delete(`http://localhost:8080/dia-chi/${addressId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Đã xóa địa chỉ!');

      if (selectedAddressId === addressId) {
        const remainingAddresses = addressList.filter((addr) => addr.id !== addressId);
        if (remainingAddresses.length > 0) {
          handleAddressSelect(remainingAddresses[0].id);
        } else {
          setSelectedAddressId(null);
          setFormData((prev) => ({
            ...prev,
            tenNguoiNhan: '',
            soDienThoai: '',
            tinh: '',
            huyen: '',
            xa: '',
            diaChi: '',
          }));
        }
      }

      fetchCustomerAddresses();
    } catch (error) {
      console.error('Lỗi khi xóa địa chỉ:', error);
      toast.error('Xóa địa chỉ thất bại');
    }
  };

  // Handle setting default address
  const handleSetDefaultAddress = async (addressId) => {
    const confirm = await Swal.fire({
      title: 'Đặt làm mặc định?',
      text: 'Bạn muốn đặt địa chỉ này làm địa chỉ mặc định?',
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: 'Đồng ý',
      cancelButtonText: 'Hủy',
    });

    if (!confirm.isConfirmed) return;

    try {
      await axios.put(
        `http://localhost:8080/dia-chi/update-loai/${addressId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success('Đã đặt địa chỉ mặc định');
      fetchCustomerAddresses();
    } catch (error) {
      console.error('Lỗi khi đặt địa chỉ mặc định:', error);
      toast.error('Không thể đặt mặc định');
    }
  };

  // Handle main form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Cập nhật thông tin đơn hàng:', formData);
    try {
      // Uncomment to enable API call
      // await axios.put(`http://localhost:8080/orders/${orderData.id}`, formData, {
      //   headers: { Authorization: `Bearer ${token}` },
      // });
      toast.success('Cập nhật đơn hàng thành công!');
      setIsModalOpen(false);
    } catch (error) {
      console.error('Lỗi khi cập nhật đơn hàng:', error);
      toast.error('Cập nhật đơn hàng thất bại');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 max-w-5xl mx-auto mt-8">
      {/* Header */}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 rounded-t-lg">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-800">Thông tin đơn hàng - Đơn tại quầy</h2>
          <button
            onClick={() => setIsModalOpen(true)}
            disabled={currentOrderStatus >= 3}
            className={`bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 ${currentOrderStatus >= 3 ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Cập nhật
          </button>
        </div>
      </div>

      {/* Order Information */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mb-8">
          <div className="flex flex-wrap md:flex-nowrap gap-4 mb-2">
            <div className="flex items-center flex-shrink-0 min-w-[30px] font-semibold text-gray-600">Mã:</div>
            <div className="flex-1 min-w-0 text-gray-900 truncate whitespace-nowrap">{orderData.ma}</div>
          </div>

          <div className="flex flex-wrap md:flex-nowrap gap-4 mb-2">
            <div className="flex items-center flex-shrink-0 min-w-[120px] font-semibold text-gray-600">
              Số người nhận:
            </div>
            <div className="flex-1 min-w-0 text-gray-900 truncate whitespace-nowrap">{orderData.sdtNguoiNhan}</div>
          </div>

          <div className="flex flex-wrap md:flex-nowrap gap-4 mb-2">
            <div className="flex items-center flex-shrink-0 min-w-[120px] font-semibold text-gray-600">
              Tên khách hàng:
            </div>
            <div className="flex-1 min-w-0 text-gray-900 truncate whitespace-nowrap">{orderData.taiKhoan?.hoTen}</div>
          </div>

          <div className="flex flex-wrap md:flex-nowrap gap-4 mb-2">
            <div className="flex items-center flex-shrink-0 min-w-[30px] font-semibold text-gray-600">Loại:</div>
            <div className="flex-1 min-w-0">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${getInvoiceTypeStyle(
                  orderData.loaiHoaDon
                )}`}
              >
                {orderData.loaiHoaDon}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap md:flex-nowrap gap-4 mb-2">
            <div className="flex items-center flex-shrink-0 min-w-[120px] font-semibold text-gray-600">Trạng thái:</div>
            <div className="flex-1 min-w-0">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusLabel(currentOrderStatus).color} whitespace-nowrap`}
              >
                {getStatusLabel(currentOrderStatus).label}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap md:flex-nowrap gap-4 mb-2">
            <div className="flex items-center flex-shrink-0 min-w-[120px] font-semibold text-gray-600">
              Tên người nhận:
            </div>
            <div className="flex-1 min-w-0 text-gray-900 truncate whitespace-nowrap">{orderData.tenNguoiNhan}</div>
          </div>
        </div>
      </div>

      {/* Main Update Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setIsModalOpen(false)}
          />

          <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-100 transform transition-all duration-300 scale-100 opacity-100">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-white">Cập nhật thông tin đơn hàng</h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-white hover:text-gray-200 transition-colors duration-200 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-white hover:bg-opacity-20"
                >
                  ×
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Address Selection Section */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-semibold text-gray-800 flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    Địa chỉ giao hàng
                  </h4>
                  <button
                    type="button"
                    onClick={() => handleOpenAddressModal('add')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                  >
                    + Thêm địa chỉ mới
                  </button>
                </div>

                {/* Address List */}
                <div className="space-y-3 mb-4">
                  {addressList.map((address) => (
                    <div
                      key={address.id}
                      className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                        selectedAddressId === address.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:border-blue-300'
                      }`}
                      onClick={() => handleAddressSelect(address.id)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-medium text-gray-800">{address.ten}</span>
                            <span className="text-gray-600">|</span>
                            <span className="text-gray-600">{address.sdt}</span>
                            {address.loai === 1 && (
                              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                                Mặc định
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">
                            {address.diaChiCuThe}, {address.xa}, {address.huyen}, {address.tinh}
                          </p>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenAddressModal('edit', address);
                            }}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            Sửa
                          </button>
                          {address.loai !== 1 && (
                            <>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteAddress(address.id);
                                }}
                                className="text-red-600 hover:text-red-800 text-sm font-medium ml-2"
                              >
                                Xóa
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSetDefaultAddress(address.id);
                                }}
                                className="text-green-600 hover:text-green-800 text-sm font-medium ml-2"
                              >
                                Đặt mặc định
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Current Order Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tên người nhận</label>
                  <input
                    type="text"
                    name="tenNguoiNhan"
                    value={formData.tenNguoiNhan}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    placeholder="Nhập tên người nhận"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại</label>
                  <input
                    type="text"
                    name="soDienThoai"
                    value={formData.soDienThoai}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    placeholder="Nhập số điện thoại"
                  />
                </div>
              </div>

              {/* Address Display */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Địa chỉ giao hàng</label>
                <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700">
                  {formData.diaChi}, {formData.xa}, {formData.huyen}, {formData.tinh}
                </div>
              </div>

              {/* Note */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ghi chú</label>
                <textarea
                  name="ghiChu"
                  value={formData.ghiChu}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 resize-none"
                  placeholder="Nhập ghi chú (nếu có)"
                />
              </div>

              {/* Delivery Information */}
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-lg border border-purple-200">
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                  Thông tin giao hàng
                </h4>
                <div className="space-y-2 text-sm text-gray-700">
                  <div className="flex justify-between">
                    <span>Thời gian giao hàng dự kiến:</span>
                    <span className="font-medium">{formData.thoiGianGiaoHang}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Phí giao hàng:</span>
                    <span className="font-medium text-purple-600">{formData.phiGiaoHang} đ</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Xác nhận
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Address Management Modal */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-60 p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setIsAddressModalOpen(false)}
          />

          <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-100 transform transition-all duration-300 scale-100 opacity-100">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-white">
                  {addressMode === 'add' ? 'Thêm địa chỉ mới' : 'Chỉnh sửa địa chỉ'}
                </h3>
                <button
                  onClick={() => setIsAddressModalOpen(false)}
                  className="text-white hover:text-gray-200 transition-colors duration-200 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-white hover:bg-opacity-20"
                >
                  ×
                </button>
              </div>
            </div>

            <form onSubmit={handleAddressSubmit} className="p-6 space-y-6">
              {/* Name and Phone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Họ tên</label>
                  <input
                    type="text"
                    name="ten"
                    value={addressFormData.ten}
                    onChange={handleAddressInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                      errors.ten ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Nhập họ tên"
                  />
                  {errors.ten && <p className="text-red-500 text-sm mt-1">{errors.ten}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại</label>
                  <input
                    type="text"
                    name="sdt"
                    value={addressFormData.sdt}
                    onChange={handleAddressInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                      errors.sdt ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Nhập số điện thoại"
                  />
                  {errors.sdt && <p className="text-red-500 text-sm mt-1">{errors.sdt}</p>}
                </div>
              </div>

              {/* Location Selection */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tỉnh/Thành phố</label>
                  <select
                    name="tinh"
                    value={addressFormData.tinh}
                    onChange={handleAddressProvinceChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white ${
                      errors.tinh ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Chọn tỉnh/thành phố</option>
                    {provinces.map((province) => (
                      <option key={province.code} value={province.name} data-code={province.code}>
                        {province.name}
                      </option>
                    ))}
                  </select>
                  {errors.tinh && <p className="text-red-500 text-sm mt-1">{errors.tinh}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Quận/Huyện</label>
                  <select
                    name="huyen"
                    value={addressFormData.huyen}
                    onChange={handleAddressDistrictChange}
                    disabled={!selectedProvinceId}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white ${
                      errors.huyen ? 'border-red-500' : 'border-gray-300'
                    } ${!selectedProvinceId ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  >
                    <option value="">Chọn quận/huyện</option>
                    {districts.map((district) => (
                      <option key={district.code} value={district.name} data-code={district.code}>
                        {district.name}
                      </option>
                    ))}
                  </select>
                  {errors.huyen && <p className="text-red-500 text-sm mt-1">{errors.huyen}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Xã/Phường/Thị trấn</label>
                  <select
                    name="xa"
                    value={addressFormData.xa}
                    onChange={handleAddressWardChange}
                    disabled={!selectedDistrictId}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white ${
                      errors.xa ? 'border-red-500' : 'border-gray-300'
                    } ${!selectedDistrictId ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  >
                    <option value="">Chọn xã/phường</option>
                    {wards.map((ward) => (
                      <option key={ward.code} value={ward.name}>
                        {ward.name}
                      </option>
                    ))}
                  </select>
                  {errors.xa && <p className="text-red-500 text-sm mt-1">{errors.xa}</p>}
                </div>
              </div>

              {/* Detailed Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Địa chỉ cụ thể</label>
                <input
                  type="text"
                  name="diaChiCuThe"
                  value={addressFormData.diaChiCuThe}
                  onChange={handleAddressInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                    errors.diaChiCuThe ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Nhập địa chỉ cụ thể (số nhà, tên đường...)"
                />
                {errors.diaChiCuThe && <p className="text-red-500 text-sm mt-1">{errors.diaChiCuThe}</p>}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsAddressModalOpen(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  {addressMode === 'add' ? 'Thêm địa chỉ' : 'Cập nhật'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment History Section */}
      <div className="border-t border-gray-200">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-800">Lịch sử thanh toán</h3>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 border-b border-gray-200">
                    Số tiền
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 border-b border-gray-200">
                    Thời gian
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 border-b border-gray-200">
                    PTTT
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 border-b border-gray-200">
                    Trạng thái
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 border-b border-gray-200">
                    Ghi chú
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 border-b border-gray-200">
                    Nhân viên xác nhận
                  </th>
                </tr>
              </thead>
              <tbody>
                {checkOut.map((ck, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-4 text-sm text-gray-900 border-b border-gray-100">
                      {ck.tongTien.toLocaleString()}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900 border-b border-gray-100">{ck.ngayTao}</td>
                    <td className="px-4 py-4 text-sm border-b border-gray-100">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusStyle(ck.phuongThucThanhToan)}`}>
                        {ck.phuongThucThanhToan}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm border-b border-gray-100">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusStyle(ck.trangThai)}`}>
                        {getStatus(ck.trangThai).label}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900 border-b border-gray-100">-</td>
                    <td className="px-4 py-4 text-sm text-gray-900 border-b border-gray-100">{admin?.hoTen || ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderInfo;