import React from 'react';
import { useState, useEffect } from 'react';
import { IoAdd } from 'react-icons/io5';
import { TbEyeEdit } from 'react-icons/tb';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import swal from 'sweetalert';
import ReactPaginate from 'react-paginate';
import numeral from 'numeral';
import dayjs from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import ExcelJS from 'exceljs';

function PhieuGiamGia() {
    const navigate = useNavigate();
    const [listVoucher, setListVoucher] = useState([]);
    const [listVoucherEx, setListVoucherEx] = useState([]);
    const [pageCount, setPageCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(0);
    const size = 5;

    const [searchVoucher, setSearchVoucher] = useState({
        tenSearch: '',
        ngayBatDauSearch: null,
        ngayKetThucSearch: null,
        kieuGiaTriSearch: '',
        trangThaiSearch: '',
    });

    const validateSearchInput = (value) => {
        const specialCharsRegex = /[!@#\$%\^&*\(\),.?":{}|<>[\]]/;
        return !specialCharsRegex.test(value);
    };

    const [inputValue, setInputValue] = useState('');

    useEffect(() => {
        // Kiểm tra giá trị nhập vào có hợp lệ không
        if (validateSearchInput(inputValue)) {
            setSearchVoucher((prev) => ({
                ...prev,
                tenSearch: inputValue,
            }));

            // Gọi hàm tìm kiếm mỗi khi có sự thay đổi
            loadVoucherSearch(
                {
                    ...searchVoucher,
                    tenSearch: inputValue,
                },
                0,
            ); // Gọi lại hàm tìm kiếm với trang đầu tiên
        }
    }, [inputValue]); // Chạy khi inputValue thay đổi

    const loadVoucherSearch = (searchVoucher, currentPage) => {
        const params = new URLSearchParams({
            tenSearch: searchVoucher.tenSearch || '',
            ngayBatDauSearch: searchVoucher.ngayBatDauSearch
                ? dayjs(searchVoucher.ngayBatDauSearch).format('YYYY-MM-DDTHH:mm:ss')
                : '',
            ngayKetThucSearch: searchVoucher.ngayKetThucSearch
                ? dayjs(searchVoucher.ngayKetThucSearch).format('YYYY-MM-DDTHH:mm:ss')
                : '',
            kieuSearch: searchVoucher.kieuSearch || '',
            kieuGiaTriSearch: searchVoucher.kieuGiaTriSearch || '',
            trangThaiSearch: searchVoucher.trangThaiSearch || '',
            currentPage: currentPage,
            size: size,
        });

        console.log('Search Params:', Object.fromEntries(params)); // Để kiểm tra các tham số

        axios
            .get(`http://localhost:8080/api/phieu-giam-gia/search?${params.toString()}`)
            .then((response) => {
                setListVoucher(response.data.content);
                setPageCount(response.data.totalPages);
                setCurrentPage(response.data.currentPage);
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    };

    useEffect(() => {
        loadVoucherSearch(searchVoucher, 0);
    }, [searchVoucher]);

    const formatCurrency = (money) => {
        return numeral(money).format('0,0') + ' ₫';
    };

    const handleCreateNew = () => {
        navigate('/admin/giam-gia/phieu-giam-gia/add');
    };

    const handleDetail = (id) => {
        navigate(`/admin/giam-gia/phieu-giam-gia/${id}/detail`);
    };

    const handelDeleteVoucher = (id) => {
        const title = 'Xác nhận xóa phiếu giảm giá?';
        const text = 'Bạn chắc chắn muốn xóa phiếu giảm giá này?';

        // Hiển thị SweetAlert để xác nhận
        swal({
            title: title,
            text: text,
            icon: 'warning',
            buttons: {
                cancel: 'Hủy',
                confirm: 'Xác nhận',
            },
        }).then((willConfirm) => {
            if (willConfirm) {
                // Thực hiện gọi API với axios
                axios
                    .delete(`http://localhost:8080/api/phieu-giam-gia/delete/${id}`, {
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    })
                    .then(() => {
                        swal('Thành công!', 'Hủy phiếu giảm giá thành công', 'success');
                        // loadVoucherSearch(searchVoucher, currentPage); // Gọi lại hàm loadVoucher để làm mới danh sách
                        getAllVoucher(); // Gọi lại hàm để làm mới danh sách
                    })
                    .catch((error) => {
                        console.error('Lỗi cập nhật:', error);
                        swal('Thất bại!', 'Hủy phiếu giảm giá thất bại', 'error');
                    });
            }
        });
    };

    const handlePageClick = (event) => {
        const selectedPage = event.selected;
        loadVoucherSearch(searchVoucher, selectedPage); // Gọi hàm tìm kiếm với trang mới
        console.log(`User  requested page number ${selectedPage + 1}`);
    };

    const getAllVoucherExcel = () => {
        axios
            .get(`http://localhost:8080/api/phieu-giam-gia/hien-thi`)
            .then((response) => {
                setListVoucherEx(response.data);
            })
            .catch((error) => {
                console.error('Có lỗi xảy ra:', error);
            });
    };

    useEffect(() => {
        getAllVoucherExcel();
    }, []);

    const exportToExcel = () => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('VoucherData');

        const columns = [
            { header: 'STT', key: 'stt', width: 5 },
            { header: 'Mã', key: 'ma', width: 8 },
            { header: 'Tên', key: 'ten', width: 15 },
            { header: 'Loại', key: 'kieuGiaTri', width: 15 },
            { header: 'Số lượng', key: 'soLuong', width: 15 },
            { header: 'Ngày bắt đầu', key: 'ngayBatDau', width: 17.5 },
            { header: 'Ngày kết thúc', key: 'ngayKetThuc', width: 17.5 },
            { header: 'Trạng thái', key: 'trangThai', width: 20 },
        ];

        worksheet.columns = columns;

        listVoucherEx.forEach((item, index) => {
            worksheet.addRow({
                stt: index + 1,
                ma: item.ma,
                ten: item.ten,
                kieuGiaTri: item.kieuGiaTri === 0 ? 'Phần trăm' : 'Giá tiền',
                soLuong: item.soLuong,
                ngayBatDau: dayjs(item.ngayBatDau).format('DD/MM/YYYY HH:mm'),
                ngayKetThuc: dayjs(item.ngayKetThuc).format('DD/MM/YYYY HH:mm'),
                trangThai: item.trangThai === 2 ? 'Đã kết thúc' : item.trangThai === 1 ? 'Đang diễn ra' : 'Sắp diễn ra',
            });
        });

        const titleStyle = {
            font: { bold: true, color: { argb: 'FFFFFF' } },
            fill: {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF008080' },
            },
        };

        worksheet.getRow(1).eachCell((cell) => {
            cell.style = titleStyle;
        });

        worksheet.columns.forEach((column) => {
            const { width } = column;
            column.width = width;
        });

        const blob = workbook.xlsx.writeBuffer().then(
            (buffer) =>
                new Blob([buffer], {
                    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                }),
        );
        blob.then((blobData) => {
            const url = window.URL.createObjectURL(blobData);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'voucher_data.xlsx';
            link.click();
        });
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header Section */}
            <div className="bg-white shadow-sm border-b border-gray-200 mb-6">
                <div className="px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Phiếu giảm giá</h1>
                            <p className="text-sm text-gray-600 mt-1">Quản lý và theo dõi các phiếu giảm giá</p>
                        </div>
                        <button
                            onClick={handleCreateNew}
                            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center font-medium"
                        >
                            <IoAdd className="mr-2 text-xl" />
                            Tạo phiếu mới
                        </button>
                    </div>
                </div>
            </div>

            <div className="px-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {/* Search and Filter Section */}
                    <div className="p-6 border-b border-gray-100">
                        <div className="flex flex-col lg:flex-row gap-4">
                            {/* Search Input */}
                            <div className="flex-1">
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Tìm kiếm phiếu giảm giá theo mã hoặc tên..."
                                        className="w-full pl-4 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 text-gray-700 placeholder-gray-400"
                                        onChange={(e) => {
                                            const valueNhap = e.target.value;
                                            if (validateSearchInput(valueNhap)) {
                                                setInputValue(valueNhap);
                                            } else {
                                                setInputValue('');
                                                swal('Lỗi!', 'Không được nhập ký tự đặc biệt', 'warning');
                                            }
                                        }}
                                    />
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                        <svg
                                            className="h-5 w-5 text-gray-400"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                            />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            {/* Export Button */}
                            <button
                                onClick={exportToExcel}
                                className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center font-medium whitespace-nowrap"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                    />
                                </svg>
                                Xuất Excel
                            </button>
                        </div>
                        {/* Filter Section */}
                        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">Từ ngày</label>
                                    <DateTimePicker
                                        format={'DD-MM-YYYY HH:mm'}
                                        slotProps={{
                                            textField: {
                                                size: 'small',
                                                className: 'w-full',
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
                                        value={searchVoucher.ngayBatDauSearch}
                                        onChange={(newValue) => {
                                            setSearchVoucher({
                                                ...searchVoucher,
                                                ngayBatDauSearch: newValue,
                                            });
                                            loadVoucherSearch(
                                                {
                                                    ...searchVoucher,
                                                    ngayBatDauSearch: newValue,
                                                },
                                                0,
                                            );
                                        }}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">Đến ngày</label>
                                    <DateTimePicker
                                        format={'DD-MM-YYYY HH:mm'}
                                        slotProps={{
                                            textField: {
                                                size: 'small',
                                                className: 'w-full',
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
                                        value={searchVoucher.ngayKetThucSearch}
                                        onChange={(newValue) => {
                                            setSearchVoucher({
                                                ...searchVoucher,
                                                ngayKetThucSearch: newValue,
                                            });
                                            loadVoucherSearch(
                                                {
                                                    ...searchVoucher,
                                                    ngayKetThucSearch: newValue,
                                                },
                                                0,
                                            );
                                        }}
                                    />
                                </div>
                            </LocalizationProvider>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Loại giảm giá</label>
                                <div className="relative">
                                    <select
                                        value={searchVoucher.kieuGiaTriSearch}
                                        onChange={(e) => {
                                            const newKieuGiaTriSearch = e.target.value;
                                            setSearchVoucher({
                                                ...searchVoucher,
                                                kieuGiaTriSearch: newKieuGiaTriSearch,
                                            });
                                            loadVoucherSearch(
                                                {
                                                    ...searchVoucher,
                                                    kieuGiaTriSearch: newKieuGiaTriSearch,
                                                },
                                                0,
                                            );
                                        }}
                                        className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                                    >
                                        <option value="">Tất cả loại</option>
                                        <option value={0}>Phần trăm</option>
                                        <option value={1}>Giá tiền</option>
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M19 9l-7 7-7-7"
                                            />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Trạng thái</label>
                                <div className="relative">
                                    <select
                                        value={searchVoucher.trangThaiSearch}
                                        onChange={(e) => {
                                            const newTrangThaiSearch = e.target.value;
                                            setSearchVoucher({
                                                ...searchVoucher,
                                                trangThaiSearch: newTrangThaiSearch,
                                            });
                                            loadVoucherSearch(
                                                {
                                                    ...searchVoucher,
                                                    trangThaiSearch: newTrangThaiSearch,
                                                },
                                                0,
                                            );
                                        }}
                                        className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                                    >
                                        <option value="">Tất cả trạng thái</option>
                                        <option value={0}>Sắp diễn ra</option>
                                        <option value={1}>Đang diễn ra</option>
                                        <option value={2}>Đã kết thúc</option>
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M19 9l-7 7-7-7"
                                            />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Table Section */}
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        STT
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Mã phiếu
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Tên phiếu
                                    </th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Giá trị
                                    </th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Số lượng
                                    </th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Ngày bắt đầu
                                    </th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Ngày kết thúc
                                    </th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Trạng thái
                                    </th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Hành động
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {listVoucher &&
                                    listVoucher.length > 0 &&
                                    listVoucher.map((item, index) => {
                                        const stt = currentPage * 5 + index + 1;
                                        return (
                                            <tr
                                                key={`${index}`}
                                                className="hover:bg-gray-50 transition-colors duration-150"
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {stt}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-mono text-gray-900 bg-gray-100 px-2 py-1 rounded">
                                                        {item.ma}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div
                                                        className="text-sm font-medium text-gray-900 max-w-xs truncate"
                                                        title={item.ten}
                                                    >
                                                        {item.ten}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                    <div className="text-sm font-semibold text-amber-600">
                                                        {item.kieuGiaTri === 0
                                                            ? item.giaTri + '%'
                                                            : formatCurrency(item.giaTri)}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {item.kieuGiaTri === 0 ? 'Phần trăm' : 'Giá tiền'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                        {item.soLuong}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                                                    {dayjs(item.ngayBatDau).format('DD/MM/YYYY HH:mm')}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                                                    {dayjs(item.ngayKetThuc).format('DD/MM/YYYY HH:mm')}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                    <span
                                                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                                            item.trangThai === 2
                                                                ? 'bg-red-100 text-red-800 border border-red-200'
                                                                : item.trangThai === 1
                                                                  ? 'bg-green-100 text-green-800 border border-green-200'
                                                                  : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                                                        }`}
                                                        onClick={
                                                            item.trangThai === 2
                                                                ? undefined
                                                                : () => handelDeleteVoucher(item.id)
                                                        }
                                                        style={{
                                                            cursor: item.trangThai === 2 ? 'not-allowed' : 'pointer',
                                                        }}
                                                    >
                                                        <span
                                                            className={`w-2 h-2 rounded-full mr-2 ${
                                                                item.trangThai === 2
                                                                    ? 'bg-red-400'
                                                                    : item.trangThai === 1
                                                                      ? 'bg-green-400'
                                                                      : 'bg-yellow-400'
                                                            }`}
                                                        ></span>
                                                        {item.trangThai === 2
                                                            ? 'Đã kết thúc'
                                                            : item.trangThai === 1
                                                              ? 'Đang diễn ra'
                                                              : 'Sắp diễn ra'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                                    <button
                                                        onClick={() => handleDetail(item.id)}
                                                        className="text-amber-600 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 p-2 rounded-lg transition-all duration-200"
                                                        title="Xem chi tiết"
                                                    >
                                                        <TbEyeEdit className="w-5 h-5" />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                {listVoucher && listVoucher.length === 0 && (
                                    <tr>
                                        <td colSpan="9" className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center">
                                                <svg
                                                    className="w-12 h-12 text-gray-400 mb-4"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={1}
                                                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                                    />
                                                </svg>
                                                <p className="text-gray-500 text-lg font-medium">Không có dữ liệu</p>
                                                <p className="text-gray-400 text-sm mt-1">
                                                    Hãy thử thay đổi bộ lọc hoặc tạo phiếu giảm giá mới
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Section */}
                    {pageCount > 1 && (
                        <div className="bg-white px-6 py-4 border-t border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-700">
                                    Hiển thị <span className="font-medium">{listVoucher.length}</span> kết quả
                                </div>
                                <ReactPaginate
                                    previousLabel={
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M15 19l-7-7 7-7"
                                            />
                                        </svg>
                                    }
                                    nextLabel={
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M9 5l7 7-7 7"
                                            />
                                        </svg>
                                    }
                                    onPageChange={handlePageClick}
                                    pageRangeDisplayed={3}
                                    marginPagesDisplayed={1}
                                    pageCount={pageCount}
                                    breakLabel="..."
                                    // Container
                                    containerClassName="flex items-center space-x-2"
                                    // LI
                                    pageClassName="list-none"
                                    previousClassName="list-none"
                                    nextClassName="list-none"
                                    breakClassName="list-none"
                                    // A
                                    pageLinkClassName="w-10 h-10 flex items-center justify-center text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-amber-50 hover:text-amber-600 hover:border-amber-300 transition-all duration-200"
                                    previousLinkClassName="w-10 h-10 flex items-center justify-center text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-amber-50 hover:text-amber-600 hover:border-amber-300 transition-all duration-200"
                                    nextLinkClassName="w-10 h-10 flex items-center justify-center text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-amber-50 hover:text-amber-600 hover:border-amber-300 transition-all duration-200"
                                    breakLinkClassName="w-10 h-10 flex items-center justify-center text-sm text-gray-500 bg-white border border-gray-300 rounded-lg"
                                    // Đây mới là key
                                    activeLinkClassName="!bg-amber-500 !text-white !border-amber-500"
                                    disabledLinkClassName="!bg-gray-100 !text-gray-400 !cursor-not-allowed hover:!bg-gray-100 hover:!text-gray-400"
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default PhieuGiamGia;
