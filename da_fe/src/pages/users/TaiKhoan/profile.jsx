import React, { useEffect, useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import {
  Box,
  Typography,
  Avatar,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Paper,
} from '@mui/material';
import {
  ExpandLess,
  ExpandMore,
  Edit,
  LocationOn,
  VpnKey,
  LocalOffer,
  ReceiptLong,
  Badge,
  Person
} from '@mui/icons-material';
import { useUserAuth } from '../../../contexts/userAuthContext';

function Profile() {
  const [open, setOpen] = useState(true);
  const { user } = useUserAuth();

  return (
    <Box sx={{ my: 1}}>
      <Box sx={{ mb: 1, px: 1, display: 'flex', alignItems: 'center' }}>
        <Link to="/" style={{ textDecoration: 'none', color: '#000', fontWeight: 600 }}>
          Trang chủ
        </Link>
        <Typography sx={{ mx: 1 }}>/</Typography>
        <Typography color="text.secondary">Tài khoản của tôi</Typography>
      </Box>

      {/* Main Grid */}
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 4fr', gap: 3 }}>
        {/* Sidebar */}
        <Paper sx={{ p: 2, borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.75 }}>
            <Avatar
              src={user?.avatar}
              alt={user?.hoTen}
              sx={{ width: 54, height: 54, mr: 2 }}
            />
            <Box>
              <Typography fontWeight="bold">{user?.hoTen}</Typography>
              <Link to="/profile/user" style={{ fontSize: 14, display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
                <Edit fontSize="small" sx={{ mr: 0.5 }} /> Sửa hồ sơ
              </Link>
            </Box>
          </Box>

          <Divider sx={{ mb: 2 }} />

          {/* Tài khoản của tôi */}
          <List disablePadding>
            <ListItemButton onClick={() => setOpen(!open)}>
              <ListItemIcon>
                <Person />
              </ListItemIcon>
              <ListItemText primary="Tài khoản của tôi" />
              {open ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
            <Collapse in={open} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <ListItemButton component={Link} to="/profile/user" sx={{ pl: 4 }}>
                  <ListItemIcon>
                    <Badge />
                  </ListItemIcon>
                  <ListItemText primary="Hồ sơ" />
                </ListItemButton>
                <ListItemButton component={Link} to="/profile/address" sx={{ pl: 4 }}>
                  <ListItemIcon>
                    <LocationOn />
                  </ListItemIcon>
                  <ListItemText primary="Địa chỉ" />
                </ListItemButton>
              </List>
            </Collapse>

            <Divider sx={{ my: 2 }} />

            {/* Các mục khác */}
            <ListItemButton component={Link} to="/profile/order">
              <ListItemIcon>
                <ReceiptLong />
              </ListItemIcon>
              <ListItemText primary="Đơn mua" />
            </ListItemButton>
            <ListItemButton component={Link} to="/profile/my-voucher">
              <ListItemIcon>
                <LocalOffer />
              </ListItemIcon>
              <ListItemText primary="Phiếu giảm giá" />
            </ListItemButton>
            <ListItemButton component={Link} to="/profile/change-password">
              <ListItemIcon>
                <VpnKey />
              </ListItemIcon>
              <ListItemText primary="Đổi mật khẩu" />
            </ListItemButton>
          </List>
        </Paper>

        {/* Nội dung bên phải */}
        <Paper sx={{ px: 3, py: 2, borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}>
          <Outlet />
        </Paper>
      </Box>
    </Box>
  );
}

export default Profile;
