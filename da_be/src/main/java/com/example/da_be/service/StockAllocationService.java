package com.example.da_be.service;

import com.example.da_be.entity.*;
import com.example.da_be.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class StockAllocationService {

    private static final Logger log = LoggerFactory.getLogger(StockAllocationService.class);

    @Autowired
    private StockAllocationRepository stockAllocationRepository;
    
    @Autowired
    private HoaDonCTRepository hoaDonCTRepository;
    
    @Autowired
    private SanPhamCTRepository sanPhamCTRepository;

    /**
     * 1. TẠO RESERVATION KHI ĐẶT HÀNG ONLINE (KHÔNG TRỪ STOCK THỰC TẾ)
     */
    @Transactional
    public StockAllocation createReservation(HoaDonCT hoaDonCT, Integer quantity) {
        log.info("Tạo reservation cho HoaDonCT ID: {}, Quantity: {}", hoaDonCT.getId(), quantity);
        
        // Kiểm tra xem đã có allocation chưa
        Optional<StockAllocation> existingAllocation = stockAllocationRepository.findByHoaDonCT(hoaDonCT);
        if (existingAllocation.isPresent()) {
            throw new RuntimeException("Allocation đã tồn tại cho HoaDonCT ID: " + hoaDonCT.getId());
        }
        
        // Kiểm tra tồn kho khả dụng
        int availableStock = getAvailableStock(hoaDonCT.getSanPhamCT().getId());
        if (availableStock < quantity) {
            throw new RuntimeException("Không đủ hàng trong kho. Có sẵn: " + availableStock + ", Yêu cầu: " + quantity);
        }
        
        // Tạo reservation mới
        StockAllocation allocation = new StockAllocation(hoaDonCT, hoaDonCT.getSanPhamCT(), quantity);
        allocation = stockAllocationRepository.save(allocation);
        
        log.info("Đã tạo reservation thành công với ID: {}", allocation.getId());
        return allocation;
    }

    /**
     * Kiểm tra có allocation cho HoaDonCT hay không
     */
    public boolean hasAllocation(Integer hoaDonCTId) {
        HoaDonCT hoaDonCT = hoaDonCTRepository.findById(hoaDonCTId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy HoaDonCT ID: " + hoaDonCTId));
        return stockAllocationRepository.findByHoaDonCT(hoaDonCT).isPresent();
    }

    /**
     * Tạo reservation nếu chưa có allocation
     */
    @Transactional
    public void createReservationIfMissing(Integer hoaDonCTId, Integer quantity) {
        HoaDonCT hoaDonCT = hoaDonCTRepository.findById(hoaDonCTId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy HoaDonCT ID: " + hoaDonCTId));
        java.util.Optional<StockAllocation> existing = stockAllocationRepository.findByHoaDonCT(hoaDonCT);
        if (!existing.isPresent()) {
            createReservation(hoaDonCT, quantity);
        }
    }

    /**
     * 1b. CẬP NHẬT SỐ LƯỢNG RESERVATION (TRẠNG THÁI 0)
     * Không trừ stock thực tế, chỉ điều chỉnh soLuongReserved, có kiểm tra stock khả dụng
     */
    @Transactional
    public void updateReservationQuantity(Integer hoaDonCTId, Integer newQuantity) {
        HoaDonCT hoaDonCT = hoaDonCTRepository.findById(hoaDonCTId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy HoaDonCT ID: " + hoaDonCTId));

        Optional<StockAllocation> allocationOpt = stockAllocationRepository.findByHoaDonCT(hoaDonCT);
        if (!allocationOpt.isPresent()) {
            // Nếu chưa có reservation, tạo mới
            createReservation(hoaDonCT, newQuantity);
            return;
        }

        StockAllocation allocation = allocationOpt.get();
        // Nếu allocation không ở RESERVED nhưng đơn hàng đã quay về trạng thái 1 (Chờ xác nhận),
        // thì rollback allocation về RESERVED và hoàn kho trước khi cập nhật số lượng.
        if (allocation.getTrangThai() != StockAllocation.AllocationStatus.RESERVED) {
            Integer orderStatus = hoaDonCT.getHoaDon() != null ? hoaDonCT.getHoaDon().getTrangThai() : null;
            if (orderStatus != null && orderStatus == 1) {
                SanPhamCT sanPhamCT = hoaDonCT.getSanPhamCT();
                int toRestore = allocation.getSoLuongAllocated();
                if (toRestore > 0) {
                    sanPhamCT.setSoLuong(sanPhamCT.getSoLuong() + toRestore);
                    sanPhamCTRepository.save(sanPhamCT);
                }
                // Chuyển toàn bộ về RESERVED
                int effective = allocation.getSoLuongAllocated() > 0 ? allocation.getSoLuongAllocated() : allocation.getSoLuongReserved();
                allocation.setSoLuongReserved(effective);
                allocation.setSoLuongAllocated(0);
                allocation.setSoLuongConfirmed(0);
                allocation.setTrangThai(StockAllocation.AllocationStatus.RESERVED);
                stockAllocationRepository.save(allocation);
                log.info("Rollback allocation -> RESERVED cho HoaDonCT {}. Phục hồi kho: {}", hoaDonCTId, toRestore);
            } else {
                throw new RuntimeException("Chỉ có thể cập nhật reservation khi trạng thái là RESERVED");
            }
        }

        // Sau khi đảm bảo allocation đang ở RESERVED, tiến hành cập nhật số lượng reservation
        int availableStock = getAvailableStock(hoaDonCT.getSanPhamCT().getId());
        int currentReserved = allocation.getSoLuongReserved();
        if (availableStock + currentReserved < newQuantity) {
            throw new RuntimeException("Không đủ hàng khả dụng để cập nhật reservation");
        }

        allocation.setSoLuongReserved(newQuantity);
        stockAllocationRepository.save(allocation);
        log.info("Đã cập nhật reservation HoaDonCT {}: {} -> {}", hoaDonCTId, currentReserved, newQuantity);
    }

    /**
     * 2. CHUYỂN TỪ RESERVATION SANG ALLOCATION (TRỪ STOCK THỰC TẾ)
     */
    @Transactional
    public void allocateStock(Integer hoaDonCTId, Integer newQuantity, String reason) {
        log.info("Allocate stock cho HoaDonCT ID: {}, New Quantity: {}", hoaDonCTId, newQuantity);
        
        HoaDonCT hoaDonCT = hoaDonCTRepository.findById(hoaDonCTId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy HoaDonCT ID: " + hoaDonCTId));
        
        StockAllocation allocation = stockAllocationRepository.findByHoaDonCT(hoaDonCT)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy allocation cho HoaDonCT ID: " + hoaDonCTId));
        
        SanPhamCT sanPhamCT = hoaDonCT.getSanPhamCT();
        int currentStock = sanPhamCT.getSoLuong();
        int currentAllocated = allocation.getEffectiveQuantity();
        int difference = newQuantity - currentAllocated;
        
        // Kiểm tra tồn kho nếu tăng số lượng
        if (difference > 0) {
            int availableStock = getAvailableStock(sanPhamCT.getId());
            if (availableStock < difference) {
                throw new RuntimeException("Không đủ hàng trong kho để tăng số lượng. Có sẵn: " + availableStock + ", Cần thêm: " + difference);
            }
        }
        
        // Cập nhật stock thực tế
        if (allocation.getTrangThai() == StockAllocation.AllocationStatus.RESERVED) {
            // Lần đầu allocate: trừ stock thực tế
            sanPhamCT.setSoLuong(currentStock - newQuantity);
            allocation.allocate(newQuantity);
        } else {
            // Đã allocated trước đó: chỉ điều chỉnh difference
            sanPhamCT.setSoLuong(currentStock - difference);
            allocation.updateAllocated(newQuantity);
        }
        
        sanPhamCTRepository.save(sanPhamCT);
        stockAllocationRepository.save(allocation);
        
        log.info("Đã allocate stock: {} (thay đổi: {}), Stock còn lại: {}", 
                newQuantity, difference, sanPhamCT.getSoLuong());
    }

    /**
     * 3. THÊM SẢN PHẨM MỚI VÀO ĐƠN HÀNG (TRỪ STOCK THỰC TẾ NGAY)
     */
    @Transactional
    public StockAllocation addProductToOrder(HoaDonCT hoaDonCT, Integer quantity) {
        log.info("Thêm sản phẩm mới vào đơn hàng. HoaDonCT ID: {}, Quantity: {}", hoaDonCT.getId(), quantity);
        // Nếu trạng thái đơn đang là 1 (Chờ xác nhận), không trừ kho, chỉ tạo reservation
        try {
            Integer orderStatus = hoaDonCT.getHoaDon() != null ? hoaDonCT.getHoaDon().getTrangThai() : null;
            if (orderStatus != null && orderStatus == 1) {
                log.info("Đơn hàng TT=1, chỉ tạo reservation, không trừ kho");
                return createReservation(hoaDonCT, quantity);
            }
        } catch (Exception ignored) {}

        SanPhamCT sanPhamCT = hoaDonCT.getSanPhamCT();
        int availableStock = getAvailableStock(sanPhamCT.getId());
        
        if (availableStock < quantity) {
            throw new RuntimeException("Không đủ hàng trong kho. Có sẵn: " + availableStock + ", Yêu cầu: " + quantity);
        }
        
        // Trừ stock thực tế ngay
        sanPhamCT.setSoLuong(sanPhamCT.getSoLuong() - quantity);
        sanPhamCTRepository.save(sanPhamCT);
        
        // Tạo allocation với trạng thái ALLOCATED
        StockAllocation allocation = new StockAllocation(hoaDonCT, sanPhamCT, 0);
        allocation.allocate(quantity);
        allocation = stockAllocationRepository.save(allocation);
        
        log.info("Đã thêm sản phẩm và trừ stock thực tế. Stock còn lại: {}", sanPhamCT.getSoLuong());
        return allocation;
    }

    /**
     * 4. XÓA SẢN PHẨM KHỎI ĐƠN HÀNG (HOÀN STOCK)
     */
    @Transactional
    public void removeProductFromOrder(Integer hoaDonCTId) {
        log.info("Xóa sản phẩm khỏi đơn hàng. HoaDonCT ID: {}", hoaDonCTId);
        
        HoaDonCT hoaDonCT = hoaDonCTRepository.findById(hoaDonCTId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy HoaDonCT ID: " + hoaDonCTId));
        
        Optional<StockAllocation> allocationOpt = stockAllocationRepository.findByHoaDonCT(hoaDonCT);
        if (allocationOpt.isPresent()) {
            StockAllocation allocation = allocationOpt.get();
            SanPhamCT sanPhamCT = hoaDonCT.getSanPhamCT();
            
            // Hoàn stock nếu đã allocated
            if (allocation.getTrangThai() == StockAllocation.AllocationStatus.ALLOCATED) {
                int restoreQuantity = allocation.getSoLuongAllocated();
                sanPhamCT.setSoLuong(sanPhamCT.getSoLuong() + restoreQuantity);
                sanPhamCTRepository.save(sanPhamCT);
                log.info("Đã hoàn stock: {}. Stock hiện tại: {}", restoreQuantity, sanPhamCT.getSoLuong());
            }
            
            // Xóa allocation
            stockAllocationRepository.delete(allocation);
        }
        
        log.info("Đã xóa sản phẩm khỏi đơn hàng thành công");
    }

    /**
     * 5. XÁC NHẬN ĐƠN HÀNG CUỐI CÙNG (KHÔNG TRỪ STOCK THÊM)
     */
    @Transactional
    public void confirmOrder(Integer hoaDonId) {
        log.info("Xác nhận đơn hàng ID: {}", hoaDonId);
        
        List<StockAllocation> allocations = stockAllocationRepository.findByHoaDonId(hoaDonId);
        
        for (StockAllocation allocation : allocations) {
            if (allocation.getTrangThai() == StockAllocation.AllocationStatus.RESERVED) {
                // Nếu vẫn còn trạng thái RESERVED, chuyển sang ALLOCATED trước
                SanPhamCT sanPhamCT = allocation.getSanPhamCT();
                int quantity = allocation.getSoLuongReserved();
                sanPhamCT.setSoLuong(sanPhamCT.getSoLuong() - quantity);
                sanPhamCTRepository.save(sanPhamCT);
                allocation.allocate(quantity);
            }
            
            // Chuyển sang trạng thái CONFIRMED
            allocation.confirm();
            stockAllocationRepository.save(allocation);
        }
        
        log.info("Đã xác nhận đơn hàng thành công cho {} sản phẩm", allocations.size());
    }

    /**
     * 6. HỦY ĐƠN HÀNG (HOÀN TẤT CẢ STOCK)
     */
    @Transactional
    public void cancelOrder(Integer hoaDonId) {
        log.info("Hủy đơn hàng ID: {}", hoaDonId);
        
        List<StockAllocation> allocations = stockAllocationRepository.findByHoaDonId(hoaDonId);
        
        for (StockAllocation allocation : allocations) {
            SanPhamCT sanPhamCT = allocation.getSanPhamCT();
            int restoreQuantity = 0;
            
            // Xác định số lượng cần hoàn dựa trên trạng thái
            if (allocation.getTrangThai() == StockAllocation.AllocationStatus.ALLOCATED) {
                restoreQuantity = allocation.getSoLuongAllocated();
            } else if (allocation.getTrangThai() == StockAllocation.AllocationStatus.CONFIRMED) {
                restoreQuantity = allocation.getSoLuongConfirmed();
            }
            // RESERVED không cần hoàn vì chưa trừ stock thực tế
            
            if (restoreQuantity > 0) {
                sanPhamCT.setSoLuong(sanPhamCT.getSoLuong() + restoreQuantity);
                sanPhamCTRepository.save(sanPhamCT);
                log.info("Đã hoàn stock: {} cho sản phẩm {}", restoreQuantity, sanPhamCT.getMa());
            }
            
            allocation.cancel();
            stockAllocationRepository.save(allocation);
        }
        
        log.info("Đã hủy đơn hàng và hoàn stock thành công");
    }

    /**
     * 7. TÍNH STOCK KHẢ DỤNG (TÍNH CẢ RESERVED + ALLOCATED + CONFIRMED)
     */
    public int getAvailableStock(Integer sanPhamCTId) {
        SanPhamCT sanPhamCT = sanPhamCTRepository.findById(sanPhamCTId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm ID: " + sanPhamCTId));
        
        int totalStock = sanPhamCT.getSoLuong();
        
        // Tính tổng đang bị chiếm giữ (RESERVED + ALLOCATED + CONFIRMED)
        Integer totalReserved = stockAllocationRepository.getTotalReservedBySanPhamCTId(sanPhamCTId);
        Integer totalAllocated = stockAllocationRepository.getTotalAllocatedBySanPhamCTId(sanPhamCTId);
        
        int totalOccupied = (totalReserved != null ? totalReserved : 0) + (totalAllocated != null ? totalAllocated : 0);
        
        return Math.max(0, totalStock - totalOccupied);
    }

    /**
     * 5. XÁC NHẬN ALLOCATION (KHÔNG TRỪ THÊM STOCK)
     */
    @Transactional
    public void confirmAllocation(Integer hoaDonCTId, String reason) {
        log.info("Xác nhận allocation cho HoaDonCT ID: {}", hoaDonCTId);
        
        HoaDonCT hoaDonCT = hoaDonCTRepository.findById(hoaDonCTId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy HoaDonCT ID: " + hoaDonCTId));
        
        Optional<StockAllocation> allocationOpt = stockAllocationRepository.findByHoaDonCT(hoaDonCT);
        if (!allocationOpt.isPresent()) {
            throw new RuntimeException("Không tìm thấy allocation cho HoaDonCT ID: " + hoaDonCTId);
        }
        
        StockAllocation allocation = allocationOpt.get();
        
        // Chỉ cập nhật trạng thái, không trừ stock thêm
        allocation.setTrangThai(StockAllocation.AllocationStatus.CONFIRMED);
        allocation.setSoLuongConfirmed(allocation.getSoLuongAllocated());
        
        stockAllocationRepository.save(allocation);
        log.info("Đã xác nhận allocation cho HoaDonCT ID: {} với số lượng: {}", 
                hoaDonCTId, allocation.getSoLuongConfirmed());
    }

    /**
     * 6. HỦY ALLOCATION VÀ HOÀN STOCK
     */
    @Transactional
    public void cancelAllocation(Integer hoaDonCTId, String reason) {
        log.info("Hủy allocation cho HoaDonCT ID: {}", hoaDonCTId);
        
        HoaDonCT hoaDonCT = hoaDonCTRepository.findById(hoaDonCTId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy HoaDonCT ID: " + hoaDonCTId));
        
        Optional<StockAllocation> allocationOpt = stockAllocationRepository.findByHoaDonCT(hoaDonCT);
        if (!allocationOpt.isPresent()) {
            log.warn("Không tìm thấy allocation cho HoaDonCT ID: {}", hoaDonCTId);
            return; // Không có allocation thì không cần hủy
        }
        
        StockAllocation allocation = allocationOpt.get();
        
        // Hoàn stock nếu đã được allocated
        if (allocation.getTrangThai() == StockAllocation.AllocationStatus.ALLOCATED ||
            allocation.getTrangThai() == StockAllocation.AllocationStatus.CONFIRMED) {
            
            SanPhamCT sanPhamCT = allocation.getSanPhamCT();
            int restoreQuantity = allocation.getSoLuongAllocated();
            
            // Hoàn stock
            sanPhamCT.setSoLuong(sanPhamCT.getSoLuong() + restoreQuantity);
            sanPhamCTRepository.save(sanPhamCT);
            
            log.info("Hoàn {} sản phẩm {} vào kho", restoreQuantity, sanPhamCT.getSanPham().getTen());
        }
        
        // Cập nhật trạng thái allocation
        allocation.setTrangThai(StockAllocation.AllocationStatus.CANCELLED);
        stockAllocationRepository.save(allocation);
        
        log.info("Đã hủy allocation cho HoaDonCT ID: {}", hoaDonCTId);
    }

    /**
     * 7. LẤY TỔNG QUAN ALLOCATION CHO SẢN PHẨM
     */
    public Map<String, Integer> getStockAllocationSummary(Integer sanPhamCTId) {
        return stockAllocationRepository.getStockAllocationSummary(sanPhamCTId);
    }

    /**
     * 9. KIỂM TRA XEM ĐƠN HÀNG ĐÃ ĐƯỢC ALLOCATED CHƯA
     */
    public boolean isOrderAllocated(Integer hoaDonId) {
        List<StockAllocation> allocations = stockAllocationRepository.findByHoaDonId(hoaDonId);
        return allocations.stream().anyMatch(a -> 
            a.getTrangThai() == StockAllocation.AllocationStatus.ALLOCATED ||
            a.getTrangThai() == StockAllocation.AllocationStatus.CONFIRMED
        );
    }

    /**
     * 10. CẬP NHẬT ALLOCATION KHI HOÀN HÀNG
     */
    @Transactional
    public void updateAllocationForReturn(Integer hoaDonCTId, Integer returnQuantity) {
        log.info("Cập nhật allocation cho hoàn hàng - HoaDonCT ID: {}, Số lượng hoàn: {}", hoaDonCTId, returnQuantity);
        
        HoaDonCT hoaDonCT = hoaDonCTRepository.findById(hoaDonCTId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy HoaDonCT ID: " + hoaDonCTId));
        
        Optional<StockAllocation> allocationOpt = stockAllocationRepository.findByHoaDonCT(hoaDonCT);
        if (!allocationOpt.isPresent()) {
            throw new RuntimeException("Không tìm thấy allocation cho HoaDonCT ID: " + hoaDonCTId);
        }
        
        StockAllocation allocation = allocationOpt.get();
        SanPhamCT sanPhamCT = allocation.getSanPhamCT();
        
        // Giảm số lượng allocation và hoàn stock
        int newAllocatedQuantity = 0;
        int restoreQuantity = returnQuantity;
        
        if (allocation.getTrangThai() == StockAllocation.AllocationStatus.ALLOCATED) {
            newAllocatedQuantity = Math.max(0, allocation.getSoLuongAllocated() - returnQuantity);
            allocation.setSoLuongAllocated(newAllocatedQuantity);
        } else if (allocation.getTrangThai() == StockAllocation.AllocationStatus.CONFIRMED) {
            newAllocatedQuantity = Math.max(0, allocation.getSoLuongConfirmed() - returnQuantity);
            allocation.setSoLuongConfirmed(newAllocatedQuantity);
            allocation.setSoLuongAllocated(newAllocatedQuantity); // Sync allocated với confirmed
        }
        
        // Hoàn stock
        sanPhamCT.setSoLuong(sanPhamCT.getSoLuong() + restoreQuantity);
        sanPhamCTRepository.save(sanPhamCT);
        
        // Nếu allocation về 0, có thể chuyển thành CANCELLED
        if (newAllocatedQuantity == 0) {
            allocation.setTrangThai(StockAllocation.AllocationStatus.CANCELLED);
        }
        
        stockAllocationRepository.save(allocation);
        
        log.info("Đã cập nhật allocation - Allocation mới: {}, Stock sau khi hoàn: {}", 
                newAllocatedQuantity, sanPhamCT.getSoLuong());
    }

    /**
     * 11. CLEANUP ALLOCATIONS CŨ
     */
    @Transactional
    public void cleanupOldAllocations() {
        java.time.LocalDateTime cutoffDate = java.time.LocalDateTime.now().minusDays(30);
        List<StockAllocation> oldAllocations = stockAllocationRepository.findOldCancelledAllocations(cutoffDate);
        
        stockAllocationRepository.deleteAll(oldAllocations);
        log.info("Đã cleanup {} allocations cũ", oldAllocations.size());
    }
}