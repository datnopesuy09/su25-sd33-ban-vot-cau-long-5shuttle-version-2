import React, { useEffect, useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import CloseIcon from '@mui/icons-material/Close';
import swal from 'sweetalert';
import axios from 'axios';
import ProductModal from './ProductModal';
import ProductList from './ProductList';
import PaymentSummary from './PaymentSummary'; // Adjust the path as necessary

function OfflineSale() {
    const [bills, setBills] = useState([]);
    const [selectedBill, setSelectedBill] = useState(null);
    const [showProductModal, setShowProductModal] = useState(false);
    const [billDetails, setBillDetails] = useState([]);
    const [subtotal, setSubtotal] = useState(0); // Initialize subtotal state

    useEffect(() => {
        fetchBills();
    }, []);

    const fetchBills = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/hoa-don');
            setBills(response.data);
        } catch (error) {
            console.error('Lỗi khi lấy danh sách hóa đơn:', error);
        }
    };

    const fetchBillDetails = async (idHoaDon) => {
        try {
            const response = await axios.get(`http://localhost:8080/api/hoa-don-ct/hoa-don/${idHoaDon}`);
            setBillDetails(response.data);
        } catch (error) {
            console.error('Lỗi khi lấy danh sách hóa đơn:', error);
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
    };

    useEffect(() => {
        const newSubtotal = billDetails.reduce((total, orderDetail) => {
            return total + orderDetail.sanPhamCT.donGia * orderDetail.soLuong;
        }, 0);
        setSubtotal(newSubtotal); // Update subtotal whenever billDetails change
    }, [billDetails]);

    console.log('billDetails in offlinesale: ', billDetails);

    const handleProductModal = () => {
        setShowProductModal(true);
    };

    const handleCloseProductModal = () => {
        setShowProductModal(false);
    };

    const handleAddBillDetail = (billDetail) => {
        // Kiểm tra xem sản phẩm đã tồn tại trong billDetails chưa
        const productExists = billDetails.some((detail) => detail.sanPhamCT.id === billDetail.idSanPhamCT);

        if (productExists) {
            swal('Thất bại!', 'Sản phẩm đã tồn tại trong hóa đơn!', 'warning');
            return; // Không thêm sản phẩm nếu đã tồn tại
        }

        const newBillDetail = {
            sanPhamCT: { id: billDetail.idSanPhamCT },
            hoaDon: { id: billDetail.idHoaDon },
            soLuong: billDetail.soLuong,
            giaBan: billDetail.giaBan,
            trangThai: 1,
        };

        axios
            .post('http://localhost:8080/api/hoa-don-ct', newBillDetail)
            .then((response) => {
                // Chỉ hiển thị thông báo thành công nếu sản phẩm được thêm thành công
                setBillDetails((prev) => [...prev, response.data]);
                swal('Thành công!', 'Sản phẩm đã được thêm vào hóa đơn!', 'success');
            })
            .catch((error) => {
                console.error('Lỗi khi thêm chi tiết hóa đơn:', error);
                swal('Lỗi!', 'Không thể thêm sản phẩm vào hóa đơn', 'error');
            });
    };

    const updateBills = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/hoa-don');
            setBills(response.data);
        } catch (error) {
            console.error('Lỗi khi lấy danh sách hóa đơn:', error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="flex flex-col gap-4 h-[calc(100vh-2rem)] ">
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
                                    <button className="border border-blue-600 text-blue-600 px-4 py-2 rounded-md text-sm hover:bg-blue-50 transition-colors">
                                        QUÉT QR SẢN PHẨM
                                    </button>
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
                                    handleOpenProductModal={handleProductModal}
                                    isLiked={false}
                                    setIsLiked={() => {}}
                                />
                            </div>
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
                onAddBillDetail={handleAddBillDetail}
            />
        </div>
    );
}

export default OfflineSale;
