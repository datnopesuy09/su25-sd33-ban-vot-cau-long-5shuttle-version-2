package com.example.da_be.repository;

import com.example.da_be.entity.PhieuTraHang;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PhieuTraHangRepository extends JpaRepository<PhieuTraHang, Integer> {

    List<PhieuTraHang> findByUserId(Integer userId);

    @Query("SELECT DISTINCT p FROM PhieuTraHang p " +
            "LEFT JOIN FETCH p.chiTietPhieuTraHang chiTiet " +
            "LEFT JOIN FETCH chiTiet.hoaDonChiTiet hDCT " + // Fetch HoaDonCT từ PhieuTraHangChiTiet
            "LEFT JOIN FETCH hDCT.sanPhamCT spCT " +       // Fetch SanPhamCT từ HoaDonCT
            "LEFT JOIN FETCH spCT.sanPham sp " +           // Fetch SanPham từ SanPhamCT
            "LEFT JOIN FETCH spCT.thuongHieu th " +         // Fetch ThuongHieu từ SanPhamCT
            "LEFT JOIN FETCH spCT.mauSac ms " +             // Fetch MauSac từ SanPhamCT
            "LEFT JOIN FETCH spCT.chatLieu cl " +           // Fetch ChatLieu từ SanPhamCT
            "LEFT JOIN FETCH spCT.trongLuong tl " +         // Fetch TrongLuong từ SanPhamCT
            "LEFT JOIN FETCH spCT.diemCanBang dcb " +       // Fetch DiemCanBang từ SanPhamCT
            "LEFT JOIN FETCH spCT.doCung dc " +             // Fetch DoCung từ SanPhamCT
            "LEFT JOIN FETCH p.hoaDon h " +
            "LEFT JOIN FETCH h.taiKhoan ht " +
            "LEFT JOIN FETCH p.user u " +
            "LEFT JOIN FETCH p.nhanVienXuLy nv")
    List<PhieuTraHang> findAllWithDetails();

    @Query("SELECT DISTINCT p FROM PhieuTraHang p " +
            "LEFT JOIN FETCH p.chiTietPhieuTraHang chiTiet " +
            "LEFT JOIN FETCH chiTiet.hoaDonChiTiet hDCT " +
            "LEFT JOIN FETCH hDCT.sanPhamCT spCT " +
            "LEFT JOIN FETCH spCT.sanPham sp " +
            "LEFT JOIN FETCH spCT.thuongHieu th " +
            "LEFT JOIN FETCH spCT.mauSac ms " +
            "LEFT JOIN FETCH spCT.chatLieu cl " +
            "LEFT JOIN FETCH spCT.trongLuong tl " +
            "LEFT JOIN FETCH spCT.diemCanBang dcb " +
            "LEFT JOIN FETCH spCT.doCung dc " +
            "WHERE p.user.id = :userId")
    List<PhieuTraHang> findByUserIdWithDetails(Integer userId);

    @Query("""
        SELECT DISTINCT p FROM PhieuTraHang p
        LEFT JOIN FETCH p.chiTietPhieuTraHang chiTiet
        LEFT JOIN FETCH chiTiet.hoaDonChiTiet hDCT
        LEFT JOIN FETCH hDCT.sanPhamCT spCT
        LEFT JOIN FETCH spCT.sanPham sp
        LEFT JOIN FETCH spCT.thuongHieu th
        LEFT JOIN FETCH spCT.mauSac ms
        LEFT JOIN FETCH spCT.chatLieu cl
        LEFT JOIN FETCH spCT.trongLuong tl
        LEFT JOIN FETCH spCT.diemCanBang dcb
        LEFT JOIN FETCH spCT.doCung dc
        WHERE p.hoaDon.id = :orderId
    """)
    PhieuTraHang findByHoaDonIdWithDetails(Integer orderId);

    List<PhieuTraHang> findByHoaDon_Id(Integer hoaDonId);

    boolean existsByHoaDonId(Integer hoaDonId);

}
