package com.example.da_be.repository;

import com.example.da_be.entity.HoaDon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;
import java.util.Set;

@Repository
public interface ThongKeRepository extends JpaRepository<HoaDon, Integer> {

    @Query(value = """
        SELECT
            COALESCE(SUM(hdct.SoLuong * hdct.GiaBan), 0)
              - COALESCE(SUM(ptrct.SoLuongPheDuyet * hdct.GiaBan), 0) AS tongTien,
            COALESCE(SUM(hdct.SoLuong), 0)
              - COALESCE(SUM(ptrct.SoLuongPheDuyet), 0) AS tongSanPham,
            COALESCE(SUM(ptrct.SoLuongPheDuyet), 0) AS tongSanPhamTra,
            SUM(CASE WHEN h.TrangThai = 6 THEN 1 ELSE 0 END) AS tongDonThanhCong,
            SUM(CASE WHEN h.TrangThai = 7 THEN 1 ELSE 0 END) AS tongDonHuy,
            SUM(CASE WHEN h.TrangThai = 8 THEN 1 ELSE 0 END) AS tongDonTra
        FROM 5SHUTTLE.HoaDon h
        JOIN 5SHUTTLE.HoaDonCT hdct
            ON h.Id = hdct.IdHoaDon
        LEFT JOIN 5SHUTTLE.PhieuTraHang ptr
            ON ptr.IdHoaDon = h.Id
           AND ptr.TrangThai = 'APPROVED'
        LEFT JOIN 5SHUTTLE.PhieuTraHangCT ptrct
            ON ptrct.IdPhieuTraHang = ptr.Id
           AND ptrct.IdHoaDonCT = hdct.Id
        WHERE hdct.TrangThai = 6
          AND h.NgayTao >= CURDATE()
          AND h.NgayTao < CURDATE() + INTERVAL 1 DAY;
    """, nativeQuery = true)
    OrderStatsProjection getStatsByCurrentDate();

    @Query(value = """
        SELECT
            COALESCE(SUM(hdct.SoLuong * hdct.GiaBan), 0)\s
              - COALESCE(SUM(ptrct.SoLuongPheDuyet * hdct.GiaBan), 0) AS tongTien,
            COALESCE(SUM(hdct.SoLuong), 0)\s
              - COALESCE(SUM(ptrct.SoLuongPheDuyet), 0) AS tongSanPham,
            COALESCE(SUM(ptrct.SoLuongPheDuyet), 0) AS tongSanPhamTra,
            SUM(CASE WHEN h.TrangThai = 6 THEN 1 ELSE 0 END) AS tongDonThanhCong,
            SUM(CASE WHEN h.TrangThai = 7 THEN 1 ELSE 0 END) AS tongDonHuy,
            SUM(CASE WHEN h.TrangThai = 8 THEN 1 ELSE 0 END) AS tongDonTra
        FROM 5SHUTTLE.HoaDon h
        JOIN 5SHUTTLE.HoaDonCT hdct
            ON h.Id = hdct.IdHoaDon
        LEFT JOIN 5SHUTTLE.PhieuTraHang ptr
            ON ptr.IdHoaDon = h.Id
           AND ptr.TrangThai = 'APPROVED'
        LEFT JOIN 5SHUTTLE.PhieuTraHangCT ptrct
            ON ptrct.IdPhieuTraHang = ptr.Id
           AND ptrct.IdHoaDonCT = hdct.Id
        WHERE hdct.TrangThai = 6
          AND h.NgayTao >= DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY)
          AND h.NgayTao < DATE_ADD(DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY), INTERVAL 7 DAY);
        
    """, nativeQuery = true)
    OrderStatsProjection getStatsByCurrentWeek();

