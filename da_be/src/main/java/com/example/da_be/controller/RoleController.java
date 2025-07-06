package com.example.da_be.controller;

import com.example.da_be.dto.request.ApiResponse;
import com.example.da_be.dto.request.role.RoleRequest;
import com.example.da_be.dto.request.role.RoleUpdateRequest;
import com.example.da_be.dto.response.RoleResponse;
import com.example.da_be.service.RoleService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/roles")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class RoleController {

    RoleService roleService;

    @PostMapping
    ApiResponse<RoleResponse> createRole(@RequestBody RoleRequest roleRequest){
        return ApiResponse.<RoleResponse>builder()
                .result(roleService.createRole(roleRequest))
                .build();
    }

    @GetMapping
    ApiResponse<List<RoleResponse>> getAll() {
        return ApiResponse.<List<RoleResponse>>builder()
                .result(roleService.getAll())
                .build();
    }

    @PutMapping("/{roleName}")
    ApiResponse<RoleResponse> updateRole(@PathVariable("roleName") String roleName, @RequestBody RoleUpdateRequest roleRequest){
        return ApiResponse.<RoleResponse>builder()
                .result(roleService.updateRole(roleRequest, roleName))
                .code(1000)
                .build();
    }
}
