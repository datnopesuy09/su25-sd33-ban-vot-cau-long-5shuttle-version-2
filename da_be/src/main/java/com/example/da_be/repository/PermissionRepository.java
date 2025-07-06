package com.example.da_be.repository;

import com.example.da_be.entity.Permission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface PermissionRepository extends JpaRepository<Permission, Integer> {

    List<Permission> findAllByNameIn(Collection<String> names);
}
