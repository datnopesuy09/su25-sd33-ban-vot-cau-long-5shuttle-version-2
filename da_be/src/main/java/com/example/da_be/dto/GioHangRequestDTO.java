package com.example.da_be.dto;

public class GioHangRequestDTO {
    private Integer idTaiKhoan;
    private Integer idSanPhamCT;
    private Integer soLuong;

    // Constructors
    public GioHangRequestDTO() {
    }

    public GioHangRequestDTO(Integer idTaiKhoan, Integer idSanPhamCT, Integer soLuong) {
        this.idTaiKhoan = idTaiKhoan;
        this.idSanPhamCT = idSanPhamCT;
        this.soLuong = soLuong;
    }

    // Getters and Setters
    public Integer getIdTaiKhoan() {
        return idTaiKhoan;
    }

    public void setIdTaiKhoan(Integer idTaiKhoan) {
        this.idTaiKhoan = idTaiKhoan;
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