package com.example.da_be.dto;

public class InternalNotificationResponse {
    private String status;
    private String notificationId;
    private String message;

    public InternalNotificationResponse(String status, String notificationId, String message) {
        this.status = status;
        this.notificationId = notificationId;
        this.message = message;
    }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getNotificationId() { return notificationId; }
    public void setNotificationId(String notificationId) { this.notificationId = notificationId; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}





