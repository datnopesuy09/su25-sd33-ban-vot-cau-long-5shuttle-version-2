package com.example.da_be.repository;

import com.example.da_be.dto.response.KhachHangResponse;
import com.example.da_be.entity.Role;
import com.example.da_be.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@Repository
public interface KhachHangRepository extends JpaRepository<User, Integer> {

    boolean existsByEmail(String email);

    List<User> findByRoles(Set<Role> roles);


}
