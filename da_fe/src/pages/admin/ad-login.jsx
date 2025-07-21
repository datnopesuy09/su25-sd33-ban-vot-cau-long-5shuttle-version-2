import {
    Box,
    Paper,
    TextField,
    InputAdornment,
    IconButton,
    Button
} from "@mui/material";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import LockOutlineIcon from '@mui/icons-material/LockOutlined';
import shuttlecockImg from '../../components/Assets/closeup-shuttlecock.jpg';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAdminAuth } from "../../contexts/adminAuthContext";

function AdLogin() {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [matKhau, setMatKhau] = useState("");
    const { fetchAdminInfo } = useAdminAuth()
    const navigate = useNavigate();

    const handleClickShowPassword = () => setShowPassword((show) => !show);
    const handleMouseDownPassword = (event) => event.preventDefault();

    const from = location.state?.from?.pathname || "/admin";

    const [errors, setErrors] = useState({
        email: '',
        matKhau: ''
    });

    const validateForm = () => {
        const newErrors = {};

        if (!email.trim()) {
            newErrors.email = 'Bạn chưa nhập email';
        }

        if (!matKhau) {
            newErrors.matKhau = 'Bạn chưa nhập mật khẩu';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleLogin = async () => {
        if (!validateForm()) return;

        try {
            const res = await fetch("http://localhost:8080/auth/token", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, matKhau })
            });

            if (!res.ok) throw new Error("Đăng nhập thất bại");

            const data = await res.json();
            const accessToken = data?.result?.token;
            if (!accessToken) throw new Error("Không nhận được token");

            const introspectRes = await fetch("http://localhost:8080/auth/introspect", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token: accessToken })
            });

            const introspectData = await introspectRes.json();
            const roles = introspectData?.result?.roles || [];
            const allowedRoles = ["ROLE_ADMIN", "ROLE_STAFF"];
            const isAllowed = roles.some(role => allowedRoles.includes(role));

            if (!isAllowed) {
                toast.error("Tài khoản không có quyền truy cập trang quản trị!");
                return;
            }

            localStorage.setItem("adminToken", accessToken);
            await fetchAdminInfo(accessToken);
            toast.success("Đăng nhập thành công!");
            navigate(from);
        } catch (err) {
            console.error("Lỗi đăng nhập:", err);
            toast.error("Email hoặc mật khẩu không chính xác!");
        }
    };

    return (
        <Box
            sx={{
                height: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
            }}
        >
            <Paper elevation={6} sx={{ width: 500, p: 5, borderRadius: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                    <img
                        src={shuttlecockImg}
                        alt="Logo đăng nhập"
                        style={{ height: 80 }}
                    />
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'flex-end', mb: 3 }}>
                    <AccountCircleOutlinedIcon sx={{ color: 'action.active', mr: 1, my: 0.5 }} />
                    <TextField
                        fullWidth
                        label="Email"
                        variant="standard"
                        value={email}
                        onChange={(e) => {
                            setEmail(e.target.value);
                            setErrors(prev => ({ ...prev, email: '' }));
                        }}
                        error={!!errors.email}
                        helperText={errors.email}
                    />
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'flex-end', mb: 4 }}>
                    <LockOutlineIcon sx={{ color: 'action.active', mr: 1, my: 0.5 }} />
                    <TextField
                        fullWidth
                        label="Mật khẩu"
                        variant="standard"
                        type={showPassword ? 'text' : 'password'}
                        value={matKhau}
                        onChange={(e) => {
                            setMatKhau(e.target.value);
                            setErrors(prev => ({ ...prev, matKhau: '' }));
                        }}
                        error={!!errors.matKhau}
                        helperText={errors.matKhau}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                                        onClick={handleClickShowPassword}
                                        onMouseDown={handleMouseDownPassword}
                                    >
                                        {showPassword ? <VisibilityOffOutlinedIcon /> : <VisibilityOutlinedIcon />}
                                    </IconButton>
                                </InputAdornment>
                            )
                        }}
                    />
                </Box>

                <Button
                    variant="contained"
                    fullWidth
                    onClick={handleLogin}
                    sx={{
                        borderRadius: 2,
                        py: 1,
                        backgroundColor: '#212121',
                        '&:hover': {
                            backgroundColor: '#212121',
                        }
                    }}
                >
                    Đăng nhập
                </Button>
            </Paper>
        </Box>
    );
}

export default AdLogin;