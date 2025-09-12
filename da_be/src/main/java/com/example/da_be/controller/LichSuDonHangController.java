package com.example.da_be.controller;

import com.example.da_be.entity.HoaDon;
import com.example.da_be.entity.LichSuDonHang;
import com.example.da_be.entity.User;
import com.example.da_be.service.HoaDonService;
import com.example.da_be.service.LichSuDonHangService;
import com.example.da_be.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/lich-su-don-hang")
public class LichSuDonHangController {

    @Autowired
    private LichSuDonHangService lichSuDonHangService;
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private HoaDonService hoaDonService;

    // Lấy tất cả lịch sử đơn hàng
    @GetMapping
    public ResponseEntity<List<LichSuDonHang>> getAllLichSuDonHang() {
        try {
            List<LichSuDonHang> lichSuList = lichSuDonHangService.getAllLichSuDonHang();
            return ResponseEntity.ok(lichSuList);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Lấy lịch sử đơn hàng theo ID
    @GetMapping("/{id}")
    public ResponseEntity<LichSuDonHang> getLichSuDonHangById(@PathVariable Integer id) {
        try {
            Optional<LichSuDonHang> lichSuDonHang = lichSuDonHangService.getLichSuDonHangById(id);
            if (lichSuDonHang.isPresent()) {
                return ResponseEntity.ok(lichSuDonHang.get());
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Lấy lịch sử đơn hàng theo ID User
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<LichSuDonHang>> getLichSuDonHangByUserId(@PathVariable Integer userId) {
        try {
            List<LichSuDonHang> lichSuList = lichSuDonHangService.getLichSuDonHangByUserId(userId);
            return ResponseEntity.ok(lichSuList);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Lấy lịch sử đơn hàng theo ID Hóa đơn
    @GetMapping("/hoa-don/{hoaDonId}")
    public ResponseEntity<List<LichSuDonHang>> getLichSuDonHangByHoaDonId(@PathVariable Integer hoaDonId) {
        try {
            List<LichSuDonHang> lichSuList = lichSuDonHangService.getLichSuDonHangByHoaDonId(hoaDonId);
            return ResponseEntity.ok(lichSuList);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Lấy lịch sử đơn hàng theo trạng thái
    @GetMapping("/trang-thai/{trangThai}")
    public ResponseEntity<List<LichSuDonHang>> getLichSuDonHangByTrangThai(@PathVariable Integer trangThai) {
        try {
            List<LichSuDonHang> lichSuList = lichSuDonHangService.getLichSuDonHangByTrangThai(trangThai);
            return ResponseEntity.ok(lichSuList);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Thêm mới lịch sử đơn hàng
    @PostMapping
    public ResponseEntity<LichSuDonHang> createLichSuDonHang(@RequestBody LichSuDonHang lichSuDonHang) {
        try {
            // Set ngày tạo hiện tại nếu chưa có
            if (lichSuDonHang.getNgayTao() == null) {
                lichSuDonHang.setNgayTao(new Date());
            }
            
            LichSuDonHang savedLichSu = lichSuDonHangService.createLichSuDonHang(lichSuDonHang);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedLichSu);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Cập nhật lịch sử đơn hàng
    @PutMapping("/{id}")
    public ResponseEntity<LichSuDonHang> updateLichSuDonHang(@PathVariable Integer id, @RequestBody LichSuDonHang lichSuDonHangDetails) {
        try {
            LichSuDonHang updatedLichSu = lichSuDonHangService.updateLichSuDonHang(id, lichSuDonHangDetails);
            if (updatedLichSu != null) {
                return ResponseEntity.ok(updatedLichSu);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Xóa lịch sử đơn hàng
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLichSuDonHang(@PathVariable Integer id) {
        try {
            boolean deleted = lichSuDonHangService.deleteLichSuDonHang(id);
            if (deleted) {
                return ResponseEntity.noContent().build();
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Kiểm tra tồn tại
    @GetMapping("/exists/{id}")
    public ResponseEntity<Boolean> existsById(@PathVariable Integer id) {
        try {
            boolean exists = lichSuDonHangService.existsById(id);
            return ResponseEntity.ok(exists);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // API thêm lịch sử đơn hàng đơn giản chỉ với mô tả và ID hóa đơn
    @PostMapping("/add-simple")
    public ResponseEntity<LichSuDonHang> addSimpleLichSuDonHang(
            @RequestParam Integer hoaDonId,
            @RequestParam Integer userId,
            @RequestParam String moTa,
            @RequestParam(defaultValue = "1") Integer trangThai) {
        try {
            LichSuDonHang lichSuDonHang = new LichSuDonHang();
            
            // Set các giá trị cơ bản
            lichSuDonHang.setMoTa(moTa);
            lichSuDonHang.setNgayTao(new Date());
            lichSuDonHang.setTrangThai(trangThai);
            
            // Lấy User và HoaDon từ database
            try {
                User user = userService.getUserById(userId);
                HoaDon hoaDon = hoaDonService.getHoaDonById(hoaDonId.intValue());
                
                lichSuDonHang.setUser(user);
                lichSuDonHang.setHoaDon(hoaDon);
            } catch (Exception e) {
                return ResponseEntity.badRequest().build();
            }
            
            LichSuDonHang savedLichSu = lichSuDonHangService.createLichSuDonHang(lichSuDonHang);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedLichSu);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // API thêm lịch sử đơn hàng khi thay đổi trạng thái
    @PostMapping("/add-status-change")
    public ResponseEntity<LichSuDonHang> addStatusChangeLichSuDonHang(
            @RequestParam Integer hoaDonId,
            @RequestParam Integer userId,
            @RequestParam String moTa,
            @RequestParam String trangThaiHoaDon,
            @RequestParam(defaultValue = "1") Integer trangThai) {
        try {
            LichSuDonHang lichSuDonHang = new LichSuDonHang();
            
            // Set các giá trị cơ bản
            lichSuDonHang.setMoTa(moTa);
            lichSuDonHang.setTrangThaiHoaDon(trangThaiHoaDon);
            lichSuDonHang.setNgayTao(new Date());
            lichSuDonHang.setTrangThai(trangThai);
            
            // Lấy User và HoaDon từ database
            try {
                User user = userService.getUserById(userId);
                HoaDon hoaDon = hoaDonService.getHoaDonById(hoaDonId.intValue());
                
                lichSuDonHang.setUser(user);
                lichSuDonHang.setHoaDon(hoaDon);
            } catch (Exception e) {
                return ResponseEntity.badRequest().build();
            }
            
            LichSuDonHang savedLichSu = lichSuDonHangService.createLichSuDonHang(lichSuDonHang);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedLichSu);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
