package com.example.da_be.repository;

import com.example.da_be.dto.request.PhieuGiamGiaSearch;
import com.example.da_be.dto.response.PhieuGiamGiaResponse;
import com.example.da_be.entity.PhieuGiamGia;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
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

    @Query(
            """
            SELECT pgg
            FROM PhieuGiamGia pgg
            WHERE (pgg.ngayBatDau > :dateNow and pgg.trangThai != 0)
            OR (pgg.ngayKetThuc <= :dateNow and pgg.trangThai != 2)
            OR ((pgg.ngayBatDau <= pgg.ngayKetThuc and pgg.ngayKetThuc > :dateNow) and pgg.trangThai != 1)
"""
    )
    List<PhieuGiamGia> getAllVoucherWrong(LocalDateTime dateNow);

    @Query(
            """
            SELECT new com.example.da_be.dto.response.PhieuGiamGiaResponse(pgg.id, pgg.ma, pgg.ten, pgg.giaTri, pgg.giaTriMax, pgg.dieuKienNhoNhat, pgg.soLuong, pgg.ngayBatDau, pgg.ngayKetThuc, pgg.trangThai,  pgg.kieuGiaTri)
            from PhieuGiamGia pgg
            where 
            (:#{#search.tenSearch} is null or pgg.ma like %:#{#search.tenSearch}% or pgg.ten like %:#{#search.tenSearch}%)
            AND (:#{#search.ngayBatDauSearch} IS NULL OR pgg.ngayBatDau >= :#{#search.ngayBatDauSearch})
            AND (:#{#search.ngayKetThucSearch} IS NULL OR pgg.ngayKetThuc <= :#{#search.ngayKetThucSearch})
            AND (:#{#search.kieuGiaTriSearch} IS NULL OR pgg.kieuGiaTri = :#{#search.kieuGiaTriSearch})
            AND (:#{#search.trangThaiSearch} IS NULL OR pgg.trangThai = :#{#search.trangThaiSearch})
            ORDER BY pgg.id DESC
            """
    )
    Page<PhieuGiamGiaResponse> getSearchPhieuGiamGia(@Param("search") PhieuGiamGiaSearch search, Pageable pageable);
}

