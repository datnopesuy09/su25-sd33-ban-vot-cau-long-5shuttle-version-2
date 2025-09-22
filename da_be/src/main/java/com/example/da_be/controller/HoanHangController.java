package com.example.da_be.controller;

import com.example.da_be.dto.HoanHangDTO;
import com.example.da_be.dto.request.HoanHangRequest;
import com.example.da_be.dto.response.HoanHangResponse;
import com.example.da_be.service.HoanHangService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/hoan-hang")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class HoanHangController {

    private final HoanHangService hoanHangService;

    /**
     * Thực hiện hoàn hàng
     */
    @PostMapping
    public ResponseEntity<?> processReturn(@Valid @RequestBody HoanHangRequest request) {
        try {
            HoanHangResponse response = hoanHangService.processReturn(request);
            
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("message", "Hoàn hàng thành công");
            result.put("data", response);
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Lỗi khi hoàn hàng: " + e.getMessage());
            error.put("data", null);
            
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Lấy danh sách hoàn hàng theo hóa đơn
     */
    @GetMapping("/hoa-don/{hoaDonId}")
    public ResponseEntity<?> getReturnsByHoaDonId(@PathVariable Long hoaDonId) {
        try {
            List<HoanHangDTO> returns = hoanHangService.getReturnsByHoaDonId(hoaDonId);
            
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("message", "Lấy danh sách hoàn hàng thành công");
            result.put("data", returns);
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Lỗi khi lấy danh sách hoàn hàng: " + e.getMessage());
            error.put("data", null);
            
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Lấy chi tiết hoàn hàng theo ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getReturnById(@PathVariable Long id) {
        try {
            HoanHangDTO hoanHang = hoanHangService.getReturnById(id);
            
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("message", "Lấy chi tiết hoàn hàng thành công");
            result.put("data", hoanHang);
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Lỗi khi lấy chi tiết hoàn hàng: " + e.getMessage());
            error.put("data", null);
            
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Lấy hoàn hàng theo mã
     */
    @GetMapping("/ma/{maHoanHang}")
    public ResponseEntity<?> getReturnByMa(@PathVariable String maHoanHang) {
        try {
            HoanHangDTO hoanHang = hoanHangService.getReturnByMa(maHoanHang);
            
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("message", "Lấy hoàn hàng theo mã thành công");
            result.put("data", hoanHang);
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Lỗi khi lấy hoàn hàng theo mã: " + e.getMessage());
            error.put("data", null);
            
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Lấy tổng tiền hoàn hàng theo hóa đơn
     */
    @GetMapping("/tong-tien/{hoaDonId}")
    public ResponseEntity<?> getTotalReturnAmount(@PathVariable Long hoaDonId) {
        try {
            BigDecimal totalAmount = hoanHangService.getTotalReturnAmountByHoaDonId(hoaDonId);
            
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("message", "Lấy tổng tiền hoàn hàng thành công");
            result.put("data", totalAmount);
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Lỗi khi lấy tổng tiền hoàn hàng: " + e.getMessage());
            error.put("data", null);
            
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Lấy danh sách hoàn hàng với phân trang
     */
    @GetMapping("/all")
    public ResponseEntity<?> getAllReturns(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<HoanHangDTO> returns = hoanHangService.getAllReturns(pageable);
            
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("message", "Lấy danh sách hoàn hàng thành công");
            result.put("data", returns);
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Lỗi khi lấy danh sách hoàn hàng: " + e.getMessage());
            error.put("data", null);
            
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Kiểm tra số lượng có thể hoàn hàng
     */
    @GetMapping("/check-quantity/{hoaDonChiTietId}")
    public ResponseEntity<?> getAvailableReturnQuantity(@PathVariable Long hoaDonChiTietId) {
        try {
            Integer availableQuantity = hoanHangService.getAvailableReturnQuantity(hoaDonChiTietId);
            
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("message", "Lấy số lượng có thể hoàn thành công");
            result.put("data", availableQuantity);
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Lỗi khi kiểm tra số lượng có thể hoàn: " + e.getMessage());
            error.put("data", null);
            
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Lấy thống kê hoàn hàng theo tháng
     */
    @GetMapping("/stats/monthly")
    public ResponseEntity<?> getMonthlyReturnStats() {
        try {
            List<Object[]> stats = hoanHangService.getMonthlyReturnStats();
            
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("message", "Lấy thống kê hoàn hàng thành công");
            result.put("data", stats);
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Lỗi khi lấy thống kê hoàn hàng: " + e.getMessage());
            error.put("data", null);
            
            return ResponseEntity.badRequest().body(error);
        }
    }
}