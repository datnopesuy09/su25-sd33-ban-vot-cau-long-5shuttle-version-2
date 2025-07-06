package com.example.da_be.entity;





import jakarta.persistence.*;

@Entity
@Table(name = "ThuongHieu")
public class ThuongHieu {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "Ten", nullable = false)
    private String ten;

    @Column(name = "TrangThai")
    private Integer trangThai;

    // Constructors
    public ThuongHieu() {
    }

    public ThuongHieu(String ten, Integer trangThai) {
        this.ten = ten;
        this.trangThai = trangThai;
    }

    // Getters & Setters
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
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
