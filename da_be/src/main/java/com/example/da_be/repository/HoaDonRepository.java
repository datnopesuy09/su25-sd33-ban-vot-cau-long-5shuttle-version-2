package com.example.da_be.repository;

import com.example.da_be.entity.HoaDon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HoaDonRepository extends JpaRepository<HoaDon, Integer> {

    List<HoaDon> findHoaDonByTaiKhoan_IdAndLoaiHoaDon(Integer taiKhoanId, String loaiHoaDon);

    Optional<HoaDon> findByIdAndTaiKhoan_Id(Integer id, Integer taiKhoanId);

    Integer id(Integer id);
}
