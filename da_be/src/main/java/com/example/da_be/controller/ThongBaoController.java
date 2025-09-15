package com.example.da_be.controller;

import com.example.da_be.dto.InternalNotificationRequest;
import com.example.da_be.dto.InternalNotificationResponse;
import com.example.da_be.entity.ThongBao;
import com.example.da_be.service.ThongBaoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("/api/thong-bao")
public class ThongBaoController {

    @Autowired
    private ThongBaoService thongBaoService;

    // Lấy danh sách tất cả thông báo
    @GetMapping
    public ResponseEntity<List<ThongBao>> getAllThongBao() {
        try {
            return ResponseEntity.ok(thongBaoService.getAllThongBao());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    // Lấy thông tin thông báo theo ID
    @GetMapping("/{id}")
    public ResponseEntity<ThongBao> getThongBaoById(@PathVariable int id) {
        try {
            return ResponseEntity.ok(thongBaoService.getThongBaoById(id));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }

    // Thêm thông báo mới
    @PostMapping
    public ResponseEntity<ThongBao> addThongBao(@RequestBody ThongBao thongBao) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(thongBaoService.saveOrUpdateThongBao(thongBao));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    // Cập nhật trạng thái thông báo (chỉ cập nhật trạng thái)
    @PutMapping("/{id}")
    public ResponseEntity<ThongBao> updateTrangThaiThongBao(
            @PathVariable int id, 
            @RequestBody Map<String, Object> updates) {
        try {
            // Kiểm tra xem có field trangThai trong request không
            if (!updates.containsKey("trangThai")) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
            }
            
            Integer trangThai = (Integer) updates.get("trangThai");
            ThongBao updatedThongBao = thongBaoService.updateTrangThaiThongBao(id, trangThai);
            return ResponseEntity.ok(updatedThongBao);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    // Cập nhật toàn bộ thông tin thông báo
    @PutMapping("/{id}/full")
    public ResponseEntity<ThongBao> updateThongBao(@PathVariable int id, @RequestBody ThongBao thongBao) {
        try {
            thongBao.setId(id);
            return ResponseEntity.ok(thongBaoService.saveOrUpdateThongBao(thongBao));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    // Xóa thông báo theo ID
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteThongBao(@PathVariable int id) {
        try {
            thongBaoService.deleteThongBaoById(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    // Lấy danh sách thông báo theo idKhachHang
    @GetMapping("/khach-hang/{idKhachHang}")
    public ResponseEntity<List<ThongBao>> getThongBaoByKhachHang(@PathVariable int idKhachHang) {
        try {
            return ResponseEntity.ok(thongBaoService.getThongBaoByKhachHang(idKhachHang));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    // Tạo thông báo nội bộ (cho admin, nhân viên)
    @PostMapping("/internal")
    public ResponseEntity<InternalNotificationResponse> createInternalNotification(@RequestBody InternalNotificationRequest request) {
        try {
            InternalNotificationResponse response = thongBaoService.createInternalNotification(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
}