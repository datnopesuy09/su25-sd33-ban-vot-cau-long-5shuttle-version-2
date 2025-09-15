# 🔧 Sửa Lỗi Hoàn Kho Khi Chọn "Hàng Bị Hỏng/Vỡ"

## 🚨 Vấn Đề Đã Phát Hiện

**Bug**: Khi chọn loại sự cố **"Hàng bị hỏng/vỡ"** và click **"Không giải quyết được"**, hệ thống vẫn **HOÀN KHO** thay vì **KHÔNG HOÀN KHO**.

## 🔍 Nguyên Nhân

### 1. **Flow Xử Lý Có 2 Đường:**
```
Khi click "Không giải quyết được":
├── Đường 1: API /cancel-due-to-incident (✅ Logic đúng)
└── Đường 2: Fallback API /status (❌ Auto hoàn kho)
```

### 2. **Method `updateHoaDonStatus` Tự Động Hoàn Kho:**
```java
// ❌ VẤN ĐỀ: Tự động hoàn kho mọi trường hợp hủy đơn
if (newStatus == 7 && oldStatus != 7) {
    khoHangService.restoreStockOnCancelOrder(hoaDon); // ← BUG ở đây
}
```

### 3. **Frontend Fallback Gọi API Sai:**
```javascript
// ❌ VẤN ĐỀ: Fallback gọi API tự động hoàn kho
await fetch(`/api/hoa-don/${id}/status`, {
    body: JSON.stringify(7) // ← Trigger auto restore
});
```

## ✅ Giải Pháp Đã Áp Dụng

### **Backend Changes:**

#### 1. **Tạo Method Mới Không Hoàn Kho** 
```java
// ✅ NEW: Method cập nhật status mà KHÔNG hoàn kho
@Transactional
public HoaDon updateHoaDonStatusWithoutStockRestore(int id, int newStatus) {
    // CHỈ cập nhật status, KHÔNG auto restore
}
```

#### 2. **Tạo Endpoint Mới**
```java
// ✅ NEW: Endpoint không auto restore
@PutMapping("/{id}/status-no-restore") 
public ResponseEntity<HoaDon> updateHoaDonStatusWithoutStockRestore(...)
```

#### 3. **Giữ Method Cũ Cho Trường Hợp Khác**
```java
// ✅ KEPT: Method cũ vẫn auto restore cho hủy đơn thông thường
@PutMapping("/{id}/status")
public ResponseEntity<HoaDon> updateHoaDonStatus(...) {
    // Vẫn auto restore cho trường hợp hủy đơn bình thường
}
```

### **Frontend Changes:**

#### 4. **Sửa Fallback API Call**
```javascript
// ✅ FIXED: Sử dụng endpoint không auto restore
await fetch(`/api/hoa-don/${id}/status-no-restore`, {
    body: JSON.stringify(7) // ← KHÔNG trigger auto restore
});
```

## 🔄 Flow Mới (Đã Sửa)

```
Click "Không giải quyết được"
│
├─ Step 1: Cập nhật incident status = 2
│
├─ Step 2: Hủy đơn hàng 
│   ├─ TRY: /cancel-due-to-incident (✅ Logic có điều kiện)
│   └─ FALLBACK: /status-no-restore (✅ KHÔNG auto restore)
│
├─ Step 3: Hoàn tiền
├─ Step 4: SKIP (đã xử lý trong Step 2)
├─ Step 5: Thông báo khách hàng  
├─ Step 6: Audit logging
└─ Step 7: Thông báo nội bộ
```

## 🧪 Logic Hoàn Kho (Xác Nhận)

### **API `/cancel-due-to-incident`:**
```java
if (shouldRestoreStockForIncidentType(loaiSuCo)) {
    restoreStockOnCancelOrder(hoaDon); // ✅ CHỈ khi KHONG_NHAN_HANG, CHUA_NHAN_HANG
} else {
    recordDamagedOrLostStock(...); // ✅ Ghi nhận cho HANG_BI_HONG, HANG_BI_MAT, etc.
}
```

### **API `/status-no-restore` (Fallback):**
```java
// ✅ CHỈ cập nhật status, KHÔNG hoàn kho
hoaDon.setTrangThai(newStatus);
hoaDonRepository.save(hoaDon);
```

## 📊 Test Cases

| Loại Sự Cố | API Primary | API Fallback | Kết Quả |
|-------------|-------------|--------------|---------|
| Khách không nhận | ✅ Hoàn kho | ✅ Không auto restore | ✅ HOÀN KHO |
| Khách chưa nhận | ✅ Hoàn kho | ✅ Không auto restore | ✅ HOÀN KHO |
| Hàng bị hỏng | ✅ Ghi nhận | ✅ Không auto restore | ✅ KHÔNG HOÀN KHO |
| Hàng bị mất | ✅ Ghi nhận | ✅ Không auto restore | ✅ KHÔNG HOÀN KHO |
| Sự cố vận chuyển | ✅ Ghi nhận | ✅ Không auto restore | ✅ KHÔNG HOÀN KHO |
| Sự cố khác | ✅ Ghi nhận | ✅ Không auto restore | ✅ KHÔNG HOÀN KHO |

## 🎯 Kết Quả

- ✅ **Hàng bị hỏng/vỡ**: KHÔNG hoàn kho 
- ✅ **Hàng bị mất**: KHÔNG hoàn kho
- ✅ **Sự cố vận chuyển**: KHÔNG hoàn kho  
- ✅ **Khách không nhận**: Vẫn hoàn kho bình thường
- ✅ **Backward compatibility**: Hủy đơn thông thường vẫn auto restore
