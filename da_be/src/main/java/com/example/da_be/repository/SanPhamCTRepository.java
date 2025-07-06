package com.example.da_be.repository;



import com.example.da_be.entity.SanPhamCT;

import com.example.da_be.dto.SanPhamCTListDTOo;
import com.example.da_be.entity.SanPhamCT;
import com.example.da_be.entity.SanPham;

import com.example.da_be.entity.SanPhamKhuyenMai;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SanPhamCTRepository extends JpaRepository<SanPhamCT, Integer> {
    Optional<SanPhamCT> findById(Long id);

    List<SanPhamCT> findBySanPham_Id(Integer productId);


    @Query("SELECT spkm FROM SanPhamKhuyenMai spkm WHERE spkm.sanPhamCT.id = :sanPhamCTId AND spkm.khuyenMai.trangThai = 1")
    List<SanPhamKhuyenMai> findActivePromotionsBySanPhamCTId(@Param("sanPhamCTId") Integer sanPhamCTId);

    @Query(value = "SELECT new com.example.da_be.dto.SanPhamCTListDTOo(" +
            "spct.id, " +
            "spct.sanPham.ten, " +
            "spct.donGia, " +
            "(SELECT h.link FROM HinhAnh h WHERE h.sanPhamCT_id = spct.id AND h.trangThai = 1 LIMIT 1) " +
            "spkm.giaKhuyenMai, " +
            "km.giaTri) " +
            "FROM SanPhamCT spct " +
            "LEFT JOIN SanPhamKhuyenMai spkm ON spct.id = spkm.sanPhamCT_id " +
            "LEFT JOIN KhuyenMai km ON spkm.khuyenMai_id = km.id " +
            "WHERE km.trangThai = 1", nativeQuery = true)
    List<SanPhamCTListDTOo> findAllWithPromotions();


}
