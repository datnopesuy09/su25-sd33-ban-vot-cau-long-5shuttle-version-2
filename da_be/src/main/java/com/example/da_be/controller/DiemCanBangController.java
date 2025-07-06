package com.example.da_be.controller;

import com.example.da_be.entity.DiemCanBang;
import com.example.da_be.service.DiemCanBangService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:5173") // Cho phép kết nối từ React
@RequestMapping("/api/diem-can-bang")
public class DiemCanBangController {

    @Autowired
    private DiemCanBangService diemCanBangService;

    // Lấy danh sách tất cả điểm cân bằng
    @GetMapping
    public List<DiemCanBang> getAllDiemCanBang() {
        return diemCanBangService.getAllDiemCanBang();
    }

    // Lấy thông tin điểm cân bằng theo id
    @GetMapping("/{id}")
    public DiemCanBang getDiemCanBangById(@PathVariable int id) {
        return diemCanBangService.getDiemCanBangById(id);
    }

    // Xóa điểm cân bằng theo id
    @DeleteMapping("/{id}")
    public void deleteDiemCanBang(@PathVariable int id) {
        diemCanBangService.deleteDiemCanBangById(id);
    }

    // Thêm điểm cân bằng mới
    @PostMapping
    public DiemCanBang addDiemCanBang(@RequestBody DiemCanBang diemCanBang) {
        return diemCanBangService.saveOrUpdateDiemCanBang(diemCanBang);
    }

    // Cập nhật thông tin điểm cân bằng
    @PutMapping("/{id}")
    public DiemCanBang updateDiemCanBang(@PathVariable int id, @RequestBody DiemCanBang diemCanBang) {
        diemCanBang.setId(id);  // Đảm bảo ID trong body và path là giống nhau
        return diemCanBangService.saveOrUpdateDiemCanBang(diemCanBang);
    }
}
