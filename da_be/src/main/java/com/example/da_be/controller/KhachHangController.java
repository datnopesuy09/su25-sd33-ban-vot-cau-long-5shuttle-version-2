package com.example.da_be.controller;

import com.example.da_be.dto.request.ApiResponse;
import com.example.da_be.dto.request.KhachHang.KhachHangCreationRequest;
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


}
