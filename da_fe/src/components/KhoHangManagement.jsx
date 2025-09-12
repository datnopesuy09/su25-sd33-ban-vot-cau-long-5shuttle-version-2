import React, { useState, useEffect } from 'react';
import axios from 'axios';
import swal from 'sweetalert';

const KhoHangManagement = ({ hoaDon, onRestoreComplete, currentOrderStatus }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [forceRestoreReason, setForceRestoreReason] = useState('');
    const [showForceModal, setShowForceModal] = useState(false);
    const [orderStatus, setOrderStatus] = useState(currentOrderStatus || hoaDon.trangThai);
    const [lastUpdated, setLastUpdated] = useState(new Date().toLocaleString('vi-VN'));

    // State cho tracking hoàn kho
    const [restoreInfo, setRestoreInfo] = useState({
        isRestored: false,
        forceRestoreCount: 0,
        canNormalRestore: false,
        canForceRestore: true,
        maxForceLimit: 1,
    });

    useEffect(() => {
        if (currentOrderStatus !== undefined) {
            setOrderStatus(currentOrderStatus);
            setLastUpdated(new Date().toLocaleString('vi-VN'));
        }
    }, [currentOrderStatus]);

    // Fetch thông tin hoàn kho từ backend
    useEffect(() => {
        const fetchRestoreInfo = async () => {
            try {
                const response = await axios.get(`http://localhost:8080/api/kho-hang/lich-su/${hoaDon.id}`);
                if (response.data) {
                    setRestoreInfo({
                        isRestored: response.data.isRestored,
                        forceRestoreCount: response.data.forceRestoreCount,
                        canNormalRestore: orderStatus === 7 && !response.data.isRestored,
                        // Vô hiệu hóa Force hoàn kho nếu đơn hàng đã hủy (trạng thái 7)
                        canForceRestore: orderStatus !== 7 && response.data.canForceRestore,
                        maxForceLimit: response.data.maxForceLimit,
                    });
                }
            } catch (error) {
                console.error('Lỗi khi lấy thông tin hoàn kho:', error);
            }
        };

        fetchRestoreInfo();
    }, [hoaDon.id, orderStatus]);

    // Cập nhật trạng thái real-time
    useEffect(() => {
        // Chỉ polling nếu không có currentOrderStatus từ props
        if (currentOrderStatus === undefined) {
            const fetchOrderStatus = async () => {
                try {
                    const response = await axios.get(`http://localhost:8080/api/kho-hang/trang-thai/${hoaDon.id}`);
                    if (response.data) {
                        setOrderStatus(response.data.trangThai);
                        setLastUpdated(new Date().toLocaleString('vi-VN'));
                    }
                } catch (error) {
                    console.error('Lỗi khi lấy trạng thái đơn hàng:', error);
                }
            };

            fetchOrderStatus();
            const interval = setInterval(fetchOrderStatus, 30000);
            return () => clearInterval(interval);
        }
    }, [hoaDon.id, currentOrderStatus]);

    // Hoàn kho thủ công cho đơn hàng đã hủy
    const handleRestoreStock = async () => {
        // if (orderStatus !== 7) {
        //     swal('Cảnh báo!', 'Chỉ có thể hoàn kho cho đơn hàng đã hủy', 'warning');
        //     return;
        // }

        if (restoreInfo.isRestored) {
            swal('Cảnh báo!', 'Đơn hàng này đã được hoàn kho trước đó!', 'warning');
            return;
        }

        const isConfirmed = await swal({
            title: 'Xác nhận hoàn kho',
            text: `Bạn có chắc chắn muốn hoàn kho cho đơn hàng #${hoaDon.ma}?\n\n⚠️ Chỉ có thể hoàn kho 1 lần duy nhất!`,
            icon: 'warning',
            buttons: ['Hủy', 'Xác nhận'],
            dangerMode: true,
        });

        if (isConfirmed) {
            setIsLoading(true);
            try {
                const response = await axios.post(`http://localhost:8080/api/kho-hang/hoan-kho/${hoaDon.id}`);
                swal('Thành công!', response.data, 'success');
                setLastUpdated(new Date().toLocaleString('vi-VN'));

                // Cập nhật trạng thái local
                setRestoreInfo((prev) => ({
                    ...prev,
                    isRestored: true,
                    canNormalRestore: false,
                }));

                if (onRestoreComplete) {
                    onRestoreComplete();
                }
            } catch (error) {
                console.error('Lỗi khi hoàn kho:', error);
                swal('Lỗi!', error.response?.data || 'Không thể hoàn kho', 'error');
            } finally {
                setIsLoading(false);
            }
        }
    };

    // Force hoàn kho CHỈ 1 LẦN DUY NHẤT
    const handleForceRestore = async () => {
        if (!forceRestoreReason.trim()) {
            swal('Cảnh báo!', 'Vui lòng nhập lý do force hoàn kho', 'warning');
            return;
        }

        // Kiểm tra giới hạn force restore (chỉ 1 lần!)
        if (restoreInfo.forceRestoreCount >= 1) {
            swal('Cảnh báo!', 'Đã đạt giới hạn: CHỈ ĐƯỢC Force Hoàn Kho 1 lần duy nhất cho mỗi đơn hàng!', 'error');
            return;
        }

        const isConfirmed = await swal({
            title: '🚨 CẢNH BÁO: Force Hoàn Kho',
            text: `NGUY HIỂM: Force hoàn kho có thể gây sai lệch dữ liệu!\n\nBạn có chắc chắn muốn FORCE hoàn kho cho đơn hàng #${hoaDon.ma}?\nLý do: ${forceRestoreReason}\n\n⚠️ CHỈ ĐƯỢC SỬ DỤNG 1 LẦN DUY NHẤT!`,
            icon: 'warning',
            buttons: ['Hủy', 'FORCE RESTORE'],
            dangerMode: true,
        });

        if (isConfirmed) {
            setIsLoading(true);
            try {
                const response = await axios.post(`http://localhost:8080/api/kho-hang/force-hoan-kho/${hoaDon.id}`, {
                    reason: forceRestoreReason,
                });

                swal('Thành công!', `${response.data.message}\n\n⚠️ Đã sử dụng Force Restore (1/1 lần)`, 'success');
                setShowForceModal(false);
                setForceRestoreReason('');
                setLastUpdated(new Date().toLocaleString('vi-VN'));

                // Cập nhật trạng thái local
                setRestoreInfo((prev) => ({
                    ...prev,
                    forceRestoreCount: 1,
                    canForceRestore: false,
                }));

                if (onRestoreComplete) {
                    onRestoreComplete();
                }
            } catch (error) {
                console.error('Lỗi khi force hoàn kho:', error);
                swal('Lỗi!', error.response?.data || 'Không thể force hoàn kho', 'error');
            } finally {
                setIsLoading(false);
            }
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

    const statusInfo = getStatusLabel(orderStatus);

    return (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        Quản lý Kho Hàng - Đơn hàng #{hoaDon.ma}
                    </h3>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm text-gray-600">Trạng thái:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                            {statusInfo.label}
                        </span>
                    </div>
                    {restoreInfo.isRestored && (
                        <div className="text-sm text-green-600 font-medium">✅ Đã hoàn kho thành công</div>
                    )}
                    {restoreInfo.forceRestoreCount > 0 && (
                        <div className="text-sm text-orange-600 font-medium">
                            ⚠️ Đã Force Hoàn Kho: {restoreInfo.forceRestoreCount}/{restoreInfo.maxForceLimit} lần
                        </div>
                    )}
                </div>
                <div className="text-sm text-gray-500">
                    Ngày tạo: {new Date(hoaDon.ngayTao).toLocaleDateString('vi-VN')}
                </div>
            </div>

            <div className="border-t pt-4">
                <h4 className="text-md font-medium text-gray-700 mb-3">Thao tác kho hàng</h4>

                <div className="flex flex-wrap gap-3">
                    {/* Nút hoàn kho thông thường */}
                    {/* <button
                        onClick={handleRestoreStock}
                        // disabled={isLoading || !restoreInfo.canNormalRestore}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                            restoreInfo.canNormalRestore && !isLoading
                                ? 'bg-blue-600 text-white hover:bg-blue-700'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                    >
                        {isLoading ? 'Đang xử lý...' : 'Hoàn kho'}
                    </button> */}

                    {/* Nút force hoàn kho (chỉ admin) */}
                    <button
                        onClick={() => setShowForceModal(true)}
                        disabled={isLoading || !restoreInfo.canForceRestore}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                            !restoreInfo.canForceRestore
                                ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                                : 'bg-red-600 text-white hover:bg-red-700'
                        } disabled:opacity-50`}
                    >
                        {!restoreInfo.canForceRestore
                            ? orderStatus === 7
                                ? 'Không khả dụng (Đã hủy)'
                                : 'Đã hết lượt Force'
                            : 'Force Hoàn Kho (1 lần)'}
                    </button>
                </div>

                {orderStatus !== 7 && !restoreInfo.isRestored && (
                    <p className="text-sm text-gray-500 mt-2">
                        * Hoàn kho thông thường chỉ khả dụng cho đơn hàng đã hủy
                    </p>
                )}

                {restoreInfo.isRestored && (
                    <p className="text-sm text-green-600 font-medium mt-2">
                        ✅ Đơn hàng này đã được hoàn kho thành công
                    </p>
                )}

                {!restoreInfo.canForceRestore && (
                    <p className="text-sm text-red-600 font-medium mt-2">
                        {orderStatus === 7
                            ? '🚫 Force Hoàn Kho không khả dụng cho đơn hàng đã hủy'
                            : '⚠️ Đã đạt giới hạn tối đa Force Hoàn Kho cho đơn hàng này'}
                    </p>
                )}

                {/* Thông báo đặc biệt cho đơn hàng đã hủy */}
                {orderStatus === 7 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-3">
                        <div className="flex items-start space-x-2">
                            <div className="w-4 h-4 text-yellow-600 mt-0.5">
                                <svg fill="currentColor" viewBox="0 0 20 20">
                                    <path
                                        fillRule="evenodd"
                                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </div>
                            <div>
                                <h5 className="text-yellow-800 font-medium text-sm">Đơn hàng đã hủy</h5>
                                <p className="text-yellow-700 text-xs mt-1">
                                    Số lượng sản phẩm đã được hoàn lại tự động. Chức năng Force hoàn kho đã bị vô hiệu
                                    hóa để tránh duplicate restoration.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal Force Restore */}
            {showForceModal && (
                <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => setShowForceModal(false)}
                    />

                    <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
                        <div className="bg-red-600 text-white p-4 rounded-t-lg">
                            <h3 className="text-lg font-bold">🚨 FORCE HOÀN KHO DUY NHẤT</h3>
                            <p className="text-sm opacity-90">Chức năng đặc biệt cho Admin - CHỈ 1 LẦN DUY NHẤT!</p>
                        </div>

                        <div className="p-6">
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Lý do force hoàn kho: <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={forceRestoreReason}
                                    onChange={(e) => setForceRestoreReason(e.target.value)}
                                    className="w-full border border-gray-300 rounded-md p-3 text-sm focus:ring-red-500 focus:border-red-500"
                                    rows="3"
                                    placeholder="Nhập lý do tại sao cần force hoàn kho..."
                                />
                            </div>

                            <div className="bg-red-50 border-red-200 border rounded-md p-3 mb-4">
                                <p className="text-sm text-red-800">
                                    <strong>CẢNH BÁO NGHIÊM TRỌNG:</strong> Force hoàn kho sẽ hoàn lại số lượng bất kể
                                    trạng thái đơn hàng. Chỉ được sử dụng 1 lần duy nhất cho mỗi đơn hàng!
                                </p>
                                <p className="text-xs mt-1 text-red-600">
                                    Số lần đã dùng: {restoreInfo.forceRestoreCount}/{restoreInfo.maxForceLimit} | Còn
                                    lại: {restoreInfo.maxForceLimit - restoreInfo.forceRestoreCount} lần
                                </p>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 p-6 bg-gray-50 rounded-b-lg">
                            <button
                                onClick={() => {
                                    setShowForceModal(false);
                                    setForceRestoreReason('');
                                }}
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleForceRestore}
                                disabled={!forceRestoreReason.trim() || isLoading}
                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
                            >
                                {isLoading ? 'Đang xử lý...' : 'FORCE RESTORE (1 LẦN)'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default KhoHangManagement;
