package com.example.da_be.controller;

import com.example.da_be.dto.ThanhToanRequestDTO;
import com.example.da_be.entity.HoaDon;
import com.example.da_be.exception.ResourceNotFoundException;
import com.example.da_be.service.HoaDonCTService;
import com.example.da_be.service.HoaDonService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:5173") // Cho phép kết nối từ React
@RequestMapping("/api/hoa-don")
public class HoaDonController {

    @Autowired
    private HoaDonService hoaDonService;
    @Autowired
    private HoaDonCTService hoaDonCTService;

    // Lấy danh sách tất cả hóa đơn
    @GetMapping
    public List<HoaDon> getAllHoaDon() {
        return hoaDonService.getAllHoaDon();
    }

    // Lấy thông tin hóa đơn theo id
    @GetMapping("/{id}")
    public HoaDon getHoaDonById(@PathVariable int id) {
        return hoaDonService.getHoaDonById(id);
    }

    // Xóa hóa đơn theo id
    @DeleteMapping("/{id}")
    public void deleteHoaDon(@PathVariable int id) {
        hoaDonService.deleteHoaDonById(id);
    }

    // Thêm hóa đơn mới
    @PostMapping
    public HoaDon addHoaDon(@RequestBody HoaDon hoaDon) {
        return hoaDonService.saveOrUpdateHoaDon(hoaDon);
    }

    // Cập nhật thông tin hóa đơn
    @PutMapping("/{id}")
    public HoaDon updateHoaDon(@PathVariable int id, @RequestBody HoaDon hoaDon) {
        hoaDon.setId(id);  // Đảm bảo ID trong body và path là giống nhau
        return hoaDonService.saveOrUpdateHoaDon(hoaDon);
    }


    @PutMapping("/{id}/status")
    public ResponseEntity<HoaDon> updateHoaDonStatus(@PathVariable int id, @RequestBody int newStatus) {
        HoaDon updatedHoaDon = hoaDonService.updateHoaDonStatus(id, newStatus);
        if (updatedHoaDon != null) {
            return ResponseEntity.ok(updatedHoaDon);
        }
        return ResponseEntity.notFound().build();
    }


    @PostMapping("/thanh-toan")
    @Transactional
    public ResponseEntity<?> xacNhanThanhToan(@RequestBody ThanhToanRequestDTO request) {
        try {
            HoaDon hoaDon = hoaDonService.xacNhanThanhToan(
                    request.getIdHoaDon(),
                    request.getTongTien(),
                    request.getKhachThanhToan(),
                    request.getIdVoucher(),
                    request.getPhuongThucThanhToan()
            );
            return ResponseEntity.ok(hoaDon);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi khi xác nhận thanh toán: " + e.getMessage());
        }
    }



    @PostMapping("/import-stock")
    public ResponseEntity<?> importStock(@RequestBody ImportStockRequest request) {
        try {
            hoaDonCTService.importStock(request.getSanPhamCTId(), request.getQuantity());
            return ResponseEntity.ok("Nhập hàng thành công");
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi khi nhập hàng: " + e.getMessage());
        }
    }

}

class ImportStockRequest {
    private Integer sanPhamCTId;
    private Integer quantity;

    public Integer getSanPhamCTId() { return sanPhamCTId; }
    public void setSanPhamCTId(Integer sanPhamCTId) { this.sanPhamCTId = sanPhamCTId; }
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
}
