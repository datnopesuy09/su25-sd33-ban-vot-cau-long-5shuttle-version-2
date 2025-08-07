package com.example.da_be.dto.response;

import com.example.da_be.entity.HoaDon;
import com.example.da_be.entity.User;
import com.example.da_be.enums.TrangThaiTra;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PhieuTraHangResponse {
    Integer id; // ID duy nhất của phiếu trả hàng

    String maPhieuTraHang;

    Integer userId; // ID của người dùng đã tạo phiếu

    String hoTenKhachHang;

    String emailKhachHang;

    Integer sdtKhachHang;

    String diaChiKhachHang;

    String hoaDonMa;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    LocalDateTime ngayTao; // Thời gian tạo phiếu

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    LocalDateTime ngayXuLy;

    String hinhThucTra;

    String ghiChuKhachHang;

    TrangThaiTra trangThai;

    String staffEmail;

    List<PhieuTraHangChiTietResponse> chiTietTraHang;

}
