package com.example.da_be.controller;

import com.example.da_be.dto.request.ApiResponse;
import com.example.da_be.dto.request.UserProductList.UserProductListCreationRequest;
import com.example.da_be.dto.response.UserProductListResponse;
import com.example.da_be.service.UserProductListService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/user-product-list")
@CrossOrigin(origins = "http://localhost:5173")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class UserProductListController {

    UserProductListService userProductListService;

    @PostMapping
    ApiResponse<UserProductListResponse> createUserProductList(@RequestBody UserProductListCreationRequest request) {
        return ApiResponse.<UserProductListResponse>builder()
                .result(userProductListService.create(request))
                .code(1000)
                .build();
    }
}
