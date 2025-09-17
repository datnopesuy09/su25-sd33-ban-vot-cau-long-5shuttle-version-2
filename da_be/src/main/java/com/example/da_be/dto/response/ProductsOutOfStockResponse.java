package com.example.da_be.dto.response;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductsOutOfStockResponse {

    String tenSanPham;
    Integer soLuong;
    BigDecimal donGia;
    String hinhAnh;

}
