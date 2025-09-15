package com.example.da_be.mapper;

import com.example.da_be.dto.request.UserProductList.UserProductListCreationRequest;
import com.example.da_be.dto.response.UserProductListResponse;
import com.example.da_be.entity.UserProductList;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UserProductListMapper {

    UserProductList toUserProductList(UserProductListCreationRequest request);

    @Mapping(source = "user.id", target = "userId")
    @Mapping(source = "sanPham.id",target = "productId")
    @Mapping(source = "createdAt",target = "createdAt")
    UserProductListResponse toUserProductListResponse(UserProductList userProductList);
}
