package com.example.da_be.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "ThongBao")
public class ThongBao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "IdKhachHang", nullable = false)
    private User khachHang;

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

    public ThongBao() {
    }

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
}
