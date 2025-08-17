// OrderInfo.js

import React, { useState, useEffect } from 'react';

import { useAdminAuth } from '../../../contexts/adminAuthContext'


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
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);
    const [selectedProvinceId, setSelectedProvinceId] = useState(null);
    const [selectedDistrictId, setSelectedDistrictId] = useState(null);
    const [formData, setFormData] = useState({
        tenNguoiNhan: orderData?.tenNguoiNhan || '',
        soDienThoai: orderData?.sdtNguoiNhan || '',
        tinh: 'Sơn La',
        huyen: 'Huyện Quỳnh Nhai',
        xa: 'Xã Mường Giàng',
        diaChi: orderData?.diaChi || '',
        ghiChu: '',
        thoiGianGiaoHang: '23-12-2023',
        phiGiaoHang: '34.000',
    });

    useEffect(() => {
        // Fetch provinces
        fetch('https://esgoo.net/api-tinhthanh/1/0.htm')
            .then((res) => res.json())
            .then((data) => {
                if (data.error === 0) {
                    setProvinces(data.data);
                    // Find initial province based on stripped name
                    const strippedInitialTinh = formData.tinh;
                    const initialProv = data.data.find(
                        (p) => p.full_name.replace(/^(Tỉnh|Thành phố) /, '') === strippedInitialTinh,
                    );
                    if (initialProv) {
                        setSelectedProvinceId(initialProv.id);
                        fetchDistricts(initialProv.id);
                    }
                }
            })
            .catch((error) => console.error('Error fetching provinces:', error));
    }, []);

    const fetchDistricts = (provId) => {
        fetch(`https://esgoo.net/api-tinhthanh/2/${provId}.htm`)
            .then((res) => res.json())
            .then((data) => {
                if (data.error === 0) {
                    setDistricts(data.data);
                    // Find initial district
                    const initialDist = data.data.find((d) => d.full_name === formData.huyen);
                    if (initialDist) {
                        setSelectedDistrictId(initialDist.id);
                        fetchWards(initialDist.id);
                    }
                }
            })
            .catch((error) => console.error('Error fetching districts:', error));
    };

    const fetchWards = (distId) => {
        fetch(`https://esgoo.net/api-tinhthanh/3/${distId}.htm`)
            .then((res) => res.json())
            .then((data) => {
                if (data.error === 0) {
                    setWards(data.data);
                    // Find initial ward (assuming full_name matches exactly)
                    const initialWard = data.data.find((w) => w.full_name === formData.xa);
                    if (initialWard) {
                        // Already set in formData
                    }
                }
            })
            .catch((error) => console.error('Error fetching wards:', error));
    };

    const handleProvinceChange = (e) => {
        const value = e.target.value;
        const id = e.target.selectedOptions[0].dataset.id;
        setFormData((prev) => ({ ...prev, tinh: value, huyen: '', xa: '' }));
        setSelectedProvinceId(id);
        setDistricts([]);
        setWards([]);
        if (id) {
            fetchDistricts(id);
        }
    };

    const handleDistrictChange = (e) => {
        const value = e.target.value;
        const id = e.target.selectedOptions[0].dataset.id;
        setFormData((prev) => ({ ...prev, huyen: value, xa: '' }));
        setSelectedDistrictId(id);
        setWards([]);
        if (id) {
            fetchWards(id);
        }
    };

    const handleWardChange = (e) => {
        const value = e.target.value;
        setFormData((prev) => ({ ...prev, xa: value }));
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Xử lý cập nhật thông tin
        console.log('Cập nhật thông tin:', formData);
        setIsModalOpen(false);
    };

    const { admin } = useAdminAuth();

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 max-w-5xl mx-auto mt-8">
            {/* Header */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 rounded-t-lg">
                <div className="flex justify-between items-center">
                    <h2 className="text-lg font-medium text-gray-800">Thông tin đơn hàng - Đơn tại quầy</h2>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                        Cập nhật
                    </button>
                </div>
            </div>

            {/* Order Information */}
            <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mb-8">
                    <div className="flex flex-wrap md:flex-nowrap gap-4 mb-2">
                        <div className="flex items-center flex-shrink-0 min-w-[30px] font-semibold text-gray-600">
                            Mã:
                        </div>
                        <div className="flex-1 min-w-0 text-gray-900 truncate whitespace-nowrap">{orderData.ma}</div>
                    </div>

                    <div className="flex flex-wrap md:flex-nowrap gap-4 mb-2">
                        <div className="flex items-center flex-shrink-0 min-w-[120px] font-semibold text-gray-600">
                            Số người nhận:
                        </div>
                        <div className="flex-1 min-w-0 text-gray-900 truncate whitespace-nowrap">
                            {orderData.sdtNguoiNhan}
                        </div>
                    </div>

                    <div className="flex flex-wrap md:flex-nowrap gap-4 mb-2">
                        <div className="flex items-center flex-shrink-0 min-w-[120px] font-semibold text-gray-600">
                            Tên khách hàng:
                        </div>
                        <div className="flex-1 min-w-0 text-gray-900 truncate whitespace-nowrap">
                            {orderData.taiKhoan.hoTen}t
                        </div>
                    </div>

                    <div className="flex flex-wrap md:flex-nowrap gap-4 mb-2">
                        <div className="flex items-center flex-shrink-0 min-w-[30px] font-semibold text-gray-600">
                            Loại:
                        </div>
                        <div className="flex-1 min-w-0">
                            <span
                                className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${getInvoiceTypeStyle(orderData.loaiHoaDon)}`}
                            >
                                {orderData.loaiHoaDon}
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-wrap md:flex-nowrap gap-4 mb-2">
                        <div className="flex items-center flex-shrink-0 min-w-[120px] font-semibold text-gray-600">
                            Trạng thái:
                        </div>
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
                        <div className="flex-1 min-w-0 text-gray-900 truncate whitespace-nowrap">
                            {orderData.tenNguoiNhan}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                    {/* Backdrop với hiệu ứng blur */}
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
                        onClick={() => setIsModalOpen(false)}
                    />

                    {/* Modal Container */}
                    <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-100 transform transition-all duration-300 scale-100 opacity-100">
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4 rounded-t-2xl">
                            <div className="flex justify-between items-center">
                                <h3 className="text-xl font-semibold text-white">Cập nhật thông tin</h3>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="text-white hover:text-gray-200 transition-colors duration-200 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-white hover:bg-opacity-20"
                                >
                                    ×
                                </button>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            {/* Recipient Information */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Tên người nhận
                                    </label>
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
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Số điện thoại
                                    </label>
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

                            {/* Location Information */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Tỉnh/Thành phố
                                    </label>
                                    <select
                                        name="tinh"
                                        value={formData.tinh}
                                        onChange={handleProvinceChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white"
                                    >
                                        <option value="">Chọn tỉnh/thành phố</option>
                                        {provinces.map((p) => (
                                            <option
                                                key={p.id}
                                                value={p.full_name.replace(/^(Tỉnh|Thành phố) /, '')}
                                                data-id={p.id}
                                            >
                                                {p.full_name.replace(/^(Tỉnh|Thành phố) /, '')}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Quận/Huyện</label>
                                    <select
                                        name="huyen"
                                        value={formData.huyen}
                                        onChange={handleDistrictChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white"
                                    >
                                        <option value="">Chọn quận/huyện</option>
                                        {districts.map((d) => (
                                            <option key={d.id} value={d.full_name} data-id={d.id}>
                                                {d.full_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Xã/Phường/Thị trấn
                                    </label>
                                    <select
                                        name="xa"
                                        value={formData.xa}
                                        onChange={handleWardChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white"
                                    >
                                        <option value="">Chọn xã/phường</option>
                                        {wards.map((w) => (
                                            <option key={w.id} value={w.full_name}>
                                                {w.full_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Address */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Địa chỉ cụ thể</label>
                                <input
                                    type="text"
                                    name="diaChi"
                                    value={formData.diaChi}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                                    placeholder="Nhập địa chỉ cụ thể"
                                />
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
                                    Giao hàng
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
                                    {/* <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 border-b border-gray-200">
                                            Loại giao dịch
                                        </th> */}
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
                                        <td className="px-4 py-4 text-sm text-gray-900 border-b border-gray-100">
                                            {ck.ngayTao}
                                        </td>
                                        {/* <td className="px-4 py-4 text-sm border-b border-gray-100">
                                                <span
                                                    className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusStyle(ck.hoaDon.loaiHoaDon)}`}
                                                >
                                                    {ck.hoaDon.loaiHoaDon}
                                                </span>
                                            </td> */}
                                        <td className="px-4 py-4 text-sm border-b border-gray-100">
                                            <span
                                                className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusStyle(ck.phuongThucThanhToan)}`}
                                            >
                                                {ck.phuongThucThanhToan}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-sm border-b border-gray-100">
                                            <span
                                                className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusStyle(ck.trangThai)}`}
                                            >
                                                {getStatus(ck.trangThai).label}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-sm text-gray-900 border-b border-gray-100">-</td>
                                        <td className="px-4 py-4 text-sm text-gray-900 border-b border-gray-100">
                                            {admin?.hoTen || ''}
                                        </td>
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
