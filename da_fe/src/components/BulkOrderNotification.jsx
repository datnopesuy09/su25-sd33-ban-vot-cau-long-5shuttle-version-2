import React, { useState, useEffect } from 'react';
import { Smartphone, MessageSquare, Mail, Store, Clock, Gift, TrendingUp } from 'lucide-react';

const BulkOrderNotification = ({ show = false, orderData = {}, onContactMethod = () => {}, onDismiss = () => {} }) => {
    const [selectedMethod, setSelectedMethod] = useState('');
    const [customerInfo, setCustomerInfo] = useState({
        name: '',
        phone: '',
        email: '',
        note: '',
    });

    const contactMethods = [
        {
            id: 'phone',
            icon: <Smartphone className="w-5 h-5" />,
            title: 'Gọi điện thoại',
            subtitle: 'Tư vấn trực tiếp ngay',
            color: 'bg-green-500 hover:bg-green-600',
            action: () => window.open('tel:0123456789'),
        },
        {
            id: 'zalo',
            icon: <MessageSquare className="w-5 h-5" />,
            title: 'Chat Zalo',
            subtitle: 'Nhắn tin trao đổi',
            color: 'bg-blue-500 hover:bg-blue-600',
            action: () => window.open('https://zalo.me/0123456789'),
        },
        {
            id: 'email',
            icon: <Mail className="w-5 h-5" />,
            title: 'Gửi email',
            subtitle: 'Nhận báo giá chi tiết',
            color: 'bg-purple-500 hover:bg-purple-600',
            action: () => sendEmail(),
        },
        {
            id: 'visit',
            icon: <Store className="w-5 h-5" />,
            title: 'Đến cửa hàng',
            subtitle: 'Xem hàng trực tiếp',
            color: 'bg-orange-500 hover:bg-orange-600',
            action: () => window.open('https://maps.google.com/?q=cửa hàng 5shuttle'),
        },
    ];

    const bulkBenefits = [
        {
            icon: <Gift className="w-4 h-4 text-red-500" />,
            text: 'Giảm giá lên đến 15% cho đơn hàng số lượng lớn',
        },
        {
            icon: <TrendingUp className="w-4 h-4 text-blue-500" />,
            text: 'Tư vấn combo sản phẩm phù hợp nhất',
        },
        {
            icon: <Clock className="w-4 h-4 text-green-500" />,
            text: 'Ưu tiên xử lý và giao hàng nhanh',
        },
    ];

    const sendEmail = () => {
        const subject = `Yêu cầu tư vấn đơn hàng số lượng lớn`;
        const body = `Xin chào,

Tôi quan tâm đến việc mua số lượng lớn với thông tin đơn hàng như sau:
- Tổng số lượng: ${orderData.totalQuantity || 0} sản phẩm
- Tổng giá trị: ${(orderData.totalValue || 0).toLocaleString()}đ
- Số loại sản phẩm: ${orderData.itemCount || 0}

Thông tin liên hệ:
- Họ tên: ${customerInfo.name}
- Điện thoại: ${customerInfo.phone}
- Email: ${customerInfo.email}
- Ghi chú: ${customerInfo.note}

Vui lòng liên hệ tư vấn giá tốt nhất.
Cảm ơn!`;

        window.open(
            `mailto:sales@5shuttle.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
        );
    };

    const handleMethodSelect = (method) => {
        setSelectedMethod(method.id);

        // Gọi action của method
        if (method.action) {
            method.action();
        }

        // Callback về parent component
        onContactMethod(method.id, {
            customerInfo,
            orderData,
        });

        // Đóng modal sau 1 giây
        setTimeout(() => {
            onDismiss();
        }, 1000);
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-4">
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 text-white p-6 rounded-t-2xl">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Store className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold mb-1">Đơn hàng lớn phát hiện!</h3>
                        <p className="text-blue-100 text-sm">
                            Bạn có {orderData.totalQuantity || 0} sản phẩm •{' '}
                            {(orderData.totalValue || 0).toLocaleString()}đ
                        </p>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Benefits */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 mb-6">
                        <h4 className="font-semibold text-gray-800 text-center mb-3">
                            🎉 Ưu đãi đặc biệt cho khách hàng VIP
                        </h4>
                        <div className="space-y-2">
                            {bulkBenefits.map((benefit, index) => (
                                <div key={index} className="flex items-center gap-2 text-sm">
                                    {benefit.icon}
                                    <span className="text-gray-700">{benefit.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Customer Info Form */}
                    <div className="mb-6">
                        <h4 className="font-medium text-gray-800 mb-3">Thông tin liên hệ (tùy chọn):</h4>
                        <div className="grid grid-cols-2 gap-3 mb-3">
                            <input
                                type="text"
                                placeholder="Họ tên"
                                value={customerInfo.name}
                                onChange={(e) => setCustomerInfo((prev) => ({ ...prev, name: e.target.value }))}
                                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <input
                                type="tel"
                                placeholder="Số điện thoại"
                                value={customerInfo.phone}
                                onChange={(e) => setCustomerInfo((prev) => ({ ...prev, phone: e.target.value }))}
                                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <input
                            type="email"
                            placeholder="Email"
                            value={customerInfo.email}
                            onChange={(e) => setCustomerInfo((prev) => ({ ...prev, email: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
                        />
                        <textarea
                            placeholder="Ghi chú thêm..."
                            value={customerInfo.note}
                            onChange={(e) => setCustomerInfo((prev) => ({ ...prev, note: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                            rows="2"
                        />
                    </div>

                    {/* Contact Methods */}
                    <div className="mb-6">
                        <h4 className="font-medium text-gray-800 mb-3 text-center">
                            Chọn cách liên hệ với chuyên viên tư vấn:
                        </h4>
                        <div className="grid grid-cols-2 gap-3">
                            {contactMethods.map((method) => (
                                <button
                                    key={method.id}
                                    onClick={() => handleMethodSelect(method)}
                                    className={`p-3 rounded-xl text-white transition-all duration-200 transform hover:scale-105 ${method.color} ${
                                        selectedMethod === method.id ? 'ring-4 ring-blue-200' : ''
                                    }`}
                                >
                                    <div className="flex flex-col items-center gap-2">
                                        {method.icon}
                                        <div className="text-center">
                                            <div className="font-medium text-sm">{method.title}</div>
                                            <div className="text-xs opacity-90">{method.subtitle}</div>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <button
                            onClick={onDismiss}
                            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                        >
                            Bỏ qua
                        </button>
                        <button
                            onClick={() => handleMethodSelect(contactMethods[0])}
                            className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg transition-all duration-200 transform hover:scale-105 font-medium"
                        >
                            Gọi ngay
                        </button>
                    </div>

                    {/* Footer Note */}
                    <div className="text-center mt-4">
                        <p className="text-xs text-gray-500">
                            💡 Liên hệ để được tư vấn miễn phí và nhận ưu đãi tốt nhất
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BulkOrderNotification;
