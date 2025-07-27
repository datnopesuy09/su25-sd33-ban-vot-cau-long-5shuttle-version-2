package com.example.da_be.controller;

import com.example.da_be.dto.request.ApiResponse;
import com.example.da_be.dto.request.PhieuTraHang.CreationPhieuTraHangOnlineRequest;
import com.example.da_be.dto.response.PhieuTraHangResponse;
import com.example.da_be.service.PhieuTraHangService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/phieu-tra-hang")
@CrossOrigin(origins = "http://localhost:5173")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class PhieuTraHangController {

    PhieuTraHangService phieuTraHangService;

    @PostMapping
    public ApiResponse<PhieuTraHangResponse> createPhieuTraHang(@Valid @RequestBody CreationPhieuTraHangOnlineRequest request){
        return ApiResponse.<PhieuTraHangResponse>builder()
                .result(phieuTraHangService.createPhieuTraHangOnline(request))
                .code(1000)
                .build();
    }
}
