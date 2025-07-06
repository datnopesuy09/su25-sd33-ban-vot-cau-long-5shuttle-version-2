package com.example.da_be.dto;


public class SanPhamCTListDTO {
    private Integer id;
    private String tenSanPham;
    private Double donGia;
    private String hinhAnhDaiDien;

    public SanPhamCTListDTO() {
    }

    public SanPhamCTListDTO(Integer id, String tenSanPham, Double donGia, String hinhAnhDaiDien) {
        this.id = id;
        this.tenSanPham = tenSanPham;
        this.donGia = donGia;
        this.hinhAnhDaiDien = hinhAnhDaiDien;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getTenSanPham() {
        return tenSanPham;
    }

    public void setTenSanPham(String tenSanPham) {
        this.tenSanPham = tenSanPham;
    }

    public Double getDonGia() {
        return donGia;
    }

    public void setDonGia(Double donGia) {
        this.donGia = donGia;
    }

    public String getHinhAnhDaiDien() {
        return hinhAnhDaiDien;
    }

    public void setHinhAnhDaiDien(String hinhAnhDaiDien) {
        this.hinhAnhDaiDien = hinhAnhDaiDien;
    }
}

