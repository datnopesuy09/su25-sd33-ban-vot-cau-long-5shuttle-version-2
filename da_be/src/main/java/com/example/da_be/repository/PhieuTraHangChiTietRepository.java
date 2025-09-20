package com.example.da_be.repository;

import com.example.da_be.entity.PhieuTraHangChiTiet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PhieuTraHangChiTietRepository extends JpaRepository<PhieuTraHangChiTiet, Integer> {

    List<PhieuTraHangChiTiet> findByHoaDonChiTiet_Id(Integer hoaDonChiTietId);

}
