package com.example.da_be.controller;

import com.example.da_be.dto.*;
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


    /**
     * Xác nhận đơn hàng và trừ stock thực tế
     * API mới cho yêu cầu thay đổi luồng xử lý
     */
    @PutMapping("/{id}/confirm")
    public ResponseEntity<?> confirmOrder(@PathVariable int id) {
        try {
            HoaDon confirmedOrder = hoaDonService.confirmOrder(id);
            return ResponseEntity.ok(confirmedOrder);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi khi xác nhận đơn hàng: " + e.getMessage());
        }
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<HoaDon> updateHoaDonStatus(@PathVariable int id, @RequestBody int newStatus) {
        HoaDon updatedHoaDon = hoaDonService.updateHoaDonStatus(id, newStatus);
        if (updatedHoaDon != null) {
            return ResponseEntity.ok(updatedHoaDon);
        }
        return ResponseEntity.notFound().build();
    }

    /**
     * Cập nhật trạng thái đơn hàng mà KHÔNG tự động hoàn kho
     * Dùng cho trường hợp đã xử lý hoàn kho riêng (như sự cố vận chuyển)
     */
    @PutMapping("/{id}/status-no-restore")
    public ResponseEntity<HoaDon> updateHoaDonStatusWithoutStockRestore(@PathVariable int id, @RequestBody int newStatus) {
        HoaDon updatedHoaDon = hoaDonService.updateHoaDonStatusWithoutStockRestore(id, newStatus);
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

    @PutMapping("/{id}/delivery-info")
    public ResponseEntity<?> updateDeliveryInfo(@PathVariable int id, @RequestBody UpdateDeliveryInfoRequest request) {
        try {
            HoaDon updatedHoaDon = hoaDonService.updateDeliveryInfo(id, request);
            if (updatedHoaDon != null) {
                return ResponseEntity.ok(updatedHoaDon);
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi khi cập nhật thông tin giao hàng: " + e.getMessage());
        }
    }

    /**
     * Hủy đơn hàng do sự cố vận chuyển không thể giải quyết
     */
    @PutMapping("/{id}/cancel-due-to-incident")
    public ResponseEntity<?> cancelOrderDueToIncident(@PathVariable int id, @RequestBody CancelIncidentRequest request) {
        try {
            HoaDon cancelledOrder = hoaDonService.cancelOrderDueToIncident(id, request);
            return ResponseEntity.ok(cancelledOrder);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi khi hủy đơn hàng do sự cố: " + e.getMessage());
        }
    }

    /**
     * Xử lý hoàn tiền cho đơn hàng bị sự cố
     */
    @PostMapping("/{id}/process-incident-refund")
    public ResponseEntity<?> processIncidentRefund(@PathVariable int id, @RequestBody IncidentRefundRequest request) {
        try {
            IncidentRefundResponse response = hoaDonService.processIncidentRefund(id, request);
            return ResponseEntity.ok(response);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi khi xử lý hoàn tiền do sự cố: " + e.getMessage());
        }
    }

    /**
     * Hoàn kho hàng do sự cố vận chuyển
     */
    @PostMapping("/{id}/restore-stock-incident")
    public ResponseEntity<?> restoreStockIncident(@PathVariable int id, @RequestBody RestoreStockIncidentRequest request) {
        try {
            RestoreStockResponse response = hoaDonService.restoreStockDueToIncident(id, request);
            return ResponseEntity.ok(response);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi khi hoàn kho do sự cố: " + e.getMessage());
        }
    }

    /**
     * Cập nhật thông tin khách hàng vào hóa đơn
     */
    @PutMapping("/{id}/customer")
    public ResponseEntity<?> updateCustomerInfo(@PathVariable int id, @RequestBody CustomerInfoRequest request) {
        try {
            HoaDon updatedOrder = hoaDonService.updateCustomerInfo(id, request);
            return ResponseEntity.ok(updatedOrder);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi khi cập nhật thông tin khách hàng: " + e.getMessage());
        }
    }

}
