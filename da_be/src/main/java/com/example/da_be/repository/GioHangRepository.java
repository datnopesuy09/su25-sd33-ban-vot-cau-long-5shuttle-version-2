package com.example.da_be.repository;

import com.example.da_be.entity.GioHang;
import com.example.da_be.entity.SanPhamCT;
import com.example.da_be.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GioHangRepository extends JpaRepository<GioHang, Integer> {
    Optional<GioHang> findByTaiKhoanAndSanPhamCT(User taiKhoan, SanPhamCT sanPhamCT);
    List<GioHang> findByTaiKhoan(User taiKhoan);
}
