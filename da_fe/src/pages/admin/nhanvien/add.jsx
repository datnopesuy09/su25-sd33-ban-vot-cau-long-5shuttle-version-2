import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Button,
    TextField,
    Radio,
    RadioGroup,
    FormControlLabel,
    FormControl,
    FormLabel,
    Box,
    Avatar,
    Paper,
} from "@mui/material";

function AddStaff() {
    const navigate = useNavigate();
    const [staff, setStaff] = useState({
        hoTen: "",
        email: "",
        matKhau: "",
        sdt: "",
        gioiTinh: "",
        ngaySinh: "",
        avatar: "",
        cccd: "",
        trangThai: 1,
        vaiTro: "Nhân viên",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setStaff((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async () => {
        try {
            const formData = new FormData();

            formData.append("hoTen", staff.hoTen)
            formData.append("email", staff.email)
            formData.append("matKhau", staff.matKhau)
            formData.append("sdt", staff.sdt)
            formData.append("gioiTinh", parseInt(staff.gioiTinh))
            formData.append("ngaySinh", staff.ngaySinh)
            formData.append("cccd", staff.cccd)
            formData.append("trangThai", staff.trangThai)
            formData.append("vaiTro", staff.vaiTro === "Nhân viên" ? 1 : 0) // convert nếu cần

            const avatarFile = document.getElementById("avatar-upload").files[0]
            if (avatarFile) {
                formData.append("avatar", avatarFile) // gửi file avatar
            }

            const res = await fetch("http://localhost:8080/nhan-vien/add", {
                method: "POST",
                body: formData
            });

            if (!res.ok) throw new Error("Không thành công")
            // const data = await res.json()
            alert("Thêm thành công")
            navigate('/admin/tai-khoan/nhan-vien')
        } catch (error) {
            alert(error.message);
        }
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setStaff(prev => ({
                ...prev,
                avatar: URL.createObjectURL(file)
            }));
        }
    }

    return (
        <Box sx={{ px: 2, py: 2 }}>
            <Paper elevation={3} sx={{ p: 3, maxWidth: "100%" }}>
                <Box sx={{ display: "flex", flexDirection: "column" }}>
                    <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 3 }}>
                        {/* Cột trái */}
                        <Box sx={{ flex: 1 }}>
                            <h2 className="text-xl font-semibold text-gray-800 mb-3">Thông tin nhân viên</h2>
                            <hr />
                            <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                                <input
                                    type="file"
                                    accept="image/*"
                                    style={{ display: "none" }}
                                    id="avatar-upload"
                                    onChange={handleAvatarChange}
                                />
                                <label htmlFor="avatar-upload">
                                    <Avatar
                                        src={staff.avatar}
                                        sx={{ width: 100, height: 100, cursor: "pointer", mb: 2 }}
                                    />
                                </label>
                            </Box>
                            <TextField
                                label="Họ tên"
                                variant="filled"
                                fullWidth
                                size="small"
                                sx={{ mt: 2 }}
                                name="hoTen"
                                value={staff.hoTen}
                                onChange={handleChange}
                            />
                        </Box>
                        <Box sx={{ flex: 2 }}>
                            <h2 className="text-xl font-semibold text-gray-800 mb-3">Thông tin chi tiết</h2>
                            <hr />
                            <Box
                                sx={{
                                    display: "grid",
                                    gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                                    gap: 2,
                                    mt: 2,
                                }}
                            >
                                <TextField label="CCCD" size="small" fullWidth variant="filled"
                                    name="cccd"
                                    value={staff.cccd}
                                    onChange={handleChange} />
                                <FormControl
                                    fullWidth
                                    sx={{
                                        display: "flex",
                                        justifyContent: "center",
                                        height: '56px', // = TextField filled default height
                                        px: 1,
                                        py: 0.5,
                                        boxSizing: 'border-box',

                                    }}
                                >
                                    <FormLabel sx={{ fontSize: 14, mb: 0.5 }}>Giới tính</FormLabel>
                                    <RadioGroup row name="gioiTinh" value={staff.gioiTinh} onChange={handleChange}>
                                        <FormControlLabel value={0} control={<Radio size="small" />} label="Nam" />
                                        <FormControlLabel value={1} control={<Radio size="small" />} label="Nữ" />
                                    </RadioGroup>
                                </FormControl>

                                <TextField label="Email" variant="filled" size="small" fullWidth name="email"
                                    value={staff.email}
                                    onChange={handleChange} />
                                <TextField label="Số điện thoại" variant="filled" size="small" fullWidth name="sdt"
                                    value={staff.sdt}
                                    onChange={handleChange} />
                                <TextField
                                    label="Ngày sinh"
                                    type="date"
                                    variant="filled"
                                    fullWidth
                                    size="small"
                                    sx={{ mt: 1 }}
                                    InputLabelProps={{ shrink: true }}
                                    name="ngaySinh"
                                    value={staff.ngaySinh}
                                    onChange={handleChange}
                                />
                                {/* <TextField label="Địa chỉ" variant="filled" fullWidth size="small" sx={{ mt: 1 }} name="diaChi"
                                    value={staff.diaChi}
                                    onChange={handleChange}
                                /> */}
                            </Box>
                        </Box>
                    </Box>

                    <Box mt={4} display="flex" justifyContent="flex-end">
                        <Button variant="contained" onClick={handleSubmit}>Thêm nhân viên</Button>
                    </Box>
                </Box>
            </Paper>
        </Box>
    );
}

export default AddStaff;