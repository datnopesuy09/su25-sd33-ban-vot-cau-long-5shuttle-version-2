import React from 'react';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AiOutlinePercentage, AiOutlineDollar } from 'react-icons/ai';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import dayjs from 'dayjs';
import numeral from 'numeral';
import swal from 'sweetalert';

function UpdatePhieuGiamGia() {
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

    // const validateSearchInput = (value) => {
    //     const specialCharsRegex = /[!@#\$%\^&*\(\),.?":{}|<>[\]]/
    //     return !specialCharsRegex.test(value);
    // }

    // const [inputValue, setInputValue] = useState('');

    // useEffect(() => {
    //     // Kiểm tra giá trị nhập vào có hợp lệ không
    //     if (validateSearchInput(inputValue)) {
    //         setSearchKhachHang((prev) => ({
    //             ...prev,
    //             tenSearch: inputValue
    //         }));
    //
    //         // Gọi hàm tìm kiếm mỗi khi có sự thay đổi
    //         loadKhachHangSearch({
    //             ...searchKhachHang,
    //             tenSearch: inputValue
    //         }, 0); // Gọi lại hàm tìm kiếm với trang đầu tiên
    //     }
    // }, [inputValue]); // Chạy khi inputValue thay đổi

    const { id } = useParams();
    const navigate = useNavigate();
    const [voucherDetail, setVoucherDetail] = useState(initialVoucher);
    const [allMaVoucher, setAllMaVoucher] = useState([]);
    const [allTenVoucher, setAllTenVoucher] = useState([]);
    const [prevMaValue, setPrevMaValue] = useState('');
    const [prevTenValue, setPrevTenValue] = useState('');
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
        fetchData(id);
        handleAllMaVoucher();
        handleAllTenVoucher();
    }, [id]);

    const fetchData = async () => {
        axios
            .get(`http://localhost:8080/api/phieu-giam-gia/detail/${id}`)
            .then((response) => {
                setVoucherDetail({
                    ...response.data,
                });
                setPrevMaValue(response.data.ma);
                setPrevTenValue(response.data.ten);

                setGiaTriDefault(response.data.giaTri);
                setGiaTriMaxDefault(response.data.giaTriMax);
                setDieuKienNhoNhatDefault(response.data.dieuKienNhoNhat);
                setSoLuongDefault(response.data.soLuong);
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    };

    const formatCurrency = (money) => {
        return numeral(money).format('0,0') + ' ₫';
    };

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

        if (voucherDetail.ma.trim() === '') {
            errors.ma = 'Mã không được để trống';
        } else if (voucherDetail.ma !== voucherDetail.ma.trim()) {
            errors.ma = 'Mã không được chứa khoảng trắng thừa';
        } else if (voucherDetail.ma.length > 30) {
            errors.ma = 'Mã không được dài hơn 30 ký tự';
        } else if (voucherDetail.ma.length < 5) {
            errors.ma = 'Mã không được bé hơn 5 ký tự';
        } else if (prevMaValue !== voucherDetail.ma && listMa.includes(voucherDetail.ma.toLocaleLowerCase())) {
            errors.ma = 'Mã đã tồn tại';
        } else if (specialCharsRegex.test(voucherDetail.ma)) {
            errors.ma = 'Mã không được chứa ký tự đặc biệt';
        }

        if (voucherDetail.ten.trim() === '') {
            errors.ten = 'Tên không được để trống';
        } else if (voucherDetail.ten !== voucherDetail.ten.trim()) {
            errors.ten = 'Tên không được chứa khoảng trắng thừa';
        } else if (voucherDetail.ten.length > 100) {
            errors.ten = 'Tên không được dài hơn 100 ký tự';
        } else if (voucherDetail.ten.length < 5) {
            errors.ten = 'Tên không được bé hơn 5 ký tự';
        } else if (prevTenValue !== voucherDetail.ten && listTen.includes(voucherDetail.ten.toLowerCase())) {
            errors.ten = 'Tên đã tồn tại';
        } else if (specialCharsRegex.test(voucherDetail.ten)) {
            errors.ten = 'Tên không được chứa ký tự đặc biệt';
        }

        if (voucherDetail.kieuGiaTri === 0) {
            if (voucherDetail.giaTri === null) {
                errors.giaTri = 'Giá trị không được để trống';
            } else if (!Number.isInteger(parseInt(voucherDetail.giaTri))) {
                errors.giaTri = 'Giá trị chỉ được nhập số nguyên';
            } else if (voucherDetail.giaTri < 1) {
                errors.giaTri = 'Giá trị tối thiểu 1%';
            } else if (voucherDetail.giaTri > 100) {
                errors.giaTri = 'Giá trị tối đa 100%';
            }
        } else {
            if (voucherDetail.giaTri === null) {
                errors.giaTri = 'Giá trị không được để trống';
            } else if (!Number.isInteger(parseInt(voucherDetail.giaTri))) {
                errors.giaTri = 'Giá trị chỉ được nhập số nguyên';
            } else if (voucherDetail.giaTri < 1) {
                errors.giaTri = 'Giá trị tối thiểu 1 ₫';
            } else if (voucherDetail.giaTri > 50000000) {
                errors.giaTri = 'Giá trị tối đa 50,000,000 ₫';
            }
        }

        if (voucherDetail.giaTriMax === null) {
            errors.giaTriMax = 'Giá trị tối đa không được để trống';
        } else if (!Number.isInteger(parseInt(voucherDetail.giaTriMax))) {
            errors.giaTriMax = 'Giá trị tối đa chỉ được nhập số nguyên';
        } else if (voucherDetail.giaTriMax < 1) {
            errors.giaTriMax = 'Giá trị tối đa tối thiểu 1 ₫';
        } else if (voucherDetail.giaTriMax > 50000000) {
            errors.giaTriMax = 'Giá trị tối đa tối đa 50,000,000 ₫';
        }

        if (voucherDetail.soLuong === null) {
            errors.soLuong = 'Số lượng không được để trống';
        } else if (!Number.isInteger(parseInt(voucherDetail.soLuong))) {
            errors.soLuong = 'Số lượng chỉ được nhập số nguyên';
        } else if (voucherDetail.soLuong < 1) {
            errors.soLuong = 'Số lượng tối thiểu 1';
        }

        if (voucherDetail.dieuKienNhoNhat === null) {
            errors.dieuKienNhoNhat = 'Điều kiện không được để trống';
        } else if (!Number.isInteger(parseInt(voucherDetail.dieuKienNhoNhat))) {
            errors.dieuKienNhoNhat = 'Điều kiện chỉ được nhập số nguyên';
        } else if (voucherDetail.dieuKienNhoNhat < 0) {
            errors.dieuKienNhoNhat = 'Điều kiện tối thiểu 0 ₫';
        } else if (voucherDetail.dieuKienNhoNhat > 50000000) {
            errors.dieuKienNhoNhat = 'Điều kiện tối thiểu tối đa 50,000,000 ₫';
        }

        const minDate = new Date(minBirthYear, 0, 1); // Ngày bắt đầu từ 01-01-minBirthYear

        // Kiểm tra ngày bắt đầu
        if (!voucherDetail.ngayBatDau) {
            errors.ngayBatDau = 'Ngày bắt đầu không được để trống';
        } else {
            const ngayBatDau = new Date(voucherDetail.ngayBatDau);
            if (ngayBatDau < minDate) {
                errors.ngayBatDau = 'Ngày bắt đầu không hợp lệ';
            }
        }

        // Kiểm tra ngày kết thúc
        if (!voucherDetail.ngayKetThuc) {
            errors.ngayKetThuc = 'Ngày kết thúc không được để trống';
        } else {
            const ngayBatDau = new Date(voucherDetail.ngayBatDau);
            const ngayKetThuc = new Date(voucherDetail.ngayKetThuc);

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

    const handleVoucherUpdate = (idUpdate, voucherDetail) => {
        const check = handleValidation();

        if (check < 1) {
            const title = 'Xác nhận cập nhật phiếu giảm giá?';
            const text = 'Bạn có chắc chắn muốn cập nhật phiếu giảm giá không?';

            swal({
                title: title,
                text: text,
                icon: 'question',
                buttons: {
                    cancel: 'Hủy',
                    confirm: 'Xác nhận',
                },
            }).then((willConfirm) => {
                if (willConfirm) {
                    const updatedVoucher = {
                        ...voucherDetail,
                    };

                    axios
                        .put(`http://localhost:8080/api/phieu-giam-gia/update/${idUpdate}`, updatedVoucher, {
                            headers: {
                                'Content-Type': 'application/json',
                            },
                        })
                        .then(() => {
                            swal('Thành công!', 'Cập nhật phiếu giảm giá thành công!', 'success');
                            navigate('/admin/giam-gia/phieu-giam-gia');
                        })
                        .catch((error) => {
                            console.error('Lỗi cập nhật:', error);
                            
                            // Xử lý lỗi từ backend
                            if (error.response && error.response.data && error.response.data.error) {
                                const errorMessage = error.response.data.error;
                                if (errorMessage.includes('đã được sử dụng')) {
                                    swal('Không thể cập nhật!', 
                                         'Phiếu giảm giá này đã được sử dụng trong các hóa đơn. Việc cập nhật sẽ làm sai lệch dữ liệu hóa đơn!', 
                                         'warning');
                                } else {
                                    swal('Thất bại!', errorMessage, 'error');
                                }
                            } else {
                                swal('Thất bại!', 'Cập nhật phiếu giảm giá thất bại!', 'error');
                            }
                        });
                }
            });
        } else {
            swal('Thất bại!', 'Không thể cập nhật phiếu giảm giá!', 'error');
        }
    };

    const handleSetValue = (value) => {
        if (voucherDetail.kieuGiaTri === 0) {
            setVoucherDetail({
                ...voucherDetail,
                giaTri: formatCurrency(value).replace(/\D/g, ''),
            });
            setGiaTriDefault(formatCurrency(value).replace(/\D/g, ''));
        } else {
            setVoucherDetail({
                ...voucherDetail,
                giaTri: formatCurrency(value).replace(/\D/g, ''),
                giaTriMax: formatCurrency(value).replace(/\D/g, ''),
            });
            setGiaTriDefault(formatCurrency(value));
            setGiaTriMaxDefault(formatCurrency(value));
        }
        setErrorGiaTri('');
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
                                <span className="text-gray-900 font-medium">Cập nhật phiếu giảm giá</span>
                            </nav>
                            <h1 className="text-2xl font-bold text-gray-900">Cập nhật phiếu giảm giá</h1>
                            <p className="text-sm text-gray-600 mt-1">Chỉnh sửa thông tin phiếu giảm giá</p>
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
                                        value={voucherDetail?.ma}
                                        onChange={(e) => {
                                            setVoucherDetail({
                                                ...voucherDetail,
                                                ma: e.target.value,
                                            });
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
                                        value={voucherDetail?.ten}
                                        onChange={(e) => {
                                            setVoucherDetail({
                                                ...voucherDetail,
                                                ten: e.target.value,
                                            });
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
                                            value={
                                                voucherDetail.kieuGiaTri === 0
                                                    ? giaTriDefault
                                                    : formatCurrency(giaTriDefault)
                                            }
                                            onChange={(e) => handleSetValue(e.target.value)}
                                        />
                                        <div className="flex items-center px-4 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg">
                                            <AiOutlinePercentage
                                                color={voucherDetail.kieuGiaTri === 0 ? '#f59e0b' : '#6b7280'}
                                                className="cursor-pointer hover:text-amber-600 transition-colors duration-200"
                                                size={20}
                                                onClick={() => {
                                                    setVoucherDetail({
                                                        ...voucherDetail,
                                                        kieuGiaTri: 0,
                                                        giaTri: 0,
                                                    });
                                                    setGiaTriDefault(0);
                                                    setGiaTriMaxDefault(0);
                                                }}
                                                title="Phần trăm"
                                            />
                                            <AiOutlineDollar
                                                color={voucherDetail.kieuGiaTri === 1 ? '#f59e0b' : '#6b7280'}
                                                className="cursor-pointer ml-3 hover:text-amber-600 transition-colors duration-200"
                                                size={20}
                                                onClick={() => {
                                                    setVoucherDetail({
                                                        ...voucherDetail,
                                                        kieuGiaTri: 1,
                                                        giaTri: 0,
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
                                            disabled={voucherDetail.kieuGiaTri === 1}
                                            type="text"
                                            className={`flex-1 px-4 py-3 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 ${
                                                errorGiaTriMax ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                            } ${voucherDetail.kieuGiaTri === 1 ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                            placeholder="Nhập giá trị tối đa"
                                            value={formatCurrency(giaTriMaxDefault)}
                                            onChange={(e) => {
                                                if (voucherDetail.kieuGiaTri !== 1) {
                                                    setVoucherDetail({
                                                        ...voucherDetail,
                                                        giaTriMax: formatCurrency(e.target.value).replace(/\D/g, ''),
                                                    });
                                                    setErrorGiaTriMax('');
                                                    setGiaTriMaxDefault(formatCurrency(e.target.value));
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
                                            setVoucherDetail({
                                                ...voucherDetail,
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
                                                setVoucherDetail({
                                                    ...voucherDetail,
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
                                            value={dayjs(voucherDetail?.ngayBatDau, 'YYYY-MM-DDTHH:mm:ss')}
                                            onChange={(e) => {
                                                setVoucherDetail({
                                                    ...voucherDetail,
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
                                            value={dayjs(voucherDetail?.ngayKetThuc, 'YYYY-MM-DDTHH:mm:ss')}
                                            onChange={(e) => {
                                                setVoucherDetail({
                                                    ...voucherDetail,
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
                                onClick={() => handleVoucherUpdate(id, voucherDetail)}
                                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-8 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center font-medium"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                    />
                                </svg>
                                Cập nhật phiếu giảm giá
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default UpdatePhieuGiamGia;
