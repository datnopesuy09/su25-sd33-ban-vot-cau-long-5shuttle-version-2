package com.example.da_be.dto;

public class AddProductToBillRequest {

    private Integer idHoaDon;
    private Integer idSanPhamCT;
    private Integer soLuong;

    // Getters and setters
    public Integer getIdHoaDon() {
        return idHoaDon;
    }

    public void setIdHoaDon(Integer idHoaDon) {
        this.idHoaDon = idHoaDon;
    }

    public Integer getIdSanPhamCT() {
        return idSanPhamCT;
    }

    public void setIdSanPhamCT(Integer idSanPhamCT) {
        this.idSanPhamCT = idSanPhamCT;
    }

    public Integer getSoLuong() {
        return soLuong;
    }

    public void setSoLuong(Integer soLuong) {
        this.soLuong = soLuong;
    }
}
