package com.example.da_be.dto.request;

import java.math.BigDecimal;

public class CreateQuotationRequest {
    public Integer discountPercent;
    public BigDecimal subTotal;
    public BigDecimal discountAmount;
    public BigDecimal total;
}
