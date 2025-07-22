        package com.example.da_be.repository;

import com.example.da_be.entity.TraHang;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TraHangRepository extends JpaRepository<TraHang, Integer> {
    List<TraHang> findByHoaDonCT_HoaDon_Id(Integer hoaDonId);
}
