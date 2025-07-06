package com.example.da_be.controller;

import com.example.da_be.entity.ThanhToan;
import com.example.da_be.service.ThanhToanService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("/api/thanh-toan")
public class ThanhToanController {

    @Autowired
    private ThanhToanService thanhToanService;

    @GetMapping
    public List<ThanhToan> getAllThanhToan() {
        return thanhToanService.getAllThanhToan();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ThanhToan> getThanhToanById(@PathVariable int id) {
        ThanhToan thanhToan = thanhToanService.getThanhToanById(id);
        return new ResponseEntity<>(thanhToan, HttpStatus.OK);
    }

    @PostMapping
    public ResponseEntity<ThanhToan> addThanhToan(@RequestBody ThanhToan thanhToan) {
        ThanhToan createdThanhToan = thanhToanService.saveOrUpdateThanhToan(thanhToan);
        return new ResponseEntity<>(createdThanhToan, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ThanhToan> updateThanhToan(@PathVariable int id, @RequestBody ThanhToan thanhToan) {
        thanhToan.setId(id);
        ThanhToan updatedThanhToan = thanhToanService.saveOrUpdateThanhToan(thanhToan);
        return new ResponseEntity<>(updatedThanhToan, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteThanhToan(@PathVariable int id) {
        thanhToanService.deleteThanhToanById(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @GetMapping("/tai-khoan/{taiKhoanId}")
    public List<ThanhToan> getThanhToanByTaiKhoanId(@PathVariable Integer taiKhoanId) {
        return thanhToanService.getThanhToanByTaiKhoanId(taiKhoanId);
    }

    @GetMapping("/hoa-don/{hoaDonId}")
    public ResponseEntity<List<ThanhToan>> getThanhToanByHoaDonId(@PathVariable Integer hoaDonId) {
        List<ThanhToan> thanhToanList = thanhToanService.getThanhToanByHoaDonId(hoaDonId);
        return ResponseEntity.ok(thanhToanList);
    }


}
