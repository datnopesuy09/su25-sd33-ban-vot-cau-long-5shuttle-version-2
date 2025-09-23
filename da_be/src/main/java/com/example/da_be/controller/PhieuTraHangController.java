package com.example.da_be.controller;

import com.example.da_be.dto.request.ApiResponse;
import com.example.da_be.dto.request.PhieuTraHang.CreationPhieuTraHangOnlineRequest;
import com.example.da_be.dto.request.PhieuTraHang.PhieuTraHangApprovalRequest;
import com.example.da_be.dto.response.PhieuTraHangResponse;
import com.example.da_be.dto.response.SanPhamTraResponse;
import com.example.da_be.service.PhieuTraHangService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/phieu-tra-hang")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
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

    @GetMapping
    public ApiResponse<List<PhieuTraHangResponse>> getMyPhieuTraHang(){
        return ApiResponse.<List<PhieuTraHangResponse>>builder()
                .result(phieuTraHangService.getMyOnlineReturns())
                .code(1000)
                .build();
    }

    @GetMapping("/all")
    public ApiResponse<List<PhieuTraHangResponse>> getAllPhieuTraHang(){
        return ApiResponse.<List<PhieuTraHangResponse>>builder()
                .result(phieuTraHangService.getAllOnlineOrders())
                .code(1000)
                .build();
    }

    @PutMapping
    public ApiResponse<PhieuTraHangResponse> approvePhieuTraHang(@RequestBody PhieuTraHangApprovalRequest request){
        return ApiResponse.<PhieuTraHangResponse>builder()
                .result(phieuTraHangService.approveReturn(request))
                .build();
    }

//    @GetMapping("/{id}/products")
//    public ApiResponse<List<SanPhamTraResponse>> getReturnProducts(@PathVariable Integer id) {
//        return ApiResponse.<List<SanPhamTraResponse>>builder()
//                .result(phieuTraHangService.getReturnProductsByPhieuTraHangId(id))
//                .code(1000)
//                .build();
//    }

    @GetMapping("/by-order/{orderId}")
    public ApiResponse<PhieuTraHangResponse> getByOrderId(@PathVariable Integer orderId) {
        return ApiResponse.<PhieuTraHangResponse>builder()
                .result(phieuTraHangService.getByOrderId(orderId))
                .code(1000)
                .build();
    }

    @GetMapping("/{phieuTraHangId}/calculate-refund")
    public ApiResponse<BigDecimal> calculateRefundAmount(@PathVariable Integer phieuTraHangId) {
        return ApiResponse.<BigDecimal>builder()
                .result(phieuTraHangService.calculateRefundAmountForPhieu(phieuTraHangId))
                .code(1000)
                .message("Tính toán số tiền hoàn trả thành công")
                .build();
    }

}
