package com.example.da_be.repository;

import com.example.da_be.entity.ThongBao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ThongBaoRepository extends JpaRepository<ThongBao, Integer> {
    
    // Tìm thông báo theo ID khách hàng và sắp xếp theo thời gian tạo giảm dần
    List<ThongBao> findByKhachHangIdOrderByCreatedAtDesc(Integer khachHangId);
    
    // Tìm thông báo theo ID khách hàng (method cũ để tương thích)
    List<ThongBao> findByKhachHangId(Integer khachHangId);
}