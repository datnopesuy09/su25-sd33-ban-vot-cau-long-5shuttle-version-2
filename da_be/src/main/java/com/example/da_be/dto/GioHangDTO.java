package com.example.da_be.dto;
public class GioHangDTO {
    private Integer id;
    private SanPhamCTDTO sanPhamCT;
    private Integer soLuong;
    private String hinhAnhUrl;
    // Constructors, Getters, and Setters


    public GioHangDTO() {
    }

    public GioHangDTO(Integer id, SanPhamCTDTO sanPhamCT, Integer soLuong, String hinhAnhUrl) {
        this.id = id;
        this.sanPhamCT = sanPhamCT;
        this.soLuong = soLuong;
        this.hinhAnhUrl = hinhAnhUrl;
    }


    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public SanPhamCTDTO getSanPhamCT() {
        return sanPhamCT;
    }

    public void setSanPhamCT(SanPhamCTDTO sanPhamCT) {
        this.sanPhamCT = sanPhamCT;
    }

    public Integer getSoLuong() {
        return soLuong;
    }

    public void setSoLuong(Integer soLuong) {
        this.soLuong = soLuong;
    }

    public String getHinhAnhUrl() {
        return hinhAnhUrl;
    }

    public void setHinhAnhUrl(String hinhAnhUrl) {
        this.hinhAnhUrl = hinhAnhUrl;
    }
}