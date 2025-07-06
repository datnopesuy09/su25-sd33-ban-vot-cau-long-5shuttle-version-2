import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Typography,
    Modal,
    TextField,
    Paper,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '80%',
    height: '80%',
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    overflow: 'auto',
};

// Mock data, bạn có thể thay bằng API sau
const mockKhachHang = [
    { id: 1, ma: 'KH001', ten: 'Nguyễn Văn A', sdt: '0901234567' },
    { id: 2, ma: 'KH002', ten: 'Trần Thị B', sdt: '0902234567' },
    { id: 3, ma: 'KH003', ten: 'Lê Văn C', sdt: '0903234567' },
];

function ModalKhachHang({ onChon }) {
    const [open, setOpen] = useState(false);
    const [data, setData] = useState([]);
    const [searchText, setSearchText] = useState('');

    const handleOpen = () => {
        setOpen(true);
        setData(mockKhachHang); // Gọi API thật ở đây nếu có
    };

    const handleClose = () => setOpen(false);

    const handleSearch = (e) => {
        const keyword = e.target.value.toLowerCase();
        setSearchText(keyword);
        setData(
            mockKhachHang.filter(
                (kh) =>
                    kh.ten.toLowerCase().includes(keyword) ||
                    kh.ma.toLowerCase().includes(keyword) ||
                    kh.sdt.includes(keyword)
            )
        );
    };

    const handleRowClick = (params) => {
        onChon(params.row); // Trả dữ liệu khách hàng về form chính
        handleClose();
    };

    const columns = [
        {
            field: 'stt', headerName: "STT", sortable: false,
            filterable: false,
        },
        {
            field: 'ma', headerName: 'Mã KH', flex: 1, sortable: false,
            filterable: false,
        },
        {
            field: 'email', headerName: 'Email', flex: 2, sortable: false,
            filterable: false,
        },
        {
            field: 'ten', headerName: 'Tên khách hàng', flex: 2, sortable: false,
            filterable: false,
        },
        {
            field: 'sdt', headerName: 'Số điện thoại', flex: 1.5, sortable: false,
            filterable: false,
        },
        {
            field: 'ngaySinh', headerName: 'Ngày Sinh', flex: 1, sortable: false,
            filterable: false,
        },
        {
            field: 'gioiTinh', headerName: 'Giới tính', flex: 1, sortable: false,
            filterable: false,
        },
        {
            field: 'trangThai', headerName: 'Trạng thái', flex: 1, sortable: false,
            filterable: false,
        },
    ];

    return (
        <div>
            <Button variant="outlined" onClick={handleOpen}>
                Chọn khách hàng
            </Button>

            <Modal open={open} onClose={handleClose}>
                <Box sx={style}>
                    <Typography variant="h6" mb={2}>
                        Danh sách khách hàng
                    </Typography>

                    <TextField
                        sx={{ mb: 2, width: '50%' }}
                        size="small"
                        label="Tìm kiếm"
                        type="search"
                        placeholder="Tên hoặc email hoặc sđt"
                        variant="filled"
                        value={searchText}
                        onChange={handleSearch}
                    />

                    <Paper style={{ height: '75%', width: '100%' }}>
                        <DataGrid
                            rows={data}
                            columns={columns}
                            initialState={{
                                pagination: {
                                    paginationModel: {
                                        pageSize: 5,
                                    },
                                },
                            }}
                            pageSizeOptions={[5]}
                            onRowClick={handleRowClick}
                            checkboxSelection
                            disableRowSelectionOnClick
                            hideFooterSelectedRowCount
                        />
                    </Paper>
                </Box>
            </Modal>
        </div>
    );
}
export default ModalKhachHang