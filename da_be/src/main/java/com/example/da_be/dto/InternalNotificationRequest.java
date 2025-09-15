package com.example.da_be.dto;

import java.util.Map;

public class InternalNotificationRequest {
    private String tieuDe;
    private String noiDung;
    private String loai;
    private Map<String, Object> metadata;
    private String severity; // HIGH, MEDIUM, LOW
    private Boolean requiresAction;

    public String getTieuDe() { return tieuDe; }
    public void setTieuDe(String tieuDe) { this.tieuDe = tieuDe; }
    public String getNoiDung() { return noiDung; }
    public void setNoiDung(String noiDung) { this.noiDung = noiDung; }
    public String getLoai() { return loai; }
    public void setLoai(String loai) { this.loai = loai; }
    public Map<String, Object> getMetadata() { return metadata; }
    public void setMetadata(Map<String, Object> metadata) { this.metadata = metadata; }
    public String getSeverity() { return severity; }
    public void setSeverity(String severity) { this.severity = severity; }
    public Boolean getRequiresAction() { return requiresAction; }
    public void setRequiresAction(Boolean requiresAction) { this.requiresAction = requiresAction; }
}

