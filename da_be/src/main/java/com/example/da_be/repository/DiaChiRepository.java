package com.example.da_be.repository;

import com.example.da_be.entity.DiaChi;
import com.example.da_be.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface DiaChiRepository extends JpaRepository<DiaChi, Integer> {
    Page<DiaChi> findByTaiKhoanId(Integer customerId, Pageable pageable);
    List<DiaChi> findByTaiKhoanId(Integer customerId);
    List<DiaChi> findByTaiKhoan_Email(String email);
    DiaChi findByTaiKhoanAndId(User user, Integer id);
    Optional<DiaChi> findByIdAndTaiKhoan(Integer id, User taiKhoan);
    List<DiaChi> findByTaiKhoanAndLoai(User taiKhoan, Integer loai);


}
