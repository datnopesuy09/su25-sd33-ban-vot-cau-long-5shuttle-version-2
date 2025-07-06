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

const LoginPanel = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleClickShowPassword = () => setShowPassword((show) => !show);

    return (
        <>
            <FormControl variant="standard" fullWidth sx={{ mb: 2 }}>
                <InputLabel htmlFor="email">Email</InputLabel>
                <Input
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    startAdornment={
                        <InputAdornment position="start">
                            <AccountCircle />
                        </InputAdornment>
                    }
                />
            </FormControl>

            <FormControl variant="standard" fullWidth sx={{ mb: 1 }}>
                <InputLabel htmlFor="password">Password</InputLabel>
                <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
            </FormControl>

            <Box display="flex" justifyContent="flex-end" mb={3}>
                <Link href="#" underline="hover" fontSize="0.9rem">
                    Quên mật khẩu?
                </Link>
            </Box>

            <Button
                variant="contained"
                color="primary"
                fullWidth
                sx={{ textTransform: 'none', fontWeight: 'bold' }}
            >
                Đăng nhập
            </Button>
        </>
    );
};

const RegisterPanel = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleTogglePassword = () => setShowPassword((prev) => !prev);
    const handleToggleConfirmPassword = () => setShowConfirmPassword((prev) => !prev);

    const handleRegister = async () => {
        setError('');
        setSuccess('');

        if (password !== confirmPassword) {
            setError("Mật khẩu xác nhận không khớp");
            return;
        }

        try {
            const response = await fetch("http://localhost:8080/shuttle/users", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    hoTen: name,
                    email: email,
                    matKhau: password
                })
            });

            const data = await response.json();

            if (!response.ok || !data.result) {
                throw new Error(data.message || "Đăng ký thất bại");
            }

            setSuccess("Đăng ký thành công! Bạn có thể đăng nhập ngay.");
            setName('');
            setEmail('');
            setPassword('');
            setConfirmPassword('');
        } catch (err) {
            console.error("Đăng ký lỗi:", err);
            setError(err.message || "Có lỗi xảy ra khi đăng ký.");
        }
    };

    return (
        <>
            <FormControl variant="standard" fullWidth sx={{ mb: 2 }}>
                <InputLabel htmlFor="name">Họ tên</InputLabel>
                <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    startAdornment={
                        <InputAdornment position="start">
                            <AccountCircle />
                        </InputAdornment>
                    }
                />
            </FormControl>

            <FormControl variant="standard" fullWidth sx={{ mb: 2 }}>
                <InputLabel htmlFor="email">Email</InputLabel>
                <Input
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    startAdornment={
                        <InputAdornment position="start">
                            <AccountCircle />
                        </InputAdornment>
                    }
                />
            </FormControl>

            <FormControl variant="standard" fullWidth sx={{ mb: 2 }}>
                <InputLabel htmlFor="password">Mật khẩu</InputLabel>
                <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    startAdornment={
                        <InputAdornment position="start">
                            <Lock />
                        </InputAdornment>
                    }
                    endAdornment={
                        <InputAdornment position="end">
                            <IconButton
                                onClick={handleTogglePassword}
                                disableRipple
                            >
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                        </InputAdornment>
                    }
                />
            </FormControl>

            <FormControl variant="standard" fullWidth sx={{ mb: 3 }}>
                <InputLabel htmlFor="confirm-password">Xác nhận mật khẩu</InputLabel>
                <Input
                    id="confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    startAdornment={
                        <InputAdornment position="start">
                            <Lock />
                        </InputAdornment>
                    }
                    endAdornment={
                        <InputAdornment position="end">
                            <IconButton
                                onClick={handleToggleConfirmPassword}
                                disableRipple
                            >
                                {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                        </InputAdornment>
                    }
                />
            </FormControl>

            {error && (
                <Typography color="error" fontSize="0.9rem" mb={1}>
                    {error}
                </Typography>
            )}

            {success && (
                <Typography color="primary" fontSize="0.9rem" mb={1}>
                    {success}
                </Typography>
            )}

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
                {isLogin ? <LoginPanel /> : <RegisterPanel />}
            </Paper>
        </Box>
    );
}

export default Sign;