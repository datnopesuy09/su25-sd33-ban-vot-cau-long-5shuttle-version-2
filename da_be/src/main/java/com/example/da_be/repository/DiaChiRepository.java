package com.example.da_be.repository;

import com.example.da_be.entity.DiaChi;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DiaChiRepository extends JpaRepository<DiaChi, Integer> {
    Page<DiaChi> findByTaiKhoanId(Integer customerId, Pageable pageable);
    List<DiaChi> findByTaiKhoanId(Integer customerId);
}
