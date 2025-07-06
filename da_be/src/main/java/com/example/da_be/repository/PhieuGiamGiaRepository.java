package com.example.da_be.repository;

import com.example.da_be.dto.response.PhieuGiamGiaResponse;
import com.example.da_be.entity.PhieuGiamGia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PhieuGiamGiaRepository extends JpaRepository<PhieuGiamGia, Integer> {
    @Query(
            """
        SELECT new com.example.da_be.dto.response.PhieuGiamGiaResponse(pgg.id, pgg.ma, pgg.ten, pgg.giaTri, pgg.giaTriMax, pgg.dieuKienNhoNhat, pgg.soLuong, pgg.ngayBatDau, pgg.ngayKetThuc, pgg.trangThai, pgg.kieuGiaTri)
        FROM PhieuGiamGia pgg
"""
    )
    List<PhieuGiamGiaResponse> getAllPhieuGiamGia();

    @Query(
            """
            SELECT distinct pgg.ma
            FROM PhieuGiamGia pgg
"""
    )
    List<String> getAllMaPhieuGiamGia();

    @Query(
            """
            SELECT distinct pgg.ten
            FROM PhieuGiamGia pgg
"""
    )
    List<String> getAllTenPhieuGiamGia();

    @Query(
            """
        SELECT new com.example.da_be.dto.response.PhieuGiamGiaResponse(pgg.id, pgg.ma, pgg.ten, pgg.giaTri, pgg.giaTriMax, pgg.dieuKienNhoNhat, pgg.soLuong, pgg.ngayBatDau, pgg.ngayKetThuc, pgg.trangThai, pgg.kieuGiaTri)
        FROM PhieuGiamGia pgg
        WHERE pgg.id = :id
    """
    )
    PhieuGiamGiaResponse getPhieuGiamGiaById(Integer id);
}

