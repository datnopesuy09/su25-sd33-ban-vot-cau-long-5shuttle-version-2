package com.example.da_be.repository;


import com.example.da_be.entity.MauSac;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MauSacRepository extends JpaRepository<MauSac, Integer> {
    Optional<MauSac> findByTen(String ten);
}
