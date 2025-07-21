import {
    Button,
    TextField,
    Select,
    MenuItem,
    Stack,
    InputLabel,
    FormControl,
    Box,
    Chip,
    IconButton,
    Tooltip,
    Typography,
    Divider,
} from "@mui/material";
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import React, { useState, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Link } from "react-router-dom";
import PersonAddRoundedIcon from "@mui/icons-material/PersonAddRounded";
import DisabledByDefaultRoundedIcon from "@mui/icons-material/DisabledByDefaultRounded";
import DriveFileRenameOutlineOutlinedIcon from "@mui/icons-material/DriveFileRenameOutlineOutlined";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

function ListStaff() {
    const [gender, setGender] = React.useState("")
    const [staff, setStaff] = useState([])

    const [search, setSearch] = useState("")
    const [status, setStatus] = useState("")
    const [originalData, setOriginalData] = useState([])

    const handleGenderChange = (event) => setGender(event.target.value);

    const columns = [
        { field: "stt", headerName: "STT", width: 50 },
        {
            field: "avatar",
            headerName: "Ảnh",
            width: 90,
            renderCell: (params) => {
                const avatarUrl = params.value;

                return avatarUrl ? (
                    <img
                        src={avatarUrl}
                        alt="avatar"
                        style={{
                            width: 40,
                            height: 40,
                            borderRadius: "50%",
                            objectFit: "cover",
                            border: "1px solid #ccc",
                        }}
                    />
                ) : (
                    <AccountCircleIcon sx={{ fontSize: 40, color: "#888" }} />
                );
            },
        },
        { field: "ma", headerName: "Mã NV", width: 80 },
        {
            field: "hoTen",
            headerName: "Họ tên",
            flex: 1,
            minWidth: 90,
        },
        { field: "email", headerName: "Email", flex: 1, width: 90 },
        { field: "sdt", headerName: "SĐT" },
        { field: "ngaySinh", headerName: "Ngày sinh" },
        { field: "gioiTinh", headerName: "Giới tính" },
        { field: "role", headerName: "Chức vụ" },
        {
            field: "trangThai",
            headerName: "Trạng thái",
            // width: 130,
            renderCell: (params) => {
                const value = params.value;
                const color = value === "Hoạt động" ? "success" : "error";
                return (
                    <Chip label={value} color={color} variant="outlined" size="small" />
                );
            },
        },
        {
            field: "actions",
            headerName: "Hành động",
            // width: 130,
            sortable: false,
            renderCell: (params) => (
                <>
                    <Tooltip title="Update">
                        <IconButton
                            size="small"
                            sx={{
                                color: "orange",
                                "&:focus": { outline: "none" },
                                "&:focus-visible": { outline: "none" },
                            }}
                            component={Link}
                            to={`/admin/tai-khoan/nhan-vien/edit/${params.row.id}`}
                        >
                            <DriveFileRenameOutlineOutlinedIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                        <IconButton size="small"
                            onClick={() => handleDelete(params.row.id)}
                            sx={{
                                color: "red",
                                "&:focus": { outline: "none" },
                                "&:focus-visible": { outline: "none" },
                            }}
                        >
                            <DisabledByDefaultRoundedIcon />
                        </IconButton>
                    </Tooltip>
                </>
            ),
        },
    ];

    const handleDelete = async (id) => {
        Swal.fire({
            title: 'Xác nhận thay đổi trạng thái hoạt động?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#F2721E',
            cancelButtonColor: '#FF3333',
            confirmButtonText: 'Xóa',
            cancelButtonText: 'Hủy',
            customClass: {
                confirmButton: 'no-outline',
                cancelButton: 'no-outline'
            }
        }).then((result) => {
            if (result.isConfirmed) {
                axios.put(`http://localhost:8080/nhan-vien/delete/${id}`, {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                })
                    .then(() => {
                        toast.success('Thay đổi trạng thái hoạt động thành công', {
                            position: toast.POSITION.TOP_RIGHT,
                        });
                        setStaff((prev) => prev.filter((s) => s.id !== id));
                    })
                    .catch((error) => {
                        console.error("Lỗi cập nhật:", error);
                        toast.error("Thay đổi trạng thái thất bại!", {
                            position: toast.POSITION.TOP_RIGHT,
                        });
                    });
            }
        });
    };

    useEffect(() => {
        const fetchStaffData = async () => {
            try {
                const response = await fetch(`http://localhost:8080/nhan-vien`);
                const resData = await response.json();

                const data = resData.result || [];

                const mappedData = data
                    .reverse()
                    .map((item, index) => ({
                        ...item,
                        id: item.id || index + 1000,
                        stt: index + 1,
                        role: item.role === "ADMIN"
                            ? "Quản lý"
                            : item.role === "STAFF"
                                ? "Nhân viên"
                                : "Khách hàng",

                        gioiTinh: item.gioiTinh === 1 ? "Nam" : "Nữ",
                        trangThai: item.trangThai === 1 ? "Hoạt động" : "Không hoạt động",
                    }));

                setOriginalData(mappedData);
                setStaff(mappedData);

            } catch (error) {
                console.error("Error fetching staff data:", error)
            }
        }

        fetchStaffData()
    }, [])

    useEffect(() => {
        const filtered = originalData.filter((item) => {
            const matchSearch =
                item.hoTen.toLowerCase().includes(search.toLowerCase()) ||
                item.email.toLowerCase().includes(search.toLowerCase()) ||
                item.sdt.includes(search);

            const matchGender = gender ? item.gioiTinh === gender : true;
            const matchStatus = status ? item.trangThai === status : true;

            return matchSearch && matchGender && matchStatus;
        });

        setStaff(filtered);
    }, [search, gender, status, originalData]);


    return (
        <Box sx={{ px: 2 }}>
            <Typography variant="h5" fontWeight={500} mb={2}>
                Quản lý nhân viên
            </Typography>

            <Divider sx={{ mb: 2 }} />
            {/* <Paper elevation={3} sx={{ p: 2, mb: 2 }}> */}
            <Stack
                direction={{ xs: "column", sm: "row" }}
                justifyContent="space-between"
                alignItems={{ xs: "stretch", sm: "center" }}
                spacing={2}
            >
                <TextField
                    sx={{ flex: 1 }}
                    size="small"
                    label="Tìm kiếm"
                    type="search"
                    placeholder="Tên hoặc email hoặc sđt"
                    variant="outlined"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <Button
                    variant="outlined"
                    component={Link}
                    to="/admin/tai-khoan/nhan-vien/add"
                >
                    <PersonAddRoundedIcon sx={{ mr: 1 }} />
                    Tạo Nhân Viên
                </Button>
            </Stack>

            <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                mt={2}
                mb={2}
            >
                <FormControl variant="standard" sx={{ minWidth: 120 }}>
                    <InputLabel id="gender-label">Giới tính</InputLabel>
                    <Select
                        labelId="gender-label"
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        label="Giới tính"
                    >
                        <MenuItem value="">
                            <em>Tất cả</em>
                        </MenuItem>
                        <MenuItem value="Nam">Nam</MenuItem>
                        <MenuItem value="Nữ">Nữ</MenuItem>
                    </Select>
                </FormControl>
                <FormControl variant="standard" sx={{ minWidth: 160 }}>
                    <InputLabel id="status-label">Trạng thái</InputLabel>
                    <Select labelId="status-label" label="Trạng thái" value={status}
                        onChange={(e) => setStatus(e.target.value)}>
                        <MenuItem value="">
                            <em>Tất cả</em>
                        </MenuItem>
                        <MenuItem value="Hoạt động">Hoạt động</MenuItem>
                        <MenuItem value="Không hoạt động">Không hoạt động</MenuItem>
                    </Select>
                </FormControl>
            </Stack>
            <Box
                sx={{
                    minWidth: 1000,
                    height: 400,
                    "& .MuiDataGrid-cell:focus": { outline: "none" },
                    "& .MuiDataGrid-cell:focus-within": { outline: "none" },
                }}
            >
                <DataGrid
                    rows={staff}
                    columns={columns}
                    initialState={{
                        pagination: {
                            paginationModel: {
                                pageSize: 5,
                            },
                        },
                    }}
                    pageSizeOptions={[5]}
                    disableRowSelectionOnClick
                    localeText={{
                        noRowsLabel: "không có dữ liệu",
                    }}
                    sx={{
                        border: 0,
                        "& .MuiDataGrid-cell:focus": {
                            outline: "none !important",
                        },
                        "& .MuiDataGrid-cell:focus-within": {
                            outline: "none !important",
                        },
                        "& .MuiDataGrid-cell:active": {
                            outline: "none !important",
                        },
                        "& .MuiDataGrid-columnHeader:focus": {
                            outline: "none !important",
                        },
                        "& .MuiDataGrid-columnHeader:focus-within": {
                            outline: "none !important",
                        },
                        "& .MuiDataGrid-columnHeader:active": {
                            outline: "none !important",
                        },
                    }}
                />

            </Box>
        </Box>
    );
}
export default ListStaff;
