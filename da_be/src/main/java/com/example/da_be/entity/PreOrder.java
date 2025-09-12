package com.example.da_be.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "PreOrder")
public class PreOrder {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "id_hoa_don", nullable = true)
    private HoaDon hoaDon;

    @ManyToOne
    @JoinColumn(name = "id_tai_khoan", nullable = true)
    private User taiKhoan;

    @ManyToOne
    @JoinColumn(name = "id_san_pham_ct")
    private SanPhamCT sanPhamCT;

    @Column(name = "so_luong")
    private Integer soLuong;

    @Column(name = "email")
    private String email;

    @Column(name = "phone")
    private String phone;

    @Column(name = "requested_quantity", nullable = false)
    private Integer requestedQuantity = 1;

    @Column(name = "trang_thai")
    private Integer trangThai;

    @Column(name = "ngay_tao")
    private LocalDateTime ngayTao;

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public HoaDon getHoaDon() {
        return hoaDon;
    }

    public void setHoaDon(HoaDon hoaDon) {
        this.hoaDon = hoaDon;
    }

    public User getTaiKhoan() {
        return taiKhoan;
    }

    public void setTaiKhoan(User taiKhoan) {
        this.taiKhoan = taiKhoan;
    }

    public SanPhamCT getSanPhamCT() {
        return sanPhamCT;
    }

    public void setSanPhamCT(SanPhamCT sanPhamCT) {
        this.sanPhamCT = sanPhamCT;
    }

    public Integer getSoLuong() {
        return soLuong;
    }

    public void setSoLuong(Integer soLuong) {
        this.soLuong = soLuong;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public Integer getRequestedQuantity() {
        return requestedQuantity;
    }

    public void setRequestedQuantity(Integer requestedQuantity) {
        this.requestedQuantity = requestedQuantity;
    }

    public Integer getTrangThai() {
        return trangThai;
    }

    public void setTrangThai(Integer trangThai) {
        this.trangThai = trangThai;
    }

    public LocalDateTime getNgayTao() {
        return ngayTao;
    }

    public void setNgayTao(LocalDateTime ngayTao) {
        this.ngayTao = ngayTao;
    }
}