import React, { useState } from 'react';
import { CircularProgress } from '@mui/material';
import ProductInfo from './ProductInfo';
import ColorWeight from './ColorWeight';
import axios from 'axios';
import Variants from './Variants';

function AddProduct() {
    const [status, setStatus] = useState('');
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

    const filterVariants = () => {
        if (selectedColors.length === 0 || selectedWeights.length === 0 || !productName) {
            return [];
        }

        const newVariants = [];
        selectedColors.forEach((color) => {
            selectedWeights.forEach((weight) => {
                newVariants.push({
                    id: newVariants.length + 1,
                    name: `${productName} - [${weight}]`,
                    quantity: 0,
                    price: 0,
                    weight: weight,
                    color: color,
                });
            });
        });
        return newVariants;
    };

    const filteredVariants = filterVariants();

    const handleRemoveVariant = (id) => {
        const newVariants = variants.filter((variant) => variant.id !== id);
        setVariants(newVariants);
    };

    const handleChange = (id, field, value) => {
        setVariants((prev) =>
            prev.map((item) =>
                item.id === id
                    ? { ...item, [field]: field === 'price' || field === 'quantity' ? Number(value) : value }
                    : item,
            ),
        );
    };

    const handleColorWeightChange = () => {
        setVariants(filterVariants());
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (!productName || selectedColors.length === 0 || selectedWeights.length === 0 || !brand || !material || !balancePoint || !hardness) {
            alert("Vui lòng điền đầy đủ thông tin sản phẩm");
            setLoading(false);
            return;
        }

        const productData = {
            productName,
            brand,
            material,
            balancePoint,
            hardness,
            description,
            variants: filteredVariants.map(variant => ({
                color: variant.color,
                weight: variant.weight,
                quantity: variant.quantity,
                price: variant.price,
                imageUrls: imagesByColor[variant.color] || []
            }))
        };

        try {
            const response = await axios.post(
                'http://localhost:8080/api/san-pham-ct/add-with-variants',
                productData,
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.status === 200) {
                alert('Thêm sản phẩm thành công!');
                // Reset form
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
            }
        } catch (error) {
            console.error('Error adding product:', error);
            alert('Có lỗi xảy ra khi thêm sản phẩm: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleImagesChange = (variantId, files) => {
        const fileArray = Array.from(files).map((file) => URL.createObjectURL(file));
        setVariants((prev) =>
            prev.map((variant) =>
                variant.id === variantId ? { ...variant, images: [...(variant.images || []), ...fileArray] } : variant,
            ),
        );
    };

    return (
        <div>
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
                setBrand={setBrand}
                setMaterial={setMaterial}
                setBalancePoint={setBalancePoint}
                setHardness={setHardness}
            />

            <ColorWeight
                setSelectedColors={setSelectedColors}
                setSelectedWeights={setSelectedWeights}
                onChange={handleColorWeightChange}
            />
            <Variants
                filteredVariants={filteredVariants}
                handleRemoveVariant={handleRemoveVariant}
                handleChange={handleChange}
                handleImagesChange={handleImagesChange}
            />

            <div className="mt-6">
                <button
                    type="button"
                    onClick={handleSubmit}
                    className="bg-blue-600 text-white rounded-md px-4 py-2 ml-auto flex items-center"
                >
                    {loading ? <CircularProgress size={24} /> : 'Lưu'}
                </button>
            </div>
        </div>
    );
}

export default AddProduct;
