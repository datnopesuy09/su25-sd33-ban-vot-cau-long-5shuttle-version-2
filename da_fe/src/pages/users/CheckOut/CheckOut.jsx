import { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import swal from 'sweetalert';
import { useNavigate, useLocation } from 'react-router-dom';
import ShippingInfo from './ShippingInfo';
import OrderSummary from './OrderSummary';
import DiscountModal from './DiscountModal';
import ModalAddress from './ModalAddress';
import { useUserAuth } from '../../../contexts/userAuthContext';
import { CartContext } from '../Cart/CartContext';
import { Button } from '@mui/material';
import { toast } from "react-toastify";
import CircularProgress from '@mui/material/CircularProgress';

const CheckOut = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useUserAuth();
    const { setCartItemCount } = useContext(CartContext);
    const idTaiKhoan = user?.id;

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
    const [shippingFee, setShippingFee] = useState(0);
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [defaultAddress, setDefaultAddress] = useState(null);
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [isDefaultAddress, setIsDefaultAddress] = useState(false);
    const [userAddresses, setUserAddresses] = useState([]);
    const [isLoadingAddress, setIsLoadingAddress] = useState(false);

    const selectedItems = location.state?.selectedItems || [];

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
    }, [idTaiKhoan]);

    const fetchCart = async () => {
        try {
            const res = await axios.get(`http://localhost:8080/api/gio-hang/${idTaiKhoan}`);
            const filteredCarts = res.data.filter((item) => selectedItems.includes(item.id));
            setCarts(filteredCarts);

            const total = filteredCarts.reduce((sum, item) => {
                const price = item.sanPhamCT.giaKhuyenMai || item.sanPhamCT.donGia;
                return sum + price * item.soLuong;
            }, 0);

            setTotalPrice(total);
            setDiscountedPrice(total);
        } catch (err) {
            swal('Lỗi', 'Không thể lấy giỏ hàng', 'error');
        }
    };

    const fetchDefaultAddress = async () => {
        setIsLoadingAddress(true);
        try {
            const res = await axios.get("http://localhost:8080/dia-chi/mac-dinh", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("userToken")}` // nếu cần
                }
            });
            setDefaultAddress(res.data.result);
        } catch (err) {
            console.error("Không thể lấy địa chỉ mặc định:", err);
            setDefaultAddress(null);
        } finally {
            setIsLoadingAddress(false);
        }
    };

    const fetchUserAddresses = async () => {
        try {
            const res = await axios.get('http://localhost:8080/dia-chi/getMyAddress', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("userToken")}`,
                },
            });
            setUserAddresses(res.data.result);
            // setIsFirstAddress(res.data.result.length === 0);
        } catch (err) {
            console.error('Không thể lấy danh sách địa chỉ:', err);
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

        setIsDefaultAddress(isFirst);      // Tích sẵn nếu là địa chỉ đầu tiên
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
            toast.error('Không thể lấy danh sách quận/huyện.');
        }
    };

    const fetchWards = async (districtCode) => {
        try {
            const res = await axios.get(`https://provinces.open-api.vn/api/d/${districtCode}?depth=2`);
            setWards(res.data.wards);
        } catch (error) {
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
                tinh: formData.provinceName
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
                tinh: defaultAddress.tinh
            };

        }

        if (!selectedPaymentMethod) {
            swal('Lỗi', 'Vui lòng chọn phương thức thanh toán.', 'error');
            return;
        }

        const cartItems = carts.map((item) => ({
            sanPhamCTId: item.sanPhamCT.id,
            soLuong: item.soLuong,
        }));

        const orderData = {
            idTaiKhoan,
            thongTinGiaoHang: shippingInfo,
            cartItems,
            discountId: selectedDiscount?.id || null,
            phuongThucThanhToan: selectedPaymentMethod,
        };

        try {
            const response = await axios.post('http://localhost:8080/api/dat-hang', orderData);
            if (response.status === 200) {
                swal('Thành công', 'Đặt hàng thành công!', 'success').then(async () => {
                    await axios.delete('http://localhost:8080/api/gio-hang/xoa-danh-sach', {
                        data: carts.map(item => item.id)
                    });

                    const countRes = await axios.get(`http://localhost:8080/api/gio-hang/${idTaiKhoan}/count`);
                    setCartItemCount(countRes.data || 0);

                    navigate('/xac-nhan-don-hang', { state: { order: response.data } });
                });
            }
        } catch (error) {
            swal('Lỗi', 'Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại.', 'error');
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
            const res = await axios.post("http://localhost:8080/dia-chi/create", data, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("userToken")}`,
                },
            });

            toast.success("Đã thêm địa chỉ mới!");

            const newAddress = res.data.result

            setDefaultAddress(newAddress)

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
            console.error("Lỗi khi thêm địa chỉ mới:", error);
            toast.error("Không thể thêm địa chỉ mới");
        }
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Thanh toán</h1>
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
                                    <span className="text-sm text-gray-500 px-2">| ({formatPhoneNumber(defaultAddress.sdt)})</span>
                                </div>

                                <div className="mt-1 text-sm text-gray-600">
                                    <p>{defaultAddress.diaChiCuThe}</p>
                                    <p>{defaultAddress.xa}, {defaultAddress.huyen}, {defaultAddress.tinh}</p>
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

        </div>
    );
};

export default CheckOut;
