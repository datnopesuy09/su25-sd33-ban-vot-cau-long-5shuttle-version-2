        package com.example.da_be.repository;

import com.example.da_be.entity.PreOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PreOrderRepository extends JpaRepository<PreOrder, Integer> {
    List<PreOrder> findBySanPhamCTIdAndTrangThai(Integer sanPhamCTId, Integer trangThai);
    List<PreOrder> findByHoaDonId(Integer hoaDonId);
}
