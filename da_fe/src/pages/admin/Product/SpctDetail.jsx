import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom'; // ✅ thêm useParams
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { TbEyeEdit } from 'react-icons/tb';
import { Search, Filter, Package, ChevronDown, Edit3, X, Save } from 'lucide-react';

function SpctDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [productDetail, setProductDetail] = useState(null);
    const [selectedVariant, setSelectedVariant] = useState(null); // lưu sản phẩm được chọn
    const [isModalOpen, setIsModalOpen] = useState(false); // mở/tắt modal
    const [variants, setVariants] = useState([]);
    const [isLoading, setIsLoading] = useState(false); // loading state cho update

    const handleOpenModal = (variant) => {
        setSelectedVariant(variant);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedVariant(null);
    };

    const handleUpdateProduct = async () => {
        if (!selectedVariant) return;

        setIsLoading(true);
        try {
            // Thử endpoint mới trước
            let response;
            let updateData = {
                soLuong: selectedVariant.quantity,
                donGia: selectedVariant.price,
            };

            try {
                // Thử API endpoint chuyên dụng trước
                response = await axios.put(
                    `http://localhost:8080/api/san-pham-ct/update-basic/${selectedVariant.id}`,
                    updateData,
                );
            } catch (error) {
                if (error.response?.status === 404) {
                    console.log('Endpoint update-basic không tồn tại, thử endpoint chính...');

                    // Fallback về endpoint chính với structure đơn giản hơn
                    updateData = {
                        soLuong: selectedVariant.quantity,
                        donGia: selectedVariant.price,
                        trangThai: 1,
                    };

                    response = await axios.put(
                        `http://localhost:8080/api/san-pham-ct/${selectedVariant.id}`,
                        updateData,
                    );
                } else {
                    throw error; // Re-throw nếu không phải lỗi 404
                }
            }

            if (response.status === 200) {
                // Cập nhật lại danh sách variants trong state
                setVariants((prevVariants) =>
                    prevVariants.map((variant) =>
                        variant.id === selectedVariant.id
                            ? { ...variant, quantity: selectedVariant.quantity, price: selectedVariant.price }
                            : variant,
                    ),
                );

                toast.success('Cập nhật sản phẩm thành công!');
                handleCloseModal();
            }
        } catch (error) {
            console.error('Lỗi khi cập nhật sản phẩm:', error);

            // Hiển thị thông báo lỗi chi tiết hơn
            let errorMessage = 'Không thể cập nhật sản phẩm. Vui lòng thử lại!';

            if (error.response?.data) {
                if (typeof error.response.data === 'string') {
                    errorMessage = error.response.data;
                } else if (error.response.data.message) {
                    errorMessage = error.response.data.message;
                }
            }

            toast.error(errorMessage);
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

                // Map variants như bạn đang làm
                const loadedVariants = data.variants.map((v, index) => ({
                    stt: index + 1,
                    id: v.id,
                    code: `${data.tenSanPham}-${v.trongLuongTen}-${v.mauSacTen}`, // mã tạm
                    brand: data.thuongHieu,
                    material: data.chatLieu,
                    balancePoint: data.diemCanBang,
                    hardness: data.doCung,
                    color: v.mauSacTen,
                    colorId: v.mauSacId, // Thêm ID cho màu sắc
                    weight: v.trongLuongTen,
                    weightId: v.trongLuongId, // Thêm ID cho trọng lượng
                    quantity: v.soLuong,
                    price: v.donGia,
                    status: data.trangThai === 1 ? 'Active' : 'Inactive',
                    image: v.hinhAnhUrls?.length > 0 ? v.hinhAnhUrls[0] : null,
                }));

                setVariants(loadedVariants);
            } catch (err) {
                console.error('Lỗi khi lấy dữ liệu sản phẩm:', err);
                toast.error('Không thể tải dữ liệu sản phẩm.');
            }
        };

        fetchProductDetail();
    }, [id]);

    const handleNavigateToProduct = () => {
        navigate('/admin/quan-ly-san-pham/san-pham');
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
                                <th className="w-24 px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                                    Đơn giá
                                </th>
                                <th className="w-20 px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                                    Trạng thái
                                </th>
                                <th className="w-16 px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase">
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
                                                title={item.code}
                                            >
                                                {item.code}
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
                                                {item.status === 'Active' ? 'ON' : 'OFF'}
                                            </span>
                                        </td>
                                        <td className="px-2 py-3 text-center">
                                            <button
                                                onClick={() => handleOpenModal(item)}
                                                className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors duration-150"
                                                title="Chỉnh sửa"
                                            >
                                                <Edit3 className="w-3 h-3" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="13" className="px-6 py-12 text-center">
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
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-hidden">
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
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Mã sản phẩm</label>
                                <input
                                    type="text"
                                    value={selectedVariant.code}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed"
                                    disabled
                                    title="Mã sản phẩm không thể chỉnh sửa"
                                />
                                <p className="text-xs text-gray-500 mt-1">Mã sản phẩm không thể thay đổi</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Số lượng <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    value={selectedVariant.quantity}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    onChange={(e) =>
                                        setSelectedVariant({
                                            ...selectedVariant,
                                            quantity: parseInt(e.target.value) || 0,
                                        })
                                    }
                                    placeholder="Nhập số lượng"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Đơn giá (VND) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    value={selectedVariant.price}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    onChange={(e) =>
                                        setSelectedVariant({
                                            ...selectedVariant,
                                            price: parseInt(e.target.value) || 0,
                                        })
                                    }
                                    placeholder="Nhập đơn giá"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Giá hiển thị: {selectedVariant.price?.toLocaleString('vi-VN')}đ
                                </p>
                            </div>

                            {/* Thông tin sản phẩm chỉ đọc */}
                            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                                <h4 className="text-sm font-medium text-gray-700">Thông tin sản phẩm</h4>
                                <div className="grid grid-cols-2 gap-3 text-xs">
                                    <div>
                                        <span className="text-gray-500">Màu sắc:</span>
                                        <span className="ml-2 text-gray-700">{selectedVariant.color}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Trọng lượng:</span>
                                        <span className="ml-2 text-gray-700">{selectedVariant.weight}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Thương hiệu:</span>
                                        <span className="ml-2 text-gray-700">{selectedVariant.brand}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Chất liệu:</span>
                                        <span className="ml-2 text-gray-700">{selectedVariant.material}</span>
                                    </div>
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

            <ToastContainer />
        </div>
    );
}

export default SpctDetail;
