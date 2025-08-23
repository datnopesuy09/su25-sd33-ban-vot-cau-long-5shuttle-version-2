import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AddIcon from '@mui/icons-material/Add';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import { Link } from 'react-router-dom';
import { TbEyeEdit } from 'react-icons/tb';
import { toast } from 'react-toastify';
import swal from 'sweetalert';
import Swal from 'sweetalert2';

function Product() {
    const navigate = useNavigate();
    const [dataTable, setDataTable] = useState([]);
    const [pendingRequests, setPendingRequests] = useState({}); // Lưu trữ { idSanPhamCT: totalRequestedQuantity }
    const [filterStatus, setFilterStatus] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const itemsPerPage = 5;

    // Lọc sản phẩm theo trạng thái
    const filteredProducts = dataTable.filter((product) => {
        if (filterStatus === '') return true;
        return filterStatus === '1' ? product.trangThai === 1 : product.trangThai === 0;
    });

    // Tính toán phân trang dựa trên dữ liệu đã lọc
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const startIndex = currentPage * itemsPerPage;
    const currentData = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

    // Reset về trang đầu khi lọc thay đổi
    useEffect(() => {
        setCurrentPage(0);
    }, [filterStatus]);

    // Lấy danh sách sản phẩm
    const getAllSanPham = () => {
        axios
            .get(`http://localhost:8080/api/san-pham/hien-thi`)
            .then((response) => {
                setDataTable(response.data);
            })
            .catch((error) => {
                console.error('Có lỗi xảy ra khi lấy sản phẩm:', error);
                toast.error('Không thể tải danh sách sản phẩm!');
            });
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

    useEffect(() => {
        getAllSanPham();
        getPendingRequests();
    }, []);

    // Xử lý cập nhật số lượng kho
    const handleUpdateStock = async (id) => {
        const product = dataTable.find((p) => p.id === id);
        const requestedQuantity = pendingRequests[id] || 0;

        // Mở modal để nhập số lượng mới
        const { value: newStock } = await Swal.fire({
    title: `Nhập số lượng kho mới cho ${product?.ten}`,
    html: `
        <p>Yêu cầu nhập hàng: ${requestedQuantity}</p>
        <input id="swal-input1" class="swal2-input" type="number" placeholder="Số lượng mới" min="0">
    `,
    focusConfirm: false,
    preConfirm: () => {
        const input = document.getElementById('swal-input1').value;
        const newStockValue = parseInt(input);
        if (isNaN(newStockValue) || newStockValue < 0) {
            Swal.showValidationMessage('Vui lòng nhập số lượng hợp lệ!');
            return false;
        }
        return newStockValue;
    },
    showCancelButton: true,
    confirmButtonText: 'Cập nhật',
    cancelButtonText: 'Hủy',
});

        if (newStock !== undefined) {
            try {
                const response = await axios.patch(`http://localhost:8080/api/pre-order/san-pham-ct/${id}/stock`, {
                    soLuong: newStock,
                });
                if (response.status === 200) {
                    toast.success('Cập nhật số lượng kho thành công!');
                    // Cập nhật lại danh sách sản phẩm
                    getAllSanPham();
                    // Cập nhật lại yêu cầu nhập hàng (vì một số PreOrder có thể đã được xử lý)
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

    const handleUpdate = (id) => {
        navigate(`/admin/quan-ly-san-pham/san-pham-ct/${id}/update`);
    };

    return (
        <div>
            <div className="font-bold text-sm">Sản phẩm</div>
            <div className="bg-white p-4 rounded-md shadow-md">
                <div className="flex mb-4 justify-between items-center">
                    <input
                        type="text"
                        placeholder="Nhập tên sản phẩm để tìm..."
                        className="border border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 rounded-md px-4 py-2 text-gray-700 w-1/2"
                    />
                    <Link to={'/admin/quan-ly-san-pham/san-pham-ct/add'}>
                        <button className="border border-blue-500 text-blue-500 font-medium py-2 px-4 rounded flex items-center">
                            <AddIcon /> Thêm mới
                        </button>
                    </Link>
                </div>
                <div className="flex items-center mr-4 mb-6">
                    <label className="mr-2 font-semibold">Trạng thái:</label>
                    <label className="mr-2">
                        <input
                            type="radio"
                            name="status"
                            value=""
                            className="mr-1"
                            checked={filterStatus === ''}
                            onChange={() => setFilterStatus('')}
                        />
                        Tất cả
                    </label>
                    <label className="mr-2">
                        <input
                            type="radio"
                            name="status"
                            value="1"
                            className="mr-1"
                            checked={filterStatus === '1'}
                            onChange={() => setFilterStatus('1')}
                        />
                        Active
                    </label>
                    <label className="mr-2">
                        <input
                            type="radio"
                            name="status"
                            value="0"
                            className="mr-1"
                            checked={filterStatus === '0'}
                            onChange={() => setFilterStatus('0')}
                        />
                        Inactive
                    </label>
                    <button className="ml-6 border border-blue-500 text-blue-500 font-medium py-2 px-4 rounded">
                        Xuất Excel
                    </button>
                </div>

                <table className="min-w-full table-auto border border-gray-300 rounded-md overflow-hidden shadow-sm">
                    <thead className="bg-gray-100 text-sm text-gray-700 uppercase">
                        <tr>
                            <th className="py-3 px-4 text-left">STT</th>
                            <th className="py-3 px-4 text-left">Tên</th>
                            <th className="py-3 px-4 text-center">Số lượng</th>
                            <th className="py-3 px-4 text-center">Yêu cầu nhập hàng</th>
                            <th className="py-3 px-4 text-center">Trạng thái</th>
                            <th className="py-3 px-4 text-center">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentData && currentData.length > 0 ? (
                            currentData.map((sp, index) => (
                                <tr key={sp.id} className="hover:bg-gray-50 border-t border-gray-200 text-sm">
                                    <td className="py-2 px-4">{startIndex + index + 1}</td>
                                    <td className="py-2 px-4">{sp.ten}</td>
                                    <td className="py-2 px-4 text-center">{sp.soLuong}</td>
                                    <td className="py-2 px-4 text-center">
                                        {pendingRequests[sp.id] || 0}
                                    </td>
                                    <td className="py-2 px-4 text-center">
                                        <span
                                            className={`inline-block px-3 py-1 rounded-full text-xs font-medium 
                        ${sp.trangThai === 1 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                                        >
                                            {sp.trangThai === 1 ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="py-2 px-4 text-center">
                                        <button
                                            onClick={() => handleUpdate(sp.id)}
                                            className="text-amber-500 hover:text-amber-600 transition-transform transform hover:scale-110 text-xl mr-2"
                                            title="Xem chi tiết"
                                        >
                                            <TbEyeEdit />
                                        </button>
                                        <button
                                            onClick={() => handleUpdateStock(sp.id)}
                                            className="text-blue-500 hover:text-blue-600 transition-transform transform hover:scale-110 text-xl"
                                            title="Cập nhật kho"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M3 3h18v18H3V3zm9 12v-3m0 0v-3m0 3h3m-3 0H9"
                                                />
                                            </svg>
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="text-center py-4 text-gray-500">
                                    Không có sản phẩm nào.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
                <div className="flex justify-center items-center gap-2 mt-4">
                    <button
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
                        disabled={currentPage === 0}
                        className={`w-8 h-8 rounded-full border text-gray-600 hover:bg-gray-100 disabled:opacity-40`}
                    >
                        &lt;
                    </button>
                    {Array.from({ length: totalPages }, (_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentPage(index)}
                            className={`w-8 h-8 rounded-full border text-sm font-medium 
                            ${
                                index === currentPage
                                    ? 'text-orange-600 border-orange-400 bg-orange-100'
                                    : 'text-gray-700 hover:bg-gray-100'
                            }`}
                        >
                            {index + 1}
                        </button>
                    ))}
                    <button
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1))}
                        disabled={currentPage === totalPages - 1}
                        className={`w-8 h-8 rounded-full border text-gray-600 hover:bg-gray-100 disabled:opacity-40`}
                    >
                        &gt;
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Product;