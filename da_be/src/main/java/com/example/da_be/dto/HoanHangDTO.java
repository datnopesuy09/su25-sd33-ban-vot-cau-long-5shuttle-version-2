package com.example.da_be.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class HoanHangDTO {
    
    private Long id;
    private String maHoanHang;
    
    @NotNull(message = "Hóa đơn ID không được để trống")
    private Long hoaDonId;
    
    @NotNull(message = "Hóa đơn chi tiết ID không được để trống")
    private Long hoaDonChiTietId;
    
    @NotNull(message = "Số lượng hoàn không được để trống")
    @Positive(message = "Số lượng hoàn phải lớn hơn 0")
    private Integer soLuongHoan;
    
    @NotNull(message = "Đơn giá không được để trống")
    private BigDecimal donGia;
    
    private BigDecimal thanhTien;
    private String lyDoHoan;
    private String ghiChu;
    private Integer trangThai;
    private String nguoiTao;
    private LocalDateTime ngayTao;
    private String nguoiCapNhat;
    private LocalDateTime ngayCapNhat;
    
    // Thông tin sản phẩm (để hiển thị)
    private String tenSanPham;
    private String mauSac;
    private String trongLuong;
    private String hinhAnh;
    private Integer soLuongDaMua;
    private Integer soLuongDaHoan;
    private Integer soLuongCoTheHoan;
    
    // Constructor cho request tạo hoàn hàng
    public HoanHangDTO(Long hoaDonId, Long hoaDonChiTietId, Integer soLuongHoan, 
                      BigDecimal donGia, String lyDoHoan, String ghiChu, String nguoiTao) {
        this.hoaDonId = hoaDonId;
        this.hoaDonChiTietId = hoaDonChiTietId;
        this.soLuongHoan = soLuongHoan;
        this.donGia = donGia;
        this.thanhTien = donGia.multiply(BigDecimal.valueOf(soLuongHoan));
        this.lyDoHoan = lyDoHoan;
        this.ghiChu = ghiChu;
        this.nguoiTao = nguoiTao;
        this.trangThai = 1;
    }
}