package com.example.da_be.entity;

import jakarta.persistence.*;
import java.util.Date;

@Entity
@Table(name = "LichSuDonHang")
public class LichSuDonHang {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "IdUser")
    private Integer idTaiKhoan;

    @Column(name = "IdHoaDon")
    private Integer idHoaDon;

    @Column(name = "MoTa")
    private String moTa;

    @Column(name = "NgayTao")
    @Temporal(TemporalType.TIMESTAMP)
    private Date ngayTao;

    @Column(name = "TrangThai")
    private Integer trangThai;

    public LichSuDonHang() {
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Integer getIdTaiKhoan() {
        return idTaiKhoan;
    }

    public void setIdTaiKhoan(Integer idTaiKhoan) {
        this.idTaiKhoan = idTaiKhoan;
    }

    public Integer getIdHoaDon() {
        return idHoaDon;
    }

    public void setIdHoaDon(Integer idHoaDon) {
        this.idHoaDon = idHoaDon;
    }

    public String getMoTa() {
        return moTa;
    }

    public void setMoTa(String moTa) {
        this.moTa = moTa;
    }

    public Date getNgayTao() {
        return ngayTao;
    }

    public void setNgayTao(Date ngayTao) {
        this.ngayTao = ngayTao;
    }

    public Integer getTrangThai() {
        return trangThai;
    }

    public void setTrangThai(Integer trangThai) {
        this.trangThai = trangThai;
    }
}
