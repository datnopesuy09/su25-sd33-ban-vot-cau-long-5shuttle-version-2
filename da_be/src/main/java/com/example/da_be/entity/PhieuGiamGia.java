package com.example.da_be.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "PhieuGiamGia")
public class PhieuGiamGia {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Id")
    private Integer id;

    @Column(name = "Ma")
    private String ma;

    @Column(name = "Ten")
    private String ten;

    @Column(name = "GiaTri")
    private Integer giaTri;

    @Column(name = "GiaTriMax")
    private Integer giaTriMax;

    @Column(name = "KieuGiaTri")
    private Integer kieuGiaTri;

    @Column(name = "SoLuong")
    private Integer soLuong;

    @Column(name = "DieuKienNhoNhat")
    private Integer dieuKienNhoNhat;

    @Column(name = "NgayBatDau")
    private LocalDateTime ngayBatDau;

    @Column(name = "NgayKetThuc")
    private LocalDateTime ngayKetThuc;

    @Column(name = "TrangThai")
    private Integer trangThai;
}
