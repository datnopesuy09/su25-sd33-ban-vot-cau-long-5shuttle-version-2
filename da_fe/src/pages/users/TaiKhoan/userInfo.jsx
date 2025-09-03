import React, { useState, useEffect } from 'react';
import {
    User,
    Mail,
    Phone,
    Calendar,
    Camera,
    Save,
    Edit3,
    UserCheck,
    Upload,
    AlertCircle,
    CheckCircle2,
} from 'lucide-react';
import { useUserAuth } from '../../../contexts/userAuthContext';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './userInfo-styles.css';

const UserInfo = () => {
    const { user, setUser } = useUserAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        hoTen: '',
        email: '',
        sdt: '',
        ngaySinh: '',
        gioiTinh: '',
        avatar: null,
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (user) {
            setFormData({
                hoTen: user.hoTen || '',
                email: user.email || '',
                sdt: user.sdt || '',
                ngaySinh: user.ngaySinh || '',
                gioiTinh: String(user.gioiTinh ?? ''),
                avatar: null,
            });
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: files ? files[0] : value,
        }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: '',
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.hoTen.trim()) {
            newErrors.hoTen = 'Họ tên không được để trống';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email không được để trống';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email không hợp lệ';
        }

        if (!formData.sdt.trim()) {
            newErrors.sdt = 'Số điện thoại không được để trống';
        } else if (!/^[0-9]{10,11}$/.test(formData.sdt)) {
            newErrors.sdt = 'Số điện thoại không hợp lệ';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error('Vui lòng kiểm tra lại thông tin!');
            return;
        }

        const confirm = await Swal.fire({
            title: 'Xác nhận cập nhật',
            text: 'Bạn có chắc chắn muốn cập nhật thông tin?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Cập nhật',
            cancelButtonText: 'Hủy',
            confirmButtonColor: '#3b82f6',
            cancelButtonColor: '#6b7280',
        });

        if (!confirm.isConfirmed) return;

        setIsLoading(true);

        try {
            const token = localStorage.getItem('userToken');
            const form = new FormData();

            form.append('hoTen', formData.hoTen);
            form.append('email', formData.email);
            form.append('sdt', formData.sdt);
            form.append('ngaySinh', formData.ngaySinh);
            form.append('gioiTinh', parseInt(formData.gioiTinh));
            if (formData.avatar) {
                form.append('avatar', formData.avatar);
            }

            const res = await fetch(`http://localhost:8080/users/${user.id}`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: form,
            });

            if (!res.ok) throw new Error('Cập nhật thất bại');

            const data = await res.json();
            setUser(data.result);
            toast.success('Cập nhật thành công!');

            Swal.fire({
                title: 'Thành công!',
                text: 'Thông tin của bạn đã được cập nhật',
                icon: 'success',
                confirmButtonColor: '#3b82f6',
            });
        } catch (err) {
            console.error('Lỗi cập nhật:', err);
            toast.error('Đã xảy ra lỗi khi cập nhật!');

            Swal.fire({
                title: 'Lỗi!',
                text: 'Không thể cập nhật thông tin. Vui lòng thử lại.',
                icon: 'error',
                confirmButtonColor: '#ef4444',
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (!user) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Đang tải thông tin người dùng...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full user-info-container">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 mb-6 border border-blue-100 info-card">
                <div className="flex items-center gap-4">
                    <div className="bg-blue-100 rounded-lg p-2">
                        <UserCheck className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-800">Hồ sơ của tôi</h1>
                        <p className="text-gray-600 text-sm">Quản lý thông tin hồ sơ để bảo mật tài khoản</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 form-grid">
                    {/* Form Fields */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Personal Info Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden info-card">
                            <div className="bg-gray-50 px-4 py-3 border-b border-gray-100">
                                <div className="flex items-center gap-3">
                                    <User className="w-5 h-5 text-gray-600" />
                                    <h2 className="text-lg font-semibold text-gray-800">Thông tin cá nhân</h2>
                                </div>
                            </div>

                            <div className="p-4 space-y-4">
                                {/* Full Name */}
                                <div className="form-field">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <User className="w-4 h-4 inline mr-2" />
                                        Họ và tên
                                    </label>
                                    <div className="form-input">
                                        <input
                                            type="text"
                                            name="hoTen"
                                            value={formData.hoTen}
                                            onChange={handleChange}
                                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all custom-focus ${
                                                errors.hoTen
                                                    ? 'border-red-300 bg-red-50 error-shake'
                                                    : 'border-gray-300 hover:border-gray-400'
                                            }`}
                                            placeholder="Nhập họ và tên của bạn"
                                        />
                                    </div>
                                    {errors.hoTen && (
                                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                            <AlertCircle className="w-4 h-4" />
                                            {errors.hoTen}
                                        </p>
                                    )}
                                </div>

                                {/* Email */}
                                <div className="form-field">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <Mail className="w-4 h-4 inline mr-2" />
                                        Email
                                    </label>
                                    <div className="form-input">
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all custom-focus ${
                                                errors.email
                                                    ? 'border-red-300 bg-red-50 error-shake'
                                                    : 'border-gray-300 hover:border-gray-400'
                                            }`}
                                            placeholder="Nhập địa chỉ email"
                                        />
                                    </div>
                                    {errors.email && (
                                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                            <AlertCircle className="w-4 h-4" />
                                            {errors.email}
                                        </p>
                                    )}
                                </div>

                                {/* Phone */}
                                <div className="form-field">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <Phone className="w-4 h-4 inline mr-2" />
                                        Số điện thoại
                                    </label>
                                    <div className="form-input">
                                        <input
                                            type="tel"
                                            name="sdt"
                                            value={formData.sdt}
                                            onChange={handleChange}
                                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all custom-focus ${
                                                errors.sdt
                                                    ? 'border-red-300 bg-red-50 error-shake'
                                                    : 'border-gray-300 hover:border-gray-400'
                                            }`}
                                            placeholder="Nhập số điện thoại"
                                        />
                                    </div>
                                    {errors.sdt && (
                                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                            <AlertCircle className="w-4 h-4" />
                                            {errors.sdt}
                                        </p>
                                    )}
                                </div>

                                {/* Birth Date */}
                                <div className="form-field">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <Calendar className="w-4 h-4 inline mr-2" />
                                        Ngày sinh
                                    </label>
                                    <div className="form-input">
                                        <input
                                            type="date"
                                            name="ngaySinh"
                                            value={formData.ngaySinh}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400 transition-all custom-focus"
                                        />
                                    </div>
                                </div>

                                {/* Gender */}
                                <div className="form-field">
                                    <label className="block text-sm font-medium text-gray-700 mb-3">Giới tính</label>
                                    <div className="flex gap-6">
                                        <div className="custom-radio">
                                            <input
                                                type="radio"
                                                name="gioiTinh"
                                                value="0"
                                                id="male"
                                                checked={formData.gioiTinh === '0'}
                                                onChange={handleChange}
                                                className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                                            />
                                            <label htmlFor="male" className="text-gray-700 cursor-pointer">
                                                Nam
                                            </label>
                                        </div>
                                        <div className="custom-radio">
                                            <input
                                                type="radio"
                                                name="gioiTinh"
                                                value="1"
                                                id="female"
                                                checked={formData.gioiTinh === '1'}
                                                onChange={handleChange}
                                                className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                                            />
                                            <label htmlFor="female" className="text-gray-700 cursor-pointer">
                                                Nữ
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Avatar Section */}
                    <div className="lg:col-span-1 avatar-section">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden info-card">
                            <div className="bg-gray-50 px-4 py-3 border-b border-gray-100">
                                <div className="flex items-center gap-3">
                                    <Camera className="w-5 h-5 text-gray-600" />
                                    <h2 className="text-lg font-semibold text-gray-800">Ảnh đại diện</h2>
                                </div>
                            </div>

                            <div className="p-4 text-center">
                                <div className="relative inline-block mb-4 avatar-container">
                                    <img
                                        src={
                                            formData.avatar
                                                ? URL.createObjectURL(formData.avatar)
                                                : user?.avatar || 'https://via.placeholder.com/150'
                                        }
                                        alt="Avatar"
                                        className="w-24 h-24 rounded-full object-cover border-4 border-gray-100 shadow-lg"
                                    />
                                    <div className="absolute bottom-0 right-0 bg-blue-600 rounded-full p-1 shadow-lg">
                                        <Camera className="w-3 h-3 text-white" />
                                    </div>
                                </div>

                                <label className="inline-flex items-center gap-2 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 font-medium rounded-lg cursor-pointer transition-colors border border-blue-200 file-input-wrapper text-sm">
                                    <Upload className="w-4 h-4" />
                                    Chọn ảnh mới
                                    <input type="file" hidden name="avatar" accept="image/*" onChange={handleChange} />
                                </label>

                                <div className="mt-3 text-xs text-gray-500 space-y-1">
                                    <p>Dung lượng tối đa: 1MB</p>
                                    <p>Định dạng: JPEG, PNG, GIF</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`relative inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all shadow-md hover:shadow-lg submit-btn ${
                            isLoading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                    >
                        {isLoading && <div className="loading-overlay" />}
                        {isLoading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Đang cập nhật...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                Cập nhật thông tin
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default UserInfo;
