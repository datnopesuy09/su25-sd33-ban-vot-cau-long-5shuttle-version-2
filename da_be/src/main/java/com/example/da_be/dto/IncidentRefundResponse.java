package com.example.da_be.dto;

public class IncidentRefundResponse {
    private String status;
    private String refundId;
    private String message;
    private String estimatedTime;

    public IncidentRefundResponse(String status, String refundId, String message, String estimatedTime) {
        this.status = status;
        this.refundId = refundId;
        this.message = message;
        this.estimatedTime = estimatedTime;
    }

    // Compatibility with old field name
    public String getExpectedProcessingTime() { return estimatedTime; }
    public void setExpectedProcessingTime(String expectedProcessingTime) { this.estimatedTime = expectedProcessingTime; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getRefundId() { return refundId; }
    public void setRefundId(String refundId) { this.refundId = refundId; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public String getEstimatedTime() { return estimatedTime; }
    public void setEstimatedTime(String estimatedTime) { this.estimatedTime = estimatedTime; }
}
