package com.example.da_be.mapper;

import com.example.da_be.dto.request.NhanVien.NVCreationRequest;
import com.example.da_be.dto.request.User.UserCreationRequest;
import com.example.da_be.dto.request.User.UserUpdateRequest;
import com.example.da_be.dto.response.NhanVienResponse;
import com.example.da_be.dto.response.UserResponse;
import com.example.da_be.entity.Role;
import com.example.da_be.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface UserMapper {

    User toUser(UserCreationRequest request);

    UserResponse toUserResponse(User user);

    @Mapping(target = "roles", ignore = true)
    @Mapping(target = "avatar", ignore = true)
    @Mapping(target = "trangThai", ignore = true)
    void updateUser(@MappingTarget User user, UserUpdateRequest request);

    @Mapping(target = "role", expression = "java(getRoleName(user))")
    NhanVienResponse toNhanVienResponse(User user);

    default String getRoleName(User user) {
        return user.getRoles().stream()
                .findFirst()
                .map(Role::getName)
                .orElse(null);
    }

}
