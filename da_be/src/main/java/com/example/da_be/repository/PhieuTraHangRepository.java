package com.example.da_be.repository;

import com.example.da_be.entity.PhieuTraHang;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PhieuTraHangRepository extends JpaRepository<PhieuTraHang, Integer> {

    List<PhieuTraHang> findByUserId(Integer userId);

}
