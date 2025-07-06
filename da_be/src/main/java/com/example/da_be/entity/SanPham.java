package com.example.da_be.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "SanPham")
public class SanPham {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "Ma", nullable = false, unique = true)
    private String ma;

    @Column(name = "Ten", nullable = false)
    private String ten;

    @Column(name = "trangThai")
    private Integer trangThai;

    // Constructors
    public SanPham() {
    }

    public SanPham(String ma, String ten, Integer trangThai) {
        this.ma = ma;
        this.ten = ten;
        this.trangThai = trangThai;
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

    public String getTen() {
        return ten;
    }

    public void setTen(String ten) {
        this.ten = ten;
    }

    public Integer getTrangThai() {
        return trangThai;
    }

    public void setTrangThai(Integer trangThai) {
        this.trangThai = trangThai;
    }
}
