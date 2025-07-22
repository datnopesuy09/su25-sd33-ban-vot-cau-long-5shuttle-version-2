import React, { useState } from "react";
import {
    Box,
    Input,
    InputLabel,
    InputAdornment,
    FormControl,
    IconButton,
    Button,
    Typography,
    Link,
    Paper
} from '@mui/material';
import AccountCircle from '@mui/icons-material/AccountCircle';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Lock from '@mui/icons-material/Lock';
import { useLocation, useNavigate } from "react-router-dom";
import { useUserAuth } from "../../../contexts/userAuthContext";
import axios from 'axios';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

const LoginPanel = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [matKhau, setMatKhau] = useState('');
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || "/";
    const { fetchUserInfo } = useUserAuth();

    const handleClickShowPassword = () => setShowPassword((show) => !show);

    const handleLogin = async () => {
        const newErrors = {};

        if (!email.trim()) newErrors.email = '*Bạn chưa nhập email';
        if (!matKhau) newErrors.matKhau = '*Bạn chưa nhập mật khẩu';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            const res = await axios.post("http://localhost:8080/auth/token", {
                email,
                matKhau
            });

            const accessToken = res.data?.result?.token;
            if (!accessToken) throw new Error("Không nhận được token");

            const introspectRes = await axios.post("http://localhost:8080/auth/introspect", {
                token: accessToken
            });

            const roles = introspectRes.data?.result?.roles || [];
            if (!roles.includes("ROLE_USER")) {
                toast.error("Tài khoản không có quyền truy cập trang người dùng!");
                return;
            }

            localStorage.setItem("userToken", accessToken);
            await fetchUserInfo(accessToken);
            toast.success("Đăng nhập thành công!");
            navigate(from);

        } catch (err) {
            console.error("Đăng nhập lỗi:", err);
            const message = "*Email hoặc mật khẩu không chính xác";
            setErrors({ email: message, matKhau: message });
            // toast.error(message);
        }
    };

    return (
        <>
            <FormControl variant="standard" fullWidth sx={{ mb: 2 }} error={!!errors.email}>
                <InputLabel htmlFor="email">Email</InputLabel>
                <Input
                    id="email"
                    value={email}
                    onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
                    }}
                    startAdornment={
                        <InputAdornment position="start">
                            <AccountCircle />
                        </InputAdornment>
                    }
                />
                {errors.email && <Typography variant="caption" color="error">{errors.email}</Typography>}
            </FormControl>

            <FormControl variant="standard" fullWidth sx={{ mb: 1 }} error={!!errors.matKhau}>
                <InputLabel htmlFor="password">Mật khẩu</InputLabel>
                <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={matKhau}
                    onChange={(e) => {
                        setMatKhau(e.target.value);
                        if (errors.matKhau) setErrors(prev => ({ ...prev, matKhau: '' }));
                    }}
                    startAdornment={
                        <InputAdornment position="start">
                            <Lock />
                        </InputAdornment>
                    }
                    endAdornment={
                        <InputAdornment position="end">
                            <IconButton
                                onClick={handleClickShowPassword}
                                disableRipple
                                sx={{ outline: 'none', '&:focus': { outline: 'none' } }}
                            >
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                        </InputAdornment>
                    }
                />
                {errors.matKhau && <Typography variant="caption" color="error">{errors.matKhau}</Typography>}
            </FormControl>

            <Box display="flex" justifyContent="flex-end" mb={3}>
                <Link href="/forgot-password" underline="hover" fontSize="0.9rem">
                    Quên mật khẩu?
                </Link>
            </Box>

            <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={handleLogin}
                sx={{ textTransform: 'none', fontWeight: 'bold' }}
            >
                Đăng nhập
            </Button>
        </>
    );
};

