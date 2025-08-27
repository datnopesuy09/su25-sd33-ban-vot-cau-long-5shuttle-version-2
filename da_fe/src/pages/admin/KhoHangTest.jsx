import React, { useState, useEffect } from 'react';
import axios from 'axios';
import swal from 'sweetalert';

const KhoHangTestPage = () => {
    const [hoaDonList, setHoaDonList] = useState([]);
    const [selectedHoaDon, setSelectedHoaDon] = useState(null);
    const [stockCheckData, setStockCheckData] = useState({
        sanPhamCTId: '',
        soLuongYeuCau: '',
    });
    const [stockCheckResult, setStockCheckResult] = useState(null);

    useEffect(() => {
        fetchHoaDonList();
    }, []);

    const fetchHoaDonList = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/hoa-don');
            setHoaDonList(response.data || []);
        } catch (error) {
            console.error('Lỗi khi lấy danh sách hóa đơn:', error);
        }
    };

    const handleRestoreStock = async (hoaDonId) => {
        try {
            const response = await axios.post(`http://localhost:8080/api/kho-hang/hoan-kho/${hoaDonId}`);
            swal('Thành công!', response.data, 'success');
            fetchHoaDonList(); // Refresh data
        } catch (error) {
            swal('Lỗi!', error.response?.data || 'Không thể hoàn kho', 'error');
        }
    };

    const handleForceRestore = async (hoaDonId) => {
        const reason = prompt('Nhập lý do force hoàn kho:');
        if (!reason) return;

        try {
            const response = await axios.post(`http://localhost:8080/api/kho-hang/force-hoan-kho/${hoaDonId}`, {
                reason: reason,
            });
            swal('Thành công!', response.data, 'success');
            fetchHoaDonList(); // Refresh data
        } catch (error) {
            swal('Lỗi!', error.response?.data || 'Không thể force hoàn kho', 'error');
        }
    };

    const handleCheckStock = async () => {
        if (!stockCheckData.sanPhamCTId || !stockCheckData.soLuongYeuCau) {
            swal('Cảnh báo!', 'Vui lòng nhập đầy đủ thông tin', 'warning');
            return;
        }

        try {
            const response = await axios.get(
                `http://localhost:8080/api/kho-hang/kiem-tra-ton-kho/${stockCheckData.sanPhamCTId}?soLuongYeuCau=${stockCheckData.soLuongYeuCau}`,
            );
            setStockCheckResult(response.data);
        } catch (error) {
            swal('Lỗi!', 'Không thể kiểm tra tồn kho', 'error');
        }
    };

    const getStatusLabel = (status) => {
        const statusMap = {
            1: { label: 'Chờ xác nhận', color: 'bg-yellow-200 text-yellow-800' },
            2: { label: 'Chờ giao hàng', color: 'bg-blue-200 text-blue-800' },
            3: { label: 'Đang vận chuyển', color: 'bg-purple-200 text-purple-800' },
            4: { label: 'Đã giao hàng', color: 'bg-green-200 text-green-800' },
            5: { label: 'Đã thanh toán', color: 'bg-indigo-200 text-indigo-800' },
            6: { label: 'Hoàn thành', color: 'bg-gray-200 text-gray-800' },
            7: { label: 'Đã hủy', color: 'bg-red-200 text-red-800' },
            8: { label: 'Trả hàng', color: 'bg-orange-200 text-orange-800' },
            // 9: { label: 'Chờ nhập hàng', color: 'bg-yellow-300 text-yellow-900' },
        };
        return statusMap[status] || { label: 'Không xác định', color: 'bg-gray-200 text-gray-800' };
    };

    return (
        <div className="container mx-auto p-6">
            <div className="bg-white rounded-lg shadow-lg">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-lg">
                    <h1 className="text-2xl font-bold">🛠️ Test Quản Lý Kho Hàng</h1>
                    <p className="text-blue-100 mt-2">Kiểm tra và demo các tính năng hoàn kho tự động</p>
                </div>

                <div className="p-6">
                    {/* Kiểm tra tồn kho */}
                    <div className="mb-8 p-4 border border-gray-200 rounded-lg">
                        <h2 className="text-lg font-semibold mb-4">🔍 Kiểm tra tồn kho</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <input
                                type="number"
                                placeholder="ID Sản phẩm chi tiết"
                                value={stockCheckData.sanPhamCTId}
                                onChange={(e) =>
                                    setStockCheckData((prev) => ({ ...prev, sanPhamCTId: e.target.value }))
                                }
                                className="border border-gray-300 rounded-md p-2"
                            />
                            <input
                                type="number"
                                placeholder="Số lượng yêu cầu"
                                value={stockCheckData.soLuongYeuCau}
                                onChange={(e) =>
                                    setStockCheckData((prev) => ({ ...prev, soLuongYeuCau: e.target.value }))
                                }
                                className="border border-gray-300 rounded-md p-2"
                            />
                            <button
                                onClick={handleCheckStock}
                                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                            >
                                Kiểm tra
                            </button>
                        </div>

                        {stockCheckResult && (
                            <div className="mt-4 p-3 border rounded-md bg-gray-50">
                                <h3 className="font-medium">Kết quả kiểm tra:</h3>
                                <p>Sản phẩm ID: {stockCheckResult.sanPhamCTId}</p>
                                <p>Số lượng yêu cầu: {stockCheckResult.soLuongYeuCau}</p>
                                <p
                                    className={`font-bold ${stockCheckResult.coSan ? 'text-green-600' : 'text-red-600'}`}
                                >
                                    {stockCheckResult.coSan ? '✅ Có sẵn' : '❌ Không đủ hàng'}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Danh sách hóa đơn */}
                    <div>
                        <h2 className="text-lg font-semibold mb-4">📋 Danh sách hóa đơn ({hoaDonList.length})</h2>
                        <div className="overflow-x-auto">
                            <table className="min-w-full table-auto border-collapse border border-gray-300">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="border border-gray-300 px-4 py-2 text-left">Mã HĐ</th>
                                        <th className="border border-gray-300 px-4 py-2 text-left">Khách hàng</th>
                                        <th className="border border-gray-300 px-4 py-2 text-left">Tổng tiền</th>
                                        <th className="border border-gray-300 px-4 py-2 text-center">Trạng thái</th>
                                        <th className="border border-gray-300 px-4 py-2 text-center">Ngày tạo</th>
                                        <th className="border border-gray-300 px-4 py-2 text-center">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {hoaDonList.map((hoaDon) => {
                                        const statusInfo = getStatusLabel(hoaDon.trangThai);
                                        return (
                                            <tr key={hoaDon.id} className="hover:bg-gray-50">
                                                <td className="border border-gray-300 px-4 py-2 font-mono">
                                                    #{hoaDon.ma}
                                                </td>
                                                <td className="border border-gray-300 px-4 py-2">
                                                    {hoaDon.tenNguoiNhan || 'N/A'}
                                                </td>
                                                <td className="border border-gray-300 px-4 py-2">
                                                    {new Intl.NumberFormat('vi-VN', {
                                                        style: 'currency',
                                                        currency: 'VND',
                                                    }).format(hoaDon.tongTien || 0)}
                                                </td>
                                                <td className="border border-gray-300 px-4 py-2 text-center">
                                                    <span
                                                        className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}
                                                    >
                                                        {statusInfo.label}
                                                    </span>
                                                </td>
                                                <td className="border border-gray-300 px-4 py-2 text-center">
                                                    {new Date(hoaDon.ngayTao).toLocaleDateString('vi-VN')}
                                                </td>
                                                <td className="border border-gray-300 px-4 py-2 text-center">
                                                    <div className="flex gap-2 justify-center">
                                                        <button
                                                            onClick={() => handleRestoreStock(hoaDon.id)}
                                                            disabled={hoaDon.trangThai !== 7}
                                                            className={`px-3 py-1 text-xs rounded ${
                                                                hoaDon.trangThai === 7
                                                                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                                                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                            }`}
                                                            title="Hoàn kho (chỉ cho đơn hàng đã hủy)"
                                                        >
                                                            Hoàn kho
                                                        </button>
                                                        <button
                                                            onClick={() => handleForceRestore(hoaDon.id)}
                                                            className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                                                            title="Force hoàn kho (bất kể trạng thái)"
                                                        >
                                                            Force
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-b-lg">
                    <div className="text-sm text-gray-600">
                        <h3 className="font-medium mb-2">📝 Hướng dẫn sử dụng:</h3>
                        <ul className="list-disc list-inside space-y-1">
                            <li>
                                <strong>Hoàn kho:</strong> Chỉ khả dụng cho đơn hàng đã hủy (trạng thái 7)
                            </li>
                            <li>
                                <strong>Force hoàn kho:</strong> Hoàn kho bất kể trạng thái (chỉ admin)
                            </li>
                            <li>
                                <strong>Kiểm tra tồn kho:</strong> Xem sản phẩm có đủ hàng hay không
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default KhoHangTestPage;
