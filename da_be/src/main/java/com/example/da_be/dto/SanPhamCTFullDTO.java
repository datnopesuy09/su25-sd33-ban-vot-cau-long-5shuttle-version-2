package com.example.da_be.dto;

public class SanPhamCTFullDTO {
    private Integer id;
    private String ma;
    private String moTa;
    private Integer soLuong;
    private Double donGia;
    private Integer trangThai;

    private String tenSanPham;
    private String thuongHieu;
    private String mauSac;
    private String chatLieu;
    private String trongLuong;
    private String diemCanBang;
    private String doCung;

    private String anhDaiDien;

    public SanPhamCTFullDTO() {
    }

    public SanPhamCTFullDTO(Integer id, String ma, String moTa, Integer soLuong, Double donGia, Integer trangThai,
                            String tenSanPham, String thuongHieu, String mauSac, String chatLieu, String trongLuong,
                            String diemCanBang, String doCung, String anhDaiDien) {
        this.id = id;
        this.ma = ma;
        this.moTa = moTa;
        this.soLuong = soLuong;
        this.donGia = donGia;
        this.trangThai = trangThai;
        this.tenSanPham = tenSanPham;
        this.thuongHieu = thuongHieu;
        this.mauSac = mauSac;
        this.chatLieu = chatLieu;
        this.trongLuong = trongLuong;
        this.diemCanBang = diemCanBang;
        this.doCung = doCung;
        this.anhDaiDien = anhDaiDien;
    }

    // Getters and Setters

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getMa() {
        return ma;
    }

    public void setMa(String ma) {
        this.ma = ma;
    }

    public String getMoTa() {
        return moTa;
    }

    public void setMoTa(String moTa) {
        this.moTa = moTa;
    }

    public Integer getSoLuong() {
        return soLuong;
    }

    public void setSoLuong(Integer soLuong) {
        this.soLuong = soLuong;
    }

    public Double getDonGia() {
        return donGia;
    }

    public void setDonGia(Double donGia) {
        this.donGia = donGia;
    }

    public Integer getTrangThai() {
        return trangThai;
    }

    public void setTrangThai(Integer trangThai) {
        this.trangThai = trangThai;
    }

    public String getTenSanPham() {
        return tenSanPham;
    }

    public void setTenSanPham(String tenSanPham) {
        this.tenSanPham = tenSanPham;
    }

    public String getThuongHieu() {
        return thuongHieu;
    }

    public void setThuongHieu(String thuongHieu) {
        this.thuongHieu = thuongHieu;
    }

    public String getMauSac() {
        return mauSac;
    }

    public void setMauSac(String mauSac) {
        this.mauSac = mauSac;
    }

    public String getChatLieu() {
        return chatLieu;
    }

    public void setChatLieu(String chatLieu) {
        this.chatLieu = chatLieu;
    }

    public String getTrongLuong() {
        return trongLuong;
    }

    public void setTrongLuong(String trongLuong) {
        this.trongLuong = trongLuong;
    }

    public String getDiemCanBang() {
        return diemCanBang;
    }

    public void setDiemCanBang(String diemCanBang) {
        this.diemCanBang = diemCanBang;
    }

    public String getDoCung() {
        return doCung;
    }

    public void setDoCung(String doCung) {
        this.doCung = doCung;
    }

    public String getAnhDaiDien() {
        return anhDaiDien;
    }

    public void setAnhDaiDien(String anhDaiDien) {
        this.anhDaiDien = anhDaiDien;
    }
}

