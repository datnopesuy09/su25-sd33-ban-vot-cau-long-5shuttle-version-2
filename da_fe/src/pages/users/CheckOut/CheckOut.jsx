import { useContext, useEffect, useState, useRef } from 'react';
import axios from 'axios';
import swal from 'sweetalert';
import { useLocation, useNavigate } from 'react-router-dom';
import ShippingInfo from './ShippingInfo';
import OrderSummary from './OrderSummary';
import DiscountModal from './DiscountModal';

import { useAdminAuth } from '../../../contexts/adminAuthContext';

import ModalAddress from './ModalAddress';
import { useUserAuth } from '../../../contexts/userAuthContext';
import { CartContext } from '../Cart/CartContext';
import { Button } from '@mui/material';
import { toast } from 'react-toastify';
import CircularProgress from '@mui/material/CircularProgress';
import BulkOrderNotification from '../../../components/BulkOrderNotification';
import useBulkOrderDetection from '../../../hooks/useBulkOrderDetection';
import bulkOrderAPI from '../../../services/bulkOrderAPI';

function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map(function (c) {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                })
                .join(''),
        );
        return JSON.parse(jsonPayload);
    } catch {
        return {};
    }
}
const CheckOut = () => {
    const navigate = useNavigate();

    const location = useLocation();
    // Giả sử idTaiKhoan được truyền qua location.state hoặc dùng giá trị mặc định
    const { user } = useUserAuth();
    const { admin } = useAdminAuth();
    
    // Cải thiện logic lấy token
    const userToken = user?.token || localStorage.getItem('userToken') || localStorage.getItem('token');
    const adminToken = admin?.token || localStorage.getItem('adminToken');
    
    const idTaiKhoan = user?.id || parseJwt(userToken)?.sub || parseJwt(userToken)?.id || localStorage.getItem('idKhachHang');
    const idAdmin = admin?.id || parseJwt(adminToken)?.sub || parseJwt(adminToken)?.id;
    
    console.log('iduser checkout: ', idTaiKhoan);
    console.log('userToken: ', userToken);
    console.log('idadmin checkout: ', idAdmin);

    const { setCartItemCount } = useContext(CartContext);

    const [carts, setCarts] = useState([]);
    const [formData, setFormData] = useState({
        ten: '',
        diaChiCuThe: '',
        sdt: '',
        province: '',
        district: '',
        ward: '',
        provinceName: '',
        districtName: '',
        wardName: '',
    });

    const [errors, setErrors] = useState({});
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);
    const [discounts, setDiscounts] = useState([]);
    const [selectedDiscount, setSelectedDiscount] = useState(null);
    const [promoCode, setPromoCode] = useState('');
    const [promoDiscount, setPromoDiscount] = useState(0);
    const [totalPrice, setTotalPrice] = useState(0);
    const [discountedPrice, setDiscountedPrice] = useState(0);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [shippingFee, setShippingFee] = useState(30000);
    const [smartShippingData, setSmartShippingData] = useState({
        districtId: null,
        wardCode: null,
        quantity: 0
    });
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [defaultAddress, setDefaultAddress] = useState(null);
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [isDefaultAddress, setIsDefaultAddress] = useState(false);
    const [userAddresses, setUserAddresses] = useState([]);
    const [isLoadingAddress, setIsLoadingAddress] = useState(false);

    const selectedItems = location.state?.selectedItems || [];
    const isBuyNow = location.state?.buyNow || false; // Kiểm tra có phải là mua ngay không

    // Bulk order detection
    const { shouldShowBulkWarning, bulkOrderData, resetBulkWarning } = useBulkOrderDetection(carts, totalPrice);
    const [bulkInquiryId, setBulkInquiryId] = useState(null);
    const creatingRef = useRef(false);

    const buildBulkInquiryPayload = () => ({
        customerInfo: {
            name: user?.hoTen || user?.name || 'Khách hàng',
            phone: user?.sdt || 'N/A',
            email: user?.email || 'unknown@example.com',
            note: 'Tự động tạo từ trang thanh toán',
        },
        orderData: {
            totalQuantity: bulkOrderData.totalQuantity || carts.reduce((s, i) => s + (i.soLuong || 0), 0),
            totalValue: totalPrice,
            itemCount: carts.length,
        },
        // Do not default contact method here; leave null until the customer chooses
        contactMethod: null,
    });

    useEffect(() => {
        const createIfNeeded = async () => {
            if (shouldShowBulkWarning && !bulkInquiryId && !creatingRef.current) {
                creatingRef.current = true;
                try {
                    const created = await bulkOrderAPI.createBulkOrderInquiry(buildBulkInquiryPayload());
                    setBulkInquiryId(created.id || created?.result?.id);
                } catch (err) {
                    console.error('Không tạo được bulk inquiry', err);
                } finally {
                    creatingRef.current = false;
                }
            }
        };
        createIfNeeded();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [shouldShowBulkWarning, totalPrice]);

    const formatPhoneNumber = (phone) => {
        if (!phone) return '';
        return phone.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3');
    };

    useEffect(() => {
        if (idTaiKhoan) {
            fetchCart();
            fetchProvinces();
            fetchDiscounts();
            fetchDefaultAddress();
            fetchUserAddresses();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [idTaiKhoan]);

    // Effect để tự động tính phí ship khi có thông tin địa chỉ
    useEffect(() => {
        console.log('SmartShippingData changed:', smartShippingData);
        if (smartShippingData.districtId && smartShippingData.wardCode && smartShippingData.quantity > 0) {
            console.log('Tính phí ship với:', {
                districtId: smartShippingData.districtId,
                wardCode: smartShippingData.wardCode,
                quantity: smartShippingData.quantity
            });
            calculateShippingFee(smartShippingData.districtId, smartShippingData.wardCode, smartShippingData.quantity);
        } else {
            console.log('Thiếu thông tin để tính phí ship, sử dụng mặc định');
            setShippingFee(30000);
        }
    }, [smartShippingData.districtId, smartShippingData.wardCode, smartShippingData.quantity]);

    // Effect để cập nhật discountedPrice khi shippingFee hoặc promoDiscount thay đổi
    useEffect(() => {
        setDiscountedPrice(totalPrice - promoDiscount + shippingFee);
    }, [totalPrice, promoDiscount, shippingFee]);

    // Effect để cập nhật thông tin shipping từ địa chỉ mặc định
    useEffect(() => {
        if (defaultAddress) {
            // Nếu có district/ward code từ địa chỉ mặc định
            const districtId = defaultAddress.districtCode || null;
            const wardCode = defaultAddress.wardCode || null;
            
            setSmartShippingData(prev => ({
                ...prev,
                districtId,
                wardCode
            }));

            // Nếu không có code, thử tìm kiếm dựa trên tên
            if (!districtId || !wardCode) {
                findDistrictAndWardCodes(defaultAddress.tinh, defaultAddress.huyen, defaultAddress.xa);
            }
        }
    }, [defaultAddress]);

    // Hàm tìm district và ward code từ tên
    const findDistrictAndWardCodes = async (provinceName, districtName, wardName) => {
        try {
            // Tìm province code
            const provincesRes = await axios.get('https://provinces.open-api.vn/api/p/');
            const province = provincesRes.data.find(p => 
                p.name.toLowerCase().includes(provinceName.toLowerCase()) ||
                provinceName.toLowerCase().includes(p.name.toLowerCase())
            );

            if (province) {
                // Tìm district code
                const districtsRes = await axios.get(`https://provinces.open-api.vn/api/p/${province.code}?depth=2`);
                const district = districtsRes.data.districts.find(d => 
                    d.name.toLowerCase().includes(districtName.toLowerCase()) ||
                    districtName.toLowerCase().includes(d.name.toLowerCase())
                );

                if (district) {
                    // Tìm ward code
                    const wardsRes = await axios.get(`https://provinces.open-api.vn/api/d/${district.code}?depth=2`);
                    const ward = wardsRes.data.wards.find(w => 
                        w.name.toLowerCase().includes(wardName.toLowerCase()) ||
                        wardName.toLowerCase().includes(w.name.toLowerCase())
                    );

                    if (ward) {
                        setSmartShippingData(prev => ({
                            ...prev,
                            districtId: district.code,
                            wardCode: ward.code
                        }));
                        console.log('Đã tìm thấy district code:', district.code, 'ward code:', ward.code);
                    }
                }
            }
        } catch (error) {
            console.error('Lỗi khi tìm district/ward code:', error);
        }
    };

    const fetchCart = async () => {
        try {
            const res = await axios.get(`http://localhost:8080/api/gio-hang/${idTaiKhoan}`);
            const filteredCarts = res.data.filter((item) => selectedItems.includes(item.id));
            setCarts(filteredCarts);
            console.log('res: ', res);
            console.log('fiuto cart: ', filteredCarts);

            const total = filteredCarts.reduce((sum, item) => {
                const price = item.sanPhamCT.giaKhuyenMai || item.sanPhamCT.donGia;
                return sum + price * item.soLuong;
            }, 0);

            setTotalPrice(total);
            setDiscountedPrice(total);
            
            // Cập nhật số lượng sản phẩm cho shipping
            const totalQuantity = filteredCarts.reduce((sum, item) => sum + item.soLuong, 0);
            setSmartShippingData(prev => ({
                ...prev,
                quantity: totalQuantity
            }));
        } catch (err) {
            console.error('Không thể lấy giỏ hàng', err);
            swal('Lỗi', 'Không thể lấy giỏ hàng', 'error');
        }
    };
    console.log('gio hang: ', carts);
    const fetchDefaultAddress = async () => {
        setIsLoadingAddress(true);
        try {
            const res = await axios.get('http://localhost:8080/dia-chi/mac-dinh', {
                headers: {
                    Authorization: `Bearer ${userToken}`,
                },
            });
            setDefaultAddress(res.data.result);
        } catch (err) {
            console.error('Không thể lấy địa chỉ mặc định:', err);
            console.error('Token used:', userToken);
            setDefaultAddress(null);
        } finally {
            setIsLoadingAddress(false);
        }
    };

    const fetchUserAddresses = async () => {
        try {
            const res = await axios.get('http://localhost:8080/dia-chi/getMyAddress', {
                headers: {
                    Authorization: `Bearer ${userToken}`,
                },
            });
            setUserAddresses(res.data.result);
            // setIsFirstAddress(res.data.result.length === 0);
        } catch (err) {
            console.error('Không thể lấy danh sách địa chỉ:', err);
            console.error('Token used:', userToken);
        }
    };

    const handleOpenAddressForm = () => {
        const isFirst = userAddresses.length === 0;

        setFormData({
            ten: '',
            sdt: '',
            diaChiCuThe: '',
            province: '',
            district: '',
            ward: '',
            provinceName: '',
            districtName: '',
            wardName: '',
        });

        setIsDefaultAddress(isFirst); // Tích sẵn nếu là địa chỉ đầu tiên
        // setIsFirstAddress(isFirst);
        setDistricts([]);
        setWards([]);
        setErrors({});
        setShowAddressForm(true);
    };

    const fetchProvinces = async () => {
        try {
            const res = await axios.get('https://provinces.open-api.vn/api/p/');
            setProvinces(res.data);
        } catch (error) {
            console.error('Không thể lấy danh sách tỉnh thành:', error);
            toast.error('Không thể lấy danh sách tỉnh/thành phố.');
        }
    };

    const fetchDistricts = async (provinceCode) => {
        try {
            const res = await axios.get(`https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`);
            setDistricts(res.data.districts);
            setWards([]);
            setShippingFee(provinceCode === 'someProvinceCode' ? 30000 : 50000);
        } catch (error) {
            console.error('Không thể lấy danh sách huyện/thị xã:', error);
            toast.error('Không thể lấy danh sách quận/huyện.');
        }
    };

    const fetchWards = async (districtCode) => {
        try {
            const res = await axios.get(`https://provinces.open-api.vn/api/d/${districtCode}?depth=2`);
            setWards(res.data.wards);
        } catch (error) {
            console.error('Không thể lấy danh sách xã/phường:', error);
            toast.error('Không thể lấy danh sách xã/phường.');
        }
    };

    const fetchDiscounts = async () => {
        try {
            const res = await axios.get('http://localhost:8080/api/phieu-giam-gia/hien-thi');
            const validDiscounts = res.data.filter(
                (discount) => new Date(discount.ngayKetThuc) >= new Date() && discount.soLuong > 0,
            );
            setDiscounts(validDiscounts);
        } catch (error) {
            console.error('Không thể lấy danh sách khuyến mãi:', error);
            toast.error('Không thể lấy danh sách phiếu giảm giá.');
        }
    };

    const validateDiscount = (discount, totalPrice) => {
        if (totalPrice < discount.dieuKienNhoNhat) {
            swal('Lỗi', `Đơn hàng phải có tổng giá trị từ ${discount.dieuKienNhoNhat.toLocaleString()} VNĐ`, 'error');
            return null;
        }
        let discountAmount = (totalPrice * discount.giaTri) / 100;
        if (discountAmount > discount.giaTriMax) {
            discountAmount = discount.giaTriMax;
            swal('Thông báo', `Giảm giá tối đa là ${discount.giaTriMax.toLocaleString()} VNĐ`, 'info');
        }
        return discountAmount;
    };

    const handleSelectDiscount = (discount) => {
        const discountAmount = validateDiscount(discount, totalPrice);
        if (discountAmount !== null) {
            setSelectedDiscount(discount);
            setPromoDiscount(discountAmount);
            setPromoCode(discount.ma);
            setShowModal(false);
            // discountedPrice sẽ được cập nhật tự động qua useEffect
        }
    };

    const handleRemoveDiscount = () => {
        setSelectedDiscount(null);
        setPromoDiscount(0);
        setPromoCode('');
        // discountedPrice sẽ được cập nhật tự động qua useEffect
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => {
            const newFormData = { ...prev, [name]: value };
            if (name === 'province') {
                newFormData.district = '';
                newFormData.ward = '';
                newFormData.provinceName = provinces.find((p) => p.code === value)?.name || '';
                setDistricts([]);
                setWards([]);
                fetchDistricts(value);
            } else if (name === 'district') {
                newFormData.ward = '';
                newFormData.districtName = districts.find((d) => d.code === value)?.name || '';
                setWards([]);
                fetchWards(value);
                
                // Cập nhật thông tin shipping
                setSmartShippingData(prev => ({
                    ...prev,
                    districtId: value,
                    wardCode: null
                }));
            } else if (name === 'ward') {
                newFormData.wardName = wards.find((w) => w.code === value)?.name || '';
                
                // Cập nhật thông tin shipping
                setSmartShippingData(prev => ({
                    ...prev,
                    wardCode: value
                }));
            }
            return newFormData;
        });

        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: false }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.ten.trim()) newErrors.addressName = 'Họ và tên là bắt buộc';
        if (!formData.diaChiCuThe.trim()) newErrors.addressDetail = 'Địa chỉ chi tiết là bắt buộc';
        if (!formData.province) newErrors.province = 'Vui lòng chọn tỉnh/thành phố';
        if (!formData.district) newErrors.district = 'Vui lòng chọn quận/huyện';
        if (!formData.ward) newErrors.ward = 'Vui lòng chọn xã/phường';
        if (!formData.sdt.trim()) {
            newErrors.mobile = 'Số điện thoại là bắt buộc';
        } else if (!/^(0\d{9})$/.test(formData.sdt)) {
            newErrors.mobile = 'Số điện thoại phải gồm 10 chữ số và bắt đầu bằng 0';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Callback để cập nhật phí ship từ SmartShippingFee component (không còn sử dụng)
    const handleShippingFeeChange = (newShippingFee) => {
        setShippingFee(newShippingFee);
        // discountedPrice sẽ được cập nhật tự động qua useEffect
    };

    // Tính phí ship tự động
    const calculateShippingFee = async (districtId, wardCode, quantity) => {
        console.log('===== DEBUG SHIPPING FEE =====');
        console.log('districtId:', districtId, 'type:', typeof districtId);
        console.log('wardCode:', wardCode, 'type:', typeof wardCode);
        console.log('quantity:', quantity, 'type:', typeof quantity);
        
        if (!districtId || !wardCode || quantity <= 0) {
            console.log('Thiếu thông tin, sử dụng phí mặc định');
            setShippingFee(30000); // Phí mặc định
            return;
        }

        try {
            console.log('Sending request to shipping API with:', { districtId, wardCode, quantity });
            const result = await shippingService.calculateShippingFee(districtId, wardCode, quantity);
            console.log('API response:', result);
            if (result && result.shippingFee) {
                setShippingFee(result.shippingFee);
                console.log('Đã tính phí ship thông minh:', result.shippingFee);
            } else {
                setShippingFee(30000);
                console.log('Sử dụng phí ship mặc định');
            }
        } catch (error) {
            console.error('Lỗi khi tính phí ship:', error);
            setShippingFee(30000); // Fallback về phí mặc định
        }
    };

    const handleSubmit = async () => {
        if (carts.length === 0) {
            swal('Lỗi', 'Giỏ hàng của bạn đang trống!', 'error');
            return;
        }

        let shippingInfo = null;

        if (showAddressForm) {
            if (!validateForm()) return;
            shippingInfo = {
                sdt: formData.sdt,
                hoTen: formData.ten,
                email: user.email,
                diaChiCuThe: formData.diaChiCuThe,
                xa: formData.wardName,
                huyen: formData.districtName,
                tinh: formData.provinceName,
                // Thêm district và ward code để tính phí ship
                districtCode: formData.district,
                wardCode: formData.ward,
            };
        } else {
            if (!defaultAddress) {
                swal('Lỗi', 'Bạn chưa có địa chỉ giao hàng.', 'error');
                return;
            }
            shippingInfo = {
                sdt: defaultAddress.sdt,
                hoTen: defaultAddress.ten,
                email: user.email,
                diaChiCuThe: defaultAddress.diaChiCuThe,
                xa: defaultAddress.xa,
                huyen: defaultAddress.huyen,
                tinh: defaultAddress.tinh,
                // Thêm district và ward code nếu có
                districtCode: defaultAddress.districtCode || smartShippingData.districtId,
                wardCode: defaultAddress.wardCode || smartShippingData.wardCode,
            };
        }

        if (!selectedPaymentMethod) {
            swal('Lỗi', 'Vui lòng chọn phương thức thanh toán.', 'error');
            return;
        }

        const cartItems = carts.map((item) => ({
            sanPhamCTId: item.sanPhamCT.id,
            soLuong: item.soLuong,
            preOrder: item.preOrder || false,
        }));

        const orderData = {
            idTaiKhoan,
            thongTinGiaoHang: shippingInfo,
            cartItems,
            discountId: selectedDiscount?.id || null,
            phuongThucThanhToan: selectedPaymentMethod,
        };
        console.log('orderData:', orderData);
        try {
            const response = await axios.post('http://localhost:8080/api/dat-hang', orderData);

            if (response.status === 200) {
                // Trường hợp sản phẩm hết hàng
                if (response.data.trangThai === 9) {
                    swal({
                        title: 'Sản phẩm tạm hết hàng',
                        text: 'Một số sản phẩm trong đơn hàng của bạn hiện không đủ hàng. Chúng tôi đã ghi nhận yêu cầu và sẽ thông báo khi hàng về. Bạn có muốn tiếp tục chờ?',
                        icon: 'warning',
                        buttons: ['Hủy', 'Chờ nhập hàng'],
                    }).then(async (confirm) => {
                        if (confirm) {
                            // Xóa giỏ hàng và chuyển trang
                            await axios.delete(`http://localhost:8080/api/gio-hang/xoa/${idTaiKhoan}`);

                            // Cập nhật số lượng giỏ hàng
                            const countRes = await axios.get(`http://localhost:8080/api/gio-hang/${idTaiKhoan}/count`);
                            setCartItemCount(countRes.data || 0);

                            navigate('/xac-nhan-don-hang', { state: { order: response.data } });
                        } else {
                            // Hủy đơn hàng và quay lại giỏ hàng
                            await axios.delete(`http://localhost:8080/api/hoa-don/${response.data.id}`);
                            navigate('/gio-hang');
                        }
                    });
                } else {
                    // Trường hợp đặt hàng thành công bình thường
                    swal('Thành công', 'Đặt hàng thành công!', 'success').then(async () => {
                        try {
                            // Xóa các item đã đặt hàng khỏi giỏ hàng
                            await axios.delete('http://localhost:8080/api/gio-hang/xoa-danh-sach', {
                                data: carts.map((item) => item.id),
                            });

                            // Cập nhật số lượng giỏ hàng
                            const countRes = await axios.get(`http://localhost:8080/api/gio-hang/${idTaiKhoan}/count`);
                            setCartItemCount(countRes.data || 0);

                            // Chuyển trang đến trang xác nhận đơn hàng
                            navigate('/xac-nhan-don-hang', { state: { order: response.data } });
                        } catch (deleteError) {
                            console.error('Lỗi khi xóa giỏ hàng:', deleteError);
                            // Vẫn chuyển trang ngay cả khi xóa giỏ hàng lỗi
                            navigate('/xac-nhan-don-hang', { state: { order: response.data } });
                        }
                    });
                }
            }
        } catch (error) {
            console.error('Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại.', error);

            // Hiển thị thông báo lỗi chi tiết hơn
            let errorMessage = 'Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại.';
            if (error.response && error.response.data && error.response.data.message) {
                errorMessage = error.response.data.message;
            }

            swal('Lỗi', errorMessage, 'error');
        }
    };

    const handleSaveNewAddress = async () => {
        if (!validateForm()) return;

        const data = {
            ten: formData.ten,
            sdt: formData.sdt,
            tinh: formData.provinceName,
            huyen: formData.districtName,
            xa: formData.wardName,
            diaChiCuThe: formData.diaChiCuThe,
            isMacDinh: isDefaultAddress,
        };

        try {
            const res = await axios.post('http://localhost:8080/dia-chi/create', data, {
                headers: {
                    Authorization: `Bearer ${userToken}`,
                },
            });

            toast.success('Đã thêm địa chỉ mới!');

            const newAddress = res.data.result;

            setDefaultAddress(newAddress);

            // Cập nhật thông tin shipping với địa chỉ mới
            setSmartShippingData(prev => ({
                ...prev,
                districtId: formData.district,
                wardCode: formData.ward
            }));

            setShowAddressForm(false);
            setIsDefaultAddress(false);
            setFormData({
                ten: '',
                sdt: '',
                diaChiCuThe: '',
                province: '',
                district: '',
                ward: '',
                provinceName: '',
                districtName: '',
                wardName: '',
            });

            fetchUserAddresses();
            // fetchDefaultAddress();
        } catch (error) {
            console.error('Lỗi khi thêm địa chỉ mới:', error);
            console.error('Token used:', userToken);
            toast.error('Không thể thêm địa chỉ mới');
        }
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Thanh toán</h1>

            {/* Banner thông báo mua ngay */}
            {isBuyNow && (
                <div className="mb-4 bg-gradient-to-r from-red-500 to-orange-500 text-white p-4 rounded-xl shadow-lg">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M13 10V3L4 14h7v7l9-11h-7z"
                                />
                            </svg>
                            <div>
                                <h3 className="font-bold text-lg">🚀 Mua ngay - Thanh toán nhanh</h3>
                                <p className="text-sm opacity-90">
                                    Bạn đang ở chế độ mua ngay. Đơn hàng sẽ được xử lý ưu tiên!
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => navigate(-1)}
                            className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                                />
                            </svg>
                            Quay lại
                        </button>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white/95 p-6 rounded-2xl shadow-xl border border-white/20">
                    <div className="flex items-center mb-4">
                        <div className="w-8 h-8 bg-[#2f19ae] rounded-full flex items-center justify-center mr-3">
                            <span className="text-white font-bold">1</span>
                        </div>
                        <h2 className="text-xl font-bold text-gray-800">Thông tin giao hàng</h2>
                    </div>
                    {isLoadingAddress ? (
                        <div className="flex items-center gap-2 text-gray-600">
                            <CircularProgress size={20} />
                            <span>Đang tải địa chỉ giao hàng...</span>
                        </div>
                    ) : defaultAddress ? (
                        <>
                            <div className="text-gray-700">
                                <div className="flex items-center">
                                    <span className="font-semibold text-lg">{defaultAddress.ten}</span>
                                    <span className="text-sm text-gray-500 px-2">
                                        | ({formatPhoneNumber(defaultAddress.sdt)})
                                    </span>
                                </div>

                                <div className="mt-1 text-sm text-gray-600">
                                    <p>{defaultAddress.diaChiCuThe}</p>
                                    <p>
                                        {defaultAddress.xa}, {defaultAddress.huyen}, {defaultAddress.tinh}
                                    </p>
                                </div>

                                {defaultAddress.loai === 1 && (
                                    <span className="inline-block mt-2 px-2 py-0.5 text-xs text-green-600 border border-green-500">
                                        Mặc định
                                    </span>
                                )}
                            </div>
                            <div className="flex gap-2 mt-4 justify-end">
                                <Button
                                    variant="outlined"
                                    sx={{
                                        color: '#2f19ae',
                                        borderColor: '#2f19ae',
                                        fontWeight: 'bold',
                                        px: 3,
                                        py: 1,
                                        borderRadius: 1,
                                        textTransform: 'none',
                                        '&:hover': {
                                            backgroundColor: '#f0f0f0',
                                            borderColor: '#1e0c91',
                                        },
                                    }}
                                    onClick={() => setShowAddressModal(true)}
                                >
                                    Thay đổi địa chỉ
                                </Button>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    sx={{
                                        backgroundColor: '#2f19ae',
                                        '&:hover': {
                                            backgroundColor: '#1e0c91',
                                        },
                                        textTransform: 'none',
                                        px: 3,
                                        py: 1,
                                        borderRadius: 1,
                                    }}
                                    onClick={handleOpenAddressForm}
                                >
                                    Thêm địa chỉ
                                </Button>
                            </div>
                        </>
                    ) : (
                        <>
                            <p className="text-gray-500 italic">
                                Chưa có địa chỉ, vui lòng chọn hoặc thêm địa chỉ giao hàng.
                            </p>
                            <div className="flex gap-2 mt-4 justify-end">
                                {userAddresses.length > 0 && (
                                    <Button
                                        variant="outlined"
                                        sx={{
                                            color: '#2f19ae',
                                            borderColor: '#2f19ae',
                                            fontWeight: 'bold',
                                            px: 3,
                                            py: 1,
                                            borderRadius: 1,
                                            textTransform: 'none',
                                            '&:hover': {
                                                backgroundColor: '#f0f0f0',
                                                borderColor: '#1e0c91',
                                            },
                                        }}
                                        onClick={() => setShowAddressModal(true)}
                                    >
                                        Chọn địa chỉ
                                    </Button>
                                )}
                                <Button
                                    variant="contained"
                                    color="primary"
                                    sx={{
                                        backgroundColor: '#2f19ae',
                                        '&:hover': {
                                            backgroundColor: '#1e0c91',
                                        },
                                        textTransform: 'none',
                                        px: 3,
                                        py: 1,
                                        borderRadius: 1,
                                    }}
                                    onClick={handleOpenAddressForm}
                                >
                                    Thêm địa chỉ
                                </Button>
                            </div>
                        </>
                    )}
                </div>

                <OrderSummary
                    carts={carts}
                    totalPrice={totalPrice}
                    discountedPrice={discountedPrice}
                    promoCode={promoCode}
                    setShowModal={setShowModal}
                    selectedPaymentMethod={selectedPaymentMethod}
                    setSelectedPaymentMethod={setSelectedPaymentMethod}
                    handleSubmit={handleSubmit}
                    shippingFee={shippingFee}
                    promoDiscount={promoDiscount}
                    selectedDiscount={selectedDiscount}
                    isSmartShipping={smartShippingData.districtId && smartShippingData.wardCode}
                />
            </div>

            <DiscountModal
                showModal={showModal}
                setShowModal={setShowModal}
                discounts={discounts}
                totalPrice={totalPrice}
                selectedDiscount={selectedDiscount} // Thêm prop này để modal biết phiếu đang chọn
                handleSelectDiscount={handleSelectDiscount}
                handleRemoveDiscount={handleRemoveDiscount}
            />

            <ShippingInfo
                open={showAddressForm}
                onClose={() => setShowAddressForm(false)}
                onSave={handleSaveNewAddress}
                formData={formData}
                handleInputChange={handleInputChange}
                errors={errors}
                provinces={provinces}
                districts={districts}
                wards={wards}
                isDefaultAddress={isDefaultAddress}
                setIsDefaultAddress={setIsDefaultAddress}
            />

            <ModalAddress
                open={showAddressModal}
                onClose={() => setShowAddressModal(false)}
                onSelect={(address) => {
                    setDefaultAddress(address);
                    setShowAddressForm(false);
                }}
                defaultAddress={defaultAddress}
            />

            {/* Bulk Order Notification */}
            <BulkOrderNotification
                show={shouldShowBulkWarning}
                orderData={{
                    totalQuantity: bulkOrderData.totalQuantity || 0,
                    totalValue: totalPrice,
                    itemCount: carts.length,
                    reasons: bulkOrderData.reasons || [],
                }}
                onContactMethod={async (method) => {
                    try {
                        let id = bulkInquiryId;
                        if (!id && !creatingRef.current) {
                            // Create inquiry synchronously if it hasn't been created yet
                            creatingRef.current = true;
                            const created = await bulkOrderAPI.createBulkOrderInquiry(buildBulkInquiryPayload());
                            id = created.id || created?.result?.id;
                            setBulkInquiryId(id);
                        }

                        if (id) {
                            await bulkOrderAPI.updateInquiryContactMethod(id, method);
                            await bulkOrderAPI.trackInteraction({ inquiryId: id, type: 'contact_method', method });
                        } else {
                            console.warn('Bulk inquiry not available to update contact method');
                        }
                    } catch (e) {
                        console.error(e);
                    } finally {
                        creatingRef.current = false;
                    }

                    swal({
                        title: 'Đã gửi yêu cầu!',
                        text: 'Chuyên viên sẽ liên hệ với bạn trong thời gian sớm nhất.',
                        icon: 'success',
                        timer: 3000,
                    });
                }}
                onDismiss={() => {
                    if (bulkInquiryId)
                        bulkOrderAPI.trackInteraction({ inquiryId: bulkInquiryId, type: 'dismiss_notification' });
                    resetBulkWarning();
                }}
            />
        </div>
    );
};

export default CheckOut;
