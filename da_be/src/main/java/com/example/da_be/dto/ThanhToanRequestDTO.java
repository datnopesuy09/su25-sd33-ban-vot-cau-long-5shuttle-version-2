package com.example.da_be.dto;

import java.math.BigDecimal;

public class ThanhToanRequestDTO {
    private Integer idHoaDon;
    private BigDecimal tongTien;
    private BigDecimal khachThanhToan;
    private Integer idVoucher; // optional
    private String phuongThucThanhToan;

    // Getters and Setters
    public Integer getIdHoaDon() {
        return idHoaDon;
    }
    public void setIdHoaDon(Integer idHoaDon) {
        this.idHoaDon = idHoaDon;
    }
    public BigDecimal getTongTien() {
        return tongTien;
    }
    public void setTongTien(BigDecimal tongTien) {
        this.tongTien = tongTien;
    }
    public BigDecimal getKhachThanhToan() {
        return khachThanhToan;
    }
    public void setKhachThanhToan(BigDecimal khachThanhToan) {
        this.khachThanhToan = khachThanhToan;
    }
    public Integer getIdVoucher() {
        return idVoucher;
    }
    public void setIdVoucher(Integer idVoucher) {
        this.idVoucher = idVoucher;
    }
    public String getPhuongThucThanhToan() {
        return phuongThucThanhToan;
    }
    public void setPhuongThucThanhToan(String phuongThucThanhToan) {
        this.phuongThucThanhToan = phuongThucThanhToan;
    }
}
