package com.example.da_be.dto;

public class ReturnRequest {
    private Integer hoaDonCTId;
    private Integer soLuong;
    private String lyDo;

    // Getters and Setters
    public Integer getHoaDonCTId() {
        return hoaDonCTId;
    }

    public void setHoaDonCTId(Integer hoaDonCTId) {
        this.hoaDonCTId = hoaDonCTId;
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
}
