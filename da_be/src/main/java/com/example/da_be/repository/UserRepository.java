package com.example.da_be.repository;

import com.example.da_be.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Integer> {
    boolean existsByEmail(String email);
    boolean existsBySdt(String sdt);

    Optional<User> findUserByEmail(String email);

    @Query("SELECT u.id FROM User u WHERE u.email = :email")
    Integer findIdByEmail(@Param("email") String email);
    
    // Find customers by type and status
    List<User> findByUserTypeAndTrangThai(Integer userType, Integer trangThai);
    
    // Search customers by keyword
    @Query("SELECT u FROM User u WHERE u.userType = :userType AND u.trangThai = :trangThai AND " +
           "(u.hoTen LIKE :keyword OR u.email LIKE :keyword OR u.sdt LIKE :keyword OR u.cccd LIKE :keyword)")
    List<User> findByUserTypeAndTrangThaiAndSearchKeyword(
            @Param("userType") Integer userType, 
            @Param("trangThai") Integer trangThai, 
            @Param("keyword") String keyword);
}