    @Query(value = """
        SELECT
            COALESCE(SUM(hdct.SoLuong * hdct.GiaBan), 0)
              - COALESCE(SUM(ptrct.SoLuongPheDuyet * hdct.GiaBan), 0) AS tongTien,
            COALESCE(SUM(hdct.SoLuong), 0)
              - COALESCE(SUM(ptrct.SoLuongPheDuyet), 0) AS tongSanPham,
            COALESCE(SUM(ptrct.SoLuongPheDuyet), 0) AS tongSanPhamTra,
            SUM(CASE WHEN h.TrangThai = 6 THEN 1 ELSE 0 END) AS tongDonThanhCong,
            SUM(CASE WHEN h.TrangThai = 7 THEN 1 ELSE 0 END) AS tongDonHuy,
            SUM(CASE WHEN h.TrangThai = 8 THEN 1 ELSE 0 END) AS tongDonTra
        FROM 5SHUTTLE.HoaDon h
        JOIN 5SHUTTLE.HoaDonCT hdct
            ON h.Id = hdct.IdHoaDon
        LEFT JOIN 5SHUTTLE.PhieuTraHang ptr
            ON ptr.IdHoaDon = h.Id
           AND ptr.TrangThai = 'APPROVED'
        LEFT JOIN 5SHUTTLE.PhieuTraHangCT ptrct
            ON ptrct.IdPhieuTraHang = ptr.Id
           AND ptrct.IdHoaDonCT = hdct.Id
        WHERE hdct.TrangThai = 6
          AND h.NgayTao >= DATE_FORMAT(CURDATE(), '%Y-%m-01')
          AND h.NgayTao < DATE_FORMAT(CURDATE() + INTERVAL 1 MONTH, '%Y-%m-01');
        
    """, nativeQuery = true)
    OrderStatsProjection getStatsByCurrentMonth();

    @Query(value = """
        SELECT
            COALESCE(SUM(hdct.SoLuong * hdct.GiaBan), 0)
              - COALESCE(SUM(ptrct.SoLuongPheDuyet * hdct.GiaBan), 0) AS tongTien,
            COALESCE(SUM(hdct.SoLuong), 0)
              - COALESCE(SUM(ptrct.SoLuongPheDuyet), 0) AS tongSanPham,
            COALESCE(SUM(ptrct.SoLuongPheDuyet), 0) AS tongSanPhamTra,
            SUM(CASE WHEN h.TrangThai = 6 THEN 1 ELSE 0 END) AS tongDonThanhCong,
            SUM(CASE WHEN h.TrangThai = 7 THEN 1 ELSE 0 END) AS tongDonHuy,
            SUM(CASE WHEN h.TrangThai = 8 THEN 1 ELSE 0 END) AS tongDonTra
        FROM 5SHUTTLE.HoaDon h
        JOIN 5SHUTTLE.HoaDonCT hdct
            ON h.Id = hdct.IdHoaDon
        LEFT JOIN 5SHUTTLE.PhieuTraHang ptr
            ON ptr.IdHoaDon = h.Id
           AND ptr.TrangThai = 'APPROVED'
        LEFT JOIN 5SHUTTLE.PhieuTraHangCT ptrct
            ON ptrct.IdPhieuTraHang = ptr.Id
           AND ptrct.IdHoaDonCT = hdct.Id
        WHERE hdct.TrangThai = 6
          AND h.NgayTao >= DATE_FORMAT(CURDATE(), '%Y-%m-01')
          AND h.NgayTao < DATE_FORMAT(CURDATE() + INTERVAL 1 MONTH, '%Y-%m-01');
    """, nativeQuery = true)
    OrderStatsProjection getStatsByCurrentYear();

    @Query(value = """
        SELECT
            COALESCE(SUM(hdct.SoLuong * hdct.GiaBan), 0)
              - COALESCE(SUM(ptrct.SoLuongPheDuyet * hdct.GiaBan), 0) AS tongTien,
            COALESCE(SUM(hdct.SoLuong), 0)
              - COALESCE(SUM(ptrct.SoLuongPheDuyet), 0) AS tongSanPham,
            COALESCE(SUM(ptrct.SoLuongPheDuyet), 0) AS tongSanPhamTra,
            SUM(CASE WHEN h.TrangThai = 6 THEN 1 ELSE 0 END) AS tongDonThanhCong,
            SUM(CASE WHEN h.TrangThai = 7 THEN 1 ELSE 0 END) AS tongDonHuy,
            SUM(CASE WHEN h.TrangThai = 8 THEN 1 ELSE 0 END) AS tongDonTra
        FROM 5SHUTTLE.HoaDon h
        JOIN 5SHUTTLE.HoaDonCT hdct
            ON h.Id = hdct.IdHoaDon
        LEFT JOIN 5SHUTTLE.PhieuTraHang ptr
            ON ptr.IdHoaDon = h.Id
           AND ptr.TrangThai = 'APPROVED'
        LEFT JOIN 5SHUTTLE.PhieuTraHangCT ptrct
            ON ptrct.IdPhieuTraHang = ptr.Id
           AND ptrct.IdHoaDonCT = hdct.Id
        WHERE hdct.TrangThai = 6
          AND DATE(h.NgayTao) >= :fromDate
          AND DATE(h.NgayTao) <= :toDate
    """, nativeQuery = true)
    OrderStatsProjection getStatsByDateRange(@Param("fromDate") Date fromDate, @Param("toDate") Date toDate);


