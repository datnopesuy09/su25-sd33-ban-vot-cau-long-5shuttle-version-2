import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import swal from 'sweetalert';
import ShippingInfo from './ShippingInfo';
import OrderSummary from './OrderSummary';
import DiscountModal from './DiscountModal'

const CheckOut = () => {
    const [carts, setCarts] = useState([]);
    const [totalPrice, setTotalPrice] = useState(0);
    const [promoCode, setPromoCode] = useState('');
    const [promoDiscount, setPromoDiscount] = useState(0);
    const [discounts, setDiscounts] = useState([]);
    const [selectedDiscount, setSelectedDiscount] = useState(null);
    const idTaiKhoan = 1;

    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);
    const navigate = useNavigate();

    const [showModal, setShowModal] = useState(false);

    const [formData, setFormData] = useState({
        addressName: '',
        addressDetail: '',
        province: '',
        district: '',
        ward: '',
        mobile: '',
    });
    const [errors, setErrors] = useState({});
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');

    const handleSelectDiscount = (discount) => {
    // Kiểm tra điều kiện tối thiểu
    if (totalPrice < discount.dieuKienNhoNhat) {
        swal('Lỗi', `Đơn hàng phải có tổng giá trị từ ${discount.dieuKienNhoNhat.toLocaleString()} VNĐ`, 'error');
        return;
    }

    // Tính toán giảm giá và kiểm tra giá trị tối đa
    let discountAmount = (totalPrice * discount.giaTri) / 100;
    
    // Đảm bảo không vượt quá giá trị tối đa
    if (discountAmount > discount.giaTriMax) {
        discountAmount = discount.giaTriMax;
        swal('Thông báo', `Giảm giá tối đa là ${discount.giaTriMax.toLocaleString()} VNĐ`, 'info');
    }

    setSelectedDiscount(discount);
    setPromoDiscount(discountAmount);
    setPromoCode(discount.ma);
    setShowModal(false);
};


    const handleDeselectDiscount = () => {
    setSelectedDiscount(null);
    setPromoDiscount(0); // Reset the discount
};

    const fetchCart = async () => {
        try {
            const res = await axios.get(`http://localhost:8080/api/gio-hang/${idTaiKhoan}`);
            setCarts(res.data);
            const totalRes = await axios.get(`http://localhost:8080/api/gio-hang/${idTaiKhoan}/total`);
            setTotalPrice(totalRes.data);
        } catch (error) {
            console.error('Lỗi lấy giỏ hàng:', error);
        }
    };

    const fetchProvinces = async () => {
        try {
            const res = await axios.get('https://provinces.open-api.vn/api/');
            setProvinces(res.data);
        } catch (error) {
            console.error('Lỗi lấy danh sách tỉnh:', error);
        }
    };

    const fetchDiscounts = async () => {
        try {
            const res = await axios.get('http://localhost:8080/api/phieu-giam-gia/hien-thi');
            setDiscounts(res.data);
        } catch (error) {
            console.error('Lỗi lấy phiếu giảm giá:', error);
        }
    };

    const fetchDistricts = async (provinceCode) => {
        if (!provinceCode) return;
        try {
            const res = await axios.get(`https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`);
            if (res.data && res.data.districts) {
                setDistricts(res.data.districts);
            }
        } catch (error) {
            console.error('Lỗi lấy danh sách quận/huyện:', error);
        }
    };

    const fetchWards = async (districtCode) => {
        if (!districtCode) return;
        try {
            const res = await axios.get(`https://provinces.open-api.vn/api/d/${districtCode}?depth=2`);
            if (res.data && res.data.wards) {
                setWards(res.data.wards);
            }
        } catch (error) {
            console.error('Lỗi lấy danh sách xã/phường:', error);
        }
    };

    useEffect(() => {
        fetchCart();
        fetchProvinces();
        fetchDiscounts(); // Fetch discounts on component mount
    }, []);

    useEffect(() => {
        if (formData.province) {
            fetchDistricts(formData.province);
        }
    }, [formData.province]);

    useEffect(() => {
        if (formData.district) {
            fetchWards(formData.district);
        }
    }, [formData.district]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: false,
            }));
        }
    };
    const discountedPrice = totalPrice - promoDiscount;


    const validateForm = () => {
        const newErrors = {};
        if (!formData.addressName.trim()) newErrors.addressName = true;
        if (!formData.addressDetail.trim()) newErrors.addressDetail = true;
        if (!formData.province) newErrors.province = true;
        if (!formData.district) newErrors.district = true;
        if (!formData.ward) newErrors.ward = true;
        if (!formData.mobile.trim()) newErrors.mobile = true;

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleApplyPromoCode = () => {
    setShowModal(true); // Mở modal khi nhấn nút "Chọn"
};

    const handleSubmit = async () => {
        if (!validateForm()) return;

        if (!selectedPaymentMethod) {
            swal('Lỗi', 'Vui lòng chọn phương thức thanh toán.', 'error');
            return;
        }

        const newAddress = {
            sdt: formData.mobile,
            hoTen: formData.addressName,
            diaChiCuThe: formData.addressDetail,
            province: formData.province,
            district: formData.district,
            ward: formData.ward,
        };

        const orderData = {
            idTaiKhoan: idTaiKhoan,
            cartItems: carts.map((item) => ({
                sanPhamCTId: item.sanPhamCT.id,
                soLuong: item.soLuong,
            })),
            thongTinGiaoHang: newAddress,
            discountId: selectedDiscount ? selectedDiscount.id : null,
            discountAmount: promoDiscount,
        };
        console.log("o do data: ", orderData);
        try {
            const response = await axios.post('http://localhost:8080/api/dat-hang', orderData);
            if (response.status === 200) {
                swal('Thành công', 'Đặt hàng thành công!', 'success').then(async () => {
                    await axios.delete(`http://localhost:8080/api/gio-hang/xoa/${idTaiKhoan}`);
                    navigate('/xac-nhan-don-hang');
                });
            }
        } catch (error) {
            console.error('Lỗi đặt hàng:', error);
            swal('Lỗi', 'Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại.', 'error');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#2f19ae] via-[#4c2eb5] to-[#6b46c1] py-8">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">Thanh Toán</h1>
                    <p className="text-blue-100">Hoàn tất đơn hàng của bạn</p>
                </div>

                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Left Side - Address Form */}
                        <div className="lg:col-span-7">
                            <ShippingInfo
                                formData={formData}
                                handleInputChange={handleInputChange}
                                errors={errors}
                                provinces={provinces}
                                districts={districts}
                                wards={wards}
                            />
                        </div>

                        {/* Right Side - Order Summary */}
                        <div className="lg:col-span-5">
                            <OrderSummary
                                carts={carts}
                                totalPrice={totalPrice}
                                selectedPaymentMethod={selectedPaymentMethod}
                                setSelectedPaymentMethod={setSelectedPaymentMethod}
                                handleSubmit={handleSubmit}
                                promoCode={promoCode}
                                promoDiscount={promoDiscount}
                                setPromoCode={setPromoCode}
                                handleApplyPromoCode={handleApplyPromoCode}
                                selectedDiscount={selectedDiscount}
                                setSelectedDiscount={setSelectedDiscount}
                                discountedPrice={discountedPrice}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal cho mã giảm giá */}
            <DiscountModal
                showModal={showModal}
                setShowModal={setShowModal}
                discounts={discounts}
                selectedDiscount={selectedDiscount}
                handleSelectDiscount={handleSelectDiscount}
                handleDeselectDiscount={handleDeselectDiscount}
            />
        </div>
    );
};

export default CheckOut;
