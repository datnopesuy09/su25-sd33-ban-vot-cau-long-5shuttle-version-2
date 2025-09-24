package com.example.da_be.service;

import com.example.da_be.dto.request.KhuyenMaiRequest;
import com.example.da_be.dto.request.KhuyenMaiSearch;
import com.example.da_be.dto.request.SanPhamCTSearch;
import com.example.da_be.dto.request.SanPhamSearch;
import com.example.da_be.dto.response.KhuyenMaiResponse;
import com.example.da_be.dto.response.SanPhamCTResponse;
import com.example.da_be.dto.response.SanPhamResponse;
import com.example.da_be.entity.KhuyenMai;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;

public interface DotGiamGiaService {
    List<KhuyenMaiResponse> getAllKhuyenMai();
    List<SanPhamResponse> getAllSanPhamByTen(String ten);
    List<SanPhamCTResponse> getAllSanPhamChiTiet();
    List<SanPhamCTResponse> getSanPhamChiTietBySanPham(List<Integer> id);
    Page<SanPhamCTResponse> getSanPhamChiTietBySanPham(SanPhamCTSearch search, List<Integer> id, Pageable pageable);
    KhuyenMai addKhuyenMaiOnProduct(KhuyenMaiRequest khuyenMaiRequest);
    KhuyenMai updateKhuyenMai(KhuyenMaiRequest khuyenMaiRequest, Integer id);
    KhuyenMai deleteKhuyenMai(Integer id);
    KhuyenMai getKhuyenMaiById(Integer id);
    List<Integer> getIdSanPhamByIdKhuyenMai(Integer idKhuyenMai);
    List<Integer> getIdSanPhamChiTietByIdKhuyenMai(Integer idKhuyenMai);
    Page<KhuyenMaiResponse> getSearchKhuyenMai(KhuyenMaiSearch khuyenMaiSearch, Pageable pageable);
    Page<SanPhamResponse> getSearchSanPham(SanPhamSearch sanPhamSearch, Pageable pageable);
    Page<SanPhamCTResponse> phanTrangSanPhamCT(Pageable pageable);
    List<SanPhamCTResponse> fillterSanPhamCT(SanPhamCTSearch sanPhamCTSearch);
    List<String> getAllTenKhuyenMai();
    List<SanPhamCTResponse> getAllBySanPhamId(Long idSanPham);
    Boolean checkPromotionOverlap(List<Integer> idSanPhamCT, LocalDateTime newTgBatDau, LocalDateTime newTgKetThuc);
    String getOverlapDetails(List<Integer> idSanPhamCT, LocalDateTime newTgBatDau, LocalDateTime newTgKetThuc);
    Boolean checkPromotionOverlapForUpdate(List<Integer> idSanPhamCT, LocalDateTime newTgBatDau, LocalDateTime newTgKetThuc, Integer currentPromotionId);
    String getOverlapDetailsForUpdate(List<Integer> idSanPhamCT, LocalDateTime newTgBatDau, LocalDateTime newTgKetThuc, Integer currentPromotionId);
}
