package com.example.da_be.controller;

import com.example.da_be.dto.request.NhanVienRequest;
import com.example.da_be.dto.response.NhanVienResponse;
import com.example.da_be.service.NhanVienService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.text.ParseException;
import java.util.List;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/nhan-vien")
public class NhanVienController {
    @Autowired
    private NhanVienService nhanVienService;

    @GetMapping("")
    public List<NhanVienResponse> getNhanVien() {
        return nhanVienService.getAllNhanVien();
    }

    @GetMapping("/{id}")
    public NhanVienResponse getNhanVienById(@PathVariable Integer id) {
        return nhanVienService.getNhanVienById(id);
    }

    @PostMapping("/add")
    public ResponseEntity<?> add(NhanVienRequest nhanVienRequest) throws ParseException {
        return ResponseEntity.ok(nhanVienService.add(nhanVienRequest));
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<?> update(NhanVienRequest nhanVienRequest, @PathVariable Integer id) throws ParseException {
        return ResponseEntity.ok(nhanVienService.update(nhanVienRequest, id));
    }

    @PutMapping("/delete/{id}")
    public ResponseEntity<?> delete(@PathVariable Integer id) {
        return ResponseEntity.ok(nhanVienService.delete(id));
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchNhanVien(
            @RequestParam(required = false) String hoTen,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String sdt,
            @RequestParam(required = false) Integer gioiTinh,
            @RequestParam(required = false) Integer trangThai,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(
                nhanVienService.searchNhanVien(hoTen, email, sdt, gioiTinh, trangThai, pageable)
        );
    }
}