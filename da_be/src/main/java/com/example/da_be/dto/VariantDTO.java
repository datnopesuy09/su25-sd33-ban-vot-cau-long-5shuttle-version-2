package com.example.da_be.dto;

import java.util.List;

public class VariantDTO {
    private Integer id;
    private String maSanPham;
    private String mauSacTen;
    private String trongLuongTen;
    private Integer mauSacId;
    private Integer trongLuongId;
    private Double donGia;
    private Integer soLuong;
    private List<String> hinhAnhUrls;
    private Double giaKhuyenMai;
    private Integer giaTriKhuyenMai;
    private Integer trangThai;

    // Getters and Setters

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getMaSanPham() {
        return maSanPham;
    }

    public void setMaSanPham(String maSanPham) {
        this.maSanPham = maSanPham;
    }

    public String getMauSacTen() {
        return mauSacTen;
    }

    public void setMauSacTen(String mauSacTen) {
        this.mauSacTen = mauSacTen;
    }

    public String getTrongLuongTen() {
        return trongLuongTen;
    }

    public void setTrongLuongTen(String trongLuongTen) {
        this.trongLuongTen = trongLuongTen;
    }

    public Integer getMauSacId() {
        return mauSacId;
    }

    public void setMauSacId(Integer mauSacId) {
        this.mauSacId = mauSacId;
    }

    public Integer getTrongLuongId() {
        return trongLuongId;
    }

    public void setTrongLuongId(Integer trongLuongId) {
        this.trongLuongId = trongLuongId;
    }

    public Double getDonGia() {
        return donGia;
    }

    public void setDonGia(Double donGia) {
        this.donGia = donGia;
    }

    public Integer getSoLuong() {
        return soLuong;
    }

    public void setSoLuong(Integer soLuong) {
        this.soLuong = soLuong;
    }

    public List<String> getHinhAnhUrls() {
        return hinhAnhUrls;
    }

    public void setHinhAnhUrls(List<String> hinhAnhUrls) {
        this.hinhAnhUrls = hinhAnhUrls;
    }

    public Double getGiaKhuyenMai() {
        return giaKhuyenMai;
    }

    public void setGiaKhuyenMai(Double giaKhuyenMai) {
        this.giaKhuyenMai = giaKhuyenMai;
    }

    public Integer getGiaTriKhuyenMai() {
        return giaTriKhuyenMai;
    }

    public void setGiaTriKhuyenMai(Integer giaTriKhuyenMai) {
        this.giaTriKhuyenMai = giaTriKhuyenMai;
    }

    public Integer getTrangThai() {
        return trangThai;
    }

    public void setTrangThai(Integer trangThai) {
        this.trangThai = trangThai;
    }
}
