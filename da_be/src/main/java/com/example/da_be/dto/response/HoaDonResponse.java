package com.example.da_be.dto.response;

import com.example.da_be.entity.PhieuGiamGia;
import com.example.da_be.entity.User;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.util.Date;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class HoaDonResponse {
     Integer id;
     Integer taiKhoanId;
     PhieuGiamGia voucher;
     String ma;
     Integer soLuong;
     String loaiHoaDon;
     String phuongThucThanhToan;
     String tenNguoiNhan;
     String sdtNguoiNhan;
     String emailNguoiNhan;
     String diaChiNguoiNhan;
     BigDecimal phiShip;
     BigDecimal tongTien;
     Integer trangThai;
}
