package com.example.da_be.dto;
public class SanPhamCTDTO {
    private Integer id;
    private String ten;
    private Double donGia;
    private Integer soLuong;
    private ThuongHieuDTO thuongHieu;
    private MauSacDTO mauSac;
    private TrongLuongDTO trongLuong;

    private Integer giaKhuyenMai; // Thêm thuộc tính này
    private Integer giaTriKhuyenMai; // Thêm thuộc tính này
    // Các trường khác của SanPhamCT


    public SanPhamCTDTO() {
    }


    public SanPhamCTDTO(Integer id, String ten, Double donGia, Integer soLuong, ThuongHieuDTO thuongHieu, MauSacDTO mauSac, TrongLuongDTO trongLuong, Integer giaKhuyenMai, Integer giaTriKhuyenMai) {
        this.id = id;
        this.ten = ten;
        this.donGia = donGia;
        this.soLuong = soLuong;
        this.thuongHieu = thuongHieu;
        this.mauSac = mauSac;
        this.trongLuong = trongLuong;

        this.giaKhuyenMai = giaKhuyenMai;
        this.giaTriKhuyenMai = giaTriKhuyenMai;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getTen() {
        return ten;
    }

    public void setTen(String ten) {
        this.ten = ten;
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

    public ThuongHieuDTO getThuongHieu() {
        return thuongHieu;
    }

    public void setThuongHieu(ThuongHieuDTO thuongHieu) {
        this.thuongHieu = thuongHieu;
    }

    public MauSacDTO getMauSac() {
        return mauSac;
    }

    public void setMauSac(MauSacDTO mauSac) {
        this.mauSac = mauSac;
    }

    public TrongLuongDTO getTrongLuong() {
        return trongLuong;
    }

    public void setTrongLuong(TrongLuongDTO trongLuong) {
        this.trongLuong = trongLuong;
    }

    public Integer getGiaKhuyenMai() {
        return giaKhuyenMai;
    }

    public void setGiaKhuyenMai(Integer giaKhuyenMai) {
        this.giaKhuyenMai = giaKhuyenMai;
    }

    public Integer getGiaTriKhuyenMai() {
        return giaTriKhuyenMai;
    }

    public void setGiaTriKhuyenMai(Integer giaTriKhuyenMai) {
        this.giaTriKhuyenMai = giaTriKhuyenMai;
    }

}