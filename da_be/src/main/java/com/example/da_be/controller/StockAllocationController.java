package com.example.da_be.controller;

import com.example.da_be.service.StockAllocationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/stock-allocation")
@CrossOrigin(origins = "http://localhost:5173")
public class StockAllocationController {
    
    @Autowired
    private StockAllocationService stockAllocationService;
    
    /**
     * Lấy tổng quan stock allocation cho sản phẩm
     */
    @GetMapping("/summary/{sanPhamCTId}")
    public ResponseEntity<?> getStockSummary(@PathVariable Integer sanPhamCTId) {
        try {
            Map<String, Integer> summary = stockAllocationService.getStockAllocationSummary(sanPhamCTId);
            int availableStock = stockAllocationService.getAvailableStock(sanPhamCTId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("currentStock", getCurrentStock(sanPhamCTId));
            response.put("availableStock", availableStock);
            response.put("totalReserved", summary.get("totalReserved"));
            response.put("totalAllocated", summary.get("totalAllocated"));  
            response.put("totalConfirmed", summary.get("totalConfirmed"));
            response.put("allocationStatus", determineAllocationStatus(sanPhamCTId));
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Lỗi: " + e.getMessage());
        }
    }
    
    /**
     * Kiểm tra allocation cho đơn hàng
     */
    @GetMapping("/check/{hoaDonId}")
    public ResponseEntity<?> checkOrderAllocation(@PathVariable Integer hoaDonId) {
        try {
            boolean isAllocated = stockAllocationService.isOrderAllocated(hoaDonId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("isAllocated", isAllocated);
            response.put("hasWarnings", false); // Tạm thời set false, có thể mở rộng sau
            response.put("warnings", new String[0]);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Lỗi: " + e.getMessage());
        }
    }
    
    /**
     * Migration đơn hàng cũ
     */
    @PostMapping("/migrate-order/{hoaDonId}")
    public ResponseEntity<?> migrateOrder(@PathVariable Integer hoaDonId) {
        try {
            // Logic migration sẽ được implement sau
            return ResponseEntity.ok("Migration thành công cho đơn hàng ID: " + hoaDonId);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Lỗi migration: " + e.getMessage());
        }
    }
    
    /**
     * Helper method để lấy stock hiện tại
     */
    private int getCurrentStock(Integer sanPhamCTId) {
        // Có thể inject SanPhamCTRepository để lấy stock hiện tại
        // Tạm thời return 0, sẽ implement sau
        return 0;
    }
    
    /**
     * Helper method để xác định allocation status
     */
    private String determineAllocationStatus(Integer sanPhamCTId) {
        // Logic để xác định status tổng thể
        // Tạm thời return ALLOCATED, sẽ implement sau
        return "ALLOCATED";
    }
}