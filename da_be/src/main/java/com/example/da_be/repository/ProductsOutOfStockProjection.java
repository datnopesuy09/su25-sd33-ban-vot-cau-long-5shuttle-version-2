package com.example.da_be.repository;

import com.example.da_be.entity.HinhAnh;

import java.math.BigDecimal;

public interface ProductsOutOfStockProjection {

    String getTenSanPham();
    Integer getSoLuong();
    BigDecimal getDonGia();
    String getHinhAnh();
}
