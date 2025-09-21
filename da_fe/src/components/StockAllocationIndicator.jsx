import React, { useState, useEffect, useCallback } from 'react';
import { Package, AlertTriangle, CheckCircle, Clock, XCircle } from 'lucide-react';

const StockAllocationIndicator = ({
    sanPhamCTId,
    hoaDonCTId,
    currentQuantity,
    isOrderConfirmed = false,
    showDetails = true,
}) => {
    const [allocationInfo, setAllocationInfo] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchAllocationInfo = useCallback(async () => {
        setLoading(true);
        try {
            // Gọi API để lấy thông tin allocation
            const response = await fetch(`http://localhost:8080/api/stock-allocation/summary/${sanPhamCTId}`);
            if (response.ok) {
                const data = await response.json();
                setAllocationInfo(data);
            }
        } catch (error) {
            console.error('Lỗi khi lấy thông tin allocation:', error);
        } finally {
            setLoading(false);
        }
    }, [sanPhamCTId]);

    useEffect(() => {
        if (sanPhamCTId) {
            fetchAllocationInfo();
        }
    }, [sanPhamCTId, hoaDonCTId, fetchAllocationInfo]);

    const getStatusIcon = (status) => {
        switch (status) {
            case 'RESERVED':
                return <Clock className="w-4 h-4 text-yellow-500" />;
            case 'ALLOCATED':
                return <Package className="w-4 h-4 text-blue-500" />;
            case 'CONFIRMED':
                return <CheckCircle className="w-4 h-4 text-green-500" />;
            case 'CANCELLED':
                return <XCircle className="w-4 h-4 text-red-500" />;
            default:
                return <AlertTriangle className="w-4 h-4 text-gray-500" />;
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'RESERVED':
                return 'Đặt trước';
            case 'ALLOCATED':
                return 'Đã phân bổ';
            case 'CONFIRMED':
                return 'Đã xác nhận';
            case 'CANCELLED':
                return 'Đã hủy';
            default:
                return 'Không xác định';
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'RESERVED':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'ALLOCATED':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'CONFIRMED':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'CANCELLED':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center space-x-2 text-sm text-gray-500">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-300"></div>
                <span>Đang tải...</span>
            </div>
        );
    }

    if (!allocationInfo) {
        return (
            <div className="flex items-center space-x-2 text-sm text-gray-400">
                <AlertTriangle className="w-4 h-4" />
                <span>Chưa có allocation</span>
            </div>
        );
    }

    const { currentStock, totalReserved, totalAllocated, totalConfirmed, availableStock, allocationStatus } =
        allocationInfo;

    return (
        <div className="space-y-2">
            {/* Status Badge */}
            <div className="flex items-center space-x-2">
                <div
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(allocationStatus)}`}
                >
                    {getStatusIcon(allocationStatus)}
                    <span className="ml-1">{getStatusText(allocationStatus)}</span>
                </div>

                {/* Quantity Badge */}
                <div className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                    {currentQuantity} sản phẩm
                </div>
            </div>

            {/* Detailed Info */}
            {showDetails && (
                <div className="bg-gray-50 rounded-lg p-3 space-y-2 text-xs">
                    <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Tồn kho:</span>
                                <span className="font-medium">{currentStock}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Khả dụng:</span>
                                <span
                                    className={`font-medium ${availableStock > 0 ? 'text-green-600' : 'text-red-600'}`}
                                >
                                    {availableStock}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <div className="flex justify-between">
                                <span className="text-yellow-600">Đặt trước:</span>
                                <span className="font-medium">{totalReserved}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-blue-600">Đã phân bổ:</span>
                                <span className="font-medium">{totalAllocated}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-green-600">Đã xác nhận:</span>
                                <span className="font-medium">{totalConfirmed}</span>
                            </div>
                        </div>
                    </div>

                    {/* Stock Warning */}
                    {availableStock < currentQuantity && allocationStatus === 'RESERVED' && (
                        <div className="flex items-center space-x-1 text-orange-600 bg-orange-50 p-2 rounded">
                            <AlertTriangle className="w-3 h-3" />
                            <span className="text-xs">Không đủ hàng để phân bổ</span>
                        </div>
                    )}

                    {/* Status Messages */}
                    {allocationStatus === 'RESERVED' && (
                        <div className="text-yellow-600 text-xs bg-yellow-50 p-2 rounded">
                            ⏳ Chờ admin điều chỉnh hoặc xác nhận đơn hàng
                        </div>
                    )}

                    {allocationStatus === 'ALLOCATED' && !isOrderConfirmed && (
                        <div className="text-blue-600 text-xs bg-blue-50 p-2 rounded">
                            📦 Đã trừ kho, chờ xác nhận đơn hàng
                        </div>
                    )}

                    {allocationStatus === 'CONFIRMED' && (
                        <div className="text-green-600 text-xs bg-green-50 p-2 rounded">
                            ✅ Đã xác nhận, không thể điều chỉnh
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default StockAllocationIndicator;
