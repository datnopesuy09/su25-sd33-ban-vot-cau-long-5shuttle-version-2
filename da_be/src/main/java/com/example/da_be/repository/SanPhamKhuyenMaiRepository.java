package com.example.da_be.repository;

import com.example.da_be.dto.PromotionDTO;
import com.example.da_be.entity.SanPhamKhuyenMai;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SanPhamKhuyenMaiRepository extends JpaRepository<SanPhamKhuyenMai, Integer> {
    @Query(
            """
            SELECT spkm FROM SanPhamKhuyenMai spkm WHERE spkm.khuyenMai.id = :idKhuyenMai
"""
    )
    List<SanPhamKhuyenMai> getListSanPhamKhuyenMaiByIdKhuyenMai(Integer idKhuyenMai);

    List<SanPhamKhuyenMai> findBySanPhamCT_Id(Integer sanPhamCtId);

    @Query("SELECT spkm FROM SanPhamKhuyenMai spkm WHERE spkm.sanPhamCT.id = :idSanPhamCT")
    List<SanPhamKhuyenMai> findBySanPhamCTId(Integer idSanPhamCT);

    @Query("SELECT spkm FROM SanPhamKhuyenMai spkm " +
            "JOIN spkm.khuyenMai km " +
            "WHERE spkm.sanPhamCT.id = :sanPhamCTId " +
            "AND km.trangThai = 1 " +
            "AND CURRENT_TIMESTAMP BETWEEN km.tgBatDau AND km.tgKetThuc")
    List<SanPhamKhuyenMai> findActivePromotionsBySanPhamCTId(Integer sanPhamCTId);
}
