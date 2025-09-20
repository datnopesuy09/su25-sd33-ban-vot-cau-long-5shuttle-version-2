package com.example.da_be.dto.ghn;

import com.fasterxml.jackson.annotation.JsonProperty;

public class GHNShippingFeeRequestDTO {
    @JsonProperty("service_type_id")
    private int serviceTypeId = 2; // 1: Express, 2: Standard, 3: Saving - mặc định Standard

    @JsonProperty("insurance_value")
    private int insuranceValue;

    @JsonProperty("coupon")
    private String coupon = "";

    @JsonProperty("from_district_id")
    private int fromDistrictId = 1444; // ID quận/huyện nơi gửi (shop của bạn)

    @JsonProperty("to_district_id")
    private int toDistrictId;

    @JsonProperty("to_ward_code")
    private String toWardCode;

    @JsonProperty("weight")
    private int weight; // Trọng lượng tính bằng gram

    @JsonProperty("length")
    private int length = 30; // Chiều dài mặc định cho vợt cầu lông (cm)

    @JsonProperty("width")
    private int width = 5; // Chiều rộng mặc định cho vợt cầu lông (cm)

    @JsonProperty("height")
    private int height = 5; // Chiều cao mặc định cho vợt cầu lông (cm)

    // Constructor
    public GHNShippingFeeRequestDTO() {}

    public GHNShippingFeeRequestDTO(int toDistrictId, String toWardCode, int insuranceValue, int weight) {
        this.toDistrictId = toDistrictId;
        this.toWardCode = toWardCode;
        this.insuranceValue = insuranceValue;
        this.weight = weight;
    }

    // Getters and Setters
    public int getServiceTypeId() {
        return serviceTypeId;
    }

    public void setServiceTypeId(int serviceTypeId) {
        this.serviceTypeId = serviceTypeId;
    }

    public int getInsuranceValue() {
        return insuranceValue;
    }

    public void setInsuranceValue(int insuranceValue) {
        this.insuranceValue = insuranceValue;
    }

    public String getCoupon() {
        return coupon;
    }

    public void setCoupon(String coupon) {
        this.coupon = coupon;
    }

    public int getFromDistrictId() {
        return fromDistrictId;
    }

    public void setFromDistrictId(int fromDistrictId) {
        this.fromDistrictId = fromDistrictId;
    }

    public int getToDistrictId() {
        return toDistrictId;
    }

    public void setToDistrictId(int toDistrictId) {
        this.toDistrictId = toDistrictId;
    }

    public String getToWardCode() {
        return toWardCode;
    }

    public void setToWardCode(String toWardCode) {
        this.toWardCode = toWardCode;
    }

    public int getWeight() {
        return weight;
    }

    public void setWeight(int weight) {
        this.weight = weight;
    }

    public int getLength() {
        return length;
    }

    public void setLength(int length) {
        this.length = length;
    }

    public int getWidth() {
        return width;
    }

    public void setWidth(int width) {
        this.width = width;
    }

    public int getHeight() {
        return height;
    }

    public void setHeight(int height) {
        this.height = height;
    }
}