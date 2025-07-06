package com.example.da_be.repository;

import java.math.BigDecimal;

public interface TopSellingProductProjection {
    String getTenSanPham(); // Tên sản phẩm
    Integer getSoLuongDaBan(); // Tổng số lượng đã bán
    BigDecimal getGiaTien(); // Tổng doanh thu từ sản phẩm đó (tùy chọn)

}
