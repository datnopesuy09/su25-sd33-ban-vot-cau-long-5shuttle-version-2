package com.example.da_be.repository;

import com.example.da_be.entity.ThanhToan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ThanhToanRepository extends JpaRepository<ThanhToan, Integer> {
    List<ThanhToan> findByTaiKhoan_Id(Integer taiKhoanId);

    List<ThanhToan> findByHoaDon_Id(Integer hoaDonId);
}

