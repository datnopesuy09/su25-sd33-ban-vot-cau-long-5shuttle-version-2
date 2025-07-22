package com.example.da_be.repository;

import com.example.da_be.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Integer> {
    boolean existsByEmail(String email);

    Optional<User> findUserByEmail(String email);

    @Query("SELECT u.id FROM User u WHERE u.email = :email")
    Integer findIdByEmail(@Param("email") String email);
}
