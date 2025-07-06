package com.example.da_be.entity;

import jakarta.persistence.*;
        import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "KhuyenMai")
public class KhuyenMai {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Id")
    private Integer id;

    @Column(name = "Ten")
    private String ten;

    @Column(name = "TG_BatDau")
    private LocalDateTime tgBatDau;

    @Column(name = "TG_KetThuc")
    private LocalDateTime tgKetThuc;

    @Column(name = "TrangThai")
    private Integer trangThai;

    @Column(name = "GiaTri")
    private Integer giaTri;

    @Column(name = "Loai")
    private Boolean loai;
}