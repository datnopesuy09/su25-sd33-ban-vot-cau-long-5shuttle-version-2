import React from 'react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { AiOutlineDollar, AiOutlinePercentage } from 'react-icons/ai';
import numeral from 'numeral';
import dayjs from 'dayjs';
import swal from 'sweetalert';

function AddVoucher() {
    const initialVoucher = {
        ma: '',
        ten: '',
        giaTri: '',
        giaTriMax: '',
        kieuGiaTri: 0,
        dieuKienNhoNhat: '',
        soLuong: '',
        ngayBatDau: null,
        ngayKetThuc: null,
        trangThai: 0,
    };
    const navigate = useNavigate();
    const [voucherAdd, setVoucherAdd] = useState(initialVoucher);
    const [errorMa, setErrorMa] = useState('');
    const [errorTen, setErrorTen] = useState('');
    const [errorGiaTri, setErrorGiaTri] = useState('');
    const [errorGiaTriMax, setErrorGiaTriMax] = useState('');
    const [errorDieuKienNhoNhat, setErrorDieuKienNhoNhat] = useState('');
    const [errorSoLuong, setErrorSoLuong] = useState('');
    const [errorNgayBatDau, setErrorNgayBatDau] = useState('');
    const [errorNgayKetThuc, setErrorNgayKetThuc] = useState('');
    const [giaTriDefault, setGiaTriDefault] = useState(0);
    const [giaTriMaxDefault, setGiaTriMaxDefault] = useState(0);
    const [soLuongDefault, setSoLuongDefault] = useState(0);
    const [dieuKienNhoNhatDefault, setDieuKienNhoNhatDefault] = useState(0);
    const [allMaVoucher, setAllMaVoucher] = useState([]);
    const [allTenVoucher, setAllTenVoucher] = useState([]);

    const listMa = [];
    allMaVoucher.map((m) => listMa.push(m.toLowerCase()));
    const listTen = [];
    allTenVoucher.map((m) => listTen.push(m.toLowerCase()));

    const handleNavigateToDiscountVoucher = () => {
        navigate('/admin/giam-gia/phieu-giam-gia');
    };

    const handleAllMaVoucher = () => {
        axios
            .get(`http://localhost:8080/api/phieu-giam-gia/list-ma-phieu-giam-gia`)
            .then((response) => {
                setAllMaVoucher(response.data);
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    };

    const handleAllTenVoucher = () => {
        axios
            .get(`http://localhost:8080/api/phieu-giam-gia/list-ten-phieu-giam-gia`)
            .then((response) => {
                setAllTenVoucher(response.data);
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    };

    useEffect(() => {
        handleAllMaVoucher();
        handleAllTenVoucher();
    }, []);

    const handleValidation = () => {
        let check = 0;
        const errors = {
            ma: '',
            ten: '',
            giaTri: '',
            giaTriMax: '',
            soLuong: '',
            dieuKienNhoNhat: '',
            ngayBatDau: '',
            ngayKetThuc: '',
        };

        const minBirthYear = 1900;
        const specialCharsRegex = /[!@#$%^&*(),.?":{}|<>]/;

        if (voucherAdd.ma.trim() === '') {
            errors.ma = 'Mã không được để trống';
        } else if (voucherAdd.ma !== voucherAdd.ma.trim()) {
            errors.ma = 'Mã không được chứa khoảng trắng thừa';
        } else if (voucherAdd.ma.length > 30) {
            errors.ma = 'Mã không được dài hơn 30 ký tự';
        } else if (voucherAdd.ma.length < 5) {
            errors.ma = 'Mã không được bé hơn 5 ký tự';
        } else if (listMa.includes(voucherAdd.ma.toLowerCase())) {
            errors.ma = 'Mã đã tồn tại';
        } else if (specialCharsRegex.test(voucherAdd.ma)) {
            errors.ma = 'Mã không được chứa ký tự đặc biệt';
        }

        if (voucherAdd.ten.trim() === '') {
            errors.ten = 'Tên không được để trống';
        } else if (voucherAdd.ten !== voucherAdd.ten.trim()) {
            errors.ten = 'Tên không được chứa khoảng trắng thừa';
        } else if (voucherAdd.ten.length > 100) {
            errors.ten = 'Tên không được dài hơn 100 ký tự';
        } else if (voucherAdd.ten.length < 5) {
            errors.ten = 'Tên không được bé hơn 5 ký tự';
        } else if (listTen.includes(voucherAdd.ten.toLowerCase())) {
            errors.ten = 'Tên đã tồn tại';
        } else if (specialCharsRegex.test(voucherAdd.ten)) {
            errors.ten = 'Tên không được chứa ký tự đặc biệt';
        }

        if (voucherAdd.kieuGiaTri === 0) {
            if (voucherAdd.giaTri === null) {
                setVoucherAdd({ ...voucherAdd, giaTri: 0 });
                errors.giaTri = 'Giá trị tối thiểu 1%';
            } else if (!Number.isInteger(parseInt(voucherAdd.giaTri))) {
                errors.giaTri = 'Giá trị chỉ được nhập số nguyên';
            } else if (voucherAdd.giaTri < 1) {
                errors.giaTri = 'Giá trị tối thiểu 1%';
            } else if (voucherAdd.giaTri > 100) {
                errors.giaTri = 'Giá trị tối đa 100%';
            }
        } else {
            if (voucherAdd.giaTri === null) {
                setVoucherAdd({ ...voucherAdd, giaTri: 0 });
                errors.giaTri = 'Giá trị tối thiểu 1 ₫';
            } else if (!Number.isInteger(parseInt(voucherAdd.giaTri))) {
                errors.giaTri = 'Giá trị chỉ được nhập số nguyên';
            } else if (voucherAdd.giaTri < 1) {
                errors.giaTri = 'Giá trị tối thiểu 1 ₫';
            } else if (voucherAdd.giaTri > 50000000) {
                errors.giaTri = 'Giá trị tối đa 50,000,000 ₫';
            }
        }

        if (voucherAdd.giaTriMax === null) {
            setVoucherAdd({ ...voucherAdd, giaTriMax: 0 });
            errors.giaTriMax = 'Giá trị tối đa tối thiểu 1 ₫';
        } else if (!Number.isInteger(parseInt(voucherAdd.giaTriMax))) {
            errors.giaTriMax = 'Giá trị tối đa chỉ được nhập số nguyên';
        } else if (voucherAdd.giaTriMax < 1) {
            errors.giaTriMax = 'Giá trị tối đa tối thiểu 1 ₫';
        } else if (voucherAdd.giaTriMax > 50000000) {
            errors.giaTriMax = 'Giá trị tối đa tối đa 50,000,000 ₫';
        } else if (voucherAdd.kieuGiaTri === 1 && voucherAdd.giaTriMax !== voucherAdd.giaTri) {
            errors.giaTriMax = 'Giá trị tối đa phải bằng giá trị';
        }

        if (voucherAdd.soLuong === null) {
            setVoucherAdd({ ...voucherAdd, soLuong: 0 });
            errors.soLuong = 'Số lượng tối thiểu 1';
        } else if (!Number.isInteger(parseInt(voucherAdd.soLuong))) {
            errors.soLuong = 'Số lượng chỉ được nhập số nguyên';
        } else if (voucherAdd.soLuong < 1) {
            errors.soLuong = 'Số lượng tối thiểu 1';
        }

        if (voucherAdd.dieuKienNhoNhat === null) {
            // setVoucherAdd({ ...voucherAdd, dieuKienNhoNhat: 0 })
            errors.dieuKienNhoNhat = 'Điều kiện không được bỏ trống';
        } else if (!Number.isInteger(parseInt(voucherAdd.dieuKienNhoNhat))) {
            errors.dieuKienNhoNhat = 'Điều kiện chỉ được nhập số nguyên';
        } else if (voucherAdd.dieuKienNhoNhat > 50000000) {
            errors.dieuKienNhoNhat = 'Điều kiện tối thiểu tối đa 50,000,000 ₫';
        }

        const minDate = new Date(minBirthYear, 0, 1); // Ngày bắt đầu từ 01-01-minBirthYear

        // Kiểm tra ngày bắt đầu
        if (!voucherAdd.ngayBatDau) {
            errors.ngayBatDau = 'Ngày bắt đầu không được để trống';
        } else {
            const ngayBatDau = new Date(voucherAdd.ngayBatDau);
            if (ngayBatDau < minDate) {
                errors.ngayBatDau = 'Ngày bắt đầu không hợp lệ';
            }
        }

        // Kiểm tra ngày kết thúc
        if (!voucherAdd.ngayKetThuc) {
            errors.ngayKetThuc = 'Ngày kết thúc không được để trống';
        } else {
            const ngayBatDau = new Date(voucherAdd.ngayBatDau);
            const ngayKetThuc = new Date(voucherAdd.ngayKetThuc);

            if (ngayKetThuc < minDate) {
                errors.ngayKetThuc = 'Ngày kết thúc không hợp lệ';
            }

            if (ngayBatDau > ngayKetThuc) {
                errors.ngayBatDau = 'Ngày bắt đầu không được lớn hơn ngày kết thúc';
            }
        }

        for (const key in errors) {
            if (errors[key]) {
                check++;
            }
        }

        setErrorMa(errors.ma);
        setErrorTen(errors.ten);
        setErrorGiaTri(errors.giaTri);
        setErrorGiaTriMax(errors.giaTriMax);
        setErrorDieuKienNhoNhat(errors.dieuKienNhoNhat);
        setErrorSoLuong(errors.soLuong);
        setErrorNgayBatDau(errors.ngayBatDau);
        setErrorNgayKetThuc(errors.ngayKetThuc);
        return check;
    };

    const formatCurrency = (money) => {
        return numeral(money).format('0,0') + ' ₫';
    };

    const handleSetValue = (value) => {
        if (voucherAdd.kieuGiaTri === 0) {
            setVoucherAdd({
                ...voucherAdd,
                giaTri: formatCurrency(value).replace(/\D/g, ''),
            });
            setGiaTriDefault(formatCurrency(value).replace(/\D/g, ''));
        } else {
            setVoucherAdd({
                ...voucherAdd,
                giaTri: formatCurrency(value).replace(/\D/g, ''),
                giaTriMax: formatCurrency(value).replace(/\D/g, ''),
            });
            setGiaTriDefault(formatCurrency(value));
            setGiaTriMaxDefault(formatCurrency(value));
        }
        setErrorGiaTri('');
    };

    const handleVoucherAdd = () => {
        const check = handleValidation();
        if (check < 1) {
            const title = 'Xác nhận thêm mới phiếu giảm giá?';

            swal({
                title: title,
                text: 'Bạn có chắc chắn muốn thêm phiếu giảm giá không?',
                icon: 'warning',
                buttons: {
                    cancel: 'Hủy',
                    confirm: 'Xác nhận',
                },
            }).then((willConfirm) => {
                if (willConfirm) {
                    axios
                        .post('http://localhost:8080/api/phieu-giam-gia/add', voucherAdd, {
                            headers: {
                                'Content-Type': 'application/json',
                            },
                        })
                        .then(() => {
                            swal('Thành công!', 'Thêm mới phiếu giảm giá thành công!', 'success');
                            navigate('/admin/giam-gia/phieu-giam-gia');
                        })
                        .catch((error) => {
                            console.error('Lỗi cập nhật:', error);
                            swal('Thất bại!', 'Thêm mới phiếu giảm giá thất bại!', 'error');
                        });
                }
            });
        } else {
            swal('Thất bại!', 'Không thể thêm phiếu giảm giá', 'error');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header Section */}
            <div className="bg-white shadow-sm border-b border-gray-200 mb-6">
                <div className="px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                                <span
                                    className="cursor-pointer hover:text-amber-600 transition-colors duration-200"
                                    onClick={handleNavigateToDiscountVoucher}
                                >
                                    Phiếu giảm giá
                                </span>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 5l7 7-7 7"
                                    />
                                </svg>
                                <span className="text-gray-900 font-medium">Tạo phiếu giảm giá</span>
                            </nav>
                            <h1 className="text-2xl font-bold text-gray-900">Tạo phiếu giảm giá mới</h1>
                            <p className="text-sm text-gray-600 mt-1">Điền thông tin để tạo phiếu giảm giá mới</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {/* Form Section */}
                    <div className="p-8">
                        <div className="max-w-4xl mx-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Mã phiếu giảm giá */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Mã phiếu giảm giá <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 ${
                                            errorMa ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                        }`}
                                        placeholder="Nhập mã phiếu giảm giá"
                                        onChange={(e) => {
                                            setVoucherAdd({ ...voucherAdd, ma: e.target.value });
                                            setErrorMa('');
                                        }}
                                    />
                                    {errorMa && (
                                        <p className="text-red-600 text-sm flex items-center">
                                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                <path
                                                    fillRule="evenodd"
                                                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                            {errorMa}
                                        </p>
                                    )}
                                </div>

                                {/* Tên phiếu giảm giá */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Tên phiếu giảm giá <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 ${
                                            errorTen ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                        }`}
                                        placeholder="Nhập tên phiếu giảm giá"
                                        onChange={(e) => {
                                            setVoucherAdd({ ...voucherAdd, ten: e.target.value });
                                            setErrorTen('');
                                        }}
                                    />
                                    {errorTen && (
                                        <p className="text-red-600 text-sm flex items-center">
                                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                <path
                                                    fillRule="evenodd"
                                                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                            {errorTen}
                                        </p>
                                    )}
                                </div>

                                {/* Giá trị */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Giá trị <span className="text-red-500">*</span>
                                    </label>
                                    <div className="flex">
                                        <input
                                            type="text"
                                            className={`flex-1 px-4 py-3 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 ${
                                                errorGiaTri ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                            }`}
                                            placeholder="Nhập giá trị"
                                            value={giaTriDefault}
                                            onChange={(e) => handleSetValue(e.target.value)}
                                        />
                                        <div className="flex items-center px-4 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg">
                                            <AiOutlinePercentage
                                                color={voucherAdd.kieuGiaTri === 0 ? '#f59e0b' : '#6b7280'}
                                                className="cursor-pointer hover:text-amber-600 transition-colors duration-200"
                                                size={20}
                                                onClick={() => {
                                                    setVoucherAdd({ ...voucherAdd, kieuGiaTri: 0, giaTri: 0 });
                                                    setGiaTriDefault(0);
                                                    setGiaTriMaxDefault(0);
                                                }}
                                                title="Phần trăm"
                                            />
                                            <AiOutlineDollar
                                                color={voucherAdd.kieuGiaTri === 1 ? '#f59e0b' : '#6b7280'}
                                                className="cursor-pointer ml-3 hover:text-amber-600 transition-colors duration-200"
                                                size={20}
                                                onClick={() => {
                                                    setVoucherAdd({
                                                        ...voucherAdd,
                                                        kieuGiaTri: 1,
                                                        giaTri: 0,
                                                        giaTriMax: 0,
                                                    });
                                                    setErrorGiaTri('');
                                                    setGiaTriDefault(formatCurrency(0));
                                                    setGiaTriMaxDefault(formatCurrency(0));
                                                }}
                                                title="Giá tiền"
                                            />
                                        </div>
                                    </div>
                                    {errorGiaTri && (
                                        <p className="text-red-600 text-sm flex items-center">
                                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                <path
                                                    fillRule="evenodd"
                                                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                            {errorGiaTri}
                                        </p>
                                    )}
                                </div>

                                {/* Giá trị tối đa */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Giá trị tối đa <span className="text-red-500">*</span>
                                    </label>
                                    <div className="flex">
                                        <input
                                            disabled={voucherAdd.kieuGiaTri === 1}
                                            type="text"
                                            className={`flex-1 px-4 py-3 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 ${
                                                errorGiaTriMax ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                            } ${voucherAdd.kieuGiaTri === 1 ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                            placeholder="Nhập giá trị tối đa"
                                            value={formatCurrency(giaTriMaxDefault)}
                                            onChange={(e) => {
                                                if (voucherAdd.kieuGiaTri !== 1) {
                                                    setVoucherAdd({
                                                        ...voucherAdd,
                                                        giaTriMax: formatCurrency(e.target.value).replace(/\D/g, ''),
                                                    });
                                                    setGiaTriMaxDefault(formatCurrency(e.target.value));
                                                    setErrorGiaTriMax('');
                                                }
                                            }}
                                        />
                                        <span className="flex items-center px-4 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg text-gray-600">
                                            ₫
                                        </span>
                                    </div>
                                    {errorGiaTriMax && (
                                        <p className="text-red-600 text-sm flex items-center">
                                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                <path
                                                    fillRule="evenodd"
                                                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                            {errorGiaTriMax}
                                        </p>
                                    )}
                                </div>

                                {/* Số lượng */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Số lượng <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 ${
                                            errorSoLuong ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                        }`}
                                        placeholder="Nhập số lượng"
                                        value={soLuongDefault}
                                        onChange={(e) => {
                                            setVoucherAdd({
                                                ...voucherAdd,
                                                soLuong: formatCurrency(e.target.value).replace(/\D/g, ''),
                                            });
                                            setErrorSoLuong('');
                                            setSoLuongDefault(formatCurrency(e.target.value).replace(/\D/g, ''));
                                        }}
                                    />
                                    {errorSoLuong && (
                                        <p className="text-red-600 text-sm flex items-center">
                                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                <path
                                                    fillRule="evenodd"
                                                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                            {errorSoLuong}
                                        </p>
                                    )}
                                </div>

                                {/* Điều kiện */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Điều kiện tối thiểu <span className="text-red-500">*</span>
                                    </label>
                                    <div className="flex">
                                        <input
                                            type="text"
                                            className={`flex-1 px-4 py-3 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 ${
                                                errorDieuKienNhoNhat ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                            }`}
                                            placeholder="Nhập điều kiện tối thiểu"
                                            value={formatCurrency(dieuKienNhoNhatDefault)}
                                            onChange={(e) => {
                                                setVoucherAdd({
                                                    ...voucherAdd,
                                                    dieuKienNhoNhat: formatCurrency(e.target.value).replace(/\D/g, ''),
                                                });
                                                setErrorDieuKienNhoNhat('');
                                                setDieuKienNhoNhatDefault(formatCurrency(e.target.value));
                                            }}
                                        />
                                        <span className="flex items-center px-4 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg text-gray-600">
                                            ₫
                                        </span>
                                    </div>
                                    {errorDieuKienNhoNhat && (
                                        <p className="text-red-600 text-sm flex items-center">
                                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                <path
                                                    fillRule="evenodd"
                                                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                            {errorDieuKienNhoNhat}
                                        </p>
                                    )}
                                </div>

                                {/* Ngày bắt đầu */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Ngày bắt đầu <span className="text-red-500">*</span>
                                    </label>
                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                        <DateTimePicker
                                            format={'DD-MM-YYYY HH:mm'}
                                            slotProps={{
                                                textField: {
                                                    size: 'small',
                                                    className: `w-full ${errorNgayBatDau ? 'error' : ''}`,
                                                    sx: {
                                                        '& .MuiOutlinedInput-root': {
                                                            borderRadius: '8px',
                                                            fontSize: '14px',
                                                        },
                                                    },
                                                },
                                                actionBar: {
                                                    actions: ['clear', 'today'],
                                                },
                                            }}
                                            onChange={(e) => {
                                                setVoucherAdd({
                                                    ...voucherAdd,
                                                    ngayBatDau: dayjs(e).format('YYYY-MM-DDTHH:mm:ss'),
                                                });
                                                setErrorNgayBatDau('');
                                            }}
                                        />
                                    </LocalizationProvider>
                                    {errorNgayBatDau && (
                                        <p className="text-red-600 text-sm flex items-center">
                                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                <path
                                                    fillRule="evenodd"
                                                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                            {errorNgayBatDau}
                                        </p>
                                    )}
                                </div>

                                {/* Ngày kết thúc */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Ngày kết thúc <span className="text-red-500">*</span>
                                    </label>
                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                        <DateTimePicker
                                            format={'DD-MM-YYYY HH:mm'}
                                            slotProps={{
                                                textField: {
                                                    size: 'small',
                                                    className: `w-full ${errorNgayKetThuc ? 'error' : ''}`,
                                                    sx: {
                                                        '& .MuiOutlinedInput-root': {
                                                            borderRadius: '8px',
                                                            fontSize: '14px',
                                                        },
                                                    },
                                                },
                                                actionBar: {
                                                    actions: ['clear', 'today'],
                                                },
                                            }}
                                            onChange={(e) => {
                                                setVoucherAdd({
                                                    ...voucherAdd,
                                                    ngayKetThuc: dayjs(e).format('YYYY-MM-DDTHH:mm:ss'),
                                                });
                                                setErrorNgayKetThuc('');
                                            }}
                                        />
                                    </LocalizationProvider>
                                    {errorNgayKetThuc && (
                                        <p className="text-red-600 text-sm flex items-center">
                                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                <path
                                                    fillRule="evenodd"
                                                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                            {errorNgayKetThuc}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="bg-gray-50 px-8 py-6 border-t border-gray-200">
                        <div className="flex items-center justify-end space-x-4">
                            <button
                                onClick={handleNavigateToDiscountVoucher}
                                className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={() => handleVoucherAdd()}
                                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-8 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center font-medium"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                    />
                                </svg>
                                Tạo phiếu giảm giá
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AddVoucher;
