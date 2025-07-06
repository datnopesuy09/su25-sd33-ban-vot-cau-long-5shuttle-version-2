package com.example.da_be.controller;

import com.example.da_be.entity.TrongLuong;
import com.example.da_be.service.TrongLuongService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:5173") // Cho phép kết nối từ React
@RequestMapping("/api/trong-luong")
public class TrongLuongController {

    @Autowired
    private TrongLuongService trongLuongService;

    // Lấy danh sách tất cả trọng lượng
    @GetMapping
    public List<TrongLuong> getAllTrongLuong() {
        return trongLuongService.getAllTrongLuong();
    }

    // Lấy thông tin trọng lượng theo id
    @GetMapping("/{id}")
    public TrongLuong getTrongLuongById(@PathVariable int id) {
        return trongLuongService.getTrongLuongById(id);
    }

    // Xóa trọng lượng theo id
    @DeleteMapping("/{id}")
    public void deleteTrongLuong(@PathVariable int id) {
        trongLuongService.deleteTrongLuongById(id);
    }

    // Thêm trọng lượng mới
    @PostMapping
    public TrongLuong addTrongLuong(@RequestBody TrongLuong trongLuong) {
        return trongLuongService.saveOrUpdateTrongLuong(trongLuong);
    }

    // Cập nhật thông tin trọng lượng
    @PutMapping("/{id}")
    public TrongLuong updateTrongLuong(@PathVariable int id, @RequestBody TrongLuong trongLuong) {
        trongLuong.setId(id);  // Đảm bảo ID trong body và path là giống nhau
        return trongLuongService.saveOrUpdateTrongLuong(trongLuong);
    }
}
