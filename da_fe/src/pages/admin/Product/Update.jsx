// UpdateProduct.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CircularProgress } from '@mui/material';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ProductInfo from './ProductInfo';
import ColorWeight from './ColorWeight';
import Variants from './Variants';

function UpdateProduct() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [productName, setProductName] = useState('');
    const [description, setDescription] = useState('');
    const [brand, setBrand] = useState('');
    const [material, setMaterial] = useState('');
    const [balancePoint, setBalancePoint] = useState('');
    const [hardness, setHardness] = useState('');
    const [status, setStatus] = useState('Active');
    const [selectedColors, setSelectedColors] = useState([]);
    const [selectedWeights, setSelectedWeights] = useState([]);
    const [imagesByColor, setImagesByColor] = useState({});
    const [variants, setVariants] = useState([]);
    const [errors, setErrors] = useState({});
    const [resetTrigger, setResetTrigger] = useState(0);

    useEffect(() => {
        const fetchProductDetail = async () => {
            try {
                const res = await axios.get(`http://localhost:8080/api/san-pham-ct/${id}/detaill`);
                const data = res.data;

                // ✅ Log toàn bộ data
                console.log('DATA DETAIL API:', data);

                setProductName(data.tenSanPham);
                setDescription(data.moTa || '');
                setBrand(data.thuongHieu || '');
                setMaterial(data.chatLieu || '');
                setBalancePoint(data.diemCanBang || '');
                setHardness(data.doCung || '');
                setStatus(data.trangThai === 1 ? 'Active' : 'Inactive');

                const colors = [...new Set(data.variants.map((v) => v.mauSacTen))];
                const weights = [...new Set(data.variants.map((v) => v.trongLuongTen))];
                setSelectedColors(colors);
                setSelectedWeights(weights);

                // const groupedImages = {};
                // data.variants.forEach((v) => {
                //     groupedImages[v.mauSacTen] = groupedImages[v.mauSacTen] || [];
                //     groupedImages[v.mauSacTen].push(...v.hinhAnhUrls);
                // });
                // setImagesByColor(groupedImages);
                const groupedImages = {};
                data.variants.forEach((v) => {
                    groupedImages[v.mauSacTen] = groupedImages[v.mauSacTen] || [];
                    groupedImages[v.mauSacTen].push(...v.hinhAnhUrls);
                });

                // Loại bỏ ảnh trùng
                Object.keys(groupedImages).forEach((color) => {
                    groupedImages[color] = [...new Set(groupedImages[color])];
                });
                setImagesByColor(groupedImages);

                const loadedVariants = data.variants.map((v) => ({
                    id: `${v.mauSacTen}-${v.trongLuongTen}`,
                    name: `${data.tenSanPham} - [${v.trongLuongTen}]`,
                    quantity: v.soLuong,
                    price: v.donGia,
                    weight: v.trongLuongTen,
                    color: v.mauSacTen,
                }));
                setVariants(loadedVariants);
            } catch (err) {
                console.error('Lỗi khi lấy dữ liệu sản phẩm:', err);
                toast.error('Không thể tải dữ liệu sản phẩm.');
            }
        };

        fetchProductDetail();
    }, [id]);

    const handleChange = (id, field, value) => {
        setVariants((prev) =>
            prev.map((item) =>
                item.id === id
                    ? {
                          ...item,
                          [field]: field === 'price' || field === 'quantity' ? Math.max(0, Number(value)) : value,
                      }
                    : item,
            ),
        );
    };

    const handleRemoveVariant = (id) => {
        setVariants((prev) => prev.filter((v) => v.id !== id));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});

        const newErrors = {};
        if (!productName) newErrors.productName = 'Tên sản phẩm là bắt buộc';
        if (selectedColors.length === 0) newErrors.colors = 'Vui lòng chọn màu sắc';
        if (selectedWeights.length === 0) newErrors.weights = 'Vui lòng chọn trọng lượng';
        if (!brand) newErrors.brand = 'Thiếu thương hiệu';
        if (!material) newErrors.material = 'Thiếu chất liệu';
        if (!balancePoint) newErrors.balancePoint = 'Thiếu điểm cân bằng';
        if (!hardness) newErrors.hardness = 'Thiếu độ cứng';

        const invalidVariant = variants.find((v) => v.quantity <= 0 || v.price <= 0);
        if (invalidVariant) newErrors.variants = 'Biến thể phải có số lượng và giá > 0';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            toast.error('Vui lòng kiểm tra lại thông tin!');
            return;
        }

        const productData = {
            productName,
            brand,
            material,
            balancePoint,
            hardness,
            description,
            trangThai: status === 'Active' ? 1 : 0,
            variants: variants.map((variant) => ({
                mauSacTen: variant.color,
                trongLuongTen: variant.weight,
                soLuong: variant.quantity,
                donGia: variant.price,
                hinhAnhUrls:
                    imagesByColor[variant.color]?.filter((url) => selectedColors.includes(variant.color)) || [],
            })),
        };

        try {
            setLoading(true);
            await axios.put(`http://localhost:8080/api/san-pham-ct/update-with-variants/${id}`, productData, {
                headers: { 'Content-Type': 'application/json' },
            });
            toast.success('Cập nhật sản phẩm thành công!');
            navigate('/admin/quan-ly-san-pham');
        } catch (error) {
            console.error(error);
            toast.error('Cập nhật sản phẩm thất bại!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <form onSubmit={handleSubmit}>
                <div className="font-bold text-sm mb-2">
                    <span className="cursor-pointer">Sản phẩm</span>
                    <span className="text-gray-400 ml-2">/ Cập nhật sản phẩm</span>
                </div>
                <ProductInfo
                    status={status}
                    setStatus={setStatus}
                    description={description}
                    setDescription={setDescription}
                    productName={productName}
                    setProductName={setProductName}
                    brand={brand}
                    setBrand={setBrand}
                    material={material}
                    setMaterial={setMaterial}
                    balancePoint={balancePoint}
                    setBalancePoint={setBalancePoint}
                    hardness={hardness}
                    setHardness={setHardness}
                    errors={errors}
                />
                {/* <ColorWeight
                    setSelectedColors={setSelectedColors}
                    setSelectedWeights={setSelectedWeights}
                    errors={errors}
                    resetTrigger={resetTrigger}
                /> */}
                <ColorWeight
                    selectedColors={selectedColors}
                    setSelectedColors={setSelectedColors}
                    selectedWeights={selectedWeights}
                    setSelectedWeights={setSelectedWeights}
                    errors={errors}
                    resetTrigger={resetTrigger}
                />
                <Variants
                    variants={variants}
                    handleRemoveVariant={handleRemoveVariant}
                    handleChange={handleChange}
                    imagesByColor={imagesByColor}
                    setImagesByColor={setImagesByColor}
                />
                <div className="mt-6">
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-blue-600 text-white rounded-md px-4 py-2 ml-auto flex items-center disabled:bg-blue-400"
                    >
                        {loading ? <CircularProgress size={24} /> : 'Cập nhật'}
                    </button>
                </div>
            </form>
            <ToastContainer />
        </>
    );
}

export default UpdateProduct;
