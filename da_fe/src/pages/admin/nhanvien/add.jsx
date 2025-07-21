import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
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
    Divider,
    Typography,
    Grid,
    Autocomplete,
    Paper,
} from "@mui/material";
import Swal from "sweetalert2";
import { toast } from "react-toastify";

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
        tinh: "",
        huyen: "",
        xa: "",
        diaChiCuThe: ""
    });

    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);
    const [selectedProvince, setSelectedProvince] = useState(null);
    const [selectedDistrict, setSelectedDistrict] = useState(null);
    const [selectedWard, setSelectedWard] = useState(null);

    const fetchProvinces = async () => {
        try {
            const response = await fetch("https://online-gateway.ghn.vn/shiip/public-api/master-data/province", {
                headers: { Token: "04ae91c9-b3a5-11ef-b074-aece61c107bd" }
            });
            const data = await response.json();
            if (data && data.data) setProvinces(data.data);
        } catch (error) {
            Swal.fire("Lỗi!", "Không thể tải tỉnh/thành", "error");
        }
    };

    const fetchDistricts = async (provinceId) => {
        try {
            const response = await fetch(
                `https://online-gateway.ghn.vn/shiip/public-api/master-data/district?province_id=${provinceId}`,
                { headers: { Token: "04ae91c9-b3a5-11ef-b074-aece61c107bd" } }
            );
            const data = await response.json();
            if (data && data.data) setDistricts(data.data);
        } catch (error) {
            console.error("Lỗi tải huyện:", error);
        }
    };

    const fetchWards = async (districtId) => {
        try {
            const response = await fetch(
                `https://online-gateway.ghn.vn/shiip/public-api/master-data/ward?district_id=${districtId}`,
                { headers: { Token: "04ae91c9-b3a5-11ef-b074-aece61c107bd" } }
            );
            const data = await response.json();
            if (data && data.data) setWards(data.data);
        } catch (error) {
            console.error("Lỗi tải xã:", error);
        }
    };

    useEffect(() => {
        fetchProvinces();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setStaff((prev) => ({ ...prev, [name]: value }));
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setStaff(prev => ({
                ...prev,
                avatar: URL.createObjectURL(file)
            }));
        }
    };

    const handleSubmit = async () => {
        const result = await Swal.fire({
            title: 'Xác nhận thêm nhân viên?',
            text: "Bạn có chắc muốn thêm nhân viên mới không?",
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Thêm',
            cancelButtonText: 'Hủy',
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
        });

        if (!result.isConfirmed) return;

        try {
            const formData = new FormData();
            formData.append("hoTen", staff.hoTen);
            formData.append("email", staff.email);
            formData.append("matKhau", staff.matKhau);
            formData.append("sdt", staff.sdt);
            formData.append("gioiTinh", parseInt(staff.gioiTinh));
            formData.append("ngaySinh", staff.ngaySinh);
            formData.append("cccd", staff.cccd);

            const avatarFile = document.getElementById("avatar-upload").files[0];
            if (avatarFile) {
                formData.append("avatar", avatarFile);
            }

            const res = await fetch("http://localhost:8080/nhan-vien", {
                method: "POST",
                body: formData
            });

            if (!res.ok) throw new Error("Không thể thêm nhân viên");

            toast.success("Thêm nhân viên thành công!");
            navigate('/admin/tai-khoan/nhan-vien');
        } catch (error) {
            console.error(error);
            toast.error("Thêm nhân viên thất bại!");
        }
    };

    return (
        <Box>
            <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                <Link to="/admin/tai-khoan/nhan-vien" style={{ textDecoration: 'none', color: '#000', fontWeight: 600 }}>
                    Nhân viên
                </Link>
                <Typography sx={{ mx: 1 }} color="text.secondary">/</Typography>
                <Typography color="text.secondary" fontSize={16}>Thêm nhân viên</Typography>
            </Box>
            <Paper sx={{ p: 2, display: "flex", flexDirection: "column" }}>
                <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 3 }}>
                    {/* Cột trái */}
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" fontWeight={600} mb={2}>Thông tin nhân viên</Typography>
                        <Divider sx={{ mb: 2 }} />
                        <Box display="flex" flexDirection="column" alignItems="center" marginY={2.295}>
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
                                    sx={{ width: 120, height: 120, cursor: "pointer", mb: 1 }}
                                />
                            </label>
                            <Typography variant="caption">Chọn ảnh</Typography>
                        </Box>
                        <Typography>
                            Họ tên
                        </Typography>
                        <TextField
                            variant="outlined"
                            type="text"
                            fullWidth
                            size="small"
                            name="hoTen"
                            value={staff.hoTen}
                            onChange={handleChange}
                        />
                    </Box>

                    {/* Cột phải */}
                    <Box sx={{ flex: 2 }}>
                        <Typography variant="h6" fontWeight={600} mb={2}>Thông tin chi tiết</Typography>
                        <Divider sx={{ mb: 2 }} />
                        <Grid className="grid grid-cols-2 gap-4">
                            <Grid item xs={12} sm={6}>
                                <Typography>
                                    CCCD
                                </Typography>
                                <TextField
                                    type="text"
                                    name="cccd"
                                    value={staff.cccd}
                                    onChange={handleChange}
                                    fullWidth
                                    variant="outlined"
                                    size="small"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography >
                                    Giới tính
                                </Typography>
                                <FormControl fullWidth>
                                    <RadioGroup row name="gioiTinh" value={staff.gioiTinh} onChange={handleChange}>
                                        <FormControlLabel value="0" control={<Radio size="small" />} label="Nam" />
                                        <FormControlLabel value="1" control={<Radio size="small" />} label="Nữ" />
                                    </RadioGroup>
                                </FormControl>
                            </Grid>
                        </Grid>
                        <Grid className="grid grid-cols-2 gap-4 mt-5">
                            <Grid item xs={12} sm={6}>
                                <Typography>
                                    Email
                                </Typography>
                                <TextField
                                    type="text"
                                    name="email"
                                    value={staff.email}
                                    onChange={handleChange}
                                    fullWidth
                                    variant="outlined"
                                    size="small"
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <Typography>
                                    Ngày sinh
                                </Typography>
                                <TextField
                                    type="date"
                                    name="ngaySinh"
                                    value={staff.ngaySinh}
                                    onChange={handleChange}
                                    fullWidth
                                    variant="outlined"
                                    size="small"
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>

                        </Grid>
                        <Grid className="grid grid-cols-3 gap-4 mt-5">
                            <Grid item xs={12} sm={4}>
                                <Typography>
                                    Tỉnh/Thành phố
                                </Typography>
                                <Autocomplete
                                    options={provinces}
                                    getOptionLabel={(option) => option?.ProvinceName || ""}
                                    value={selectedProvince}
                                    onChange={(event, newValue) => {
                                        setSelectedProvince(newValue);
                                        setSelectedDistrict(null);
                                        setSelectedWard(null);
                                        setDistricts([]);
                                        setWards([]);
                                        if (newValue) fetchDistricts(newValue.ProvinceID);
                                    }}
                                    renderInput={(params) => (
                                        <TextField {...params} label="Tỉnh/Thành phố" fullWidth size="small" />
                                    )}
                                />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <Typography>
                                    Quận/Huyện
                                </Typography>
                                <Autocomplete
                                    options={districts}
                                    getOptionLabel={(option) => option?.DistrictName || ""}
                                    value={selectedDistrict}
                                    onChange={(event, newValue) => {
                                        setSelectedDistrict(newValue);
                                        setSelectedWard(null);
                                        setWards([]);
                                        if (newValue) fetchWards(newValue.DistrictID);
                                    }}
                                    disabled={!selectedProvince}
                                    renderInput={(params) => (
                                        <TextField {...params} label="Quận/Huyện" fullWidth size="small" />
                                    )}
                                />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <Typography>
                                    Tỉnh/Xã
                                </Typography>
                                <Autocomplete
                                    options={wards}
                                    getOptionLabel={(option) => option?.WardName || ""}
                                    value={selectedWard}
                                    onChange={(event, newValue) => {
                                        setSelectedWard(newValue);
                                    }}
                                    disabled={!selectedDistrict}
                                    renderInput={(params) => (
                                        <TextField {...params} label="Xã/Phường" fullWidth size="small" />
                                    )}
                                />
                            </Grid>
                        </Grid>
                        <Grid className="grid grid-cols-2 gap-4 mt-5">
                            <Grid item xs={12} sm={6}>
                                <Typography>
                                    Số điện thoại
                                </Typography>
                                <TextField
                                    type="text"
                                    name="sdt"
                                    value={staff.sdt}
                                    onChange={handleChange}
                                    fullWidth
                                    variant="outlined"
                                    size="small"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography>
                                    Địa chỉ cụ thể
                                </Typography>
                                <TextField
                                    type="text"
                                    name="diaChiCuThe"
                                    value={staff.diaChiCuThe}
                                    onChange={handleChange}
                                    fullWidth
                                    variant="outlined"
                                    size="small"
                                />
                            </Grid>
                        </Grid>
                    </Box>
                </Box>

                <Box mt={4} display="flex" justifyContent="flex-end">
                    <Button variant="contained" onClick={handleSubmit}>Thêm nhân viên</Button>
                </Box>
            </Paper>
        </Box>
    );
}

export default AddStaff;