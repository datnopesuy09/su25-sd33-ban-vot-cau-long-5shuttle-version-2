package com.example.da_be.controller;

import com.example.da_be.dto.request.ApiResponse;
import com.example.da_be.dto.request.DiaChi.DiaChiCreationRequest;
import com.example.da_be.dto.request.DiaChi.DiaChiUpdateRequest;
import com.example.da_be.dto.response.DiaChiResponse;
import com.example.da_be.service.DiaChiService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/dia-chi")
@CrossOrigin(origins = "http://localhost:5173")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class DiaChiController {

    DiaChiService diaChiService;

    @GetMapping("/public/all")
    ApiResponse<List<DiaChiResponse>> getAllAddressesPublic(){
        return ApiResponse.<List<DiaChiResponse>>builder()
                .result(diaChiService.getAllDiaChi()) // Method mới
                .code(1000)
                .build();
    }


    @GetMapping("/public/by-user/{userId}")
    ApiResponse<List<DiaChiResponse>> getAddressByUserId(@PathVariable Integer userId){
        return ApiResponse.<List<DiaChiResponse>>builder()
                .result(diaChiService.getDiaChiByUserId(userId))
                .code(1000)
                .build();
    }

    @GetMapping("/getMyAddress")
    ApiResponse<List<DiaChiResponse>> getAll(){
        return ApiResponse.<List<DiaChiResponse>>builder()
                .result(diaChiService.getMyDiaChi())
                .code(1000)
                .build();
    }

    @PostMapping("/create")
    ApiResponse<DiaChiResponse> createDiaChi(@RequestBody DiaChiCreationRequest request){
        return ApiResponse.<DiaChiResponse>builder()
                .result(diaChiService.createDiaChi(request))
                .code(1000)
                .build();
    }

    @PutMapping("/update/{diaChiId}")
    ApiResponse<DiaChiResponse> updateDiaChi(@PathVariable("diaChiId") Integer diaChiId, @RequestBody DiaChiUpdateRequest request){
        return ApiResponse.<DiaChiResponse>builder()
                .result(diaChiService.updateDiaChi(request, diaChiId))
                .code(1000)
                .build();
    }

    @PutMapping("/update-loai/{diaChiId}")
    ApiResponse<DiaChiResponse> updateLoaiDiaChi(@PathVariable("diaChiId") Integer diaChiId){
        return ApiResponse.<DiaChiResponse>builder()
                .result(diaChiService.updateLoaiDiaChi(diaChiId))
                .code(1000)
                .build();
    }

    @DeleteMapping("/{diaChiId}")
    String deleteDiaChi(@PathVariable("diaChiId") Integer diaChiId){
        diaChiService.deleteDiaChi(diaChiId);
        return "Address has been deleted";
    }

    @GetMapping("/mac-dinh")
    ApiResponse<DiaChiResponse> getDiaChiMacDinh() {
        return ApiResponse.<DiaChiResponse>builder()
                .result(diaChiService.getDiaChiMacDinh())
                .code(1000)
                .build();
    }







    // API công khai để tạo địa chỉ cho user cụ thể (không cần token)
    @PostMapping("/public/create/{userId}")
    ApiResponse<DiaChiResponse> createDiaChiPublic(
            @PathVariable Integer userId,
            @RequestBody DiaChiCreationRequest request) {
        return ApiResponse.<DiaChiResponse>builder()
                .result(diaChiService.createDiaChiPublic(request, userId))
                .code(1000)
                .build();
    }

    // API công khai để cập nhật địa chỉ (không cần token)
    @PutMapping("/public/update/{diaChiId}")
    ApiResponse<DiaChiResponse> updateDiaChiPublic(
            @PathVariable Integer diaChiId,
            @RequestBody DiaChiUpdateRequest request) {
        return ApiResponse.<DiaChiResponse>builder()
                .result(diaChiService.updateDiaChiPublic(request, diaChiId))
                .code(1000)
                .build();
    }

    // API công khai để xóa địa chỉ (không cần token)
    @DeleteMapping("/public/{diaChiId}")
    ApiResponse<String> deleteDiaChiPublic(@PathVariable Integer diaChiId) {
        diaChiService.deleteDiaChiPublic(diaChiId);
        return ApiResponse.<String>builder()
                .result("Address has been deleted successfully")
                .code(1000)
                .build();
    }

    // API công khai để set địa chỉ mặc định cho user (không cần token)
    @PutMapping("/public/set-default/{diaChiId}/{userId}")
    ApiResponse<DiaChiResponse> setDefaultAddressPublic(
            @PathVariable Integer diaChiId,
            @PathVariable Integer userId) {
        return ApiResponse.<DiaChiResponse>builder()
                .result(diaChiService.setDefaultAddressPublic(diaChiId, userId))
                .code(1000)
                .build();
    }

    // API công khai để lấy địa chỉ mặc định của user (không cần token)
    @GetMapping("/public/default/{userId}")
    ApiResponse<DiaChiResponse> getDefaultAddressPublic(@PathVariable Integer userId) {
        return ApiResponse.<DiaChiResponse>builder()
                .result(diaChiService.getDefaultAddressPublic(userId))
                .code(1000)
                .build();
    }

    // API công khai để lấy chi tiết một địa chỉ (không cần token)
    @GetMapping("/public/{diaChiId}")
    ApiResponse<DiaChiResponse> getDiaChiByIdPublic(@PathVariable Integer diaChiId) {
        return ApiResponse.<DiaChiResponse>builder()
                .result(diaChiService.getDiaChiByIdPublic(diaChiId))
                .code(1000)
                .build();
    }
}
