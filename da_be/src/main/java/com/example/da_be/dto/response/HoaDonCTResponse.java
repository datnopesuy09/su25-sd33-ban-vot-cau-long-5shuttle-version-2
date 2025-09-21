package com.example.da_be.dto.response;

import com.example.da_be.entity.HoaDon;
import com.example.da_be.entity.PhieuGiamGia;
import com.example.da_be.entity.SanPhamCT;
import com.example.da_be.entity.User;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.util.Date;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class HoaDonCTResponse {

    Integer id;

    String hinhAnhUrl;

    SanPhamCT sanPhamCT;

    HoaDon hoaDon;

    Integer soLuong;

    BigDecimal giaBan;

    Integer trangThai;

    boolean trangThaiTraHang;

    public String getHinhAnhUrl() {
        return hinhAnhUrl;
    }

    public void setHinhAnhUrl(String hinhAnhUrl) {
        this.hinhAnhUrl = hinhAnhUrl;
    }
}
