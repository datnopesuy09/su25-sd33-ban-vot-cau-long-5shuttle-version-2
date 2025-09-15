package com.example.da_be.mapper;

import com.example.da_be.dto.response.SanPhamResponse;
import com.example.da_be.dto.response.WishListResponse;
import com.example.da_be.entity.SanPham;
import com.example.da_be.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface WishListMapper {

    SanPhamResponse toSanPhamResponse(SanPham sanPham);

    List<SanPhamResponse> toSanPhamResponses(List<SanPham> sanPhams);

    @Mapping(target = "userId", source = "id")
    @Mapping(target = "userEmail", source = "email")
    @Mapping(target = "sanPhamList", source = "sanPhams")
    WishListResponse toWishlistResponse(User user);
}
