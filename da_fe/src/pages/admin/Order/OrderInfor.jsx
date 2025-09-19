// OrderInfo.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    User,
    Phone,
    MapPin,
    CreditCard,
    Clock,
    DollarSign,
    Tag,
    CheckCircle,
    Edit3,
    X,
    Hash,
    FileText,
    Calendar,
    Truck,
} from 'lucide-react';

const OrderInfo = ({
    orderData,
    currentOrderStatus,
    checkOut,
    getInvoiceTypeStyle,
    getStatusLabel,
    getStatusStyle,
    getStatus,
    onUpdateDeliveryInfo, // Callback function để xử lý cập nhật
}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        tenNguoiNhan: orderData.tenNguoiNhan || '',
        sdtNguoiNhan: orderData.sdtNguoiNhan || '',
        diaChiCuThe: '',
        tinh: '',
        huyen: '',
        xa: '',
        phiShip: orderData.phiShip || 30000, // Thêm field phí ship với giá trị mặc định
    });
console.log("checkout", checkOut)
    // State for address API
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);
    const [selectedProvince, setSelectedProvince] = useState(null);
    const [selectedDistrict, setSelectedDistrict] = useState(null);
    const [selectedWard, setSelectedWard] = useState(null);

    // Parse existing address when opening modal
    const parseExistingAddress = async (fullAddress) => {
        if (!fullAddress) return;

        const parts = fullAddress.split(', ').map((part) => part.trim());
        if (parts.length >= 4) {
            const diaChiCuThe = parts[0] || '';
            const xa = parts[1] || '';
            const huyen = parts[2] || '';
            const tinh = parts[3] || '';

            setFormData((prev) => ({
                ...prev,
                diaChiCuThe,
                xa,
                huyen,
                tinh,
            }));

            // Try to find and set the province
            if (provinces.length > 0) {
                const foundProvince = provinces.find(
                    (p) =>
                        p.name.toLowerCase().includes(tinh.toLowerCase()) ||
                        tinh.toLowerCase().includes(p.name.toLowerCase()),
                );

                if (foundProvince) {
                    setSelectedProvince(foundProvince);

                    // Fetch districts for this province
                    try {
                        const res = await axios.get(
                            `https://provinces.open-api.vn/api/p/${foundProvince.code}?depth=2`,
                        );
                        setDistricts(res.data.districts);

                        // Try to find district
                        const foundDistrict = res.data.districts.find(
                            (d) =>
                                d.name.toLowerCase().includes(huyen.toLowerCase()) ||
                                huyen.toLowerCase().includes(d.name.toLowerCase()),
                        );

                        if (foundDistrict) {
                            setSelectedDistrict(foundDistrict);

                            // Fetch wards for this district
                            try {
                                const wardRes = await axios.get(
                                    `https://provinces.open-api.vn/api/d/${foundDistrict.code}?depth=2`,
                                );
                                setWards(wardRes.data.wards);

                                // Try to find ward
                                const foundWard = wardRes.data.wards.find(
                                    (w) =>
                                        w.name.toLowerCase().includes(xa.toLowerCase()) ||
                                        xa.toLowerCase().includes(w.name.toLowerCase()),
                                );

                                if (foundWard) {
                                    setSelectedWard(foundWard);
                                }
                            } catch (error) {
                                console.error('Error fetching wards:', error);
                            }
                        }
                    } catch (error) {
                        console.error('Error fetching districts:', error);
                    }
                }
            }
        }
    };

    // Fetch provinces
    const fetchProvinces = async () => {
        try {
            const res = await axios.get('https://provinces.open-api.vn/api/p/');
            setProvinces(res.data);
        } catch (error) {
            console.error('Error fetching provinces:', error);
        }
    };

    // Fetch districts
    const fetchDistricts = async (provinceCode) => {
        try {
            setDistricts([]);
            setWards([]);
            setSelectedDistrict(null);
            setSelectedWard(null);

            const res = await axios.get(`https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`);
            setDistricts(res.data.districts);
        } catch (error) {
            console.error('Error fetching districts:', error);
        }
    };

    // Fetch wards
    const fetchWards = async (districtCode) => {
        try {
            setWards([]);
            setSelectedWard(null);

            const res = await axios.get(`https://provinces.open-api.vn/api/d/${districtCode}?depth=2`);
            setWards(res.data.wards);
        } catch (error) {
            console.error('Error fetching wards:', error);
        }
    };

    useEffect(() => {
        fetchProvinces();
    }, []);

    const handleOpenModal = async () => {
        setFormData({
            tenNguoiNhan: orderData.tenNguoiNhan || '',
            sdtNguoiNhan: orderData.sdtNguoiNhan || '',
            diaChiCuThe: '',
            tinh: '',
            huyen: '',
            xa: '',
        });

        // Reset address selectors
        setSelectedProvince(null);
        setSelectedDistrict(null);
        setSelectedWard(null);
        setDistricts([]);
        setWards([]);

        setIsModalOpen(true);

        // Parse existing address after modal is opened
        if (orderData.diaChiNguoiNhan) {
            setTimeout(async () => {
                await parseExistingAddress(orderData.diaChiNguoiNhan);
            }, 100);
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        // Reset address selectors
        setSelectedProvince(null);
        setSelectedDistrict(null);
        setSelectedWard(null);
        setDistricts([]);
        setWards([]);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleProvinceChange = (e) => {
        const provinceCode = e.target.value;
        const province = provinces.find((p) => p.code === parseInt(provinceCode));

        setSelectedProvince(province);
        setSelectedDistrict(null);
        setSelectedWard(null);
        setDistricts([]);
        setWards([]);

        setFormData((prev) => ({
            ...prev,
            tinh: province ? province.name : '',
            huyen: '',
            xa: '',
        }));

        if (province) {
            fetchDistricts(province.code);
        }
    };

    const handleDistrictChange = (e) => {
        const districtCode = e.target.value;
        const district = districts.find((d) => d.code === parseInt(districtCode));

        setSelectedDistrict(district);
        setSelectedWard(null);
        setWards([]);

        setFormData((prev) => ({
            ...prev,
            huyen: district ? district.name : '',
            xa: '',
        }));

        if (district) {
            fetchWards(district.code);
        }
    };

    const handleWardChange = (e) => {
        const wardCode = e.target.value;
        const ward = wards.find((w) => w.code === parseInt(wardCode));

        setSelectedWard(ward);
        setFormData((prev) => ({
            ...prev,
            xa: ward ? ward.name : '',
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Construct full address
        const fullAddress = `${formData.diaChiCuThe}, ${formData.xa}, ${formData.huyen}, ${formData.tinh}`;

        const submitData = {
            tenNguoiNhan: formData.tenNguoiNhan,
            sdtNguoiNhan: formData.sdtNguoiNhan,
            diaChiNguoiNhan: fullAddress,
            phiShip: parseFloat(formData.phiShip) || 0, // Thêm phí ship vào data gửi lên server
        };

        if (onUpdateDeliveryInfo) {
            try {
                await onUpdateDeliveryInfo(submitData);
                setIsModalOpen(false);
            } catch (error) {
                console.error('Error updating delivery info:', error);
                // Có thể thêm thông báo lỗi ở đây
            }
        }
    };
    return (
        <div className="bg-white rounded-2xl shadow-xl max-w-6xl mx-auto mt-8 overflow-hidden border border-gray-200">
            {/* Header */}
            <div className="bg-gray-50 px-6 py-5 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-100 rounded-xl p-2">
                            <FileText className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-800">Thông tin đơn hàng</h2>
                            <p className="text-gray-600 text-sm">Đơn tại quầy</p>
                        </div>
                    </div>

                    <button
                        onClick={handleOpenModal}
                        disabled={currentOrderStatus >= 3}
                        title={
                            currentOrderStatus >= 3
                                ? 'Không thể cập nhật sau khi đơn đã chuyển sang trạng thái Đang vận chuyển'
                                : ''
                        }
                        className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center gap-2
                            ${
                                currentOrderStatus >= 3
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                            }
                        `}
                    >
                        <Edit3 className="w-4 h-4" />
                        Cập nhật
                    </button>
                </div>
            </div>

            {/* Order Information */}
            <div className="p-6">
                {/* Basic Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {/* Mã đơn hàng */}
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-100 rounded-lg p-2">
                                <Hash className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <div className="text-gray-500 text-sm">Mã đơn hàng</div>
                                <div className="text-gray-800 font-semibold">{orderData.ma}</div>
                            </div>
                        </div>
                    </div>

                    {/* Tên khách hàng */}
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                        <div className="flex items-center gap-3">
                            <div className="bg-green-100 rounded-lg p-2">
                                <User className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <div className="text-gray-500 text-sm">Khách hàng</div>
                                <div className="text-gray-800 font-semibold">{orderData.taiKhoan.hoTen}</div>
                            </div>
                        </div>
                    </div>

                    {/* Loại hóa đơn */}
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                        <div className="flex items-center gap-3">
                            <div className="bg-purple-100 rounded-lg p-2">
                                <Tag className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                                <div className="text-gray-500 text-sm">Loại hóa đơn</div>
                                <span
                                    className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getInvoiceTypeStyle(orderData.loaiHoaDon)}`}
                                >
                                    {orderData.loaiHoaDon}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Phí ship */}
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                        <div className="flex items-center gap-3">
                            <div className="bg-orange-100 rounded-lg p-2">
                                <Truck className="w-5 h-5 text-orange-600" />
                            </div>
                            <div>
                                <div className="text-gray-500 text-sm">Phí giao hàng</div>
                                <div className="text-gray-800 font-semibold">
                                    {orderData.phiShip 
                                        ? `${orderData.phiShip.toLocaleString('vi-VN')}đ`
                                        : '30,000đ'
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Delivery Info */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 mb-6 border border-blue-200">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-blue-600" />
                            Thông tin giao hàng
                        </h3>
                        <span
                            className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getStatusLabel(currentOrderStatus).color}`}
                        >
                            {getStatusLabel(currentOrderStatus).label}
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <User className="w-4 h-4 text-gray-500" />
                                <div>
                                    <div className="text-gray-500 text-sm">Tên người nhận</div>
                                    <div className="text-gray-800 font-medium">
                                        {orderData.tenNguoiNhan || (
                                            <span className="text-gray-400 italic">Chưa cập nhật</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <Phone className="w-4 h-4 text-gray-500" />
                                <div>
                                    <div className="text-gray-500 text-sm">Số điện thoại</div>
                                    <div className="text-gray-800 font-medium">
                                        {orderData.sdtNguoiNhan || (
                                            <span className="text-gray-400 italic">Chưa cập nhật</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <div className="flex items-start gap-3">
                                <MapPin className="w-4 h-4 text-gray-500 mt-1" />
                                <div className="flex-1">
                                    <div className="text-gray-500 text-sm">Địa chỉ giao hàng</div>
                                    <div className="text-gray-800 font-medium">
                                        {orderData.diaChiNguoiNhan || (
                                            <span className="text-gray-400 italic">Chưa cập nhật</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>{' '}
                {/* Payment History Section */}
                <div className="bg-white rounded-xl border border-gray-200">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                <CreditCard className="w-5 h-5 text-green-600" />
                                Lịch sử thanh toán
                            </h3>
                            <div className="bg-green-100 text-green-700 rounded-lg px-3 py-1 text-sm font-medium">
                                {checkOut.length} giao dịch
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50">
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <DollarSign className="w-4 h-4" />
                                            Số tiền
                                        </div>
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4" />
                                            Thời gian
                                        </div>
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <CreditCard className="w-4 h-4" />
                                            PTTT
                                        </div>
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4" />
                                            Trạng thái
                                        </div>
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <FileText className="w-4 h-4" />
                                            Ghi chú
                                        </div>
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <User className="w-4 h-4" />
                                            NV xác nhận
                                        </div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {checkOut.map((ck, index) => (
                                    <tr key={index} className="hover:bg-gray-50 transition-colors duration-150">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                <span className="text-green-600 font-semibold">
                                                    {ck.tongTien.toLocaleString('vi-VN')}đ
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 text-sm">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-gray-400" />
                                                {ck.ngayTao}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getStatusStyle(ck.phuongThucThanhToan)}`}
                                            >
                                                {ck.phuongThucThanhToan}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getStatusStyle(ck.trangThai)}`}
                                            >
                                                {getStatus(ck.trangThai).label}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 text-sm">
                                            {ck.ghiChu ? (
                                                <div className="max-w-xs">
                                                    <span className="text-gray-700">{ck.ghiChu}</span>
                                                </div>
                                            ) : (
                                                <span className="text-gray-400 italic">Không có ghi chú</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                    <User className="w-4 h-4 text-blue-600" />
                                                </div>
                                                <span className="text-gray-700 font-medium text-sm">
                                                    {ck.nhanVienXacNhan?.hoTen ||
                                                        ck.taiKhoan?.hoTen ||
                                                        'Không xác định'}
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal for updating delivery info */}
            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleCloseModal} />

                    <div className="relative bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                        {/* Header */}
                        <div className="bg-gray-50 px-6 py-5 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="bg-blue-100 rounded-xl p-2">
                                        <Edit3 className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-800">Cập nhật thông tin</h3>
                                        <p className="text-gray-600 text-sm">Thông tin người nhận</p>
                                    </div>
                                </div>

                                <button
                                    onClick={handleCloseModal}
                                    className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Personal Info Section */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                            <User className="w-4 h-4 text-blue-500" />
                                            Tên người nhận
                                        </label>
                                        <input
                                            type="text"
                                            name="tenNguoiNhan"
                                            value={formData.tenNguoiNhan}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                            placeholder="Nhập tên người nhận"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                            <Phone className="w-4 h-4 text-green-500" />
                                            Số điện thoại
                                        </label>
                                        <input
                                            type="tel"
                                            name="sdtNguoiNhan"
                                            value={formData.sdtNguoiNhan}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                                            placeholder="Nhập số điện thoại (10-11 số)"
                                            pattern="[0-9]{10,11}"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Address Section */}
                                <div className="space-y-4">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-orange-500" />
                                        Địa chỉ giao hàng
                                    </label>

                                    {/* Province, District, Ward in one row */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {/* Province Selection */}
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">
                                                Tỉnh/Thành phố *
                                            </label>
                                            <select
                                                value={selectedProvince?.code || ''}
                                                onChange={handleProvinceChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-sm"
                                                required
                                            >
                                                <option value="">Chọn Tỉnh/Thành phố</option>
                                                {provinces.map((province) => (
                                                    <option key={province.code} value={province.code}>
                                                        {province.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* District Selection */}
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">
                                                Quận/Huyện *
                                            </label>
                                            <select
                                                value={selectedDistrict?.code || ''}
                                                onChange={handleDistrictChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-sm"
                                                disabled={!selectedProvince}
                                                required
                                            >
                                                <option value="">Chọn Quận/Huyện</option>
                                                {districts.map((district) => (
                                                    <option key={district.code} value={district.code}>
                                                        {district.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Ward Selection */}
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">
                                                Phường/Xã *
                                            </label>
                                            <select
                                                value={selectedWard?.code || ''}
                                                onChange={handleWardChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-sm"
                                                disabled={!selectedDistrict}
                                                required
                                            >
                                                <option value="">Chọn Phường/Xã</option>
                                                {wards.map((ward) => (
                                                    <option key={ward.code} value={ward.code}>
                                                        {ward.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Specific Address */}
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">
                                            Địa chỉ cụ thể *
                                        </label>
                                        <textarea
                                            name="diaChiCuThe"
                                            value={formData.diaChiCuThe}
                                            onChange={handleInputChange}
                                            rows={2}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none transition-all duration-200"
                                            placeholder="Nhập số nhà, tên đường..."
                                            required
                                        />
                                    </div>

                                    {/* Preview Full Address */}
                                    {(formData.diaChiCuThe || formData.xa || formData.huyen || formData.tinh) && (
                                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                                            <label className="block text-xs font-medium text-gray-600 mb-1">
                                                Địa chỉ đầy đủ:
                                            </label>
                                            <p className="text-sm text-gray-800">
                                                {[formData.diaChiCuThe, formData.xa, formData.huyen, formData.tinh]
                                                    .filter(Boolean)
                                                    .join(', ')}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Shipping Fee Section */}
                                <div className="space-y-4">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                        <Truck className="w-4 h-4 text-orange-500" />
                                        Phí giao hàng
                                    </label>
                                    
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">
                                            Phí ship (VNĐ) *
                                        </label>
                                        <input
                                            type="number"
                                            name="phiShip"
                                            value={formData.phiShip}
                                            onChange={handleInputChange}
                                            min="0"
                                            step="1000"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                                            placeholder="Nhập phí giao hàng"
                                            required
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            Phí giao hàng hiện tại: {formData.phiShip ? `${parseInt(formData.phiShip).toLocaleString('vi-VN')}đ` : '0đ'}
                                        </p>
                                    </div>
                                </div>
                            </form>
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium"
                                >
                                    Hủy bỏ
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
                                >
                                    Cập nhật
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderInfo;
