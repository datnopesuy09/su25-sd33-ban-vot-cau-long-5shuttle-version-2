package com.example.da_be.repository;


import com.example.da_be.entity.PhieuGiamGia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface VoucherRepository extends JpaRepository<PhieuGiamGia, Integer> {
}
