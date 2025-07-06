package com.example.da_be.repository;


import com.example.da_be.entity.DoCung;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DoCungRepository extends JpaRepository<DoCung, Integer> {
    Optional<DoCung> findByTen(String ten);
}
