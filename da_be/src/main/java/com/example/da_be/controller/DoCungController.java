package com.example.da_be.controller;

import com.example.da_be.entity.DoCung;
import com.example.da_be.service.DoCungService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:5173") // Cho phép kết nối từ React
@RequestMapping("/api/do-cung")
public class DoCungController {

    @Autowired
    private DoCungService doCungService;

    // Lấy danh sách tất cả độ cứng
    @GetMapping
    public List<DoCung> getAllDoCung() {
        return doCungService.getAllDoCung();
    }

    // Lấy thông tin độ cứng theo id
    @GetMapping("/{id}")
    public DoCung getDoCungById(@PathVariable int id) {
        return doCungService.getDoCungById(id);
    }

    // Xóa độ cứng theo id
    @DeleteMapping("/{id}")
    public void deleteDoCung(@PathVariable int id) {
        doCungService.deleteDoCungById(id);
    }

    // Thêm độ cứng mới
    @PostMapping
    public DoCung addDoCung(@RequestBody DoCung doCung) {
        return doCungService.saveOrUpdateDoCung(doCung);
    }

    // Cập nhật thông tin độ cứng
    @PutMapping("/{id}")
    public DoCung updateDoCung(@PathVariable int id, @RequestBody DoCung doCung) {
        doCung.setId(id);  // Đảm bảo ID trong body và path là giống nhau
        return doCungService.saveOrUpdateDoCung(doCung);
    }
}
