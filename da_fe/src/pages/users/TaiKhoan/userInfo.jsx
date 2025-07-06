import React, { useEffect, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Grid,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  TextField,
  Typography,
  Paper,
  Container,
  Divider,
} from "@mui/material";
import Swal from "sweetalert2";
import axios from "axios";

export default function UserInfo() {
  const [previewImage, setPreviewImage] = useState(null);
  const [khachHang, setKhachHang] = useState({
    id: 1,
    hoTen: "",
    email: "",
    sdt: "",
    ngaySinh: "",
    gioiTinh: 0,
    avatar: "",
  });

  const [errorsKH, setErrorsKH] = useState({
    fullName: "",
    phoneNumber: "",
    dateBirth: "",
    gender: "",
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.get("http://localhost:8080/api/tai-khoan/my-info", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).then((res) => {
        setKhachHang(res.data);
        setPreviewImage(res.data.avatar);
      }).catch((error) => {
        Swal.fire("Lỗi", "Không thể tải thông tin người dùng", "error");
      });
    }
  }, []);

  const handleInputChange = (event) => {
    setKhachHang({ ...khachHang, [event.target.name]: event.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setKhachHang({ ...khachHang, avatar: file });
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateCustomer = async (event) => {
    event.preventDefault();
    const newErrors = {};
    let check = 0;
    const currentDate = new Date();
    const minBirthYear = 1900;
    const cleanedFullName = khachHang.hoTen.trim();

    if (!cleanedFullName) {
      newErrors.fullName = "*Bạn chưa nhập họ tên";
      check++;
    } else if (cleanedFullName.length > 100) {
      newErrors.fullName = "*Họ tên không dài quá 100 ký tự";
      check++;
    } else if (/[!@#$%^&*(),.?":{}|<>]/.test(cleanedFullName)) {
      newErrors.fullName = "*Họ tên không chứa ký tự đặc biệt";
      check++;
    }

    if (!khachHang.sdt.trim()) {
      newErrors.phoneNumber = "*Bạn chưa nhập số điện thoại";
      check++;
    } else if (!/^(0[1-9][0-9]{8})$/.test(khachHang.sdt.trim())) {
      newErrors.phoneNumber = "*Số điện thoại không hợp lệ";
      check++;
    }

    if (!khachHang.ngaySinh) {
      newErrors.dateBirth = "*Bạn chưa nhập ngày sinh";
      check++;
    } else {
      const ngaySinh = new Date(khachHang.ngaySinh);
      if (isNaN(ngaySinh.getTime())) {
        newErrors.dateBirth = "*Ngày sinh không hợp lệ";
        check++;
      } else if (ngaySinh.getFullYear() < minBirthYear) {
        newErrors.dateBirth = "*Năm sinh không hợp lệ";
        check++;
      } else if (ngaySinh > currentDate) {
        newErrors.dateBirth = "*Ngày sinh không được lớn hơn ngày hiện tại";
        check++;
      }
    }

    if (khachHang.gioiTinh === null) {
      newErrors.gender = "*Bạn chưa chọn giới tính";
      check++;
    }

    if (check > 0) {
      setErrorsKH(newErrors);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("hoTen", khachHang.hoTen);
      formData.append("email", khachHang.email);
      formData.append("sdt", khachHang.sdt);
      formData.append("ngaySinh", khachHang.ngaySinh);
      formData.append("gioiTinh", khachHang.gioiTinh);
      if (khachHang.avatar instanceof File) {
        formData.append("avatar", khachHang.avatar);
      }

      await axios.put(`http://localhost:8080/api/tai-khoan/updateTaiKhoan/${khachHang.id}`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      Swal.fire("Thành công", "Cập nhật tài khoản thành công!", "success");
    } catch (error) {
      Swal.fire("Lỗi", "Có lỗi xảy ra khi cập nhật tài khoản!", "error");
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 5 }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Hồ sơ của tôi
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Quản lý thông tin hồ sơ tài khoản
      </Typography>
      <Divider sx={{ my: 3 }} />

      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Box component="form" noValidate autoComplete="off" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Tên khách hàng"
              name="hoTen"
              fullWidth
              value={khachHang.hoTen}
              onChange={(e) => {
                handleInputChange(e);
                setErrorsKH({ ...errorsKH, fullName: "" });
              }}
              error={!!errorsKH.fullName}
              helperText={errorsKH.fullName}
            />
            <TextField
              label="Email"
              value={khachHang.email}
              fullWidth
              disabled
            />
            <TextField
              label="Số điện thoại"
              name="sdt"
              fullWidth
              value={khachHang.sdt}
              onChange={(e) => {
                handleInputChange(e);
                setErrorsKH({ ...errorsKH, phoneNumber: "" });
              }}
              error={!!errorsKH.phoneNumber}
              helperText={errorsKH.phoneNumber}
            />
            <TextField
              type="date"
              label="Ngày sinh"
              name="ngaySinh"
              InputLabelProps={{ shrink: true }}
              fullWidth
              value={khachHang.ngaySinh}
              onChange={(e) => {
                handleInputChange(e);
                setErrorsKH({ ...errorsKH, dateBirth: "" });
              }}
              error={!!errorsKH.dateBirth}
              helperText={errorsKH.dateBirth}
            />
            <FormControl error={!!errorsKH.gender}>
              <FormLabel>Giới tính</FormLabel>
              <RadioGroup
                row
                name="gioiTinh"
                value={khachHang.gioiTinh}
                onChange={(e) => {
                  setKhachHang({ ...khachHang, gioiTinh: parseInt(e.target.value) });
                  setErrorsKH({ ...errorsKH, gender: "" });
                }}
              >
                <FormControlLabel value={0} control={<Radio />} label="Nam" />
                <FormControlLabel value={1} control={<Radio />} label="Nữ" />
              </RadioGroup>
              {errorsKH.gender && (
                <Typography variant="caption" color="error">
                  {errorsKH.gender}
                </Typography>
              )}
            </FormControl>

            <Button
              variant="contained"
              color="primary"
              onClick={handleUpdateCustomer}
              sx={{ mt: 2, alignSelf: "flex-start" }}
            >
              Lưu
            </Button>
          </Box>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 3, textAlign: "center" }}>
            <label htmlFor="avatar-upload">
              <input
                hidden
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
              <Avatar
                src={previewImage}
                sx={{ width: 128, height: 128, margin: "auto", cursor: "pointer" }}
              />
            </label>
            <Button
              variant="outlined"
              sx={{ mt: 2 }}
              onClick={() => document.getElementById("avatar-upload").click()}
            >
              Chọn ảnh
            </Button>
            <Typography variant="caption" display="block" mt={1}>
              Dung lượng tối đa 1 MB
            </Typography>
            <Typography variant="caption" display="block">
              Định dạng: JPEG, PNG
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}