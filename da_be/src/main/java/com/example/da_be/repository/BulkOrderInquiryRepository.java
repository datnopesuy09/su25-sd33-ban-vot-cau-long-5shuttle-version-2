package com.example.da_be.repository;

import com.example.da_be.entity.BulkOrderInquiry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface BulkOrderInquiryRepository extends JpaRepository<BulkOrderInquiry, Long>, JpaSpecificationExecutor<BulkOrderInquiry> {
}
