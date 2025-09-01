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
    }
}
