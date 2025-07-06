package com.example.da_be.dto;

public class SanPhamCTListDTOo {
    private Integer id;
    private String tenSanPham;
    private Double donGia;
    private String hinhAnhDaiDien;
    private Double giaKhuyenMai; // Thêm thuộc tính giaKhuyenMai
    private Integer giaTri; // Thêm thuộc tính giaTri

    public SanPhamCTListDTOo() {
    }

    public SanPhamCTListDTOo(Integer id, String tenSanPham, Double donGia, String hinhAnhDaiDien, Double giaKhuyenMai, Integer giaTri) {
        this.id = id;
        this.tenSanPham = tenSanPham;
        this.donGia = donGia;
        this.hinhAnhDaiDien = hinhAnhDaiDien;
        this.giaKhuyenMai = giaKhuyenMai;
        this.giaTri = giaTri;
    }

    // Getter và Setter cho các thuộc tính mới
    public Double getGiaKhuyenMai() {
        return giaKhuyenMai;
    }

    public void setGiaKhuyenMai(Double giaKhuyenMai) {
        this.giaKhuyenMai = giaKhuyenMai;
    }

    public Integer getGiaTri() {
        return giaTri;
    }

    public void setGiaTri(Integer giaTri) {
        this.giaTri = giaTri;
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
