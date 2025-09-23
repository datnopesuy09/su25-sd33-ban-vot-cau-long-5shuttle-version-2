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

    // Giá gốc của sản phẩm (tại thời điểm mua) – lưu kèm để hiển thị gạch ngang
    java.math.BigDecimal donGiaGoc;

    // Số tiền thực tế hoàn trả cho dòng này (ưu tiên hiển thị nếu có)
    java.math.BigDecimal soTienHoanTra;

    // Tỷ lệ giảm giá (0..1) được áp cho dòng này từ voucher – hỗ trợ ước tính đơn giá hoàn
    java.math.BigDecimal tyLeGiamGia;

}
