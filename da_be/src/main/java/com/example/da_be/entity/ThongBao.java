package com.example.da_be.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "ThongBao")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class ThongBao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "IdKhachHang", nullable = true)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private User khachHang;

    @Column(name = "Email")
    private String email;

    @Column(name = "TieuDe", length = 255)
    private String tieuDe;

    @Column(name = "NoiDung", length = 255)
    private String noiDung;

    @Column(name = "IdRedirect", length = 255)
    private String idRedirect;

    @Column(name = "KieuThongBao", length = 255)
    private String kieuThongBao;

    @Column(name = "TrangThai")
    private Integer trangThai;

    @Column(name = "CreatedAt")
    private LocalDateTime createdAt;

    @Column(name = "UpdatedAt")
    private LocalDateTime updatedAt;

    // Constructors
    public ThongBao() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.trangThai = 0; // Default: chưa đọc
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public User getKhachHang() {
        return khachHang;
    }

    public void setKhachHang(User khachHang) {
        this.khachHang = khachHang;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getTieuDe() {
        return tieuDe;
    }

    public void setTieuDe(String tieuDe) {
        this.tieuDe = tieuDe;
    }

    public String getNoiDung() {
        return noiDung;
    }

    public void setNoiDung(String noiDung) {
        this.noiDung = noiDung;
    }

    public String getIdRedirect() {
        return idRedirect;
    }

    public void setIdRedirect(String idRedirect) {
        this.idRedirect = idRedirect;
    }

    public String getKieuThongBao() {
        return kieuThongBao;
    }

    public void setKieuThongBao(String kieuThongBao) {
        this.kieuThongBao = kieuThongBao;
    }

    public Integer getTrangThai() {
        return trangThai;
    }

    public void setTrangThai(Integer trangThai) {
        this.trangThai = trangThai;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}