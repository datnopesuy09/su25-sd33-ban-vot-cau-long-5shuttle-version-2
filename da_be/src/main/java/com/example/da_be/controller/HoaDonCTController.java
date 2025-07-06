package com.example.da_be.controller;

import com.example.da_be.dto.GioHangDTO;
import com.example.da_be.dto.HoaDonCTDTO;
import com.example.da_be.entity.GioHang;
import com.example.da_be.entity.HoaDonCT;
import com.example.da_be.exception.ResourceNotFoundException;
import com.example.da_be.service.GioHangService;
import com.example.da_be.service.HoaDonCTService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("/api/hoa-don-ct")
public class HoaDonCTController {

    @Autowired
    private HoaDonCTService hoaDonCTService;

    @GetMapping("/hoa-don/{idHoaDon}")
    public ResponseEntity<List<HoaDonCTDTO>> getHoaDonCTByHoaDon(@PathVariable Integer idHoaDon) {
        List<HoaDonCTDTO> hoaDonCTList = hoaDonCTService.getHoaDonCTByHoaDon(idHoaDon);
        return new ResponseEntity<>(hoaDonCTList, HttpStatus.OK);
    }



    @PutMapping("/update-quantity/{id}")
    public ResponseEntity<?> updateQuantity(
            @PathVariable Integer id,
            @RequestBody Map<String, Integer> payload
    ) {
        try {
            Integer newQuantity = payload.get("soLuong");
            hoaDonCTService.updateQuantity(id, newQuantity);
            return ResponseEntity.ok().build();
        } catch (ResourceNotFoundException e) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Hóa đơn chi tiết không tồn tại");
        } catch (IllegalArgumentException e) {
            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Có lỗi xảy ra: " + e.getMessage());
        }
    }


    @GetMapping
    public List<HoaDonCT> getAllHoaDonCT() {
        return hoaDonCTService.getAllHoaDonCT();
    }
    @GetMapping("/{id}")
    public HoaDonCT getHoaDonCTById(@PathVariable int id) {
        return hoaDonCTService.getHoaDonCTById(id);
    }
    @GetMapping("/hoa-donn/{hoaDonId}")
    public List<HoaDonCT> getHoaDonCTByHoaDonId(@PathVariable int hoaDonId) {
        return hoaDonCTService.getHoaDonCTByHoaDonId(hoaDonId);
    }
    @GetMapping("/san-pham-ct/{sanPhamCTId}")
    public List<HoaDonCT> getHoaDonCTBySanPhamCTId(@PathVariable int sanPhamCTId) {
        return hoaDonCTService.getHoaDonCTBySanPhamCTId(sanPhamCTId);
    }
    @PostMapping
    public HoaDonCT addHoaDonCT(@RequestBody HoaDonCT hoaDonCT) {
        return hoaDonCTService.saveOrUpdateHoaDonCT(hoaDonCT);
    }
    @PutMapping("/{id}")
    public HoaDonCT updateHoaDonCT(@PathVariable int id, @RequestBody HoaDonCT hoaDonCT) {
        hoaDonCT.setId(id);
        return hoaDonCTService.saveOrUpdateHoaDonCT(hoaDonCT);
    }
    @DeleteMapping("/{id}")
    public void deleteHoaDonCT(@PathVariable int id) {
        hoaDonCTService.deleteHoaDonCTById(id);
    }
    @PutMapping("/{id}/status")
    public ResponseEntity<HoaDonCT> updateHoaDonCTStatus(@PathVariable int id, @RequestBody int newStatus) {
        HoaDonCT updatedHoaDonCT = hoaDonCTService.updateHoaDonCTStatus(id, newStatus);
        if (updatedHoaDonCT != null) {
            return ResponseEntity.ok(updatedHoaDonCT);
        }
        return ResponseEntity.notFound().build();
    }
}
