package com.example.da_be.mapper;

import com.example.da_be.dto.request.permission.PermissionRequest;
import com.example.da_be.dto.response.PermissionResponse;
import com.example.da_be.entity.Permission;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface PermissionMapper {

    Permission toPermission(PermissionRequest request);

    PermissionResponse toPermissionResponse(Permission permission);
}
