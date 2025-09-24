import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom'; // ✅ thêm useParams
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { TbEyeEdit } from 'react-icons/tb';
import { Search, Filter, Package, ChevronDown, Edit3, X, Save, PackagePlus, Upload } from 'lucide-react';
import Swal from 'sweetalert2';

function SpctDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [productDetail, setProductDetail] = useState(null);
    const [selectedVariant, setSelectedVariant] = useState(null); // lưu sản phẩm được chọn
    const [isModalOpen, setIsModalOpen] = useState(false); // mở/tắt modal
    const [variants, setVariants] = useState([]);
    const [isLoading, setIsLoading] = useState(false); // loading state cho update
    const [pendingRequests, setPendingRequests] = useState({}); // lưu trữ yêu cầu nhập hàng

    const [brand, setBrand] = useState('');
    const [material, setMaterial] = useState('');
    const [balancePoint, setBalancePoint] = useState('');
    const [stiff, setStiff] = useState('');
    const [status, setStatus] = useState('');
    const [description, setDescription] = useState('');
    const [color, setColor] = useState('');
    const [weight, setWeight] = useState('');

    const [brands, setBrands] = useState([]);
    const [materials, setMaterials] = useState([]);
    const [balances, setBalances] = useState([]);
    const [stiffs, setStiffs] = useState([]);
    const [colors, setColors] = useState([]);
    const [weights, setWeights] = useState([]);

    const [selectedImages, setSelectedImages] = useState([]);
    const [previewImage, setPreviewImage] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    const uploadImages = async (files) => {
        if (!files || files.length === 0) {
            alert('Vui lòng chọn ít nhất một hình ảnh');
            return [];
        }
        const formData = new FormData();
        files.forEach((file) => {
            formData.append('images', file);
        });

        try {
            const response = await axios.post('http://localhost:8080/api/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data.urls;
        } catch (error) {
            console.error('Error uploading images:', error);
            alert(`Lỗi khi tải ảnh: ${error.response?.data?.message || error.message}`);
            return [];
        }
    };

    const handleImageUpload = async (files) => {
        if (!files || files.length === 0) return;

        setIsUploading(true);
        try {
            const uploadedUrls = await uploadImages(Array.from(files));
            setSelectedImages((prev) => [...prev, ...uploadedUrls]);
        } finally {
            setIsUploading(false);
        }
    };

    const removeImage = (imageIndex) => {
        setSelectedImages((prev) => prev.filter((_, index) => index !== imageIndex));
    };

    const loadBrands = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/thuong-hieu');
            setBrands(response.data);
        } catch (error) {
            console.error('Failed to fetch brands', error);
        }
    };

    const loadMaterials = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/chat-lieu');
            setMaterials(response.data);
        } catch (error) {
            console.error('Failed to fetch Material', error);
        }
    };

    const loadBalances = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/diem-can-bang');
            setBalances(response.data);
        } catch (error) {
            console.error('Failed to fetch balances', error);
        }
    };

    const loadStiffs = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/do-cung');
            setStiffs(response.data);
        } catch (error) {
            console.error('Failed to fetch stiffs', error);
        }
    };

    const loadColors = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/mau-sac');
            setColors(response.data);
        } catch (error) {
            console.error('Failed to fetch colors', error);
        }
    };

    const loadWeights = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/trong-luong');
            setWeights(response.data);
        } catch (error) {
            console.error('Failed to fetch weights', error);
        }
    };

    useEffect(() => {
        loadBrands();
        loadMaterials();
        loadBalances();
        loadStiffs();
        loadColors();
        loadWeights();
    }, []);

    const handleOpenModal = (variant) => {
        setSelectedVariant(variant);
        // set dữ liệu mặc định từ variant lên các state input
        setBrand(variant.brand || '');
        setMaterial(variant.material || '');
        setBalancePoint(variant.balancePoint || '');
        setStiff(variant.hardness || '');
        // KHÔNG set color và weight vì chúng không thể chỉnh sửa
        setStatus(variant.status || '');
        setDescription(productDetail?.moTa || '');
        
        // Load tất cả ảnh hiện tại nếu có
        if (variant.hinhAnhUrls && variant.hinhAnhUrls.length > 0) {
            setSelectedImages(variant.hinhAnhUrls);
        } else if (variant.image) {
            setSelectedImages([variant.image]);
        } else {
            setSelectedImages([]);
        }
        
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedVariant(null);
    };

    const handleUpdateProduct = async () => {
        if (!selectedVariant) return;
        
        // Đếm số biến thể cùng màu
        const sameColorVariants = variants.filter(v => v.color === selectedVariant.color);
        const variantCount = sameColorVariants.length;
        
        // Hiển thị modal xác nhận nếu có nhiều hơn 1 biến thể cùng màu
        if (variantCount > 1) {
            const confirmed = await Swal.fire({
                title: 'Xác nhận cập nhật',
                html: `
                    <div class="text-left">
                        <p class="mb-3">Bạn đang cập nhật <strong>${variantCount} biến thể</strong> cùng màu <strong>${selectedVariant.color}</strong>:</p>
                        <ul class="list-disc list-inside text-sm text-gray-600 mb-3">
                            ${sameColorVariants.map(v => `<li>${v.weight} - ${v.maSanPham}</li>`).join('')}
                        </ul>
                        <p class="text-orange-600 font-medium">⚠️ Tất cả thông tin sẽ được cập nhật giống nhau cho các biến thể này!</p>
                    </div>
                `,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: `Cập nhật ${variantCount} biến thể`,
                cancelButtonText: 'Hủy',
                confirmButtonColor: '#3b82f6',
                customClass: {
                    container: 'swal-wide',
                },
            });
            
            if (!confirmed.isConfirmed) {
                return;
            }
        }
        
        setIsLoading(true);
    
        try {
            const updateData = {
                soLuong: selectedVariant.quantity,
                donGia: selectedVariant.price,
                trangThai: status,
                moTa: description,
                brand,
                material,
                balancePoint,
                hardness: stiff,
                // KHÔNG gửi color và weight vì chúng là thuộc tính phân biệt biến thể
                hinhAnhUrls: selectedImages,
            };
    
            // 👉 Cập nhật TẤT CẢ biến thể cùng màu
            const response = await axios.put(
                `http://localhost:8080/api/san-pham-ct/update-by-color/${selectedVariant.id}`,
                updateData
            );
    
            const { updatedCount, color: updatedColor } = response.data;
            toast.success(`Đã cập nhật ${updatedCount} biến thể màu ${updatedColor}`);
    
            // Cập nhật TẤT CẢ biến thể cùng màu trong state local
            setVariants(prevVariants => 
                prevVariants.map(variant => 
                    variant.color === selectedVariant.color 
                        ? {
                            ...variant,
                            brand,
                            material,
                            balancePoint,
                            hardness: stiff,
                            // GIỮ NGUYÊN color và weight vì chúng là thuộc tính phân biệt biến thể
                            quantity: selectedVariant.quantity,
                            price: selectedVariant.price,
                            status: status === 'Active' ? 'Active' : 'Inactive',
                            hinhAnhUrls: selectedImages,
                            image: selectedImages[0] || null,
                        }
                        : variant
                )
            );
    
            handleCloseModal();
        } catch (error) {
            console.error('Lỗi khi cập nhật sản phẩm:', error);
            toast.error(error.response?.data?.message || 'Không thể cập nhật sản phẩm');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const fetchProductDetail = async () => {
            try {
                const res = await axios.get(`http://localhost:8080/api/san-pham-ct/${id}/detaill`);
                const data = res.data;

                // Lưu thông tin sản phẩm cha
                setProductDetail(data);

                // Map variants từ tất cả biến thể (bao gồm trùng lặp)
                const loadedVariants = data.variants.map((v, index) => ({
                    stt: index + 1,
                    id: v.id,
                    maSanPham: v.maSanPham,
                    brand: data.thuongHieu,
                    material: data.chatLieu,
                    balancePoint: data.diemCanBang,
                    hardness: data.doCung,
                    color: v.mauSacTen,
                    colorId: v.mauSacId,
                    weight: v.trongLuongTen,
                    weightId: v.trongLuongId,
                    quantity: v.soLuong,
                    price: v.donGia,
                    status: v.trangThai === 1 ? 'Active' : 'Inactive',
                    image: v.hinhAnhUrls?.length > 0 ? v.hinhAnhUrls[0] : null,
                    hinhAnhUrls: v.hinhAnhUrls || [],
                }));

                setVariants(loadedVariants);
            } catch (err) {
                console.error('Lỗi khi lấy dữ liệu sản phẩm:', err);
                toast.error('Không thể tải dữ liệu sản phẩm.');
            }
        };

        fetchProductDetail();
        getPendingRequests();
    }, [id]);

    const handleNavigateToProduct = () => {
        navigate('/admin/quan-ly-san-pham/san-pham');
    };

    // Lấy danh sách yêu cầu nhập hàng
    const getPendingRequests = () => {
        axios
            .get(`http://localhost:8080/api/pre-order/pending`)
            .then((response) => {
                const requestsMap = {};
                response.data.forEach(([idSanPhamCT, totalRequested]) => {
                    requestsMap[idSanPhamCT] = totalRequested;
                });
                setPendingRequests(requestsMap);
            })
            .catch((error) => {
                console.error('Có lỗi xảy ra khi lấy yêu cầu nhập hàng:', error);
                toast.error('Không thể tải danh sách yêu cầu nhập hàng!');
            });
    };

    // Xử lý cập nhật số lượng kho cho variant
    const handleUpdateStock = async (variant) => {
        const requestedQuantity = pendingRequests[variant.id] || 0;

        // Modal với 2 options
        const { value: result } = await Swal.fire({
            title: `Cập nhật kho cho sản phẩm`,
            html: `
            <div class="text-left mb-4">
                <p><strong>Sản phẩm:</strong> ${productDetail?.tenSanPham}</p>
                <p><strong>Màu sắc:</strong> ${variant.color}</p>
                <p><strong>Trọng lượng:</strong> ${variant.weight}</p>
                <p><strong>Số lượng hiện tại:</strong> ${variant.quantity}</p>
                <p><strong>Yêu cầu nhập hàng:</strong> ${requestedQuantity}</p>
            </div>

            <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">Chọn loại cập nhật:</label>
                <select id="update-type" class="swal2-select">
                    <option value="add">Nhập thêm hàng (cộng dồn)</option>
                    <option value="set">Cập nhật tổng số lượng (thay thế)</option>
                </select>
            </div>

            <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">Số lượng:</label>
                <input id="swal-input1" class="swal2-input" type="number" placeholder="Nhập số lượng" min="0" value="0">
            </div>

            <div id="preview" class="text-sm text-gray-600 mt-2"></div>
        `,
            focusConfirm: false,
            didOpen: () => {
                const updateTypeSelect = document.getElementById('update-type');
                const quantityInput = document.getElementById('swal-input1');
                const preview = document.getElementById('preview');

                const updatePreview = () => {
                    const updateType = updateTypeSelect.value;
                    const inputValue = parseInt(quantityInput.value) || 0;

                    if (updateType === 'add') {
                        const newTotal = variant.quantity + inputValue;
                        preview.innerHTML = `<strong>Kết quả:</strong> ${variant.quantity} + ${inputValue} = <span class="text-blue-600">${newTotal}</span> sản phẩm`;
                    } else {
                        preview.innerHTML = `<strong>Kết quả:</strong> Số lượng kho = <span class="text-blue-600">${inputValue}</span> sản phẩm`;
                    }
                };

                updateTypeSelect.addEventListener('change', updatePreview);
                quantityInput.addEventListener('input', updatePreview);
                updatePreview(); // Initial preview
            },
            preConfirm: () => {
                const updateType = document.getElementById('update-type').value;
                const inputValue = parseInt(document.getElementById('swal-input1').value);

                if (isNaN(inputValue) || inputValue < 0) {
                    Swal.showValidationMessage('Vui lòng nhập số lượng hợp lệ!');
                    return false;
                }

                let finalQuantity;
                if (updateType === 'add') {
                    finalQuantity = variant.quantity + inputValue;
                    if (inputValue === 0) {
                        Swal.showValidationMessage('Vui lòng nhập số lượng cần thêm!');
                        return false;
                    }
                } else {
                    finalQuantity = inputValue;
                }

                return {
                    type: updateType,
                    inputValue: inputValue,
                    finalQuantity: finalQuantity,
                };
            },
            showCancelButton: true,
            confirmButtonText: 'Cập nhật',
            cancelButtonText: 'Hủy',
            customClass: {
                container: 'swal-wide',
            },
        });

        if (result) {
            try {
                const response = await axios.patch(
                    `http://localhost:8080/api/pre-order/san-pham-ct/${variant.id}/stock`,
                    {
                        soLuong: result.finalQuantity,
                    },
                );

                if (response.status === 200) {
                    const successMessage =
                        result.type === 'add'
                            ? `Đã thêm ${result.inputValue} sản phẩm vào kho. Tổng: ${result.finalQuantity}`
                            : `Đã cập nhật số lượng kho thành ${result.finalQuantity} sản phẩm`;

                    toast.success(successMessage);

                    // Cập nhật lại danh sách variants trong state
                    setVariants((prevVariants) =>
                        prevVariants.map((v) => (v.id === variant.id ? { ...v, quantity: result.finalQuantity } : v)),
                    );

                    // Cập nhật lại yêu cầu nhập hàng
                    getPendingRequests();
                } else {
                    toast.error(response.data || 'Có lỗi xảy ra khi cập nhật kho!');
                }
            } catch (error) {
                console.error('Cập nhật kho thất bại', error);
                toast.error(error.response?.data || 'Có lỗi xảy ra khi cập nhật kho!');
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            {/* Breadcrumb với styling mới */}
            <div className="mb-6">
                <nav className="flex items-center space-x-2 text-sm">
                    <button
                        onClick={handleNavigateToProduct}
                        className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
                    >
                        Sản phẩm
                    </button>
                    <span className="text-gray-400">/</span>
                    <span className="text-gray-600 font-medium">{productDetail?.tenSanPham}</span>
                </nav>
            </div>

            {/* Search và Filter Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-6">
                <div className="p-6">
                    {/* Search bar */}
                    <div className="mb-6">
                        <div className="relative max-w-md">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Nhập mã sản phẩm để tìm..."
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            />
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-wrap gap-4">
                        <div className="flex items-center gap-2">
                            <Filter className="w-4 h-4 text-gray-500" />
                            <span className="text-gray-700 font-medium text-sm">Bộ lọc:</span>
                        </div>

                        {/* Thương hiệu */}
                        <div className="relative">
                            <select className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer">
                                <option value="">Thương hiệu</option>
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>

                        {/* Điểm cân bằng */}
                        <div className="relative">
                            <select className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer">
                                <option value="">Điểm cân bằng</option>
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>

                        {/* Chất liệu */}
                        <div className="relative">
                            <select className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer">
                                <option value="">Chất liệu</option>
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>

                        {/* Độ cứng */}
                        <div className="relative">
                            <select className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer">
                                <option value="">Độ cứng</option>
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>

                        {/* Trạng thái */}
                        <div className="relative">
                            <select className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer">
                                <option value="">Trạng thái</option>
                                <option value="active">Hoạt động</option>
                                <option value="inactive">Không hoạt động</option>
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Bảng sản phẩm với styling mới */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Header */}
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-100 rounded-xl p-2">
                                <Package className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold text-gray-800">Danh sách sản phẩm</h3>
                                <p className="text-gray-600 text-sm">{variants.length} sản phẩm</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="w-full">
                    <table className="w-full table-fixed divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="w-12 px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    STT
                                </th>
                                <th className="w-16 px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Ảnh
                                </th>
                                <th className="w-32 px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Mã SP
                                </th>
                                <th className="w-20 px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Thương hiệu
                                </th>
                                <th className="w-20 px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Chất liệu
                                </th>
                                <th className="w-20 px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Điểm CB
                                </th>
                                <th className="w-16 px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Độ cứng
                                </th>
                                <th className="w-20 px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Màu sắc
                                </th>
                                <th className="w-20 px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    TL
                                </th>
                                <th className="w-16 px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                                    SL
                                </th>
                                <th className="w-16 px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                                    Yêu cầu
                                </th>
                                <th className="w-24 px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                                    Đơn giá
                                </th>
                                <th className="w-20 px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                                    Trạng thái
                                </th>
                                <th className="w-20 px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                                    Thao tác
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {variants.length > 0 ? (
                                variants.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50 transition-colors duration-150">
                                        <td className="px-2 py-3 text-xs text-gray-900">{item.stt}</td>
                                        <td className="px-2 py-3">
                                            {item.image ? (
                                                <img
                                                    src={item.image}
                                                    alt={item.code}
                                                    className="h-12 w-12 object-cover rounded-lg border border-gray-200 shadow-sm"
                                                />
                                            ) : (
                                                <div className="h-12 w-12 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                                                    <Package className="w-4 h-4 text-gray-400" />
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-2 py-3">
                                            <div
                                                className="text-xs font-medium text-gray-900 truncate"
                                                title={item.maSanPham}
                                            >
                                                {item.maSanPham}
                                            </div>
                                        </td>
                                        <td className="px-2 py-3">
                                            <div className="text-xs text-gray-900 truncate" title={item.brand}>
                                                {item.brand}
                                            </div>
                                        </td>
                                        <td className="px-2 py-3">
                                            <div className="text-xs text-gray-900 truncate" title={item.material}>
                                                {item.material}
                                            </div>
                                        </td>
                                        <td className="px-2 py-3">
                                            <div className="text-xs text-gray-900 truncate" title={item.balancePoint}>
                                                {item.balancePoint}
                                            </div>
                                        </td>
                                        <td className="px-2 py-3">
                                            <div className="text-xs text-gray-900 truncate" title={item.hardness}>
                                                {item.hardness}
                                            </div>
                                        </td>
                                        <td className="px-2 py-3">
                                            <span
                                                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 truncate"
                                                title={item.color}
                                            >
                                                {item.color}
                                            </span>
                                        </td>
                                        <td className="px-2 py-3">
                                            <div className="text-xs text-gray-900 truncate" title={item.weight}>
                                                {item.weight}
                                            </div>
                                        </td>
                                        <td className="px-2 py-3 text-center">
                                            <span
                                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                                    item.quantity > 10
                                                        ? 'bg-green-100 text-green-800'
                                                        : item.quantity > 0
                                                          ? 'bg-yellow-100 text-yellow-800'
                                                          : 'bg-red-100 text-red-800'
                                                }`}
                                            >
                                                {item.quantity}
                                            </span>
                                        </td>
                                        <td className="px-2 py-3 text-center">
                                            <span
                                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                                    pendingRequests[item.id] > 0
                                                        ? 'bg-orange-100 text-orange-800'
                                                        : 'bg-gray-100 text-gray-600'
                                                }`}
                                            >
                                                {pendingRequests[item.id] || 0}
                                            </span>
                                        </td>
                                        <td className="px-2 py-3 text-center">
                                            <div
                                                className="text-xs font-medium text-gray-900"
                                                title={`${item.price.toLocaleString('vi-VN')}đ`}
                                            >
                                                {(item.price / 1000).toFixed(0)}k
                                            </div>
                                        </td>
                                        <td className="px-2 py-3 text-center">
                                            <span
                                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                                    item.status === 'Active'
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-red-100 text-red-800'
                                                }`}
                                                title={item.status === 'Active' ? 'Hoạt động' : 'Không hoạt động'}
                                            >
                                                {item.status === 'Active' ? 'Hoạt động' : 'Không hoat động'}
                                            </span>
                                        </td>
                                        <td className="px-2 py-3 text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                <button
                                                    onClick={() => handleOpenModal(item)}
                                                    className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors duration-150"
                                                    title="Chỉnh sửa"
                                                >
                                                    <Edit3 className="w-3 h-3" />
                                                </button>
                                                <button
                                                    onClick={() => handleUpdateStock(item)}
                                                    className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-green-100 text-green-600 hover:bg-green-200 transition-colors duration-150"
                                                    title="Cập nhật kho"
                                                >
                                                    <PackagePlus className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="14" className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <Package className="w-12 h-12 text-gray-300 mb-4" />
                                            <p className="text-gray-500 text-lg font-medium">Không có dữ liệu</p>
                                            <p className="text-gray-400 text-sm">
                                                Chưa có sản phẩm nào trong danh sách
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            {/* Modal chỉnh sửa với styling mới */}
            {isModalOpen && selectedVariant && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-auto">
                        {/* Header */}
                        <div className="bg-gray-50 px-6 py-5 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="bg-blue-100 rounded-xl p-2">
                                        <Edit3 className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-semibold text-gray-800">Chỉnh sửa sản phẩm</h2>
                                        <p className="text-gray-600 text-sm">Cập nhật thông tin sản phẩm</p>
                                    </div>
                                </div>

                                <button
                                    onClick={handleCloseModal}
                                    className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-5">
                            {/* Chia 2 cột cho thông tin chung */}
                            <div className="grid grid-cols-2 gap-6">
                                {/* Thương hiệu */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700">Thương hiệu</label>
                                    <select
                                        value={brand}
                                        onChange={(e) => setBrand(e.target.value)}
                                        className="mt-1 block w-full h-10 border rounded-md p-2 text-sm"
                                    >
                                        <option value="">Chọn thương hiệu</option>
                                        {brands.map((b, index) => (
                                            <option key={index} value={b.ten}>
                                                {b.ten}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Chất liệu */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700">Chất liệu</label>
                                    <select
                                        value={material}
                                        onChange={(e) => setMaterial(e.target.value)}
                                        className="mt-1 block w-full h-10 border rounded-md p-2 text-sm"
                                    >
                                        <option value="">Chọn chất liệu</option>
                                        {materials.map((b, index) => (
                                            <option key={index} value={b.ten}>
                                                {b.ten}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Điểm cân bằng */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700">Điểm cân bằng</label>
                                    <select
                                        value={balancePoint}
                                        onChange={(e) => setBalancePoint(e.target.value)}
                                        className="mt-1 block w-full h-10 border rounded-md p-2 text-sm"
                                    >
                                        <option value="">Chọn điểm cân bằng</option>
                                        {balances.map((b, index) => (
                                            <option key={index} value={b.ten}>
                                                {b.ten}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Độ cứng */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700">Độ cứng</label>
                                    <select
                                        value={stiff}
                                        onChange={(e) => setStiff(e.target.value)}
                                        className="mt-1 block w-full h-10 border rounded-md p-2 text-sm"
                                    >
                                        <option value="">Chọn độ cứng</option>
                                        {stiffs.map((b, index) => (
                                            <option key={index} value={b.ten}>
                                                {b.ten}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Màu sắc - CHỈ HIỂN THỊ, KHÔNG CHỈNH SỬA */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700">Màu sắc</label>
                                    <div className="mt-1 block w-full h-10 border rounded-md p-2 text-sm bg-gray-100 text-gray-600 flex items-center">
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            {selectedVariant?.color || 'Chưa chọn'}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">Màu sắc không thể thay đổi</p>
                                </div>

                                {/* Trọng lượng - CHỈ HIỂN THỊ, KHÔNG CHỈNH SỬA */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700">Trọng lượng</label>
                                    <div className="mt-1 block w-full h-10 border rounded-md p-2 text-sm bg-gray-100 text-gray-600 flex items-center">
                                        <span className="text-sm font-medium">
                                            {selectedVariant?.weight || 'Chưa chọn'}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">Trọng lượng không thể thay đổi</p>
                                </div>
                            </div>

                            {/* Hàng 3 cột: Số lượng - Giá - Trạng thái */}
                            <div className="grid grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700">Số lượng</label>
                                    <input
                                        type="number"
                                        value={selectedVariant.quantity}
                                        onChange={(e) =>
                                            setSelectedVariant({
                                                ...selectedVariant,
                                                quantity: parseInt(e.target.value) || 0,
                                            })
                                        }
                                        className="w-full border rounded-md p-2 text-sm"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700">Đơn giá (VND)</label>
                                    <input
                                        type="number"
                                        value={selectedVariant.price}
                                        onChange={(e) =>
                                            setSelectedVariant({
                                                ...selectedVariant,
                                                price: parseInt(e.target.value) || 0,
                                            })
                                        }
                                        className="w-full border rounded-md p-2 text-sm"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700">Trạng thái</label>
                                    <select
                                        value={status}
                                        onChange={(e) => setStatus(e.target.value)}
                                        className="w-full h-10 border rounded-md p-2 text-sm"
                                    >
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>

                            {/* Mô tả nằm cuối */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700">Mô tả</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full border rounded-md p-2 text-sm h-24"
                                />
                            </div>

                            {/* Phần chọn ảnh */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Hình ảnh sản phẩm
                                    <span className="text-xs text-orange-600 ml-2">
                                        (Ảnh sẽ được áp dụng cho tất cả biến thể màu {selectedVariant?.color})
                                    </span>
                                </label>
                                
                                {/* Thông báo cập nhật theo nhóm màu */}
                                <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                    <div className="flex items-start">
                                        <div className="flex-shrink-0">
                                            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div className="ml-3">
                                            <h3 className="text-sm font-medium text-blue-800">
                                                Cập nhật theo nhóm màu
                                            </h3>
                                            <div className="mt-1 text-sm text-blue-700">
                                                <p>
                                                    Thay đổi này sẽ áp dụng cho <strong>
                                                        {variants.filter(v => v.color === selectedVariant?.color).length} biến thể
                                                    </strong> cùng màu <strong>{selectedVariant?.color}</strong>
                                                </p>
                                                <p className="text-xs text-gray-600 mt-1">
                                                    * Màu sắc và trọng lượng không thể thay đổi để tránh tạo duplicate
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex gap-4 items-start">
                                    {/* Upload area */}
                                    <div className="flex-shrink-0 w-48 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                                        <label htmlFor="image-upload" className="cursor-pointer">
                                            <Upload className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                                            <p className="text-xs text-gray-600">
                                                {isUploading ? 'Đang tải ảnh...' : 'Click để chọn ảnh'}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">JPG, PNG, GIF, WEBP</p>
                                        </label>
                                        <input
                                            id="image-upload"
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => handleImageUpload(e.target.files)}
                                            disabled={isUploading}
                                        />
                                    </div>

                                    {/* Hiển thị ảnh đã chọn */}
                                    {selectedImages.length > 0 && (
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-700 mb-2">
                                                Ảnh đã chọn ({selectedImages.length})
                                            </p>
                                            <div className="flex gap-2 flex-wrap">
                                                {selectedImages.map((src, index) => (
                                                    <div key={index} className="relative group">
                                                        <div className="w-20 h-20 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center">
                                                            <img
                                                                src={src}
                                                                alt={`Preview ${index + 1}`}
                                                                className="max-w-full max-h-full object-contain cursor-pointer hover:opacity-75 transition-opacity"
                                                                onClick={() => setPreviewImage(src)}
                                                            />
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeImage(index)}
                                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                                        >
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
                            <button
                                onClick={handleCloseModal}
                                disabled={isLoading}
                                className="px-4 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleUpdateProduct}
                                disabled={isLoading || !selectedVariant.quantity || !selectedVariant.price}
                                className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Đang lưu...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        Lưu thay đổi
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal preview ảnh */}
            {previewImage && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                    <div className="relative max-w-4xl max-h-full">
                        <img
                            src={previewImage}
                            alt="Preview"
                            className="max-w-full max-h-full object-contain rounded-lg"
                            style={{ backgroundColor: '#fff' }}
                        />
                        <button
                            type="button"
                            onClick={() => setPreviewImage(null)}
                            className="absolute top-4 right-4 bg-black bg-opacity-20 hover:bg-opacity-30 text-white rounded-full p-2 transition-all"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            )}

            <ToastContainer />
        </div>
    );
}

export default SpctDetail;
