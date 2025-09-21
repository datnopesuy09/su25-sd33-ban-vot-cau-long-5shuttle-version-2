# 🛠️ HƯỚNG DẪN TRIỂN KHAI HỆ THỐNG STOCK ALLOCATION

## 📋 TỔNG QUAN GIẢI PHÁP

### Vấn đề hiện tại:

- Đặt hàng online: chỉ reserve, không trừ stock thực tế
- Admin điều chỉnh đơn hàng: trừ/cộng stock trực tiếp
- Xác nhận đơn hàng: lại trừ stock thêm lần nữa → **SAI SỐ LIỆU**

### Giải pháp mới:

**Stock Allocation System** với 3 trạng thái rõ ràng:

- **RESERVED**: Đặt trước (chưa trừ stock thực)
- **ALLOCATED**: Đã phân bổ (đã trừ stock thực)
- **CONFIRMED**: Đã xác nhận (hoàn tất, không thay đổi)

## 🗄️ BƯỚC 1: CÀI ĐẶT DATABASE

### 1.1 Chạy script tạo bảng

```bash
# Trong MySQL/phpMyAdmin, chạy file:
sql/stock_allocation_schema.sql
```

### 1.2 Kiểm tra các bảng đã tạo:

- `stock_allocation` - Bảng chính theo dõi allocation
- `stock_allocation_history` - Lịch sử thay đổi
- Cột mới trong `HoaDonCT`: `IsStockAllocated`, `AllocationStatus`

**⚠️ Lưu ý:** Schema đã được sửa đổi để phù hợp với naming convention của database hiện tại:

- Tên bảng: `HoaDonCT` (không có underscore)
- Tên cột: `IdSanPhamCT`, `IdHoaDon` (PascalCase)
- Foreign key: `REFERENCES HoaDonCT(Id)`, `REFERENCES SanPhamCT(Id)`

## 🔧 BƯỚC 2: TRIỂN KHAI BACKEND

### 2.1 Thêm các file mới:

```
da_be/src/main/java/com/example/da_be/
├── entity/StockAllocation.java
├── repository/StockAllocationRepository.java
├── service/StockAllocationService.java
└── service/EnhancedKhoHangService.java
```

### 2.2 Cập nhật DatHangController.java:

```java
// Thay thế method đặt hàng hiện tại
@Autowired
private EnhancedKhoHangService enhancedKhoHangService;

@PostMapping
public ResponseEntity<?> datHang(@RequestBody DatHangRequestDTO orderRequest) {
    try {
        // ... logic tạo hóa đơn giữ nguyên ...

        // THAY ĐỔI: Sử dụng createOrderReservation thay vì reserveStock
        enhancedKhoHangService.createOrderReservation(hoaDon, hoaDonCTList);

        return ResponseEntity.ok("Đặt hàng thành công");
    } catch (Exception e) {
        return ResponseEntity.status(500).body("Lỗi: " + e.getMessage());
    }
}
```

### 2.3 Cập nhật HoaDonService.java:

```java
@Autowired
private EnhancedKhoHangService enhancedKhoHangService;

@Transactional
public HoaDon confirmOrder(int id) {
    HoaDon hoaDon = hoaDonRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy hóa đơn"));

    if (hoaDon.getTrangThai() != 1) {
        throw new IllegalArgumentException("Chỉ có thể xác nhận đơn hàng có trạng thái 'Chờ xác nhận'");
    }

    try {
        // THAY ĐỔI: Sử dụng confirmOrderFinal thay vì confirmOrderAndReduceStock
        enhancedKhoHangService.confirmOrderFinal(hoaDon);

        hoaDon.setTrangThai(2);
        hoaDon.setNgaySua(new Date());

        // Tạo thông báo...

        return hoaDonRepository.save(hoaDon);
    } catch (Exception e) {
        throw new RuntimeException("Không thể xác nhận đơn hàng: " + e.getMessage());
    }
}
```

### 2.4 Cập nhật HoaDonCTService.java:

```java
@Autowired
private EnhancedKhoHangService enhancedKhoHangService;

@Transactional
public void updateQuantity(Integer hoaDonCTId, Integer newQuantity) {
    // THAY ĐỔI: Sử dụng updateOrderItemQuantity
    enhancedKhoHangService.updateOrderItemQuantity(hoaDonCTId, newQuantity, "Admin điều chỉnh số lượng");
}
```

