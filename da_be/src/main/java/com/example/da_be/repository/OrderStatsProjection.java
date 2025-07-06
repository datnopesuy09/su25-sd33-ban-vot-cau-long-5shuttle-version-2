package com.example.da_be.repository;

import java.math.BigDecimal;

public interface OrderStatsProjection {
    BigDecimal getTongTien();
    Integer getTongSanPham();
    Integer getTongDonThanhCong();
    Integer getTongDonHuy();
    Integer getTongDonTra();

}
