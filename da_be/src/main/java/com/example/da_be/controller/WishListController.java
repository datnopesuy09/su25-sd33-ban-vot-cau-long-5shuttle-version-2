package com.example.da_be.controller;

import com.example.da_be.dto.request.ApiResponse;
import com.example.da_be.dto.request.WishList.AddToWishListRequest;
import com.example.da_be.dto.response.WishListResponse;
import com.example.da_be.service.WishListService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/wish-list")
@CrossOrigin(origins = "http://localhost:5173")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class WishListController {

    WishListService wishListService;

    @PostMapping
    ApiResponse<WishListResponse> addWishList(@RequestBody AddToWishListRequest request){
        return ApiResponse.<WishListResponse>builder()
                .result(wishListService.addToWishList(request))
                .code(1000)
                .build();
    }

    @GetMapping
    ApiResponse<WishListResponse> getList() {
        return ApiResponse.<WishListResponse>builder()
                .result(wishListService.getWishList())
                .code(1000)
                .build();
    }

    @DeleteMapping
    ApiResponse<WishListResponse> removeWishList(@RequestBody AddToWishListRequest request){
        return ApiResponse.<WishListResponse>builder()
                .result(wishListService.removeFromWishlist(request))
                .code(1000)
                .build();
    }



}