### 2.5 Tạo StockAllocationController.java:

```java
@RestController
@RequestMapping("/api/stock-allocation")
@CrossOrigin(origins = "http://localhost:5173")
public class StockAllocationController {

    @Autowired
    private StockAllocationService stockAllocationService;

    @GetMapping("/summary/{sanPhamCTId}")
    public ResponseEntity<?> getStockSummary(@PathVariable Integer sanPhamCTId) {
        try {
            Map<String, Integer> summary = stockAllocationService.getStockAllocationSummary(sanPhamCTId);
            int availableStock = stockAllocationService.getAvailableStock(sanPhamCTId);

            Map<String, Object> response = new HashMap<>();
            response.put("availableStock", availableStock);
            response.put("totalReserved", summary.get("totalReserved"));
            response.put("totalAllocated", summary.get("totalAllocated"));
            response.put("totalConfirmed", summary.get("totalConfirmed"));
            response.put("allocationStatus", "ALLOCATED"); // Logic xác định status

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Lỗi: " + e.getMessage());
        }
    }
}
```

## 🎨 BƯỚC 3: TRIỂN KHAI FRONTEND

### 3.1 Tích hợp StockAllocationIndicator vào ProductList.jsx:

```jsx
import StockAllocationIndicator from "../../../components/StockAllocationIndicator";

// Trong component ProductList
{
  orderDetailDatas.map((orderDetail, index) => (
    <div key={index} className="bg-white rounded-xl shadow-lg p-6 mb-4">
      {/* Thông tin sản phẩm hiện tại */}

      {/* THÊM: Stock Allocation Indicator */}
      <StockAllocationIndicator
        sanPhamCTId={orderDetail.sanPhamCT.id}
        hoaDonCTId={orderDetail.id}
        currentQuantity={orderDetail.soLuong}
        isOrderConfirmed={currentOrderStatus >= 3}
        showDetails={true}
      />

      {/* Nút điều chỉnh số lượng */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => handleQuantityChange(-1, orderDetail.id)}
          disabled={currentOrderStatus >= 3 || orderDetail.soLuong <= 1}
          className="..."
        >
          <Minus size={14} />
        </button>
        {/* ... */}
      </div>
    </div>
  ));
}
```

### 3.2 Cập nhật OrderStatus.jsx để hiển thị cảnh báo:

```jsx
// Thêm state tracking allocation status
const [allocationWarnings, setAllocationWarnings] = useState([]);

// Kiểm tra allocation trước khi xác nhận đơn hàng
const confirmOrder = async (description = "Xác nhận đơn hàng") => {
  try {
    // Kiểm tra allocation status trước
    const allocationCheck = await fetch(
      `http://localhost:8080/api/stock-allocation/check/${hoaDonId}`
    );
    const allocationData = await allocationCheck.json();

    if (allocationData.hasWarnings) {
      const confirmed = await swal({
        title: "Cảnh báo Stock Allocation",
        text: `Có ${allocationData.warnings.length} sản phẩm chưa được phân bổ đúng cách. Tiếp tục?`,
        icon: "warning",
        buttons: ["Hủy", "Tiếp tục"],
        dangerMode: true,
      });

      if (!confirmed) return;
    }

    const response = await fetch(
      `http://localhost:8080/api/hoa-don/${hoaDonId}/confirm`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      }
    );

    if (!response.ok) {
      throw new Error(await response.text());
    }

    setCurrentOrderStatus(2);
    // Lưu lịch sử...
  } catch (error) {
    console.error("Lỗi khi xác nhận đơn hàng:", error);
    toast.error("Không thể xác nhận đơn hàng: " + error.message);
  }
};
```

## 🔄 BƯỚC 4: MIGRATION DỮ LIỆU CŨ

### 4.1 Tạo API migration:

```java
@PostMapping("/migrate-order/{hoaDonId}")
public ResponseEntity<?> migrateOrder(@PathVariable Integer hoaDonId) {
    try {
        enhancedKhoHangService.migrateExistingOrder(hoaDonId);
        return ResponseEntity.ok("Migration thành công");
    } catch (Exception e) {
        return ResponseEntity.status(500).body("Lỗi migration: " + e.getMessage());
    }
}
```

### 4.2 Script migration cho tất cả đơn hàng:

```sql
-- Migrate tất cả đơn hàng hiện tại (đã sửa theo naming convention)
INSERT INTO stock_allocation (IdHoaDonCT, IdSanPhamCT, SoLuongAllocated, TrangThai)
SELECT
    hdct.Id,
    hdct.IdSanPhamCT,
    hdct.SoLuong,
    CASE
        WHEN hd.TrangThai >= 2 THEN 'CONFIRMED'
        ELSE 'ALLOCATED'
    END
