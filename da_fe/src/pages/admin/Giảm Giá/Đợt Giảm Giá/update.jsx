import React, { useEffect, useCallback, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import swal from 'sweetalert';
import dayjs from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import qs from 'qs';

function UpdateDotGiamGia() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [tenSanPhamSearch, setTenSanPhamSearch] = useState('');
    const [tableDataSanPham, setTableDataSanPham] = useState([]);
    const [tableDataSPCT, setTableDataSPCT] = useState([]);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [selectedRowsKeysSPCT, setSelectedRowsKeysSPCT] = useState([]);

    // Filter states for product details
    const [filterSPCT, setFilterSPCT] = useState({
        tenSearch: '',
        idThuongHieuSearch: '',
        idChatLieuSearch: '',
        idMauSacSearch: '',
        idTrongLuongSearch: '',
        idDiemCanBangSearch: '',
        idDoCungSearch: ''
    });

    const [errorTen, setErrorTen] = useState('');
    const [errorGiaTri, setErrorGiaTri] = useState('');
    const [errorTgBatDau, setErrorTgBatDau] = useState('');
    const [errorTgKetThuc, setErrorTgKetThuc] = useState('');
    const [getTenKhuyenMai, setGetTenKhuyenMai] = useState([]);

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
        idProductDetail: selectedRowsKeysSPCT,
    });

    const handleNavigateToDotGiamGia = () => {
        navigate('/admin/giam-gia/dot-giam-gia');
    };

    const onSelectChange = (newSelectedRowKeys) => {
        console.log('selectedRowKeys changed: ', newSelectedRowKeys);
        setSelectedRowKeys(newSelectedRowKeys);
    };

    const getAllTenKhuyenMai = () => {
        axios
            .get(`http://localhost:8080/api/dot-giam-gia/list-ten-khuyen-mai`)
            .then((response) => {
                setGetTenKhuyenMai(response.data);
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    };

    const khuyenMaiTen = getTenKhuyenMai.map((khuyenMai) => khuyenMai.ten);

    const fetchData = async () => {
        try {
            const response = await axios.get(`http://localhost:8080/api/dot-giam-gia/detail/${id}`);
            const idSPCTRes = await axios.get(
                `http://localhost:8080/api/dot-giam-gia/get-id-san-pham-chi-tiet-by-id-khuyen-mai/${id}`,
            );
            const idSpcts = idSPCTRes.data; // danh sách idSanPhamCt

            // Gọi API lấy thông tin SPCT theo ID
            const allProductDetails = await Promise.all(
                idSpcts.map(async (id) => {
                    const res = await axios.get(`http://localhost:8080/api/san-pham-ct/${id}`);
                    return res.data;
                }),
            );

            // Lấy danh sách id sản phẩm cha
            const idSp = [...new Set(allProductDetails.map((item) => item.sanPham.id))];
            console.log('id sp', idSp);

            // Gọi API lấy toàn bộ SPCT theo từng id sản phẩm
            const allProductDetailsSP = await Promise.all(
                idSp.map(async (id) => {
                    const res = await axios.get(`http://localhost:8080/api/dot-giam-gia/san-pham-ct/san-pham/${id}`);
                    return res.data;
                }),
            );

            // Flatten mảng 2 chiều
            const flatten = allProductDetailsSP.flat().map((i) => ({ ...i, key: i.id }));

            // Set vào bảng
            setTableDataSPCT(flatten);
            setSelectedRowKeys(idSp); // tích bảng sản phẩm
            setSelectedRowsKeysSPCT(idSpcts); // tích bảng SPCT

            setUpdateKhuyenMai(response.data);
        } catch (error) {
            console.error('Error fetching voucher details:', error);
        }
    };

    useEffect(() => {
        getAllTenKhuyenMai();
        fetchData(id);
    }, [id]);

    const handleCheckboxChangeSanPham = async (e, sanPham) => {
        const isChecked = e.target.checked;
        let newSelectedKeys = [...selectedRowKeys];

        if (isChecked) {
            newSelectedKeys.push(sanPham.id);
        } else {
            newSelectedKeys = newSelectedKeys.filter((id) => id !== sanPham.id);
        }

        setSelectedRowKeys(newSelectedKeys);

        // The fetchDataTableSPCT will be called automatically via useEffect
    };

    const handleSelectAllSanPham = async (e) => {
        const isChecked = e.target.checked;
        if (isChecked) {
            const allIds = tableDataSanPham.map((sp) => sp.id);
            setSelectedRowKeys(allIds);
        } else {
            setSelectedRowKeys([]);
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
            const allIds = tableDataSPCT.map((spct) => spct.id);
            setSelectedRowsKeysSPCT(allIds);
        } else {
            setSelectedRowsKeysSPCT([]);
        }
    };

    // Filter handlers for SPCT
    const handleFilterChange = (filterType, value) => {
        console.log('Filter change:', filterType, value);
        setFilterSPCT(prev => ({
            ...prev,
            [filterType]: value
        }));
    };

    const handleSearchChange = (value) => {
        setFilterSPCT(prev => ({
            ...prev,
            tenSearch: value
        }));
    };

    const clearAllFilters = () => {
        setFilterSPCT({
            tenSearch: '',
            idThuongHieuSearch: '',
            idChatLieuSearch: '',
            idMauSacSearch: '',
            idTrongLuongSearch: '',
            idDiemCanBangSearch: '',
            idDoCungSearch: ''
        });
    };

    // Fetch filtered product details
    const fetchDataTableSPCT = useCallback(async () => {
        if (selectedRowKeys.length === 0) {
            setTableDataSPCT([]);
            return;
        }

        try {
            const params = {
                id: selectedRowKeys,
                tenSearch: filterSPCT.tenSearch || '',
                idThuongHieuSearch: filterSPCT.idThuongHieuSearch || '',
                idChatLieuSearch: filterSPCT.idChatLieuSearch || '',
                idMauSacSearch: filterSPCT.idMauSacSearch || '',
                idTrongLuongSearch: filterSPCT.idTrongLuongSearch || '',
                idDiemCanBangSearch: filterSPCT.idDiemCanBangSearch || '',
                idDoCungSearch: filterSPCT.idDoCungSearch || '',
                currentPage: 0,
                size: 1000 // Lấy tất cả để không bị giới hạn pagination
            };

            const res = await axios.get("http://localhost:8080/api/dot-giam-gia/getSanPhamCTBySanPham", {
                params,
                paramsSerializer: params => qs.stringify(params, { indices: false })
            });
            
            console.log('API Response:', res.data);
            
            // API trả về pagination object với content array
            const data = res.data.content || res.data;
            const dataWithKey = Array.isArray(data) ? data.map(i => ({ ...i, key: i.id })) : [];
            console.log('Processed data:', dataWithKey);
            setTableDataSPCT(dataWithKey);
        } catch (error) {
            console.error("Lỗi lấy sản phẩm chi tiết", error);
            swal("Lỗi!", "Không thể lấy dữ liệu sản phẩm chi tiết.", "error");
        }
    }, [selectedRowKeys, filterSPCT]);

    const fetchDataTableSanPham = useCallback(async () => {
        try {
            const params = {
                ten: tenSanPhamSearch,
            };
            const res = await axios.get(`http://localhost:8080/api/dot-giam-gia/list-san-pham`, {
                params: params,
            });
            if (res && res.data) {
                const filteredData = res.data.filter((item) => item.trangThai === 1);

                // Thêm key vào dữ liệu đã lọc
                const dataWithKey = filteredData.map((item) => ({
                    ...item,
                    key: item.id,
                }));
                console.log('Dữ liệu API trả về:', res.data);
                setTableDataSanPham(dataWithKey);
            }
        } catch (error) {
            console.error('Failed to fetch data', error);
            swal('Lỗi!', 'Không thể lấy dữ liệu.', 'error');
        }
    }, [tenSanPhamSearch]);

    useEffect(() => {
        fetchDataTableSanPham();
    }, [fetchDataTableSanPham]);

    // Effect to fetch SPCT when filters change
    useEffect(() => {
        fetchDataTableSPCT();
    }, [fetchDataTableSPCT]);

    const validate = () => {
        let check = 0;
        const errors = {
            ten: '',
            giaTri: '',
            tgBatDau: '',
            tgKetThuc: '',
        };

        const minBirthYear = 1900;

        if (updateKhuyenMai.ten.trim() === '') {
            errors.ten = 'Vui lòng nhập tên đợt giảm giá';
        } else if (!isNaN(updateKhuyenMai.ten)) {
            errors.ten = 'Tên đợt giảm giá phải là chữ';
        } else if (khuyenMaiTen.includes(updateKhuyenMai.ten)) {
            errors.ten = 'Không được trùng tên đợt giảm giá';
        } else if (updateKhuyenMai.ten.length > 50) {
            errors.ten = 'Tên không được dài hơn 50 ký tự';
        } else if (updateKhuyenMai.ten.length < 5) {
            errors.ten = 'Tên không được bé hơn 5 ký tự';
        } else if (updateKhuyenMai.ten != updateKhuyenMai.ten.trim()) {
            errors.ten = 'Ten không được chứa khoảng trắng thừa';
        }

        if (updateKhuyenMai.giaTri === '') {
            errors.giaTri = 'Vui lòng nhập giá trị';
        } else if (!Number.isInteger(Number(updateKhuyenMai.giaTri))) {
            errors.giaTri = 'Giá trị phải là số nguyên';
        } else if (Number(updateKhuyenMai.giaTri) <= 0 || Number(updateKhuyenMai.giaTri) > 100) {
            errors.giaTri = 'Giá trị phải lớn hơn 0% và nhỏ hơn 100%';
        }

        const minDate = new Date(minBirthYear, 0, 1); // Ngày bắt đầu từ 01-01-minBirthYear

        if (updateKhuyenMai.tgBatDau === '') {
            errors.tgBatDau = 'Vui lòng nhập thời gian bắt đầu';
        } else {
            const tgBatDau = new Date(updateKhuyenMai.tgBatDau);
            if (tgBatDau < minDate) {
                errors.tgBatDau = 'Thời gian bắt đầu không hợp lệ';
            }
        }

        if (updateKhuyenMai.tgKetThuc === '') {
            errors.tgKetThuc = 'Vui lòng nhập thời gian kết thúc';
        } else {
            const tgBatDau = new Date(updateKhuyenMai.tgBatDau);
            const tgKetThuc = new Date(updateKhuyenMai.tgKetThuc);

            if (tgKetThuc < minDate) {
                errors.tgKetThuc = 'Thời gian kết thúc không hợp lệ';
            }

            if (tgBatDau > tgKetThuc) {
                errors.tgBatDau = 'Thời gian bắt đầu không được lớn hơn ngày kết thúc';
            }
        }

        for (const key in errors) {
            if (errors[key]) {
                check++;
            }
        }

        setErrorTen(errors.ten);
        setErrorGiaTri(errors.giaTri);
        setErrorTgBatDau(errors.tgBatDau);
        setErrorTgKetThuc(errors.tgKetThuc);

        return check;
    };

    // Kiểm tra trùng lặp khuyến mãi
    const checkPromotionOverlap = async (dataToUpdate) => {
        try {
            const response = await axios.post('http://localhost:8080/api/dot-giam-gia/check-overlap', {
                idSanPhamCT: dataToUpdate.idProductDetail,
                tgBatDau: dataToUpdate.tgBatDau,
                tgKetThuc: dataToUpdate.tgKetThuc,
                currentPromotionId: parseInt(id) // Thêm ID của đợt giảm giá hiện tại đang cập nhật
            });
            
            if (response.data.hasOverlap) {
                swal("Cảnh báo!", response.data.overlapDetails, "warning");
                return false;
            }
            return true;
        } catch (error) {
            console.error("Lỗi kiểm tra trùng lặp:", error);
            return true; // Nếu lỗi thì vẫn cho phép tiếp tục
        }
    };

    const onSubmit = async () => {
        const check = validate();

        if (check < 1) {
            const dataToUpdate = {
                ...updateKhuyenMai,
                loai: selectedRowsKeysSPCT.length === 0 ? false : true,
                idProductDetail: selectedRowsKeysSPCT,
            };

            // Kiểm tra trùng lặp trước khi hiển thị xác nhận
            const canProceed = await checkPromotionOverlap(dataToUpdate);
            if (!canProceed) {
                return;
            }

            console.log('Selected Rows:', selectedRowsKeysSPCT); // ✅ Đúng biến

            swal({
                title: 'Xác nhận cập nhật đợt giảm giá?',
                text: 'Bạn có chắc chắn muốn cập nhật đợt giảm giá không?',
                icon: 'warning', // ✅ icon hợp lệ
                buttons: {
                    cancel: 'Hủy',
                    confirm: 'Xác nhận',
                },
            }).then((willConfirm) => {
                if (willConfirm) {
                    axios
                        .put(`http://localhost:8080/api/dot-giam-gia/update/${id}`, dataToUpdate, {
                            headers: {
                                'Content-Type': 'application/json',
                            },
                        })
                        .then(() => {
                            swal('Thành công!', 'Cập nhật đợt giảm giá thành công!', 'success');
                            navigate('/admin/giam-gia/dot-giam-gia');
                        })
                        .catch((error) => {
                            console.error('Lỗi cập nhật:', error);
                            const errorMessage = error.response?.data?.message || error.response?.data || error.message || "Cập nhật đợt giảm giá thất bại!";
                            swal('Thất bại!', errorMessage, 'error');
                        });
                }
            });
        } else {
            swal('Thất bại!', 'Không thể thêm đợt giảm giá', 'error');
        }
    };

    const loadThuongHieu = () => {
        axios
            .get(`http://localhost:8080/api/thuong-hieu`)
            .then((response) => {
                setListThuongHieu(response.data);
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    };

    const loadChatLieu = () => {
        axios
            .get(`http://localhost:8080/api/chat-lieu`)
            .then((response) => {
                setListChatLieu(response.data);
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    };

    const loadMauSac = () => {
        axios
            .get(`http://localhost:8080/api/mau-sac`)
            .then((response) => {
                setListMauSac(response.data);
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    };

    const loadTrongLuong = () => {
        axios
            .get(`http://localhost:8080/api/trong-luong`)
            .then((response) => {
                setListTrongLuong(response.data);
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    };

    const loadDiemCanBang = () => {
        axios
            .get(`http://localhost:8080/api/diem-can-bang`)
            .then((response) => {
                setListDiemCanBang(response.data);
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    };

    const loadDoCung = () => {
        axios
            .get(`http://localhost:8080/api/do-cung`)
            .then((response) => {
                setListDoCung(response.data);
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    };

    useEffect(() => {
        loadThuongHieu();
        loadChatLieu();
        loadMauSac();
        loadDiemCanBang();
        loadDoCung();
        loadTrongLuong();
    }, []);

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
                                    onClick={handleNavigateToDotGiamGia}
                                >
                    Đợt giảm giá
                </span>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                                <span className="text-gray-900 font-medium">Cập nhật đợt giảm giá</span>
                            </nav>
                            <h1 className="text-2xl font-bold text-gray-900">Cập nhật đợt giảm giá</h1>
                            <p className="text-sm text-gray-600 mt-1">Chỉnh sửa thông tin và sản phẩm cho đợt giảm giá</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {/* Search Section */}
                    <div className="p-6 border-b border-gray-100">
                        <div className="flex justify-end">
                            <div className="relative w-1/2">
                    <input
                        type="text"
                                    placeholder="Tìm kiếm sản phẩm theo tên..."
                                    className="w-full pl-4 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 text-gray-700 placeholder-gray-400"
                        onChange={(e) => setTenSanPhamSearch(e.target.value)}
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
                </div>
                    {/* Main Content */}
                    <div className="p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Form Section */}
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin đợt giảm giá</h3>
                                    
                                    <div className="space-y-4">
                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Tên đợt giảm giá <span className="text-red-500">*</span>
                                            </label>
                            <input
                                type="text"
                                name="ten"
                                                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 ${
                                                    errorTen ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                                }`}
                                                placeholder="Nhập tên đợt giảm giá"
                                value={updateKhuyenMai?.ten}
                                onChange={(e) => {
                                    setUpdateKhuyenMai({ ...updateKhuyenMai, ten: e.target.value });
                                    setErrorTen('');
                                                }}
                                            />
                                            {errorTen && (
                                                <p className="text-red-600 text-sm flex items-center mt-1">
                                                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                    </svg>
                                                    {errorTen}
                                                </p>
                                            )}
                        </div>

                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Giá trị (%) <span className="text-red-500">*</span>
                                            </label>
                            <input
                                type="number"
                                name="giaTri"
                                                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 ${
                                                    errorGiaTri ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                                }`}
                                                placeholder="Nhập giá trị giảm giá"
                                value={updateKhuyenMai?.giaTri}
                                onChange={(e) => {
                                    setUpdateKhuyenMai({ ...updateKhuyenMai, giaTri: e.target.value });
                                    setErrorGiaTri('');
                                }}
                                            />
                                            {errorGiaTri && (
                                                <p className="text-red-600 text-sm flex items-center mt-1">
                                                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                    </svg>
                                                    {errorGiaTri}
                                                </p>
                                            )}
                        </div>

                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Từ ngày <span className="text-red-500">*</span>
                                            </label>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DateTimePicker
                                                    format={'DD-MM-YYYY HH:mm'}
                                    slotProps={{
                                        textField: {
                                            size: 'small',
                                                            className: `w-full ${errorTgBatDau ? 'error' : ''}`,
                                                            sx: {
                                                                '& .MuiOutlinedInput-root': {
                                                                    borderRadius: '8px',
                                                                    fontSize: '14px',
                                                                }
                                                            }
                                                        },
                                                        actionBar: { actions: ['clear', 'today'] }
                                    }}
                                    value={dayjs(updateKhuyenMai.tgBatDau, 'YYYY-MM-DDTHH:mm:ss')}
                                    onChange={(e) => {
                                        setUpdateKhuyenMai({
                                            ...updateKhuyenMai,
                                            tgBatDau: dayjs(e).format('YYYY-MM-DDTHH:mm:ss'),
                                        });
                                        setErrorTgBatDau('');
                                    }}
                                />
                            </LocalizationProvider>
                                            {errorTgBatDau && (
                                                <p className="text-red-600 text-sm flex items-center mt-1">
                                                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                    </svg>
                                                    {errorTgBatDau}
                                                </p>
                                            )}
                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Đến ngày <span className="text-red-500">*</span>
                                            </label>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DateTimePicker
                                                    format={'DD-MM-YYYY HH:mm'}
                                    slotProps={{
                                        textField: {
                                            size: 'small',
                                                            className: `w-full ${errorTgKetThuc ? 'error' : ''}`,
                                                            sx: {
                                                                '& .MuiOutlinedInput-root': {
                                                                    borderRadius: '8px',
                                                                    fontSize: '14px',
                                                                }
                                                            }
                                                        },
                                                        actionBar: { actions: ['clear', 'today'] }
                                    }}
                                    value={dayjs(updateKhuyenMai.tgKetThuc, 'YYYY-MM-DDTHH:mm:ss')}
                                    onChange={(e) => {
                                        setUpdateKhuyenMai({
                                            ...updateKhuyenMai,
                                            tgKetThuc: dayjs(e).format('YYYY-MM-DDTHH:mm:ss'),
                                        });
                                        setErrorTgKetThuc('');
                                    }}
                                />
                            </LocalizationProvider>
                                            {errorTgKetThuc && (
                                                <p className="text-red-600 text-sm flex items-center mt-1">
                                                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                    </svg>
                                                    {errorTgKetThuc}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Product Table Section */}
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Chọn sản phẩm</h3>
                                    
                                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                                        <div className="overflow-auto max-h-[400px]">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 sticky top-0 z-10">
                                                    <tr>
                                                        <th className="w-12 text-center">
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedRowKeys.length === tableDataSanPham.length && tableDataSanPham.length > 0}
                                                                onChange={handleSelectAllSanPham}
                                                                className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                                                            />
                                                        </th>
                                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                            STT
                                                        </th>
                                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                            Tên sản phẩm
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {tableDataSanPham.map((sanPham, index) => (
                                                        <tr key={sanPham.id} className="hover:bg-gray-50 transition-colors duration-150">
                                                            <td className="px-4 py-3 whitespace-nowrap text-center">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={selectedRowKeys.includes(sanPham.id)}
                                                                    onChange={(event) => handleCheckboxChangeSanPham(event, sanPham)}
                                                                    className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                                                                />
                                                            </td>
                                                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                                                {index + 1}
                                                            </td>
                                                            <td className="px-4 py-3 whitespace-nowrap">
                                                                <div className="text-sm font-medium text-gray-900 max-w-xs truncate" title={sanPham.ten}>
                                                                    {sanPham.ten}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                    {tableDataSanPham.length === 0 && (
                                                        <tr>
                                                            <td colSpan="3" className="px-4 py-8 text-center">
                                                                <div className="flex flex-col items-center">
                                                                    <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                                                    </svg>
                                                                    <p className="text-gray-500 text-sm">Không có sản phẩm nào</p>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                    </div>

            {selectedRowsKeysSPCT.length > 0 && (
                <div className="px-6 mt-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        {/* Header Section */}
                        <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-6 py-4 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Chi tiết sản phẩm</h2>
                                    <p className="text-sm text-gray-600 mt-1">Chọn các sản phẩm chi tiết để áp dụng giảm giá</p>
                                </div>
                                <button
                                    onClick={() => onSubmit()}
                                    className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center font-medium"
                                >
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    Cập nhật đợt giảm giá
                                </button>
                            </div>
                        </div>

                        {/* Search and Filter Section */}
                        <div className="p-6 border-b border-gray-100">
                            <div className="flex flex-col lg:flex-row gap-4">
                                {/* Search Input */}
                                <div className="flex-1">
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="Tìm kiếm sản phẩm chi tiết theo tên..."
                                            value={filterSPCT.tenSearch}
                                            onChange={(e) => handleSearchChange(e.target.value)}
                                            className="w-full pl-4 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 text-gray-700 placeholder-gray-400"
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
                            </div>

                            {/* Filter Section */}
                            <div className="mt-6">
                                <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                                            <svg className="w-5 h-5 mr-2 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
                                            </svg>
                                            Bộ lọc sản phẩm
                                        </h3>
                                        <button
                                            onClick={clearAllFilters}
                                            className="px-4 py-2 text-sm font-medium text-gray-600 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg transition-all duration-200 flex items-center shadow-sm hover:shadow-md"
                                        >
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                            Xóa bộ lọc
                                        </button>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                                        {/* Thương hiệu */}
                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-gray-700">
                                                Thương hiệu
                                            </label>
                                            <div className="relative">
                                                <select
                                                    value={filterSPCT.idThuongHieuSearch}
                                                    onChange={(e) => handleFilterChange('idThuongHieuSearch', e.target.value)}
                                                    className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-4 py-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                                                >
                                                    <option value="">Tất cả thương hiệu</option>
                                                    {listThuongHieu.map((th) => (
                                                        <option key={th.id} value={th.id}>
                                                            {th.ten}
                                                        </option>
                                                    ))}
                                                </select>
                                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Màu sắc */}
                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-gray-700">
                                                Màu sắc
                                            </label>
                                            <div className="relative">
                                                <select
                                                    value={filterSPCT.idMauSacSearch}
                                                    onChange={(e) => handleFilterChange('idMauSacSearch', e.target.value)}
                                                    className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-4 py-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                                                >
                                                    <option value="">Tất cả màu sắc</option>
                                                    {listMauSac.map((ms) => (
                                                        <option key={ms.id} value={ms.id}>
                                                            {ms.ten}
                                                        </option>
                                                    ))}
                                                </select>
                                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Chất liệu */}
                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-gray-700">
                                                Chất liệu
                                            </label>
                                            <div className="relative">
                                                <select
                                                    value={filterSPCT.idChatLieuSearch}
                                                    onChange={(e) => handleFilterChange('idChatLieuSearch', e.target.value)}
                                                    className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-4 py-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                                                >
                                                    <option value="">Tất cả chất liệu</option>
                                                    {listChatLieu.map((cl) => (
                                                        <option key={cl.id} value={cl.id}>
                                                            {cl.ten}
                                                        </option>
                                                    ))}
                                                </select>
                                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Trọng lượng */}
                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-gray-700">
                                                Trọng lượng
                                            </label>
                                            <div className="relative">
                                                <select
                                                    value={filterSPCT.idTrongLuongSearch}
                                                    onChange={(e) => handleFilterChange('idTrongLuongSearch', e.target.value)}
                                                    className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-4 py-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                                                >
                                                    <option value="">Tất cả trọng lượng</option>
                                                    {listTrongLuong.map((tl) => (
                                                        <option key={tl.id} value={tl.id}>
                                                            {tl.ten}
                                                        </option>
                                                    ))}
                                                </select>
                                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Điểm cân bằng */}
                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-gray-700">
                                                Điểm cân bằng
                                            </label>
                                            <div className="relative">
                                                <select
                                                    value={filterSPCT.idDiemCanBangSearch}
                                                    onChange={(e) => handleFilterChange('idDiemCanBangSearch', e.target.value)}
                                                    className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-4 py-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                                                >
                                                    <option value="">Tất cả điểm cân bằng</option>
                                                    {listDiemCanBang.map((dcb) => (
                                                        <option key={dcb.id} value={dcb.id}>
                                                            {dcb.ten}
                                                        </option>
                                                    ))}
                                                </select>
                                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Độ cứng */}
                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-gray-700">
                                                Độ cứng
                                            </label>
                                            <div className="relative">
                                                <select
                                                    value={filterSPCT.idDoCungSearch}
                                                    onChange={(e) => handleFilterChange('idDoCungSearch', e.target.value)}
                                                    className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-4 py-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                                                >
                                                    <option value="">Tất cả độ cứng</option>
                                                    {listDoCung.map((dc) => (
                                                        <option key={dc.id} value={dc.id}>
                                                            {dc.ten}
                                                        </option>
                                                    ))}
                                                </select>
                                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Table Section */}
                        <div className="p-6">
                            <div className="overflow-auto max-h-[500px]">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100 sticky top-0 z-10">
                                        <tr>
                                            <th className="w-12 text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedRowsKeysSPCT.length === tableDataSPCT.length && tableDataSPCT.length > 0}
                                                    onChange={handleSelectAllSPCT}
                                                    className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                                                />
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                STT
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Tên sản phẩm
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Thương hiệu
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Màu sắc
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Chất liệu
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Trọng lượng
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Điểm cân bằng
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Độ cứng
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {tableDataSPCT.map((spct, index) => (
                                            <tr key={spct.id} className="hover:bg-gray-50 transition-colors duration-150">
                                                <td className="px-4 py-3 whitespace-nowrap text-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedRowsKeysSPCT.includes(spct.id)}
                                                        onChange={(event) => handleCheckboxChangeSPCT(event, spct.id)}
                                                        className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                                                    />
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {index + 1}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900 max-w-xs truncate" title={spct.tenSanPham}>
                                                        {spct.tenSanPham}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                                    {spct.tenThuongHieu}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                                    {spct.tenMauSac}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                                    {spct.tenChatLieu}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                                    {spct.tenTrongLuong}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                                    {spct.tenDiemCanBang}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                                    {spct.tenDoCung}
                                                </td>
                                            </tr>
                                        ))}
                                        {tableDataSPCT.length === 0 && (
                                            <tr>
                                                <td colSpan="9" className="px-4 py-8 text-center">
                                                    <div className="flex flex-col items-center">
                                                        <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                        </svg>
                                                        <p className="text-gray-500 text-lg font-medium">Không có sản phẩm chi tiết</p>
                                                        <p className="text-gray-400 text-sm mt-1">Hãy chọn sản phẩm ở bảng trên để xem chi tiết</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
export default UpdateDotGiamGia;
