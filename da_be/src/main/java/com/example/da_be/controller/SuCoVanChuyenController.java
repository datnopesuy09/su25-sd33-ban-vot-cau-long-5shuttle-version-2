package com.example.da_be.controller;

import com.example.da_be.dto.SuCoVanChuyenDTO;
import com.example.da_be.dto.SuCoVanChuyenRequest;
import com.example.da_be.dto.request.ApiResponse;
import com.example.da_be.entity.SuCoVanChuyen;
import com.example.da_be.service.SuCoVanChuyenService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/su-co-van-chuyen")
@RequiredArgsConstructor
// Bỏ wildcard '*' để tránh IllegalArgumentException khi allowCredentials=true (đã cấu hình global trong WebConfig)
@CrossOrigin(origins = {"http://localhost:5173","http://localhost:3000"})
public class SuCoVanChuyenController {

    private final SuCoVanChuyenService suCoVanChuyenService;

    /**
     * Tạo mới sự cố vận chuyển
     */
    @PostMapping
    public ResponseEntity<ApiResponse<SuCoVanChuyenDTO>> createIncident(@RequestBody SuCoVanChuyenRequest request) {
        ApiResponse<SuCoVanChuyenDTO> resp = new ApiResponse<>();
        try {
            SuCoVanChuyenDTO result = suCoVanChuyenService.createIncident(request);
            resp.setCode(200);
            resp.setMessage("SUCCESS");
            resp.setResult(result);
            return ResponseEntity.ok(resp);
        } catch (IllegalArgumentException e) {
            resp.setCode(400);
            resp.setMessage(e.getMessage());
            return ResponseEntity.badRequest().body(resp);
        } catch (Exception e) {
            resp.setCode(9999);
            resp.setMessage(e.getMessage());
            return ResponseEntity.badRequest().body(resp);
        }
    }

    /**
     * Cập nhật sự cố vận chuyển
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateIncident(@PathVariable Integer id, @RequestBody SuCoVanChuyenRequest request) {
        try {
            SuCoVanChuyenDTO result = suCoVanChuyenService.updateIncident(id, request);
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", "VALIDATION_ERROR",
                "message", e.getMessage()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", "UPDATE_FAILED",
                "message", e.getMessage()
            ));
        }
    }

    /**
     * Cập nhật trạng thái sự cố
     */
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateIncidentStatus(@PathVariable Integer id, @RequestBody Map<String, Integer> statusUpdate) {
        try {
            Integer newStatus = statusUpdate.get("trangThai");
            SuCoVanChuyenDTO result = suCoVanChuyenService.updateIncidentStatus(id, newStatus);
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", "VALIDATION_ERROR",
                "message", e.getMessage()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", "STATUS_UPDATE_FAILED",
                "message", e.getMessage()
            ));
        }
    }

    /**
     * Xóa sự cố vận chuyển
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteIncident(@PathVariable Integer id) {
        try {
            suCoVanChuyenService.deleteIncident(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Lấy sự cố theo ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<SuCoVanChuyenDTO> getIncidentById(@PathVariable Integer id) {
        return suCoVanChuyenService.getIncidentById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Lấy tất cả sự cố theo hóa đơn ID
     */
    @GetMapping("/hoa-don/{hoaDonId}")
    public ResponseEntity<List<SuCoVanChuyenDTO>> getIncidentsByHoaDonId(@PathVariable Integer hoaDonId) {
        List<SuCoVanChuyenDTO> incidents = suCoVanChuyenService.getIncidentsByHoaDonId(hoaDonId);
        return ResponseEntity.ok(incidents);
    }

    /**
     * Lấy tất cả sự cố
     */
    @GetMapping
    public ResponseEntity<List<SuCoVanChuyenDTO>> getAllIncidents() {
        List<SuCoVanChuyenDTO> incidents = suCoVanChuyenService.getAllIncidents();
        return ResponseEntity.ok(incidents);
    }

    /**
     * Lấy sự cố theo trạng thái
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<List<SuCoVanChuyenDTO>> getIncidentsByStatus(@PathVariable Integer status) {
        List<SuCoVanChuyenDTO> incidents = suCoVanChuyenService.getIncidentsByStatus(status);
        return ResponseEntity.ok(incidents);
    }

    /**
     * Lấy sự cố theo loại
     */
    @GetMapping("/type/{type}")
    public ResponseEntity<List<SuCoVanChuyenDTO>> getIncidentsByType(@PathVariable String type) {
        try {
            SuCoVanChuyen.LoaiSuCo loaiSuCo = SuCoVanChuyen.LoaiSuCo.valueOf(type.toUpperCase());
            List<SuCoVanChuyenDTO> incidents = suCoVanChuyenService.getIncidentsByType(loaiSuCo);
            return ResponseEntity.ok(incidents);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Lấy sự cố trong khoảng thời gian
     */
    @GetMapping("/date-range")
    public ResponseEntity<List<SuCoVanChuyenDTO>> getIncidentsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        List<SuCoVanChuyenDTO> incidents = suCoVanChuyenService.getIncidentsByDateRange(startDate, endDate);
        return ResponseEntity.ok(incidents);
    }

    /**
     * Lấy sự cố theo người báo cáo
     */
    @GetMapping("/reporter/{reporterId}")
    public ResponseEntity<List<SuCoVanChuyenDTO>> getIncidentsByReporter(@PathVariable Integer reporterId) {
        List<SuCoVanChuyenDTO> incidents = suCoVanChuyenService.getIncidentsByReporter(reporterId);
        return ResponseEntity.ok(incidents);
    }

    /**
     * Lấy sự cố chưa giải quyết
     */
    @GetMapping("/unresolved")
    public ResponseEntity<List<SuCoVanChuyenDTO>> getUnresolvedIncidents() {
        List<SuCoVanChuyenDTO> incidents = suCoVanChuyenService.getUnresolvedIncidents();
        return ResponseEntity.ok(incidents);
    }

    /**
     * Lấy thống kê sự cố theo trạng thái
     */
    @GetMapping("/stats/status")
    public ResponseEntity<Map<String, Long>> getIncidentStatsByStatus() {
        Map<String, Long> stats = suCoVanChuyenService.getIncidentStatsByStatus();
        return ResponseEntity.ok(stats);
    }

    /**
     * Lấy thống kê sự cố theo loại
     */
    @GetMapping("/stats/type")
    public ResponseEntity<Map<String, Long>> getIncidentStatsByType() {
        Map<String, Long> stats = suCoVanChuyenService.getIncidentStatsByType();
        return ResponseEntity.ok(stats);
    }

    /**
     * Kiểm tra hóa đơn có sự cố nào không
     */
    @GetMapping("/check/{hoaDonId}")
    public ResponseEntity<Map<String, Object>> checkIncidents(@PathVariable Integer hoaDonId) {
        boolean hasIncidents = suCoVanChuyenService.hasIncidents(hoaDonId);
        long count = suCoVanChuyenService.countIncidentsByHoaDon(hoaDonId);
        
        Map<String, Object> result = Map.of(
            "hasIncidents", hasIncidents,
            "count", count
        );
        
        return ResponseEntity.ok(result);
    }

    /**
     * Lấy sự cố gần đây nhất theo hóa đơn
     */
    @GetMapping("/latest/{hoaDonId}")
    public ResponseEntity<SuCoVanChuyenDTO> getLatestIncidentByHoaDon(@PathVariable Integer hoaDonId) {
        return suCoVanChuyenService.getLatestIncidentByHoaDon(hoaDonId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