const RegisterPanel = ({ setIsLogin }) => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errors, setErrors] = useState({});

    const handleTogglePassword = () => setShowPassword((prev) => !prev);
    const handleToggleConfirmPassword = () => setShowConfirmPassword((prev) => !prev);

    const checkMail = async (email) => {
        try {
            const response = await axios.get(`http://localhost:8080/users/check-email?email=${email}`);
            return response.data?.result === true;
        } catch (error) {
            console.error("Lỗi khi kiểm tra email:", error);
            return false;
        }
    };

    const isValidEmail = (email) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    };

    const handleRegister = async () => {
        const newErrors = {};

        if (!name.trim()) newErrors.name = '*Bạn chưa nhập họ tên';
        else if (name.length > 100) newErrors.name = '*Họ tên không dài quá 100 ký tự';

        if (!email.trim()) newErrors.email = '*Bạn chưa nhập email';
        else if (!isValidEmail(email)) newErrors.email = '*Địa chỉ email không hợp lệ';

        if (!password) newErrors.password = '*Bạn chưa nhập mật khẩu';
        else if (password.length < 6) newErrors.password = '*Mật khẩu phải có ít nhất 6 ký tự';

        if (!confirmPassword) newErrors.confirmPassword = '*Bạn chưa nhập lại mật khẩu';
        else if (confirmPassword !== password) newErrors.confirmPassword = '*Mật khẩu xác nhận không khớp';

        const emailExists = await checkMail(email);
        if (emailExists) newErrors.email = '*Email đã được sử dụng';

        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) return;

        const result = await Swal.fire({
            title: 'Xác nhận đăng ký',
            text: 'Bạn có chắc muốn tạo tài khoản không?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Đăng ký',
            cancelButtonText: 'Hủy',
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33'
        });

        if (!result.isConfirmed) return;

        try {
            const res = await axios.post("http://localhost:8080/users", {
                hoTen: name,
                email: email,
                matKhau: password
            });

            if (res.data?.result) {
                toast.success("Đăng ký thành công! Bạn có thể đăng nhập ngay.");
                setName('');
                setEmail('');
                setPassword('');
                setConfirmPassword('');
                setTimeout(() => setIsLogin(true), 1500);
            }

        } catch (err) {
            console.error("Đăng ký lỗi:", err);
            const message = err.response?.data?.message || "Có lỗi xảy ra khi đăng ký.";
            toast.error(message);
        }
    };

    return (
        <>
            <FormControl variant="standard" fullWidth sx={{ mb: 2 }} error={!!errors.name}>
                <InputLabel htmlFor="name">Họ tên</InputLabel>
                <Input
                    id="name"
                    value={name}
                    onChange={(e) => {
                        setName(e.target.value);
                        if (errors.name) setErrors(prev => ({ ...prev, name: '' }));
                    }}
                    startAdornment={
                        <InputAdornment position="start">
                            <AccountCircle />
                        </InputAdornment>
                    }
                />
                {errors.name && <Typography variant="caption" color="error">{errors.name}</Typography>}
            </FormControl>

            <FormControl variant="standard" fullWidth sx={{ mb: 2 }} error={!!errors.email}>
                <InputLabel htmlFor="email">Email</InputLabel>
                <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
                    }}
                    startAdornment={
                        <InputAdornment position="start">
                            <AccountCircle />
                        </InputAdornment>
                    }
                />
                {errors.email && <Typography variant="caption" color="error">{errors.email}</Typography>}
            </FormControl>

            <FormControl variant="standard" fullWidth sx={{ mb: 2 }} error={!!errors.password}>
                <InputLabel htmlFor="password">Mật khẩu</InputLabel>
                <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                        setPassword(e.target.value);
                        if (errors.password) setErrors(prev => ({ ...prev, password: '' }));
                    }}
                    startAdornment={
                        <InputAdornment position="start">
                            <Lock />
                        </InputAdornment>
                    }
                    endAdornment={
                        <InputAdornment position="end">
                            <IconButton onClick={handleTogglePassword} disableRipple>
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                        </InputAdornment>
                    }
                />
                {errors.password && <Typography variant="caption" color="error">{errors.password}</Typography>}
            </FormControl>

            <FormControl variant="standard" fullWidth sx={{ mb: 3 }} error={!!errors.confirmPassword}>
                <InputLabel htmlFor="confirm-password">Xác nhận mật khẩu</InputLabel>
                <Input
                    id="confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: '' }));
                    }}
                    startAdornment={
                        <InputAdornment position="start">
                            <Lock />
                        </InputAdornment>
                    }
                    endAdornment={
                        <InputAdornment position="end">
                            <IconButton onClick={handleToggleConfirmPassword} disableRipple>
                                {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                        </InputAdornment>
                    }
                />
                {errors.confirmPassword && <Typography variant="caption" color="error">{errors.confirmPassword}</Typography>}
            </FormControl>

            <Button
                variant="contained"
                color="primary"
                fullWidth
                sx={{ textTransform: 'none', fontWeight: 'bold' }}
                onClick={handleRegister}
            >
                Đăng ký
            </Button>
        </>
    );
};

function Sign() {
    const [isLogin, setIsLogin] = useState(true);

    const switchToRegister = () => setIsLogin(false);
    const switchToLogin = () => setIsLogin(true);

    return (
        <Box
            sx={{
                height: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#f5f5f5",
            }}
        >
            <Paper elevation={3} sx={{ width: 500, p: 4, borderRadius: 1 }}>
                {/* Tiêu đề */}
                <div className="mb-2 text-2xl font-semibold uppercase text-center">
                    {isLogin ? "Đăng nhập" : "Đăng ký"}
                </div>

                {/* Chuyển đổi giữa 2 panel */}
                <div className="mb-4 text-center">
                    {isLogin ? (
                        <p className="text-base font-normal text-gray-700">
                            Bạn chưa có tài khoản?{" "}
                            <span
                                className="text-blue-600 hover:text-blue-700 cursor-pointer font-normal"
                                onClick={switchToRegister}
                            >
                                Đăng ký ngay
                            </span>
                        </p>
                    ) : (
                        <p className="text-base font-normal text-gray-700">
                            Đã có tài khoản, đăng nhập{" "}
                            <span
                                onClick={switchToLogin}
                                className="text-blue-600 hover:text-blue-700 cursor-pointer font-normal"
                            >
                                tại đây
                            </span>
                        </p>
                    )}
                </div>

                {/* Panel */}
                {isLogin ? <LoginPanel /> : <RegisterPanel setIsLogin={setIsLogin} />}
            </Paper>
        </Box>
    );
}

export default Sign;