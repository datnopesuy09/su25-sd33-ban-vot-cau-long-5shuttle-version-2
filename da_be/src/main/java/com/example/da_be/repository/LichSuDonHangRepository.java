package com.example.da_be.repository;

import com.example.da_be.entity.LichSuDonHang;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LichSuDonHangRepository extends JpaRepository<LichSuDonHang, Integer> {
}
