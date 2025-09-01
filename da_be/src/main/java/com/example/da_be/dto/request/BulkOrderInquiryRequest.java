package com.example.da_be.dto.request;

import java.math.BigDecimal;
import java.util.List;

public class BulkOrderInquiryRequest {
    public CustomerInfo customerInfo;
    public OrderData orderData;
    public String contactMethod;
    public String status;

    public static class CustomerInfo {
        public String name;
        public String phone;
        public String email;
        public String note;
    }
    public static class OrderData {
        public Integer totalQuantity;
        public BigDecimal totalValue;
        public Integer itemCount;
        public List<CartItem> cartItems; // danh sách sản phẩm trong giỏ khi gửi yêu cầu
    }

    public static class CartItem {
        public String name; // tên hiển thị sản phẩm/biến thể
        public Integer quantity;
        public BigDecimal price; // đơn giá tại thời điểm gửi inquiry
    // Bổ sung thông tin chi tiết để admin xem
    public Long variantId;
    public Long productId;
    public String brand;
    public String color;
    public String weight;
    public String image;
    }
}
