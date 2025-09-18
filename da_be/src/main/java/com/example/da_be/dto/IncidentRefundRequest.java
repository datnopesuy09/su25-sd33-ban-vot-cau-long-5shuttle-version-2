package com.example.da_be.dto;

public class IncidentRefundRequest {
    private Integer incidentId;
    private String refundReason;
    private String paymentMethod; // AUTO, MANUAL
    private Integer adminId;

    // Compatibility with old field name
    public String getReason() { return refundReason; }
    public void setReason(String reason) { this.refundReason = reason; }
    
    public String getRefundType() { return paymentMethod; }
    public void setRefundType(String refundType) { this.paymentMethod = refundType; }

    public Integer getIncidentId() { return incidentId; }
    public void setIncidentId(Integer incidentId) { this.incidentId = incidentId; }
    public String getRefundReason() { return refundReason; }
    public void setRefundReason(String refundReason) { this.refundReason = refundReason; }
    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
    public Integer getAdminId() { return adminId; }
    public void setAdminId(Integer adminId) { this.adminId = adminId; }
}
