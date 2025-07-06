package com.example.da_be.repository;


import com.example.da_be.entity.ThuongHieu;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ThuongHieuRepository extends JpaRepository<ThuongHieu, Integer> {
    Optional<ThuongHieu> findByTen(String ten);
}
