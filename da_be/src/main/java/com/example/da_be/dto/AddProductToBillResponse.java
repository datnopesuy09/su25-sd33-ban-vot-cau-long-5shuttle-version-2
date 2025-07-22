package com.example.da_be.dto;

public class AddProductToBillResponse {
    private int trangThai;
    private String message;

    public AddProductToBillResponse(int trangThai, String message) {
        this.trangThai = trangThai;
        this.message = message;
    }

    public int getTrangThai() {
        return trangThai;
    }

    public void setTrangThai(int trangThai) {
        this.trangThai = trangThai;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}