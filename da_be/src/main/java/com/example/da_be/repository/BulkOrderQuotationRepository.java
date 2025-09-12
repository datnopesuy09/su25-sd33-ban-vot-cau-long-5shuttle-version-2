package com.example.da_be.repository;

import com.example.da_be.entity.BulkOrderQuotation;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BulkOrderQuotationRepository extends JpaRepository<BulkOrderQuotation, Long> {
    BulkOrderQuotation findByInquiry_Id(Long inquiryId);
}
