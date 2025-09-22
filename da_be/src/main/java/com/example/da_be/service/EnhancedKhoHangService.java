package com.example.da_be.service;

import com.example.da_be.entity.*;
import com.example.da_be.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

/**
 * ENHANCED KHOHANGSERVICE VỚI STOCK ALLOCATION SYSTEM
 * 
 * Quy trình mới:
 * 1. Đặt hàng online -> createReservation (không trừ stock)
 * 2. Admin điều chỉnh -> allocateStock (trừ stock thực tế)
 * 3. Xác nhận đơn hàng -> confirmAllocation (chỉ cập nhật trạng thái)
 */
@Service
public class EnhancedKhoHangService {

    private static final Logger log = LoggerFactory.getLogger(EnhancedKhoHangService.class);

    @Autowired
    private StockAllocationService stockAllocationService;
    
    @Autowired
    private SanPhamCTRepository sanPhamCTRepository;
    
    @Autowired
    private HoaDonCTRepository hoaDonCTRepository;
    
    @Autowired
    private HoaDonRepository hoaDonRepository;
    
    @Autowired
    private LichSuHoanKhoRepository lichSuHoanKhoRepository;

    /**
     * ===== PHẦN 1: ĐẶT HÀNG ONLINE =====
     */
    
    /**
     * Kiểm tra và tạo reservation khi đặt hàng online
     * KHÔNG TRỪ STOCK THỰC TẾ
     */
    @Transactional
    public void createOnlineOrderReservation(HoaDon hoaDon, List<HoaDonCT> hoaDonCTList) {
        try {
            log.info("Tạo reservation cho đơn hàng online: {}", hoaDon.getMa());
            
            for (HoaDonCT hoaDonCT : hoaDonCTList) {
                try {
                    // Kiểm tra tồn kho có đủ không
                    SanPhamCT sanPhamCT = hoaDonCT.getSanPhamCT();
                    int availableStock = stockAllocationService.getAvailableStock(sanPhamCT.getId());
                    
                    if (availableStock < hoaDonCT.getSoLuong()) {
                        throw new RuntimeException("Sản phẩm " + sanPhamCT.getSanPham().getTen() + " chỉ còn " + availableStock + " sản phẩm");
                    }
                    
                    // Tạo reservation (chỉ ghi nhận, không trừ stock thực tế)
                    stockAllocationService.createReservation(hoaDonCT, hoaDonCT.getSoLuong());
                    log.info("Tạo reservation cho sản phẩm: {} - số lượng: {}", sanPhamCT.getSanPham().getTen(), hoaDonCT.getSoLuong());
                    
                } catch (Exception e) {
                    log.error("Lỗi khi tạo reservation cho HoaDonCT {}: {}", hoaDonCT.getId(), e.getMessage());
                    throw new RuntimeException("Không thể đặt hàng sản phẩm " + hoaDonCT.getSanPhamCT().getSanPham().getTen() + ": " + e.getMessage());
                }
            }
            
            log.info("Tạo reservation thành công cho đơn hàng: {}", hoaDon.getMa());
            
        } catch (Exception e) {
            log.error("Lỗi khi tạo reservation cho đơn hàng {}: {}", hoaDon.getMa(), e.getMessage());
            throw new RuntimeException("Không thể đặt hàng: " + e.getMessage());
        }
    }

    /**
     * Kiểm tra và tạo reservation khi đặt hàng online
     * KHÔNG TRỪ STOCK THỰC TẾ
     */
    @Transactional
    public void createOrderReservation(HoaDon hoaDon, List<HoaDonCT> hoaDonCTList) {
        try {
            log.info("Tạo reservation cho đơn hàng: {}", hoaDon.getMa());

            for (HoaDonCT hoaDonCT : hoaDonCTList) {
                // Tạo reservation (không trừ stock thực tế)
                stockAllocationService.createReservation(hoaDonCT, hoaDonCT.getSoLuong());
                
                log.info("Đã tạo reservation: {} x {}", 
                        hoaDonCT.getSanPhamCT().getSanPham().getTen(), hoaDonCT.getSoLuong());
            }
            
            log.info("Tạo reservation thành công cho đơn hàng: {}", hoaDon.getMa());
            
        } catch (Exception e) {
            log.error("Lỗi khi tạo reservation cho đơn hàng {}: {}", hoaDon.getMa(), e.getMessage(), e);
            throw new RuntimeException("Lỗi khi tạo reservation: " + e.getMessage());
        }
    }

