import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CircularProgress } from '@mui/material';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ProductInfo from './ProductInfo';
import ColorWeight from './ColorWeight';
import axios from 'axios';
import Variants from './Variants';

function UpdateProduct() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [status, setStatus] = useState('Active');
    const [description, setDescription] = useState('');
    const [variants, setVariants] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);
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

    // Load product data when component mounts
    useEffect(() => {
        const loadProductData = async () => {
            try {
                setLoadingData(true);
                const response = await axios.get(`http://localhost:8080/api/san-pham-ct/${id}`);

                if (response.status === 200) {
                    const productData = response.data;

                    // Set basic product info
                    setProductName(productData.tenSanPham || '');
                    setDescription(productData.moTa || '');
                    setStatus(productData.trangThai === 1 ? 'Active' : 'Inactive');
                    setBrand(productData.thuongHieu || '');
                    setMaterial(productData.chatLieu || '');
                    setBalancePoint(productData.diemCanBang || '');
                    setHardness(productData.doCung || '');

                    // Set variants data
                    if (productData.sanPhamChiTiets && productData.sanPhamChiTiets.length > 0) {
                        const colors = [...new Set(productData.sanPhamChiTiets.map((item) => item.mauSac))];
                        const weights = [...new Set(productData.sanPhamChiTiets.map((item) => item.trongLuong))];

                        setSelectedColors(colors);
                        setSelectedWeights(weights);

                        const mappedVariants = productData.sanPhamChiTiets.map((item) => ({
                            id: `${item.mauSac}-${item.trongLuong}`,
                            name: `${productData.tenSanPham} - [${item.trongLuong}]`,
                            quantity: item.soLuong || 0,
                            price: item.donGia || 0,
                            weight: item.trongLuong,
                            color: item.mauSac,
                            originalId: item.id, // Keep original ID for updates
                        }));

                        setVariants(mappedVariants);

                        // Set images by color if available
                        const imagesByColorData = {};
                        productData.sanPhamChiTiets.forEach((item) => {
                            if (item.hinhAnhs && item.hinhAnhs.length > 0) {
                                imagesByColorData[item.mauSac] = item.hinhAnhs.map((img) => img.url);
                            }
                        });
                        setImagesByColor(imagesByColorData);
                    }
                }
            } catch (error) {
                console.error('Error loading product data:', error);
                toast.error('Có lỗi xảy ra khi tải dữ liệu sản phẩm', {
                    position: 'top-right',
                    autoClose: 3000,
                });
            } finally {
                setLoadingData(false);
            }
        };

        if (id) {
            loadProductData();
        }
    }, [id]);

    useEffect(() => {
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
                        originalId: existingVariant?.originalId, // Preserve original ID
                    });
                });
            });
            setVariants(newVariants);
        }
    }, [selectedColors, selectedWeights, productName, variants]);

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

        // Validation
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

        setShowConfirm(true);
    };

    const confirmSubmit = async () => {
        setShowConfirm(false);
        setLoading(true);

        const productData = {
            id: parseInt(id),
            productName,
            brand,
            material,
            balancePoint,
            hardness,
            description,
            trangThai: status === 'Active' ? 1 : 0,
            variants: variants.map((variant) => ({
                id: variant.originalId || null,
                mauSacTen: variant.color,
                trongLuongTen: variant.weight,
                soLuong: variant.quantity,
                donGia: variant.price,
                hinhAnhUrls: imagesByColor[variant.color] || [],
            })),
        };

        try {
            const response = await axios.put(
                `http://localhost:8080/api/san-pham-ct/${id}/update-with-variants`,
                productData,
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                },
            );

            if (response.status === 200) {
                toast.success('Cập nhật sản phẩm thành công!', {
                    position: 'top-right',
                    autoClose: 3000,
                });

                setTimeout(() => {
                    navigate('/admin/quan-ly-san-pham/san-pham');
                }, 200);
            }
        } catch (error) {
            console.error('Error updating product:', error);
            toast.error(`Có lỗi xảy ra khi cập nhật sản phẩm: ${error.response?.data?.message || error.message}`, {
                position: 'top-right',
                autoClose: 3000,
            });
        } finally {
            setLoading(false);
        }
    };

    if (loadingData) {
        return (
            <div className="flex justify-center items-center h-64">
                <CircularProgress size={48} />
                <span className="ml-4">Đang tải dữ liệu...</span>
            </div>
        );
    }

    return (
        <>
            <form onSubmit={handleSubmit}>
                <div className="font-bold text-sm">
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
                <ColorWeight
                    setSelectedColors={setSelectedColors}
                    setSelectedWeights={setSelectedWeights}
                    errors={errors}
                    initialColors={selectedColors}
                    initialWeights={selectedWeights}
                />
                <Variants
                    variants={variants}
                    handleRemoveVariant={handleRemoveVariant}
                    handleChange={handleChange}
                    imagesByColor={imagesByColor}
                    setImagesByColor={setImagesByColor}
                />
                {errors.submit && <p className="text-red-500 text-sm mt-2">{errors.submit}</p>}
                <div className="mt-6 flex gap-2">
                    <button
                        type="button"
                        onClick={() => navigate('/admin/quan-ly-san-pham/san-pham')}
                        className="bg-gray-500 text-white rounded-md px-4 py-2"
                    >
                        Hủy
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-blue-600 text-white rounded-md px-4 py-2 flex items-center disabled:bg-blue-400"
                    >
                        {loading ? <CircularProgress size={24} /> : 'Cập nhật'}
                    </button>
                </div>
            </form>

            {/* Modal xác nhận */}
            {showConfirm && (
                <div className="fixed inset-0 bg-black/10 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                        <h3 className="text-lg font-bold mb-4">Xác nhận cập nhật sản phẩm</h3>
                        <p className="text-sm text-gray-600 mb-4">
                            Bạn có chắc chắn muốn cập nhật sản phẩm "<strong>{productName}</strong>" với{' '}
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

export default UpdateProduct;
