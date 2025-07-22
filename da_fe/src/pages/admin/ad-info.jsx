import React, { useState, useEffect } from 'react';
import {
    TextField,
    Typography,
    Button,
    Box,
    Grid,
    Avatar,
    Divider,
    Stack,
    FormControl,
    RadioGroup,
    FormControlLabel,
    Radio
} from '@mui/material';
import { useAdminAuth } from '../../contexts/adminAuthContext';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AdminInfo = () => {
    const { admin, setAdmin } = useAdminAuth();
    const [formData, setFormData] = useState({
        hoTen: '',
        email: '',
        sdt: '',
        ngaySinh: '',
        gioiTinh: '',
        avatar: null
    });

    useEffect(() => {
        if (admin) {
            setFormData({
                hoTen: admin.hoTen || '',
                email: admin.email || '',
                sdt: admin.sdt || '',
                ngaySinh: admin.ngaySinh || '',
                gioiTinh: String(admin.gioiTinh ?? ''),
                avatar: null
            });
        }
    }, [admin]);

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: files ? files[0] : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const confirm = await Swal.fire({
            title: 'Xác nhận',
            text: 'Bạn có chắc chắn muốn cập nhật thông tin?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Cập nhật',
            cancelButtonText: 'Hủy',
        });

        if (!confirm.isConfirmed) return;

        try {
            const token = localStorage.getItem("adminToken");
            const form = new FormData();

            form.append("hoTen", formData.hoTen);
            form.append("email", formData.email);
            form.append("sdt", formData.sdt);
            form.append("ngaySinh", formData.ngaySinh);
            form.append("gioiTinh", parseInt(formData.gioiTinh));
            if (formData.avatar) {
                form.append("avatar", formData.avatar);
            }

            const res = await fetch(`http://localhost:8080/users/${admin.id}`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: form,
            });

            if (!res.ok) throw new Error("Cập nhật thất bại");

            const data = await res.json();
            setAdmin(data.result);
            toast.success("Cập nhật thành công!");
        } catch (err) {
            console.error("Lỗi cập nhật:", err);
            toast.error("Đã xảy ra lỗi khi cập nhật!");
        }
    };


    return (
        <Box sx={{ p: 2 }}>
            <Typography variant="h5" fontWeight={500} mb={2}>
                Hồ sơ của tôi
            </Typography>

            <Divider sx={{ mb: 2 }} />

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="md:col-span-1 space-y-4">
                        <Stack spacing={2}>
                            <Box>
                                <Typography>
                                    Họ tên
                                </Typography>
                                <TextField
                                    id="outlined-basic"
                                    variant="outlined"
                                    type="text"
                                    size="small"
                                    name="hoTen"
                                    value={formData.hoTen}
                                    onChange={handleChange}
                                    fullWidth
                                />
                            </Box>
                            <Box>
                                <Typography>
                                    Email
                                </Typography>
                                <TextField
                                    id="outlined-basic"
                                    variant="outlined"
                                    type="text"
                                    size="small"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    fullWidth
                                />
                            </Box>
                            <Box>
                                <Typography>
                                    Số điện thoại
                                </Typography>
                                <TextField
                                    id="outlined-basic"
                                    variant="outlined"
                                    type="text"
                                    size="small"
                                    name="sdt"
                                    value={formData.sdt}
                                    onChange={handleChange}
                                    fullWidth
                                />
                            </Box>
                            <Box>
                                <Typography>
                                    Ngày sinh
                                </Typography>
                                <TextField
                                    id="outlined-basic"
                                    variant="outlined"
                                    size="small"
                                    name="ngaySinh"
                                    type="date"
                                    value={formData.ngaySinh}
                                    onChange={handleChange}
                                    fullWidth
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Box>
                            <Box>
                                <Typography>
                                    Giới tính
                                </Typography>
                                <FormControl component="fieldset">
                                    <RadioGroup
                                        row
                                        name="gioiTinh"
                                        value={formData.gioiTinh}
                                        onChange={handleChange}>
                                        <FormControlLabel value="0" control={<Radio />} label="Nam" />
                                        <FormControlLabel value="1" control={<Radio />} label="Nữ" />
                                    </RadioGroup>
                                </FormControl>
                            </Box>
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                sx={{ mt: 2, width: 'fit-content', alignSelf: 'flex-start' }}>
                                Cập nhật
                            </Button>
                        </Stack>
                    </div>
                    <div>
                        <Box textAlign="center">
                            <Avatar
                                src={
                                    formData.avatar
                                        ? URL.createObjectURL(formData.avatar)
                                        : admin?.avatar || ''
                                }
                                sx={{ width: 150, height: 150, mx: 'auto', mb: 2 }}
                            />
                            <Button variant="outlined" component="label">
                                Chọn ảnh
                                <input type="file" hidden name="avatar" accept="image/*" onChange={handleChange} />
                            </Button>
                            <Typography variant="caption" display="block" mt={1}>
                                Dung lượng tối đa 1 MB <br /> Định dạng: JPEG, PNG
                            </Typography>
                        </Box>
                    </div>
                </div>
            </form>
        </Box>
    )
}

export default AdminInfo