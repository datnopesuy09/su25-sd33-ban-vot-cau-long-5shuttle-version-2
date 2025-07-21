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
import { Visibility, VisibilityOff } from "@mui/icons-material";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

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
        <Container maxWidth="sm">
            <Box elevation={3} sx={{ p: 4 }}>
                <Typography variant="h5" fontWeight={600} gutterBottom>
                    Đổi mật khẩu
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={3}>
                    Để bảo mật tài khoản, vui lòng không chia sẻ mật khẩu cho người khác
                </Typography>

                <Box display="flex" flexDirection="column" gap={3}>
                    {/* Mật khẩu hiện tại */}
                    <TextField
                        label="Mật khẩu hiện tại"
                        type={showCurrentPassword ? "text" : "password"}
                        name="matKhau"
                        value={formData.matKhau}
                        onChange={(e) => {
                            handleInputChange(e);
                            setErrors({ ...errors, oldPass: "" });
                        }}
                        error={Boolean(errors.oldPass)}
                        helperText={errors.oldPass}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        onClick={() =>
                                            handleTogglePasswordVisibility("currentPassword")
                                        }
                                    >
                                        {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            )
                        }}
                        fullWidth
                    />

                    {/* Quên mật khẩu */}
                    <Link href="/forgot-password" underline="hover"  fontSize="0.9rem" sx={{ ml: "auto", my: "-10px" }}>
                        Quên mật khẩu?
                    </Link>

                    {/* Mật khẩu mới */}
                    <TextField
                        label="Mật khẩu mới"
                        type={showNewPassword ? "text" : "password"}
                        name="matKhauMoi"
                        value={formData.matKhauMoi}
                        onChange={(e) => {
                            handleInputChange(e);
                            setErrors({ ...errors, newPass: "" });
                        }}
                        error={Boolean(errors.newPass)}
                        helperText={errors.newPass}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        onClick={() =>
                                            handleTogglePasswordVisibility("newPassword")
                                        }
                                    >
                                        {showNewPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            )
                        }}
                        fullWidth
                    />

                    {/* Nhập lại mật khẩu */}
                    <TextField
                        label="Xác nhận mật khẩu mới"
                        type={showConfirmNewPassword ? "text" : "password"}
                        name="xacNhanMkMoi"
                        value={formData.xacNhanMkMoi}
                        onChange={(e) => {
                            handleInputChange(e);
                            setErrors({ ...errors, confirmPass: "" });
                        }}
                        error={Boolean(errors.confirmPass)}
                        helperText={errors.confirmPass}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        onClick={() =>
                                            handleTogglePasswordVisibility("confirmNewPassword")
                                        }
                                    >
                                        {showConfirmNewPassword ? (
                                            <VisibilityOff />
                                        ) : (
                                            <Visibility />
                                        )}
                                    </IconButton>
                                </InputAdornment>
                            )
                        }}
                        fullWidth
                    />

                    {/* Nút đổi mật khẩu */}
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleChangePassword}
                        sx={{ mt: 2 }}
                    >
                        Đổi mật khẩu
                    </Button>
                </Box>
            </Box>
        </Container>
    );
};

export default ChangePassword;