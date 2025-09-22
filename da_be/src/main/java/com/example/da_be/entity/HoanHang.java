package com.example.da_be.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "HoanHang")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class HoanHang {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ma_hoan_hang", unique = true, nullable = false, length = 50)
    private String maHoanHang;

    @Column(name = "hoa_don_id", nullable = false)
    private Long hoaDonId;

    @Column(name = "hoa_don_chi_tiet_id", nullable = false)
    private Long hoaDonChiTietId;

    @Column(name = "so_luong_hoan", nullable = false)
    private Integer soLuongHoan;

    @Column(name = "don_gia", nullable = false, precision = 10, scale = 2)
    private BigDecimal donGia;

    @Column(name = "thanh_tien", nullable = false, precision = 10, scale = 2)
    private BigDecimal thanhTien;

    @Column(name = "ly_do_hoan", columnDefinition = "TEXT")
    private String lyDoHoan;

    @Column(name = "ghi_chu", columnDefinition = "TEXT")
    private String ghiChu;

    @Column(name = "trang_thai", columnDefinition = "INT DEFAULT 1")
    private Integer trangThai = 1; // 1: Đã hoàn hàng (trực tiếp)

    @Column(name = "nguoi_tao", length = 100)
    private String nguoiTao;

    @Column(name = "ngay_tao", columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime ngayTao;

    @Column(name = "nguoi_cap_nhat", length = 100)
    private String nguoiCapNhat;

    @Column(name = "ngay_cap_nhat", columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP")
    private LocalDateTime ngayCapNhat;

    // Relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hoa_don_id", insertable = false, updatable = false)
    private HoaDon hoaDon;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hoa_don_chi_tiet_id", insertable = false, updatable = false)
    private HoaDonCT hoaDonChiTiet;

    @PrePersist
    protected void onCreate() {
        if (ngayTao == null) {
            ngayTao = LocalDateTime.now();
        }
        ngayCapNhat = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        ngayCapNhat = LocalDateTime.now();
    }

    // Constructor với các tham số chính
    public HoanHang(Long hoaDonId, Long hoaDonChiTietId, Integer soLuongHoan, 
                   BigDecimal donGia, BigDecimal thanhTien, String lyDoHoan, 
                   String ghiChu, String nguoiTao) {
        this.hoaDonId = hoaDonId;
        this.hoaDonChiTietId = hoaDonChiTietId;
        this.soLuongHoan = soLuongHoan;
        this.donGia = donGia;
        this.thanhTien = thanhTien;
        this.lyDoHoan = lyDoHoan;
        this.ghiChu = ghiChu;
        this.nguoiTao = nguoiTao;
        this.trangThai = 1;
    }
}