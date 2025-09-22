package com.example.da_be.repository;

import com.example.da_be.entity.LichSuHoanKho;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface LichSuHoanKhoRepository extends JpaRepository<LichSuHoanKho, Integer> {
    
    /**
     * Tìm lịch sử hoàn kho theo hóa đơn ID
     */
    List<LichSuHoanKho> findByHoaDonIdOrderByThoiGianDesc(Integer hoaDonId);
    
    /**
     * Tìm lịch sử hoàn kho theo sản phẩm chi tiết ID
     */
    List<LichSuHoanKho> findBySanPhamCtIdOrderByThoiGianDesc(Integer sanPhamCtId);
    
    /**
     * Kiểm tra đã hoàn kho cho đơn hàng và sản phẩm cụ thể chưa
     */
    @Query("SELECT lshk FROM LichSuHoanKho lshk WHERE lshk.hoaDonId = :hoaDonId AND lshk.sanPhamCtId = :sanPhamCtId")
    List<LichSuHoanKho> findByHoaDonIdAndSanPhamCtId(@Param("hoaDonId") Integer hoaDonId, 
                                                    @Param("sanPhamCtId") Integer sanPhamCtId);
    
    /**
     * Kiểm tra đã hoàn kho AUTO cho đơn hàng và sản phẩm cụ thể chưa
     */
    @Query("SELECT lshk FROM LichSuHoanKho lshk WHERE lshk.hoaDonId = :hoaDonId AND lshk.sanPhamCtId = :sanPhamCtId AND lshk.loaiHoanKho = 'AUTO'")
    Optional<LichSuHoanKho> findAutoRestoreRecord(@Param("hoaDonId") Integer hoaDonId, 
                                                 @Param("sanPhamCtId") Integer sanPhamCtId);
    
    /**
     * Tổng số lượng đã hoàn cho một sản phẩm chi tiết
     */
    @Query("SELECT COALESCE(SUM(lshk.soLuongHoan), 0) FROM LichSuHoanKho lshk WHERE lshk.sanPhamCtId = :sanPhamCtId")
    Integer getTotalRestoredQuantity(@Param("sanPhamCtId") Integer sanPhamCtId);
    
    /**
     * Tổng số lượng đã hoàn cho một đơn hàng
     */
    @Query("SELECT COALESCE(SUM(lshk.soLuongHoan), 0) FROM LichSuHoanKho lshk WHERE lshk.hoaDonId = :hoaDonId")
    Integer getTotalRestoredQuantityByOrder(@Param("hoaDonId") Integer hoaDonId);
    
    /**
     * Lịch sử hoàn kho trong khoảng thời gian
     */
    @Query("SELECT lshk FROM LichSuHoanKho lshk WHERE lshk.thoiGian BETWEEN :startDate AND :endDate ORDER BY lshk.thoiGian DESC")
    List<LichSuHoanKho> findByThoiGianBetween(@Param("startDate") LocalDateTime startDate, 
                                             @Param("endDate") LocalDateTime endDate);
    
    /**
     * Lịch sử hoàn kho theo loại
     */
    List<LichSuHoanKho> findByLoaiHoanKhoOrderByThoiGianDesc(LichSuHoanKho.LoaiHoanKho loaiHoanKho);
    
    /**
     * Kiểm tra có duplicate restore không
     */
    @Query("SELECT COUNT(lshk) > 0 FROM LichSuHoanKho lshk WHERE lshk.hoaDonId = :hoaDonId AND lshk.sanPhamCtId = :sanPhamCtId AND lshk.loaiHoanKho = :loaiHoanKho")
    boolean existsByHoaDonIdAndSanPhamCtIdAndLoaiHoanKho(@Param("hoaDonId") Integer hoaDonId, 
                                                        @Param("sanPhamCtId") Integer sanPhamCtId, 
                                                        @Param("loaiHoanKho") LichSuHoanKho.LoaiHoanKho loaiHoanKho);
}
