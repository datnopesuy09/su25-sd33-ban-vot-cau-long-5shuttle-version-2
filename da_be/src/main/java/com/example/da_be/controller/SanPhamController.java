package com.example.da_be.controller;


import com.example.da_be.entity.SanPham;
import com.example.da_be.service.SanPhamService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:5173") // Cho phép frontend truy cập
@RestController
@RequestMapping("/api/san-pham")
public class SanPhamController {

    @Autowired
    private SanPhamService sanPhamService;

    @GetMapping
    public List<SanPham> getAll() {
        return sanPhamService.getAll();
    }

    @GetMapping("/{id}")
    public SanPham getById(@PathVariable int id) {
        return sanPhamService.getById(id);
    }

    @PostMapping
    public SanPham create(@RequestBody SanPham sanPham) {
        return sanPhamService.create(sanPham);
    }

    @PutMapping("/{id}")
    public SanPham update(@PathVariable int id, @RequestBody SanPham sanPham) {
        return sanPhamService.update(id, sanPham);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable int id) {
        sanPhamService.delete(id);
    }
}
