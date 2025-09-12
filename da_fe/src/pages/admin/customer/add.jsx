import { useEffect, useState } from 'react';
import swal from 'sweetalert';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function AddCustomer() {
    const navigate = useNavigate();
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);
    const [selectedProvince, setSelectedProvince] = useState('');
    const [selectedDistrict, setSelectedDistrict] = useState('');
    const [selectedWard, setSelectedWard] = useState('');
    const [previewImage, setPreviewImage] = useState(null);
    const [errors, setErrors] = useState({});

    const [formData, setFormData] = useState({
        hoTen: '',
        sdt: '',
        email: '',
        gioiTinh: 0,
        ngaySinh: '',
        userType: 'CA_NHAN',
    });

    const [diaChiData, setDiaChiData] = useState({
        ten: '',
        sdt: '',
        diaChiCuThe: '',
        tinh: '',
        huyen: '',
        xa: '',
        loai: 0,
    });

    const checkMail = async (email) => {
        try {
            const response = await axios.get(`http://localhost:8080/auth/check-mail?email=${email}`);
            return !!(response.data?.email === email);
        } catch (error) {
            console.error('Error checking email: ', error);
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
                if (emailExists) {
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
                errors.ngaySinh = '*Ngày sinh không hợp lệ';
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

        if (!selectedProvince) {
            errors.tinh = '*Bạn chưa chọn tỉnh/ thành phố';
            check++;
        }

        if (!selectedDistrict) {
            errors.huyen = '*Bạn chưa chọn quận/ huyện';
            check++;
        }

        if (!address.xa) {
            errors.xa = '*Bạn chưa chọn xã/ phường';
            check++;
        }

        if (!address.diaChiCuThe.trim()) {
            errors.diaChiCuThe = '*Bạn chưa nhập địa chỉ cụ thể';
            check++;
        } else if (address.diaChiCuThe.length > 255) {
            errors.diaChiCuThe = '*Địa chỉ cụ thể không dài quá 255 ký tự';
            check++;
        }

        return { errors, check };
    };

    useEffect(() => {
        axios
            .get('https://online-gateway.ghn.vn/shiip/public-api/master-data/province', {
                headers: {
                    Token: '04ae91c9-b3a5-11ef-b074-aece61c107bd',
                },
            })
            .then((response) => {
                if (response.data && Array.isArray(response.data.data)) {
                    setProvinces(response.data.data);
                } else {
                    console.log('Dữ liệu tỉnh không hợp lệ: ', response.data);
                }
            })
            .catch((error) => {
                console.error('Error fetching provinces:', error);
            });
    }, []);

    useEffect(() => {
        if (selectedProvince) {
            axios
                .get(
                    `https://online-gateway.ghn.vn/shiip/public-api/master-data/district?province_id=${selectedProvince}`,
                    {
                        headers: {
                            Token: '04ae91c9-b3a5-11ef-b074-aece61c107bd',
                        },
                    },
                )
                .then((response) => {
                    if (response.data && Array.isArray(response.data.data)) {
                        setDistricts(response.data.data);
                    } else {
                        console.log('Dữ liệu huyện không hợp lệ: ', response.data);
                    }
                })
                .catch((error) => {
                    console.error('Error fetching districts:', error);
                });
        } else {
            setDistricts([]);
        }
    }, [selectedProvince]);

    useEffect(() => {
        if (selectedDistrict) {
            axios
                .get(
                    `https://online-gateway.ghn.vn/shiip/public-api/master-data/ward?district_id=${selectedDistrict}`,
                    {
                        headers: {
                            Token: '04ae91c9-b3a5-11ef-b074-aece61c107bd',
                        },
                    },
                )
                .then((response) => {
                    if (response.data && Array.isArray(response.data.data)) {
                        setWards(response.data.data);
                    } else {
                        console.log('Dữ liệu xã không hợp lệ: ', response.data);
                    }
                })
                .catch((error) => {
                    console.error('Error fetching wards:', error);
                });
        } else {
            setWards([]);
        }
    }, [selectedDistrict]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleProvinceChange = (e) => {
        const value = e.target.value;
        setSelectedProvince(value);
        setErrors({ ...errors, tinh: '' });
    };

    const handleDistrictChange = (e) => {
        const value = e.target.value;
        setSelectedDistrict(value);
        setErrors({ ...errors, huyen: '' });
    };

    const handleWardChange = (e) => {
        const value = e.target.value;
        setSelectedWard(value);
        setErrors({ ...errors, xa: '' });
    };

    const handleGenderChange = (value) => {
        setFormData((prev) => ({
            ...prev,
            gioiTinh: value,
        }));
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

    const resetForm = () => {
        setFormData({
            hoTen: '',
            sdt: '',
            email: '',
            gioiTinh: 0,
            ngaySinh: '',
            userType: 'CA_NHAN',
        });
        setDiaChiData({
            ten: '',
            sdt: '',
            diaChiCuThe: '',
            tinh: '',
            huyen: '',
            xa: '',
            loai: 0,
        });
        setSelectedProvince('');
        setSelectedDistrict('');
        setSelectedWard('');
        setPreviewImage(null);
        setErrors({});
    };

    const handleAddUser = async (e) => {
        e.preventDefault();

        const { errors: personalErrors, check: personalCheck } = await validateData(formData);
        const { errors: addressErrors, check: addressCheck } = validateAddress({
            ...diaChiData,
            tinh: selectedProvince,
            huyen: selectedDistrict,
            xa: selectedWard,
        });

        const combinedErrors = { ...personalErrors, ...addressErrors };
        const totalCheck = personalCheck + addressCheck;

        if (totalCheck > 0) {
            setErrors(combinedErrors);
            console.log('Combined errors:', combinedErrors);
            return;
        }

        setErrors({});

        const Province = provinces.find((prov) => prov.ProvinceID === parseInt(selectedProvince));
        const District = districts.find((dist) => dist.DistrictID === parseInt(selectedDistrict));
        const Ward = wards.find((w) => w.WardCode === selectedWard);

        if (!Province || !District || !Ward) {
            swal('Lỗi!', 'Vui lòng chọn đầy đủ thông tin địa chỉ!', 'error');
            return;
        }

        const customerData = {
            hoTen: formData.hoTen,
            email: formData.email,
            sdt: formData.sdt,
            ngaySinh: formData.ngaySinh,
            gioiTinh: formData.gioiTinh,
            userType: formData.userType,
            diaChi: {
                ten: diaChiData.ten || formData.hoTen,
                sdt: diaChiData.sdt || formData.sdt,
                tinh: Province.ProvinceName,
                huyen: District.DistrictName,
                xa: Ward.WardName,
                diaChiCuThe: diaChiData.diaChiCuThe,
                loai: diaChiData.loai,
            },
        };

        try {
            const customerResponse = await fetch('http://localhost:8080/khach-hang', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(customerData),
            });

            if (customerResponse.status === 409) {
                swal('Lỗi!', 'Email đã tồn tại!', 'error');
                return;
            }

            if (!customerResponse.ok) {
                const errText = await customerResponse.text();
                throw new Error(errText || 'Failed to create customer');
            }

            resetForm();

            swal({
                title: 'Thành công!',
                text: 'Thêm khách hàng thành công!',
                icon: 'success',
                buttons: false,
                timer: 2000,
            }).then(() => {
                navigate('/admin/tai-khoan/khach-hang');
            });
        } catch (error) {
            console.error('Error:', error);
            swal({
                title: 'Lỗi!',
                text: error.message || 'Có lỗi xảy ra khi thêm khách hàng!',
                icon: 'error',
                button: 'OK',
            });
        }
    };

    const handleNavigateToSale = () => {
        navigate('/admin/tai-khoan/khach-hang');
    };

    return (
        <div>
            <div className="font-bold text-sm">
                <span className="cursor-pointer" onClick={handleNavigateToSale}>
                    Khách hàng
                </span>
                <span className="text-gray-400 ml-2">/ Tạo khách hàng</span>
            </div>
            <div className="bg-white p-4 rounded-md shadow-lg">
                <div className="flex">
                    <div className="w-1/4 pr-4">
                        <h2 className="text-xl font-semibold text-gray-800 mb-5">Thông tin khách hàng</h2>
                        <hr />
                        <div className="col-span-2 mt-4">
                            <label className="block text-sm font-medium text-gray-700">Họ Và Tên</label>
                            <input
                                type="text"
                                name="hoTen"
                                placeholder="Nhập họ và tên"
                                className={`w-full p-3 border-2 border-gray-300 rounded outline-blue-500 ${errors.hoTen ? 'border-red-500 hover:border-red-600 outline-red-500' : ''}`}
                                onChange={(e) => {
                                    handleInputChange(e);
                                    setErrors({ ...errors, hoTen: '' });
                                }}
                            />
                            {errors.hoTen && (
                                <p className="text-sm" style={{ color: 'red' }}>
                                    {errors.hoTen}
                                </p>
                            )}
                        </div>

                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700">Giới tính</label>
                            <div className="flex items-center gap-4">
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="gender"
                                        checked={formData.gioiTinh === 0}
                                        className={`mr-2 ${errors.gioiTinh ? 'border-red-500 hover:border-red-600' : ''}`}
                                        onChange={() => {
                                            handleGenderChange(0);
                                            setErrors({ ...errors, gioiTinh: '' });
                                        }}
                                    />{' '}
                                    Nam
                                </label>
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="gender"
                                        checked={formData.gioiTinh === 1}
                                        className={`mr-2 ${errors.gioiTinh ? 'border-red-500 hover:border-red-600' : ''}`}
                                        onChange={() => {
                                            handleGenderChange(1);
                                            setErrors({ ...errors, gioiTinh: '' });
                                        }}
                                    />{' '}
                                    Nữ
                                </label>
                            </div>
                            {errors.gioiTinh && (
                                <p className="text-sm" style={{ color: 'red' }}>
                                    {errors.gioiTinh}
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
                                    setErrors({ ...errors, userType: '' });
                                }}
                                className={`w-full p-3 border-2 border-gray-300 rounded outline-blue-500 ${errors.userType ? 'border-red-500 hover:border-red-600 outline-red-500' : ''}`}
                            >
                                <option value="">Chọn loại khách hàng</option>
                                <option value="CA_NHAN">Cá Nhân</option>
                                <option value="DOANH_NGHIEP">Doanh Nghiệp</option>
                                <option value="VIP">VIP</option>
                            </select>
                            {errors.userType && (
                                <p className="text-sm" style={{ color: 'red' }}>
                                    {errors.userType}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="w-3/4 pl-8">
                        <h2 className="text-xl font-semibold text-gray-800 mb-5">Thông tin chi tiết</h2>
                        <hr />
                        <div className="grid grid-cols-2 gap-4 mt-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Nhập email"
                                    className={`w-full p-3 border-2 border-gray-300 rounded outline-blue-500 ${errors.email ? 'border-red-500 hover:border-red-600 outline-red-500' : ''}`}
                                    onChange={(e) => {
                                        handleInputChange(e);
                                        setErrors({ ...errors, email: '' });
                                    }}
                                />
                                {errors.email && (
                                    <p className="text-sm" style={{ color: 'red' }}>
                                        {errors.email}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Số Điện Thoại</label>
                                <input
                                    type="text"
                                    name="sdt"
                                    placeholder="Nhập số điện thoại"
                                    className={`w-full p-3 border-2 border-gray-300 rounded outline-blue-500 ${errors.sdt ? 'border-red-500 hover:border-red-600 outline-red-500' : ''}`}
                                    onChange={(e) => {
                                        handleInputChange(e);
                                        setErrors({ ...errors, sdt: '' });
                                        setDiaChiData((prev) => ({ ...prev, sdt: e.target.value }));
                                    }}
                                />
                                {errors.sdt && (
                                    <p className="text-sm" style={{ color: 'red' }}>
                                        {errors.sdt}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 mt-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Tỉnh/Thành phố</label>
                                <select
                                    onChange={handleProvinceChange}
                                    className={`w-full p-3 border-2 border-gray-300 rounded outline-blue-500 ${errors.tinh ? 'border-red-500 hover:border-red-600 outline-red-500' : ''}`}
                                >
                                    <option value="">Chọn tỉnh/thành phố</option>
                                    {provinces.map((province) => (
                                        <option key={province.ProvinceID} value={province.ProvinceID}>
                                            {province.ProvinceName}
                                        </option>
                                    ))}
                                </select>
                                {errors.tinh && (
                                    <p className="text-sm" style={{ color: 'red' }}>
                                        {errors.tinh}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Quận/Huyện</label>
                                <select
                                    onChange={handleDistrictChange}
                                    className={`w-full p-3 border-2 border-gray-300 rounded outline-blue-500 ${errors.huyen ? 'border-red-500 hover:border-red-600 outline-red-500' : ''}`}
                                    disabled={!selectedProvince}
                                >
                                    <option value="">Chọn quận/huyện</option>
                                    {districts.map((district) => (
                                        <option key={district.DistrictID} value={district.DistrictID}>
                                            {district.DistrictName}
                                        </option>
                                    ))}
                                </select>
                                {errors.huyen && (
                                    <p className="text-sm" style={{ color: 'red' }}>
                                        {errors.huyen}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Xã/Phường/Thị trấn</label>
                                <select
                                    onChange={(e) => {
                                        handleWardChange(e);
                                        setDiaChiData((prev) => ({ ...prev, xa: e.target.value }));
                                    }}
                                    className={`w-full p-3 border-2 border-gray-300 rounded outline-blue-500 ${errors.xa ? 'border-red-500 hover:border-red-600 outline-red-500' : ''}`}
                                    disabled={!selectedDistrict}
                                >
                                    <option value="">Chọn xã/phường</option>
                                    {wards.map((ward) => (
                                        <option key={ward.WardCode} value={ward.WardCode}>
                                            {ward.WardName}
                                        </option>
                                    ))}
                                </select>
                                {errors.xa && (
                                    <p className="text-sm" style={{ color: 'red' }}>
                                        {errors.xa}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Ngày sinh</label>
                                <input
                                    type="date"
                                    name="ngaySinh"
                                    className={`w-full p-3 border-2 border-gray-300 rounded outline-blue-500 ${errors.ngaySinh ? 'border-red-600 hover:border-red-600 outline-red-500' : ''}`}
                                    onChange={(e) => {
                                        handleInputChange(e);
                                        setErrors({ ...errors, ngaySinh: '' });
                                    }}
                                />
                                {errors.ngaySinh && (
                                    <p className="text-sm" style={{ color: 'red' }}>
                                        {errors.ngaySinh}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Địa chỉ cụ thể</label>
                                <input
                                    type="text"
                                    placeholder="Nhập địa chỉ cụ thể"
                                    className={`w-full p-3 border-2 border-gray-300 rounded outline-blue-500 ${errors.diaChiCuThe ? 'border-red-500 hover:border-red-600 outline-red-500' : ''}`}
                                    onChange={(e) => {
                                        setDiaChiData((prev) => ({ ...prev, diaChiCuThe: e.target.value }));
                                        setErrors({ ...errors, diaChiCuThe: '' });
                                    }}
                                />
                                {errors.diaChiCuThe && (
                                    <p className="text-sm" style={{ color: 'red' }}>
                                        {errors.diaChiCuThe}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700">Tên người nhận</label>
                            <input
                                type="text"
                                placeholder="Nhập tên người nhận"
                                className={`w-full p-3 border-2 border-gray-300 rounded outline-blue-500`}
                                onChange={(e) => {
                                    setDiaChiData((prev) => ({ ...prev, ten: e.target.value }));
                                }}
                            />
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex justify-end">
                    <button
                        onClick={handleAddUser}
                        className="hover:bg-gray-300 border border-gray-300 font-medium py-2 px-4 rounded-sm"
                    >
                        Thêm khách hàng
                    </button>
                </div>
            </div>
        </div>
    );
}

export default AddCustomer;
