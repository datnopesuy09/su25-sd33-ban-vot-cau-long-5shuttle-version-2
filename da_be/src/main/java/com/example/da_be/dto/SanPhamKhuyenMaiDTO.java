package com.example.da_be.dto;

import java.time.LocalDateTime;

public class SanPhamKhuyenMaiDTO {
    private Integer id;
    private Integer sanPhamCtId;
    private Integer khuyenMaiId;
    private String tenKhuyenMai;
    private Integer giaKhuyenMai;
    private LocalDateTime ngayBatDau;
    private LocalDateTime ngayKetThuc;

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Integer getSanPhamCtId() {
        return sanPhamCtId;
    }

    public void setSanPhamCtId(Integer sanPhamCtId) {
        this.sanPhamCtId = sanPhamCtId;
    }

    public Integer getKhuyenMaiId() {
        return khuyenMaiId;
    }

    public void setKhuyenMaiId(Integer khuyenMaiId) {
        this.khuyenMaiId = khuyenMaiId;
    }

    public String getTenKhuyenMai() {
        return tenKhuyenMai;
    }

    public void setTenKhuyenMai(String tenKhuyenMai) {
        this.tenKhuyenMai = tenKhuyenMai;
    }

    public Integer getGiaKhuyenMai() {
        return giaKhuyenMai;
    }

    public void setGiaKhuyenMai(Integer giaKhuyenMai) {
        this.giaKhuyenMai = giaKhuyenMai;
    }

    public LocalDateTime getNgayBatDau() {
        return ngayBatDau;
    }

    public void setNgayBatDau(LocalDateTime ngayBatDau) {
        this.ngayBatDau = ngayBatDau;
    }

    public LocalDateTime getNgayKetThuc() {
        return ngayKetThuc;
    }

    public void setNgayKetThuc(LocalDateTime ngayKetThuc) {
        this.ngayKetThuc = ngayKetThuc;
    }

    public SanPhamKhuyenMaiDTO() {
    }


}
