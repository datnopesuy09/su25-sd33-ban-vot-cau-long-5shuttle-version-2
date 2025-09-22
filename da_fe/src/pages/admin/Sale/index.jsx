import React, { useEffect, useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import CloseIcon from '@mui/icons-material/Close';
import swal from 'sweetalert';
import axios from 'axios';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import ProductModal from './ProductModal';
import ProductList from '../Order/ProductList';
import PaymentSummary from './PaymentSummary';

function OfflineSale() {
    const [bills, setBills] = useState([]);
    const [selectedBill, setSelectedBill] = useState(null);
    const [showProductModal, setShowProductModal] = useState(false);
    const [billDetails, setBillDetails] = useState([]);
    const [subtotal, setSubtotal] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [preOrders, setPreOrders] = useState([]);
    const [showImportModal, setShowImportModal] = useState(false);
    const [importQuantity, setImportQuantity] = useState(1);
    const [selectedProductId, setSelectedProductId] = useState(null);
    const [stompClient, setStompClient] = useState(null);

    useEffect(() => {
        fetchBills();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/san-pham-ct/all-with-image');
            return response.data;
        } catch (error) {
            console.error('Error fetching products:', error);
            return [];
        }
    };

    const fetchBills = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/hoa-don');
            setBills(response.data);
        } catch (error) {
            console.error('Lỗi khi lấy danh sách hóa đơn:', error);
            swal('Lỗi!', 'Không thể lấy danh sách hóa đơn', 'error');
        }
    };

    const fetchBillDetails = async (idHoaDon) => {
        try {
            const response = await axios.get(`http://localhost:8080/api/hoa-don-ct/hoa-don/${idHoaDon}`);
            setBillDetails(response.data);
        } catch (error) {
            console.error('Lỗi khi lấy chi tiết hóa đơn:', error);
            swal('Lỗi!', 'Không thể lấy chi tiết hóa đơn', 'error');
        }
    };

    const fetchPreOrders = async (idHoaDon) => {
        try {
            const response = await axios.get(`http://localhost:8080/api/pre-order/hoa-don/${idHoaDon}`);
            setPreOrders(response.data);
        } catch (error) {
            console.error('Lỗi khi lấy danh sách đặt trước:', error);
            swal('Lỗi!', 'Không thể lấy danh sách đặt trước', 'error');
        }
    };

    const handleAddBill = async (values) => {
        const filteredBills = bills.filter((bill) => bill.loaiHoaDon === 'Tại quầy' && bill.trangThai === 1);

        if (filteredBills.length >= 6) {
            swal('Thất bại!', 'Chỉ được tạo tối đa 6 hóa đơn "Tại quầy" với trạng thái 1!', 'warning');
            return;
        }

        const newBill = {
            ma: 'HD' + Date.now(),
            ten: values.billName,
            taiKhoan: { id: 1 },
            loaiHoaDon: 'Tại quầy',
            ngayTao: new Date().toISOString(),
            trangThai: values.status === '1' ? 1 : 0,
        };

        try {
            const response = await axios.post('http://localhost:8080/api/hoa-don', newBill);
            setBills((prev) => [...prev, response.data]);
            swal('Thành công!', 'Hóa đơn đã được thêm!', 'success');
        } catch (error) {
            console.error('Lỗi khi thêm hóa đơn:', error);
            swal('Thất bại!', 'Không thể thêm hóa đơn!', 'error');
        }
    };

    const handleBillClick = (bill) => {
        setSelectedBill(bill);
        fetchBillDetails(bill.id);
        fetchPreOrders(bill.id);
    };

    const handleConfirmAddProduct = async (selectedProduct, quantity) => {
        if (!selectedProduct || !selectedBill) {
            swal('Lỗi', 'Vui lòng chọn sản phẩm và hóa đơn', 'error');
            return;
        }

        if (quantity <= 0) {
            swal('Lỗi', 'Số lượng phải lớn hơn 0', 'error');
            return;
        }

        try {
            const response = await axios.post('http://localhost:8080/api/hoa-don-ct/add-to-bill', {
                idHoaDon: selectedBill.id,
                idSanPhamCT: selectedProduct.id,
                soLuong: quantity,
            });

            if (response.status === 200) {
                if (response.data.trangThai === 9) {
                    swal({
                        title: 'Sản phẩm tạm hết hàng',
                        text: 'Sản phẩm này hiện không đủ hàng. Yêu cầu đặt trước đã được ghi nhận.',
                        icon: 'warning',
                        button: 'OK',
                    });
                    fetchPreOrders(selectedBill.id);
                } else {
                    swal('Thành công!', 'Thêm sản phẩm vào hóa đơn thành công', 'success');
                }
                setShowProductModal(false);
                fetchBillDetails(selectedBill.id);
            }
        } catch (error) {
            console.error('Lỗi khi thêm sản phẩm:', error);
            if (error.response?.data === 'Sản phẩm tạm hết hàng. Đã tạo yêu cầu đặt trước.') {
                swal({
                    title: 'Sản phẩm tạm hết hàng',
                    text: 'Yêu cầu đặt trước đã được ghi nhận. Vui lòng nhập thêm hàng.',
                    icon: 'warning',
                    button: 'OK',
                });
                fetchPreOrders(selectedBill.id);
            } else {
                swal('Lỗi', error.response?.data || 'Không thể thêm sản phẩm', 'error');
            }
        }
    };

    const handleOpenImportModal = (productId) => {
        setSelectedProductId(productId);
        setImportQuantity(1);
        setShowImportModal(true);
    };

    const handleCloseImportModal = () => {
        setShowImportModal(false);
        setSelectedProductId(null);
        setImportQuantity(1);
    };

    const handleConfirmImport = async () => {
        if (importQuantity <= 0) {
            swal('Lỗi', 'Số lượng nhập hàng phải lớn hơn 0', 'error');
            return;
        }
        try {
            await axios.post('http://localhost:8080/api/hoa-don/import-stock', {
                sanPhamCTId: selectedProductId,
                quantity: importQuantity,
            });
            swal('Thành công', 'Nhập hàng thành công!', 'success');
            fetchBillDetails(selectedBill.id);
            fetchPreOrders(selectedBill.id);
            handleCloseImportModal();
        } catch (error) {
            console.error('Lỗi khi nhập hàng:', error);
            swal('Lỗi', error.response?.data || 'Không thể nhập hàng', 'error');
        }
    };

    useEffect(() => {
        if (selectedBill) {
            // Kết nối WebSocket
            const socket = new SockJS('http://localhost:8080/ws');
            const client = Stomp.over(socket);
            client.connect({}, () => {
                client.subscribe(`/user/${selectedBill.taiKhoan?.id || 1}/queue/notifications`, (message) => {
                    const notification = JSON.parse(message.body);
                    swal('Thông báo', notification.noiDung, 'info');
                    fetchPreOrders(selectedBill.id);
                    fetchBillDetails(selectedBill.id);
                });
            });
            setStompClient(client);

            return () => {
                if (client) client.disconnect();
            };
        }
    }, [selectedBill]);

    // Hàm resolvePrices tương tự như trong PaymentDetails.jsx
    const resolvePrices = (item) => {
        // Ưu tiên sử dụng giá bán đã lưu trong hóa đơn chi tiết (giá tại thời điểm mua)
        const qty = Number(item.soLuong) || 1;

        // Giá đã lưu trong hóa đơn (giá tại thời điểm mua hàng)
        if (item.giaBan !== undefined && item.giaBan !== null) {
            const savedTotalPrice = Number(item.giaBan);
            const unitPrice = savedTotalPrice / qty;

            // Lấy giá gốc từ sản phẩm để tính phần trăm giảm giá
            const originalPrice = item.sanPhamCT?.donGia ?? item.sanPhamCT?.sanPham?.donGia ?? unitPrice;

            return {
                originalPrice: Number(originalPrice),
                discountedPrice: unitPrice,
                unitPrice: unitPrice,
            };
        }

        // Fallback: nếu không có giá lưu, sử dụng giá gốc từ sản phẩm
        const originalPrice = item.sanPhamCT?.donGia ?? item.sanPhamCT?.sanPham?.donGia ?? 0;

        // Kiểm tra giá khuyến mãi
        const discountedPrice =
            item.sanPhamCT?.giaKhuyenMai && item.sanPhamCT.giaKhuyenMai < originalPrice
                ? item.sanPhamCT.giaKhuyenMai
                : originalPrice;

        return {
            originalPrice: Number(originalPrice),
            discountedPrice: Number(discountedPrice),
            unitPrice: Number(discountedPrice),
        };
    };

    useEffect(() => {
        const newSubtotal = billDetails.reduce((total, orderDetail) => {
            const { unitPrice } = resolvePrices(orderDetail);
            return total + unitPrice * (orderDetail.soLuong || 0);
        }, 0);
        setSubtotal(newSubtotal);
    }, [billDetails]);

    const updateQuantity = async (orderDetailId, newQuantity) => {
        try {
            const response = await fetch(`http://localhost:8080/api/hoa-don-ct/update-quantity/${orderDetailId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ soLuong: newQuantity }),
            });

            if (!response.ok) {
                throw new Error('Không thể cập nhật số lượng');
            }

            const updatedOrderDetails = billDetails.map((item) => {
                if (item.id === orderDetailId) {
                    return {
                        ...item,
                        soLuong: newQuantity,
                        giaBan: item.sanPhamCT.donGia * newQuantity,
                    };
                }
                return item;
            });

            setBillDetails(updatedOrderDetails);
        } catch (error) {
            console.error('Error updating quantity:', error);
            swal('Lỗi!', 'Không thể cập nhật số lượng', 'error');
        }
    };

    const handleQuantityChange = async (delta, orderDetailId) => {
        const currentItem = billDetails.find((item) => item.id === orderDetailId);
        const newQuantity = Math.max(1, currentItem.soLuong + delta);
        await updateQuantity(orderDetailId, newQuantity);
        setQuantity(newQuantity);

        // Thêm dòng này để cập nhật lại chi tiết hóa đơn và sản phẩm
        await fetchBillDetails(selectedBill.id);
        // Nếu cần cập nhật lại danh sách sản phẩm trong ProductModal, có thể truyền callback xuống và gọi lại fetchProducts
    };

    const handleProductModal = () => {
        if (!selectedBill) {
            swal('Lỗi', 'Vui lòng chọn hoặc tạo một hóa đơn trước!', 'error');
            return;
        }
        setShowProductModal(true);
    };

    const handleCloseProductModal = () => {
        setShowProductModal(false);
    };

    const updateBills = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/hoa-don');
            setBills(response.data);
        } catch (error) {
            console.error('Lỗi khi lấy danh sách hóa đơn:', error);
            swal('Lỗi!', 'Không thể lấy danh sách hóa đơn', 'error');
        }
    };

    const handleDeleteProduct = async (orderDetailId) => {
        const currentItem = billDetails.find((item) => item.id === orderDetailId);

        if (!currentItem) {
            swal('Lỗi', 'Không tìm thấy sản phẩm!', 'error');
            return;
        }

        const isConfirmed = await swal({
            title: 'Xác nhận xóa sản phẩm',
            text: `Bạn có chắc chắn muốn xóa sản phẩm "${currentItem.sanPhamCT.ten}" khỏi hóa đơn?`,
            icon: 'warning',
            buttons: ['Hủy', 'Xóa'],
            dangerMode: true,
        });

        if (isConfirmed) {
            try {
                const response = await axios.delete(`http://localhost:8080/api/hoa-don-ct/${orderDetailId}`);

                if (response.status === 200) {
                    // Refresh bill details
                    await fetchBillDetails(selectedBill.id);
                    // Optionally refresh bills list
                    await updateBills();
                    swal('Thành công!', 'Xóa sản phẩm thành công!', 'success');
                } else {
                    throw new Error('Không thể xóa sản phẩm');
                }
            } catch (error) {
                console.error('Lỗi khi xóa sản phẩm:', error);
                swal('Lỗi!', error.response?.data || 'Không thể xóa sản phẩm!', 'error');
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="flex flex-col gap-4 h-[calc(100vh-2rem)]">
                <div className="flex-1 bg-white rounded-lg shadow-sm p-6 overflow-hidden flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="font-bold text-2xl text-gray-800">Bán hàng</h1>
                        <button
                            className="bg-[#2f19ae] hover:bg-[#241587] text-white py-2 px-4 rounded-md flex items-center transition-colors"
                            onClick={() => handleAddBill({ billName: 'Hóa đơn mới', status: '1' })}
                        >
                            <AddIcon style={{ fontSize: 19 }} className="mr-2" />
                            Thêm hóa đơn
                        </button>
                    </div>

                    {bills.length > 0 ? (
                        <div className="flex items-center border-b-2 border-gray-200 mb-6 overflow-x-auto">
                            {bills
                                .filter((bill) => bill.loaiHoaDon === 'Tại quầy' && bill.trangThai !== 6)
                                .map((bill) => (
                                    <div
                                        key={bill.id}
                                        className={`flex items-center mr-6 cursor-pointer whitespace-nowrap py-2 px-1 ${
                                            selectedBill?.id === bill.id
                                                ? 'border-b-2 border-blue-800 text-blue-600'
                                                : 'text-gray-700 hover:text-blue-500'
                                        }`}
                                        onClick={() => handleBillClick(bill)}
                                    >
                                        <ShoppingCartIcon style={{ fontSize: 18 }} className="mr-2" />
                                        <span className="text-sm font-medium">
                                            Hóa đơn {bill.id} - {bill.ten}
                                        </span>
                                        <span
                                            className="text-red-500 ml-2 cursor-pointer hover:text-red-700"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                            }}
                                        >
                                            <CloseIcon style={{ fontSize: 16 }} />
                                        </span>
                                    </div>
                                ))}
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center">
                            <span className="text-gray-400 text-4xl font-light">Chưa có hóa đơn nào</span>
                            <p className="text-gray-500 mt-2">Nhấn "Thêm hóa đơn" để bắt đầu</p>
                        </div>
                    )}

                    {selectedBill && (
                        <div className="flex-1 flex flex-col overflow-hidden">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-blue-700">Sản phẩm</h2>
                                <div className="flex space-x-3">
                                    {/* <button className="border border-blue-600 text-blue-600 px-4 py-2 rounded-md text-sm hover:bg-blue-50 transition-colors">
                                        QUÉT QR SẢN PHẨM
                                    </button> */}
                                    <button
                                        className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 transition-colors"
                                        onClick={handleProductModal}
                                    >
                                        THÊM SẢN PHẨM
                                    </button>
                                </div>
                            </div>

                            <hr className="border-gray-300 mb-4" />

                            <div className="flex-1 overflow-y-auto">
                                <ProductList
                                    orderDetailDatas={billDetails}
                                    handleQuantityChange={handleQuantityChange}
                                    handleDeleteProduct={handleDeleteProduct}
                                    showAddButton={false}
                                    isLiked={false}
                                    setIsLiked={() => {}}
                                />
                            </div>

                            {/* {preOrders.length > 0 && (
                                <div className="p-6">
                                    <h2 className="text-xl font-bold text-gray-800 mb-4">Danh sách đặt trước</h2>
                                    <div className="space-y-4">
                                        {preOrders.map((preOrder) => (
                                            <div
                                                key={preOrder.id}
                                                className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200"
                                            >
                                                <p className="text-sm text-gray-600">
                                                    <span className="font-medium">Sản phẩm:</span>{' '}
                                                    {preOrder.sanPhamCT?.sanPham?.ten}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    <span className="font-medium">Số lượng đặt trước:</span>{' '}
                                                    {preOrder.soLuong}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    <span className="font-medium">Trạng thái:</span>{' '}
                                                    <span
                                                        className={`px-2 py-1 rounded-full ${
                                                            preOrder.trangThai === 0
                                                                ? 'bg-orange-200 text-orange-800'
                                                                : 'bg-green-200 text-green-800'
                                                        }`}
                                                    >
                                                        {preOrder.trangThai === 0 ? 'Chờ nhập hàng' : 'Đã nhập hàng'}
                                                    </span>
                                                </p>
                                                {preOrder.trangThai === 0 && (
                                                    <button
                                                        onClick={() => handleOpenImportModal(preOrder.sanPhamCT.id)}
                                                        className="mt-2 px-3 py-1 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors"
                                                    >
                                                        Nhập hàng
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )} */}
                        </div>
                    )}
                </div>
            </div>

            {selectedBill && (
                <PaymentSummary
                    total={subtotal}
                    selectedBill={selectedBill}
                    setSelectedBill={setSelectedBill}
                    updateBills={updateBills}
                />
            )}

            <ProductModal
                showProductModal={showProductModal}
                handleCloseProductModal={handleCloseProductModal}
                selectedBill={selectedBill}
                fetchBillDetails={fetchBillDetails}
                handleConfirmAddProduct={handleConfirmAddProduct}
                fetchProducts={fetchProducts} // truyền th
            />

            {showImportModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-lg font-semibold mb-4">Nhập hàng</h2>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Số lượng nhập</label>
                            <input
                                type="number"
                                value={importQuantity}
                                onChange={(e) => setImportQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-sm"
                                min="1"
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={handleCloseImportModal}
                                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleConfirmImport}
                                className="bg-orange-500 text-white px-4 py-2 rounded-md text-sm hover:bg-orange-600"
                            >
                                Xác nhận
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default OfflineSale;
