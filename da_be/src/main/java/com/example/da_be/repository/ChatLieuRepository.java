package com.example.da_be.repository;


import com.example.da_be.entity.ChatLieu;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ChatLieuRepository extends JpaRepository<ChatLieu, Integer> {
    Optional<ChatLieu> findByTen(String ten);
}
