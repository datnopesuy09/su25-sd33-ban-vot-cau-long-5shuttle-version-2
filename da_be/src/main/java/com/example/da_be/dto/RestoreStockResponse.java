package com.example.da_be.dto;

public class RestoreStockResponse {
    private String status;
    private String message;
    private Integer restoredItems;

    public RestoreStockResponse(String status, String message, Integer restoredItems) {
        this.status = status;
        this.message = message;
        this.restoredItems = restoredItems;
    }

    // Compatibility with old field name
    public Integer getItemsRestored() { return restoredItems; }
    public void setItemsRestored(Integer itemsRestored) { this.restoredItems = itemsRestored; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public Integer getRestoredItems() { return restoredItems; }
    public void setRestoredItems(Integer restoredItems) { this.restoredItems = restoredItems; }
}
