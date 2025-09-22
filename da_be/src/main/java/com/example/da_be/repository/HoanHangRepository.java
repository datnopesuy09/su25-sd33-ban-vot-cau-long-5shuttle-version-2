package com.example.da_be.repository;

import com.example.da_be.entity.HoanHang;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface HoanHangRepository extends JpaRepository<HoanHang, Long> {

    // Tìm danh sách hoàn hàng theo hóa đơn
    List<HoanHang> findByHoaDonIdOrderByNgayTaoDesc(Long hoaDonId);

    // Tìm danh sách hoàn hàng theo hóa đơn chi tiết
    List<HoanHang> findByHoaDonChiTietIdOrderByNgayTaoDesc(Long hoaDonChiTietId);

    // Tìm theo mã hoàn hàng
    Optional<HoanHang> findByMaHoanHang(String maHoanHang);

    // Tính tổng tiền hoàn hàng theo hóa đơn
    @Query("SELECT COALESCE(SUM(hh.thanhTien), 0) FROM HoanHang hh WHERE hh.hoaDonId = :hoaDonId")
    BigDecimal getTotalReturnAmountByHoaDonId(@Param("hoaDonId") Long hoaDonId);

    // Tính tổng số lượng hoàn hàng theo hóa đơn chi tiết
    @Query("SELECT COALESCE(SUM(hh.soLuongHoan), 0) FROM HoanHang hh WHERE hh.hoaDonChiTietId = :hoaDonChiTietId")
    Integer getTotalReturnQuantityByHoaDonChiTietId(@Param("hoaDonChiTietId") Long hoaDonChiTietId);

    // Tìm hoàn hàng theo khoảng thời gian
    @Query("SELECT hh FROM HoanHang hh WHERE hh.ngayTao BETWEEN :startDate AND :endDate ORDER BY hh.ngayTao DESC")
    List<HoanHang> findByNgayTaoBetween(@Param("startDate") LocalDateTime startDate, 
                                       @Param("endDate") LocalDateTime endDate);

    // Tìm hoàn hàng với phân trang
    @Query("SELECT hh FROM HoanHang hh ORDER BY hh.ngayTao DESC")
    Page<HoanHang> findAllOrderByNgayTaoDesc(Pageable pageable);

    // Tìm hoàn hàng theo trạng thái
    List<HoanHang> findByTrangThaiOrderByNgayTaoDesc(Integer trangThai);

    // Thống kê hoàn hàng theo tháng
    @Query("SELECT YEAR(hh.ngayTao) as year, MONTH(hh.ngayTao) as month, " +
           "COUNT(hh.id) as count, SUM(hh.thanhTien) as totalAmount " +
           "FROM HoanHang hh " +
           "GROUP BY YEAR(hh.ngayTao), MONTH(hh.ngayTao) " +
           "ORDER BY year DESC, month DESC")
    List<Object[]> getMonthlyReturnStats();

    // Kiểm tra xem có hoàn hàng nào trong hóa đơn không
    boolean existsByHoaDonId(Long hoaDonId);

    // Lấy hoàn hàng mới nhất của hóa đơn
    @Query("SELECT hh FROM HoanHang hh WHERE hh.hoaDonId = :hoaDonId ORDER BY hh.ngayTao DESC")
    List<HoanHang> findLatestByHoaDonId(@Param("hoaDonId") Long hoaDonId, Pageable pageable);

    // Tìm hoàn hàng với thông tin chi tiết sản phẩm
    @Query("SELECT hh, hd, hdct, sp, spct " +
           "FROM HoanHang hh " +
           "JOIN hh.hoaDon hd " +
           "JOIN hh.hoaDonChiTiet hdct " +
           "JOIN hdct.sanPhamCT spct " +
           "JOIN spct.sanPham sp " +
           "WHERE hh.hoaDonId = :hoaDonId " +
           "ORDER BY hh.ngayTao DESC")
    List<Object[]> findHoanHangWithProductDetails(@Param("hoaDonId") Long hoaDonId);
}