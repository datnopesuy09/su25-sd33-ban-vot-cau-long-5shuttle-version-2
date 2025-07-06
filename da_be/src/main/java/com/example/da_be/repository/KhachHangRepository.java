package com.example.da_be.repository;

import com.example.da_be.dto.response.KhachHangResponse;
import com.example.da_be.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface KhachHangRepository extends JpaRepository<User, Integer> {
    @Query("""
                SELECT new com.example.da_be.dto.response.KhachHangResponse(kh.id, kh.ma, kh.hoTen, kh.sdt, kh.email, kh.matKhau, kh.gioiTinh, kh.avatar, kh.ngaySinh, kh.trangThai)
                FROM User kh
                JOIN kh.roles r
                WHERE r.id IN (1)
            """)
    List<KhachHangResponse> getAllKhachHang();

    @Query(
            """
        SELECT new com.example.da_be.dto.response.KhachHangResponse(tk.id, tk.ma, tk.hoTen, tk.sdt, tk.email, tk.matKhau, tk.gioiTinh, tk.avatar, tk.ngaySinh, tk.trangThai)
        FROM User tk
        JOIN tk.roles r
        WHERE tk.id = :id
"""
    )
    KhachHangResponse findKhachHangById(Integer id);

    @Query("""
                SELECT new com.example.da_be.dto.response.KhachHangResponse(
                    nv.id, nv.ma, nv.hoTen, nv.sdt, nv.email, nv.matKhau,
                    nv.gioiTinh, nv.avatar, nv.ngaySinh, nv.trangThai)
                FROM User nv
                JOIN nv.roles r
                WHERE r.id IN (1)
                  AND (:ten IS NULL OR nv.hoTen LIKE %:ten%)
                  AND (:email IS NULL OR nv.email LIKE %:email%)
                  AND (:sdt IS NULL OR nv.sdt LIKE %:sdt%)
                  AND (:gioiTinh IS NULL OR nv.gioiTinh = :gioiTinh)
                  AND (:trangThai IS NULL OR nv.trangThai = :trangThai)
                ORDER BY nv.id DESC
            """)
    Page<KhachHangResponse> searchKhachHang(
            @Param("ten") String ten,
            @Param("email") String email,
            @Param("sdt") String sdt,
            @Param("gioiTinh") Integer gioiTinh,
            @Param("trangThai") Integer trangThai,
            Pageable pageable
    );
    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);


}
