import React, { useState, useEffect } from 'react';
import { Plus, X, ChevronDown, ChevronUp } from 'lucide-react';
import axios from 'axios';
import AddAttributeModal from './AddAttributeModal';

const ColorWeight = ({ setSelectedColors, setSelectedWeights, onChange }) => {
    const [colors, setColors] = useState([]);
    const [weights, setWeights] = useState([]);
    const [selectedColors, setSelectedColorsState] = useState([]);
    const [selectedWeights, setSelectedWeightsState] = useState([]);
    const [showColorOptions, setShowColorOptions] = useState(false);
    const [showWeightOptions, setShowWeightOptions] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentAttribute, setCurrentAttribute] = useState('');

    useEffect(() => {
        const fetchColors = async () => {
            try {
                const response = await axios.get('http://localhost:8080/api/mau-sac');
                setColors(response.data);
            } catch (error) {
                console.error('Error fetching colors:', error);
            }
        };

        const fetchWeights = async () => {
            try {
                const response = await axios.get('http://localhost:8080/api/trong-luong');
                setWeights(response.data);
            } catch (error) {
                console.error('Error fetching weights:', error);
            }
        };

        fetchColors();
        fetchWeights();
    }, []);

    const handleColorSelect = (color) => {
        setSelectedColorsState(prev => {
            const newSelectedColors = prev.includes(color.ten)
                ? prev.filter(c => c !== color.ten)
                : [...prev, color.ten];
            setSelectedColors(newSelectedColors);
            onChange();
            return newSelectedColors;
        });
    };

    const handleWeightSelect = (weight) => {
        setSelectedWeightsState(prev => {
            const newSelectedWeights = prev.includes(weight.ten)
                ? prev.filter(w => w !== weight.ten)
                : [...prev, weight.ten];
            setSelectedWeights(newSelectedWeights);
            onChange();
            return newSelectedWeights;
        });
    };

    const removeColor = (colorToRemove) => {
        setSelectedColorsState(prev => {
            const newSelectedColors = prev.filter(color => color !== colorToRemove);
            setSelectedColors(newSelectedColors);
            return newSelectedColors;
        });
    };

    const removeWeight = (weightToRemove) => {
        setSelectedWeightsState(prev => {
            const newSelectedWeights = prev.filter(weight => weight !== weightToRemove);
            setSelectedWeights(newSelectedWeights);
            return newSelectedWeights;
        });
    };

    const toggleColorOptions = () => {
        setShowColorOptions(!showColorOptions);
    };

    const toggleWeightOptions = () => {
        setShowWeightOptions(!showWeightOptions);
    };

    const openModal = (attribute) => {
        setCurrentAttribute(attribute);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const addNewAttribute = (newAttribute) => {
        if (currentAttribute === 'Màu sắc') {
            setColors(prev => [...prev , newAttribute]);
        } else if (currentAttribute === 'Trọng lượng') {
            setWeights(prev => [...prev, newAttribute]);
        }
    };

    return (
        <div className="bg-white p-4 rounded-md shadow-lg mt-4">
            <h2 className="text-xl text-center text-gray-500 font-bold mb-4">Màu sắc & Kích cỡ</h2>
            
            <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-bold text-gray-700">
                        <span className="text-red-600">*</span>Trọng lượng:
                    </label>
                    <div className="flex items-center">
                        <button
                            onClick={() => openModal('Trọng lượng')}
                            className="flex items-center gap-1 px-2 py-1 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                        >
                            <Plus size={16} />
                        </button>
                        <button
                            onClick={toggleWeightOptions}
                            className="flex items-center gap-1 px-3 py-1 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                        >
                            {showWeightOptions ? 'Ẩn tùy chọn' : 'Chọn kích cỡ'}
                            {showWeightOptions ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                    </div>
                </div>
                
                {selectedWeights.length > 0 && (
                    <div className="mb-3">
                        <div className="flex flex-wrap gap-2">
                            {selectedWeights.map((weight, index) => (
                                <span
                                    key={index}
                                    className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full"
                                >
                                    {weight}
                                    <button
                                        onClick={() => removeWeight(weight)}
                                        className="ml-2 text-blue-600 hover:text-blue-800"
                                    >
                                        <X size={14} />
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {showWeightOptions && (
                    <div className="border border-gray-200 rounded-md p-3 bg-gray-50">
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 gap-2">
                            {weights.map((weight, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleWeightSelect(weight)}
                                    className={`p-2 text-sm font-medium border rounded-md transition-colors ${
                                        selectedWeights.includes(weight.ten)
                                            ? 'bg-blue-500 text-white border-blue-500'
                                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                    }`}
                                >
                                    {weight.ten}
                                </button>
                            ))}
                        </div>
                        <div className="mt-2 text-right">
                            <button
                                onClick={toggleWeightOptions}
                                className="text-sm text-gray-500 hover:text-gray-700"
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                )}

                {selectedWeights.length === 0 && !showWeightOptions && (
                    <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center text-gray-500">
                        <p className="text-sm">Chưa chọn trọng lượng nào</p>
                        <button 
                            onClick={toggleWeightOptions}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium mt-1"
                        >
                            Nhấn để chọn trọng lượng
                        </button>
                    </div>
                )}
            </div>

            <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-bold text-gray-700">
                        <span className="text-red-600">*</span>Màu sắc:
                    </label>
                    <div className="flex items-center">
                        <button
                            onClick={() => openModal('Màu sắc')}
                            className="flex items-center gap-1 px-2 py-1 text-sm text-green-600 hover:text-green-800 hover:bg-green-50 rounded-md transition-colors"
                        >
                            <Plus size={16} />
                        </button>
                        <button
                            onClick={toggleColorOptions}
                            className="flex items-center gap-1 px-3 py-1 text-sm text-green-600 hover:text-green-800 hover:bg-green-50 rounded-md transition-colors"
                        >
                            {showColorOptions ? 'Ẩn tùy chọn' : 'Chọn màu sắc'}
                            {showColorOptions ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                    </div>
                </div>
                
                {selectedColors.length > 0 && (
                    <div className="mb-3">
                        <div className="flex flex-wrap gap-2">
                            {selectedColors.map((color, index) => (
                                <span
                                    key={index}
                                    className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full"
                                >
                                    {color}
                                    <button
                                        onClick={() => removeColor(color)}
                                        className="ml-2 text-green-600 hover:text-green-800"
                                    >
                                        <X size={14} />
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {showColorOptions && (
                    <div className="border border-gray-200 rounded-md p-3 bg-gray-50">
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                            {colors.map((color, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleColorSelect(color)}
                                    className={`p-2 text-sm font-medium border rounded-md transition-colors ${
                                        selectedColors.includes(color.ten)
                                            ? 'bg-green-500 text-white border-green-500'
                                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                    }`}
                                >
                                    {color.ten}
                                </button>
                            ))}
                        </div>
                        <div className="mt-2 text-right">
                            <button
                                onClick={toggleColorOptions}
                                className="text-sm text-gray-500 hover:text-gray-700"
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                )}

                {selectedColors.length === 0 && !showColorOptions && (
                    <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center text-gray-500">
                        <p className="text-sm">Chưa chọn màu sắc nào</p>
                        <button 
                            onClick={toggleColorOptions}
                            className="text-green-600 hover:text-green-800 text-sm font-medium mt-1"
                        >
                            Nhấn để chọn màu sắc
                        </button>
                    </div>
                )}
            </div>

            {(selectedColors.length > 0 || selectedWeights.length > 0) && (
                <div className="mt-4 p-3 bg-gray-50 rounded-md">
                    <p className="text-sm text-gray-600">
                        <strong>Tổng biến thể sẽ tạo:</strong> {selectedColors.length * selectedWeights.length}
                    </p>
                    {selectedColors.length > 0 && selectedWeights.length > 0 && (
                        <p className="text-xs text-gray-500 mt-1">
                            Mỗi màu sẽ có {selectedWeights.length} kích cỡ
                        </p>
                    )}
                </div>
            )}

            <AddAttributeModal 
                isOpen={isModalOpen} 
                onClose={closeModal} 
                onAdd={addNewAttribute} 
                attributeName={currentAttribute} 
            />
        </div>
    );
};

export default ColorWeight;
