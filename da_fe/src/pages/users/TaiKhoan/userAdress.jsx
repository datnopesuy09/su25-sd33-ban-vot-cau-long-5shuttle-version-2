import React, { useEffect, useState } from "react";
import {
    Box,
    Button,
    Divider,
    Typography,
    Grid,
    TextField,
    Paper,
    Chip,
    Autocomplete,
    ButtonGroup,
    Modal
} from "@mui/material";
import { Plus } from "react-feather";
import { toast } from "react-toastify";
import axios from "axios";
import { useUserAuth } from "../../../contexts/userAuthContext";
import Swal from "sweetalert2";

const AddressUser = () => {
    const [open, setOpen] = useState(false);
    const [listDiaChi, setListDiaChi] = useState([]);
    const [diaChiData, setDiaChiData] = useState({
        ten: "",
        sdt: "",
        diaChiCuThe: "",
        loai: 0,
    });
    const [errors, setErrors] = useState({});
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);
    const [selectedProvince, setSelectedProvince] = useState(null);
    const [selectedDistrict, setSelectedDistrict] = useState(null);
    const [selectedWard, setSelectedWard] = useState(null);
    const { user } = useUserAuth();
    const token = localStorage.getItem("userToken");


    console.log("token", token);
    const fetchListDiaChi = async () => {
        try {
            const res = await axios.get("http://localhost:8080/dia-chi/getMyAddress", {
                headers: { Authorization: `Bearer ${token}` },
            });
            const sorted = res.data.result.sort((a, b) => b.loai - a.loai); // 1 (mặc định) lên trước
            console.log("==> Dữ liệu địa chỉ:", sorted);
            setListDiaChi(sorted);
        } catch {
            toast.error("Lỗi khi tải danh sách địa chỉ");
        }
    };

    const fetchProvinces = async () => {
        try {
            const res = await fetch("https://provinces.open-api.vn/api/?depth=1");
            const data = await res.json();
            setProvinces(data);
        } catch {
            toast.error("Không thể tải tỉnh/thành");
        }
    };

    const fetchDistricts = async (provinceCode) => {
        try {
            const res = await fetch(`https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`);
            const data = await res.json();
            setDistricts(data.districts || []);
            return data.districts;
        } catch {
            toast.error("Lỗi tải quận/huyện");
            return [];
        }
    };

    const fetchWards = async (districtCode) => {
        try {
            const res = await fetch(`https://provinces.open-api.vn/api/d/${districtCode}?depth=2`);
            const data = await res.json();
            setWards(data.wards || []);
            return data.wards;
        } catch {
            toast.error("Lỗi tải phường/xã");
            return [];
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setDiaChiData((prev) => ({ ...prev, [name]: value }));
    };

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

    const handleClose = () => {
        resetAddressState();
        setOpen(false);
    };

    const resetAddressState = () => {
        setDiaChiData({ ten: '', sdt: '', diaChiCuThe: '', loai: 0 });
        setErrors({});
        setSelectedProvince(null);
        setSelectedDistrict(null);
        setSelectedWard(null);
        setDistricts([]);
        setWards([]);
    };

    const validate = () => {
        const newErrors = {};
        if (!diaChiData.ten.trim()) newErrors.ten = "Vui lòng nhập tên.";
        if (!diaChiData.sdt.trim()) newErrors.sdt = "Vui lòng nhập số điện thoại.";
        if (!selectedProvince) newErrors.tinh = "Chọn tỉnh/thành.";
        if (!selectedDistrict) newErrors.huyen = "Chọn quận/huyện.";
        if (!selectedWard) newErrors.xa = "Chọn phường/xã.";
        if (!diaChiData.diaChiCuThe.trim()) newErrors.diaChiCuThe = "Nhập địa chỉ cụ thể.";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmitDiaChi = async () => {
        if (!validate()) return;
        const isEdit = !!diaChiData.id;

        const confirm = await Swal.fire({
            title: isEdit ? "Cập nhật địa chỉ?" : "Thêm địa chỉ mới?",
            text: isEdit ? "Bạn có chắc chắn muốn cập nhật địa chỉ này?" : "Bạn có chắc chắn muốn thêm địa chỉ mới?",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: isEdit ? "Cập nhật" : "Thêm",
            cancelButtonText: "Hủy",
        });

        if (!confirm.isConfirmed) return;

        const requestBody = {
            ten: diaChiData.ten,
            sdt: diaChiData.sdt,
            diaChiCuThe: diaChiData.diaChiCuThe,
            tinh: selectedProvince?.name,
            huyen: selectedDistrict?.name,
            xa: selectedWard?.name,
        };

        try {
            if (isEdit) {
                await axios.put(`http://localhost:8080/dia-chi/update/${diaChiData.id}`, requestBody, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                toast.success("Cập nhật địa chỉ thành công!");
            } else {
                await axios.post("http://localhost:8080/dia-chi/create", requestBody, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                toast.success("Thêm địa chỉ thành công!");
            }
            handleClose();
            fetchListDiaChi();
        } catch {
            toast.error("Không thể xử lý địa chỉ");
        }
    };

    const handleDeleteDiaChi = async (id) => {
        const confirm = await Swal.fire({
            title: "Xác nhận xóa",
            text: "Bạn có chắc chắn muốn xóa địa chỉ này?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Xóa",
            cancelButtonText: "Hủy",
            confirmButtonColor: "#d33",
        });
        if (!confirm.isConfirmed) return;

        try {
            await axios.delete(`http://localhost:8080/dia-chi/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            toast.success("Đã xóa địa chỉ!");
            fetchListDiaChi();
        } catch {
            toast.error("Xóa địa chỉ thất bại");
        }
    };

    const handleSetDefaultDiaChi = async (id) => {
        const confirm = await Swal.fire({
            title: "Đặt làm mặc định?",
            text: "Bạn muốn đặt địa chỉ này làm địa chỉ mặc định?",
            icon: "info",
            showCancelButton: true,
            confirmButtonText: "Đồng ý",
            cancelButtonText: "Hủy",
        });
        if (!confirm.isConfirmed) return;

        try {
            await axios.put(`http://localhost:8080/dia-chi/update-loai/${id}`, {}, {
                headers: { Authorization: `Bearer ${token}` },
            });
            toast.success("Đã đặt địa chỉ mặc định");
            fetchListDiaChi();
        } catch {
            toast.error("Không thể đặt mặc định");
        }
    };

    const handleEditAddress = async (address) => {
        setDiaChiData(address);
        const foundProvince = provinces.find(p => p.name === address.tinh);
        setSelectedProvince(foundProvince);

        let districtsData = [];
        if (foundProvince?.code) {
            districtsData = await fetchDistricts(foundProvince.code);
        }

        const foundDistrict = districtsData.find(d => d.name === address.huyen);
        setSelectedDistrict(foundDistrict);

        let wardsData = [];
        if (foundDistrict?.code) {
            wardsData = await fetchWards(foundDistrict.code);
        }

        const foundWard = wardsData.find(w => w.name === address.xa);
        setSelectedWard(foundWard);

        setOpen(true);
    };

    useEffect(() => {
        if (user) {
            fetchProvinces();
            fetchListDiaChi();
        }
    }, [user]);

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mt={1} mb={3}>
                <Typography variant="h5" fontWeight={500}>Địa chỉ của tôi</Typography>
                <Button variant="outlined" startIcon={<Plus size={20} />} onClick={handleOpen}>Thêm địa chỉ</Button>
            </Box>
            <Divider sx={{ mb: 2 }} />

            <Box>
                {listDiaChi.length > 0 ? (
                    listDiaChi.map((address) => (
                        <Paper key={address.id} sx={{ p: 2, mb: 2, display: "flex", justifyContent: "space-between" }}>
                            <Box>
                                <Typography><strong>Tên:</strong> {address.ten}</Typography>
                                <Typography><strong>SĐT:</strong> {address.sdt}</Typography>
                                <Typography><strong>Địa chỉ:</strong> {address.diaChiCuThe}, {address.xa}, {address.huyen}, {address.tinh}</Typography>
                                {address.loai === 1 && <Chip label="Mặc định" color="success" size="small" variant="outlined" sx={{ mt: 1 }} />}
                            </Box>
                            <Box display="flex" flexDirection="column" alignItems="flex-end" gap={1}>
                                <ButtonGroup>
                                    <Button variant="text" color="primary" onClick={() => handleEditAddress(address)}>
                                        Sửa
                                    </Button>
                                    {address.loai !== 1 && (
                                        <Button variant="text" color="error" onClick={() => handleDeleteDiaChi(address.id)}>
                                            Xóa
                                        </Button>
                                    )}
                                </ButtonGroup>
                                <Button size="small" variant="outlined" disabled={address.loai === 1} onClick={() => handleSetDefaultDiaChi(address.id)}>
                                    Thiết lập mặc định
                                </Button>
                            </Box>
                        </Paper>
                    ))
                ) : (
                    <Typography>Chưa có địa chỉ nào.</Typography>
                )}
            </Box>

            {/* FORM DẠNG MODAL */}
            {open && (
                <Box onClose={handleClose} sx={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    width: "100vw",
                    height: "100vh",
                    bgcolor: "rgba(0,0,0,0.5)",
                }}>
                    <Box sx={{
                        position: "fixed",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        width: 800,
                        maxHeight: "90vh",
                        overflowY: "auto",
                        bgcolor: "background.paper",
                        borderRadius: 1,
                        boxShadow: 24,
                        p: 3,
                    }}>
                        <Typography variant="h6" mb={2}>{diaChiData.id ? "Cập nhật địa chỉ" : "Địa chỉ mới"}</Typography>
                        <Divider sx={{ mb: 2 }} />
                        <Box sx={{ mb: 2 }}>
                            <Grid className='grid grid-cols-2 gap-4'>
                                <Grid item xs={12} md={6}>
                                    <Typography sx={{ mb: 1 }}>Họ tên</Typography>
                                    <TextField variant="outlined" type="text" size="small" fullWidth name="ten" value={diaChiData.ten} onChange={handleInputChange} error={!!errors.ten} helperText={errors.ten} />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Typography sx={{ mb: 1 }}>Số điện thoại</Typography>
                                    <TextField variant="outlined" type="text" size="small" fullWidth name="sdt" value={diaChiData.sdt} onChange={handleInputChange} error={!!errors.sdt} helperText={errors.sdt} />
                                </Grid>
                            </Grid>
                            <Grid className='grid grid-cols-3 gap-4 mt-4'>
                                <Grid item xs={12} md={4}>
                                    <Typography sx={{ mb: 1 }}>Tỉnh/Thành phố</Typography>
                                    <Autocomplete fullWidth size="small" options={provinces} getOptionLabel={(option) => option?.name || ""} isOptionEqualToValue={(o, v) => o?.code === v?.code} value={selectedProvince} onChange={(e, v) => {
                                        setSelectedProvince(v);
                                        setSelectedDistrict(null);
                                        setSelectedWard(null);
                                        setDistricts([]);
                                        setWards([]);
                                        if (v?.code) fetchDistricts(v.code);
                                    }} renderOption={(props, option) => <li {...props} key={option.code}>{option.name}</li>} renderInput={(params) => <TextField {...params} label="Tỉnh/Thành phố" fullWidth />} />
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <Typography sx={{ mb: 1 }}>Quận/Huyện</Typography>
                                    <Autocomplete fullWidth size="small" options={districts} getOptionLabel={(option) => option?.name || ""} isOptionEqualToValue={(o, v) => o?.code === v?.code} value={selectedDistrict} onChange={(e, v) => {
                                        setSelectedDistrict(v);
                                        setSelectedWard(null);
                                        setWards([]);
                                        if (v?.code) fetchWards(v.code);
                                    }} disabled={!selectedProvince} renderOption={(props, option) => <li {...props} key={option.code}>{option.name}</li>} renderInput={(params) => <TextField {...params} label="Quận/Huyện" fullWidth />} />
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <Typography sx={{ mb: 1 }}>Phường/Xã</Typography>
                                    <Autocomplete fullWidth size="small" options={wards} getOptionLabel={(option) => option?.name || ""} isOptionEqualToValue={(o, v) => o?.code === v?.code} value={selectedWard} onChange={(e, v) => setSelectedWard(v)} disabled={!selectedDistrict} renderOption={(props, option) => <li {...props} key={option.code}>{option.name}</li>} renderInput={(params) => <TextField {...params} label="Phường/Xã" fullWidth />} />
                                </Grid>
                            </Grid>
                            <Grid className='grid grid-cols-1 gap-4 mt-4'>
                                <Grid item xs={12}>
                                    <Typography sx={{ mb: 1 }}>Địa chỉ cụ thể</Typography>
                                    <TextField variant="outlined" type="text" size="small" name="diaChiCuThe" fullWidth value={diaChiData.diaChiCuThe} onChange={handleInputChange} />
                                </Grid>
                            </Grid>
                        </Box>
                        <Box className='flex justify-end mt-4'>
                            <Button sx={{ px: 3 }} onClick={handleClose}>Trở lại</Button>
                            <Button variant="contained" onClick={handleSubmitDiaChi}>
                                {diaChiData.id ? "Cập nhật" : "Hoàn thành"}
                            </Button>
                        </Box>
                    </Box>
                </Box>
            )}

        </Box>
    );
};

export default AddressUser;
