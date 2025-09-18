package com.example.da_be.repository;

import java.math.BigDecimal;

public interface OrderStatsProjection {
    BigDecimal getTongTien();
    Long getTongSanPham();
    Long getTongSanPhamTra();
    Long getTongDonThanhCong();
    Long getTongDonHuy();
    Long getTongDonTra();

}
