package com.example.da_be.dto;

import java.math.BigDecimal;

public class UpdateDeliveryInfoRequest {
    private String tenNguoiNhan;
    private String sdtNguoiNhan;
    private String diaChiNguoiNhan;
    private BigDecimal phiShip;

    public UpdateDeliveryInfoRequest() {
    }

    public UpdateDeliveryInfoRequest(String tenNguoiNhan, String sdtNguoiNhan, String diaChiNguoiNhan) {
        this.tenNguoiNhan = tenNguoiNhan;
        this.sdtNguoiNhan = sdtNguoiNhan;
        this.diaChiNguoiNhan = diaChiNguoiNhan;
    }

    public UpdateDeliveryInfoRequest(String tenNguoiNhan, String sdtNguoiNhan, String diaChiNguoiNhan, BigDecimal phiShip) {
        this.tenNguoiNhan = tenNguoiNhan;
        this.sdtNguoiNhan = sdtNguoiNhan;
        this.diaChiNguoiNhan = diaChiNguoiNhan;
        this.phiShip = phiShip;
    }

    public String getTenNguoiNhan() {
        return tenNguoiNhan;
    }

    public void setTenNguoiNhan(String tenNguoiNhan) {
        this.tenNguoiNhan = tenNguoiNhan;
    }

    public String getSdtNguoiNhan() {
        return sdtNguoiNhan;
    }

    public void setSdtNguoiNhan(String sdtNguoiNhan) {
        this.sdtNguoiNhan = sdtNguoiNhan;
    }

    public String getDiaChiNguoiNhan() {
        return diaChiNguoiNhan;
    }

    public void setDiaChiNguoiNhan(String diaChiNguoiNhan) {
        this.diaChiNguoiNhan = diaChiNguoiNhan;
    }

    public BigDecimal getPhiShip() {
        return phiShip;
    }

    public void setPhiShip(BigDecimal phiShip) {
        this.phiShip = phiShip;
    }
}
