package com.example.da_be.service;

import com.example.da_be.dto.request.role.RoleRequest;
import com.example.da_be.dto.request.role.RoleUpdateRequest;
import com.example.da_be.dto.response.RoleResponse;
import com.example.da_be.exception.AppException;
import com.example.da_be.exception.ErrorCode;
import com.example.da_be.mapper.RoleMapper;
import com.example.da_be.repository.PermissionRepository;
import com.example.da_be.repository.RoleRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;

@Slf4j
@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class RoleService {

    RoleRepository roleRepository;
    PermissionRepository permissionRepository;
    RoleMapper roleMapper;

    public RoleResponse createRole(RoleRequest roleRequest){
        var role = roleMapper.toRole(roleRequest);

        var permissions = permissionRepository.findAllById(roleRequest.getPermissions());
        role.setPermissions(new HashSet<>(permissions));

        role = roleRepository.save(role);

        return roleMapper.toRoleResponse(role);
    }

    public List<RoleResponse> getAll() {
        return roleRepository.findAll()
                .stream()
                .map(roleMapper::toRoleResponse)
                .toList();
    }

    public RoleResponse updateRole(RoleUpdateRequest roleRequest, String roleName){
        var role = roleRepository.findByName(roleName)
                .orElseThrow(() -> new AppException(ErrorCode.ROLEID_NOT_EXISTS));

        roleMapper.updateRole(role, roleRequest);

        var permissions = permissionRepository.findAllByNameIn(roleRequest.getPermissions());
        role.setPermissions(new HashSet<>(permissions));
        return roleMapper.toRoleResponse(roleRepository.save(role));
    }
}