    /**
     * ===== PHẦN 2: ADMIN ĐIỀU CHỈNH ĐƠN HÀNG =====
     */
    
    /**
     * Cập nhật số lượng sản phẩm trong đơn hàng theo trạng thái đơn hàng
     * - Trạng thái 0 (Chờ xác nhận): chỉ cập nhật reservation, KHÔNG trừ kho
     * - Trạng thái 1 (Chờ giao hàng): điều chỉnh stock thực tế ngay (allocate)
     * - Trạng thái >=2: chặn chỉnh sửa
     */
    @Transactional
    public void updateOrderItemQuantity(Integer hoaDonCTId, Integer newQuantity, String reason) {
        try {
            log.info("Cập nhật số lượng cho HoaDonCT ID: {} -> {}", hoaDonCTId, newQuantity);

            HoaDonCT hoaDonCT = hoaDonCTRepository.findById(hoaDonCTId)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy HoaDonCT ID: " + hoaDonCTId));

            HoaDon hoaDon = hoaDonCT.getHoaDon();
            int oldQuantity = hoaDonCT.getSoLuong();

            if (hoaDon.getTrangThai() == null) {
                throw new RuntimeException("Đơn hàng không hợp lệ (thiếu trạng thái)");
            }

            if (hoaDon.getTrangThai() == 1) {
                // Chỉ cập nhật reservation, không trừ kho
                stockAllocationService.updateReservationQuantity(hoaDonCTId, newQuantity);

                hoaDonCT.setSoLuong(newQuantity);

            } else if (hoaDon.getTrangThai() == 2) {
                // Điều chỉnh stock thực tế ngay
                stockAllocationService.allocateStock(hoaDonCTId, newQuantity, reason);
                hoaDonCT.setSoLuong(newQuantity);

            } else {
                throw new RuntimeException("Không thể chỉnh sửa sản phẩm khi đơn hàng đã chuyển trạng thái");
            }

            // Tính lại giá bán nếu cần (giữ nguyên quy tắc hiện tại)
            if (hoaDonCT.getGiaBan() != null && oldQuantity > 0) {
                BigDecimal unitPrice = hoaDonCT.getGiaBan().divide(BigDecimal.valueOf(oldQuantity), 2, BigDecimal.ROUND_HALF_UP);
                hoaDonCT.setGiaBan(unitPrice.multiply(BigDecimal.valueOf(newQuantity)));
            }

            hoaDonCTRepository.save(hoaDonCT);

            log.info("Đã cập nhật số lượng từ {} -> {} cho sản phẩm {} (TT đơn: {})",
                    oldQuantity, newQuantity, hoaDonCT.getSanPhamCT().getSanPham().getTen(), hoaDon.getTrangThai());

        } catch (Exception e) {
            log.error("Lỗi khi cập nhật số lượng HoaDonCT {}: {}", hoaDonCTId, e.getMessage(), e);
            throw new RuntimeException("Lỗi khi cập nhật số lượng: " + e.getMessage());
        }
    }
    
