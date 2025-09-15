package com.example.da_be.service;

import com.example.da_be.dto.request.WishList.AddToWishListRequest;
import com.example.da_be.dto.response.WishListResponse;
import com.example.da_be.entity.SanPham;
import com.example.da_be.entity.User;
import com.example.da_be.exception.AppException;
import com.example.da_be.exception.ErrorCode;
import com.example.da_be.mapper.WishListMapper;
import com.example.da_be.repository.SanPhamRepository;
import com.example.da_be.repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class WishListService {

    UserRepository userRepository;

    SanPhamRepository sanPhamRepository;

    WishListMapper wishListMapper;

    public WishListResponse addToWishList(AddToWishListRequest request) {
        var contex = SecurityContextHolder.getContext();
        var email = contex.getAuthentication().getName();

        User user = userRepository.findUserByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.EMAIL_EXISTS));

        SanPham sanPham = sanPhamRepository.findById(request.getIdSanPham())
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_ID_NOT_EXISTS));

        user.getSanPhams().add(sanPham);
        userRepository.save(user);

        return wishListMapper.toWishlistResponse(user);
    }

    public WishListResponse getWishList() {
        var contex = SecurityContextHolder.getContext();
        var email = contex.getAuthentication().getName();

        User user = userRepository.findUserByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.EMAIL_EXISTS));

        return wishListMapper.toWishlistResponse(user);

    }

    public WishListResponse removeFromWishlist(AddToWishListRequest request) {
        var contex = SecurityContextHolder.getContext();
        var email = contex.getAuthentication().getName();

        User user = userRepository.findUserByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.EMAIL_EXISTS));

        user.getSanPhams().removeIf(sp -> sp.getId() == request.getIdSanPham());
        userRepository.save(user);

        return wishListMapper.toWishlistResponse(user);

    }
}
