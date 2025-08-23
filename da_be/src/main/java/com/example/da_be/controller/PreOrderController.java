package com.example.da_be.controller;

import com.example.da_be.entity.PreOrder;
import com.example.da_be.entity.SanPhamCT;
import com.example.da_be.entity.ThongBao;
import com.example.da_be.entity.User;
import com.example.da_be.repository.PreOrderRepository;
import com.example.da_be.repository.SanPhamCTRepository;
import com.example.da_be.repository.ThongBaoRepository;
import com.example.da_be.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("/api/pre-order")
public class PreOrderController {

    @Autowired
    private PreOrderRepository preOrderRepository;

    @Autowired
    private SanPhamCTRepository sanPhamCTRepository;

    @Autowired
    private ThongBaoRepository thongBaoRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/hoa-don/{hoaDonId}")
    public ResponseEntity<List<PreOrder>> getPreOrdersByHoaDonId(@PathVariable Integer hoaDonId) {
        List<PreOrder> preOrders = preOrderRepository.findByHoaDonId(hoaDonId);
        return ResponseEntity.ok(preOrders);
    }

    @PostMapping("/back-in-stock")
    public ResponseEntity<?> createBackInStockRequest(@RequestBody BackInStockRequestDTO request) {
        Optional<SanPhamCT> sanPhamCTOpt = sanPhamCTRepository.findById(request.getIdSanPhamCT());
        if (!sanPhamCTOpt.isPresent()) {
            return ResponseEntity.badRequest().body("Sản phẩm không tồn tại");
        }

        // Validate email
        if (request.getEmail() == null || request.getEmail().isEmpty()) {
            return ResponseEntity.badRequest().body("Email là bắt buộc");
        }

        // Kiểm tra trùng lặp (email + idSanPhamCT)
        List<PreOrder> existingRequests = preOrderRepository.findBySanPhamCTIdAndTrangThai(request.getIdSanPhamCT(), 0);
        boolean isDuplicate = existingRequests.stream()
                .anyMatch(p -> request.getEmail().equals(p.getEmail()));
        if (isDuplicate) {
            return ResponseEntity.badRequest().body("Yêu cầu đã tồn tại cho email này");
        }

        PreOrder preOrder = new PreOrder();
        preOrder.setSanPhamCT(sanPhamCTOpt.get());
        preOrder.setEmail(request.getEmail());
        preOrder.setPhone(request.getPhone());
        preOrder.setRequestedQuantity(request.getRequestedQuantity());
        preOrder.setSoLuong(request.getRequestedQuantity()); 
        preOrder.setTrangThai(0); // Pending
        preOrder.setNgayTao(LocalDateTime.now());

        if (request.getIdTaiKhoan() != null) {
            Optional<User> userOpt = userRepository.findById(request.getIdTaiKhoan());
            if (userOpt.isPresent()) {
                preOrder.setTaiKhoan(userOpt.get());
                preOrder.setEmail(userOpt.get().getEmail()); // Override email nếu có tài khoản
            }
        }

        preOrderRepository.save(preOrder);
        return ResponseEntity.status(201).body("Đăng ký thông báo thành công");
    }

    @GetMapping("/pending")
    public ResponseEntity<List<Object[]>> getPendingRequests() {
        List<Object[]> requests = preOrderRepository.getTotalRequestedQuantityBySanPhamCT();
        return ResponseEntity.ok(requests);
    }

    @PatchMapping("/san-pham-ct/{id}/stock")
    public ResponseEntity<?> updateStock(@PathVariable Integer id, @RequestBody StockUpdateDTO stockUpdate) {
        Optional<SanPhamCT> sanPhamCTOpt = sanPhamCTRepository.findById(id);
        if (!sanPhamCTOpt.isPresent()) {
            return ResponseEntity.badRequest().body("Sản phẩm không tồn tại");
        }

        SanPhamCT sanPhamCT = sanPhamCTOpt.get();
        sanPhamCT.setSoLuong(stockUpdate.getSoLuong());
        sanPhamCTRepository.save(sanPhamCT);

        // Kiểm tra các request pending
        List<PreOrder> pendingRequests = preOrderRepository.findPendingBySanPhamCTIdAndSufficientQuantity(id, stockUpdate.getSoLuong());
        for (PreOrder request : pendingRequests) {
            // Tạo thông báo
            ThongBao thongBao = new ThongBao();
            if (request.getTaiKhoan() != null) {
                thongBao.setKhachHang(request.getTaiKhoan());
                thongBao.setEmail(request.getTaiKhoan().getEmail());
            } else {
                thongBao.setEmail(request.getEmail());
            }
            thongBao.setTieuDe("Sản phẩm đã có hàng!");
            thongBao.setNoiDung("Sản phẩm bạn yêu cầu đã có đủ " + request.getRequestedQuantity() + " trong kho. Mua ngay!");
            thongBao.setIdRedirect("/san-pham/" + request.getSanPhamCT().getId());
            thongBao.setKieuThongBao("BACK_IN_STOCK");
            thongBao.setTrangThai(0); // Chưa đọc
            thongBaoRepository.save(thongBao);

            // Cập nhật trạng thái request
            request.setTrangThai(1); // Notified
            preOrderRepository.save(request);
        }

        return ResponseEntity.ok("Cập nhật số lượng thành công");
    }
}

class BackInStockRequestDTO {
    private Integer idSanPhamCT;
    private Integer idTaiKhoan;
    private String email;
    private String phone;
    private Integer requestedQuantity;

    public Integer getIdSanPhamCT() {
        return idSanPhamCT;
    }

    public void setIdSanPhamCT(Integer idSanPhamCT) {
        this.idSanPhamCT = idSanPhamCT;
    }

    public Integer getIdTaiKhoan() {
        return idTaiKhoan;
    }

    public void setIdTaiKhoan(Integer idTaiKhoan) {
        this.idTaiKhoan = idTaiKhoan;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public Integer getRequestedQuantity() {
        return requestedQuantity;
    }

    public void setRequestedQuantity(Integer requestedQuantity) {
        this.requestedQuantity = requestedQuantity;
    }
}

class StockUpdateDTO {
    private Integer soLuong;

    public Integer getSoLuong() {
        return soLuong;
    }

    public void setSoLuong(Integer soLuong) {
        this.soLuong = soLuong;
    }
}