    // === TRUY VẤN CHO SẢN PHẨM BÁN CHẠY (TOP SELLING PRODUCTS) ===

    @Query(value = """
        SELECT
            CONCAT_WS(' - ', sp.Ten, ms.Ten, cl.Ten, th.Ten, tl.Ten, dc.Ten) as tenSanPham,
            SUM(hdct.SoLuong) as soLuongDaBan,
            COALESCE(MIN(hdct.GiaBan), 0) as giaTien
        FROM 5SHUTTLE.HoaDonCT hdct
        JOIN 5SHUTTLE.HoaDon hd ON hdct.IdHoaDon = hd.Id
        JOIN 5SHUTTLE.SanPhamCT spct ON hdct.IdSanPhamCT = spct.Id
        JOIN 5SHUTTLE.SanPham sp ON spct.IdSanPham = sp.Id
        LEFT JOIN 5SHUTTLE.MauSac ms ON spct.IdMauSac = ms.Id
        LEFT JOIN 5SHUTTLE.ChatLieu cl ON spct.IdChatLieu = cl.Id
        LEFT JOIN 5SHUTTLE.ThuongHieu th ON spct.IdThuongHieu = th.Id
        LEFT JOIN 5SHUTTLE.TrongLuong tl ON spct.IdTrongLuong = tl.Id
        LEFT JOIN 5SHUTTLE.DiemCanBang dcb ON spct.IdDiemCanBang = dcb.Id
        LEFT JOIN 5SHUTTLE.DoCung dc ON spct.IdDoCung = dc.Id
        WHERE hd.NgayTao >= CURDATE() AND hd.NgayTao < CURDATE() + INTERVAL 1 DAY
        AND hdct.TrangThai = 6
        GROUP BY spct.Id, sp.Ten, ms.Ten, cl.Ten, th.Ten, tl.Ten, dcb.Ten, dc.Ten
        ORDER BY soLuongDaBan DESC
    """, nativeQuery = true)
    List<TopSellingProductProjection> findTopSellingProductsByCurrentDate();

    @Query(value = """
        SELECT
            CONCAT_WS(' - ', sp.Ten, ms.Ten, cl.Ten, th.Ten, tl.Ten, dc.Ten) as tenSanPham,
            SUM(hdct.SoLuong) as soLuongDaBan,
            COALESCE(MIN(hdct.GiaBan), 0) as giaTien
        FROM 5SHUTTLE.HoaDonCT hdct
        JOIN 5SHUTTLE.HoaDon hd ON hdct.IdHoaDon = hd.Id
        JOIN 5SHUTTLE.SanPhamCT spct ON hdct.IdSanPhamCT = spct.Id
        JOIN 5SHUTTLE.SanPham sp ON spct.IdSanPham = sp.Id
        LEFT JOIN 5SHUTTLE.MauSac ms ON spct.IdMauSac = ms.Id
        LEFT JOIN 5SHUTTLE.ChatLieu cl ON spct.IdChatLieu = cl.Id
        LEFT JOIN 5SHUTTLE.ThuongHieu th ON spct.IdThuongHieu = th.Id
        LEFT JOIN 5SHUTTLE.TrongLuong tl ON spct.IdTrongLuong = tl.Id
        LEFT JOIN 5SHUTTLE.DiemCanBang dcb ON spct.IdDiemCanBang = dcb.Id
        LEFT JOIN 5SHUTTLE.DoCung dc ON spct.IdDoCung = dc.Id
        WHERE hd.NgayTao >= DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY)
          AND hd.NgayTao < DATE_ADD(DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY), INTERVAL 7 DAY)
            AND hdct.TrangThai = 6
        GROUP BY spct.Id, sp.Ten, ms.Ten, cl.Ten, th.Ten, tl.Ten, dcb.Ten, dc.Ten
        ORDER BY soLuongDaBan DESC
    """, nativeQuery = true)
    List<TopSellingProductProjection> findTopSellingProductsByCurrentWeek();

