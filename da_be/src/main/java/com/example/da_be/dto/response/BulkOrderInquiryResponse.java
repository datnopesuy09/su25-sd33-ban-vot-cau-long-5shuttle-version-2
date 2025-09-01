package com.example.da_be.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class BulkOrderInquiryResponse {
    public Long id;
    public String customerName;
    public String customerPhone;
    public String customerEmail;
    public String customerNote;
    public String contactMethod;
    public String status;
    public String assignedStaff;
    public Integer totalQuantity;
    public BigDecimal totalValue;
    public Integer itemCount;
    public LocalDateTime createdAt;
    public LocalDateTime updatedAt;
    public List<Note> notes;
    public Quotation quotation;
    public List<CartItem> cartItems; // danh sách sản phẩm trong giỏ (map từ JSON)
    public static class Note { public Long id; public String staffName; public String text; public LocalDateTime createdAt; }
    public static class Quotation { public Long id; public Integer discountPercent; public BigDecimal subTotal; public BigDecimal discountAmount; public BigDecimal total; }
    public static class CartItem {
        public String name; public Integer quantity; public BigDecimal price;
        public Long variantId; public Long productId; public String brand; public String color; public String weight; public String image;
    }
}
