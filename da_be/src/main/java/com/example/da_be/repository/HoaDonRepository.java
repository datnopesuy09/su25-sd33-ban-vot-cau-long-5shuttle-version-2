package com.example.da_be.repository;

import com.example.da_be.entity.HoaDon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HoaDonRepository extends JpaRepository<HoaDon, Integer> {

    List<HoaDon> findHoaDonByTaiKhoan_IdAndLoaiHoaDon(Integer taiKhoanId, String loaiHoaDon);

    Optional<HoaDon> findByIdAndTaiKhoan_Id(Integer id, Integer taiKhoanId);

    Integer id(Integer id);
    
    // Kiểm tra voucher có đang được sử dụng trong hóa đơn không (bất kể trạng thái)
    @Query("SELECT COUNT(h) > 0 FROM HoaDon h WHERE h.voucher.id = :voucherId")
    boolean existsByVoucherId(@Param("voucherId") Integer voucherId);
    
    // Đếm số hóa đơn đang sử dụng voucher
    @Query("SELECT COUNT(h) FROM HoaDon h WHERE h.voucher.id = :voucherId")
    long countByVoucherId(@Param("voucherId") Integer voucherId);
}
