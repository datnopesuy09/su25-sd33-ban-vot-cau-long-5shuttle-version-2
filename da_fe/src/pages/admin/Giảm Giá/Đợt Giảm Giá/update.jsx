import React, { useEffect, useCallback, useState } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import swal from "sweetalert";
import dayjs from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import qs from "qs";

function UpdateDotGiamGia() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [tenSanPhamSearch, setTenSanPhamSearch] = useState('');
    const [tableDataSanPham, setTableDataSanPham] = useState([]);
    const [tableDataSPCT, setTableDataSPCT] = useState([]);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [selectedRowsKeysSPCT, setSelectedRowsKeysSPCT] = useState([]);

    const [errorTen, setErrorTen] = useState('')
    const [errorGiaTri, setErrorGiaTri] = useState('')
    const [errorTgBatDau, setErrorTgBatDau] = useState('')
    const [errorTgKetThuc, setErrorTgKetThuc] = useState('')
    const [getTenKhuyenMai, setGetTenKhuyenMai] = useState([])

    const [listThuongHieu, setListThuongHieu] = useState([]);
    const [listChatLieu, setListChatLieu] = useState([]);
    const [listMauSac, setListMauSac] = useState([]);
    const [listTrongLuong, setListTrongLuong] = useState([]);
    const [listDiemCanBang, setListDiemCanBang] = useState([]);
    const [listDoCung, setListDoCung] = useState([]);

    const [updateKhuyenMai, setUpdateKhuyenMai] = useState({
        ten: '',
        giaTri: '',
        loai: true,
        tgBatDau: '',
        tgKetThuc: '',
        trangThai: 0,
        idProductDetail: selectedRowsKeysSPCT
    })

    const handleNavigateToDotGiamGia = () => {
        navigate('/admin/giam-gia/dot-giam-gia');
    };

    const onSelectChange = (newSelectedRowKeys) => {
        console.log('selectedRowKeys changed: ', newSelectedRowKeys);
        setSelectedRowKeys(newSelectedRowKeys);
    };

    const getAllTenKhuyenMai = () => {
        axios.get(`http://localhost:8080/api/dot-giam-gia/list-ten-khuyen-mai`)
            .then((response) => {
                setGetTenKhuyenMai(response.data)
            })
            .catch((error) => {
                console.error('Error:', error)
            })
    }

    const khuyenMaiTen = getTenKhuyenMai.map((khuyenMai) => khuyenMai.ten)

    const fetchData = async () => {
        try {
            const response = await axios.get(`http://localhost:8080/api/dot-giam-gia/detail/${id}`);
            const idSPCTRes = await axios.get(`http://localhost:8080/api/dot-giam-gia/get-id-san-pham-chi-tiet-by-id-khuyen-mai/${id}`);
            const idSpcts = idSPCTRes.data; // danh sách idSanPhamCt

            // Gọi API lấy thông tin SPCT theo ID
            const allProductDetails = await Promise.all(
                idSpcts.map(async (id) => {
                    const res = await axios.get(`http://localhost:8080/api/san-pham-ct/${id}`);
                    return res.data;
                })
            );

            // Lấy danh sách id sản phẩm cha
            const idSp = [...new Set(allProductDetails.map(item => item.sanPham.id))];
            console.log('id sp', idSp)

            // Gọi API lấy toàn bộ SPCT theo từng id sản phẩm
            const allProductDetailsSP = await Promise.all(
                idSp.map(async (id) => {
                    const res = await axios.get(`http://localhost:8080/api/dot-giam-gia/san-pham-ct/san-pham/${id}`);
                    return res.data;
                })
            );

            // Flatten mảng 2 chiều
            const flatten = allProductDetailsSP.flat().map(i => ({ ...i, key: i.id }));

            // Set vào bảng
            setTableDataSPCT(flatten);
            setSelectedRowKeys(idSp);        // tích bảng sản phẩm
            setSelectedRowsKeysSPCT(idSpcts); // tích bảng SPCT

            setUpdateKhuyenMai(response.data);

        } catch (error) {
            console.error("Error fetching voucher details:", error);
        }
    };

    useEffect(() => {
        getAllTenKhuyenMai()
        fetchData(id);
    }, [id]);

    const handleCheckboxChangeSanPham = async (e, sanPham) => {
        const isChecked = e.target.checked;
        let newSelectedKeys = [...selectedRowKeys];

        if (isChecked) {
            newSelectedKeys.push(sanPham.id);
        } else {
            newSelectedKeys = newSelectedKeys.filter(id => id !== sanPham.id);
        }

        setSelectedRowKeys(newSelectedKeys);

        // Gọi API giống trong rowSelection
        if (newSelectedKeys.length > 0) {
            try {
                const res = await axios.get("http://localhost:8080/api/dot-giam-gia/get-san-pham-chi-tiet-by-san-pham", {
                    params: {
                        id: newSelectedKeys
                    },
                    paramsSerializer: params => qs.stringify(params, { indices: false })
                });

                const flatten = res.data.flat().map(i => ({ ...i, key: i.id }));
                setTableDataSPCT(flatten);
            } catch (error) {
                console.error("Lỗi lấy sản phẩm chi tiết", error);
            }
        } else {
            setTableDataSPCT([]);
        }
    };

    const handleSelectAllSanPham = async (e) => {
        const isChecked = e.target.checked;
        if (isChecked) {
            const allIds = tableDataSanPham.map(sp => sp.id);
            setSelectedRowKeys(allIds);

            try {
                const res = await axios.get("http://localhost:8080/api/dot-giam-gia/get-san-pham-chi-tiet-by-san-pham", {
                    params: { id: allIds },
                    paramsSerializer: params => qs.stringify(params, { indices: false })
                    // 👉 Sẽ gửi đúng dạng ?id=1&id=2&id=3
                });

                const flatten = res.data.flat().map(i => ({ ...i, key: i.id }));
                setTableDataSPCT(flatten);
            } catch (error) {
                console.error("Lỗi khi chọn tất cả", error);
            }
        } else {
            setSelectedRowKeys([]);
            setTableDataSPCT([]);
        }
    };

    const handleCheckboxChangeSPCT = (e, id) => {
        if (e.target.checked) {
            setSelectedRowsKeysSPCT((prev) => [...prev, id]);
        } else {
            setSelectedRowsKeysSPCT((prev) => prev.filter((item) => item !== id));
        }
    };

    const handleSelectAllSPCT = (e) => {
        if (e.target.checked) {
            const allIds = tableDataSPCT.map(spct => spct.id);
            setSelectedRowsKeysSPCT(allIds);
        } else {
            setSelectedRowsKeysSPCT([]);
        }
    };

    const fetchDataTableSanPham = useCallback(async () => {
        try {
            const params = {
                ten: tenSanPhamSearch
            };
            const res = await axios.get(`http://localhost:8080/api/dot-giam-gia/list-san-pham`, {
                params: params
            });
            if (res && res.data) {
                const filteredData = res.data.filter((item) => item.trangthai === 1);

                // Thêm key vào dữ liệu đã lọc
                const dataWithKey = filteredData.map((item) => ({
                    ...item,
                    key: item.id,
                }));
                console.log("Dữ liệu API trả về:", res.data);
                setTableDataSanPham(dataWithKey);
            }
        } catch (error) {
            console.error("Failed to fetch data", error);
            swal("Lỗi!", "Không thể lấy dữ liệu.", "error");
        }
    }, [tenSanPhamSearch]);

    useEffect(() => {
        fetchDataTableSanPham();
    }, [fetchDataTableSanPham]);

    const validate = () => {
        let check = 0
        const errors = {
            ten: '',
            giaTri: '',
            tgBatDau: '',
            tgKetThuc: '',
        }

        const minBirthYear = 1900

        if (updateKhuyenMai.ten.trim() === '') {
            errors.ten = 'Vui lòng nhập tên đợt giảm giá'
        } else if (!isNaN(updateKhuyenMai.ten)) {
            errors.ten = 'Tên đợt giảm giá phải là chữ'
        } else if (khuyenMaiTen.includes(updateKhuyenMai.ten)) {
            errors.ten = 'Không được trùng tên đợt giảm giá'
        } else if (updateKhuyenMai.ten.length > 50) {
            errors.ten = 'Tên không được dài hơn 50 ký tự'
        } else if (updateKhuyenMai.ten.length < 5) {
            errors.ten = 'Tên không được bé hơn 5 ký tự'
        } else if (updateKhuyenMai.ten != updateKhuyenMai.ten.trim()) {
            errors.ten = 'Ten không được chứa khoảng trắng thừa'
        }

        if (updateKhuyenMai.giaTri === '') {
            errors.giaTri = 'Vui lòng nhập giá trị'
        } else if (!Number.isInteger(Number(updateKhuyenMai.giaTri))) {
            errors.giaTri = 'Giá trị phải là số nguyên'
        } else if (Number(updateKhuyenMai.giaTri) <= 0 || Number(updateKhuyenMai.giaTri) > 100) {
            errors.giaTri = 'Giá trị phải lớn hơn 0% và nhỏ hơn 100%'
        }

        const minDate = new Date(minBirthYear, 0, 1); // Ngày bắt đầu từ 01-01-minBirthYear

        if (updateKhuyenMai.tgBatDau === '') {
            errors.tgBatDau = 'Vui lòng nhập thời gian bắt đầu'
        } else {
            const tgBatDau = new Date(updateKhuyenMai.tgBatDau);
            if (tgBatDau < minDate) {
                errors.tgBatDau = 'Thời gian bắt đầu không hợp lệ'
            }
        }


        if (updateKhuyenMai.tgKetThuc === '') {
            errors.tgKetThuc = 'Vui lòng nhập thời gian kết thúc'
        } else {
            const tgBatDau = new Date(updateKhuyenMai.tgBatDau)
            const tgKetThuc = new Date(updateKhuyenMai.tgKetThuc)

            if (tgKetThuc < minDate) {
                errors.tgKetThuc = 'Thời gian kết thúc không hợp lệ'
            }

            if (tgBatDau > tgKetThuc) {
                errors.tgBatDau = 'Thời gian bắt đầu không được lớn hơn ngày kết thúc'
            }
        }

        for (const key in errors) {
            if (errors[key]) {
                check++
            }
        }

        setErrorTen(errors.ten)
        setErrorGiaTri(errors.giaTri)
        setErrorTgBatDau(errors.tgBatDau)
        setErrorTgKetThuc(errors.tgKetThuc)

        return check
    }

    const onSubmit = () => {
        const check = validate();

        if (check < 1) {
            const title = 'Xác nhận cập nhật đợt giảm giá?';
            console.log('Selected Rows:', selectedRowsKeysSPCT); // ✅ Đúng biến

            swal({
                title: "Xác nhận cập nhật đợt giảm giá?",
                text: "Bạn có chắc chắn muốn cập nhật đợt giảm giá không?",
                icon: "warning", // ✅ icon hợp lệ
                buttons: {
                    cancel: "Hủy",
                    confirm: "Xác nhận",
                },
            }).then((willConfirm) => {
                if (willConfirm) {
                    const dataToUpdate = {
                        ...updateKhuyenMai,
                        loai: selectedRowsKeysSPCT.length === 0 ? false : true,
                        idProductDetail: selectedRowsKeysSPCT
                    };

                    axios.put(`http://localhost:8080/api/dot-giam-gia/update/${id}`, dataToUpdate, {
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    })
                        .then(() => {
                            swal("Thành công!", "Cập nhật đợt giảm giá thành công!", "success");
                            navigate('/admin/giam-gia/dot-giam-gia');
                        })
                        .catch((error) => {
                            console.error("Lỗi cập nhật:", error);
                            swal("Thất bại!", "Cập nhật đợt giảm giá thất bại!", "error");
                        });
                }
            });
        } else {
            swal("Thất bại!", "Không thể thêm đợt giảm giá", "error");
        }
    };

    const loadThuongHieu = () => {
        axios.get(`http://localhost:8080/api/thuong-hieu`)
            .then((response) => {
                setListThuongHieu(response.data)
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    }

    const loadChatLieu = () => {
        axios.get(`http://localhost:8080/api/chat-lieu`)
            .then((response) => {
                setListChatLieu(response.data)
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    }

    const loadMauSac = () => {
        axios.get(`http://localhost:8080/api/mau-sac`)
            .then((response) => {
                setListMauSac(response.data)
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    }

    const loadTrongLuong = () => {
        axios.get(`http://localhost:8080/api/trong-luong`)
            .then((response) => {
                setListTrongLuong(response.data)
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    }

    const loadDiemCanBang = () => {
        axios.get(`http://localhost:8080/api/diem-can-bang`)
            .then((response) => {
                setListDiemCanBang(response.data)
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    }

    const loadDoCung = () => {
        axios.get(`http://localhost:8080/api/do-cung`)
            .then((response) => {
                setListDoCung(response.data)
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    }

    useEffect(() => {
        loadThuongHieu();
        loadChatLieu();
        loadMauSac();
        loadDiemCanBang();
        loadDoCung();
        loadTrongLuong();
    }, [])

    return (
        <div>
            <div className="font-bold text-sm">
                <span
                    className="cursor-pointer"
                    onClick={handleNavigateToDotGiamGia}
                >
                    Đợt giảm giá
                </span>
                <span className="text-gray-400 ml-2">/ Chi tiết đợt giảm giá</span>
            </div>
            <div className="bg-white p-4 rounded-md shadow-lg">
                <div className="flex justify-end mb-4">
                    <input
                        type="text"
                        placeholder="Tìm tên sản phẩm"
                        className="p-2 border rounded w-1/2"
                        onChange={(e) => setTenSanPhamSearch(e.target.value)}
                    />
                </div>
                <div className="flex">

                    <div className="w-1/2 pr-4">
                        <div>
                            <label className="block text-gray-600 mb-1">
                                Tên đợt giảm giá
                            </label>
                            <input
                                type="text"
                                name="ten"
                                id="discount-name"
                                placeholder="Tên đợt giảm giá"
                                className="w-full p-2 border rounded mb-4"
                                value={updateKhuyenMai?.ten}
                                onChange={(e) => {
                                    setUpdateKhuyenMai({ ...updateKhuyenMai, ten: e.target.value })
                                    setErrorTen('')
                                }}  // Bỏ arrow function
                                error={errorTen ? 'true' : undefined}
                            />
                            <span className='text-red-600 text-xs italic'>{errorTen}</span>
                        </div>

                        <div>
                            <label className="block text-gray-600 mb-1">
                                Giá trị (%)
                            </label>
                            <input
                                type="number"
                                name="giaTri"
                                id="discount-value"
                                placeholder="Giá trị"
                                className="w-full p-2 border rounded mb-4"
                                value={updateKhuyenMai?.giaTri}
                                onChange={(e) => {
                                    setUpdateKhuyenMai({ ...updateKhuyenMai, giaTri: e.target.value })
                                    setErrorGiaTri('')
                                }}
                                error={errorGiaTri ? 'true' : undefined}
                            />
                            <span className='text-red-600 text-xs italic'>{errorGiaTri}</span>
                        </div>

                        <div>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <label className="block text-gray-600 mb-1">Từ ngày</label>
                                <DateTimePicker
                                    format={'DD-MM-YYYY HH:mm:ss'}

                                    slotProps={{
                                        textField: {
                                            size: 'small',
                                            className: 'w-full'
                                        },
                                        actionBar: {
                                            actions: ['clear', 'today']
                                        }
                                    }}
                                    value={dayjs(updateKhuyenMai.tgBatDau, 'YYYY-MM-DDTHH:mm:ss')}
                                    onChange={(e) => {
                                        setUpdateKhuyenMai({
                                            ...updateKhuyenMai,
                                            tgBatDau: dayjs(e).format('YYYY-MM-DDTHH:mm:ss')
                                        })
                                        setErrorTgBatDau('')
                                    }}
                                />
                            </LocalizationProvider>
                            <span className='text-red-600 text-xs italic'>{errorTgBatDau}</span>
                        </div>

                        <div className='mt-4'>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <label className="block text-gray-600 mb-1">Đến ngày</label>
                                <DateTimePicker
                                    format={'DD-MM-YYYY HH:mm:ss'}

                                    slotProps={{
                                        textField: {
                                            size: 'small',
                                            className: 'w-full'
                                        },
                                        actionBar: {
                                            actions: ['clear', 'today']
                                        }
                                    }}
                                    value={dayjs(updateKhuyenMai.tgKetThuc, 'YYYY-MM-DDTHH:mm:ss')}
                                    onChange={(e) => {
                                        setUpdateKhuyenMai({
                                            ...updateKhuyenMai,
                                            tgKetThuc: dayjs(e).format('YYYY-MM-DDTHH:mm:ss')
                                        })
                                        setErrorTgKetThuc('')
                                    }}
                                />
                            </LocalizationProvider>
                            <span className='text-red-600 text-xs italic'>{errorTgKetThuc}</span>
                        </div>

                        {selectedRowsKeysSPCT.length > 0 ? (
                            '') : (
                            <button
                                onClick={() => onSubmit()}
                                className="border border-amber-400 hover:bg-gray-100 text-amber-400 py-2 px-4 mt-4 rounded-md flex items-center">
                                Cập nhật
                            </button>
                        )}
                    </div>

                    {/* Product Table Section */}
                    <div className="w-1/2 pr-4 overflow-y-auto max-h-[300px] border border-gray-200 rounded">
                        <table className="min-w-full border border-gray-200 sticky-header">
                            <thead>
                                <tr className="bg-gray-100 text-gray-700">
                                    <th className="py-2 px-4 border-b text-center">
                                        <input
                                            type="checkbox"
                                            checked={selectedRowKeys.length === tableDataSanPham.length}
                                            onChange={handleSelectAllSanPham}
                                        />
                                    </th>
                                    <th className="py-2 px-4 border-b text-center">STT</th>
                                    <th className="py-2 px-4 border-b text-center">Tên sản phẩm</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tableDataSanPham.map((sanPham, index) => (
                                    <tr key={sanPham.id} className="text-left border-b">
                                        <td className="py-2 px-4 border-b text-center">
                                            <input
                                                type="checkbox"
                                                checked={selectedRowKeys.includes(sanPham.id)}
                                                onChange={(event) => handleCheckboxChangeSanPham(event, sanPham)}
                                                className="align-middle"
                                            />
                                        </td>
                                        <td className="py-2 px-4 border-b text-center">{index + 1}</td>
                                        <td className="py-2 px-4 border-b text-center">{sanPham.ten}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            {selectedRowsKeysSPCT.length > 0 && (
                <div className="bg-white p-4 mt-4 rounded-md shadow-lg mb-4">
                    <div className="flex justify-between items-center">
                        <h1 className="text-2xl">CHI TIẾT SẢN PHẨM</h1>
                        <button
                            onClick={() => onSubmit()}
                            className="border border-amber-400 hover:bg-gray-100 text-amber-400 py-2 px-4 mt-4 rounded-md flex items-center">
                            Cập nhật
                        </button>
                    </div>

                    <div className="flex mb-4">
                        <input
                            type="text"
                            placeholder="Tìm tên sản phẩm chi tiết"
                            className="p-2 border rounded w-1/2"
                        />
                    </div>

                    <div className="flex overflow-x-auto gap-2 pb-4 items-center">
                        <div className="flex items-center space-x-1 shrink-0">
                            <label className="text-sm text-gray-700 whitespace-nowrap">Thương hiệu:</label>
                            <select
                                className="w-32 text-sm border rounded px-2 py-1"
                            >
                                <option value="">Thương hiệu</option>
                                {listThuongHieu.map((th) => (
                                    <option key={th.id} value={th.id}>
                                        {th.ten}
                                    </option>
                                ))}

                            </select>
                        </div>

                        <div className="flex items-center space-x-1 shrink-0">
                            <label className="text-sm text-gray-700 whitespace-nowrap">Màu sắc:</label>
                            <select
                                className="w-32 text-sm border rounded px-2 py-1"
                            >
                                <option value="">Màu sắc</option>
                                {listMauSac.map((ms) => (
                                    <option key={ms.id} value={ms.id}>
                                        {ms.ten}
                                    </option>
                                ))}


                            </select>
                        </div>

                        <div className="flex items-center space-x-1 shrink-0">
                            <label className="text-sm text-gray-700 whitespace-nowrap">Chất liệu:</label>
                            <select
                                className="w-32 text-sm border rounded px-2 py-1"
                            >
                                <option value="">Chất liệu</option>
                                {listChatLieu.map((cl) => (
                                    <option key={cl.id} value={cl.id}>
                                        {cl.ten}
                                    </option>
                                ))}

                            </select>
                        </div>

                        <div className="flex items-center space-x-1 shrink-0">
                            <label className="text-sm text-gray-700 whitespace-nowrap">Trọng lượng:</label>
                            <select
                                className="w-32 text-sm border rounded px-2 py-1"
                            >
                                <option value="">Trọng lượng</option>
                                {listTrongLuong.map((tl) => (
                                    <option key={tl.id} value={tl.id}>
                                        {tl.ten}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-center space-x-1 shrink-0">
                            <label className="text-sm text-gray-700 whitespace-nowrap">Điểm cân bằng:</label>
                            <select
                                className="w-32 text-sm border rounded px-2 py-1"
                            >
                                <option value="">Điểm cân bằng</option>
                                {listDiemCanBang.map((dcb) => (
                                    <option key={dcb.id} value={dcb.id}>
                                        {dcb.ten}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-center space-x-1 shrink-0">
                            <label className="text-sm text-gray-700 whitespace-nowrap">Độ cứng:</label>
                            <select
                                className="w-32 text-sm border rounded px-2 py-1"
                            >
                                <option value="">Độ cứng</option>
                                {listDoCung.map((dc) => (
                                    <option key={dc.id} value={dc.id}>
                                        {dc.ten}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="overflow-y-auto max-h-[300px] border border-gray-200 rounded">
                        <table className="min-w-full border border-gray-200 sticky-header">
                            <thead>
                                <tr className="bg-gray-100 text-gray-700">
                                    <th className="py-2 px-4 border-b text-center">
                                        <input
                                            type="checkbox"
                                            checked={selectedRowsKeysSPCT.length === tableDataSPCT.length}
                                            onChange={handleSelectAllSPCT}
                                            className="align-middle"
                                        />
                                    </th>
                                    <th className="py-2 px-4 border-b text-center">STT</th>
                                    <th className="py-2 px-4 border-b text-center">Tên sản phẩm</th>
                                    <th className="py-2 px-4 border-b text-center">Thương hiệu</th>
                                    <th className="py-2 px-4 border-b text-center">Màu sắc</th>
                                    <th className="py-2 px-4 border-b text-center">Chất liệu</th>
                                    <th className="py-2 px-4 border-b text-center">Trọng lượng</th>
                                    <th className="py-2 px-4 border-b text-center">Điểm cân bằng</th>
                                    <th className="py-2 px-4 border-b text-center">Độ cứng</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tableDataSPCT.map((spct, index) => (
                                    <tr key={spct.id} className="text-center border-b">
                                        <td className="py-2 px-4 border-b text-center">
                                            <input
                                                type="checkbox"
                                                checked={selectedRowsKeysSPCT.includes(spct.id)}
                                                onChange={(event) => handleCheckboxChangeSPCT(event, spct.id)}
                                                className="align-middle"
                                            />
                                        </td>
                                        <td className="py-2 px-4 border-b text-center">{index + 1}</td>
                                        <td className="py-2 px-4 border-b text-center">{spct.tenSanPham}</td>
                                        <td className="py-2 px-4 border-b text-center">{spct.tenThuongHieu}</td>
                                        <td className="py-2 px-4 border-b text-center">{spct.tenMauSac}</td>
                                        <td className="py-2 px-4 border-b text-center">{spct.tenChatLieu}</td>
                                        <td className="py-2 px-4 border-b text-center">{spct.tenTrongLuong}</td>
                                        <td className="py-2 px-4 border-b text-center">{spct.tenDiemCanBang}</td>
                                        <td className="py-2 px-4 border-b text-center">{spct.tenDoCung}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )
            }
        </div>
    );

};
export default UpdateDotGiamGia