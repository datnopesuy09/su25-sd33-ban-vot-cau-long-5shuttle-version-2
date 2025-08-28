package com.example.da_be.controller;

import com.example.da_be.service.KhoHangService;
import com.example.da_be.service.HoaDonService;
import com.example.da_be.entity.HoaDon;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("/api/kho-hang")
public class KhoHangController {

    @Autowired
    private KhoHangService khoHangService;
    
    @Autowired
    private HoaDonService hoaDonService;

    /**
     * API để hoàn kho thủ công cho đơn hàng đã hủy
     */
    @PostMapping("/hoan-kho/{hoaDonId}")
    public ResponseEntity<?> restoreStockManually(@PathVariable Integer hoaDonId) {
        try {
            HoaDon hoaDon = hoaDonService.getHoaDonById(hoaDonId);
            if (hoaDon == null) {
                return ResponseEntity.badRequest().body("Không tìm thấy hóa đơn");
            }

            // Sử dụng method mới với kiểm tra duplicate
            khoHangService.manualRestoreStock(hoaDon, "ADMIN");
            return ResponseEntity.ok("Hoàn kho thành công cho đơn hàng #" + hoaDon.getMa());
            
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Lỗi khi hoàn kho: " + e.getMessage());
        }
    }

    /**
     * API kiểm tra tồn kho
     */
    @GetMapping("/kiem-tra-ton-kho/{sanPhamCTId}")
    public ResponseEntity<?> checkStock(@PathVariable Integer sanPhamCTId, 
                                       @RequestParam Integer soLuongYeuCau) {
        try {
            boolean available = khoHangService.checkStockAvailability(sanPhamCTId, soLuongYeuCau);
            return ResponseEntity.ok(Map.of(
                "sanPhamCTId", sanPhamCTId,
                "soLuongYeuCau", soLuongYeuCau,
                "coSan", available
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Lỗi khi kiểm tra tồn kho: " + e.getMessage());
        }
    }

    /**
     * API để admin force hoàn kho (CHỈ 1 LẦN) cho các trường hợp đặc biệt
     */
    @PostMapping("/force-hoan-kho/{hoaDonId}")
    public ResponseEntity<?> forceRestoreStock(@PathVariable Integer hoaDonId,
                                              @RequestBody Map<String, String> payload) {
        try {
            String reason = payload.get("reason");
            if (reason == null || reason.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Vui lòng nhập lý do hoàn kho");
            }

            HoaDon hoaDon = hoaDonService.getHoaDonById(hoaDonId);
            if (hoaDon == null) {
                return ResponseEntity.badRequest().body("Không tìm thấy hóa đơn");
            }

            // Sử dụng method mới với giới hạn 1 lần
            khoHangService.forceRestoreStock(hoaDon, reason, "ADMIN");
            
            return ResponseEntity.ok(Map.of(
                "message", "🚨 Force hoàn kho thành công cho đơn hàng #" + hoaDon.getMa() + " (1/1 lần)",
                "reason", reason,
                "timestamp", java.time.LocalDateTime.now().toString(),
                "orderId", hoaDon.getId(),
                "warning", "⚠️ Đã sử dụng hết lượt Force Restore cho đơn hàng này!"
            ));
            
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Lỗi khi force hoàn kho: " + e.getMessage());
        }
    }

    /**
     * API để lấy lịch sử hoàn kho
     */
    @GetMapping("/lich-su/{hoaDonId}")
    public ResponseEntity<?> getRestoreHistory(@PathVariable Integer hoaDonId) {
        try {
            HoaDon hoaDon = hoaDonService.getHoaDonById(hoaDonId);
            if (hoaDon == null) {
                return ResponseEntity.badRequest().body("Không tìm thấy hóa đơn");
            }

            boolean isRestored = khoHangService.isOrderAlreadyRestored(hoaDonId);
            int forceCount = khoHangService.getForceRestoreCount(hoaDonId);

            return ResponseEntity.ok(Map.of(
                "hoaDonId", hoaDonId,
                "isRestored", isRestored,
                "forceRestoreCount", forceCount,
                "canForceRestore", forceCount < 1,
                "maxForceLimit", 1,
                "warning", forceCount >= 1 ? "Đã hết lượt Force Restore" : "Còn " + (1 - forceCount) + " lượt Force"
            ));
            
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Lỗi khi lấy lịch sử: " + e.getMessage());
        }
    }

    /**
     * API để kiểm tra trạng thái đơn hàng và khả năng hoàn kho
     */
    @GetMapping("/trang-thai/{hoaDonId}")
    public ResponseEntity<?> checkOrderStatus(@PathVariable Integer hoaDonId) {
        try {
            HoaDon hoaDon = hoaDonService.getHoaDonById(hoaDonId);
            if (hoaDon == null) {
                return ResponseEntity.badRequest().body("Không tìm thấy hóa đơn");
            }

            boolean isRestored = khoHangService.isOrderAlreadyRestored(hoaDonId);
            int forceCount = khoHangService.getForceRestoreCount(hoaDonId);
            boolean canNormalRestore = hoaDon.getTrangThai() == 7 && !isRestored;
            boolean canForceRestore = forceCount < 1;

            return ResponseEntity.ok(Map.of(
                "hoaDonId", hoaDon.getId(),
                "maHoaDon", hoaDon.getMa(),
                "trangThai", hoaDon.getTrangThai(),
                "isRestored", isRestored,
                "forceRestoreCount", forceCount,
                "canNormalRestore", canNormalRestore,
                "canForceRestore", canForceRestore,
                "maxForceLimit", 1,
                "lastUpdated", java.time.LocalDateTime.now().toString()
            ));
            
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Lỗi khi kiểm tra trạng thái: " + e.getMessage());
        }
    }
}
