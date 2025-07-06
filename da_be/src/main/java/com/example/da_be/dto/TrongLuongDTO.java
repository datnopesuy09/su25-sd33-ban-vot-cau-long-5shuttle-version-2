package com.example.da_be.dto;
public class TrongLuongDTO {
    private Integer id;
    private String ten;

    public TrongLuongDTO() {
    }

    public TrongLuongDTO(Integer id, String ten) {
        this.id = id;
        this.ten = ten;
    }

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
}
