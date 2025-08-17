        package com.example.da_be.controller;

import com.example.da_be.dto.TraHangDTO;
import com.example.da_be.entity.TraHang;
import com.example.da_be.repository.TraHangRepository;
import com.example.da_be.service.HoaDonCTService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/tra-hang")
public class TraHangController {

    @Autowired
    private TraHangRepository traHangRepository;
    @Autowired
    private HoaDonCTService hoaDonCTService;


    @GetMapping("/hoa-don/{hoaDonId}")
    public ResponseEntity<List<TraHangDTO>> getTraHangByHoaDonId(@PathVariable Integer hoaDonId) {
        List<TraHangDTO> traHangs = hoaDonCTService.getTraHangByHoaDon(hoaDonId);
        return ResponseEntity.ok(traHangs);
    }

    @PostMapping
    public ResponseEntity<TraHang> createTraHang(@RequestBody TraHang traHang) {
//        traHang.setNgayTao(LocalDateTime.now());
        traHang.setTrangThai(0); // Chờ duyệt
        TraHang savedTraHang = traHangRepository.save(traHang);
        return ResponseEntity.ok(savedTraHang);
    }
}