    @Query(value = """
        SELECT
            CONCAT_WS(' - ', sp.Ten, ms.Ten, cl.Ten, th.Ten, tl.Ten, dc.Ten) as tenSanPham,
            SUM(hdct.SoLuong) as soLuongDaBan,
            COALESCE(MIN(hdct.GiaBan), 0) as giaTien
        FROM 5SHUTTLE.HoaDonCT hdct
        JOIN 5SHUTTLE.HoaDon hd ON hdct.IdHoaDon = hd.Id
        JOIN 5SHUTTLE.SanPhamCT spct ON hdct.IdSanPhamCT = spct.Id
        JOIN 5SHUTTLE.SanPham sp ON spct.IdSanPham = sp.Id
        LEFT JOIN 5SHUTTLE.MauSac ms ON spct.IdMauSac = ms.Id
        LEFT JOIN 5SHUTTLE.ChatLieu cl ON spct.IdChatLieu = cl.Id
        LEFT JOIN 5SHUTTLE.ThuongHieu th ON spct.IdThuongHieu = th.Id
        LEFT JOIN 5SHUTTLE.TrongLuong tl ON spct.IdTrongLuong = tl.Id
        LEFT JOIN 5SHUTTLE.DiemCanBang dcb ON spct.IdDiemCanBang = dcb.Id
        LEFT JOIN 5SHUTTLE.DoCung dc ON spct.IdDoCung = dc.Id
        WHERE hd.NgayTao >= DATE_FORMAT(CURDATE(), '%Y-%m-01')
        AND hd.NgayTao < DATE_FORMAT(CURDATE() + INTERVAL 1 MONTH, '%Y-%m-01')
            AND hdct.TrangThai = 6
        GROUP BY spct.Id, sp.Ten, ms.Ten, cl.Ten, th.Ten, tl.Ten, dcb.Ten, dc.Ten
        ORDER BY soLuongDaBan DESC
    """, nativeQuery = true)
    List<TopSellingProductProjection> findTopSellingProductsByCurrentMonth();

    @Query(value = """
        SELECT
            CONCAT_WS(' - ', sp.Ten, ms.Ten, cl.Ten, th.Ten, tl.Ten, dc.Ten) as tenSanPham,
            SUM(hdct.SoLuong) as soLuongDaBan,
            COALESCE(MIN(hdct.GiaBan), 0) as giaTien
        FROM 5SHUTTLE.HoaDonCT hdct
        JOIN 5SHUTTLE.HoaDon hd ON hdct.IdHoaDon = hd.Id
        JOIN 5SHUTTLE.SanPhamCT spct ON hdct.IdSanPhamCT = spct.Id
        JOIN 5SHUTTLE.SanPham sp ON spct.IdSanPham = sp.Id
        LEFT JOIN 5SHUTTLE.MauSac ms ON spct.IdMauSac = ms.Id
        LEFT JOIN 5SHUTTLE.ChatLieu cl ON spct.IdChatLieu = cl.Id
        LEFT JOIN 5SHUTTLE.ThuongHieu th ON spct.IdThuongHieu = th.Id
        LEFT JOIN 5SHUTTLE.TrongLuong tl ON spct.IdTrongLuong = tl.Id
        LEFT JOIN 5SHUTTLE.DiemCanBang dcb ON spct.IdDiemCanBang = dcb.Id
        LEFT JOIN 5SHUTTLE.DoCung dc ON spct.IdDoCung = dc.Id
        WHERE hd.NgayTao >= DATE_FORMAT(CURDATE(), '%Y-01-01')
        AND hd.NgayTao < DATE_FORMAT(CURDATE() + INTERVAL 1 YEAR, '%Y-01-01')
            AND hdct.TrangThai = 6
        GROUP BY spct.Id, sp.Ten, ms.Ten, cl.Ten, th.Ten, tl.Ten, dcb.Ten, dc.Ten
        ORDER BY soLuongDaBan DESC
    """, nativeQuery = true)
    List<TopSellingProductProjection> findTopSellingProductsByCurrentYear();