FROM HoaDonCT hdct
INNER JOIN HoaDon hd ON hdct.IdHoaDon = hd.Id
WHERE hd.TrangThai NOT IN (7) -- Không migrate đơn đã hủy
ON DUPLICATE KEY UPDATE
    SoLuongAllocated = VALUES(SoLuongAllocated),
    TrangThai = VALUES(TrangThai);
```

## ✅ BƯỚC 5: TESTING & VALIDATION

### 5.1 Test Cases:

1. **Đặt hàng mới** → Kiểm tra RESERVED status
2. **Admin tăng số lượng** → Kiểm tra stock bị trừ
3. **Admin giảm số lượng** → Kiểm tra stock được hoàn
4. **Thêm sản phẩm** → Kiểm tra ALLOCATED ngay
5. **Xóa sản phẩm** → Kiểm tra stock được hoàn
6. **Xác nhận đơn hàng** → Kiểm tra CONFIRMED, không trừ thêm
7. **Hủy đơn hàng** → Kiểm tra tất cả stock được hoàn

### 5.2 Validation Queries:

```sql
-- Kiểm tra tính nhất quán stock
SELECT
    sp.ten,
    spct.so_luong as stock_hien_tai,
    COALESCE(SUM(sa.so_luong_allocated), 0) as tong_allocated,
    (spct.so_luong + COALESCE(SUM(sa.so_luong_allocated), 0)) as should_be_original_stock
FROM san_pham_ct spct
LEFT JOIN san_pham sp ON spct.san_pham_id = sp.id
LEFT JOIN stock_allocation sa ON spct.id = sa.san_pham_ct_id
    AND sa.trang_thai IN ('ALLOCATED', 'CONFIRMED')
GROUP BY spct.id;

-- Kiểm tra đơn hàng có allocation
SELECT
    hd.ma,
    hd.trang_thai,
    COUNT(sa.id) as allocation_count,
    GROUP_CONCAT(sa.trang_thai) as allocation_statuses
FROM hoa_don hd
LEFT JOIN hoa_don_ct hdct ON hd.id = hdct.hoa_don_id
LEFT JOIN stock_allocation sa ON hdct.id = sa.hoa_don_ct_id
GROUP BY hd.id
HAVING allocation_count = 0 AND hd.trang_thai NOT IN (7);
```

## 🚨 ROLLBACK PLAN

Nếu có vấn đề, có thể rollback:

```sql
-- 1. Backup trước khi triển khai
CREATE TABLE stock_allocation_backup AS SELECT * FROM stock_allocation;
CREATE TABLE san_pham_ct_backup AS SELECT * FROM san_pham_ct;

-- 2. Rollback nếu cần
DROP TABLE stock_allocation;
DROP TABLE stock_allocation_history;
ALTER TABLE hoa_don_ct DROP COLUMN is_stock_allocated;
ALTER TABLE hoa_don_ct DROP COLUMN allocation_status;
```

## 📊 MONITORING & MAINTENANCE

### Dashboard queries:

```sql
-- Tổng quan allocation
SELECT
    trang_thai,
    COUNT(*) as so_luong,
    SUM(so_luong_allocated) as tong_san_pham
FROM stock_allocation
GROUP BY trang_thai;

-- Sản phẩm có vấn đề về stock
SELECT * FROM view_stock_allocation_summary
WHERE ton_kho_co_san < 0;
```

### Cleanup job (chạy hàng tuần):

```java
@Scheduled(cron = "0 0 2 * * SUN") // 2AM mỗi Chủ nhật
public void weeklyCleanup() {
    stockAllocationService.cleanupOldAllocations();
}
```

---

## 🎯 KẾT QUẢ MONG ĐỢI

Sau khi triển khai:

- ✅ Không còn bị trừ stock 2 lần
- ✅ Theo dõi chính xác trạng thái allocation
- ✅ Hiển thị cảnh báo khi stock không đủ
- ✅ Lịch sử thay đổi stock đầy đủ
- ✅ Admin có thể kiểm soát tốt hơn
