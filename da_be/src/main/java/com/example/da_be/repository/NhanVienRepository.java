package com.example.da_be.repository;

import com.example.da_be.dto.response.NhanVienResponse;
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
public interface NhanVienRepository extends JpaRepository<User, Integer> {

    boolean existsByEmail(String email);

    Optional<User> findUserByEmail(String email);

    @Query("""
                 SELECT new com.example.da_be.dto.response.NhanVienResponse(
                     u.id, u.ma, u.hoTen, u.email, u.matKhau, u.sdt, u.ngaySinh,
                     u.gioiTinh, u.avatar, u.cccd, u.trangThai, r.name)
                            FROM User u
                            JOIN u.roles r
                            WHERE r.name IN ('STAFF', 'ADMIN')
            """)
    List<NhanVienResponse> getAllNhanVien();

    @Query("""
                SELECT new com.example.da_be.dto.response.NhanVienResponse(
                    u.id, u.ma, u.hoTen, u.email, u.matKhau, u.sdt, u.ngaySinh,
                    u.gioiTinh, u.avatar, u.cccd, u.trangThai, r.name)
            
                FROM User u
                JOIN u.roles r
                WHERE r.name IN ('STAFF', 'ADMIN')
                  AND (:ten IS NULL OR LOWER(u.hoTen) LIKE LOWER(CONCAT('%', :ten, '%')))
                  AND (:email IS NULL OR LOWER(u.email) LIKE LOWER(CONCAT('%', :email, '%')))
                  AND (:sdt IS NULL OR u.sdt LIKE CONCAT('%', :sdt, '%'))
                  AND (:gioiTinh IS NULL OR u.gioiTinh = :gioiTinh)
                  AND (:trangThai IS NULL OR u.trangThai = :trangThai)
            """)
    Page<NhanVienResponse> searchNhanVien(
            @Param("ten") String ten,
            @Param("email") String email,
            @Param("sdt") String sdt,
            @Param("gioiTinh") Integer gioiTinh,
            @Param("trangThai") Integer trangThai,
            Pageable pageable
    );

}