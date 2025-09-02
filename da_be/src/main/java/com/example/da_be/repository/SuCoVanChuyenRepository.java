package com.example.da_be.repository;

import com.example.da_be.entity.SuCoVanChuyen;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SuCoVanChuyenRepository extends JpaRepository<SuCoVanChuyen, Integer> {

    /**
     * Tìm tất cả sự cố theo hóa đơn ID
     */
    List<SuCoVanChuyen> findByHoaDonIdOrderByNgayTaoDesc(Integer hoaDonId);

    /**
     * Tìm sự cố theo trạng thái
     */
    List<SuCoVanChuyen> findByTrangThaiOrderByNgayTaoDesc(Integer trangThai);

    /**
     * Tìm sự cố theo loại sự cố
     */
    List<SuCoVanChuyen> findByLoaiSuCoOrderByNgayTaoDesc(SuCoVanChuyen.LoaiSuCo loaiSuCo);

    /**
     * Tìm sự cố trong khoảng thời gian
     */
    List<SuCoVanChuyen> findByNgayXayRaBetweenOrderByNgayTaoDesc(LocalDateTime startDate, LocalDateTime endDate);

    /**
     * Tìm sự cố theo người báo cáo
     */
    List<SuCoVanChuyen> findByNguoiBaoCaoOrderByNgayTaoDesc(Integer nguoiBaoCao);

    /**
     * Đếm số lượng sự cố theo trạng thái
     */
    @Query("SELECT s.trangThai, COUNT(s) FROM SuCoVanChuyen s GROUP BY s.trangThai")
    List<Object[]> countByTrangThai();

    /**
     * Đếm số lượng sự cố theo loại
     */
    @Query("SELECT s.loaiSuCo, COUNT(s) FROM SuCoVanChuyen s GROUP BY s.loaiSuCo")
    List<Object[]> countByLoaiSuCo();

    /**
     * Tìm sự cố với thông tin chi tiết hóa đơn
     */
    @Query("SELECT s FROM SuCoVanChuyen s " +
           "JOIN FETCH s.hoaDon h " +
           "WHERE s.hoaDon.id = :hoaDonId " +
           "ORDER BY s.ngayTao DESC")
    List<SuCoVanChuyen> findByHoaDonIdWithHoaDonDetails(@Param("hoaDonId") Integer hoaDonId);

    /**
     * Tìm sự cố chưa giải quyết (trạng thái = 0)
     */
    @Query("SELECT s FROM SuCoVanChuyen s " +
           "WHERE s.trangThai = 0 " +
           "ORDER BY s.ngayXayRa ASC")
    List<SuCoVanChuyen> findUnresolvedIncidents();

    /**
     * Tìm sự cố theo múi thời gian và trạng thái
     */
    @Query("SELECT s FROM SuCoVanChuyen s " +
           "WHERE s.ngayXayRa >= :startDate " +
           "AND s.ngayXayRa <= :endDate " +
           "AND (:trangThai IS NULL OR s.trangThai = :trangThai) " +
           "ORDER BY s.ngayTao DESC")
    List<SuCoVanChuyen> findByDateRangeAndStatus(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            @Param("trangThai") Integer trangThai
    );

    /**
     * Kiểm tra xem hóa đơn đã có sự cố nào chưa
     */
    boolean existsByHoaDonId(Integer hoaDonId);

    /**
     * Đếm số lượng sự cố theo hóa đơn
     */
    long countByHoaDonId(Integer hoaDonId);
}
