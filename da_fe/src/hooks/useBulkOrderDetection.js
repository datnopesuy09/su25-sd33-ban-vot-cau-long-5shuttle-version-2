import { useState, useEffect, useMemo } from 'react';

const useBulkOrderDetection = (cartItems = [], totalValue = 0) => {
    const [shouldShowBulkWarning, setShouldShowBulkWarning] = useState(false);
    const [bulkOrderData, setBulkOrderData] = useState({});

    // Cấu hình ngưỡng phát hiện bulk order
    const BULK_THRESHOLDS = {
        QUANTITY: 8, // Số lượng sản phẩm >= 8
        VALUE: 10000000, // Giá trị đơn hàng >= 10 triệu
        CATEGORIES: 3, // Số thương hiệu khác nhau >= 3
        EXPENSIVE_ITEM: 800000, // Có sản phẩm >= 800k
        TOTAL_ITEMS: 5, // Tổng số loại sản phẩm >= 5
    };

    // Tính toán các chỉ số của đơn hàng với useMemo để tránh re-calculation không cần thiết
    const orderMetrics = useMemo(() => {
        if (!cartItems.length) return null;

        const totalQuantity = cartItems.reduce((sum, item) => sum + (item.soLuong || 0), 0);
        const uniqueBrands = new Set(cartItems.map((item) => item.sanPhamCT?.thuongHieu?.id).filter(Boolean)).size;

        const maxItemPrice = Math.max(
            ...cartItems.map((item) => item.sanPhamCT?.giaKhuyenMai || item.sanPhamCT?.donGia || 0),
        );

        const itemCount = cartItems.length;

        return {
            totalQuantity,
            totalValue,
            uniqueBrands,
            maxItemPrice,
            itemCount,
            cartItems,
        };
    }, [cartItems, totalValue]);

    // Tính toán điều kiện bulk với useMemo
    const bulkCheck = useMemo(() => {
        if (!orderMetrics) return { isBulk: false, reasons: [] };

        const conditions = [
            {
                key: 'highQuantity',
                condition: orderMetrics.totalQuantity >= BULK_THRESHOLDS.QUANTITY,
                message: `Số lượng lớn: ${orderMetrics.totalQuantity} sản phẩm`,
                priority: 'high',
            },
            {
                key: 'highValue',
                condition: orderMetrics.totalValue >= BULK_THRESHOLDS.VALUE,
                message: `Giá trị cao: ${orderMetrics.totalValue.toLocaleString()}đ`,
                priority: 'high',
            },
            {
                key: 'multipleBrands',
                condition: orderMetrics.uniqueBrands >= BULK_THRESHOLDS.CATEGORIES,
                message: `Đa thương hiệu: ${orderMetrics.uniqueBrands} hãng`,
                priority: 'medium',
            },
            {
                key: 'expensiveItem',
                condition: orderMetrics.maxItemPrice >= BULK_THRESHOLDS.EXPENSIVE_ITEM,
                message: `Sản phẩm cao cấp: ${orderMetrics.maxItemPrice.toLocaleString()}đ`,
                priority: 'medium',
            },
            {
                key: 'manyItems',
                condition: orderMetrics.itemCount >= BULK_THRESHOLDS.TOTAL_ITEMS,
                message: `Nhiều loại: ${orderMetrics.itemCount} sản phẩm`,
                priority: 'low',
            },
        ];

        const triggeredConditions = conditions.filter((c) => c.condition);

        // Logic phát hiện bulk order
        const highPriorityCount = triggeredConditions.filter((c) => c.priority === 'high').length;
        const mediumPriorityCount = triggeredConditions.filter((c) => c.priority === 'medium').length;

        const isBulk =
            highPriorityCount >= 1 || // Có ít nhất 1 điều kiện high priority
            (mediumPriorityCount >= 2 && orderMetrics.itemCount >= 3) || // 2 medium + ít nhất 3 sản phẩm
            triggeredConditions.length >= 3; // Hoặc tổng cộng >= 3 điều kiện

        return {
            isBulk,
            reasons: triggeredConditions.map((c) => c.message),
            conditions: triggeredConditions,
            metrics: orderMetrics,
        };
    }, [orderMetrics]);

    // Tính toán khuyến mãi có thể áp dụng với useMemo
    const potentialDiscount = useMemo(() => {
        if (!orderMetrics) return 0;

        let discountPercent = 0;

        if (orderMetrics.totalValue >= 10000000) {
            discountPercent = 15; // 15% cho đơn >= 10 triệu
        } else if (orderMetrics.totalValue >= 5000000) {
            discountPercent = 10; // 10% cho đơn >= 5 triệu
        } else if (orderMetrics.totalQuantity >= 15) {
            discountPercent = 8; // 8% cho số lượng >= 15
        } else if (orderMetrics.totalQuantity >= 10) {
            discountPercent = 5; // 5% cho số lượng >= 10
        }

        return Math.min(discountPercent, 15); // Tối đa 15%
    }, [orderMetrics]);

    // Hook logic - chỉ update khi bulkCheck thay đổi
    useEffect(() => {
        if (bulkCheck.isBulk) {
            const potentialSavings = orderMetrics ? (orderMetrics.totalValue * potentialDiscount) / 100 : 0;

            setBulkOrderData({
                ...orderMetrics,
                reasons: bulkCheck.reasons,
                conditions: bulkCheck.conditions,
                potentialDiscount,
                potentialSavings,
                thresholds: BULK_THRESHOLDS,
            });

            setShouldShowBulkWarning(true);
        } else {
            setShouldShowBulkWarning(false);
            setBulkOrderData({});
        }
    }, [bulkCheck.isBulk, bulkCheck.reasons, bulkCheck.conditions, orderMetrics, potentialDiscount]);

    // Các hàm utility
    const getBulkOrderBenefits = () => [
        {
            title: 'Tư vấn chuyên sâu',
            description: 'Chuyên viên tư vấn sản phẩm phù hợp nhất',
            icon: '👨‍💼',
        },
        {
            title: 'Giá ưu đãi đặc biệt',
            description: `Giảm giá lên đến ${bulkOrderData.potentialDiscount || 15}%`,
            icon: '💰',
        },
        {
            title: 'Dịch vụ VIP',
            description: 'Ưu tiên xử lý và giao hàng',
            icon: '⭐',
        },
        {
            title: 'Hỗ trợ sau bán',
            description: 'Chăm sóc khách hàng chuyên biệt',
            icon: '🛠️',
        },
    ];

    const getStaffContactInfo = () => ({
        name: 'Chuyên viên tư vấn 5Shuttle',
        phone: '0347111832',
        email: 'phamhungg2709@gmail.com',
        zalo: '0347111832',
        address: 'Cửa hàng 5Shuttle - Địa chỉ cửa hàng',
    });

    const resetBulkWarning = () => {
        setShouldShowBulkWarning(false);
    };

    const forceTriggerBulkWarning = () => {
        setShouldShowBulkWarning(true);
    };

    return {
        shouldShowBulkWarning,
        bulkOrderData,
        getBulkOrderBenefits,
        getStaffContactInfo,
        resetBulkWarning,
        forceTriggerBulkWarning,
        thresholds: BULK_THRESHOLDS,
    };
};

export default useBulkOrderDetection;
