package com.example.da_be.controller;

import com.example.da_be.dto.request.ApiResponse;
import com.example.da_be.dto.request.DiaChi.DiaChiCreationRequest;
import com.example.da_be.dto.request.DiaChi.DiaChiUpdateRequest;
import com.example.da_be.dto.request.KhachHang.KhachHangCreationRequest;
import com.example.da_be.dto.request.KhachHang.KhachHangUpdateRequest;
import com.example.da_be.dto.response.DiaChiResponse;
import com.example.da_be.dto.response.KhachHangResponse;
import com.example.da_be.entity.User;
import com.example.da_be.repository.KhachHangRepository;
import com.example.da_be.service.KhachHangService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import java.text.ParseException;
import java.util.List;
import java.util.Optional;
import java.util.logging.Level;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("khach-hang")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class KhachHangController {

    KhachHangService khachHangSevice;

    @GetMapping
    public ApiResponse<List<KhachHangResponse>> getAllKhachHang(){
        return ApiResponse.<List<KhachHangResponse>>builder()
                .result(khachHangSevice.getAllKhachHang())
                .code(1000)
                .build();
    }

    @PostMapping
    public ApiResponse<KhachHangResponse> addKhachHang(@RequestBody KhachHangCreationRequest request){
        return ApiResponse.<KhachHangResponse>builder()
                .result(khachHangSevice.createKhachHang(request))
                .code(1000)
                .build();
    }

    @GetMapping("/{khachHangId}")
    public ApiResponse<KhachHangResponse> getKhachHangByEmail(@PathVariable("khachHangId") Integer khachHangId){
        return ApiResponse.<KhachHangResponse>builder()
                .result(khachHangSevice.getKhachHangById(khachHangId))
                .code(1000)
                .build();
    }

    @PutMapping("/{khachHangId}")
    public ApiResponse<KhachHangResponse> updateKhachHang(@RequestBody KhachHangUpdateRequest request,
            @PathVariable("khachHangId") Integer khachHangId){
        return ApiResponse.<KhachHangResponse>builder()
                .result(khachHangSevice.updateKhachHang(request, khachHangId))
                .code(1000)
                .build();
    }

    @PostMapping("/add-address")
    public ApiResponse<DiaChiResponse> addAddress(@RequestBody DiaChiCreationRequest request){
        return ApiResponse.<DiaChiResponse>builder()
                .result(khachHangSevice.createDiaChi(request, request.getIdKhachHang()))
                .code(1000)
                .build();
    }

    @PutMapping("/update-address")
    public ApiResponse<DiaChiResponse> updateAddress(@RequestBody DiaChiUpdateRequest request){

        return ApiResponse.<DiaChiResponse>builder()
                .result(khachHangSevice.updateCustomerAddress(request, request.getId(), request.getIdKhachHang()))
                .build();

    }

}
