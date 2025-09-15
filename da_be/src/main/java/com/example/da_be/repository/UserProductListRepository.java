package com.example.da_be.repository;

import com.example.da_be.entity.UserProductList;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserProductListRepository extends JpaRepository<UserProductList, Integer> {
}
