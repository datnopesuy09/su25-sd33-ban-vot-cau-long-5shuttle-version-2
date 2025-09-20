import React, { useEffect, useState } from 'react';
import {
    Box,
    Button,
    Divider,
    Typography,
    Grid,
    TextField,
    Paper,
    Chip,
    Autocomplete,
    ButtonGroup,
    Modal,
} from '@mui/material';
import { MapPin, Plus, Edit3, Trash2, Star, User, Phone, Home, Save, X, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useUserAuth } from '../../../contexts/userAuthContext';
import Swal from 'sweetalert2';
import './userAddress-styles.css';

const AddressUser = () => {
    const [open, setOpen] = useState(false);
    const [listDiaChi, setListDiaChi] = useState([]);
    const [diaChiData, setDiaChiData] = useState({
        ten: '',
        sdt: '',
        diaChiCuThe: '',
        loai: 0,
    });
    const [errors, setErrors] = useState({});
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);
    const [selectedProvince, setSelectedProvince] = useState(null);
    const [selectedDistrict, setSelectedDistrict] = useState(null);
    const [selectedWard, setSelectedWard] = useState(null);
    const { user } = useUserAuth();
    const token = localStorage.getItem('userToken');

    console.log('token', token);
    const fetchListDiaChi = async () => {
        try {
            const res = await axios.get('http://localhost:8080/dia-chi/getMyAddress', {
                headers: { Authorization: `Bearer ${token}` },
            });
            const sorted = res.data.result.sort((a, b) => b.loai - a.loai); // 1 (mặc định) lên trước
            console.log('==> Dữ liệu địa chỉ:', sorted);
            setListDiaChi(sorted);
        } catch {
            toast.error('Lỗi khi tải danh sách địa chỉ');
        }
    };

    const fetchProvinces = async () => {
        try {
            const res = await fetch('https://online-gateway.ghn.vn/shiip/public-api/master-data/province', {
                headers: {
                    Token: '04ae91c9-b3a5-11ef-b074-aece61c107bd',
                    'Content-Type': 'application/json',
                },
            });
            const data = await res.json();
            setProvinces(data.data);
        } catch {
            toast.error('Không thể tải tỉnh/thành');
        }
    };

    const fetchDistricts = async (provinceCode) => {
        try {
            const res = await fetch(
                `https://online-gateway.ghn.vn/shiip/public-api/master-data/district?province_id=${provinceCode}`,
                {
                    headers: {
                        Token: '04ae91c9-b3a5-11ef-b074-aece61c107bd',
                        'Content-Type': 'application/json',
                    },
                },
            );
            const data = await res.json();
            setDistricts(data.data || []);
            return data.data;
        } catch {
            toast.error('Lỗi tải quận/huyện');
            return [];
        }
    };

    const fetchWards = async (districtCode) => {
        try {
            const res = await fetch(
                `https://online-gateway.ghn.vn/shiip/public-api/master-data/ward?district_id=${districtCode}`,
                {
                    headers: {
                        Token: '04ae91c9-b3a5-11ef-b074-aece61c107bd',
                        'Content-Type': 'application/json',
                    },
                },
            );
            const data = await res.json();
            setWards(data.data || []);
            return data.data;
        } catch {
            toast.error('Lỗi tải phường/xã');
            return [];
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setDiaChiData((prev) => ({ ...prev, [name]: value }));
    };

    const handleOpen = () => {
        setDiaChiData({ ten: '', sdt: '', diaChiCuThe: '', loai: 0 });
        setSelectedProvince(null);
        setSelectedDistrict(null);
        setSelectedWard(null);
        setDistricts([]);
        setWards([]);
        setErrors({});
        setOpen(true);
    };

    const handleClose = () => {
        resetAddressState();
        setOpen(false);
    };

    const resetAddressState = () => {
        setDiaChiData({ ten: '', sdt: '', diaChiCuThe: '', loai: 0 });
        setErrors({});
        setSelectedProvince(null);
        setSelectedDistrict(null);
        setSelectedWard(null);
        setDistricts([]);
        setWards([]);
    };

    const validate = () => {
        const newErrors = {};
        if (!diaChiData.ten.trim()) newErrors.ten = 'Vui lòng nhập tên.';
        if (!diaChiData.sdt.trim()) newErrors.sdt = 'Vui lòng nhập số điện thoại.';
        if (!selectedProvince) newErrors.tinh = 'Chọn tỉnh/thành.';
        if (!selectedDistrict) newErrors.huyen = 'Chọn quận/huyện.';
        if (!selectedWard) newErrors.xa = 'Chọn phường/xã.';
        if (!diaChiData.diaChiCuThe.trim()) newErrors.diaChiCuThe = 'Nhập địa chỉ cụ thể.';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmitDiaChi = async () => {
        if (!validate()) return;
        const isEdit = !!diaChiData.id;

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
            ten: diaChiData.ten,
            sdt: diaChiData.sdt,
            diaChiCuThe: diaChiData.diaChiCuThe,
            tinh: selectedProvince?.ProvinceName,
            huyen: selectedDistrict?.DistrictName,
            xa: selectedWard?.WardName,
        };

        try {
            if (isEdit) {
                await axios.put(`http://localhost:8080/dia-chi/update/${diaChiData.id}`, requestBody, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                toast.success('Cập nhật địa chỉ thành công!');
            } else {
                await axios.post('http://localhost:8080/dia-chi/create', requestBody, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                toast.success('Thêm địa chỉ thành công!');
            }
            handleClose();
            fetchListDiaChi();
        } catch {
            toast.error('Không thể xử lý địa chỉ');
        }
    };

    const handleDeleteDiaChi = async (id) => {
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
            await axios.delete(`http://localhost:8080/dia-chi/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            toast.success('Đã xóa địa chỉ!');
            fetchListDiaChi();
        } catch {
            toast.error('Xóa địa chỉ thất bại');
        }
    };

    const handleSetDefaultDiaChi = async (id) => {
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
                `http://localhost:8080/dia-chi/update-loai/${id}`,
                {},
                {
                    headers: { Authorization: `Bearer ${token}` },
                },
            );
            toast.success('Đã đặt địa chỉ mặc định');
            fetchListDiaChi();
        } catch {
            toast.error('Không thể đặt mặc định');
        }
    };

    const handleEditAddress = async (address) => {
        setDiaChiData(address);
        const foundProvince = provinces.find((p) => p.ProvinceName === address.tinh);
        setSelectedProvince(foundProvince);

        let districtsData = [];
        if (foundProvince?.ProvinceID) {
            districtsData = await fetchDistricts(foundProvince.ProvinceID);
        }

        const foundDistrict = districtsData.find((d) => d.DistrictName === address.huyen);
        setSelectedDistrict(foundDistrict);

        let wardsData = [];
        if (foundDistrict?.DistrictID) {
            wardsData = await fetchWards(foundDistrict.DistrictID);
        }

        const foundWard = wardsData.find((w) => w.WardName === address.xa);
        setSelectedWard(foundWard);

        setOpen(true);
    };

    useEffect(() => {
        if (user) {
            fetchProvinces();
            fetchListDiaChi();
        }
    }, [user]);

    return (
        <div className="w-full userAddress-container">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 mb-6 border border-blue-100">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="bg-blue-100 rounded-lg p-2 icon-wrapper">
                            <MapPin className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold gradient-text">Địa chỉ của tôi</h1>
                            <p className="text-gray-600 text-sm">Quản lý địa chỉ giao hàng của bạn</p>
                        </div>
                    </div>
                    <button
                        onClick={handleOpen}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-md hover:shadow-lg action-button"
                    >
                        <Plus className="w-4 h-4" />
                        Thêm địa chỉ
                    </button>
                </div>
            </div>

            {/* Address List */}
            <div className="space-y-4">
                {listDiaChi.length > 0 ? (
                    listDiaChi.map((address) => (
                        <div
                            key={address.id}
                            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
                        >
                            <div className="p-4">
                                <div className="flex justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="bg-gray-100 rounded-lg p-2">
                                                <User className="w-4 h-4 text-gray-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                                                    {address.ten}
                                                    {address.loai === 1 && (
                                                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                                                            <Star className="w-3 h-3" />
                                                            Mặc định
                                                        </span>
                                                    )}
                                                </h3>
                                                <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                                                    <Phone className="w-3 h-3" />
                                                    {address.sdt}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-2 text-sm text-gray-600">
                                            <Home className="w-4 h-4 mt-0.5 text-gray-500" />
                                            <span>
                                                {address.diaChiCuThe}, {address.xa}, {address.huyen}, {address.tinh}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2 ml-4">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEditAddress(address)}
                                                className="inline-flex items-center gap-1 px-3 py-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors text-sm font-medium action-button"
                                            >
                                                <Edit3 className="w-3 h-3" />
                                                Sửa
                                            </button>
                                            {address.loai !== 1 && (
                                                <button
                                                    onClick={() => handleDeleteDiaChi(address.id)}
                                                    className="inline-flex items-center gap-1 px-3 py-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium action-button"
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                    Xóa
                                                </button>
                                            )}
                                        </div>
                                        {address.loai !== 1 && (
                                            <button
                                                onClick={() => handleSetDefaultDiaChi(address.id)}
                                                className="inline-flex items-center gap-1 px-3 py-1.5 text-gray-600 hover:text-gray-800 hover:bg-gray-50 border border-gray-200 rounded-lg transition-colors text-sm font-medium action-button"
                                            >
                                                <Star className="w-3 h-3" />
                                                Thiết lập mặc định
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-12">
                        <div className="bg-gray-100 rounded-full p-4 w-16 h-16 mx-auto mb-4">
                            <MapPin className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-gray-600">Chưa có địa chỉ nào.</p>
                        <button
                            onClick={handleOpen}
                            className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Thêm địa chỉ đầu tiên
                        </button>
                    </div>
                )}
            </div>

            {/* Modal Form */}
            {open && (
                <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                    {/* Backdrop với hiệu ứng blur */}
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
                        onClick={handleClose}
                    />

                    {/* Modal Container */}
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto mx-auto transform transition-all duration-300 scale-100 opacity-100 custom-scrollbar">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                            <div className="flex items-center gap-3">
                                <div className="bg-blue-100 rounded-lg p-2">
                                    <MapPin className="w-5 h-5 text-blue-600" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-800">
                                    {diaChiData.id ? 'Cập nhật địa chỉ' : 'Thêm địa chỉ mới'}
                                </h2>
                            </div>
                            <button
                                onClick={handleClose}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6">
                            {/* Personal Info Section */}
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                    <User className="w-5 h-5 text-gray-600" />
                                    Thông tin liên hệ
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Họ tên</label>
                                        <input
                                            type="text"
                                            name="ten"
                                            value={diaChiData.ten}
                                            onChange={handleInputChange}
                                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                                                errors.ten
                                                    ? 'border-red-300 bg-red-50'
                                                    : 'border-gray-300 hover:border-gray-400'
                                            }`}
                                            placeholder="Nhập họ tên"
                                        />
                                        {errors.ten && (
                                            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                                <AlertCircle className="w-4 h-4" />
                                                {errors.ten}
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Số điện thoại
                                        </label>
                                        <input
                                            type="text"
                                            name="sdt"
                                            value={diaChiData.sdt}
                                            onChange={handleInputChange}
                                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                                                errors.sdt
                                                    ? 'border-red-300 bg-red-50'
                                                    : 'border-gray-300 hover:border-gray-400'
                                            }`}
                                            placeholder="Nhập số điện thoại"
                                        />
                                        {errors.sdt && (
                                            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                                <AlertCircle className="w-4 h-4" />
                                                {errors.sdt}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Address Section */}
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                    <Home className="w-5 h-5 text-gray-600" />
                                    Địa chỉ
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Tỉnh/Thành phố
                                        </label>
                                        <Autocomplete
                                            fullWidth
                                            size="small"
                                            options={provinces}
                                            getOptionLabel={(option) => option?.name || ''}
                                            isOptionEqualToValue={(o, v) => o?.code === v?.code}
                                            value={selectedProvince}
                                            onChange={(e, v) => {
                                                setSelectedProvince(v);
                                                setSelectedDistrict(null);
                                                setSelectedWard(null);
                                                setDistricts([]);
                                                setWards([]);
                                                if (v?.code) fetchDistricts(v.code);
                                            }}
                                            renderOption={(props, option) => (
                                                <li {...props} key={option.code}>
                                                    {option.name}
                                                </li>
                                            )}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    placeholder="Chọn tỉnh/thành phố"
                                                    fullWidth
                                                    error={!!errors.tinh}
                                                    helperText={errors.tinh}
                                                />
                                            )}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Quận/Huyện
                                        </label>
                                        <Autocomplete
                                            fullWidth
                                            size="small"
                                            options={districts}
                                            getOptionLabel={(option) => option?.name || ''}
                                            isOptionEqualToValue={(o, v) => o?.code === v?.code}
                                            value={selectedDistrict}
                                            onChange={(e, v) => {
                                                setSelectedDistrict(v);
                                                setSelectedWard(null);
                                                setWards([]);
                                                if (v?.code) fetchWards(v.code);
                                            }}
                                            disabled={!selectedProvince}
                                            renderOption={(props, option) => (
                                                <li {...props} key={option.code}>
                                                    {option.name}
                                                </li>
                                            )}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    placeholder="Chọn quận/huyện"
                                                    fullWidth
                                                    error={!!errors.huyen}
                                                    helperText={errors.huyen}
                                                />
                                            )}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Phường/Xã
                                        </label>
                                        <Autocomplete
                                            fullWidth
                                            size="small"
                                            options={wards}
                                            getOptionLabel={(option) => option?.name || ''}
                                            isOptionEqualToValue={(o, v) => o?.code === v?.code}
                                            value={selectedWard}
                                            onChange={(e, v) => setSelectedWard(v)}
                                            disabled={!selectedDistrict}
                                            renderOption={(props, option) => (
                                                <li {...props} key={option.code}>
                                                    {option.name}
                                                </li>
                                            )}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    placeholder="Chọn phường/xã"
                                                    fullWidth
                                                    error={!!errors.xa}
                                                    helperText={errors.xa}
                                                />
                                            )}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Địa chỉ cụ thể
                                    </label>
                                    <input
                                        type="text"
                                        name="diaChiCuThe"
                                        value={diaChiData.diaChiCuThe}
                                        onChange={handleInputChange}
                                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                                            errors.diaChiCuThe
                                                ? 'border-red-300 bg-red-50'
                                                : 'border-gray-300 hover:border-gray-400'
                                        }`}
                                        placeholder="Ví dụ: Số 123, đường ABC"
                                    />
                                    {errors.diaChiCuThe && (
                                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                            <AlertCircle className="w-4 h-4" />
                                            {errors.diaChiCuThe}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                                <button
                                    onClick={handleClose}
                                    className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 border border-gray-200 rounded-lg transition-colors font-medium"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={handleSubmitDiaChi}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-md hover:shadow-lg"
                                >
                                    <Save className="w-4 h-4" />
                                    {diaChiData.id ? 'Cập nhật' : 'Hoàn thành'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AddressUser;
