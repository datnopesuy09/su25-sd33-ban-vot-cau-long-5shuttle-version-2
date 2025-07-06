package com.example.da_be.repository;


import com.example.da_be.entity.DiemCanBang;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DiemCanBangRepository extends JpaRepository<DiemCanBang, Integer> {
    Optional<DiemCanBang> findByTen(String ten);
}
