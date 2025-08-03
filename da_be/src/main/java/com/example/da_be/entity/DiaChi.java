package com.example.da_be.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Table(name = "DiaChi")

public class DiaChi {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "Ten")
    private String ten;

    @Column(name = "Sdt")
    private String sdt;

    @Column(name = "Tinh")
    private String tinh;

    @Column(name = "Huyen")
    private String huyen;

    @Column(name = "Xa")
    private String xa;

    @Column(name = "DiaChiCuThe")
    private String diaChiCuThe;

    @Column(name = "LoaiDiaChi")
    private Integer loai;

    @ManyToOne
    @JoinColumn(name = "IdUser")
    @JsonBackReference
    private User taiKhoan;
}
