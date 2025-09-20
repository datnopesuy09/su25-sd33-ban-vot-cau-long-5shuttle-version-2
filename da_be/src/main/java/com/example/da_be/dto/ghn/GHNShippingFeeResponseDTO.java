package com.example.da_be.dto.ghn;

import com.fasterxml.jackson.annotation.JsonProperty;

public class GHNShippingFeeResponseDTO {
    private int code;
    private String message;
    private Data data;

    public static class Data {
        private int total;
        
        @JsonProperty("service_fee")
        private int serviceFee;
        
        @JsonProperty("insurance_fee")
        private int insuranceFee;
        
        @JsonProperty("pick_station_fee")
        private int pickStationFee;
        
        @JsonProperty("coupon_value")
        private int couponValue;
        
        @JsonProperty("r2s_fee")
        private int r2sFee;
        
        @JsonProperty("return_again")
        private int returnAgain;
        
        @JsonProperty("document_return")
        private int documentReturn;
        
        @JsonProperty("double_check")
        private int doubleCheck;
        
        @JsonProperty("cod_fee")
        private int codFee;
        
        @JsonProperty("pick_remote_areas_fee")
        private int pickRemoteAreasFee;
        
        @JsonProperty("deliver_remote_areas_fee")
        private int deliverRemoteAreasFee;
        
        @JsonProperty("cod_failed_fee")
        private int codFailedFee;

        // Getters and Setters
        public int getTotal() {
            return total;
        }

        public void setTotal(int total) {
            this.total = total;
        }

        public int getServiceFee() {
            return serviceFee;
        }

        public void setServiceFee(int serviceFee) {
            this.serviceFee = serviceFee;
        }

        public int getInsuranceFee() {
            return insuranceFee;
        }

        public void setInsuranceFee(int insuranceFee) {
            this.insuranceFee = insuranceFee;
        }

        public int getPickStationFee() {
            return pickStationFee;
        }

        public void setPickStationFee(int pickStationFee) {
            this.pickStationFee = pickStationFee;
        }

        public int getCouponValue() {
            return couponValue;
        }

        public void setCouponValue(int couponValue) {
            this.couponValue = couponValue;
        }

        public int getR2sFee() {
            return r2sFee;
        }

        public void setR2sFee(int r2sFee) {
            this.r2sFee = r2sFee;
        }

        public int getReturnAgain() {
            return returnAgain;
        }

        public void setReturnAgain(int returnAgain) {
            this.returnAgain = returnAgain;
        }

        public int getDocumentReturn() {
            return documentReturn;
        }

        public void setDocumentReturn(int documentReturn) {
            this.documentReturn = documentReturn;
        }

        public int getDoubleCheck() {
            return doubleCheck;
        }

        public void setDoubleCheck(int doubleCheck) {
            this.doubleCheck = doubleCheck;
        }

        public int getCodFee() {
            return codFee;
        }

        public void setCodFee(int codFee) {
            this.codFee = codFee;
        }

        public int getPickRemoteAreasFee() {
            return pickRemoteAreasFee;
        }

        public void setPickRemoteAreasFee(int pickRemoteAreasFee) {
            this.pickRemoteAreasFee = pickRemoteAreasFee;
        }

        public int getDeliverRemoteAreasFee() {
            return deliverRemoteAreasFee;
        }

        public void setDeliverRemoteAreasFee(int deliverRemoteAreasFee) {
            this.deliverRemoteAreasFee = deliverRemoteAreasFee;
        }

        public int getCodFailedFee() {
            return codFailedFee;
        }

        public void setCodFailedFee(int codFailedFee) {
            this.codFailedFee = codFailedFee;
        }
    }

    // Getters and Setters for main class
    public int getCode() {
        return code;
    }

    public void setCode(int code) {
        this.code = code;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Data getData() {
        return data;
    }

    public void setData(Data data) {
        this.data = data;
    }
}