    /**
     * Thêm sản phẩm mới vào đơn hàng theo trạng thái đơn hàng
     * - Trạng thái 0: chỉ tạo reservation, KHÔNG trừ kho
     * - Trạng thái 1: trừ kho ngay (allocate)
     * - Trạng thái >=2: chặn chỉnh sửa
     */
    @Transactional
    public void addProductToOrder(Integer hoaDonId, Integer sanPhamCTId, Integer quantity, String reason) {
        try {
            log.info("Thêm sản phẩm vào đơn hàng: hoaDonId={}, sanPhamCTId={}, quantity={}",
                    hoaDonId, sanPhamCTId, quantity);

            HoaDon hoaDon = hoaDonRepository.findById(hoaDonId)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy hóa đơn ID: " + hoaDonId));
            SanPhamCT sanPhamCT = sanPhamCTRepository.findById(sanPhamCTId)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm ID: " + sanPhamCTId));

            if (hoaDon.getTrangThai() == null) {
                throw new RuntimeException("Đơn hàng không hợp lệ (thiếu trạng thái)");
            }

            if (hoaDon.getTrangThai() >= 3) {
                throw new RuntimeException("Không thể thêm sản phẩm khi đơn hàng đã chuyển trạng thái");
            }

            HoaDonCT hoaDonCT = new HoaDonCT();
            hoaDonCT.setHoaDon(hoaDon);
            hoaDonCT.setSanPhamCT(sanPhamCT);
            hoaDonCT.setSoLuong(quantity);
            hoaDonCT.setGiaBan(BigDecimal.valueOf(sanPhamCT.getDonGia()));
            hoaDonCT = hoaDonCTRepository.save(hoaDonCT);

            if (hoaDon.getTrangThai() == 1) {
                // Chỉ tạo reservation, không trừ kho
                stockAllocationService.createReservation(hoaDonCT, quantity);
            } else if (hoaDon.getTrangThai() == 2) {
                // Trừ kho ngay
                stockAllocationService.addProductToOrder(hoaDonCT, quantity);
            }

            log.info("Đã thêm sản phẩm (TT đơn: {})", hoaDon.getTrangThai());

        } catch (Exception e) {
            log.error("Lỗi khi thêm sản phẩm vào đơn hàng: {}", e.getMessage(), e);
            throw new RuntimeException("Lỗi khi thêm sản phẩm: " + e.getMessage());
        }
    }
    
    /**
     * Xóa sản phẩm khỏi đơn hàng theo trạng thái đơn hàng
     * - Trạng thái 0: xóa reservation, không hoàn kho
     * - Trạng thái 1: xóa và hoàn kho phần đã allocate
     * - Trạng thái >=2: chặn chỉnh sửa
     */
    @Transactional
    public void removeProductFromOrder(Integer hoaDonCTId, String reason) {
        try {
            log.info("Xóa sản phẩm khỏi đơn hàng: HoaDonCT ID {} với lý do: {}", hoaDonCTId, reason);

            HoaDonCT hoaDonCT = hoaDonCTRepository.findById(hoaDonCTId)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy HoaDonCT ID: " + hoaDonCTId));

            HoaDon hoaDon = hoaDonCT.getHoaDon();
            if (hoaDon.getTrangThai() == null) {
                throw new RuntimeException("Đơn hàng không hợp lệ (thiếu trạng thái)");
            }

            if (hoaDon.getTrangThai() >= 3) {
                throw new RuntimeException("Không thể xóa sản phẩm khi đơn hàng đã chuyển trạng thái");
            }

            // Sử dụng service chung: tự xử lý hoàn kho nếu đã allocate
            stockAllocationService.removeProductFromOrder(hoaDonCTId);

            // Xóa HoaDonCT
            hoaDonCTRepository.deleteById(hoaDonCTId);

            log.info("Đã xóa sản phẩm thành công (TT đơn: {})", hoaDon.getTrangThai());

        } catch (Exception e) {
            log.error("Lỗi khi xóa sản phẩm khỏi đơn hàng: {}", e.getMessage(), e);
            throw new RuntimeException("Lỗi khi xóa sản phẩm: " + e.getMessage());
        }
    }

