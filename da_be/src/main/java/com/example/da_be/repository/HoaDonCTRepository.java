package com.example.da_be.repository;

import com.example.da_be.entity.HoaDon;
import com.example.da_be.entity.HoaDonCT;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface HoaDonCTRepository extends JpaRepository<HoaDonCT, Integer> {
    List<HoaDonCT> findByHoaDon(HoaDon hoaDon);

    List<HoaDonCT> findByHoaDonId(Integer hoaDonId);

    List<HoaDonCT> findBySanPhamCTId(Integer sanPhamCTId);
}
