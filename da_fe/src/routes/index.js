// Pages
import AdminLayout from '../components/Layout/AdminLayout';
import Admin from '../pages/admin';
import Balance from '../pages/admin/Balance';
import Brand from '../pages/admin/Brand';
import Color from '../pages/admin/Color';
import Material from '../pages/admin/Material';
import SanPham from '../pages/admin/Product';
import Stiff from '../pages/admin/Stiff';
import Weight from '../pages/admin/Weight';

import ModalKhachHang from '../pages/admin/khuyenmai/ModalKhachHang';

import ListStaff from '../pages/admin/nhanvien';
import AddStaff from '../pages/admin/nhanvien/add';
import EditStaff from '../pages/admin/nhanvien/edit';
import Home from '../pages/users/Home';
import AdLogin from '../pages/admin/ad-login.jsx';
import Profile from '../pages/users/TaiKhoan/profile.jsx';
import Sign from '../pages/users/DangNhap/sign.jsx';
import ForgotPassword from '../pages/users/DangNhap/forgot-password.jsx';
import UserInfo from '../pages/users/TaiKhoan/userInfo.jsx';

import customer from '../pages/admin/customer/index.jsx';
import AddCustomer from '../pages/admin/customer/add.jsx';
import EditCustomer from '../pages/admin/customer/edit.jsx';

import Product from '../pages/users/Product/Product';
import ProductAdmin from '../pages/admin/Product';
import AddProduct from '../pages/admin/Product/Add';

