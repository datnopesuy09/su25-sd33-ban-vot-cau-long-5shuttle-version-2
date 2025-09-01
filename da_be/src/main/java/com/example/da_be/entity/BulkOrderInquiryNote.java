package com.example.da_be.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "BulkOrderInquiryNote")
public class BulkOrderInquiryNote {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "InquiryId")
    private BulkOrderInquiry inquiry;

    @Column(name = "StaffName")
    private String staffName;

    @Column(name = "Text", length = 2000)
    private String text;

    @Column(name = "CreatedAt")
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist(){
        createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public BulkOrderInquiry getInquiry() { return inquiry; }
    public void setInquiry(BulkOrderInquiry inquiry) { this.inquiry = inquiry; }
    public String getStaffName() { return staffName; }
    public void setStaffName(String staffName) { this.staffName = staffName; }
    public String getText() { return text; }
    public void setText(String text) { this.text = text; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
