package com.example.da_be.mapper;

import com.example.da_be.dto.request.role.RoleRequest;
import com.example.da_be.dto.request.role.RoleUpdateRequest;
import com.example.da_be.dto.response.RoleResponse;
import com.example.da_be.entity.Role;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface RoleMapper {
    @Mapping(target = "permissions", ignore = true)
    Role toRole(RoleRequest request);

    RoleResponse toRoleResponse(Role role);

    @Mapping(target = "permissions", ignore = true)
    void updateRole(@MappingTarget Role role, RoleUpdateRequest request);
}
