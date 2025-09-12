import React, { useState } from "react";
import {
    TextField,
    Button,
    Typography,
    IconButton,
    InputAdornment,
    Container,
    Box,
    Link
} from "@mui/material";
import { 
    Eye, 
    EyeOff, 
    KeyRound, 
    Shield, 
    Lock, 
    CheckCircle, 
    AlertCircle,
    Save 
} from "lucide-react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import './changePassword-styles.css';

const ChangePassword = () => {
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

    const [formData, setFormData] = useState({
        matKhau: "",
        matKhauMoi: "",
        xacNhanMkMoi: ""
    });

    const [errors, setErrors] = useState({
        oldPass: "",
        newPass: "",
        confirmPass: ""
    });

    const navigate = useNavigate();

    const handleTogglePasswordVisibility = (field) => {
        switch (field) {
            case "currentPassword":
                setShowCurrentPassword((prev) => !prev);
                break;
            case "newPassword":
                setShowNewPassword((prev) => !prev);
                break;
            case "confirmNewPassword":
                setShowConfirmNewPassword((prev) => !prev);
                break;
            default:
                break;
        }
    };

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleChangePassword = async () => {
        const newErrors = {};
        let check = 0;

        // Fake check mật khẩu hiện tại
        if (!formData.matKhau) {
            newErrors.oldPass = "*Bạn chưa nhập mật khẩu hiện tại";
            check++;
        } else {
            await new Promise((resolve) => setTimeout(resolve, 500));
            const isCorrect = formData.matKhau === "123456";
            if (!isCorrect) {
                newErrors.oldPass = "*Mật khẩu hiện tại không đúng";
                check++;
            }
        }

        if (!formData.matKhauMoi) {
            newErrors.newPass = "*Bạn chưa nhập mật khẩu mới";
            check++;
        } else if (formData.matKhauMoi.length < 6) {
            newErrors.newPass = "*Mật khẩu mới phải chứa ít nhất 6 kí tự.";
            check++;
        }

        if (!formData.xacNhanMkMoi) {
            newErrors.confirmPass = "*Bạn chưa xác nhận lại mật khẩu mới";
            check++;
        } else if (formData.matKhauMoi !== formData.xacNhanMkMoi) {
            newErrors.confirmPass = "*Mật khẩu mới và xác nhận không khớp";
            check++;
        }

        if (check > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            await new Promise((resolve) => setTimeout(resolve, 1000)); // giả delay

            Swal.fire("Thành công!", "Cập nhật mật khẩu thành công", "success");
            setErrors({});
            setTimeout(() => {
                navigate("/profile/user");
            }, 2000);
        } catch (error) {
            Swal.fire("Lỗi!", "Có lỗi xảy ra khi cập nhật mật khẩu!", "error");
        }
    };

    return (
        <div className="w-full changePassword-container">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-6 rounded-xl shadow-sm border border-purple-100 mb-6">
                <div className="flex items-center gap-4">
                    <div className="bg-purple-100 rounded-lg p-3 icon-wrapper">
                        <KeyRound className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold gradient-text">Đổi mật khẩu</h1>
                        <p className="text-gray-600 mt-1">Để bảo mật tài khoản, vui lòng không chia sẻ mật khẩu cho người khác</p>
                    </div>
                </div>
            </div>

            {/* Security Tips */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                        <h3 className="font-semibold text-blue-800 mb-2">Bảo mật mật khẩu</h3>
                        <ul className="text-sm text-blue-700 space-y-1">
                            <li>• Sử dụng ít nhất 6 ký tự</li>
                            <li>• Kết hợp chữ hoa, chữ thường và số</li>
                            <li>• Không sử dụng thông tin cá nhân dễ đoán</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Form Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden password-form">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <Lock className="w-5 h-5 text-gray-600" />
                        <h2 className="text-lg font-semibold text-gray-800">Thông tin mật khẩu</h2>
                    </div>
                </div>

                <div className="p-6 space-y-6">{/* Mật khẩu hiện tại */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            Mật khẩu hiện tại
                        </label>
                        <div className="relative">
                            <input
                                type={showCurrentPassword ? "text" : "password"}
                                name="matKhau"
                                value={formData.matKhau}
                                onChange={(e) => {
                                    handleInputChange(e);
                                    setErrors({ ...errors, oldPass: "" });
                                }}
                                className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                                    errors.oldPass ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                                }`}
                                placeholder="Nhập mật khẩu hiện tại"
                            />
                            <button
                                type="button"
                                onClick={() => handleTogglePasswordVisibility("currentPassword")}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                        {errors.oldPass && (
                            <p className="text-sm text-red-600 flex items-center gap-1">
                                <AlertCircle className="w-4 h-4" />
                                {errors.oldPass}
                            </p>
                        )}
                        <div className="text-right">
                            <Link 
                                href="/forgot-password" 
                                className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
                            >
                                Quên mật khẩu?
                            </Link>
                        </div>
                    </div>

                    {/* Mật khẩu mới */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            Mật khẩu mới
                        </label>
                        <div className="relative">
                            <input
                                type={showNewPassword ? "text" : "password"}
                                name="matKhauMoi"
                                value={formData.matKhauMoi}
                                onChange={(e) => {
                                    handleInputChange(e);
                                    setErrors({ ...errors, newPass: "" });
                                }}
                                className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                                    errors.newPass ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                                }`}
                                placeholder="Nhập mật khẩu mới"
                            />
                            <button
                                type="button"
                                onClick={() => handleTogglePasswordVisibility("newPassword")}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                        {errors.newPass && (
                            <p className="text-sm text-red-600 flex items-center gap-1">
                                <AlertCircle className="w-4 h-4" />
                                {errors.newPass}
                            </p>
                        )}
                    </div>

                    {/* Xác nhận mật khẩu mới */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            Xác nhận mật khẩu mới
                        </label>
                        <div className="relative">
                            <input
                                type={showConfirmNewPassword ? "text" : "password"}
                                name="xacNhanMkMoi"
                                value={formData.xacNhanMkMoi}
                                onChange={(e) => {
                                    handleInputChange(e);
                                    setErrors({ ...errors, confirmPass: "" });
                                }}
                                className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                                    errors.confirmPass ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                                }`}
                                placeholder="Nhập lại mật khẩu mới"
                            />
                            <button
                                type="button"
                                onClick={() => handleTogglePasswordVisibility("confirmNewPassword")}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showConfirmNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                        {errors.confirmPass && (
                            <p className="text-sm text-red-600 flex items-center gap-1">
                                <AlertCircle className="w-4 h-4" />
                                {errors.confirmPass}
                            </p>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end pt-4 border-t border-gray-200">
                        <button
                            onClick={handleChangePassword}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors shadow-md hover:shadow-lg action-button"
                        >
                            <Save className="w-4 h-4" />
                            Đổi mật khẩu
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChangePassword;