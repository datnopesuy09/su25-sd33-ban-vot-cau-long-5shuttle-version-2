package com.example.da_be.entity;


import jakarta.persistence.*;

@Entity
@Table(name = "HinhAnh")
public class HinhAnh {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "IdSanPhamCT", referencedColumnName = "Id")
    private SanPhamCT sanPhamCT;

    @Column(name = "Link", nullable = false)
    private String link;

    @Column(name = "TrangThai")
    private Integer trangThai;

    public HinhAnh() {
    }

    public HinhAnh(Integer id, SanPhamCT sanPhamCT, String link, Integer trangThai) {
        this.id = id;
        this.sanPhamCT = sanPhamCT;
        this.link = link;
        this.trangThai = trangThai;
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

    public String getLink() {
        return link;
    }

    public void setLink(String link) {
        this.link = link;
    }

    public Integer getTrangThai() {
        return trangThai;
    }

    public void setTrangThai(Integer trangThai) {
        this.trangThai = trangThai;
    }
}
