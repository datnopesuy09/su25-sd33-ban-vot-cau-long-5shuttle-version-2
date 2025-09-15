import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import swal from 'sweetalert';
import Swal from 'sweetalert2';

function EditCustomer() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);
    const [selectedProvince, setSelectedProvince] = useState('');
    const [selectedDistrict, setSelectedDistrict] = useState('');
    const [selectedWard, setSelectedWard] = useState('');
    const [previewImage, setPreviewImage] = useState(null);
    const [diaChi, setDiaChi] = useState([]);
    const [isAddingDiaChi, setIsAddingDiaChi] = useState(false);
    const [initPage, setInitPage] = useState(1);
    const [formData, setFormData] = useState({
        hoTen: '',
        sdt: '',
        email: '',
        gioiTinh: 0,
        ngaySinh: '',
        trangThai: 1,
        userType: 'CA_NHAN',
    });
    const [formErrors, setFormErrors] = useState({});
    const [addressErrors, setAddressErrors] = useState({});
    const [initialEmail, setInitialEmail] = useState('');
    const [isProvincesLoaded, setIsProvincesLoaded] = useState(false);

    const checkMail = async (email) => {
        try {
            const response = await axios.get(`http://localhost:8080/auth/check-mail?email=${email}`);
            return !!(response.data?.email === email);
        } catch (error) {
            console.error('Error checking email:', error);
            return false;
        }
    };

    const validateData = async (data) => {
        const errors = {};
        const currentDate = new Date();
        const minBirthYear = 1900;
        let check = 0;

        if (!data.hoTen.trim()) {
            errors.hoTen = '*Bạn chưa nhập họ tên';
            check++;
        } else if (data.hoTen.trim().length > 100) {
            errors.hoTen = '*Họ tên không dài quá 100 ký tự';
            check++;
        } else {
            errors.hoTen = '';
        }

        if (!data.email.trim()) {
            errors.email = '*Bạn chưa nhập địa chỉ email';
            check++;
        } else {
            const emailCheck = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            if (!emailCheck.test(data.email.trim())) {
                errors.email = '*Địa chỉ email không hợp lệ';
                check++;
            } else {
                const emailExists = await checkMail(data.email);
                if (emailExists && data.email !== initialEmail) {
                    errors.email = '*Email đã tồn tại trong hệ thống';
                    check++;
                }
            }
        }

        if (!data.sdt.trim()) {
            errors.sdt = '*Bạn chưa nhập số điện thoại';
            check++;
        } else {
            const phoneNumberRegex = /^(0[1-9][0-9]{8})$/;
            if (!phoneNumberRegex.test(data.sdt.trim())) {
                errors.sdt = '*Số điện thoại không hợp lệ';
                check++;
            } else {
                errors.sdt = '';
            }
        }

        if (!data.ngaySinh) {
            errors.ngaySinh = '*Bạn chưa nhập ngày sinh';
            check++;
        } else {
            const ngaySinh = new Date(data.ngaySinh);
            if (isNaN(ngaySinh.getTime())) {
                errors.ngaySinh = '*Ngày sinh không hợp lệ';
                check++;
            } else if (ngaySinh.getFullYear() < minBirthYear) {
                errors.ngaySinh = '*Năm sinh không hợp lệ';
                check++;
            } else if (ngaySinh > currentDate) {
                errors.ngaySinh = '*Ngày sinh không được lớn hơn ngày hiện tại';
                check++;
            }
        }

        if (data.gioiTinh === null) {
            errors.gioiTinh = '*Bạn chưa chọn giới tính';
            check++;
        } else {
            errors.gioiTinh = '';
        }

        if (!data.userType) {
            errors.userType = '*Bạn chưa chọn loại khách hàng';
            check++;
        } else {
            errors.userType = '';
        }

        return { errors, check };
    };

    const validateAddress = (address) => {
        const errors = {};
        let check = 0;

        if (!address.ten.trim()) {
            errors.ten = '*Bạn chưa nhập họ tên';
            check++;
        } else if (address.ten.length > 100) {
            errors.ten = '*Họ tên không dài quá 100 ký tự';
            check++;
        } else {
            const specialCharsRegex = /[!@#$%^&*(),.?":{}|<>]/;
            if (specialCharsRegex.test(address.ten)) {
                errors.ten = '*Họ tên không chứa ký tự đặc biệt';
                check++;
            } else {
                errors.ten = '';
            }
        }

        if (!address.sdt.trim()) {
            errors.sdt = '*Bạn chưa nhập số điện thoại';
            check++;
        } else {
            const phoneNumberRegex = /^(0[1-9][0-9]{8})$/;
            if (!phoneNumberRegex.test(address.sdt.trim())) {
                errors.sdt = '*Số điện thoại không hợp lệ';
                check++;
            } else {
                errors.sdt = '';
            }
        }

        if (!address.idTinh) {
            errors.idTinh = '*Bạn chưa chọn tỉnh/ thành phố';
            check++;
        }

        if (!address.idHuyen) {
            errors.idHuyen = '*Bạn chưa chọn quận/ huyện';
            check++;
        }

        if (!address.idXa) {
            errors.idXa = '*Bạn chưa chọn xã/ phường';
            check++;
        }

        if (!address.diaChiCuThe.trim()) {
            errors.diaChiCuThe = '*Bạn chưa nhập địa chỉ cụ thể';
            check++;
        } else if (address.diaChiCuThe.length > 255) {
            errors.diaChiCuThe = '*Địa chỉ cụ thể không dài quá 255 ký tự';
            check++;
        } else {
            errors.diaChiCuThe = '';
        }

        // Validate loai nếu cần (mặc định 0, nhưng cho update/add, có thể optional nếu BE không yêu cầu)
        if (address.loai === null || address.loai === undefined) {
            errors.loai = '*Loại địa chỉ không hợp lệ';
            check++;
        } else {
            errors.loai = '';
        }

        // isMacDinh optional, set mặc định nếu thiếu
        if (address.isMacDinh === null || address.isMacDinh === undefined) {
            address.isMacDinh = false;
        }
        errors.isMacDinh = '';

        return { errors, check };
    };

    const fetchProvinces = async () => {
        try {
            const response = await fetch('https://provinces.open-api.vn/api/');
            const data = await response.json();
            if (data) {
                setProvinces(data);
                setIsProvincesLoaded(true);
            } else {
                console.error('Dữ liệu không hợp lệ:', data);
            }
        } catch (error) {
            console.error('Lỗi tải tỉnh:', error);
            Swal.fire({
                icon: 'error',
                title: 'Lỗi!',
                text: 'Có lỗi xảy ra khi tải danh sách tỉnh/thành!',
            });
        }
    };

    useEffect(() => {
        fetchProvinces();
    }, []);

    const fetchDistricts = async (provinceId) => {
        if (!provinceId) {
            console.error('provinceId is required but not provided');
            return [];
        }

        try {
            const response = await fetch(`https://provinces.open-api.vn/api/p/${provinceId}?depth=2`);
            const data = await response.json();
            if (data && data.districts) {
                console.log(`Districts for province ${provinceId}:`, data.districts);
                setDistricts(data.districts);
                return data.districts;
            } else {
                console.error('Invalid response districts data: ', data);
                setDistricts([]);
                return [];
            }
        } catch (error) {
            console.error('Error fetching districts:', error);
            return [];
        }
    };

    const fetchWards = async (districtId) => {
        if (!districtId) {
            console.error('districtId is required but not provided');
            return [];
        }
        try {
            const response = await fetch(`https://provinces.open-api.vn/api/d/${districtId}?depth=2`);
            const data = await response.json();
            if (data && data.wards) {
                console.log(`Wards for district ${districtId}:`, data.wards);
                setWards(data.wards);
                return data.wards;
            } else {
                console.error('Invalid response wards data:', data);
                setWards([]);
                return [];
            }
        } catch (error) {
            console.error('Lỗi khi tải xã/phường:', error);
            return [];
        }
    };

    useEffect(() => {
        if (selectedProvince) {
            fetchDistricts(selectedProvince)
                .then((districts) => {
                    setDistricts(districts);
                    if (districts.length === 0) {
                        Swal.fire({
                            icon: 'warning',
                            title: 'Thông báo',
                            text: 'Không tìm thấy quận/huyện cho tỉnh này',
                        });
                    }
                })
                .catch((error) => {
                    console.error('Lỗi tải huyện: ', error);
                });

            setSelectedDistrict('');
            setWards([]);
        } else {
            setDistricts([]);
            setSelectedDistrict('');
            setSelectedWard('');
        }
    }, [selectedProvince]);

    useEffect(() => {
        if (selectedDistrict) {
            fetchWards(selectedDistrict).then((wards) => {
                setWards(wards);
                if (wards.length === 0) {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Thông báo',
                        text: 'Không tìm thấy xã/phường cho quận/huyện này',
                    });
                }
            });
        } else {
            setWards([]);
            setSelectedWard('');
        }
    }, [selectedDistrict]);

    const loadData = async (id) => {
        try {
            const response = await axios.get(`http://localhost:8080/khach-hang/${id}`);
            const customerData = response.data.result;
            setFormData({
                hoTen: customerData.hoTen || '',
                sdt: customerData.sdt || '',
                email: customerData.email || '',
                gioiTinh: customerData.gioiTinh ?? 0,
                ngaySinh: customerData.ngaySinh || '',
                trangThai: customerData.trangThai ?? 1,
                userType: customerData.userType || 'CA_NHAN',
            });
            setInitialEmail(customerData.email);

            if (customerData.diaChi && Array.isArray(customerData.diaChi) && customerData.diaChi.length > 0) {
                console.log('Danh sách địa chỉ từ backend:', customerData.diaChi);
                const addresses = await Promise.all(
                    customerData.diaChi.map(async (address) => {
                        console.log('Tìm province cho tinh:', address.tinh);
                        const province = provinces.find((prov) => prov.name === address.tinh);
                        let districts = [];
                        let wards = [];
                        let addressData = {
                            id: address.id,
                            ten: address.ten || '',
                            sdt: address.sdt || '',
                            idTinh: '',
                            idHuyen: '',
                            idXa: '',
                            diaChiCuThe: address.diaChiCuThe || '',
                            loai: address.loai ?? 0,
                            districts: [],
                            wards: [],
                        };

                        if (province) {
                            console.log(
                                `Found province: ${province.name} (code: ${province.code}) for tinh: ${address.tinh}`,
                            );
                            addressData.idTinh = province.code;
                            districts = await fetchDistricts(province.code);
                            const district = districts.find((dist) => dist.name === address.huyen);
                            if (district) {
                                console.log(
                                    `Found district: ${district.name} (code: ${district.code}) for huyen: ${address.huyen}`,
                                );
                                addressData.idHuyen = district.code;
                                wards = await fetchWards(district.code);
                                const ward = wards.find((w) => w.name === address.xa);
                                if (ward) {
                                    console.log(`Found ward: ${ward.name} (code: ${ward.code}) for xa: ${address.xa}`);
                                    addressData.idXa = ward.code;
                                } else {
                                    console.warn(`No ward found for xa: ${address.xa}`);
                                }
                            } else {
                                console.warn(`No district found for huyen: ${address.huyen}`);
                            }
                            addressData.districts = districts;
                            addressData.wards = wards;
                        } else {
                            console.warn(`No province found for tinh: ${address.tinh}`);
                        }

                        return addressData;
                    }),
                );

                setDiaChi(addresses);
            } else {
                console.warn(`No addresses found or invalid diaChi for customer ID: ${id}`);
                setDiaChi([]);
            }
        } catch (error) {
            console.error('Error fetching customer data:', error);
            swal('Lỗi!', 'Không thể tải thông tin khách hàng!', 'error');
        }
    };

    const createDiaChi = () => {
        const newDiaChi = {
            id: null,
            ten: '',
            sdt: '',
            idTinh: '',
            idHuyen: '',
            idXa: '',
            diaChiCuThe: '',
            isMacDinh: false,
            loai: 0, // Đảm bảo loai luôn có (0 cho địa chỉ thường)
            idTaiKhoan: id, // Đảm bảo idTaiKhoan luôn có để BE associate (cho add)
            districts: [],
            wards: [],
        };
        const updatedDiaChiList = [newDiaChi, ...diaChi];
        setDiaChi(updatedDiaChiList);
        setIsAddingDiaChi(true);
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, avatar: file });
            const reader = new FileReader();
            reader.onload = () => {
                setPreviewImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const [isLoading, setIsLoading] = useState(false);

    const handleUpdateCustomer = async (e) => {
        e.preventDefault();

        if (isLoading) {
            return;
        }
        setIsLoading(true);

        const { errors, check } = await validateData(formData);

        setFormErrors(errors);
        if (check > 0) {
            setIsLoading(false);
            return;
        }

        const title = 'Xác nhận sửa khách hàng?';
        const text = 'Bạn có chắc chắn muốn cập nhật thông tin khách hàng này?';

        const dataToSend = {
            hoTen: formData.hoTen,
            sdt: formData.sdt,
            email: formData.email,
            gioiTinh: formData.gioiTinh,
            ngaySinh: formData.ngaySinh,
            trangThai: formData.trangThai,
            userType: formData.userType,
        };

        swal({
            title: title,
            text: text,
            icon: 'warning',
            buttons: {
                cancel: 'Hủy',
                confirm: 'Xác nhận',
            },
        }).then(async (willConfirm) => {
            if (willConfirm) {
                try {
                    const response = await fetch(`http://localhost:8080/khach-hang/${id}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(dataToSend),
                    });

                    if (!response.ok) {
                        throw new Error('Lỗi cập nhật');
                    }

                    await swal('Thành công!', 'Sửa khách hàng thành công!', 'success');
                    setIsLoading(false);
                    window.location.href = '/admin/tai-khoan/khach-hang';
                } catch (error) {
                    setIsLoading(false);
                    console.error('Lỗi cập nhật:', error);
                    swal('Thất bại!', 'Sửa khách hàng thất bại!', 'error');
                }
            }
        });
    };

    const deleteDiaChi = (idDC) => {
        const title = 'Xác nhận xóa địa chỉ?';
        const text = '';

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
                axios
                    .delete(`http://localhost:8080/api/dia-chi/delete/${idDC}`)
                    .then(() => {
                        setDiaChi(diaChi.filter((item) => item.id !== idDC));
                        swal('Thành công!', 'Xóa địa chỉ thành công!', 'success');
                    })
                    .catch((error) => {
                        console.error('Lỗi xóa địa chỉ:', error);
                        swal('Thất bại!', 'Xóa địa chỉ thất bại!', 'error');
                    });
            }
        });
    };

    // SỬA CHÍNH: Endpoint update mới /khach-hang/update-address; Body thêm idKhachHang và id; Check code === 0 cho update
    const onUpdateDiaChi = (diaChiaa, index) => {
        const { errors, check } = validateAddress(diaChiaa);
        setAddressErrors((prevErrors) => ({
            ...prevErrors,
            [index]: errors,
        }));

        if (check > 0) {
            console.log('Validation failed, check:', check, 'errors:', errors); // Debug validation
            return;
        }

        const title = diaChiaa.id ? 'Xác nhận Cập nhật địa chỉ?' : 'Xác nhận Thêm mới địa chỉ?';
        const text = diaChiaa.id
            ? 'Bạn có chắc chắn muốn cập nhật địa chỉ này không?'
            : 'Bạn có chắc chắn muốn thêm mới địa chỉ này không?';

        const Province = provinces.find((prov) => prov.code === parseInt(diaChiaa.idTinh));
        const District = diaChiaa.districts.find((dist) => dist.code === parseInt(diaChiaa.idHuyen));
        const Ward = diaChiaa.wards.find((w) => w.code === parseInt(diaChiaa.idXa));

        if (!Province || !District || !Ward) {
            swal('Lỗi!', 'Vui lòng chọn đầy đủ thông tin địa chỉ', 'error');
            return;
        }

        // THAY ĐỔI: Body khác nhau cho add vs update theo spec
        let updatedDiaChi;
        if (diaChiaa.id) {
            // CHO UPDATE: Theo spec, thêm idKhachHang và id, loại bỏ loai/idTaiKhoan
            updatedDiaChi = {
                idKhachHang: parseInt(id), // id của khách hàng
                id: diaChiaa.id, // id của địa chỉ
                ten: diaChiaa.ten,
                sdt: diaChiaa.sdt,
                tinh: Province.name,
                huyen: District.name,
                xa: Ward.name,
                diaChiCuThe: diaChiaa.diaChiCuThe,
                isMacDinh: diaChiaa.isMacDinh || false,
            };
        } else {
            // CHO ADD: Giữ nguyên như trước (loai và idTaiKhoan nếu BE cần)
            updatedDiaChi = {
                ten: diaChiaa.ten,
                sdt: diaChiaa.sdt,
                tinh: Province.name,
                huyen: District.name,
                xa: Ward.name,
                diaChiCuThe: diaChiaa.diaChiCuThe,
                isMacDinh: diaChiaa.isMacDinh || false,
                loai: diaChiaa.loai ?? 0,
                idTaiKhoan: id,
            };
        }
        console.log('Data sending to BE:', updatedDiaChi); // Debug body gửi đi

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
                // THAY ĐỔI: Endpoint update mới
                const apiUrl = diaChiaa.id
                    ? `http://localhost:8080/khach-hang/update-address` // MỚI: Endpoint update theo spec
                    : `http://localhost:8080/khach-hang/${id}`;
                const apiMethod = diaChiaa.id ? axios.put : axios.post; // PUT cho update

                apiMethod(apiUrl, updatedDiaChi, {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                })
                    .then((response) => {
                        console.log('Full response from BE:', response); // DEBUG: Log toàn bộ response
                        console.log('Response status:', response.status);
                        console.log('Response data:', response.data);

                        // THAY ĐỔI: Check code khác nhau cho add vs update
                        const isSuccess =
                            response.status === 200 ||
                            response.status === 201 ||
                            (response.data &&
                                ((diaChiaa.id && response.data.code === 0) || // Update: code 0
                                    (!diaChiaa.id && response.data.code === 1000))); // Add: code 1000
                        if (isSuccess) {
                            loadData(id);
                            const successMessage = diaChiaa.id
                                ? 'Cập nhật địa chỉ thành công!'
                                : 'Thêm địa chỉ thành công!';
                            swal('Thành công!', successMessage, 'success');
                            if (!diaChiaa.id) setIsAddingDiaChi(false);
                        } else {
                            console.error('Unexpected response structure:', response.data); // DEBUG
                            throw new Error('API trả về response không mong đợi');
                        }
                    })
                    .catch((error) => {
                        console.log('Full error object:', error); // DEBUG: Log error chi tiết
                        console.log('Error response (if any):', error.response?.data); // DEBUG: Lỗi từ BE

                        const errorMessage = diaChiaa.id ? 'Cập nhật địa chỉ thất bại!' : 'Thêm địa chỉ thất bại!';
                        const backendError = error.response?.data?.message || errorMessage; // Lấy message từ BE nếu có
                        console.error('Lỗi:', error);
                        swal('Thất bại!', backendError, 'error');
                    });
            }
        });
    };

    const handleUpdateLoai = (idDC) => {
        axios
            .put(`http://localhost:8080/api/dia-chi/status`, null, {
                params: {
                    idTaiKhoan: id,
                    idDiaChi: idDC,
                },
            })
            .then(() => {
                loadData(id);
                swal('Thành công!', 'Set địa chỉ mặc định thành công!', 'success');
            })
            .catch((error) => {
                console.error('Lỗi gọi API:', error);
                const errMessage = error.response?.data?.message || error.response?.data || 'Lỗi không xác định';
                swal('Thất bại!', errMessage, 'error');
            });
    };

    useEffect(() => {
        if (isProvincesLoaded) {
            loadData(id);
        }
    }, [id, isProvincesLoaded]);

    return (
        <div>
            <div className="font-bold text-sm">
                <span className="cursor-pointer" onClick={() => navigate('/admin/tai-khoan/khach-hang')}>
                    Khách hàng
                </span>
                <span className="text-gray-400 ml-2">/ Chỉnh sửa khách hàng</span>
            </div>
            <div className="bg-white p-4 rounded-md shadow-lg">
                <div className="flex">
                    <div className="w-1/4 pr-4">
                        <h2 className="text-xl font-semibold text-gray-800 mb-8">Thông tin khách hàng</h2>
                        <hr />
                        <div className="col-span-2 mt-4">
                            <label className="block text-sm font-medium text-gray-700">Họ Và Tên</label>
                            <input
                                type="text"
                                name="hoTen"
                                value={formData.hoTen}
                                placeholder="Nhập họ và tên"
                                className={`w-full p-3 border-2 border-gray-400 rounded outline-blue-500 ${formErrors.hoTen ? 'border-red-500 hover:border-red-600 outline-red-500' : ''}`}
                                onChange={(e) => {
                                    handleInputChange(e);
                                    setFormErrors({ ...formErrors, hoTen: '' });
                                }}
                            />
                            {formErrors.hoTen && (
                                <p className="text-sm" style={{ color: 'red' }}>
                                    {formErrors.hoTen}
                                </p>
                            )}
                        </div>
                        <div className="col-span-2 mt-4">
                            <label className="block text-sm font-medium text-gray-700">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                placeholder="Nhập email"
                                className={`w-full p-3 border-2 border-gray-400 rounded outline-blue-500 ${formErrors.email ? 'border-red-500 hover:border-red-600 outline-red-500' : ''}`}
                                onChange={(e) => {
                                    handleInputChange(e);
                                    setFormErrors({ ...formErrors, email: '' });
                                }}
                            />
                            {formErrors.email && (
                                <p className="text-sm" style={{ color: 'red' }}>
                                    {formErrors.email}
                                </p>
                            )}
                        </div>
                        <div className="col-span-2 mt-4">
                            <label className="block text-sm font-medium text-gray-700">Số Điện Thoại</label>
                            <input
                                type="text"
                                name="sdt"
                                value={formData.sdt}
                                placeholder="Nhập số điện thoại"
                                className={`w-full p-3 border-2 border-gray-400 rounded outline-blue-500 ${formErrors.sdt ? 'border-red-500 hover:border-red-600 outline-red-500' : ''}`}
                                onChange={(e) => {
                                    handleInputChange(e);
                                    setFormErrors({ ...formErrors, sdt: '' });
                                }}
                            />
                            {formErrors.sdt && (
                                <p className="text-sm" style={{ color: 'red' }}>
                                    {formErrors.sdt}
                                </p>
                            )}
                        </div>
                        <div className="col-span-2 mt-4">
                            <label className="block text-sm font-medium text-gray-700">Ngày sinh</label>
                            <input
                                type="date"
                                name="ngaySinh"
                                value={formData.ngaySinh}
                                className={`w-full p-3 border-2 border-gray-400 rounded outline-blue-500 ${formErrors.ngaySinh ? 'border-red-500 hover:border-red-600 outline-red-500' : ''}`}
                                onChange={(e) => {
                                    handleInputChange(e);
                                    setFormErrors({ ...formErrors, ngaySinh: '' });
                                }}
                            />
                            {formErrors.ngaySinh && (
                                <p className="text-sm" style={{ color: 'red' }}>
                                    {formErrors.ngaySinh}
                                </p>
                            )}
                        </div>
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700">Giới tính</label>
                            <div className="flex items-center gap-4">
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="gioiTinh"
                                        value={0}
                                        checked={formData.gioiTinh === 0}
                                        onChange={(e) => {
                                            setFormData({
                                                ...formData,
                                                gioiTinh: parseInt(e.target.value),
                                            });
                                            setFormErrors({ ...formErrors, gioiTinh: '' });
                                        }}
                                        className="mr-2 outline-blue-500"
                                    />
                                    Nam
                                </label>
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="gioiTinh"
                                        value={1}
                                        checked={formData.gioiTinh === 1}
                                        onChange={(e) => {
                                            setFormData({
                                                ...formData,
                                                gioiTinh: parseInt(e.target.value),
                                            });
                                            setFormErrors({ ...formErrors, gioiTinh: '' });
                                        }}
                                        className="mr-2"
                                    />
                                    Nữ
                                </label>
                            </div>
                            {formErrors.gioiTinh && (
                                <p className="text-sm" style={{ color: 'red' }}>
                                    {formErrors.gioiTinh}
                                </p>
                            )}
                        </div>
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700">Loại khách hàng</label>
                            <select
                                name="userType"
                                value={formData.userType}
                                onChange={(e) => {
                                    handleInputChange(e);
                                    setFormErrors({ ...formErrors, userType: '' });
                                }}
                                className={`w-full p-3 border-2 border-gray-400 rounded outline-blue-500 ${formErrors.userType ? 'border-red-500 hover:border-red-600 outline-red-500' : ''}`}
                            >
                                <option value="">Chọn loại khách hàng</option>
                                <option value="CA_NHAN">Cá Nhân</option>
                                <option value="DOANH_NGHIEP">Doanh Nghiệp</option>
                                <option value="VIP">VIP</option>
                            </select>
                            {formErrors.userType && (
                                <p className="text-sm" style={{ color: 'red' }}>
                                    {formErrors.userType}
                                </p>
                            )}
                        </div>
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700">Trạng thái</label>
                            <div className="flex items-center gap-4">
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="trangThai"
                                        value={1}
                                        checked={formData.trangThai === 1}
                                        onChange={(e) => {
                                            setFormData({
                                                ...formData,
                                                trangThai: parseInt(e.target.value),
                                            });
                                            setFormErrors({ ...formErrors, trangThai: '' });
                                        }}
                                        className="mr-2 outline-blue-500"
                                    />
                                    Hoạt động
                                </label>
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="trangThai"
                                        value={0}
                                        checked={formData.trangThai === 0}
                                        onChange={(e) => {
                                            setFormData({
                                                ...formData,
                                                trangThai: parseInt(e.target.value),
                                            });
                                            setFormErrors({ ...formErrors, trangThai: '' });
                                        }}
                                        className="mr-2"
                                    />
                                    Không hoạt động
                                </label>
                            </div>
                            {formErrors.trangThai && (
                                <p className="text-sm" style={{ color: 'red' }}>
                                    {formErrors.trangThai}
                                </p>
                            )}
                        </div>
                        <div className="mt-5 flex">
                            <button
                                onClick={handleUpdateCustomer}
                                className="bg-[#2f19ae] text-white px-8 py-3 rounded-sm shadow-md hover:bg-blue-700 transition duration-300"
                            >
                                Cập nhật
                            </button>
                        </div>
                    </div>

                    <div className="w-3/4 pl-8">
                        <h2 className="text-xl font-semibold text-gray-800 mb-8">Danh sách địa chỉ</h2>
                        <hr />
                        {diaChi.length > 0 ? (
                            diaChi.map((item, index) => (
                                <div key={index} className="mb-4 mt-6 border border-gray-300 rounded-sm shadow-md">
                                    <div className="p-4 rounded-t-lg">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-semibold">Địa chỉ {index + 1}</span>
                                        </div>
                                    </div>

                                    <div className="p-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="col-span-1">
                                                <label className="block text-sm font-medium text-gray-700">Tên</label>
                                                <input
                                                    type="text"
                                                    className={`w-full p-2 border border-gray-300 rounded text-sm outline-blue-500 ${
                                                        addressErrors[index]?.ten
                                                            ? 'border-red-500 hover:border-red-600 outline-red-500'
                                                            : ''
                                                    }`}
                                                    value={item.ten || ''}
                                                    onChange={(e) => {
                                                        const updatedDiaChi = [...diaChi];
                                                        updatedDiaChi[index].ten = e.target.value;
                                                        setDiaChi(updatedDiaChi);
                                                        setAddressErrors((prevErrors) => ({
                                                            ...prevErrors,
                                                            [index]: { ...prevErrors[index], ten: '' },
                                                        }));
                                                    }}
                                                />
                                                {addressErrors[index]?.ten && (
                                                    <p className="text-sm" style={{ color: 'red' }}>
                                                        {addressErrors[index].ten}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="col-span-1">
                                                <label className="block text-sm font-medium text-gray-700">
                                                    Số điện thoại
                                                </label>
                                                <input
                                                    type="text"
                                                    className={`w-full p-2 border border-gray-300 rounded text-sm outline-blue-500 ${
                                                        addressErrors[index]?.sdt
                                                            ? 'border-red-500 hover:border-red-600 outline-red-500'
                                                            : ''
                                                    }`}
                                                    value={item.sdt || ''}
                                                    onChange={(e) => {
                                                        const updatedDiaChi = [...diaChi];
                                                        updatedDiaChi[index].sdt = e.target.value;
                                                        setDiaChi(updatedDiaChi);
                                                        setAddressErrors((prevErrors) => ({
                                                            ...prevErrors,
                                                            [index]: { ...prevErrors[index], sdt: '' },
                                                        }));
                                                    }}
                                                />
                                                {addressErrors[index]?.sdt && (
                                                    <p className="text-sm" style={{ color: 'red' }}>
                                                        {addressErrors[index].sdt}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">
                                                    Tỉnh/thành phố
                                                </label>
                                                <select
                                                    className={`w-full p-2 border border-gray-300 rounded text-sm outline-blue-500 ${
                                                        addressErrors[index]?.idTinh
                                                            ? 'border-red-500 hover:border-red-600 outline-red-500'
                                                            : ''
                                                    }`}
                                                    value={item.idTinh || ''}
                                                    onChange={async (e) => {
                                                        const updatedDiaChi = [...diaChi];
                                                        updatedDiaChi[index].idTinh = e.target.value;
                                                        updatedDiaChi[index].idHuyen = '';
                                                        updatedDiaChi[index].idXa = '';
                                                        const districts = await fetchDistricts(e.target.value);
                                                        updatedDiaChi[index].districts = districts;
                                                        updatedDiaChi[index].wards = [];
                                                        setDiaChi(updatedDiaChi);
                                                        setAddressErrors((prevErrors) => ({
                                                            ...prevErrors,
                                                            [index]: { ...prevErrors[index], idTinh: '' },
                                                        }));
                                                    }}
                                                >
                                                    <option value="">Chọn tỉnh/thành phố</option>
                                                    {provinces.map((province) => (
                                                        <option key={province.code} value={province.code}>
                                                            {province.name}
                                                        </option>
                                                    ))}
                                                </select>
                                                {addressErrors[index]?.idTinh && (
                                                    <p className="text-sm" style={{ color: 'red' }}>
                                                        {addressErrors[index].idTinh}
                                                    </p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">
                                                    Quận/huyện
                                                </label>
                                                <select
                                                    className={`w-full p-2 border border-gray-300 rounded text-sm outline-blue-500 ${
                                                        addressErrors[index]?.idHuyen
                                                            ? 'border-red-500 hover:border-red-600 outline-red-500'
                                                            : ''
                                                    }`}
                                                    value={item.idHuyen || ''}
                                                    onChange={async (e) => {
                                                        const updatedDiaChi = [...diaChi];
                                                        updatedDiaChi[index].idHuyen = e.target.value;
                                                        updatedDiaChi[index].idXa = '';
                                                        const wards = await fetchWards(e.target.value);
                                                        updatedDiaChi[index].wards = wards;
                                                        setDiaChi(updatedDiaChi);
                                                        setAddressErrors((prevErrors) => ({
                                                            ...prevErrors,
                                                            [index]: { ...prevErrors[index], idHuyen: '' },
                                                        }));
                                                    }}
                                                    disabled={!item.idTinh}
                                                >
                                                    <option value="">Chọn quận/huyện</option>
                                                    {item.districts &&
                                                        item.districts.map((district) => (
                                                            <option key={district.code} value={district.code}>
                                                                {district.name}
                                                            </option>
                                                        ))}
                                                </select>
                                                {addressErrors[index]?.idHuyen && (
                                                    <p className="text-sm" style={{ color: 'red' }}>
                                                        {addressErrors[index].idHuyen}
                                                    </p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">
                                                    Xã/phường/thị trấn
                                                </label>
                                                <select
                                                    className={`w-full p-2 border border-gray-300 rounded text-sm outline-blue-500 ${
                                                        addressErrors[index]?.idXa
                                                            ? 'border-red-500 hover:border-red-600 outline-red-500'
                                                            : ''
                                                    }`}
                                                    value={item.idXa || ''}
                                                    onChange={(e) => {
                                                        const updatedDiaChi = [...diaChi];
                                                        updatedDiaChi[index].idXa = e.target.value;
                                                        setDiaChi(updatedDiaChi);
                                                        setAddressErrors((prevErrors) => ({
                                                            ...prevErrors,
                                                            [index]: { ...prevErrors[index], idXa: '' },
                                                        }));
                                                    }}
                                                    disabled={!item.idHuyen}
                                                >
                                                    <option value="">Chọn xã/phường</option>
                                                    {item.wards &&
                                                        item.wards.map((ward) => (
                                                            <option key={ward.code} value={ward.code}>
                                                                {ward.name}
                                                            </option>
                                                        ))}
                                                </select>
                                                {addressErrors[index]?.idXa && (
                                                    <p className="text-sm" style={{ color: 'red' }}>
                                                        {addressErrors[index].idXa}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="mt-4">
                                            <label className="block text-sm font-medium text-gray-700">
                                                Địa chỉ cụ thể
                                            </label>
                                            <input
                                                type="text"
                                                className={`w-full p-2 border border-gray-300 rounded text-sm outline-blue-500 ${
                                                    addressErrors[index]?.diaChiCuThe
                                                        ? 'border-red-500 hover:border-red-600 outline-red-500'
                                                        : ''
                                                }`}
                                                value={item.diaChiCuThe || ''}
                                                onChange={(e) => {
                                                    const updatedDiaChi = [...diaChi];
                                                    updatedDiaChi[index].diaChiCuThe = e.target.value;
                                                    setDiaChi(updatedDiaChi);
                                                    setAddressErrors((prevErrors) => ({
                                                        ...prevErrors,
                                                        [index]: { ...prevErrors[index], diaChiCuThe: '' },
                                                    }));
                                                }}
                                            />
                                            {addressErrors[index]?.diaChiCuThe && (
                                                <p className="text-sm" style={{ color: 'red' }}>
                                                    {addressErrors[index].diaChiCuThe}
                                                </p>
                                            )}
                                        </div>
                                        {addressErrors[index]?.loai && (
                                            <p className="text-sm" style={{ color: 'red' }}>
                                                {addressErrors[index].loai}
                                            </p>
                                        )}
                                        <div className="mt-4 flex justify-between w-full">
                                            <div className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={item.isMacDinh || false}
                                                    onChange={(e) => {
                                                        const updatedDiaChi = [...diaChi];
                                                        updatedDiaChi[index].isMacDinh = e.target.checked;
                                                        setDiaChi(updatedDiaChi);
                                                    }}
                                                    className="mr-2"
                                                />
                                                <label className="text-sm">Đặt làm mặc định</label>
                                            </div>
                                            <div className="flex justify-end">
                                                {item.id === null ? (
                                                    <button
                                                        onClick={() => onUpdateDiaChi(item, index)}
                                                        className="ml-4 text-green-500 hover:text-green-600"
                                                    >
                                                        <AddIcon />
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => onUpdateDiaChi(item, index)}
                                                        className="ml-4 text-blue-500 hover:text-blue-600"
                                                    >
                                                        <EditIcon />
                                                    </button>
                                                )}
                                                {item.loai !== 1 && item.id !== null ? (
                                                    <button
                                                        onClick={() => deleteDiaChi(item.id)}
                                                        className="ml-4 text-red-500 hover:text-red-600"
                                                    >
                                                        <DeleteIcon />
                                                    </button>
                                                ) : null}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-gray-500 text-center mt-4">Chưa có địa chỉ nào</p>
                        )}
                        <div>
                            {!isAddingDiaChi && (
                                <button
                                    onClick={createDiaChi}
                                    className="px-4 py-1 bg-white text-amber-400 border border-amber-400 font-medium rounded-sm shadow-sm hover:bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-opacity-50 transition-all duration-200"
                                >
                                    Thêm địa chỉ
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default EditCustomer;
