package com.example.da_be.repository;


import com.example.da_be.entity.SanPham;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SanPhamRepository extends JpaRepository<SanPham, Integer> {
    @Query("""
    SELECT sp.id, sp.ten, COUNT(spct), sp.trangThai
    FROM SanPham sp
    LEFT JOIN SanPhamCT spct ON sp.id = spct.sanPham.id
    GROUP BY sp.id, sp.ten, sp.trangThai
    ORDER BY sp.id DESC
""")
    List<Object[]> getAllSanPham();

    // Tìm sản phẩm theo tên (không phân biệt hoa thường)
    Optional<SanPham> findByTenIgnoreCase(String ten);

}