    /**
     * ===== PHẦN 3: XÁC NHẬN ĐƠN HÀNG =====
     */
    
    /**
     * Xác nhận đơn hàng cuối cùng
     * KHÔNG TRỪ STOCK THÊM - chỉ cập nhật trạng thái allocation
     */
    @Transactional
    public void confirmOrderFinal(HoaDon hoaDon) {
        try {
            log.info("Xác nhận đơn hàng cuối cùng: {}", hoaDon.getMa());
            
            // Kiểm tra xem đơn hàng đã được allocated chưa
            boolean isAllocated = stockAllocationService.isOrderAllocated(hoaDon.getId());
            
            if (!isAllocated) {
                // Nếu chưa allocated (vẫn ở trạng thái RESERVED), allocate ngay
                List<HoaDonCT> hoaDonCTList = hoaDonCTRepository.findByHoaDon(hoaDon);
                for (HoaDonCT hoaDonCT : hoaDonCTList) {
                    stockAllocationService.allocateStock(hoaDonCT.getId(), hoaDonCT.getSoLuong(), 
                                                        "Auto-allocate khi xác nhận đơn hàng");
                }
            }
            
            // Confirm tất cả allocations
            stockAllocationService.confirmOrder(hoaDon.getId());
            
            log.info("Đã xác nhận đơn hàng thành công: {}", hoaDon.getMa());
            
        } catch (Exception e) {
            log.error("Lỗi khi xác nhận đơn hàng {}: {}", hoaDon.getMa(), e.getMessage(), e);
            throw new RuntimeException("Lỗi khi xác nhận đơn hàng: " + e.getMessage());
        }
    }

