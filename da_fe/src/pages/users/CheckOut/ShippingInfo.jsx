import React from 'react';
import swal from 'sweetalert';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Grid,
    TextField,
    MenuItem,
    Typography,
} from '@mui/material';
import { Checkbox, FormControlLabel } from '@mui/material';

const ShippingInfo = ({
    open,
    onClose,
    onSave,
    formData,
    handleInputChange,
    errors,
    provinces,
    districts,
    wards,
    isDefaultAddress,
    setIsDefaultAddress,
}) => {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Thêm địa chỉ mới</DialogTitle>
            <DialogContent dividers>
                <Grid spacing={2}>
                    <Grid className="grid grid-cols-2 gap-4 mb-5">
                        <Grid item xs={12} md={6}>
                            {/* <Typography sx={{ mb: 1 }}>Họ tên</Typography> */}
                            <TextField
                                label="Họ tên"
                                name="ten"
                                fullWidth
                                size="small"
                                value={formData.ten}
                                onChange={handleInputChange}
                                error={!!errors.addressName}
                                helperText={errors.addressName}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="Số điện thoại"
                                name="sdt"
                                fullWidth
                                size="small"
                                value={formData.sdt}
                                onChange={handleInputChange}
                                error={!!errors.mobile}
                                helperText={errors.mobile}
                            />
                        </Grid>
                    </Grid>
                    <Grid item xs={12} sm={6} sx={{ mb: 2.5 }}>
                        <TextField
                            select
                            label="Tỉnh/Thành phố"
                            name="province"
                            size="small"
                            value={formData.province}
                            onChange={handleInputChange}
                            fullWidth
                            error={!!errors.province}
                            helperText={errors.province}
                        >
                            <MenuItem value="">Chọn tỉnh/thành phố</MenuItem>
                            {provinces.map((province) => (
                                <MenuItem key={province.ProvinceID} value={province.ProvinceID}>
                                    {province.ProvinceName}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                    <Grid item xs={12} sm={6} sx={{ mb: 2.5 }}>
                        <TextField
                            select
                            label="Quận/Huyện"
                            name="district"
                            value={formData.district}
                            onChange={handleInputChange}
                            fullWidth
                            size="small"
                            error={!!errors.district}
                            helperText={errors.district}
                        >
                            <MenuItem value="">Chọn quận/huyện</MenuItem>
                            {districts.map((district) => (
                                <MenuItem key={district.DistrictID} value={district.DistrictID}>
                                    {district.DistrictName}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                    <Grid item xs={12} sm={6} sx={{ mb: 2.5 }}>
                        <TextField
                            select
                            label="Xã/Phường"
                            name="ward"
                            value={formData.ward}
                            onChange={handleInputChange}
                            fullWidth
                            size="small"
                            error={!!errors.ward}
                            helperText={errors.ward}
                        >
                            <MenuItem value="">Chọn xã/phường</MenuItem>
                            {wards.map((ward) => (
                                <MenuItem key={ward.WardCode} value={ward.WardCode}>
                                    {ward.WardName}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                    <Grid item xs={12} sm={6} sx={{ mb: 1 }}>
                        <TextField
                            label="Địa chỉ chi tiết"
                            name="diaChiCuThe"
                            fullWidth
                            size="small"
                            value={formData.diaChiCuThe}
                            onChange={handleInputChange}
                            error={!!errors.addressDetail}
                            helperText={errors.addressDetail}
                        />
                    </Grid>
                    <Grid item xs={12} sm={12}>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={isDefaultAddress}
                                    onChange={(e) => setIsDefaultAddress(e.target.checked)}
                                    color="primary"
                                />
                            }
                            label="Đặt làm địa chỉ mặc định"
                        />
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions spacing={2}>
                <Button onClick={onClose}>Hủy</Button>
                <Button
                    variant="contained"
                    onClick={() => {
                        swal({
                            title: 'Xác nhận',
                            text: 'Bạn có chắc muốn lưu địa chỉ này?',
                            icon: 'warning',
                            buttons: ['Hủy', 'Lưu'],
                            // dangerMode: true,
                        }).then((willSave) => {
                            if (willSave) {
                                onSave();
                            }
                        });
                    }}
                >
                    Thêm mới
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ShippingInfo;
