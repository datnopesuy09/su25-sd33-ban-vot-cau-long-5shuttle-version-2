package com.example.da_be.repository;

import com.example.da_be.entity.PreOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface PreOrderRepository extends JpaRepository<PreOrder, Integer> {
    List<PreOrder> findBySanPhamCTIdAndTrangThai(Integer sanPhamCTId, Integer trangThai);

    List<PreOrder> findByHoaDonId(Integer hoaDonId);

    @Query("SELECT p FROM PreOrder p WHERE p.sanPhamCT.id = :sanPhamCTId AND p.trangThai = 0 AND p.requestedQuantity <= :availableQuantity")
    List<PreOrder> findPendingBySanPhamCTIdAndSufficientQuantity(Integer sanPhamCTId, Integer availableQuantity);

    @Query("SELECT p.sanPhamCT.id, SUM(p.requestedQuantity) as totalRequested FROM PreOrder p WHERE p.trangThai = 0 GROUP BY p.sanPhamCT.id")
    List<Object[]> getTotalRequestedQuantityBySanPhamCT();
}