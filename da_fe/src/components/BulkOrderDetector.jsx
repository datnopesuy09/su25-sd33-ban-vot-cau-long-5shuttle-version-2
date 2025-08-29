import React, { useState, useEffect, useMemo } from 'react';
import { Users, PhoneCall, MessageCircle, ShoppingCart, AlertTriangle, UserCheck, Clock } from 'lucide-react';

const BulkOrderDetector = ({
    cartItems = [],
    totalQuantity = 0,
    totalValue = 0,
    onContactStaff = () => {},
    onContinueNormal = () => {},
}) => {
    const [showBulkModal, setShowBulkModal] = useState(false);
    const [hasUserDismissed, setHasUserDismissed] = useState(false); // Track nếu user đã dismiss
    const [bulkThresholds, setBulkThresholds] = useState({
        quantityThreshold: 10, // Ngưỡng số lượng
        valueThreshold: 5000000, // Ngưỡng giá trị (5 triệu VND)
        categoriesThreshold: 3, // Ngưỡng số loại sản phẩm khác nhau
    });

    const [staffInfo, setStaffInfo] = useState({
        name: 'Chuyên viên tư vấn',
        phone: '0123456789',
        email: 'sales@5shuttle.com',
        zalo: '0123456789',
    });

    // Kiểm tra điều kiện bulk order với useMemo để tránh re-calculation
    const bulkConditions = useMemo(() => {
        const uniqueCategories = new Set(cartItems.map((item) => item.sanPhamCT?.thuongHieu?.id)).size;

        return {
            highQuantity: totalQuantity >= bulkThresholds.quantityThreshold,
            highValue: totalValue >= bulkThresholds.valueThreshold,
            multipleCategories: uniqueCategories >= bulkThresholds.categoriesThreshold,
            hasExpensiveItems: cartItems.some((item) => {
                const price = item.sanPhamCT?.giaKhuyenMai || item.sanPhamCT?.donGia || 0;
                return price >= 1000000; // Sản phẩm từ 1 triệu trở lên
            }),
        };
    }, [cartItems, totalQuantity, totalValue, bulkThresholds]);

    const shouldShowWarning = useMemo(() => {
        return (
            bulkConditions.highQuantity ||
            bulkConditions.highValue ||
            (bulkConditions.multipleCategories && bulkConditions.hasExpensiveItems)
        );
    }, [bulkConditions]);

    useEffect(() => {
        if (shouldShowWarning && cartItems.length > 0 && !showBulkModal && !hasUserDismissed) {
            setShowBulkModal(true);
        }
    }, [shouldShowWarning, cartItems.length, showBulkModal, hasUserDismissed]);

    const getBulkBenefits = () => [
        {
            icon: <UserCheck className="w-5 h-5 text-blue-600" />,
            title: 'Tư vấn chuyên sâu',
            desc: 'Nhận tư vấn từ chuyên gia về sản phẩm phù hợp nhất',
        },
        {
            icon: <ShoppingCart className="w-5 h-5 text-green-600" />,
            title: 'Giá ưu đãi đặc biệt',
            desc: 'Chiết khấu lên đến 15% cho đơn hàng số lượng lớn',
        },
        {
            icon: <Clock className="w-5 h-5 text-purple-600" />,
            title: 'Xử lý ưu tiên',
            desc: 'Đơn hàng được xử lý và giao hàng ưu tiên',
        },
    ];

    const handleContactStaff = (method) => {
        const orderInfo = {
            totalQuantity,
            totalValue,
            itemCount: cartItems.length,
            cartItems: cartItems.map((item) => ({
                name: item.sanPhamCT?.ten,
                quantity: item.soLuong,
                price: item.sanPhamCT?.giaKhuyenMai || item.sanPhamCT?.donGia,
            })),
        };

        if (method === 'phone') {
            window.open(`tel:${staffInfo.phone}`);
        } else if (method === 'zalo') {
            window.open(`https://zalo.me/${staffInfo.zalo}`);
        } else if (method === 'email') {
            const subject = `Tư vấn đơn hàng số lượng lớn - ${totalQuantity} sản phẩm`;
            const body = `Tôi muốn được tư vấn cho đơn hàng:
- Số lượng: ${totalQuantity} sản phẩm
- Giá trị: ${totalValue.toLocaleString()}đ
- Số loại sản phẩm: ${cartItems.length}

Chi tiết giỏ hàng:
${cartItems.map((item) => `- ${item.sanPhamCT?.ten}: ${item.soLuong} x ${(item.sanPhamCT?.giaKhuyenMai || item.sanPhamCT?.donGia)?.toLocaleString()}đ`).join('\n')}

Vui lòng liên hệ tư vấn giá tốt nhất. Cảm ơn!`;

            window.open(
                `mailto:${staffInfo.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
            );
        }

        onContactStaff(method, orderInfo);
        setShowBulkModal(false);
        setHasUserDismissed(true); // Đánh dấu user đã interact với modal
    };

    if (!showBulkModal) return null;

    // Sử dụng bulkConditions đã được tính toán bằng useMemo
    const conditions = bulkConditions;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-white/20 rounded-lg">
                            <Users className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold">Đơn hàng số lượng lớn!</h3>
                            <p className="text-blue-100 text-sm">Được hỗ trợ tư vấn chuyên sâu</p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Alert Info */}
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                            <div>
                                <h4 className="font-semibold text-amber-800 mb-1">Phát hiện đơn hàng lớn</h4>
                                <ul className="text-sm text-amber-700 space-y-1">
                                    {bulkConditions.highQuantity && (
                                        <li>
                                            • Số lượng: {totalQuantity} sản phẩm (≥ {bulkThresholds.quantityThreshold})
                                        </li>
                                    )}
                                    {bulkConditions.highValue && (
                                        <li>
                                            • Giá trị: {totalValue.toLocaleString()}đ (≥{' '}
                                            {bulkThresholds.valueThreshold.toLocaleString()}đ)
                                        </li>
                                    )}
                                    {bulkConditions.multipleCategories && (
                                        <li>
                                            • Đa dạng sản phẩm:{' '}
                                            {new Set(cartItems.map((item) => item.sanPhamCT?.thuongHieu?.id)).size}{' '}
                                            thương hiệu
                                        </li>
                                    )}
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Benefits */}
                    <div className="mb-6">
                        <h4 className="font-semibold text-gray-800 mb-3">Lợi ích khi được nhân viên tư vấn:</h4>
                        <div className="space-y-3">
                            {getBulkBenefits().map((benefit, index) => (
                                <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                    {benefit.icon}
                                    <div>
                                        <h5 className="font-medium text-gray-800">{benefit.title}</h5>
                                        <p className="text-sm text-gray-600">{benefit.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Staff Contact */}
                    <div className="bg-blue-50 rounded-lg p-4 mb-6">
                        <h4 className="font-semibold text-blue-800 mb-3">Liên hệ ngay với {staffInfo.name}:</h4>
                        <div className="grid grid-cols-1 gap-2">
                            <button
                                onClick={() => handleContactStaff('phone')}
                                className="flex items-center gap-3 p-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                            >
                                <PhoneCall className="w-5 h-5" />
                                <div className="text-left">
                                    <div className="font-medium">Gọi điện thoại</div>
                                    <div className="text-sm opacity-90">{staffInfo.phone}</div>
                                </div>
                            </button>

                            <button
                                onClick={() => handleContactStaff('zalo')}
                                className="flex items-center gap-3 p-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                            >
                                <MessageCircle className="w-5 h-5" />
                                <div className="text-left">
                                    <div className="font-medium">Chat Zalo</div>
                                    <div className="text-sm opacity-90">Tư vấn trực tiếp</div>
                                </div>
                            </button>

                            <button
                                onClick={() => handleContactStaff('email')}
                                className="flex items-center gap-3 p-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                            >
                                <Users className="w-5 h-5" />
                                <div className="text-left">
                                    <div className="font-medium">Gửi email</div>
                                    <div className="text-sm opacity-90">{staffInfo.email}</div>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <button
                            onClick={() => {
                                // Đóng modal và đánh dấu user đã dismiss
                                setShowBulkModal(false);
                                setHasUserDismissed(true);
                                // Gọi callback để reset warning
                                onContinueNormal();
                            }}
                            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Bỏ qua, mua bình thường
                        </button>
                        <button
                            onClick={() => handleContactStaff('phone')}
                            className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                        >
                            Liên hệ tư vấn
                        </button>
                    </div>

                    {/* Note */}
                    <p className="text-xs text-gray-500 text-center mt-4">
                        💡 Liên hệ nhân viên để được tư vấn giá tốt nhất và dịch vụ chuyên nghiệp
                    </p>
                </div>
            </div>
        </div>
    );
};

export default BulkOrderDetector;
