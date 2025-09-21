package com.example.da_be.repository;

import com.example.da_be.entity.StockAllocation;
import com.example.da_be.entity.HoaDonCT;
import com.example.da_be.entity.SanPhamCT;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StockAllocationRepository extends JpaRepository<StockAllocation, Integer> {
    
    /**
     * Tìm allocation theo hóa đơn chi tiết
     */
    Optional<StockAllocation> findByHoaDonCT(HoaDonCT hoaDonCT);
    
    /**
     * Tìm allocation theo hóa đơn chi tiết ID
     */
    @Query("SELECT sa FROM StockAllocation sa WHERE sa.hoaDonCT.id = :hoaDonCTId")
    Optional<StockAllocation> findByHoaDonCTId(@Param("hoaDonCTId") Integer hoaDonCTId);
    
    /**
     * Tìm tất cả allocations theo sản phẩm
     */
    List<StockAllocation> findBySanPhamCT(SanPhamCT sanPhamCT);
    
    /**
     * Tìm allocations theo sản phẩm và trạng thái
     */
    @Query("SELECT sa FROM StockAllocation sa WHERE sa.sanPhamCT.id = :sanPhamCTId AND sa.trangThai = :trangThai")
    List<StockAllocation> findBySanPhamCTIdAndTrangThai(@Param("sanPhamCTId") Integer sanPhamCTId, 
                                                        @Param("trangThai") StockAllocation.AllocationStatus trangThai);
    
    /**
     * Tìm allocations theo hóa đơn
     */
    @Query("SELECT sa FROM StockAllocation sa WHERE sa.hoaDonCT.hoaDon.id = :hoaDonId")
    List<StockAllocation> findByHoaDonId(@Param("hoaDonId") Integer hoaDonId);
    
    /**
     * Tính tổng số lượng allocated cho một sản phẩm
     */
    @Query("SELECT COALESCE(SUM(CASE " +
           "WHEN sa.trangThai = 'RESERVED' THEN sa.soLuongReserved " +
           "WHEN sa.trangThai = 'ALLOCATED' THEN sa.soLuongAllocated " +
           "WHEN sa.trangThai = 'CONFIRMED' THEN sa.soLuongConfirmed " +
           "ELSE 0 END), 0) " +
           "FROM StockAllocation sa " +
           "WHERE sa.sanPhamCT.id = :sanPhamCTId " +
           "AND sa.trangThai IN ('ALLOCATED', 'CONFIRMED')")
    Integer getTotalAllocatedBySanPhamCTId(@Param("sanPhamCTId") Integer sanPhamCTId);
    
    /**
     * Tính tổng số lượng reserved cho một sản phẩm
     */
    @Query("SELECT COALESCE(SUM(sa.soLuongReserved), 0) " +
           "FROM StockAllocation sa " +
           "WHERE sa.sanPhamCT.id = :sanPhamCTId " +
           "AND sa.trangThai = 'RESERVED'")
    Integer getTotalReservedBySanPhamCTId(@Param("sanPhamCTId") Integer sanPhamCTId);
    
    /**
     * Lấy tất cả allocations cần được cleanup (đã hủy và cũ)
     */
    @Query("SELECT sa FROM StockAllocation sa " +
           "WHERE sa.trangThai = 'CANCELLED' " +
           "AND sa.ngayCapNhat < :cutoffDate")
    List<StockAllocation> findOldCancelledAllocations(@Param("cutoffDate") java.time.LocalDateTime cutoffDate);
    
    /**
     * Kiểm tra xem có allocation nào đang active cho hóa đơn chi tiết này không
     */
    @Query("SELECT COUNT(sa) > 0 FROM StockAllocation sa " +
           "WHERE sa.hoaDonCT.id = :hoaDonCTId " +
           "AND sa.trangThai IN ('RESERVED', 'ALLOCATED', 'CONFIRMED')")
    boolean hasActiveAllocation(@Param("hoaDonCTId") Integer hoaDonCTId);
    
    /**
     * Lấy tổng quan stock allocation cho một sản phẩm
     */
    @Query("SELECT new map(" +
           "COALESCE(SUM(CASE WHEN sa.trangThai = 'RESERVED' THEN sa.soLuongReserved ELSE 0 END), 0) as totalReserved, " +
           "COALESCE(SUM(CASE WHEN sa.trangThai = 'ALLOCATED' THEN sa.soLuongAllocated ELSE 0 END), 0) as totalAllocated, " +
           "COALESCE(SUM(CASE WHEN sa.trangThai = 'CONFIRMED' THEN sa.soLuongConfirmed ELSE 0 END), 0) as totalConfirmed" +
           ") " +
           "FROM StockAllocation sa " +
           "WHERE sa.sanPhamCT.id = :sanPhamCTId")
    java.util.Map<String, Integer> getStockAllocationSummary(@Param("sanPhamCTId") Integer sanPhamCTId);
    
    /**
     * Xóa tất cả allocations của một hóa đơn
     */
    @Query("DELETE FROM StockAllocation sa WHERE sa.hoaDonCT.hoaDon.id = :hoaDonId")
    void deleteByHoaDonId(@Param("hoaDonId") Integer hoaDonId);
    
    /**
     * Tìm allocation đang conflict (cùng sản phẩm, cùng thời điểm)
     */
    @Query("SELECT sa FROM StockAllocation sa " +
           "WHERE sa.sanPhamCT.id = :sanPhamCTId " +
           "AND sa.hoaDonCT.id != :excludeHoaDonCTId " +
           "AND sa.trangThai IN ('ALLOCATED', 'CONFIRMED') " +
           "ORDER BY sa.ngayTao ASC")
    List<StockAllocation> findConflictingAllocations(@Param("sanPhamCTId") Integer sanPhamCTId,
                                                     @Param("excludeHoaDonCTId") Integer excludeHoaDonCTId);
}