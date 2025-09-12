package com.example.da_be.repository;

import com.example.da_be.entity.LichSuDonHang;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LichSuDonHangRepository extends JpaRepository<LichSuDonHang, Integer> {
    
    // Tìm lịch sử đơn hàng theo ID User
    @Query("SELECT lsdh FROM LichSuDonHang lsdh WHERE lsdh.user.id = :userId ORDER BY lsdh.ngayTao DESC")
    List<LichSuDonHang> findByUserId(@Param("userId") Integer userId);
    
    // Tìm lịch sử đơn hàng theo ID Hóa đơn
    @Query("SELECT lsdh FROM LichSuDonHang lsdh WHERE lsdh.hoaDon.id = :hoaDonId ORDER BY lsdh.ngayTao DESC")
    List<LichSuDonHang> findByHoaDonId(@Param("hoaDonId") Integer hoaDonId);
    
    // Tìm lịch sử đơn hàng theo trạng thái
    @Query("SELECT lsdh FROM LichSuDonHang lsdh WHERE lsdh.trangThai = :trangThai ORDER BY lsdh.ngayTao DESC")
    List<LichSuDonHang> findByTrangThai(@Param("trangThai") Integer trangThai);
}
