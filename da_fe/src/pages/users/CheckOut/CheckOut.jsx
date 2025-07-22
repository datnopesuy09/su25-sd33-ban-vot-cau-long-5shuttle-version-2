import { useEffect, useState } from 'react';
import axios from 'axios';
import swal from 'sweetalert';
import { useNavigate, useLocation } from 'react-router-dom';
import ShippingInfo from './ShippingInfo';
import OrderSummary from './OrderSummary';
import DiscountModal from './DiscountModal';

const CheckOut = () => {
    const navigate = useNavigate();
    const location = useLocation();
    // Giả sử idTaiKhoan được truyền qua location.state hoặc dùng giá trị mặc định
    const idTaiKhoan = location.state?.idTaiKhoan || 1; // Mặc định idTaiKhoan = 1 để test
    const [carts, setCarts] = useState([]);
    const [formData, setFormData] = useState({
        addressName: '',
        addressDetail: '',
        mobile: '',
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
    const [shippingFee, setShippingFee] = useState(0);

    useEffect(() => {
        fetchCart();
        fetchProvinces();
        fetchDiscounts();
    }, [idTaiKhoan]);

    const fetchCart = async () => {
        try {
            const res = await axios.get(`http://localhost:8080/api/gio-hang/${idTaiKhoan}`);
            setCarts(res.data);
            const total = res.data.reduce((sum, item) => {
                const price = item.sanPhamCT.giaKhuyenMai || item.sanPhamCT.donGia;
                return sum + price * item.soLuong;
            }, 0);
            setTotalPrice(total);
            setDiscountedPrice(total);
        } catch (error) {
            console.error('Lỗi lấy giỏ hàng:', error);
            swal('Lỗi', 'Không thể lấy giỏ hàng. Vui lòng thử lại.', 'error');
        }
    };

    const fetchProvinces = async () => {
        try {
            const res = await axios.get('https://provinces.open-api.vn/api/p/');
            setProvinces(res.data);
        } catch (error) {
            console.error('Lỗi lấy danh sách tỉnh:', error);
            swal('Lỗi', 'Không thể lấy danh sách tỉnh/thành phố.', 'error');
        }
    };

    const fetchDistricts = async (provinceCode) => {
        try {
            const res = await axios.get(`https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`);
            setDistricts(res.data.districts);
            setWards([]);
            setShippingFee(provinceCode === 'someProvinceCode' ? 30000 : 50000);
        } catch (error) {
            console.error('Lỗi lấy danh sách quận/huyện:', error);
            swal('Lỗi', 'Không thể lấy danh sách quận/huyện.', 'error');
        }
    };

    const fetchWards = async (districtCode) => {
        try {
            const res = await axios.get(`https://provinces.open-api.vn/api/d/${districtCode}?depth=2`);
            setWards(res.data.wards);
        } catch (error) {
            console.error('Lỗi lấy danh sách xã/phường:', error);
            swal('Lỗi', 'Không thể lấy danh sách xã/phường.', 'error');
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
            console.error('Lỗi lấy phiếu giảm giá:', error);
            swal('Lỗi', 'Không thể lấy danh sách phiếu giảm giá.', 'error');
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
            setDiscountedPrice(totalPrice - discountAmount + shippingFee);
        }
    };

    const handleRemoveDiscount = () => {
        setSelectedDiscount(null);
        setPromoDiscount(0);
        setPromoCode('');
        setDiscountedPrice(totalPrice + shippingFee);
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
            } else if (name === 'ward') {
                newFormData.wardName = wards.find((w) => w.code === value)?.name || '';
            }
            return newFormData;
        });
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: false }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.addressName.trim()) newErrors.addressName = 'Họ và tên là bắt buộc';
        if (!formData.addressDetail.trim()) newErrors.addressDetail = 'Địa chỉ chi tiết là bắt buộc';
        if (!formData.province) newErrors.province = 'Vui lòng chọn tỉnh/thành phố';
        if (!formData.district) newErrors.district = 'Vui lòng chọn quận/huyện';
        if (!formData.ward) newErrors.ward = 'Vui lòng chọn xã/phường';
        if (!formData.mobile.trim()) {
            newErrors.mobile = 'Số điện thoại là bắt buộc';
        } else if (!/^(0\d{9})$/.test(formData.mobile)) {
            newErrors.mobile = 'Số điện thoại phải gồm 10 chữ số và bắt đầu bằng 0';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (carts.length === 0) {
            swal('Lỗi', 'Giỏ hàng của bạn đang trống!', 'error');
            return;
        }
        if (!validateForm()) return;
        if (!selectedPaymentMethod) {
            swal('Lỗi', 'Vui lòng chọn phương thức thanh toán.', 'error');
            return;
        }

        const newAddress = {
            sdt: formData.mobile,
            hoTen: formData.addressName,
            diaChiCuThe: `${formData.addressDetail}, ${formData.wardName}, ${formData.districtName}, ${formData.provinceName}`,
        };

        const cartItems = carts.map((item) => ({
            sanPhamCTId: item.sanPhamCT.id,
            soLuong: item.soLuong,
        }));

        const orderData = {
            idTaiKhoan,
            thongTinGiaoHang: newAddress,
            cartItems,
            discountId: selectedDiscount?.id || null,
            phuongThucThanhToan: selectedPaymentMethod,
        };

        try {
            const response = await axios.post('http://localhost:8080/api/dat-hang', orderData);
            if (response.status === 200) {
                if (response.data.trangThai === 9) {
                    swal({
                        title: 'Sản phẩm tạm hết hàng',
                        text: 'Một số sản phẩm trong đơn hàng của bạn hiện không đủ hàng. Chúng tôi đã ghi nhận yêu cầu và sẽ thông báo khi hàng về. Bạn có muốn tiếp tục chờ?',
                        icon: 'warning',
                        buttons: ['Hủy', 'Chờ nhập hàng'],
                    }).then(async (confirm) => {
                        if (confirm) {
                            await axios.delete(`http://localhost:8080/api/gio-hang/xoa/${idTaiKhoan}`);
                            navigate('/xac-nhan-don-hang', { state: { order: response.data } });
                        } else {
                            await axios.delete(`http://localhost:8080/api/hoa-don/${response.data.id}`);
                            navigate('/gio-hang');
                        }
                    });
                } else {
                    swal('Thành công', 'Đặt hàng thành công!', 'success').then(async () => {
                        await axios.delete(`http://localhost:8080/api/gio-hang/xoa/${idTaiKhoan}`);
                        navigate('/xac-nhan-don-hang', { state: { order: response.data } });
                    });
                }
            }
        } catch (error) {
            console.error('Lỗi đặt hàng:', error);
            if (error.response?.data === 'Sản phẩm tạm hết hàng. Đã tạo yêu cầu đặt trước.') {
                const orderId = error.response.data.orderId; // Giả sử backend trả về orderId
                swal({
                    title: 'Sản phẩm tạm hết hàng',
                    text: 'Chúng tôi đã ghi nhận yêu cầu đặt trước. Bạn có muốn tiếp tục chờ?',
                    icon: 'warning',
                    buttons: ['Hủy', 'Chờ nhập hàng'],
                }).then(async (confirm) => {
                    if (confirm) {
                        navigate('/xac-nhan-don-hang', { state: { orderId } });
                    } else {
                        await axios.delete(`http://localhost:8080/api/hoa-don/${orderId}`);
                        navigate('/gio-hang');
                    }
                });
            } else {
                swal('Lỗi', 'Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại.', 'error');
            }
        }
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Thanh toán</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ShippingInfo
                    formData={formData}
                    setFormData={setFormData}
                    errors={errors}
                    provinces={provinces}
                    districts={districts}
                    wards={wards}
                    handleInputChange={handleInputChange}
                />
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
                />
            </div>
            <DiscountModal
                showModal={showModal}
                setShowModal={setShowModal}
                discounts={discounts}
                totalPrice={totalPrice}
                handleSelectDiscount={handleSelectDiscount}
                handleRemoveDiscount={handleRemoveDiscount}
            />
        </div>
    );
};

export default CheckOut;
