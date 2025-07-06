package com.example.da_be.controller;

import com.example.da_be.dto.request.PhieuGiamGiaRequest;
import com.example.da_be.dto.response.PhieuGiamGiaResponse;
import com.example.da_be.entity.PhieuGiamGia;
import com.example.da_be.service.PhieuGiamGiaService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.text.ParseException;
import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("/api/phieu-giam-gia")
public class PhieuGiamGiaController {
    @Autowired
    private PhieuGiamGiaService phieuGiamGiaService;

    @GetMapping("/hien-thi")
    public List<PhieuGiamGiaResponse> getAllPhieuGiamGia() {
        return phieuGiamGiaService.getAllPhieuGiamGia();
    }

    @PostMapping("/add")
    public PhieuGiamGia addPhieuGiamGia(@RequestBody @Valid PhieuGiamGiaRequest phieuGiamGiaRequest) {
        return phieuGiamGiaService.addPhieuGiamGia(phieuGiamGiaRequest);
    }

    @DeleteMapping("/delete/{id}")
    public Boolean deletePhieuGiamGia(@PathVariable Integer id) {
        return phieuGiamGiaService.deletePhieuGiamGia(id);
    }

    @PutMapping("/update/{id}")
    public PhieuGiamGia updatePhieuGiamGia(@PathVariable Integer id, @RequestBody PhieuGiamGiaRequest phieuGiamGiaRequest) throws ParseException {
        return phieuGiamGiaService.updatePhieuGiamGia(id, phieuGiamGiaRequest);
    }
    @GetMapping("/detail/{id}")
    public PhieuGiamGiaResponse getPhieuGiamGiaById(@PathVariable Integer id) {
        return phieuGiamGiaService.getPhieuGiamGiaById(id);
    }

    @GetMapping("/list-ma-phieu-giam-gia")
    public List<String> getAllMaPhieuGiamGia() {
        return phieuGiamGiaService.getAllMaPhieuGiamGia();
    }

    @GetMapping("/list-ten-phieu-giam-gia")
    public List<String> getAllTePhieuGiamGia() {
        return phieuGiamGiaService.getAllTenPhieuGiamGia();
    }

}

