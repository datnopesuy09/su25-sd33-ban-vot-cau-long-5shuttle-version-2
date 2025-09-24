# Stock Allocation Bug Fix - Complete Solution

## Vấn đề gốc
- Bug: Sau khi hoàn hàng, hệ thống vẫn hiển thị "chỉ còn 1 sản phẩm" thay vì 4 sản phẩm có sẵn
- Nguyên nhân: Return processing không cập nhật stock allocation status
- Hậu quả: Available stock calculation không chính xác

## Giải pháp đã triển khai

### 1. Cập nhật HoanHangServiceImpl.java
```java
// Thêm dependency
@Autowired
private StockAllocationService stockAllocationService;

// Trong processReturn method
stockAllocationService.updateAllocationForReturn(returnItem.getHoaDonChiTietId());
```

### 2. Thêm method mới trong StockAllocationService.java
```java
public void updateAllocationForReturn(Integer hoaDonChiTietId) {
    // Tìm stock allocation tương ứng
    Optional<StockAllocation> allocation = stockAllocationRepository
        .findByIdHoaDonCT(hoaDonChiTietId);
    
    if (allocation.isPresent()) {
        StockAllocation stockAllocation = allocation.get();
        // Reset allocation về trạng thái ban đầu
        stockAllocation.setSoLuongReserved(0);
        stockAllocation.setSoLuongAllocated(0);
        stockAllocation.setSoLuongConfirmed(0);
        stockAllocation.setTrangThai("RETURNED");
        stockAllocation.setNgayCapNhat(new Date());
        
        stockAllocationRepository.save(stockAllocation);
        logger.info("Updated stock allocation for return - HoaDonCTId: {}", hoaDonChiTietId);
    }
}
```

### 3. Sửa query logic trong StockAllocationRepository.java
```java
// Cũ: Chỉ tính ALLOCATED + CONFIRMED
@Query("SELECT COALESCE(SUM(" +
       "CASE WHEN sa.trangThai = 'ALLOCATED' THEN sa.soLuongAllocated ELSE 0 END + " +
       "CASE WHEN sa.trangThai = 'CONFIRMED' THEN sa.soLuongConfirmed ELSE 0 END" +
       "), 0) FROM StockAllocation sa WHERE sa.idSanPhamCT = :sanPhamCTId " +
       "AND sa.trangThai IN ('ALLOCATED', 'CONFIRMED')")

// Mới: Tính tất cả reserved + allocated + confirmed
@Query("SELECT COALESCE(SUM(" +
       "CASE WHEN sa.trangThai = 'RESERVED' THEN sa.soLuongReserved ELSE 0 END + " +
       "CASE WHEN sa.trangThai = 'ALLOCATED' THEN sa.soLuongAllocated ELSE 0 END + " +
       "CASE WHEN sa.trangThai = 'CONFIRMED' THEN sa.soLuongConfirmed ELSE 0 END" +
       "), 0) FROM StockAllocation sa WHERE sa.idSanPhamCT = :sanPhamCTId")
```

### 4. Cập nhật getAvailableStock method
```java
public Integer getAvailableStock(Integer sanPhamCTId) {
    Integer currentStock = getCurrentStock(sanPhamCTId);
    if (currentStock == null) {
        return 0;
    }
    
    // Tính tất cả allocation states 
    Integer totalReserved = getTotalReservedBySanPhamCTId(sanPhamCTId);
    Integer totalAllocated = getTotalAllocatedBySanPhamCTId(sanPhamCTId);
    
    // Available = Current - (Reserved + Allocated + Confirmed)
    return currentStock - totalReserved - totalAllocated;
}
```

### 5. Thêm debug endpoint
```java
@GetMapping("/debug/{sanPhamCTId}")
public ResponseEntity<?> debugStockAllocation(@PathVariable Integer sanPhamCTId) {
    // Trả về chi tiết stock allocation cho debugging
}
```

## Tệp scripts hỗ trợ
- `debug_stock_allocation.sql` - Phân tích allocation hiện tại
- `fix_stock_allocation.sql` - Sửa dữ liệu bị corrupted

## Kiểm tra và validation

### 1. Chạy debug script
```sql
-- Xem tình trạng allocation hiện tại
source debug_stock_allocation.sql
```

### 2. Test API endpoint
```bash
GET /api/stock-allocation/debug/{sanPhamCTId}
```

### 3. Test return process
1. Tạo đơn hàng mới
2. Thực hiện hoàn hàng
3. Kiểm tra available stock có cập nhật đúng không

## Kết quả mong đợi
- ✅ Return process cập nhật stock allocation status
- ✅ Available stock calculation chính xác
- ✅ Hiển thị đúng số lượng có sẵn sau hoàn hàng (4 thay vì 1)
- ✅ Debug tools để monitoring allocation states

## Các trạng thái allocation
- `RESERVED` - Đang chờ xử lý đơn hàng
- `ALLOCATED` - Đã phân bổ cho đơn hàng
- `CONFIRMED` - Đã xác nhận giao hàng
- `RETURNED` - Đã hoàn trả (NEW)

## Log monitoring
Theo dõi logs với keyword: "Updated stock allocation for return"