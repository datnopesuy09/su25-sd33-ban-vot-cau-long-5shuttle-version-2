package com.example.da_be.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "BulkOrderQuotation")
public class BulkOrderQuotation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "InquiryId")
    private BulkOrderInquiry inquiry;

    @Column(name = "DiscountPercent")
    private Integer discountPercent;

    @Column(name = "SubTotal")
    private BigDecimal subTotal;

    @Column(name = "DiscountAmount")
    private BigDecimal discountAmount;

    @Column(name = "Total")
    private BigDecimal total;

    @Column(name = "CreatedAt")
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist(){
        createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public BulkOrderInquiry getInquiry() { return inquiry; }
    public void setInquiry(BulkOrderInquiry inquiry) { this.inquiry = inquiry; }
    public Integer getDiscountPercent() { return discountPercent; }
    public void setDiscountPercent(Integer discountPercent) { this.discountPercent = discountPercent; }
    public BigDecimal getSubTotal() { return subTotal; }
    public void setSubTotal(BigDecimal subTotal) { this.subTotal = subTotal; }
    public BigDecimal getDiscountAmount() { return discountAmount; }
    public void setDiscountAmount(BigDecimal discountAmount) { this.discountAmount = discountAmount; }
    public BigDecimal getTotal() { return total; }
    public void setTotal(BigDecimal total) { this.total = total; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