    /**
     * Xác nhận đơn hàng (chuyển 0 -> 1): trừ kho theo số lượng hiện tại và set allocation = ALLOCATED
     */
    @Transactional
    public void confirmOrder(Integer hoaDonId, String reason) {
        HoaDon hoaDon = hoaDonRepository.findById(hoaDonId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hóa đơn ID: " + hoaDonId));

        if (hoaDon.getTrangThai() == null || hoaDon.getTrangThai() != 1) {
            throw new RuntimeException("Chỉ có thể xác nhận đơn hàng khi trạng thái là 'Chờ xác nhận'");
        }

        List<HoaDonCT> chiTietList = hoaDonCTRepository.findByHoaDon(hoaDon);
        for (HoaDonCT ct : chiTietList) {
            stockAllocationService.createReservationIfMissing(ct.getId(), ct.getSoLuong());
        }

        java.util.List<String> thieuHang = new java.util.ArrayList<>();
        for (HoaDonCT ct : chiTietList) {
            try {
                stockAllocationService.allocateStock(ct.getId(), ct.getSoLuong(), reason);
            } catch (Exception ex) {
                log.error("Không thể allocate cho HoaDonCT {}: {}", ct.getId(), ex.getMessage());
                thieuHang.add(ct.getSanPhamCT().getSanPham().getTen());
            }
        }

        if (!thieuHang.isEmpty()) {
            throw new RuntimeException("Không thể xác nhận do thiếu hàng: " + String.join(", ", thieuHang));
        }

        hoaDon.setTrangThai(2); // Chờ giao hàng
        hoaDonRepository.save(hoaDon);
        log.info("Đã xác nhận đơn hàng {} -> trạng thái 2 (Chờ giao hàng)", hoaDonId);
    }

    /**
     * Xác nhận giao hàng (chuyển 1 -> 2): chỉ cập nhật allocation = CONFIRMED, không thay đổi stock
     */
    @Transactional
    public void confirmShipping(Integer hoaDonId, String reason) {
        HoaDon hoaDon = hoaDonRepository.findById(hoaDonId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hóa đơn ID: " + hoaDonId));

        if (hoaDon.getTrangThai() == null || hoaDon.getTrangThai() != 2) {
            throw new RuntimeException("Chỉ có thể xác nhận giao hàng khi trạng thái là 'Chờ giao hàng'");
        }

        List<HoaDonCT> chiTietList = hoaDonCTRepository.findByHoaDon(hoaDon);
        for (HoaDonCT ct : chiTietList) {
            stockAllocationService.confirmAllocation(ct.getId(), reason);
        }

        hoaDon.setTrangThai(3); // Đang vận chuyển
        hoaDonRepository.save(hoaDon);
        log.info("Đã xác nhận giao hàng {} -> trạng thái 3 (Đang vận chuyển)", hoaDonId);
    }

    /**
     * Revert toàn bộ allocations của đơn hàng về RESERVED (dùng khi chuyển 2 -> 1)
     */
    @Transactional
    public void revertAllocationsToReserved(Integer hoaDonId, String reason) {
        HoaDon hoaDon = hoaDonRepository.findById(hoaDonId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hóa đơn ID: " + hoaDonId));

        if (hoaDon.getTrangThai() == null || hoaDon.getTrangThai() != 2) {
            throw new RuntimeException("Chỉ có thể rollback khi trạng thái là 'Chờ giao hàng'");
        }

        List<HoaDonCT> chiTietList = hoaDonCTRepository.findByHoaDon(hoaDon);
        for (HoaDonCT ct : chiTietList) {
            stockAllocationService.updateReservationQuantity(ct.getId(), ct.getSoLuong());
        }

        hoaDon.setTrangThai(1);
        hoaDonRepository.save(hoaDon);
        log.info("Rollback allocations -> RESERVED cho đơn {} và set trạng thái 1", hoaDonId);
    }

    /**
     * ===== PHẦN 4: HỦY ĐƠN HÀNG =====
     */
    
    /**
     * Hủy đơn hàng và hoàn tất cả stock
     */
    @Transactional
    public void cancelOrderAndRestoreStock(HoaDon hoaDon) {
        try {
            log.info("Hủy đơn hàng và hoàn stock: {}", hoaDon.getMa());
            
            // Hủy tất cả allocations và hoàn stock
            stockAllocationService.cancelOrder(hoaDon.getId());
            
            // Lưu lịch sử hoàn kho
            saveRestoreHistory(hoaDon, "Hoàn kho do hủy đơn hàng", "SYSTEM");
            
            log.info("Đã hủy đơn hàng và hoàn stock thành công: {}", hoaDon.getMa());
            
        } catch (Exception e) {
            log.error("Lỗi khi hủy đơn hàng {}: {}", hoaDon.getMa(), e.getMessage(), e);
            throw new RuntimeException("Lỗi khi hủy đơn hàng: " + e.getMessage());
        }
    }

    /**
     * ===== PHẦN 5: UTILITY METHODS =====
     */
    
    /**
     * Kiểm tra stock khả dụng
     */
    public int getAvailableStock(Integer sanPhamCTId) {
        return stockAllocationService.getAvailableStock(sanPhamCTId);
    }
    
    /**
     * Kiểm tra stock có đủ cho yêu cầu không
     */
    public boolean checkStockAvailability(Integer sanPhamCTId, Integer requiredQuantity) {
        int availableStock = getAvailableStock(sanPhamCTId);
        return availableStock >= requiredQuantity;
    }
    
    /**
     * Lấy tổng quan allocation cho sản phẩm
     */
    public java.util.Map<String, Integer> getStockAllocationSummary(Integer sanPhamCTId) {
        return stockAllocationService.getStockAllocationSummary(sanPhamCTId);
    }
    
    /**
     * Kiểm tra đơn hàng đã được allocated chưa
     */
    public boolean isOrderAllocated(Integer hoaDonId) {
        return stockAllocationService.isOrderAllocated(hoaDonId);
    }

    /**
     * ===== PHẦN 6: LEGACY SUPPORT =====
     */
    
    /**
     * Lưu lịch sử hoàn kho
     */
    private void saveRestoreHistory(HoaDon hoaDon, String reason, String performer) {
        try {
            List<HoaDonCT> hoaDonCTList = hoaDonCTRepository.findByHoaDon(hoaDon);
            for (HoaDonCT hoaDonCT : hoaDonCTList) {
                boolean exists = lichSuHoanKhoRepository.existsByHoaDonIdAndSanPhamCtIdAndLoaiHoanKho(
                        hoaDon.getId(), hoaDonCT.getSanPhamCT().getId(), LichSuHoanKho.LoaiHoanKho.AUTO);
                if (!exists) {
                    LichSuHoanKho lichSu = new LichSuHoanKho(
                            hoaDon.getId(),
                            hoaDonCT.getSanPhamCT().getId(),
                            hoaDonCT.getSoLuong(),
                            LichSuHoanKho.LoaiHoanKho.AUTO,
                            reason,
                            performer
                    );
                    lichSuHoanKhoRepository.save(lichSu);
                }
            }
        } catch (Exception e) {
            log.error("Lỗi khi lưu lịch sử hoàn kho cho đơn {}: {}", hoaDon.getId(), e.getMessage());
        }
    }
    
    /**
     * ===== PHẦN 4: HỦY ĐƠN HÀNG =====
     */
    
    /**
     * Hủy đơn hàng và hoàn stock
     */
    @Transactional
    public void cancelOrder(Integer hoaDonId, String reason, String performer) {
        try {
            log.info("Hủy đơn hàng: {} với lý do: {}", hoaDonId, reason);
            
            // Lấy tất cả HoaDonCT của đơn hàng
            List<HoaDonCT> hoaDonCTList = hoaDonCTRepository.findByHoaDonId(hoaDonId);
            
            for (HoaDonCT hoaDonCT : hoaDonCTList) {
                try {
                    // Hủy allocation và hoàn stock
                    stockAllocationService.cancelAllocation(hoaDonCT.getId(), reason);
                    log.info("Đã hủy allocation cho HoaDonCT: {}", hoaDonCT.getId());
                } catch (Exception e) {
                    log.error("Lỗi khi hủy allocation cho HoaDonCT {}: {}", hoaDonCT.getId(), e.getMessage());
                }
            }
            
            // Lưu lịch sử hoàn kho cho toàn bộ đơn hàng
            HoaDon hoaDon = hoaDonCTList.get(0).getHoaDon();
            saveRestoreHistory(hoaDon, reason, performer);
            
            log.info("Hủy thành công đơn hàng: {}", hoaDonId);
            
        } catch (Exception e) {
            log.error("Lỗi khi hủy đơn hàng {}: {}", hoaDonId, e.getMessage());
            throw new RuntimeException("Không thể hủy đơn hàng: " + e.getMessage());
        }
    }
    
    /**
     * ===== PHẦN 5: MIGRATION =====
     */
    
    /**
     * Migration method: chuyển đổi đơn hàng cũ sang hệ thống allocation mới
     */
    @Transactional
    public void migrateExistingOrder(Integer hoaDonId) {
        try {
            log.info("Migration đơn hàng cũ sang allocation system: {}", hoaDonId);
            
            List<HoaDonCT> hoaDonCTList = hoaDonCTRepository.findByHoaDonId(hoaDonId);
            
            for (HoaDonCT hoaDonCT : hoaDonCTList) {
                try {
                    // Tạo allocation với trạng thái phù hợp
                    stockAllocationService.addProductToOrder(hoaDonCT, hoaDonCT.getSoLuong());
                } catch (Exception e) {
                    log.warn("Không thể migrate HoaDonCT {}: {}", hoaDonCT.getId(), e.getMessage());
                }
            }
            
            log.info("Migration thành công cho đơn hàng: {}", hoaDonId);
            
        } catch (Exception e) {
            log.error("Lỗi khi migration đơn hàng {}: {}", hoaDonId, e.getMessage());
        }
    }
}