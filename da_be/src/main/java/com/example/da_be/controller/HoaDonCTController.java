package com.example.da_be.controller;

import com.example.da_be.dto.AddProductToBillRequest;
import com.example.da_be.dto.AddProductToBillResponse;
import com.example.da_be.dto.HoaDonCTDTO;
import com.example.da_be.dto.ReturnRequest;
import com.example.da_be.entity.*;
import com.example.da_be.exception.ResourceNotFoundException;
import com.example.da_be.repository.HoaDonRepository;
import com.example.da_be.repository.PreOrderRepository;
import com.example.da_be.repository.SanPhamCTRepository;
import com.example.da_be.service.HoaDonCTService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("/api/hoa-don-ct")
public class HoaDonCTController {

    @Autowired
    private HoaDonCTService hoaDonCTService;
    @Autowired
    private SanPhamCTRepository sanPhamCTRepository;
    @Autowired
    private HoaDonRepository hoaDonRepository;
    @Autowired
    private PreOrderRepository preOrderRepository;

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
    public ResponseEntity<?> addHoaDonCT(@RequestBody HoaDonCT hoaDonCT) {
        try {
            if (hoaDonCT.getSanPhamCT() == null || hoaDonCT.getSanPhamCT().getId() == null) {
                return ResponseEntity.badRequest().body("Thiếu thông tin sản phẩm");
            }

            if (hoaDonCT.getHoaDon() == null || hoaDonCT.getHoaDon().getId() == null) {
                return ResponseEntity.badRequest().body("Thiếu thông tin hóa đơn");
            }

            if (!sanPhamCTRepository.existsById(hoaDonCT.getSanPhamCT().getId())) {
                return ResponseEntity.badRequest().body("Sản phẩm không tồn tại");
            }

            if (!hoaDonRepository.existsById(hoaDonCT.getHoaDon().getId())) {
                return ResponseEntity.badRequest().body("Hóa đơn không tồn tại");
            }

            HoaDonCT saved = hoaDonCTService.saveOrUpdateHoaDonCT(hoaDonCT);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Lỗi server: " + e.getMessage());
        }
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




    @PostMapping("/return")
    public ResponseEntity<TraHang> processReturn(@RequestBody ReturnRequest request) {
        TraHang traHang = hoaDonCTService.processReturn(request.getHoaDonCTId(), request.getSoLuong(), request.getLyDo());
        return ResponseEntity.ok(traHang);
    }

    @PutMapping("/return/{traHangId}/approve")
    public ResponseEntity<Void> approveReturn(@PathVariable Integer traHangId) {
        hoaDonCTService.approveReturn(traHangId);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/return/{traHangId}/reject")
    public ResponseEntity<Void> rejectReturn(@PathVariable Integer traHangId) {
        hoaDonCTService.rejectReturn(traHangId);
        return ResponseEntity.ok().build();
    }






    @PostMapping("/add-to-bill")
    public ResponseEntity<?> addProductToBill(@RequestBody AddProductToBillRequest request) {
        try {
            // Kiểm tra đầu vào
            if (request.getIdHoaDon() == null || request.getIdSanPhamCT() == null) {
                return ResponseEntity.badRequest().body("Thông tin hóa đơn hoặc sản phẩm không hợp lệ");
            }
            if (request.getSoLuong() <= 0) {
                return ResponseEntity.badRequest().body("Số lượng phải lớn hơn 0");
            }

            // Kiểm tra hóa đơn tồn tại
            HoaDon hoaDon = hoaDonRepository.findById(request.getIdHoaDon())
                    .orElseThrow(() -> new ResourceNotFoundException("Hóa đơn không tồn tại"));

            // Kiểm tra sản phẩm tồn tại
            SanPhamCT sanPhamCT = sanPhamCTRepository.findById(request.getIdSanPhamCT())
                    .orElseThrow(() -> new ResourceNotFoundException("Sản phẩm không tồn tại"));

            // Kiểm tra số lượng tồn kho
            if (sanPhamCT.getSoLuong() < request.getSoLuong()) {
                // Tạo pre-order
                PreOrder preOrder = new PreOrder();
                preOrder.setHoaDon(hoaDon);
                preOrder.setSanPhamCT(sanPhamCT);
                preOrder.setSoLuong(request.getSoLuong());
                preOrder.setTaiKhoan(hoaDon.getTaiKhoan()); // Giả định HoaDon có taiKhoan
                preOrder.setNgayTao(LocalDateTime.now());

                preOrder.setTrangThai(0); // 0 = Chờ nhập hàng
                preOrderRepository.save(preOrder);

                return ResponseEntity.ok().body(new AddProductToBillResponse(9, "Sản phẩm tạm hết hàng. Đã tạo yêu cầu đặt trước."));
            }

            // Kiểm tra sản phẩm đã tồn tại trong hóa đơn
            List<HoaDonCT> existingDetails = hoaDonCTService.getHoaDonCTByHoaDonId(request.getIdHoaDon());
            HoaDonCT existingHoaDonCT = existingDetails.stream()
                    .filter(hdct -> hdct.getSanPhamCT().getId().equals(request.getIdSanPhamCT()))
                    .findFirst()
                    .orElse(null);

            if (existingHoaDonCT != null) {
                // Cập nhật chi tiết hóa đơn hiện có
                int newQuantity = existingHoaDonCT.getSoLuong() + request.getSoLuong();
                if (sanPhamCT.getSoLuong() < newQuantity) {
                    // Tạo pre-order cho số lượng thiếu
                    PreOrder preOrder = new PreOrder();
                    preOrder.setHoaDon(hoaDon);
                    preOrder.setSanPhamCT(sanPhamCT);
                    preOrder.setSoLuong(newQuantity - sanPhamCT.getSoLuong());
                    preOrder.setTaiKhoan(hoaDon.getTaiKhoan());
                    preOrder.setNgayTao(LocalDateTime.now());
                    preOrder.setTrangThai(0);
                    preOrderRepository.save(preOrder);

                    return ResponseEntity.ok().body(new AddProductToBillResponse(9, "Số lượng trong kho không đủ. Đã tạo yêu cầu đặt trước."));
                }
                hoaDonCTService.updateQuantity(existingHoaDonCT.getId(), newQuantity);
            } else {
                // Tạo chi tiết hóa đơn mới
                HoaDonCT hoaDonCT = new HoaDonCT();
                hoaDonCT.setHoaDon(hoaDon);
                hoaDonCT.setSanPhamCT(sanPhamCT);
                hoaDonCT.setSoLuong(request.getSoLuong());
//                hoaDonCT.setGiaBan(sanPhamCT.getGiaKhuyenMai() != null && sanPhamCT.getGiaKhuyenMai().compareTo(sanPhamCT.getDonGia()) < 0
//                        ? sanPhamCT.getGiaKhuyenMai()
//                        : sanPhamCT.getDonGia());
                hoaDonCT.setTrangThai(1); // Trạng thái hoạt động
                hoaDonCTService.saveOrUpdateHoaDonCT(hoaDonCT);
            }

            // Cập nhật số lượng tồn kho
            sanPhamCT.setSoLuong(sanPhamCT.getSoLuong() - request.getSoLuong());
            sanPhamCTRepository.save(sanPhamCT);

            return ResponseEntity.ok(new AddProductToBillResponse(1, "Sản phẩm đã được thêm vào hóa đơn"));
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi khi thêm sản phẩm vào hóa đơn: " + e.getMessage());
        }
    }
}