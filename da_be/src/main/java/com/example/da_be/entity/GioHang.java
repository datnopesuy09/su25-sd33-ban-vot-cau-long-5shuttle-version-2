package com.example.da_be.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.util.List;

@Entity
@Table(name = "GioHang")
public class GioHang {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "IdSanPhamCT")
    private SanPhamCT sanPhamCT;

    @ManyToOne
    @JoinColumn(name = "IdUser")
    private User taiKhoan;

    @Column(name = "SoLuong")
    private Integer soLuong;

    @Column(name = "NgayTao")
    private java.util.Date ngayTao;

    @Column(name = "NgaySua")
    private java.util.Date ngaySua;

    @Column(name = "preOrder")
private Boolean preOrder = false;

    // Constructors, Getters, and Setters
    public GioHang() {
    }

    public GioHang(Integer id, SanPhamCT sanPhamCT, User taiKhoan, Integer soLuong, java.util.Date ngayTao, java.util.Date ngaySua) {
        this.id = id;
        this.sanPhamCT = sanPhamCT;
        this.taiKhoan = taiKhoan;
        this.soLuong = soLuong;
        this.ngayTao = ngayTao;
        this.ngaySua = ngaySua;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public SanPhamCT getSanPhamCT() {
        return sanPhamCT;
    }

    public void setSanPhamCT(SanPhamCT sanPhamCT) {
        this.sanPhamCT = sanPhamCT;
    }

    public User getTaiKhoan() {
        return taiKhoan;
    }

    public void setTaiKhoan(User taiKhoan) {
        this.taiKhoan = taiKhoan;
    }

    public Integer getSoLuong() {
        return soLuong;
    }

    public void setSoLuong(Integer soLuong) {
        this.soLuong = soLuong;
    }

    public java.util.Date getNgayTao() {
        return ngayTao;
    }

    public void setNgayTao(java.util.Date ngayTao) {
        this.ngayTao = ngayTao;
    }

    public java.util.Date getNgaySua() {
        return ngaySua;
    }

    public void setNgaySua(java.util.Date ngaySua) {
        this.ngaySua = ngaySua;
    }

    public Boolean getPreOrder() {
    return preOrder;
}

public void setPreOrder(Boolean preOrder) {
    this.preOrder = preOrder;
}
}
