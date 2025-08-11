package com.example.da_be.controller;

import com.example.da_be.entity.ThongBao;
import com.example.da_be.service.ThongBaoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:5173") // Cho phép kết nối từ React
@RequestMapping("/api/thong-bao")
public class ThongBaoController {

    @Autowired
    private ThongBaoService thongBaoService;

    // Lấy danh sách tất cả thông báo
    @GetMapping
    public ResponseEntity<List<ThongBao>> getAllThongBao() {
        return ResponseEntity.ok(thongBaoService.getAllThongBao());
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
            return ResponseEntity.status(HttpStatus.CREATED).body(thongBaoService.saveOrUpdateThongBao(thongBao));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }

    // Cập nhật thông tin thông báo
    @PutMapping("/{id}")
    public ResponseEntity<ThongBao> updateThongBao(@PathVariable int id, @RequestBody ThongBao thongBao) {
        try {
            thongBao.setId(id); // Đảm bảo ID trong body và path là giống nhau
            return ResponseEntity.ok(thongBaoService.saveOrUpdateThongBao(thongBao));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
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
        return ResponseEntity.ok(thongBaoService.getThongBaoByKhachHang(idKhachHang));
    }
}