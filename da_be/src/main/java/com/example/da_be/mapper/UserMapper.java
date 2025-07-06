package com.example.da_be.mapper;

import com.example.da_be.dto.request.User.UserCreationRequest;
import com.example.da_be.dto.request.User.UserUpdateRequest;
import com.example.da_be.dto.response.UserResponse;
import com.example.da_be.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface UserMapper {

    User toUser(UserCreationRequest request);

    UserResponse toUserResponse(User user);

    @Mapping(target = "roles", ignore = true)
    void updateUser(@MappingTarget User user, UserUpdateRequest request);
}
