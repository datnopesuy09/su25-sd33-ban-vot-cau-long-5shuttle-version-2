package com.example.da_be.controller;

import com.example.da_be.dto.SanPhamKhuyenMaiDTO;
import com.example.da_be.entity.SanPhamKhuyenMai;
import com.example.da_be.service.SanPhamKhuyenMaiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("/api/san-pham-khuyen-mai")
public class SanPhamKhuyenMaiController {

    @Autowired
    private SanPhamKhuyenMaiService sanPhamKhuyenMaiService;

    // Lấy danh sách tất cả sản phẩm khuyến mãi
    @GetMapping
    public List<SanPhamKhuyenMai> getAllSanPhamKhuyenMai() {
        return sanPhamKhuyenMaiService.getAllSanPhamKhuyenMai();
    }

    // Lấy thông tin sản phẩm khuyến mãi theo id
    @GetMapping("/{id}")
    public SanPhamKhuyenMai getSanPhamKhuyenMaiById(@PathVariable int id) {
        return sanPhamKhuyenMaiService.getSanPhamKhuyenMaiById(id);
    }

    // Xóa sản phẩm khuyến mãi theo id
    @DeleteMapping("/{id}")
    public void deleteSanPhamKhuyenMai(@PathVariable int id) {
        sanPhamKhuyenMaiService.deleteSanPhamKhuyenMaiById(id);
    }

    // Thêm sản phẩm khuyến mãi mới
    @PostMapping
    public SanPhamKhuyenMai addSanPhamKhuyenMai(@RequestBody SanPhamKhuyenMai sanPhamKhuyenMai) {
        return sanPhamKhuyenMaiService.saveOrUpdateSanPhamKhuyenMai(sanPhamKhuyenMai);
    }

    // Cập nhật thông tin sản phẩm khuyến mãi
    @PutMapping("/{id}")
    public SanPhamKhuyenMai updateSanPhamKhuyenMai(@PathVariable int id, @RequestBody SanPhamKhuyenMai sanPhamKhuyenMai) {
        sanPhamKhuyenMai.setId(id);  // Đảm bảo ID trong body và path là giống nhau
        return sanPhamKhuyenMaiService.saveOrUpdateSanPhamKhuyenMai(sanPhamKhuyenMai);
    }

    @GetMapping("/san-pham-ct/{sanPhamCtId}")
    public ResponseEntity<List<SanPhamKhuyenMaiDTO>> getSanPhamKhuyenMaiBySanPhamCtId(
            @PathVariable Integer sanPhamCtId) {
        List<SanPhamKhuyenMaiDTO> sanPhamKhuyenMais = sanPhamKhuyenMaiService.getSanPhamKhuyenMaiBySanPhamCtId(sanPhamCtId);

        if (sanPhamKhuyenMais.isEmpty()) {
            return ResponseEntity.noContent().build();
        }

        return ResponseEntity.ok(sanPhamKhuyenMais);
    }

    @GetMapping("/san-pham/{idSanPhamCT}")
    public ResponseEntity<List<SanPhamKhuyenMai>> getSanPhamKhuyenMaiBySanPhamCTId(@PathVariable Integer idSanPhamCT) {
        List<SanPhamKhuyenMai> sanPhamKhuyenMais = sanPhamKhuyenMaiService.getSanPhamKhuyenMaiBySanPhamCTId(idSanPhamCT);

        if (sanPhamKhuyenMais.isEmpty()) {
            return ResponseEntity.noContent().build();
        }

        return ResponseEntity.ok(sanPhamKhuyenMais);
    }
}