import Cart from '../pages/users/Cart/Cart';
import ProductDetail from '../pages/users/ProductDetail/ProductDetail';
import CheckOut from '../pages/users/CheckOut/CheckOut';
import SuccessOrder from '../pages/users/SuccessOrder/SuccessOrder';
import OrderStatus from '../pages/admin/Order/OrderStatus';
import Order from '../pages/admin/Order';
import Indexx from '../pages/admin/Giảm Giá/PhieuGiamGia/index.jsx';
import AddVoucher from '../pages/admin/Giảm Giá/PhieuGiamGia/add.jsx';
import OfflineSale from '../pages/admin/Sale/index.jsx';
import DotGiamGia from '../pages/admin/Giảm Giá/Đợt Giảm Giá/index.jsx';
import AddDotGiamGia from '../pages/admin/Giảm Giá/Đợt Giảm Giá/add.jsx';
import UpdateDotGiamGia from '../pages/admin/Giảm Giá/Đợt Giảm Giá/update.jsx';
import PhieuGiamGia from '../pages/admin/Giảm Giá/PhieuGiamGia/index.jsx';
import UpdatePhieuGiamGia from '../pages/admin/Giảm Giá/PhieuGiamGia/update.jsx';
import UserOrder from '../pages/users/TaiKhoan/order.jsx';
import OrderDetail from '../pages/users/TaiKhoan/orderDetail.jsx';
import ThongKe from '../pages/admin/HoaDon/ThongKe';
import ResponsiveAppBar from '../pages/admin';
import ChangePassword from '../pages/users/TaiKhoan/changePass.jsx';
import AddressUser from '../pages/users/TaiKhoan/userAdress.jsx';
import MyVoucher from '../pages/users/TaiKhoan/myVoucher.jsx';
import AdminInfo from '../pages/admin/ad-info.jsx';
import MyOrderDetail from '../pages/admin/nhanvien/draft.jsx';
import { computeAxisValue } from '@mui/x-charts/internals';
import UpdateProduct from '../pages/admin/Product/update.jsx';
import ModalReturn from '../pages/users/TaiKhoan/demo.jsx';
import orderReturn from '../pages/users/TaiKhoan/orderReturn.jsx';
// Public routes
const publicRoutes = [
    { path: '/', component: Home },
    { path: '/admin', component: Admin, layout: AdminLayout },

    { path: '/admin/tai-khoan/khach-hang', component: customer, layout: AdminLayout },
    { path: '/admin/tai-khoan/khach-hang/add', component: AddCustomer, layout: AdminLayout },
    { path: '/admin/tai-khoan/khach-hang/edit/:id', component: EditCustomer, layout: AdminLayout },
    { path: '/admin/thong-ke', component: ThongKe, layout: AdminLayout },
    { path: '/admin/ban-hang-tai-quay', component: OfflineSale, layout: AdminLayout },

    { path: '/admin/quan-ly-san-pham/mau-sac', component: Color, layout: AdminLayout },
    { path: '/admin/quan-ly-san-pham/san-pham', component: SanPham, layout: AdminLayout },
    { path: '/admin/quan-ly-san-pham/diem-can-bang', component: Balance, layout: AdminLayout },
    { path: '/admin/quan-ly-san-pham/thuong-hieu', component: Brand, layout: AdminLayout },
    { path: '/admin/quan-ly-san-pham/chat-lieu', component: Material, layout: AdminLayout },
    { path: '/admin/quan-ly-san-pham/trong-luong', component: Weight, layout: AdminLayout },
    { path: '/admin/quan-ly-san-pham/do-cung', component: Stiff, layout: AdminLayout },
    { path: '/san-pham', component: Product },
    { path: '/admin/quan-ly-san-pham/san-pham-ct', component: ProductAdmin, layout: AdminLayout },
    { path: '/admin/quan-ly-san-pham/san-pham-ct/add', component: AddProduct, layout: AdminLayout },
    { path: '/admin/quan-ly-san-pham/san-pham-ct/:id/update', component: UpdateProduct, layout: AdminLayout },
    { path: '/gio-hang', component: Cart },
    { path: '/xac-nhan-don-hang', component: SuccessOrder },
    { path: '/san-pham/san-pham-ct/:id', component: ProductDetail },
    { path: '/admin/quan-ly-don-hang', component: Order, layout: AdminLayout },
    { path: '/admin/quan-ly-don-hang/order-status', component: OrderStatus, layout: AdminLayout },
    { path: '/gio-hang/checkout', component: CheckOut },
    { path: '/admin/giam-gia/phieu-giam-gia/add', component: AddVoucher, layout: AdminLayout },
    { path: '/admin/giam-gia/phieu-giam-gia', component: PhieuGiamGia, layout: AdminLayout },
    { path: `/admin/giam-gia/phieu-giam-gia/:id/detail`, component: UpdatePhieuGiamGia, layout: AdminLayout },
    { path: '/admin/giam-gia/dot-giam-gia', component: DotGiamGia, layout: AdminLayout },
    { path: '/admin/giam-gia/dot-giam-gia/add', component: AddDotGiamGia, layout: AdminLayout },
    { path: '/admin/giam-gia/dot-giam-gia/:id/detail', component: UpdateDotGiamGia, layout: AdminLayout },

    { path: '/admin/tai-khoan/nhan-vien', component: ListStaff, layout: AdminLayout },
    { path: '/admin/tai-khoan/nhan-vien/add', component: AddStaff, layout: AdminLayout },
    { path: '/admin/tai-khoan/nhan-vien/edit/:id', component: EditStaff, layout: AdminLayout },
    { path: '/admin/login', component: AdLogin, layout: null },
    { path: '/admin/tai-khoan-ca-nhan', component: AdminInfo, layout: AdminLayout },
    {
        path: '/profile',
        component: Profile,
        children: [
            { path: 'user', component: UserInfo, layout: null },
            { path: 'order', component: UserOrder, layout: null },
            { path: 'order-detail/:id', component: OrderDetail, layout: null },
            { path: 'change-password', component: ChangePassword, layout: null },
            { path: 'address', component: AddressUser, layout: null },
            { path: 'my-voucher', component: MyVoucher, layout: null },
            { path: 'order-return/:id', component: orderReturn, layout: null },
        ],
    },
    { path: '/login', component: Sign },

    { path: '/forgot-password', component: ForgotPassword },
    { path: '/admin/thong-ke', component: ThongKe, layout: AdminLayout },

    { path: '/test', component: ResponsiveAppBar, layout: null },
     { path: '/check', component: ModalReturn, layout: null },

];

const privateRoutes = [];

export { publicRoutes, privateRoutes };
