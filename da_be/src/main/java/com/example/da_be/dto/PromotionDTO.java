package com.example.da_be.dto;

public class PromotionDTO {
    private Integer giaKhuyenMai;
    private Integer giaTri;
    private Boolean loaiKhuyenMai;

    // Constructors, getters và setters
    public PromotionDTO() {}

    public PromotionDTO(Integer giaKhuyenMai, Integer giaTri, Boolean loaiKhuyenMai) {
        this.giaKhuyenMai = giaKhuyenMai;
        this.giaTri = giaTri;
        this.loaiKhuyenMai = loaiKhuyenMai;
    }

    // Getters và setters
    public Integer getGiaKhuyenMai() {
        return giaKhuyenMai;
    }

    public void setGiaKhuyenMai(Integer giaKhuyenMai) {
        this.giaKhuyenMai = giaKhuyenMai;
    }

    public Integer getGiaTri() {
        return giaTri;
    }

    public void setGiaTri(Integer giaTri) {
        this.giaTri = giaTri;
    }

    public Boolean getLoaiKhuyenMai() {
        return loaiKhuyenMai;
    }

    public void setLoaiKhuyenMai(Boolean loaiKhuyenMai) {
        this.loaiKhuyenMai = loaiKhuyenMai;
    }
}
