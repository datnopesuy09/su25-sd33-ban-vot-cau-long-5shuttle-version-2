package com.example.da_be.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "BulkOrderInquiry")
public class BulkOrderInquiry {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "CustomerName")
    private String customerName;

    @Column(name = "CustomerPhone")
    private String customerPhone;

    @Column(name = "CustomerEmail")
    private String customerEmail;

    @Column(name = "CustomerNote", length = 1000)
    private String customerNote;

    @Column(name = "ContactMethod")
    private String contactMethod; // phone, zalo, email, visit

    @Column(name = "Status")
    private String status; // pending, contacted, completed, cancelled

    @Column(name = "AssignedStaff")
    private String assignedStaff;

    @Column(name = "TotalQuantity")
    private Integer totalQuantity;

    @Column(name = "TotalValue")
    private BigDecimal totalValue;

    @Column(name = "ItemCount")
    private Integer itemCount;

    @Column(name = "CreatedAt")
    private LocalDateTime createdAt;

    @Column(name = "UpdatedAt")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "inquiry", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<BulkOrderInquiryNote> notes = new ArrayList<>();

    @OneToOne(mappedBy = "inquiry", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private BulkOrderQuotation quotation;

    public BulkOrderInquiry() {}

    @PrePersist
    public void prePersist() {
        createdAt = LocalDateTime.now();
        updatedAt = createdAt;
        if (status == null) status = "pending";
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Getters and setters
    public Long getId() { return id; }
    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }
    public String getCustomerPhone() { return customerPhone; }
    public void setCustomerPhone(String customerPhone) { this.customerPhone = customerPhone; }
    public String getCustomerEmail() { return customerEmail; }
    public void setCustomerEmail(String customerEmail) { this.customerEmail = customerEmail; }
    public String getCustomerNote() { return customerNote; }
    public void setCustomerNote(String customerNote) { this.customerNote = customerNote; }
    public String getContactMethod() { return contactMethod; }
    public void setContactMethod(String contactMethod) { this.contactMethod = contactMethod; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getAssignedStaff() { return assignedStaff; }
    public void setAssignedStaff(String assignedStaff) { this.assignedStaff = assignedStaff; }
    public Integer getTotalQuantity() { return totalQuantity; }
    public void setTotalQuantity(Integer totalQuantity) { this.totalQuantity = totalQuantity; }
    public java.math.BigDecimal getTotalValue() { return totalValue; }
    public void setTotalValue(java.math.BigDecimal totalValue) { this.totalValue = totalValue; }
    public Integer getItemCount() { return itemCount; }
    public void setItemCount(Integer itemCount) { this.itemCount = itemCount; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    public List<BulkOrderInquiryNote> getNotes() { return notes; }
    public void setNotes(List<BulkOrderInquiryNote> notes) { this.notes = notes; }
    public BulkOrderQuotation getQuotation() { return quotation; }
    public void setQuotation(BulkOrderQuotation quotation) { this.quotation = quotation; }
}
