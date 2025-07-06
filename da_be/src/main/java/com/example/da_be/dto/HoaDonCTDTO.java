package com.example.da_be.dto;

public class HoaDonCTDTO    {
    private Integer id;
    private SanPhamCTDTO sanPhamCT;
    private Integer soLuong;
    private String hinhAnhUrl;
    private Double GiaBan;

    public HoaDonCTDTO() {
    }

    public HoaDonCTDTO(Integer id, SanPhamCTDTO sanPhamCT, Integer soLuong, String hinhAnhUrl, Double giaBan) {
        this.id = id;
        this.sanPhamCT = sanPhamCT;
        this.soLuong = soLuong;
        this.hinhAnhUrl = hinhAnhUrl;
        GiaBan = giaBan;
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

    public Double getGiaBan() {
        return GiaBan;
    }

    public void setGiaBan(Double giaBan) {
        GiaBan = giaBan;
    }
}
