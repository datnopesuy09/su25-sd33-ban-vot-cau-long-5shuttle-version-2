package com.example.da_be.controller;

import com.example.da_be.dto.request.KhachHangRequest;
import com.example.da_be.dto.response.KhachHangResponse;
import com.example.da_be.service.KhachHangSevice;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.text.ParseException;
import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("/api/customers")
public class KhachHangController {

    @Autowired
    private KhachHangSevice khachHangSevice;

    @GetMapping("")
    public List<KhachHangResponse> getAllKhachHang() {
        return khachHangSevice.getAllKhachHang();
    }

    @GetMapping("/{id}")
    public KhachHangResponse getKhachHangId(@PathVariable Integer id) {
        return khachHangSevice.getKhachHangById(id);
    }

    @PostMapping("/add")
    public ResponseEntity<?> add(@RequestBody KhachHangRequest khachHangRequest) throws ParseException {
        return ResponseEntity.ok(khachHangSevice.addKhachHang(khachHangRequest));
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<?> update(@RequestBody KhachHangRequest khachHangRequest, @PathVariable Integer id) throws ParseException {
        return ResponseEntity.ok(khachHangSevice.updateKhachHang(khachHangRequest, id));
    }

    @PutMapping("/delete/{id}")
    public ResponseEntity<?> delete(@PathVariable Integer id) {
        return ResponseEntity.ok(khachHangSevice.deleteKhachHangById(id));
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
                khachHangSevice.searchKhachHang(hoTen, email, sdt, gioiTinh, trangThai, pageable)
        );
    }
}
