import React, { useEffect, useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Paper,
  Stack,
  Grid
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

function Profile() {
  const [open, setOpen] = useState(true);
  const [user, setUser] = useState({ hoTen: '', avatar: null });

  useEffect(() => {
    // Giả lập dữ liệu user thay vì gọi API
    const fakeUser = {
      hoTen: 'Nguyễn Văn A',
      avatar: 'https://i.pravatar.cc/150?img=3'
    };
    setTimeout(() => {
      setUser(fakeUser);
    }, 500);
  }, []);

  return (
    <Box sx={{ backgroundColor: '#f5f5f5', minHeight: '100vh'}}>
      <Typography variant="h6" gutterBottom>
        <Link to="/home" style={{ textDecoration: 'none', color: '#000', fontWeight: 600 }}>Trang chủ</Link>
        <Typography component="span" sx={{ mx: 1 }}>/</Typography>
        <Typography component="span" color="text.secondary">Tài khoản của tôi</Typography>
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Stack direction="row" spacing={2} alignItems="center" mb={2}>
              <Avatar src={user.avatar} sx={{ width: 64, height: 64 }} />
              <Box>
                <Typography fontWeight={600}>{user?.hoTen}</Typography>
                <Link to="/profile/user" style={{ fontSize: 14, display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
                  <Edit fontSize="small" sx={{ mr: 0.5 }} /> Sửa hồ sơ
                </Link>
              </Box>
            </Stack>
            <Divider sx={{ mb: 2 }} />

            <List>
              <ListItemButton onClick={() => setOpen(!open)}>
                <ListItemIcon><Person /></ListItemIcon>
                <ListItemText primary="Tài khoản của tôi" />
                {open ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
              <Collapse in={open} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  <ListItem disablePadding>
                    <ListItemButton component={Link} to="user" sx={{ pl: 4 }}>
                      <ListItemIcon><Badge /></ListItemIcon>
                      <ListItemText primary="Hồ sơ" />
                    </ListItemButton>
                  </ListItem>
                  <ListItem disablePadding>
                    <ListItemButton component={Link} to="address" sx={{ pl: 4 }}>
                      <ListItemIcon><LocationOn /></ListItemIcon>
                      <ListItemText primary="Địa chỉ" />
                    </ListItemButton>
                  </ListItem>
                </List>
              </Collapse>

              <ListItemButton component={Link} to="order">
                <ListItemIcon><ReceiptLong /></ListItemIcon>
                <ListItemText primary="Đơn mua" />
              </ListItemButton>

              <ListItemButton component={Link} to="my-voucher">
                <ListItemIcon><LocalOffer /></ListItemIcon>
                <ListItemText primary="Phiếu giảm giá" />
              </ListItemButton>

              <ListItemButton component={Link} to="change-password">
                <ListItemIcon><VpnKey /></ListItemIcon>
                <ListItemText primary="Đổi mật khẩu" />
              </ListItemButton>
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Outlet />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
export default Profile;
