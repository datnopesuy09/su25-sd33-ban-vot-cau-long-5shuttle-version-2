package com.example.da_be.controller;

import com.example.da_be.service.EnhancedKhoHangService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/enhanced-kho-hang")
@CrossOrigin(origins = "http://localhost:5173")
public class EnhancedKhoHangController {

    private static final Logger log = LoggerFactory.getLogger(EnhancedKhoHangController.class);

    @Autowired
    private EnhancedKhoHangService enhancedKhoHangService;

    /**
     * Cập nhật số lượng sản phẩm trong đơn hàng (Admin điều chỉnh)
     */
    @PutMapping("/update-quantity/{hoaDonCTId}")
    public ResponseEntity<?> updateOrderItemQuantity(
            @PathVariable Integer hoaDonCTId,
            @RequestBody Map<String, Object> request) {
        try {
            Integer newQuantity = (Integer) request.get("soLuong");
            String reason = (String) request.getOrDefault("reason", "Admin điều chỉnh số lượng");

            log.info("Cập nhật số lượng: hoaDonCTId={}, newQuantity={}", hoaDonCTId, newQuantity);

            enhancedKhoHangService.updateOrderItemQuantity(hoaDonCTId, newQuantity, reason);

            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Cập nhật số lượng thành công"
            ));

        } catch (Exception e) {
            log.error("Lỗi khi cập nhật số lượng: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Lỗi: " + e.getMessage()
            ));
        }
    }

    /**
     * Xác nhận đơn hàng: chuyển 1 -> 2 và trừ kho theo số lượng hiện tại
     */
    @PutMapping("/confirm-order/{hoaDonId}")
    public ResponseEntity<?> confirmOrder(@PathVariable Integer hoaDonId) {
        try {
            log.info("Xác nhận đơn hàng: hoaDonId={}", hoaDonId);

            enhancedKhoHangService.confirmOrder(hoaDonId, "Admin xác nhận đơn hàng");

            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Đã chuyển sang 'Chờ giao hàng' và trừ kho theo đơn"
            ));

        } catch (Exception e) {
            log.error("Lỗi khi xác nhận đơn hàng: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Lỗi: " + e.getMessage()
            ));
        }
    }

    /**
     * Xác nhận giao hàng: chuyển 2 -> 3 và confirm allocations (không đổi stock)
     */
    @PutMapping("/confirm-shipping/{hoaDonId}")
    public ResponseEntity<?> confirmShipping(@PathVariable Integer hoaDonId) {
        try {
            log.info("Xác nhận giao hàng: hoaDonId={}", hoaDonId);

            enhancedKhoHangService.confirmShipping(hoaDonId, "Admin xác nhận giao hàng");

            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Đã chuyển sang 'Đang vận chuyển'"
            ));

        } catch (Exception e) {
            log.error("Lỗi khi xác nhận giao hàng: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Lỗi: " + e.getMessage()
            ));
        }
    }

    /**
     * Rollback từ 'Chờ giao hàng' về 'Chờ xác nhận' và hoàn kho (ALLOCATED -> RESERVED)
     */
    @PutMapping("/revert-to-pending/{hoaDonId}")
    public ResponseEntity<?> revertToPending(@PathVariable Integer hoaDonId) {
        try {
            log.info("Rollback đơn hàng về 'Chờ xác nhận': hoaDonId={}", hoaDonId);
            enhancedKhoHangService.revertAllocationsToReserved(hoaDonId, "Admin quay lại trạng thái trước");
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Đã quay về 'Chờ xác nhận' và hoàn kho"
            ));
        } catch (Exception e) {
            log.error("Lỗi khi rollback: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Lỗi: " + e.getMessage()
            ));
        }
    }

    /**
     * Thêm sản phẩm vào đơn hàng
     */
    @PostMapping("/add-product")
    public ResponseEntity<?> addProductToOrder(@RequestBody Map<String, Object> request) {
        try {
            Integer hoaDonId = (Integer) request.get("hoaDonId");
            Integer sanPhamCTId = (Integer) request.get("sanPhamCTId");
            Integer quantity = (Integer) request.get("quantity");
            String reason = (String) request.getOrDefault("reason", "Admin thêm sản phẩm");

            log.info("Thêm sản phẩm: hoaDonId={}, sanPhamCTId={}, quantity={}", 
                    hoaDonId, sanPhamCTId, quantity);

            enhancedKhoHangService.addProductToOrder(hoaDonId, sanPhamCTId, quantity, reason);

            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Thêm sản phẩm thành công"
            ));

        } catch (Exception e) {
            log.error("Lỗi khi thêm sản phẩm: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Lỗi: " + e.getMessage()
            ));
        }
    }

    /**
     * Xóa sản phẩm khỏi đơn hàng
     */
    @DeleteMapping("/remove-product/{hoaDonCTId}")
    public ResponseEntity<?> removeProductFromOrder(
            @PathVariable Integer hoaDonCTId,
            @RequestParam(defaultValue = "Admin xóa sản phẩm") String reason) {
        try {
            log.info("Xóa sản phẩm: hoaDonCTId={}", hoaDonCTId);

            enhancedKhoHangService.removeProductFromOrder(hoaDonCTId, reason);

            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Xóa sản phẩm thành công"
            ));

        } catch (Exception e) {
            log.error("Lỗi khi xóa sản phẩm: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Lỗi: " + e.getMessage()
            ));
        }
    }

    /**
     * Hủy đơn hàng và hoàn stock
     */
    @PutMapping("/cancel-order/{hoaDonId}")
    public ResponseEntity<?> cancelOrder(
            @PathVariable Integer hoaDonId,
            @RequestParam(defaultValue = "Admin hủy đơn hàng") String reason) {
        try {
            log.info("Hủy đơn hàng: hoaDonId={}", hoaDonId);

            enhancedKhoHangService.cancelOrder(hoaDonId, reason, "ADMIN");

            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Hủy đơn hàng thành công"
            ));

        } catch (Exception e) {
            log.error("Lỗi khi hủy đơn hàng: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Lỗi: " + e.getMessage()
            ));
        }
    }

    /**
     * Kiểm tra stock allocation cho đơn hàng
     */
    @GetMapping("/check-allocation/{hoaDonId}")
    public ResponseEntity<?> checkOrderAllocation(@PathVariable Integer hoaDonId) {
        try {
            // TODO: Implement logic to check if order has proper allocation
            return ResponseEntity.ok(Map.of(
                "success", true,
                "canConfirm", true,
                "warnings", new String[]{}
            ));

        } catch (Exception e) {
            log.error("Lỗi khi kiểm tra allocation: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Lỗi: " + e.getMessage()
            ));
        }
    }
}