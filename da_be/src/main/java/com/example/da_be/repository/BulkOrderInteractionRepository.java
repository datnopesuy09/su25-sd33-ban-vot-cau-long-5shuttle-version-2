package com.example.da_be.repository;

import com.example.da_be.entity.BulkOrderInteraction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BulkOrderInteractionRepository extends JpaRepository<BulkOrderInteraction, Long> {
    List<BulkOrderInteraction> findByInquiryIdOrderByCreatedAtDesc(Long inquiryId);
}
