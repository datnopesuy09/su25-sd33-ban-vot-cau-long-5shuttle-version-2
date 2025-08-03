import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AddAttributeModal from './AddAttributeModal';

const ProductInfo = ({
    status,
    setStatus,
    description,
    setDescription,
    productName,
    setProductName,
    brand,
    setBrand,
    material,
    setMaterial,
    balancePoint,
    setBalancePoint,
    hardness,
    setHardness,
    errors, // Thêm prop errors
}) => {
    const [brands, setBrands] = useState([]);
    const [materials, setMaterials] = useState([]);
    const [balances, setBalances] = useState([]);
    const [stiffs, setStiffs] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentAttribute, setCurrentAttribute] = useState('');

    const loadBrands = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/thuong-hieu');
            setBrands(response.data);
            // if (response.data.length > 0 && !brand) {
            //     setBrand(response.data[0].ten);
            // }
        } catch (error) {
            console.error('Failed to fetch brands', error);
        }
    };

    const loadMaterials = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/chat-lieu');
            setMaterials(response.data);
            // if (response.data.length > 0 && !material) {
            //     setMaterial(response.data[0].ten);
            // }
        } catch (error) {
            console.error('Failed to fetch Material', error);
        }
    };

    const loadBalances = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/diem-can-bang');
            setBalances(response.data);
            // if (response.data.length > 0 && !balancePoint) {
            //     setBalancePoint(response.data[0].ten);
            // }
        } catch (error) {
            console.error('Failed to fetch balances', error);
        }
    };

    const loadStiffs = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/do-cung');
            setStiffs(response.data);
            // if (response.data.length > 0 && !hardness) {
            //     setHardness(response.data[0].ten);
            // }
        } catch (error) {
            console.error('Failed to fetch stiffs', error);
        }
    };

    useEffect(() => {
        loadBrands();
        loadMaterials();
        loadBalances();
        loadStiffs();
    }, []);

    const handleAddAttribute = (newAttribute) => {
        switch (currentAttribute) {
            case 'Thương hiệu':
                setBrands((prev) => [...prev, newAttribute]);
                break;
            case 'Chất liệu':
                setMaterials((prev) => [...prev, newAttribute]);
                break;
            case 'Điểm cân bằng':
                setBalances((prev) => [...prev, newAttribute]);
                break;
            case 'Độ cứng':
                setStiffs((prev) => [...prev, newAttribute]);
                break;
            default:
                break;
        }
    };

    return (
        <div className="bg-white p-4 rounded-md shadow-lg">
            <h2 className="text-xl text-center text-gray-500 font-bold mb-4">Thông tin sản phẩm</h2>
            <div className="mb-2 flex justify-center">
                <div className="w-[85%]">
                    <label className="block text-sm font-bold text-gray-700" htmlFor="productName">
                        <span className="text-red-600">*</span>Tên sản phẩm
                    </label>
                    <input
                        id="productName"
                        value={productName}
                        onChange={(e) => setProductName(e.target.value)}
                        className={`mt-1 block w-full h-10 border rounded-md p-2 text-sm ${
                            errors.productName ? 'border-red-500' : 'border-gray-300'
                        }`}
                        required
                    />
                    {errors.productName && <p className="text-red-500 text-xs mt-1">{errors.productName}</p>}
                </div>
            </div>
            <div className="mb-2 grid grid-cols-2 gap-4 w-[85%] mx-auto">
                <div className="flex items-center">
                    <div className="flex-grow">
                        <label className="block text-sm font-bold text-gray-700" htmlFor="brand">
                            <span className="text-red-600">*</span>Thương hiệu
                        </label>
                        <div className="flex items-center">
                            <select
                                id="brand"
                                value={brand}
                                onChange={(e) => setBrand(e.target.value)}
                                className={`mt-1 block w-full h-10 border rounded-md p-2 text-sm ${
                                    errors.brand ? 'border-red-500' : 'border-gray-300'
                                }`}
                                required
                            >
                                <option value="" disabled>
                                    Chọn thương hiệu
                                </option>
                                {brands.map((b, index) => (
                                    <option key={index} value={b.ten}>
                                        {b.ten}
                                    </option>
                                ))}
                            </select>
                            <button
                                type="button"
                                onClick={() => {
                                    setCurrentAttribute('Thương hiệu');
                                    setIsModalOpen(true);
                                }}
                                className="ml-2 text-blue-500"
                            >
                                +
                            </button>
                        </div>
                        {errors.brand && <p className="text-red-500 text-xs mt-1">{errors.brand}</p>}
                    </div>
                </div>

                <div className="flex items-center">
                    <div className="flex-grow">
                        <label className="block text-sm font-bold text-gray-700" htmlFor="material">
                            <span className="text-red-600">*</span>Chất liệu
                        </label>
                        <div className="flex items-center">
                            <select
                                id="material"
                                value={material}
                                onChange={(e) => setMaterial(e.target.value)}
                                className={`mt-1 block w-full h-10 border rounded-md p-2 text-sm ${
                                    errors.material ? 'border-red-500' : 'border-gray-300'
                                }`}
                                required
                            >
                                <option value="" disabled>
                                    Chọn chất liệu
                                </option>
                                {materials.map((m, index) => (
                                    <option key={index} value={m.ten}>
                                        {m.ten}
                                    </option>
                                ))}
                            </select>
                            <button
                                type="button"
                                onClick={() => {
                                    setCurrentAttribute('Chất liệu');
                                    setIsModalOpen(true);
                                }}
                                className="ml-2 text-blue-500"
                            >
                                +
                            </button>
                        </div>
                        {errors.material && <p className="text-red-500 text-xs mt-1">{errors.material}</p>}
                    </div>
                </div>

                <div className="flex items-center">
                    <div className="flex-grow">
                        <label className="block text-sm font-bold text-gray-700" htmlFor="balancePoint">
                            <span className="text-red-600">*</span>Điểm cân bằng
                        </label>
                        <div className="flex items-center">
                            <select
                                id="balancePoint"
                                value={balancePoint}
                                onChange={(e) => setBalancePoint(e.target.value)}
                                className={`mt-1 block w-full h-10 border rounded-md p-2 text-sm ${
                                    errors.balancePoint ? 'border-red-500' : 'border-gray-300'
                                }`}
                                required
                            >
                                <option value="" disabled>
                                    Chọn điểm cân bằng
                                </option>
                                {balances.map((bp, index) => (
                                    <option key={index} value={bp.ten}>
                                        {bp.ten}
                                    </option>
                                ))}
                            </select>
                            <button
                                type="button"
                                onClick={() => {
                                    setCurrentAttribute('Điểm cân bằng');
                                    setIsModalOpen(true);
                                }}
                                className="ml-2 text-blue-500"
                            >
                                +
                            </button>
                        </div>
                        {errors.balancePoint && <p className="text-red-500 text-xs mt-1">{errors.balancePoint}</p>}
                    </div>
                </div>

                <div className="flex items-center">
                    <div className="flex-grow">
                        <label className="block text-sm font-bold text-gray-700" htmlFor="hardness">
                            <span className="text-red-600">*</span>Độ cứng
                        </label>
                        <div className="flex items-center">
                            <select
                                id="hardness"
                                value={hardness}
                                onChange={(e) => setHardness(e.target.value)}
                                className={`mt-1 block w-full h-10 border rounded-md p-2 text-sm ${
                                    errors.hardness ? 'border-red-500' : 'border-gray-300'
                                }`}
                                required
                            >
                                <option value="" disabled>
                                    Chọn độ cứng
                                </option>
                                {stiffs.map((h, index) => (
                                    <option key={index} value={h.ten}>
                                        {h.ten}
                                    </option>
                                ))}
                            </select>
                            <button
                                type="button"
                                onClick={() => {
                                    setCurrentAttribute('Độ cứng');
                                    setIsModalOpen(true);
                                }}
                                className="ml-2 text-blue-500"
                            >
                                +
                            </button>
                        </div>
                        {errors.hardness && <p className="text-red-500 text-xs mt-1">{errors.hardness}</p>}
                    </div>
                </div>
            </div>

            <div className="mb-2 w-[85%] mx-auto">
                <label className="block text-sm font-bold text-gray-700" htmlFor="status">
                    <span className="text-red-600">*</span>Trạng thái
                </label>
                <select
                    id="status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className={`mt-1 block w-full h-10 border rounded-md p-2 text-sm ${
                        errors.status ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required
                >
                    <option value="" disabled>
                        Chọn trạng thái
                    </option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                </select>
                {errors.status && <p className="text-red-500 text-xs mt-1">{errors.status}</p>}
            </div>

            <div className="mb-2 w-[85%] mx-auto">
                <label className="block text-sm font-bold text-gray-700" htmlFor="description">
                    <span className="text-red-600">*</span>Mô tả
                </label>
                <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className={`mt-1 block w-full border rounded-md p-1 text-sm h-20 ${
                        errors.description ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required
                />
                {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
            </div>

            <AddAttributeModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAdd={handleAddAttribute}
                attributeName={currentAttribute}
            />
        </div>
    );
};

export default ProductInfo;
