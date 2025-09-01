package com.example.da_be.repository;

import com.example.da_be.entity.BulkOrderInquiryNote;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BulkOrderInquiryNoteRepository extends JpaRepository<BulkOrderInquiryNote, Long> {
    List<BulkOrderInquiryNote> findByInquiry_Id(Long inquiryId);
}
