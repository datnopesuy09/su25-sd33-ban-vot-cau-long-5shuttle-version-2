package com.example.da_be.dto.response;

import com.example.da_be.entity.HoaDonCT;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PhieuTraHangChiTietResponse {
    Integer id; // ID của chi tiết phiếu trả hàng

    String maPhieuTraHangChiTiet;

    Integer phieuTraHangId;

    SanPhamTraResponse thongTinSanPhamTra;

    Integer soLuongTra; // Số lượng sản phẩm đã trả

    Integer soLuongPheDuyet;

    Integer soLuongNhapKho;

    Integer soLuongHong;

    String ghiChuNhanVien;

    String lyDoTraHang;

}
