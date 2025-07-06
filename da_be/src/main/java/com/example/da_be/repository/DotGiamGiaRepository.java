package com.example.da_be.repository;

import com.example.da_be.dto.request.KhuyenMaiSearch;
import com.example.da_be.dto.request.SanPhamCTSearch;
import com.example.da_be.dto.request.SanPhamSearch;
import com.example.da_be.dto.response.KhuyenMaiResponse;
import com.example.da_be.dto.response.SanPhamCTResponse;
import com.example.da_be.dto.response.SanPhamResponse;
import com.example.da_be.entity.KhuyenMai;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface DotGiamGiaRepository extends JpaRepository<KhuyenMai, Integer> {
    @Query(
            """
        SELECT new com.example.da_be.dto.response.KhuyenMaiResponse(km.id, km.ten, km.tgBatDau, km.tgKetThuc, km.trangThai, km.giaTri, km.loai)
        FROM KhuyenMai km
    """
    )
    List<KhuyenMaiResponse> getAllKhuyenMai();

    @Query(
            """
                   SELECT new com.example.da_be.dto.response.SanPhamCTResponse(spct.id, spct.sanPham.ten, spct.thuongHieu.ten, spct.mauSac.ten, spct.chatLieu.ten, spct.trongLuong.ten, spct.diemCanBang.ten, spct.doCung.ten)
                     FROM SanPhamCT spct
            """
    )
    List<SanPhamCTResponse> getAllSanPhamChiTiet();

    @Query (
            """
            SELECT new com.example.da_be.dto.response.SanPhamResponse(s.id, s.ma, s.ten, s.trangThai)
            FROM SanPham s
"""
    )
    List<SanPhamResponse> getAllSanPham();

    @Query(
            """
            SELECT new com.example.da_be.dto.response.SanPhamCTResponse(spct.id, spct.sanPham.ten, spct.thuongHieu.ten, spct.mauSac.ten, spct.chatLieu.ten, spct.trongLuong.ten, spct.diemCanBang.ten, spct.doCung.ten)
            FROM SanPhamCT spct
            WHERE spct.sanPham.id IN :id
"""
    )
    List<SanPhamCTResponse> getSanPhamChiTietBySanPham(List<Integer> id);

    @Query(
            """
            SELECT new com.example.da_be.dto.response.KhuyenMaiResponse(km.id, km.ten, km.tgBatDau, km.tgKetThuc, km.trangThai, km.giaTri, km.loai)
            FROM KhuyenMai km
            WHERE km.id = :id
    """
    )
    KhuyenMaiResponse getKhuyenMaiById(Integer id);

    @Query(
            """
            SELECT sp.id
            from SanPhamKhuyenMai spkm
            inner join SanPhamCT spct on spkm.sanPhamCT.id = spct.id
            inner join SanPham sp on spct.sanPham.id = sp.id
            where spkm.khuyenMai.id = :idKhuyenMai
"""
    )
    List<Integer> getIdSanPhamVaSanPhamChiTietByIdKhuyenMai(Integer idKhuyenMai);

    @Query(
            """
            SELECT spct.id
            FROM SanPhamKhuyenMai spkm
            inner join SanPhamCT spct on spkm.sanPhamCT.id = spct.id
            inner join SanPham sp on spct.sanPham.id = sp.id
            where spkm.khuyenMai.id = :idKhuyenMai
"""
    )
    List<Integer> getIdSanPhamChiTietByIdKhuyenMai(Integer idKhuyenMai);

    @Query(
            """
            SELECT new com.example.da_be.dto.response.KhuyenMaiResponse(km.id, km.ten, km.tgBatDau, km.tgKetThuc, km.trangThai, km.giaTri, km.loai)
            FROM KhuyenMai km
            WHERE
            (:#{#search.tenSearch} is null or km.ten like %:#{#search.tenSearch}%)
            AND (:#{#search.tgBatDauSearch} IS NULL OR km.tgBatDau >= :#{#search.tgBatDauSearch})
            AND (:#{#search.tgKetThucSearch} IS NULL OR km.tgKetThuc <= :#{#search.tgKetThucSearch})
            AND (:#{#search.trangThaiSearch} IS NULL OR km.trangThai = :#{#search.trangThaiSearch})
            order by km.id desc
"""
    )
    Page<KhuyenMaiResponse> getSearchKhuyenMai(@Param("search") KhuyenMaiSearch search, Pageable pageable);

    @Query(
            """
            SELECT new com.example.da_be.dto.response.SanPhamResponse(sp.id, sp.ma, sp.ten, sp.trangThai)
            FROM SanPham sp
            WHERE
            (:#{#search.tenSearch} is null or sp.ten like %:#{#search.tenSearch}%)
            order by sp.id desc
"""
    )
    Page<SanPhamResponse> getSearchSanPham(@Param("search") SanPhamSearch search, Pageable pageable);

    @Query(
            """
            SELECT new com.example.da_be.dto.response.SanPhamCTResponse(spct.id, spct.sanPham.ten, spct.thuongHieu.ten, spct.mauSac.ten, spct.chatLieu.ten, spct.trongLuong.ten, spct.diemCanBang.ten, spct.doCung.ten)
            FROM SanPhamCT spct
            order by spct.id desc
"""
    )
    Page<SanPhamCTResponse> phanTrangSanPhamCT(Pageable pageable);

    @Query(
            """
            SELECT new com.example.da_be.dto.response.SanPhamCTResponse(spct.id, spct.sanPham.ten, spct.thuongHieu.ten, spct.mauSac.ten, spct.chatLieu.ten, spct.trongLuong.ten, spct.diemCanBang.ten, spct.doCung.ten)
            FROM SanPhamCT spct
            WHERE
            (:#{#search.tenSearch} is null or spct.sanPham.ten like %:#{#search.tenSearch}%)
            AND (:#{#search.idThuongHieuSearch} is null or spct.thuongHieu.ten like %:#{#search.idThuongHieuSearch}%)
            AND (:#{#search.idMauSacSearch} is null or spct.mauSac.ten like %:#{#search.idMauSacSearch}%)
            AND (:#{#search.idChatLieuSearch} is null or spct.chatLieu.ten like %:#{#search.idChatLieuSearch}%)
            AND (:#{#search.idTrongLuongSearch} is null or spct.trongLuong.ten like %:#{#search.idTrongLuongSearch}%)
            AND (:#{#search.idDiemCanBangSearch} is null or spct.diemCanBang.ten like %:#{#search.idDiemCanBangSearch}%)
            AND (:#{#search.idDoCungSearch} is null or spct.doCung.ten like %:#{#search.idDoCungSearch}%)
            order by spct.id desc
"""
    )
    List<SanPhamCTResponse> fillterSanPhamCT(SanPhamCTSearch search);

    @Query("""
    SELECT new com.example.da_be.dto.response.SanPhamCTResponse(
        spct.id, 
        spct.sanPham.ten, 
        spct.thuongHieu.ten, 
        spct.mauSac.ten, 
        spct.chatLieu.ten, 
        spct.trongLuong.ten, 
        spct.diemCanBang.ten, 
        spct.doCung.ten
    )
    FROM SanPhamCT spct
    WHERE spct.sanPham.id IN :id
    AND (:#{#search.tenSearch} is null or spct.sanPham.ten like %:#{#search.tenSearch}%)
    AND (:#{#search.idThuongHieuSearch} is null or spct.thuongHieu.id = :#{#search.idThuongHieuSearch})
    AND (:#{#search.idMauSacSearch} is null or spct.mauSac.id = :#{#search.idMauSacSearch})
    AND (:#{#search.idChatLieuSearch} is null or spct.chatLieu.id = :#{#search.idChatLieuSearch})
    AND (:#{#search.idTrongLuongSearch} is null or spct.trongLuong.id = :#{#search.idTrongLuongSearch})
    AND (:#{#search.idDiemCanBangSearch} is null or spct.diemCanBang.id = :#{#search.idDiemCanBangSearch})
    AND (:#{#search.idDoCungSearch} is null or spct.doCung.id = :#{#search.idDoCungSearch})
    ORDER BY spct.id DESC
""")
    Page<SanPhamCTResponse> getSanPhamChiTietBySanPham(SanPhamCTSearch search, List<Integer> id, Pageable pageable);

    @Query(
            """
            SELECT distinct km.ten
            FROM KhuyenMai km
"""
    )
    List<String> getAllTenKhuyenMai();

    @Query(
            """
            SELECT km
            FROM KhuyenMai km
            WHERE (km.tgBatDau > :dateNow and km.trangThai != 0)
            OR (km.tgKetThuc <= :dateNow and km.trangThai != 2)
            OR ((km.tgBatDau <= km.tgKetThuc and km.tgKetThuc > :dateNow) and km.trangThai != 1)
"""
    )
    List<KhuyenMai> getAllKhuyenMaiWrong(LocalDateTime dateNow);
}