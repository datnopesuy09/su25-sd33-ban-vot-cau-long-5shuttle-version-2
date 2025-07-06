import React, { useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Navigate, useNavigate } from "react-router-dom";
import swal from "sweetalert";
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Paper,
  Stack,
} from "@mui/material";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otp2, setOtp2] = useState("");
  const [matKhauMoi, setMatKhauMoi] = useState("");
  const [xacNhanMkMoi, setXacNhanMkMoi] = useState("");
  const [isRobot, setIsRobot] = useState(false);
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({
    email: "",
    otp: "",
    matKhauMoi: "",
    xacNhanMkMoi: "",
  });

  const checkMail = async (email) => {
    return email === "test@example.com";
  };

  const sendOtp = async (email) => {
    return {
      success: true,
      data: "123456",
    };
  };

  const handleSendOtp = async () => {
    if (!email) {
      setErrors({ ...errors, email: "*Bạn chưa nhập địa chỉ email" });
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrors({ ...errors, email: "*Địa chỉ email không hợp lệ" });
      return;
    }
    try {
      const isEmailValid = await checkMail(email);
      if (!isEmailValid) {
        toast.error("Email không tồn tại trong hệ thống");
        return;
      }
      const sendma = await sendOtp(email);
      if (sendma.success) {
        setOtp2(sendma.data);
        toast.info("Mã OTP đã được gửi đến email của bạn");
        setErrors({ ...errors, email: "" });
        setStep(2);
      } else {
        toast.error("Không thể gửi mã OTP");
      }
    } catch {
      toast.error("Đã có lỗi xảy ra. Vui lòng thử lại.");
    }
  };

  const navigate = useNavigate();

  const handleResetPassword = async () => {
    let hasError = false;
    const newErrors = {};

    if (!otp) {
      newErrors.otp = "*Bạn chưa nhập mã OTP";
      hasError = true;
    } else if (otp !== otp2) {
      newErrors.otp = "*Mã OTP không chính xác";
      hasError = true;
    }

    if (!matKhauMoi) {
      newErrors.matKhauMoi = "*Bạn chưa nhập mật khẩu mới";
      hasError = true;
    } else if (matKhauMoi.length < 6) {
      newErrors.matKhauMoi = "*Mật khẩu phải có ít nhất 6 ký tự";
      hasError = true;
    }

    if (!xacNhanMkMoi) {
      newErrors.xacNhanMkMoi = "*Bạn chưa xác nhận mật khẩu";
      hasError = true;
    } else if (matKhauMoi !== xacNhanMkMoi) {
      newErrors.xacNhanMkMoi = "*Mật khẩu và xác nhận mật khẩu không khớp";
      hasError = true;
    }

    if (hasError) {
      setErrors({ ...errors, ...newErrors });
      return;
    }

    if (!isRobot) {
      toast.error("Xác minh bạn không phải robot");
      return;
    }

    swal(
      "Thành công!",
      "Cập nhật mật khẩu thành công, đăng nhập ngay thôi!",
      "success"
    );
    toast.success("Cập nhật mật khẩu thành công!");
    setTimeout(() => {
      navigate("/login");
    }, 2000);
  };

  const token = localStorage.getItem("token");

  return token ? (
    <Navigate to="/home" />
  ) : (
    <Container maxWidth="xs">
      <Paper elevation={3} sx={{ mt: 8, px: 4, py: 5 }}>
        <Typography variant="h5" align="center" gutterBottom>
          Quên Mật Khẩu
        </Typography>
        {step === 1 && (
          <Stack spacing={3}>
            <TextField
              type="email"
              label="Nhập email"
              fullWidth
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (e.target.value) {
                  setErrors({ ...errors, email: "" });
                }
              }}
              error={Boolean(errors.email)}
              helperText={errors.email}
            />
            <Button
              variant="contained"
              color="primary"
              fullWidth
              sx={{
                textTransform: 'none',
                fontWeight: 'bold',
                boxShadow: 'none',
                '&:focus': {
                  outline: 'none',
                  boxShadow: 'none'
                },
                '&:focus-visible': {
                  outline: 'none',
                  boxShadow: 'none'
                }
              }}
              onClick={handleSendOtp}
            >
              Gửi Mã OTP
            </Button>
          </Stack>
        )}

        {step === 2 && (
          <Stack spacing={3}>
            <TextField
              label="Mã OTP"
              fullWidth
              value={otp}
              onChange={(e) => {
                setOtp(e.target.value);
                if (e.target.value) {
                  setErrors({ ...errors, otp: "" });
                }
              }}
              error={Boolean(errors.otp)}
              helperText={errors.otp}
            />
            <TextField
              label="Mật khẩu mới"
              type="password"
              fullWidth
              value={matKhauMoi}
              onChange={(e) => {
                setMatKhauMoi(e.target.value);
                if (e.target.value) {
                  setErrors({ ...errors, matKhauMoi: "" });
                }
              }}
              error={Boolean(errors.matKhauMoi)}
              helperText={errors.matKhauMoi}
            />
            <TextField
              label="Xác nhận mật khẩu"
              type="password"
              fullWidth
              value={xacNhanMkMoi}
              onChange={(e) => {
                setXacNhanMkMoi(e.target.value);
                if (e.target.value) {
                  setErrors({ ...errors, xacNhanMkMoi: "" });
                }
              }}
              error={Boolean(errors.xacNhanMkMoi)}
              helperText={errors.xacNhanMkMoi}
            />
            <Box sx={{ width: '100%' }}>
              <ReCAPTCHA
                sitekey="6Lf3KwwpAAAAAJriNTbY4LqBvuI1aiRzTNb14cVd"
                onChange={() => setIsRobot(true)}
              />
            </Box>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              sx={{
                textTransform: 'none',
                fontWeight: 'bold',
                boxShadow: 'none',
                '&:focus': {
                  outline: 'none',
                  boxShadow: 'none'
                },
                '&:focus-visible': {
                  outline: 'none',
                  boxShadow: 'none'
                }
              }}
              onClick={handleResetPassword}
            >
              Đặt Lại Mật Khẩu
            </Button>
          </Stack>
        )}
        <ToastContainer />
      </Paper>
    </Container>
  );
};

export default ForgotPassword;