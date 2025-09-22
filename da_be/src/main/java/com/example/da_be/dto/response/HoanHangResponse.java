package com.example.da_be.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class HoanHangResponse {
    
    private Long id;
    private String maHoanHang;
    private Long hoaDonId;
    private Long hoaDonChiTietId;
    private Integer soLuongHoan;
    private BigDecimal donGia;
    private BigDecimal thanhTien;
    private String lyDoHoan;
    private String ghiChu;
    private Integer trangThai;
    private String nguoiTao;
    private LocalDateTime ngayTao;
    
    // Thông tin sản phẩm
    private String tenSanPham;
    private String mauSac;
    private String trongLuong;
    private String hinhAnh;
    
    // Thông tin cập nhật đơn hàng
    private BigDecimal tongTienMoi;
    private BigDecimal tongTienHoanHang;
    private Integer soLuongConLai;
    
    // Constructor cho response thành công
    public HoanHangResponse(Long id, String maHoanHang, BigDecimal thanhTien, 
                           BigDecimal tongTienMoi, BigDecimal tongTienHoanHang) {
        this.id = id;
        this.maHoanHang = maHoanHang;
        this.thanhTien = thanhTien;
        this.tongTienMoi = tongTienMoi;
        this.tongTienHoanHang = tongTienHoanHang;
    }
}