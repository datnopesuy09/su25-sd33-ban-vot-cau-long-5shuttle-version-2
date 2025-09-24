import React, { useState, useEffect } from 'react';
import axios from 'axios';
import swal from 'sweetalert';
import {
    Modal,
    Box,
    Typography,
    TextField,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Pagination,
} from '@mui/material';
import { Edit, Delete, Add, Person, Search, Close } from '@mui/icons-material';

const CustomerModal = ({ showCustomerModal, handleCloseCustomerModal, onCustomerSelect, selectedCustomer }) => {
    const [customers, setCustomers] = useState([]);
    const [filteredCustomers, setFilteredCustomers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddEditModal, setShowAddEditModal] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [customersPerPage] = useState(5);

    const [customerForm, setCustomerForm] = useState({
        hoTen: '',
        email: '',
        sdt: '',
        ngaySinh: '',
        gioiTinh: 1,
        cccd: '',
        userType: 2, // 2 = USER
    });

    useEffect(() => {
        if (showCustomerModal) {
            fetchCustomers();
        }
    }, [showCustomerModal]);

    useEffect(() => {
        const filtered = customers.filter(
            (customer) =>
                customer.hoTen?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                customer.sdt?.includes(searchTerm) ||
                customer.cccd?.includes(searchTerm),
        );
        setFilteredCustomers(filtered);
        setCurrentPage(1);
    }, [customers, searchTerm]);

    const fetchCustomers = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/user/customers');
            setCustomers(response.data);
        } catch (error) {
            console.error('Lỗi khi lấy danh sách khách hàng:', error);
            swal('Lỗi!', 'Không thể lấy danh sách khách hàng', 'error');
        }
    };

    const handleAddCustomer = () => {
        setEditingCustomer(null);
        setCustomerForm({
            hoTen: '',
            email: '',
            sdt: '',
            ngaySinh: '',
            gioiTinh: 1,
            cccd: '',
            userType: 2, // 2 = USER
        });
        setShowAddEditModal(true);
    };

    const handleEditCustomer = (customer) => {
        setEditingCustomer(customer);
        setCustomerForm({
            hoTen: customer.hoTen || '',
            email: customer.email || '',
            sdt: customer.sdt || '',
            ngaySinh: customer.ngaySinh || '',
            gioiTinh: customer.gioiTinh || 1,
            cccd: customer.cccd || '',
            userType: customer.userType || 2, // 2 = USER
        });
        setShowAddEditModal(true);
    };

    const handleSaveCustomer = async () => {
        // Validate form
        if (!customerForm.hoTen || !customerForm.sdt) {
            swal('Lỗi!', 'Vui lòng nhập họ tên và số điện thoại', 'error');
            return;
        }

        // Validate email format if provided
        if (customerForm.email && !/\S+@\S+\.\S+/.test(customerForm.email)) {
            swal('Lỗi!', 'Email không hợp lệ', 'error');
            return;
        }

        // Validate phone number
        if (!/^[0-9]{10,11}$/.test(customerForm.sdt)) {
            swal('Lỗi!', 'Số điện thoại phải có 10-11 chữ số', 'error');
            return;
        }

        try {
            const customerData = {
                ...customerForm,
                ma: editingCustomer ? editingCustomer.ma : `KH${Date.now()}`,
                matKhau: editingCustomer ? editingCustomer.matKhau : '123456',
                trangThai: 1,
            };

            let response;
            if (editingCustomer) {
                response = await axios.put(`http://localhost:8080/api/user/${editingCustomer.id}`, customerData);
            } else {
                response = await axios.post('http://localhost:8080/api/user', customerData);
            }

            if (response.status === 200 || response.status === 201) {
                swal('Thành công!', `${editingCustomer ? 'Cập nhật' : 'Thêm'} khách hàng thành công`, 'success');
                setShowAddEditModal(false);
                fetchCustomers();
            }
        } catch (error) {
            console.error('Lỗi khi lưu khách hàng:', error);
            if (error.response?.status === 409) {
                swal('Lỗi!', 'Email hoặc số điện thoại đã tồn tại', 'error');
            } else {
                swal('Lỗi!', 'Không thể lưu thông tin khách hàng', 'error');
            }
        }
    };

    const handleDeleteCustomer = async (customerId) => {
        const result = await swal({
            title: 'Xác nhận xóa',
            text: 'Bạn có chắc chắn muốn xóa khách hàng này?',
            icon: 'warning',
            buttons: {
                cancel: 'Hủy',
                confirm: 'Xóa',
            },
            dangerMode: true,
        });

        if (result) {
            try {
                await axios.delete(`http://localhost:8080/api/user/${customerId}`);
                swal('Thành công!', 'Xóa khách hàng thành công', 'success');
                fetchCustomers();
            } catch (error) {
                console.error('Lỗi khi xóa khách hàng:', error);
                swal('Lỗi!', 'Không thể xóa khách hàng', 'error');
            }
        }
    };

    const handleSelectCustomer = (customer) => {
        onCustomerSelect(customer);
        handleCloseCustomerModal();
    };

    const handleFormChange = (field, value) => {
        setCustomerForm((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    const getUserTypeText = (userType) => {
        switch (userType) {
            case 0:
                return 'ADMIN';
            case 1:
                return 'STAFF';
            case 2:
                return 'USER';
            default:
                return 'USER';
        }
    };

    // Pagination
    const indexOfLastCustomer = currentPage * customersPerPage;
    const indexOfFirstCustomer = indexOfLastCustomer - customersPerPage;
    const currentCustomers = filteredCustomers.slice(indexOfFirstCustomer, indexOfLastCustomer);
    const totalPages = Math.ceil(filteredCustomers.length / customersPerPage);

    if (!showCustomerModal) return null;

    return (
        <>
            <Modal open={showCustomerModal} onClose={handleCloseCustomerModal} aria-labelledby="customer-modal-title">
                <Box
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '90%',
                        maxWidth: '1000px',
                        bgcolor: 'background.paper',
                        border: '2px solid #000',
                        boxShadow: 24,
                        p: 4,
                        maxHeight: '90vh',
                        overflow: 'auto',
                    }}
                >
                    <div className="flex justify-between items-center mb-4">
                        <Typography id="customer-modal-title" variant="h6" component="h2" className="flex items-center">
                            <Person className="mr-2" />
                            Quản lý khách hàng
                        </Typography>
                        <IconButton onClick={handleCloseCustomerModal}>
                            <Close />
                        </IconButton>
                    </div>

                    <div className="flex justify-between items-center mb-4">
                        <TextField
                            label="Tìm kiếm khách hàng"
                            variant="outlined"
                            size="small"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{
                                startAdornment: <Search className="mr-2 text-gray-400" />,
                            }}
                            sx={{ width: '300px' }}
                        />
                        <Button
                            variant="contained"
                            startIcon={<Add />}
                            onClick={handleAddCustomer}
                            sx={{ bgcolor: '#2f19ae', '&:hover': { bgcolor: '#241587' } }}
                        >
                            Thêm khách hàng
                        </Button>
                    </div>

                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                                    <TableCell>
                                        <strong>Mã KH</strong>
                                    </TableCell>
                                    <TableCell>
                                        <strong>Họ tên</strong>
                                    </TableCell>
                                    <TableCell>
                                        <strong>Email</strong>
                                    </TableCell>
                                    <TableCell>
                                        <strong>SĐT</strong>
                                    </TableCell>
                                    <TableCell>
                                        <strong>Ngày sinh</strong>
                                    </TableCell>
                                    <TableCell>
                                        <strong>Giới tính</strong>
                                    </TableCell>
                                    <TableCell>
                                        <strong>Thao tác</strong>
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {currentCustomers.length > 0 ? (
                                    currentCustomers.map((customer) => (
                                        <TableRow
                                            key={customer.id}
                                            sx={{
                                                '&:hover': { bgcolor: '#f9f9f9' },
                                                bgcolor: selectedCustomer?.id === customer.id ? '#e3f2fd' : 'inherit',
                                            }}
                                        >
                                            <TableCell>{customer.ma}</TableCell>
                                            <TableCell>{customer.hoTen}</TableCell>
                                            <TableCell>{customer.email}</TableCell>
                                            <TableCell>{customer.sdt}</TableCell>
                                            <TableCell>{formatDate(customer.ngaySinh)}</TableCell>
                                            <TableCell>{customer.gioiTinh === 1 ? 'Nam' : 'Nữ'}</TableCell>
                                            <TableCell>
                                                <div className="flex space-x-1">
                                                    <Button
                                                        size="small"
                                                        variant="contained"
                                                        color="primary"
                                                        onClick={() => handleSelectCustomer(customer)}
                                                        sx={{ minWidth: 'auto', px: 1 }}
                                                    >
                                                        Chọn
                                                    </Button>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleEditCustomer(customer)}
                                                        sx={{ color: '#ff9800' }}
                                                    >
                                                        <Edit fontSize="small" />
                                                    </IconButton>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleDeleteCustomer(customer.id)}
                                                        sx={{ color: '#f44336' }}
                                                    >
                                                        <Delete fontSize="small" />
                                                    </IconButton>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={7} align="center">
                                            Không có khách hàng nào
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {totalPages > 1 && (
                        <div className="flex justify-center mt-4">
                            <Pagination
                                count={totalPages}
                                page={currentPage}
                                onChange={(event, value) => setCurrentPage(value)}
                                color="primary"
                            />
                        </div>
                    )}
                </Box>
            </Modal>

            {/* Add/Edit Customer Modal */}
            <Dialog open={showAddEditModal} onClose={() => setShowAddEditModal(false)} maxWidth="md" fullWidth>
                <DialogTitle>{editingCustomer ? 'Cập nhật khách hàng' : 'Thêm khách hàng mới'}</DialogTitle>
                <DialogContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <TextField
                            label="Họ tên *"
                            fullWidth
                            value={customerForm.hoTen}
                            onChange={(e) => handleFormChange('hoTen', e.target.value)}
                            variant="outlined"
                        />
                        <TextField
                            label="Email"
                            fullWidth
                            type="email"
                            value={customerForm.email}
                            onChange={(e) => handleFormChange('email', e.target.value)}
                            variant="outlined"
                        />
                        <TextField
                            label="Số điện thoại *"
                            fullWidth
                            value={customerForm.sdt}
                            onChange={(e) => handleFormChange('sdt', e.target.value)}
                            variant="outlined"
                        />
                        <TextField
                            label="Ngày sinh"
                            fullWidth
                            type="date"
                            value={customerForm.ngaySinh}
                            onChange={(e) => handleFormChange('ngaySinh', e.target.value)}
                            variant="outlined"
                            InputLabelProps={{ shrink: true }}
                        />
                        <FormControl fullWidth variant="outlined">
                            <InputLabel>Giới tính</InputLabel>
                            <Select
                                value={customerForm.gioiTinh}
                                onChange={(e) => handleFormChange('gioiTinh', e.target.value)}
                                label="Giới tính"
                            >
                                <MenuItem value={1}>Nam</MenuItem>
                                <MenuItem value={0}>Nữ</MenuItem>
                            </Select>
                        </FormControl>
                        <TextField
                            label="CCCD"
                            fullWidth
                            value={customerForm.cccd}
                            onChange={(e) => handleFormChange('cccd', e.target.value)}
                            variant="outlined"
                        />
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowAddEditModal(false)} color="secondary">
                        Hủy
                    </Button>
                    <Button onClick={handleSaveCustomer} variant="contained" color="primary">
                        {editingCustomer ? 'Cập nhật' : 'Thêm mới'}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default CustomerModal;
