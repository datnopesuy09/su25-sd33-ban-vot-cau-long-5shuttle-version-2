package com.example.da_be.dto;


import java.time.LocalDateTime;

public class TraHangDTO {
    private Integer id;
    private HoaDonCTDTO hoaDonCT;
    private Integer soLuong;
    private String lyDo;
    private LocalDateTime ngayTao;
    private Integer trangThai;

    public TraHangDTO() {
    }

    public TraHangDTO(Integer id, HoaDonCTDTO hoaDonCT, Integer soLuong, String lyDo, LocalDateTime ngayTao, Integer trangThai) {
        this.id = id;
        this.hoaDonCT = hoaDonCT;
        this.soLuong = soLuong;
        this.lyDo = lyDo;
        this.ngayTao = ngayTao;
        this.trangThai = trangThai;
    }

    // Getters and setters
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public HoaDonCTDTO getHoaDonCT() {
        return hoaDonCT;
    }

    public void setHoaDonCT(HoaDonCTDTO hoaDonCT) {
        this.hoaDonCT = hoaDonCT;
    }

    public Integer getSoLuong() {
        return soLuong;
    }

    public void setSoLuong(Integer soLuong) {
        this.soLuong = soLuong;
    }

    public String getLyDo() {
        return lyDo;
    }

    public void setLyDo(String lyDo) {
        this.lyDo = lyDo;
    }

    public LocalDateTime getNgayTao() {
        return ngayTao;
    }

    public void setNgayTao(LocalDateTime ngayTao) {
        this.ngayTao = ngayTao;
    }

    public Integer getTrangThai() {
        return trangThai;
    }

    public void setTrangThai(Integer trangThai) {
        this.trangThai = trangThai;
    }
}
