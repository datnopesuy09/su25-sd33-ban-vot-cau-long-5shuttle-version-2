package com.example.da_be.service;

import com.example.da_be.dto.request.UserProductList.UserProductListCreationRequest;
import com.example.da_be.dto.response.UserProductListResponse;
import com.example.da_be.entity.SanPham;
import com.example.da_be.entity.User;
import com.example.da_be.entity.UserProductList;
import com.example.da_be.enums.LoaiDanhSach;
import com.example.da_be.exception.AppException;
import com.example.da_be.exception.ErrorCode;
import com.example.da_be.mapper.UserProductListMapper;
import com.example.da_be.repository.SanPhamRepository;
import com.example.da_be.repository.UserProductListRepository;
import com.example.da_be.repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Slf4j
@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class UserProductListService {

    UserRepository userRepository;
    UserProductListRepository userProductListRepository;
    UserProductListMapper userProductListMapper;
    SanPhamRepository sanPhamRepository;

    public UserProductListResponse create(UserProductListCreationRequest request){

        var context = SecurityContextHolder.getContext();
        var email = context.getAuthentication().getName();

        User user = userRepository.findUserByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.EMAIL_EXISTS));

        SanPham sanPham = sanPhamRepository.findById(request.getIdSanPham())
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_ID_NOT_EXISTS));

        UserProductList userProductList = userProductListMapper.toUserProductList(request);

        userProductList.setSanPham(sanPham);

        userProductList.setUser(user);

        userProductList.setLoaiDanhSach(LoaiDanhSach.WISHLIST);

        userProductList = userProductListRepository.save(userProductList);

        return userProductListMapper.toUserProductListResponse(userProductList);
    }


}
