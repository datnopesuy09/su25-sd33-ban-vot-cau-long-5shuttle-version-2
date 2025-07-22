import React, { useEffect, useState } from "react";
import {
    Box,
    Button,
    Divider,
    Typography,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Grid,
    TextField,
    Paper,
    Chip,
    Autocomplete
} from "@mui/material";
import { Plus } from "react-feather";
import Swal from "sweetalert2";
import axios from "axios";

const AddressUser = () => {
    const [open, setOpen] = useState(false);
    const [listDiaChi, setListDiaChi] = useState([]);
    const [khachId, setKhachId] = useState(null);
    const [diaChiData, setDiaChiData] = useState({
        ten: "",
        sdt: "",
        diaChiCuThe: "",
        loai: 0
    });
    const [errors, setErrors] = useState({});

    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);
    const [selectedProvince, setSelectedProvince] = useState(null);
    const [selectedDistrict, setSelectedDistrict] = useState(null);
    const [selectedWard, setSelectedWard] = useState(null);

    const fetchUserInfo = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get("http://localhost:8080/api/tai-khoan/my-info", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setKhachId(response.data.id);
        } catch (error) {
            Swal.fire("Lỗi!", "Không thể tải thông tin người dùng", "error");
        }
    };

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
        fetchUserInfo();
        fetchProvinces();
    }, []);

    const handleOpen = () => {
        setDiaChiData({ ten: "", sdt: "", diaChiCuThe: "", loai: 0 });
        setSelectedProvince(null);
        setSelectedDistrict(null);
        setSelectedWard(null);
        setDistricts([]);
        setWards([]);
        setErrors({});
        setOpen(true);
    };

    const handleClose = () => setOpen(false);

    const handleInputChange = (e) => {
        setDiaChiData({ ...diaChiData, [e.target.name]: e.target.value });
    };

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mt={1} mb={3}>
                <Typography variant="h5" fontWeight={500}>
                    Địa chỉ của tôi
                </Typography>
                <Button
                    variant="outlined"
                    startIcon={<Plus size={20} />}
                    onClick={handleOpen}
                >
                    Thêm địa chỉ
                </Button>
            </Box>
            <Divider sx={{ mb: 2 }} />

            <Box>
                {listDiaChi.length > 0 ? (
                    listDiaChi.map((address) => (
                        <Paper key={address.id} sx={{ p: 2, mb: 2, display: "flex", justifyContent: "space-between" }}>
                            <Box>
                                <Typography><strong>Tên:</strong> {address.ten}</Typography>
                                <Typography><strong>SĐT:</strong> {address.sdt}</Typography>
                                <Typography>
                                    <strong>Địa chỉ:</strong> {address.diaChiCuThe}, {address.idXa}, {address.idHuyen}, {address.idTinh}
                                </Typography>
                                {address.loai === 1 && (
                                    <Chip label="Mặc định" color="success" size="small" sx={{ mt: 1 }} />
                                )}
                            </Box>
                            <Box display="flex" flexDirection="column" alignItems="flex-end" gap={1}>
                                <Button variant="text" color="primary">Sửa</Button>
                                <Button variant="text" color="error">Xóa</Button>
                                <Button
                                    size="small"
                                    variant="outlined"
                                    disabled={address.loai === 1}
                                >
                                    Thiết lập mặc định
                                </Button>
                            </Box>
                        </Paper>
                    ))
                ) : (
                    <Typography>Chưa có địa chỉ nào.</Typography>
                )}
            </Box>

            {/* DIALOG */}
            <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
                <DialogTitle>{diaChiData.id ? "Cập nhật địa chỉ" : "Địa chỉ mới"}</DialogTitle>
                <DialogContent dividers>
                    <Grid className='grid grid-cols-2 gap-4'>
                        <Grid item xs={12} md={6}>
                            <Typography>
                                Họ tên
                            </Typography>
                            <TextField
                                id="outlined-basic"
                                variant="outlined"
                                type="text"
                                size="small"
                                fullWidth
                                name="ten"
                                value={diaChiData.ten}
                                onChange={handleInputChange}
                                error={!!errors.ten}
                                helperText={errors.ten}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Typography>
                                Số điện thoại
                            </Typography>
                            <TextField
                                id="outlined-basic"
                                variant="outlined"
                                type="text"
                                size="small"
                                fullWidth
                                name="sdt"
                                value={diaChiData.sdt}
                                onChange={handleInputChange}
                                error={!!errors.sdt}
                                helperText={errors.sdt}
                            />
                        </Grid>
                    </Grid>
                    <Grid className='grid grid-cols-3 gap-4 mt-4'>
                        <Grid item xs={12} md={4}>
                            <Box sx={{ minWidth: 120 }}>
                                <Typography>
                                    Tỉnh/Thành phố
                                </Typography>
                                <Autocomplete
                                    fullWidth
                                    size="small"
                                    className="search-field"
                                    id="combo-box-demo"
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
                                        <TextField {...params} label="Tỉnh/Thành phố" fullWidth />
                                    )}
                                />
                            </Box>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <Box sx={{ minWidth: 120 }}>
                                <Typography>
                                    Quận/Huyện
                                </Typography>
                                <Autocomplete
                                    fullWidth
                                    size="small"
                                    className="search-field"
                                    id="huyen-autocomplete"
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
                                        <TextField {...params} label="Quận/Huyện" fullWidth />
                                    )}
                                />
                            </Box>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <Box sx={{ minWidth: 120 }}>
                                <Typography>
                                    Phường/Xã
                                </Typography>
                                <Autocomplete
                                    fullWidth
                                    size="small"
                                    className="search-field"
                                    id="xa-autocomplete"
                                    options={wards}
                                    getOptionLabel={(option) => option?.WardName || ""}
                                    value={selectedWard}
                                    onChange={(event, newValue) => {
                                        setSelectedWard(newValue);
                                    }}
                                    disabled={!selectedDistrict}
                                    renderInput={(params) => (
                                        <TextField {...params} label="Xã/Phường" fullWidth />
                                    )}
                                />
                            </Box>
                        </Grid>
                    </Grid>
                    <Grid className='grid grid-cols-1 gap-4 mt-4'>
                        <Grid item xs={12} md={12}>
                            <Typography>
                                Địa chỉ cụ thể
                            </Typography>
                            <TextField
                                id="outlined-basic"
                                variant="outlined"
                                type="text"
                                size="small"
                                name="diaChiCuThe"
                                fullWidth
                                value={diaChiData.diaChiCuThe}
                                onChange={handleInputChange}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions className='mr-4'>
                    <Button onClick={handleClose}>Trở lại</Button>
                    <Button variant="contained" onClick={() => console.log("Submit địa chỉ")}>
                        {diaChiData.id ? "Cập nhật" : "Hoàn thành"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default AddressUser;