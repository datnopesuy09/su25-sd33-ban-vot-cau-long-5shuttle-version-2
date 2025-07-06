package com.example.da_be.controller;

import com.example.da_be.dto.GioHangDTO;
import com.example.da_be.entity.GioHang;
import com.example.da_be.service.GioHangService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("/api/gio-hang")
public class GioHangController {

    @Autowired
    private GioHangService gioHangService;

    @PostMapping("/them")
    public ResponseEntity<?> themSanPhamVaoGioHang(
            @RequestBody Map<String, Integer> payload) {
        try {
            Integer idTaiKhoan = payload.get("idTaiKhoan");
            Integer idSanPhamCT = payload.get("idSanPhamCT");
            Integer soLuong = payload.get("soLuong");

            GioHang gioHang = gioHangService.themSanPhamVaoGioHang(idTaiKhoan, idSanPhamCT, soLuong);
            return new ResponseEntity<>(gioHang, HttpStatus.CREATED);

        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    @GetMapping("/{idTaiKhoan}")
    public ResponseEntity<List<GioHangDTO>> getGioHangByTaiKhoan(@PathVariable Integer idTaiKhoan) {
        List<GioHangDTO> gioHangList = gioHangService.getGioHangByTaiKhoan(idTaiKhoan);
        return new ResponseEntity<>(gioHangList, HttpStatus.OK);
    }
    @GetMapping("/{idTaiKhoan}/total")
    public ResponseEntity<Double> getTotalPrice(@PathVariable Integer idTaiKhoan) {
        double totalPrice = gioHangService.calculateTotalPrice(idTaiKhoan);
        return new ResponseEntity<>(totalPrice, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> xoaSanPhamKhoiGioHang(@PathVariable Integer id) {
        try {
            gioHangService.xoaSanPhamKhoiGioHang(id);
            return new ResponseEntity<>(HttpStatus.OK);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }


    @DeleteMapping("/xoa/{idTaiKhoan}")
    public ResponseEntity<?> xoaGioHangByTaiKhoan(@PathVariable Integer idTaiKhoan) {
        try {
            gioHangService.xoaGioHangByTaiKhoan(idTaiKhoan);
            return new ResponseEntity<>(HttpStatus.OK);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }



    @PutMapping("/{id}")
    public ResponseEntity<?> capNhatSoLuong(
            @PathVariable Integer id,
            @RequestBody Map<String, Integer> payload) {
        try {
            Integer soLuong = payload.get("soLuong");
            gioHangService.capNhatSoLuong(id, soLuong);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException iae) {
            return ResponseEntity.badRequest().body(iae.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Lỗi server");
        }
    }



    @GetMapping("/{idTaiKhoan}/count")
    public ResponseEntity<Integer> getTotalItemCount(@PathVariable Integer idTaiKhoan) {
        int totalCount = gioHangService.getTotalItemCount(idTaiKhoan);
        return new ResponseEntity<>(totalCount, HttpStatus.OK);
    }

}
