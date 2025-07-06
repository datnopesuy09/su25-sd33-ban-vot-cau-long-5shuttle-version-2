package com.example.da_be.controller;

import com.example.da_be.entity.MauSac;
import com.example.da_be.service.MauSacService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:5173") // Cho phép kết nối từ React
@RequestMapping("/api/mau-sac")
public class MauSacController {

    @Autowired
    private MauSacService mauSacService;

    // Lấy danh sách tất cả màu sắc
    @GetMapping
    public List<MauSac> getAllMauSac() {
        return mauSacService.getAllMauSac();
    }

    // Lấy thông tin màu sắc theo id
    @GetMapping("/{id}")
    public MauSac getMauSacById(@PathVariable int id) {
        return mauSacService.getMauSacById(id);
    }

    // Xóa màu sắc theo id
    @DeleteMapping("/{id}")
    public void deleteMauSac(@PathVariable int id) {
        mauSacService.deleteMauSacById(id);
    }

    // Thêm màu sắc mới
    @PostMapping
    public MauSac addMauSac(@RequestBody MauSac mauSac) {
        return mauSacService.saveOrUpdateMauSac(mauSac);
    }

    // Cập nhật thông tin màu sắc
    @PutMapping("/{id}")
    public MauSac updateMauSac(@PathVariable int id, @RequestBody MauSac mauSac) {
        mauSac.setId(id);  // Đảm bảo ID trong body và path là giống nhau
        return mauSacService.saveOrUpdateMauSac(mauSac);
    }
}
