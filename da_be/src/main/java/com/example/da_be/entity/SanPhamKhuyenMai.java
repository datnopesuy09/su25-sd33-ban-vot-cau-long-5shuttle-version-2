package com.example.da_be.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Entity
    @Table(name = "SanPham_KhuyenMai")
    public class SanPhamKhuyenMai {
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Integer id;

        @ManyToOne
        @JoinColumn(name = "IdSanPhamCT", referencedColumnName = "Id")
        private SanPhamCT sanPhamCT;

        @ManyToOne
        @JoinColumn(name = "IdKhuyenMai", referencedColumnName = "Id")
        private KhuyenMai khuyenMai;

        @Column(name = "GiaKhuyenMai")
        private Integer giaKhuyenMai;
    }

