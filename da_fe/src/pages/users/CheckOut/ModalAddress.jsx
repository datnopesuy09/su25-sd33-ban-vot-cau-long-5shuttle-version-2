import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    List,
    ListItem,
    ListItemText,
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

const ModalAddress = ({ open, onClose, onSelect, defaultAddress }) => {
    const [addresses, setAddresses] = useState([]);

    const formatPhoneNumber = (phone) => {
        if (!phone) return '';
        return phone.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3');
    };

    useEffect(() => {
        if (open) {
            fetchAddresses();
        }
    }, [open]);

    const fetchAddresses = async () => {
        try {
            const res = await axios.get('http://localhost:8080/dia-chi/getMyAddress', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('userToken')}`,
                },
            });

            let all = res.data.result;

            // Ưu tiên địa chỉ đang chọn lên đầu
            const selectedId = defaultAddress?.id;
            const defaultIndex = all.findIndex(a => a.loai === 1);
            const selectedIndex = all.findIndex(a => a.id === selectedId);

            const sorted = [...all];

            // Nếu có selected khác mặc định
            if (selectedIndex > -1 && selectedIndex !== 0) {
                const [selected] = sorted.splice(selectedIndex, 1);
                sorted.unshift(selected);
            }

            // Đưa mặc định lên vị trí thứ 2 nếu khác selected
            if (defaultIndex > -1 && defaultIndex !== 0 && defaultIndex !== selectedIndex) {
                const idx = sorted.findIndex(a => a.loai === 1);
                const [defaultAddr] = sorted.splice(idx, 1);
                sorted.splice(1, 0, defaultAddr);
            }

            setAddresses(sorted);
        } catch (err) {
            console.error('Lỗi khi lấy danh sách địa chỉ:', err);
        }
    };


    const handleSelect = (address) => {
        const isSame = defaultAddress?.id === address.id;
        if (isSame) {
            onClose();
            return;
        }

        const confirmChange = window.confirm("Bạn có chắc muốn sử dụng địa chỉ này?");
        if (confirmChange) {
            onSelect(address); // Truyền địa chỉ về CheckOut.jsx
            onClose();         // Đóng modal
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>Chọn địa chỉ giao hàng</DialogTitle>
            <DialogContent dividers>
                <List>
                    {addresses.map((address) => {
                        const isSelected = defaultAddress?.id === address.id;
                        return (
                            <ListItem
                                button
                                key={address.id}
                                onClick={() => handleSelect(address)}
                                sx={{
                                    border: '2px solid',
                                    borderColor: '#ddd',
                                    position: 'relative',
                                    cursor: 'pointer',
                                    borderRadius: 1,
                                    mb: 1,
                                    '&:hover': { borderColor: '#e4e2edff' },
                                }}

                            >
                                <ListItemText
                                    primary={`${address.ten} | ${formatPhoneNumber(address.sdt)}`}
                                    secondary={
                                        <>
                                            <p>{address.diaChiCuThe}</p>
                                            <p>{address.xa}, {address.huyen}, {address.tinh}</p>
                                            {address.loai === 1 && (
                                                <span className="inline-block mt-2 px-2 py-0.5 text-xs text-green-600 border border-green-500">
                                                    Mặc định
                                                </span>
                                            )}
                                            {isSelected && (
                                                <CheckCircleOutlineIcon
                                                    color='success'
                                                    sx={{
                                                        position: 'absolute',
                                                        top: 8,
                                                        right: 8,
                                                        // color: 'green',
                                                    }}
                                                />
                                            )}
                                        </>
                                    }
                                />
                            </ListItem>
                        )
                    })}
                </List>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} variant="outlined">
                    Trở về
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ModalAddress;