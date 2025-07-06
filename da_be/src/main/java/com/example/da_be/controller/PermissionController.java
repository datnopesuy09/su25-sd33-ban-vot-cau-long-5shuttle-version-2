package com.example.da_be.controller;

import com.example.da_be.dto.request.ApiResponse;
import com.example.da_be.dto.request.permission.PermissionRequest;
import com.example.da_be.dto.response.PermissionResponse;
import com.example.da_be.service.PermissionService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/permissions")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class PermissionController {

    PermissionService permissionService;

    @PostMapping
    ApiResponse<PermissionResponse> create(@RequestBody PermissionRequest request){
        return ApiResponse.<PermissionResponse>builder()
                .result(permissionService.create(request))
                .build();
    }

    @GetMapping
    ApiResponse<List<PermissionResponse>> getAll(){
        return ApiResponse.<List<PermissionResponse>>builder()
                .result(permissionService.getAll())
                .build();
    }
}