    @Query(value = """
        SELECT
            CONCAT_WS(' - ', sp.Ten, ms.Ten, cl.Ten, th.Ten, tl.Ten, dc.Ten) as tenSanPham,
            SUM(hdct.SoLuong) as soLuongDaBan,
            COALESCE(MIN(hdct.GiaBan), 0) as giaTien
        FROM 5SHUTTLE.HoaDonCT hdct
        JOIN 5SHUTTLE.HoaDon hd ON hdct.IdHoaDon = hd.Id
        JOIN 5SHUTTLE.SanPhamCT spct ON hdct.IdSanPhamCT = spct.Id
        JOIN 5SHUTTLE.SanPham sp ON spct.IdSanPham = sp.Id
        LEFT JOIN 5SHUTTLE.MauSac ms ON spct.IdMauSac = ms.Id
        LEFT JOIN 5SHUTTLE.ChatLieu cl ON spct.IdChatLieu = cl.Id
        LEFT JOIN 5SHUTTLE.ThuongHieu th ON spct.IdThuongHieu = th.Id
        LEFT JOIN 5SHUTTLE.TrongLuong tl ON spct.IdTrongLuong = tl.Id
        LEFT JOIN 5SHUTTLE.DiemCanBang dcb ON spct.IdDiemCanBang = dcb.Id
        LEFT JOIN 5SHUTTLE.DoCung dc ON spct.IdDoCung = dc.Id
        WHERE DATE(hd.NgayTao) >= :fromDate AND DATE(hd.NgayTao) <= :toDate
            AND hdct.TrangThai = 6
        GROUP BY spct.Id, sp.Ten, ms.Ten, cl.Ten, th.Ten, tl.Ten, dcb.Ten, dc.Ten
        ORDER BY soLuongDaBan DESC
    """, nativeQuery = true)
    List<TopSellingProductProjection> findTopSellingProductsByDateRange(@Param("fromDate") Date fromDate, @Param("toDate") Date toDate);

    @Query(value = """
        SELECT
            CONCAT_WS(' - ', sp.Ten, ms.Ten, cl.Ten, th.Ten, tl.Ten, dc.Ten) AS tenSanPham,
            spct.SoLuong AS soLuong,
            spct.DonGia AS donGia,
            (
                SELECT ha.Link
                FROM 5SHUTTLE.HinhAnh ha
                WHERE ha.IdSanPhamCT = spct.Id
                ORDER BY ha.Id ASC
                LIMIT 1
            ) AS hinhAnh
        FROM 5SHUTTLE.SanPhamCT spct
        JOIN 5SHUTTLE.SanPham sp ON spct.IdSanPham = sp.Id
        LEFT JOIN 5SHUTTLE.MauSac ms ON spct.IdMauSac = ms.Id
        LEFT JOIN 5SHUTTLE.ChatLieu cl ON spct.IdChatLieu = cl.Id
        LEFT JOIN 5SHUTTLE.ThuongHieu th ON spct.IdThuongHieu = th.Id
        LEFT JOIN 5SHUTTLE.TrongLuong tl ON spct.IdTrongLuong = tl.Id
        LEFT JOIN 5SHUTTLE.DiemCanBang dcb ON spct.IdDiemCanBang = dcb.Id
        LEFT JOIN 5SHUTTLE.DoCung dc ON spct.IdDoCung = dc.Id
        WHERE spct.TrangThai = 1
        ORDER BY spct.SoLuong ASC
        LIMIT 5;
    """, nativeQuery = true)
    List<ProductsOutOfStockProjection> findProductsOutOfStock();
}