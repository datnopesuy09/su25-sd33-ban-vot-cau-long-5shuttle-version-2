import React from 'react';
import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { AiOutlineDollar, AiOutlinePercentage } from "react-icons/ai";
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
        trangThai: 0
    }
    const navigate = useNavigate();
    const [voucherAdd, setVoucherAdd] = useState(initialVoucher);
    const [errorMa, setErrorMa] = useState('')
    const [errorTen, setErrorTen] = useState('')
    const [errorGiaTri, setErrorGiaTri] = useState('')
    const [errorGiaTriMax, setErrorGiaTriMax] = useState('')
    const [errorDieuKienNhoNhat, setErrorDieuKienNhoNhat] = useState('')
    const [errorSoLuong, setErrorSoLuong] = useState('')
    const [errorNgayBatDau, setErrorNgayBatDau] = useState('')
    const [errorNgayKetThuc, setErrorNgayKetThuc] = useState('')
    const [giaTriDefault, setGiaTriDefault] = useState(0)
    const [giaTriMaxDefault, setGiaTriMaxDefault] = useState(0)
    const [soLuongDefault, setSoLuongDefault] = useState(0)
    const [dieuKienNhoNhatDefault, setDieuKienNhoNhatDefault] = useState(0)
    const [allMaVoucher, setAllMaVoucher] = useState([])
    const [allTenVoucher, setAllTenVoucher] = useState([])

    const listMa = []
    allMaVoucher.map((m) => listMa.push(m.toLowerCase()))
    const listTen = []
    allTenVoucher.map((m) => listTen.push(m.toLowerCase()))

    const handleNavigateToDiscountVoucher = () => {
        navigate('/admin/giam-gia/phieu-giam-gia');
    };

    const handleAllMaVoucher = () => {
        axios.get(`http://localhost:8080/api/phieu-giam-gia/list-ma-phieu-giam-gia`)
            .then((response) => {
                setAllMaVoucher(response.data)
            })
            .catch((error) => {
                console.error('Error:', error)
            })
    }

    const handleAllTenVoucher = () => {
        axios.get(`http://localhost:8080/api/phieu-giam-gia/list-ten-phieu-giam-gia`)
            .then((response) => {
                setAllTenVoucher(response.data)
            })
            .catch((error) => {
                console.error('Error:', error)
            })
    }

    useEffect(() => {
        handleAllMaVoucher();
        handleAllTenVoucher();
    }, []);

    const handleValidation = () => {
        let check = 0
        const errors = {
            ma: '',
            ten: '',
            giaTri: '',
            giaTriMax: '',
            soLuong: '',
            dieuKienNhoNhat: '',
            ngayBatDau: '',
            ngayKetThuc: '',
        }

        const minBirthYear = 1900
        const specialCharsRegex = /[!@#$%^&*(),.?":{}|<>]/

        if (voucherAdd.ma.trim() === '') {
            errors.ma = 'Mã không được để trống'
        } else if (voucherAdd.ma !== voucherAdd.ma.trim()) {
            errors.ma = 'Mã không được chứa khoảng trắng thừa'
        } else if (voucherAdd.ma.length > 30) {
            errors.ma = 'Mã không được dài hơn 30 ký tự'
        } else if (voucherAdd.ma.length < 5) {
            errors.ma = 'Mã không được bé hơn 5 ký tự'
        } else if (listMa.includes(voucherAdd.ma.toLowerCase())) {
            errors.ma = 'Mã đã tồn tại'
        } else if (specialCharsRegex.test(voucherAdd.ma)) {
            errors.ma = 'Mã không được chứa ký tự đặc biệt'
        }

        if (voucherAdd.ten.trim() === '') {
            errors.ten = 'Tên không được để trống'
        } else if (voucherAdd.ten !== voucherAdd.ten.trim()) {
            errors.ten = 'Tên không được chứa khoảng trắng thừa'
        } else if (voucherAdd.ten.length > 100) {
            errors.ten = 'Tên không được dài hơn 100 ký tự'
        } else if (voucherAdd.ten.length < 5) {
            errors.ten = 'Tên không được bé hơn 5 ký tự'
        } else if (listTen.includes(voucherAdd.ten.toLowerCase())) {
            errors.ten = 'Tên đã tồn tại'
        } else if (specialCharsRegex.test(voucherAdd.ten)) {
            errors.ten = 'Tên không được chứa ký tự đặc biệt'
        }

        if (voucherAdd.kieuGiaTri === 0) {
            if (voucherAdd.giaTri === null) {
                setVoucherAdd({ ...voucherAdd, giaTri: 0 })
                errors.giaTri = 'Giá trị tối thiểu 1%'
            } else if (!Number.isInteger(parseInt(voucherAdd.giaTri))) {
                errors.giaTri = 'Giá trị chỉ được nhập số nguyên'
            } else if (voucherAdd.giaTri < 1) {
                errors.giaTri = 'Giá trị tối thiểu 1%'
            } else if (voucherAdd.giaTri > 100) {
                errors.giaTri = 'Giá trị tối đa 100%'
            }
        } else {
            if (voucherAdd.giaTri === null) {
                setVoucherAdd({ ...voucherAdd, giaTri: 0 })
                errors.giaTri = 'Giá trị tối thiểu 1 ₫'
            } else if (!Number.isInteger(parseInt(voucherAdd.giaTri))) {
                errors.giaTri = 'Giá trị chỉ được nhập số nguyên'
            } else if (voucherAdd.giaTri < 1) {
                errors.giaTri = 'Giá trị tối thiểu 1 ₫'
            } else if (voucherAdd.giaTri > 50000000) {
                errors.giaTri = 'Giá trị tối đa 50,000,000 ₫'
            }
        }

        if (voucherAdd.giaTriMax === null) {
            setVoucherAdd({ ...voucherAdd, giaTriMax: 0 })
            errors.giaTriMax = 'Giá trị tối đa tối thiểu 1 ₫'
        } else if (!Number.isInteger(parseInt(voucherAdd.giaTriMax))) {
            errors.giaTriMax = 'Giá trị tối đa chỉ được nhập số nguyên'
        } else if (voucherAdd.giaTriMax < 1) {
            errors.giaTriMax = 'Giá trị tối đa tối thiểu 1 ₫'
        } else if (voucherAdd.giaTriMax > 50000000) {
            errors.giaTriMax = 'Giá trị tối đa tối đa 50,000,000 ₫'
        } else if (voucherAdd.kieuGiaTri === 1 && voucherAdd.giaTriMax !== voucherAdd.giaTri) {
            errors.giaTriMax = 'Giá trị tối đa phải bằng giá trị'
        }

        if (voucherAdd.soLuong === null) {
            setVoucherAdd({ ...voucherAdd, soLuong: 0 })
            errors.soLuong = 'Số lượng tối thiểu 1'
        } else if (!Number.isInteger(parseInt(voucherAdd.soLuong))) {
            errors.soLuong = 'Số lượng chỉ được nhập số nguyên'
        } else if (voucherAdd.soLuong < 1) {
            errors.soLuong = 'Số lượng tối thiểu 1'
        }

        if (voucherAdd.dieuKienNhoNhat === null) {
            // setVoucherAdd({ ...voucherAdd, dieuKienNhoNhat: 0 })
            errors.dieuKienNhoNhat = 'Điều kiện không được bỏ trống'
        } else if (!Number.isInteger(parseInt(voucherAdd.dieuKienNhoNhat))) {
            errors.dieuKienNhoNhat = 'Điều kiện chỉ được nhập số nguyên'
        } else if (voucherAdd.dieuKienNhoNhat > 50000000) {
            errors.dieuKienNhoNhat = 'Điều kiện tối thiểu tối đa 50,000,000 ₫'
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
                check++
            }
        }

        setErrorMa(errors.ma)
        setErrorTen(errors.ten)
        setErrorGiaTri(errors.giaTri)
        setErrorGiaTriMax(errors.giaTriMax)
        setErrorDieuKienNhoNhat(errors.dieuKienNhoNhat)
        setErrorSoLuong(errors.soLuong)
        setErrorNgayBatDau(errors.ngayBatDau)
        setErrorNgayKetThuc(errors.ngayKetThuc)
        return check
    }

    const formatCurrency = (money) => {
        return numeral(money).format('0,0') + ' ₫'
    }

    const handleSetValue = (value) => {
        if (voucherAdd.kieuGiaTri === 0) {
            setVoucherAdd({
                ...voucherAdd,
                giaTri: formatCurrency(value).replace(/\D/g, ''),
            })
            setGiaTriDefault(formatCurrency(value).replace(/\D/g, ''))
        } else {
            setVoucherAdd({
                ...voucherAdd,
                giaTri: formatCurrency(value).replace(/\D/g, ''),
                giaTriMax: formatCurrency(value).replace(/\D/g, ''),
            })
            setGiaTriDefault(formatCurrency(value))
            setGiaTriMaxDefault(formatCurrency(value))
        }
        setErrorGiaTri('')
    }

    const handleVoucherAdd = () => {
        const check = handleValidation();
        if (check < 1) {
            const title = 'Xác nhận thêm mới phiếu giảm giá?';

            swal({
                title: title,
                text: 'Bạn có chắc chắn muốn thêm phiếu giảm giá không?',
                icon: 'warning',
                buttons: {
                    cancel: "Hủy",
                    confirm: "Xác nhận",
                },
            }).then((willConfirm) => {
                if (willConfirm) {
                    axios.post('http://localhost:8080/api/phieu-giam-gia/add', voucherAdd, {
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    })
                        .then(() => {
                            swal("Thành công!", "Thêm mới phiếu giảm giá thành công!", "success");
                            navigate('/admin/giam-gia/phieu-giam-gia');
                        })
                        .catch((error) => {
                            console.error("Lỗi cập nhật:", error);
                            swal("Thất bại!", "Thêm mới phiếu giảm giá thất bại!", "error");
                        });
                }
            });
        } else {
            swal("Thất bại!", "Không thể thêm phiếu giảm giá", "error");
        }
    };


    return (
        <div>
            <div className="font-bold text-sm">
                <span
                    className="cursor-pointer"
                    onClick={handleNavigateToDiscountVoucher}
                >
                    Phiếu giảm giá
                </span>
                <span className="text-gray-400 ml-2">/ Tạo phiếu giảm giá</span>
            </div>


            <div className="p-4 bg-white rounded-md shadow-lg">
                <div className="flex items-center justify-center">
                    <div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-gray-600 mb-1">Mã phiếu giảm giá</label>
                                <input
                                    type="text"
                                    className="w-full border border-gray-300 rounded-md p-2"
                                    placeholder="Nhập mã"
                                    onChange={(e) => {
                                        setVoucherAdd({...voucherAdd, ma: e.target.value})
                                        setErrorMa('')
                                    }}
                                    error={errorMa ? 'true' : undefined}
                                />
                                <span className='text-red-600 text-xs italic'>{errorMa}</span>
                            </div>

                            <div>
                                <label className="block text-gray-600 mb-1">Tên phiếu giảm giá</label>
                                <input
                                    type="text"
                                    className="w-full border border-gray-300 rounded-md p-2"
                                    placeholder="Nhập tên"
                                    onChange={(e) => {
                                        setVoucherAdd({...voucherAdd, ten: e.target.value})
                                        setErrorTen('')
                                    }}
                                    error={errorTen ? 'true' : undefined}
                                />
                                <span className='text-red-600 text-xs italic'>{errorTen}</span>
                            </div>

                            <div>
                                <label className="block text-gray-600 mb-1">Giá trị</label>
                                <div className="flex">
                                    <input
                                        type="text"
                                        className="w-full border border-gray-300 rounded-l-md p-2"
                                        placeholder="Nhập giá trị"
                                        value={giaTriDefault}
                                        onChange={(e) => handleSetValue(e.target.value)}
                                        error={errorGiaTri ? 'true' : undefined}
                                    />
                                    <div className="flex items-center px-2 bg-gray-200 rounded-r-md">
                                        <AiOutlinePercentage
                                            color={voucherAdd.kieuGiaTri === 0 ? '#fc7c27' : ''}
                                            className="cursor-pointer"
                                            onClick={() => {
                                                setVoucherAdd({...voucherAdd, kieuGiaTri: 0, giaTri: 0});
                                                setGiaTriDefault(0)
                                                setGiaTriMaxDefault(0)
                                            }}
                                        />
                                        <AiOutlineDollar
                                            color={voucherAdd.kieuGiaTri === 1 ? '#fc7c27' : ''}
                                            className="cursor-pointer ml-2"
                                            onClick={() => {
                                                setVoucherAdd({...voucherAdd, kieuGiaTri: 1, giaTri: 0, giaTriMax: 0});
                                                setErrorGiaTri('')
                                                setGiaTriDefault(formatCurrency(0))
                                                setGiaTriMaxDefault(formatCurrency(0))
                                            }}
                                        />
                                    </div>
                                </div>
                                <span className='text-red-600 text-xs italic'>{errorGiaTri}</span>
                            </div>

                            <div>
                                <label className="block text-gray-600 mb-1">Giá trị tối đa</label>
                                <div className="flex">
                                    <input
                                        disabled={voucherAdd.kieuGiaTri === 1}
                                        type="text"
                                        className="w-full border border-gray-300 rounded-l-md p-2"
                                        placeholder="Nhập giá trị tối đa"
                                        value={formatCurrency(giaTriMaxDefault)}
                                        onChange={(e) => {
                                            // Chỉ cập nhật giaTriMax khi không bị vô hiệu hóa
                                            if (voucherAdd.kieuGiaTri !== 1) {
                                                setVoucherAdd({
                                                    ...voucherAdd,
                                                    giaTriMax: formatCurrency(e.target.value).replace(/\D/g, ''),
                                                });
                                                setGiaTriMaxDefault(formatCurrency(e.target.value)); // Cập nhật giaTriMaxDefault
                                                setErrorGiaTriMax('');
                                            }
                                        }}

                                        error={errorGiaTriMax ? 'true' : undefined}
                                    />
                                    <span className="flex items-center px-4 bg-gray-200 rounded-r-md">đ</span>
                                </div>
                                <span className='text-red-600 text-xs italic'>{errorGiaTriMax}</span>
                            </div>

                            <div>
                                <label className="block text-gray-600 mb-1">Số lượng</label>
                                <input
                                    type="number"
                                    className="w-full border border-gray-300 rounded-md p-2"
                                    placeholder="Nhập số lượng"
                                    value={soLuongDefault}
                                    onChange={(e) => {
                                        setVoucherAdd({
                                            ...voucherAdd,
                                            soLuong: formatCurrency(e.target.value).replace(/\D/g, '')
                                        })
                                        setErrorSoLuong('')
                                        setSoLuongDefault(formatCurrency(e.target.value).replace(/\D/g, ''))
                                    }}
                                    error={errorSoLuong ? 'true' : undefined}
                                />
                                <span className='text-red-600 text-xs italic'>{errorSoLuong}</span>
                            </div>

                            <div>
                                <label className="block text-gray-600 mb-1">Điều kiện</label>
                                <div className="flex">
                                    <input
                                        type="text"
                                        className="w-full border border-gray-300 rounded-l-md p-2"
                                        placeholder="Nhập điều kiện"
                                        value={formatCurrency(dieuKienNhoNhatDefault)}
                                        onChange={(e) => {
                                            setVoucherAdd({
                                                ...voucherAdd,
                                                dieuKienNhoNhat: formatCurrency(e.target.value).replace(/\D/g, ''),
                                            })
                                            setErrorDieuKienNhoNhat('')
                                            setDieuKienNhoNhatDefault(formatCurrency(e.target.value))
                                        }}
                                        error={errorDieuKienNhoNhat ? 'true' : undefined}
                                    />
                                    <span className="flex items-center px-4 bg-gray-200 rounded-r-md">đ</span>
                                </div>
                                <span className='text-red-600 text-xs italic'>{errorDieuKienNhoNhat}</span>
                            </div>

                            <div className='flex flex-col gap-1 mt-2'>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DateTimePicker
                                        format={'DD-MM-YYYY HH:mm:ss'}
                                        label="Từ ngày"
                                        slotProps={{
                                            textField: {
                                                size: 'small',
                                                className: 'w-full'  // <-- thêm dòng này
                                            },
                                            actionBar: {
                                                actions: ['clear', 'today']
                                            }
                                        }}
                                        onChange={(e) => {
                                            setVoucherAdd({
                                                ...voucherAdd,
                                                ngayBatDau: dayjs(e).format('YYYY-MM-DDTHH:mm:ss')
                                            })
                                            setErrorNgayBatDau('')
                                        }}
                                    />
                                </LocalizationProvider>
                                <span className='text-red-600 text-xs italic'>{errorNgayBatDau}</span>
                            </div>

                            <div className='flex flex-col gap-1 mt-2'>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DateTimePicker
                                        format={'DD-MM-YYYY HH:mm:ss'}
                                        label="Đến ngày"
                                        slotProps={{
                                            textField: {
                                                size: 'small',
                                                className: 'w-full'  // <-- thêm dòng này
                                            },
                                            actionBar: {
                                                actions: ['clear', 'today']
                                            }
                                        }}
                                        onChange={(e) => {
                                            setVoucherAdd({
                                                ...voucherAdd,
                                                ngayKetThuc: dayjs(e).format('YYYY-MM-DDTHH:mm:ss')
                                            })
                                            setErrorNgayKetThuc('')
                                        }}
                                    />
                                </LocalizationProvider>
                                <span className='text-red-600 text-xs italic'>{errorNgayKetThuc}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="pt-4">
                    <button
                        onClick={() => handleVoucherAdd()}
                        className="border border-amber-400 hover:bg-gray-100 text-amber-400 py-2 px-4 rounded-md ml-auto flex items-center"
                    >
                        Tạo Voucher
                    </button>
                </div>
            </div>
        </div>
    );
}

export default AddVoucher;

