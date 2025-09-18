package com.example.da_be.dto;

public class RestoreStockIncidentRequest {
    private Integer incidentId;
    private Integer adminId;
    private String restoreReason;

    // Compatibility with old field name
    public String getRestoreType() { return restoreReason; }
    public void setRestoreType(String restoreType) { this.restoreReason = restoreType; }

    public Integer getIncidentId() { return incidentId; }
    public void setIncidentId(Integer incidentId) { this.incidentId = incidentId; }
    public Integer getAdminId() { return adminId; }
    public void setAdminId(Integer adminId) { this.adminId = adminId; }
    public String getRestoreReason() { return restoreReason; }
    public void setRestoreReason(String restoreReason) { this.restoreReason = restoreReason; }
}
