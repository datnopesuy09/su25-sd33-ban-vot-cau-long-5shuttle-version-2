import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom'; // ✅ thêm useParams
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { TbEyeEdit } from 'react-icons/tb';

function SpctDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [productDetail, setProductDetail] = useState(null);
    const [selectedVariant, setSelectedVariant] = useState(null); // lưu sản phẩm được chọn
    const [isModalOpen, setIsModalOpen] = useState(false); // mở/tắt modal
    const [variants, setVariants] = useState([]);

    const handleOpenModal = (variant) => {
        setSelectedVariant(variant);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedVariant(null);
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
                    weight: v.trongLuongTen,
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
        <div>
            <div className="font-bold text-sm">
                <span className="cursor-pointer" onClick={handleNavigateToProduct}>
                    Sản phẩm
                </span>
                <span className="text-gray-400 ml-2">/ {productDetail?.tenSanPham}</span>
            </div>

            <div className="bg-white p-4 rounded-md shadow-lg">
                <div className="flex">
                    {/* search */}
                    <input
                        type="text"
                        placeholder="Nhập mã sản phẩm để tìm"
                        className="border border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 rounded-md px-4 py-2 text-gray-700 w-1/2"
                    />
                </div>
                {/* fillter */}
                <div className="flex space-x-4 pt-4 pb-4">
                    <div className="flex items-center space-x-2">
                        <label className="text-gray-700 font-semibold">Thương hiệu:</label>
                        <div className="relative">
                            <select
                                className="
                                    appearance-none
                                    bg-transparent
                                    text-amber-400
                                    py-2
                                    px-3
                                    pr-8
                                    focus:border-blue-500
                                    focus:outline-none
                                    cursor-pointer
                                    "
                            >
                                <option value="" className="bg-white text-gray-700">
                                    Thương hiệu
                                </option>
                            </select>

                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                                <svg
                                    className="fill-current h-4 w-4"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 20 20"
                                >
                                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <label className="text-gray-700 font-semibold">Điểm cân bằng:</label>
                        <div className="relative">
                            <select
                                className="
                                    appearance-none
                                    bg-transparent
                                    text-amber-400
                                    py-2
                                    px-3
                                    pr-8
                                    focus:border-blue-500
                                    focus:outline-none
                                    cursor-pointer
                                    "
                            >
                                <option value="" className="bg-white text-gray-700">
                                    Điểm cân bằng
                                </option>
                            </select>

                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                                <svg
                                    className="fill-current h-4 w-4"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 20 20"
                                >
                                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <label className="text-gray-700 font-semibold">Chất liệu:</label>
                        <div className="relative">
                            <select
                                className="
                                    appearance-none
                                    bg-transparent
                                    text-amber-400
                                    py-2
                                    px-3
                                    pr-8
                                    focus:border-blue-500
                                    focus:outline-none
                                    cursor-pointer
                                    "
                            >
                                <option value="" className="bg-white text-gray-700">
                                    Chất liệu
                                </option>
                            </select>

                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                                <svg
                                    className="fill-current h-4 w-4"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 20 20"
                                >
                                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <label className="text-gray-700 font-semibold">Độ cứng:</label>
                        <div className="relative">
                            <select
                                className="
                                    appearance-none
                                    bg-transparent
                                    text-amber-400
                                    py-2
                                    px-3
                                    pr-8
                                    focus:border-blue-500
                                    focus:outline-none
                                    cursor-pointer
                                    "
                            >
                                <option value="" className="bg-white text-gray-700">
                                    Độ cứng
                                </option>
                            </select>

                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                                <svg
                                    className="fill-current h-4 w-4"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 20 20"
                                >
                                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <label className="text-gray-700 font-semibold">Trạng thái:</label>
                        <div className="relative">
                            <select
                                className="
                                    appearance-none
                                    bg-transparent
                                    text-amber-400
                                    py-2
                                    px-3
                                    pr-8
                                    focus:border-blue-500
                                    focus:outline-none
                                    cursor-pointer
                                    "
                            >
                                <option value="" className="bg-white text-gray-700">
                                    Trạng thái
                                </option>
                            </select>

                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                                <svg
                                    className="fill-current h-4 w-4"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 20 20"
                                >
                                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* bảng sản phẩm */}
            <div className="bg-white p-4 rounded-md shadow-lg mt-4">
                <h3 className="font-semibold text-center text-lg mb-3">Danh sách sản phẩm</h3>
                <table className="min-w-full table-auto border border-gray-300 rounded-md overflow-hidden shadow-sm">
                    <thead className="bg-gray-100 text-sm text-gray-700 uppercase">
                        <tr>
                            <th className="py-3 px-4 text-left">STT</th>
                            <th className="py-3 px-4 text-left">Ảnh</th>
                            <th className="py-3 px-4 text-left">Mã</th>
                            <th className="py-3 px-4 text-left">Thương hiệu</th>
                            <th className="py-3 px-4 text-left">Chất liệu</th>
                            <th className="py-3 px-4 text-left">Điểm cân bằng</th>
                            <th className="py-3 px-4 text-left">Độ cứng</th>
                            <th className="py-3 px-4 text-left">Màu sắc</th>
                            <th className="py-3 px-4 text-left">Trọng lượng</th>
                            <th className="py-3 px-4 text-center">Số lượng</th>
                            <th className="py-3 px-4 text-center">Đơn giá</th>
                            <th className="py-3 px-4 text-center">Trạng thái</th>
                            <th className="py-3 px-4 text-center">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {variants.length > 0 ? (
                            variants.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50 border-t border-gray-200 text-sm">
                                    <td className="py-2 px-4">{item.stt}</td>
                                    <td className="py-2 px-4">
                                        {item.image ? (
                                            <img
                                                src={item.image}
                                                alt={item.code}
                                                className="h-12 w-12 object-cover rounded-md border"
                                            />
                                        ) : (
                                            <span className="text-gray-400">Không có ảnh</span>
                                        )}
                                    </td>
                                    <td className="py-2 px-4">{item.code}</td>
                                    <td className="py-2 px-4">{item.brand}</td>
                                    <td className="py-2 px-4">{item.material}</td>
                                    <td className="py-2 px-4">{item.balancePoint}</td>
                                    <td className="py-2 px-4">{item.hardness}</td>
                                    <td className="py-2 px-4">{item.color}</td>
                                    <td className="py-2 px-4">{item.weight}</td>
                                    <td className="py-2 px-4 text-center">{item.quantity}</td>
                                    <td className="py-2 px-4 text-center">{item.price.toLocaleString()} VND</td>
                                    <td className="py-2 px-4 text-center">
                                        <span
                                            className={`inline-block px-3 py-1 rounded-full text-xs font-medium 
                                    ${
                                        item.status === 'Active'
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-red-100 text-red-700'
                                    }`}
                                        >
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="py-2 px-4 text-center">
                                        <button
                                            onClick={() => handleOpenModal(item)}
                                            className="text-amber-500 hover:text-amber-600 transition-transform transform hover:scale-110 text-xl"
                                            title="Chỉnh sửa"
                                        >
                                            <TbEyeEdit />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="13" className="text-center py-4 text-gray-500 text-sm">
                                    Không có dữ liệu
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            {isModalOpen && selectedVariant && (
                <div className="fixed inset-0 bg-black/10 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-1/2">
                        <h2 className="text-lg text-center font-semibold mb-4">Chỉnh sửa sản phẩm</h2>

                        {/* Form chỉnh sửa */}
                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium">Mã sản phẩm</label>
                                <input
                                    type="text"
                                    value={selectedVariant.code}
                                    className="border rounded-md px-3 py-2 w-full"
                                    onChange={(e) => setSelectedVariant({ ...selectedVariant, code: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium">Số lượng</label>
                                <input
                                    type="number"
                                    value={selectedVariant.quantity}
                                    className="border rounded-md px-3 py-2 w-full"
                                    onChange={(e) =>
                                        setSelectedVariant({ ...selectedVariant, quantity: e.target.value })
                                    }
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium">Đơn giá</label>
                                <input
                                    type="number"
                                    value={selectedVariant.price}
                                    className="border rounded-md px-3 py-2 w-full"
                                    onChange={(e) => setSelectedVariant({ ...selectedVariant, price: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Nút hành động */}
                        <div className="flex justify-end space-x-3 mt-4">
                            <button
                                onClick={handleCloseModal}
                                className="px-4 py-2 rounded-md bg-gray-300 hover:bg-gray-400"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={() => {
                                    // TODO: gọi API cập nhật
                                    console.log('Cập nhật:', selectedVariant);
                                    handleCloseModal();
                                }}
                                className="px-4 py-2 rounded-md bg-amber-500 text-white hover:bg-amber-600"
                            >
                                Lưu
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
