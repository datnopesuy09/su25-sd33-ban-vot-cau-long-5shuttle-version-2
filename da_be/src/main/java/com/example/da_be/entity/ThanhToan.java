package com.example.da_be.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.Date;

@Entity
@Table(name = "ThanhToan")
public class ThanhToan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "IdUser")
    private User taiKhoan;

    @ManyToOne
    @JoinColumn(name = "IdHoaDon")
    private HoaDon hoaDon;

    @Column(name = "Ma")
    private String ma;

    @Column(name = "TongTien")
    private BigDecimal tongTien;

    @Column(name = "NgayTao")
    private Date ngayTao;

    @Column(name = "PhuongThucThanhToan")
    private String phuongThucThanhToan;

    @Column(name = "TrangThai")
    private Integer trangThai;

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public User getTaiKhoan() {
        return taiKhoan;
    }

    public void setTaiKhoan(User taiKhoan) {
        this.taiKhoan = taiKhoan;
    }

    public HoaDon getHoaDon() {
        return hoaDon;
    }

    public void setHoaDon(HoaDon hoaDon) {
        this.hoaDon = hoaDon;
    }

    public String getMa() {
        return ma;
    }

    public void setMa(String ma) {
        this.ma = ma;
    }

    public BigDecimal getTongTien() {
        return tongTien;
    }

    public void setTongTien(BigDecimal tongTien) {
        this.tongTien = tongTien;
    }

    public Date getNgayTao() {
        return ngayTao;
    }

    public void setNgayTao(Date ngayTao) {
        this.ngayTao = ngayTao;
    }

    public String getPhuongThucThanhToan() {
        return phuongThucThanhToan;
    }

    public void setPhuongThucThanhToan(String phuongThucThanhToan) {
        this.phuongThucThanhToan = phuongThucThanhToan;
    }

    public Integer getTrangThai() {
        return trangThai;
    }

    public void setTrangThai(Integer trangThai) {
        this.trangThai = trangThai;
    }
}
