package com.example.da_be.dto.response;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@Builder

public class TopSellingProductResponse {
    private String tenSanPham;
    private Integer soLuongDaBan;
    private BigDecimal giaTien;


}
