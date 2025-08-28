package com.example.da_be.mapper;

import com.example.da_be.dto.request.KhachHang.KhachHangCreationRequest;
import com.example.da_be.dto.response.KhachHangResponse;
import com.example.da_be.entity.User;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface KhachHangMapper {

    User toKhachHang(KhachHangCreationRequest request);

    KhachHangResponse toKhachHangResponse(User user);





}
