package com.example.da_be.dto;


import java.util.List;

public class SanPhamCTDetailDTO {
    private Integer id;
    private String tenSanPham;
    private String moTa;
    private List<String> hinhAnhUrls;
    private Double donGia;
    private Integer soLuong;
    private String thuongHieu;
    private List<String> mauSac;
    private List<String> trongLuong;
    private String chatLieu;
    private String diemCanBang;
    private String doCung;
    private List<VariantDTO> variants;

    // Getters and Setters

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

    public String getMoTa() {
        return moTa;
    }

    public void setMoTa(String moTa) {
        this.moTa = moTa;
    }

    public List<String> getHinhAnhUrls() {
        return hinhAnhUrls;
    }

    public void setHinhAnhUrls(List<String> hinhAnhUrls) {
        this.hinhAnhUrls = hinhAnhUrls;
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

    public String getThuongHieu() {
        return thuongHieu;
    }

    public void setThuongHieu(String thuongHieu) {
        this.thuongHieu = thuongHieu;
    }

    public List<String> getMauSac() {
        return mauSac;
    }

    public void setMauSac(List<String> mauSac) {
        this.mauSac = mauSac;
    }

    public List<String> getTrongLuong() {
        return trongLuong;
    }

    public void setTrongLuong(List<String> trongLuong) {
        this.trongLuong = trongLuong;
    }

    public String getChatLieu() {
        return chatLieu;
    }

    public void setChatLieu(String chatLieu) {
        this.chatLieu = chatLieu;
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

    public List<VariantDTO> getVariants() {
        return variants;
    }

    public void setVariants(List<VariantDTO> variants) {
        this.variants = variants;
    }
}

