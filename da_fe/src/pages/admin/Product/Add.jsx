import React, { useState, useEffect } from 'react';
import { CircularProgress } from '@mui/material';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ProductInfo from './ProductInfo';
import ColorWeight from './ColorWeight';
import axios from 'axios';
import Variants from './Variants';

function AddProduct() {
    const [status, setStatus] = useState('Active');
    const [description, setDescription] = useState('');
    const [variants, setVariants] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedColors, setSelectedColors] = useState([]);
    const [selectedWeights, setSelectedWeights] = useState([]);
    const [productName, setProductName] = useState('');
    const [brand, setBrand] = useState('');
    const [material, setMaterial] = useState('');
    const [balancePoint, setBalancePoint] = useState('');
    const [hardness, setHardness] = useState('');
    const [imagesByColor, setImagesByColor] = useState({});
    const [errors, setErrors] = useState({});
    const [showConfirm, setShowConfirm] = useState(false);
    const [resetTrigger, setResetTrigger] = useState(0); // Thêm resetTrigger

    useEffect(() => {
        console.log('selectedColors:', selectedColors);
        console.log('selectedWeights:', selectedWeights);
        if (selectedColors.length > 0 && selectedWeights.length > 0 && productName) {
            const newVariants = [];
            selectedColors.forEach((color) => {
                selectedWeights.forEach((weight) => {
                    const existingVariant = variants.find((v) => v.color === color && v.weight === weight);
                    newVariants.push({
                        id: `${color}-${weight}`,
                        name: `${productName} - [${weight}]`,
                        quantity: existingVariant?.quantity || 0,
                        price: existingVariant?.price || 0,
                        weight,
                        color,
                    });
                });
            });
            setVariants(newVariants);
        } else {
            setVariants([]);
        }
    }, [selectedColors, selectedWeights, productName]);

    const handleRemoveVariant = (id) => {
        setVariants((prev) => prev.filter((variant) => variant.id !== id));
    };

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});

        // Kiểm tra các trường bắt buộc
        const newErrors = {};
        if (!productName) newErrors.productName = 'Tên sản phẩm là bắt buộc';
        if (selectedColors.length === 0) newErrors.colors = 'Vui lòng chọn ít nhất một màu sắc';
        if (selectedWeights.length === 0) newErrors.weights = 'Vui lòng chọn ít nhất một trọng lượng';
        if (!brand) newErrors.brand = 'Thương hiệu là bắt buộc';
        if (!material) newErrors.material = 'Chất liệu là bắt buộc';
        if (!balancePoint) newErrors.balancePoint = 'Điểm cân bằng là bắt buộc';
        if (!hardness) newErrors.hardness = 'Độ cứng là bắt buộc';
        if (!status) newErrors.status = 'Trạng thái là bắt buộc';

        const invalidVariant = variants.find((variant) => variant.quantity <= 0 || variant.price <= 0);
        if (invalidVariant) newErrors.variants = 'Số lượng và đơn giá của biến thể phải là số dương';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            toast.error('Vui lòng điền đầy đủ các trường bắt buộc', {
                position: 'top-right',
                autoClose: 3000,
            });
            return;
        }

        // Hiển thị modal xác nhận
        setShowConfirm(true);
    };

    const confirmSubmit = async () => {
        setShowConfirm(false);
        setLoading(true);

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
            const response = await axios.post(`http://localhost:8080/api/san-pham-ct/add-with-variants`, productData, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.status === 200) {
                toast.success('Thêm sản phẩm thành công!', {
                    position: 'top-right',
                    autoClose: 3000,
                });
                // Reset tất cả state
                setProductName('');
                setDescription('');
                setSelectedColors([]);
                setSelectedWeights([]);
                setVariants([]);
                setImagesByColor({});
                setBrand('');
                setMaterial('');
                setBalancePoint('');
                setHardness('');
                setStatus('Active');
                setResetTrigger((prev) => prev + 1); // Kích hoạt reset trong ColorWeight.js
            }
        } catch (error) {
            console.error('Error adding product:', error);
            toast.error(`Có lỗi xảy ra khi thêm sản phẩm: ${error.response?.data?.message || error.message}`, {
                position: 'top-right',
                autoClose: 3000,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <form onSubmit={handleSubmit}>
                <div className="font-bold text-sm">
                    <span className="cursor-pointer">Sản phẩm</span>
                    <span className="text-gray-400 ml-2">/ Thêm sản phẩm</span>
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
                <ColorWeight
                    setSelectedColors={setSelectedColors}
                    setSelectedWeights={setSelectedWeights}
                    errors={errors}
                    resetTrigger={resetTrigger} // Truyền resetTrigger
                />
                <Variants
                    variants={variants}
                    handleRemoveVariant={handleRemoveVariant}
                    handleChange={handleChange}
                    imagesByColor={imagesByColor}
                    setImagesByColor={setImagesByColor}
                />
                {errors.submit && <p className="text-red-500 text-sm mt-2">{errors.submit}</p>}
                <div className="mt-6">
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-blue-600 text-white rounded-md px-4 py-2 ml-auto flex items-center disabled:bg-blue-400"
                    >
                        {loading ? <CircularProgress size={24} /> : 'Lưu'}
                    </button>
                </div>
            </form>

            {/* Modal xác nhận */}
            {showConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                        <h3 className="text-lg font-bold mb-4">Xác nhận thêm sản phẩm</h3>
                        <p className="text-sm text-gray-600 mb-4">
                            Bạn có chắc chắn muốn thêm sản phẩm "<strong>{productName}</strong>" với{' '}
                            <strong>{variants.length}</strong> biến thể?
                        </p>
                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setShowConfirm(false)}
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                            >
                                Hủy
                            </button>
                            <button
                                type="button"
                                onClick={confirmSubmit}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            >
                                Xác nhận
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} closeOnClick pauseOnHover />
        </>
    );
}

export default AddProduct;
