# Hướng dẫn thực hiện khắc phục lỗi Force hoàn kho 2 lần

## 🚨 Vấn đề đã khắc phục

**Vấn đề cũ (SAI):**

- Force hoàn kho được phép 2 lần
- Lần 1: Hoàn lại số lượng đã trừ ✅
- Lần 2: Hoàn thêm lần nữa → **Kho bị thừa!** ❌

**Giải pháp mới (ĐÚNG):**

- **CHỈ CHO PHÉP 1 LẦN** hoàn kho cho mỗi đơn hàng
- Tracking database để tránh duplicate restoration
- Kiểm tra nghiêm ngặt trước khi hoàn kho

## 📋 Các thay đổi đã thực hiện

### 1. Tạo bảng tracking (QUAN TRỌNG!)

**File:** `sql/lich_su_hoan_kho.sql`

Bạn cần chạy SQL này trong MySQL để tạo bảng tracking:

```sql
USE 5SHUTTLE;

CREATE TABLE IF NOT EXISTS lich_su_hoan_kho (
    id INT AUTO_INCREMENT PRIMARY KEY,
    hoa_don_id INT NOT NULL,
    san_pham_ct_id INT NOT NULL,
    so_luong_hoan INT NOT NULL,
    loai_hoan_kho ENUM('AUTO', 'MANUAL', 'FORCE') NOT NULL,
    ly_do TEXT,
    nguoi_thuc_hien VARCHAR(100),
    thoi_gian TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (hoa_don_id) REFERENCES HoaDon(id) ON DELETE CASCADE,
    INDEX idx_hoa_don_id (hoa_don_id),
    INDEX idx_san_pham_ct_id (san_pham_ct_id),

    -- Constraint để tránh duplicate hoàn kho cho cùng 1 đơn hàng và sản phẩm
    UNIQUE KEY unique_restore (hoa_don_id, san_pham_ct_id, loai_hoan_kho)
);
```

### 2. Cập nhật KhoHangService.java

**Các method mới được thêm:**

- ✅ `isOrderAlreadyRestored()` - Kiểm tra đã hoàn kho chưa
- ✅ `getForceRestoreCount()` - Đếm số lần force restore
- ✅ `saveRestoreHistory()` - Lưu lịch sử hoàn kho
- ✅ `manualRestoreStock()` - Hoàn kho thủ công an toàn
- ✅ `forceRestoreStock()` - Force hoàn kho CHỈ 1 LẦN

**Logic an toàn:**

- Kiểm tra duplicate trước khi hoàn kho
- Lưu lịch sử mọi thao tác
- Giới hạn force restore = 1 lần duy nhất

### 3. Cập nhật KhoHangController.java

**API endpoints mới:**

- ✅ `GET /api/kho-hang/lich-su/{hoaDonId}` - Lấy lịch sử hoàn kho
- ✅ Cập nhật logic `/hoan-kho/{hoaDonId}` - Sử dụng method an toàn
- ✅ Cập nhật logic `/force-hoan-kho/{hoaDonId}` - Giới hạn 1 lần

### 4. Cập nhật KhoHangManagement.jsx

**UI cải thiện:**

- ✅ Tracking state hoàn kho từ backend
- ✅ Hiển thị "✅ Đã hoàn kho" khi đã hoàn
- ✅ Vô hiệu hóa nút khi đã hoàn kho
- ✅ Cảnh báo "CHỈ 1 LẦN DUY NHẤT" cho force restore
- ✅ Real-time update từ API

## 🎯 Cách test logic mới

### Test Case 1: Hoàn kho thông thường

1. Tạo đơn hàng và hủy (trạng thái = 7)
2. Nhấn "Hoàn kho" → Thành công ✅
3. Nhấn "Hoàn kho" lần 2 → Bị chặn ❌
4. Kiểm tra kho: Chỉ hoàn đúng 1 lần

### Test Case 2: Force hoàn kho

1. Nhấn "Force Hoàn Kho" → Nhập lý do → Thành công ✅
2. Nhấn "Force Hoàn Kho" lần 2 → Nút bị vô hiệu hóa ❌
3. Kiểm tra kho: Chỉ hoàn đúng 1 lần

### Test Case 3: Kết hợp

1. Hoàn kho thông thường → Thành công ✅
2. Force hoàn kho → Bị chặn ❌ (đã hoàn rồi)

## 🔍 Monitoring và Debugging

### Kiểm tra lịch sử hoàn kho:

```sql
SELECT
    lsh.*,
    hd.ma as ma_hoa_don,
    sp.ten as ten_san_pham
FROM lich_su_hoan_kho lsh
JOIN HoaDon hd ON lsh.hoa_don_id = hd.id
JOIN SanPhamCT spct ON lsh.san_pham_ct_id = spct.id
JOIN SanPham sp ON spct.san_pham_id = sp.id
ORDER BY lsh.thoi_gian DESC;
```

### Log patterns để tìm:

- ✅ `Hoàn kho AUTO thành công`
- ✅ `Hoàn kho MANUAL thành công`
- ⚠️ `FORCE RESTORE HOÀN THÀNH`
- ❌ `CẢNH BÁO: Đơn hàng đã được hoàn kho trước đó`

## ✅ Kết quả mong đợi

**Trước (SAI):**

- Có thể force hoàn kho 2 lần → Kho thừa
- Không có tracking → Khó kiểm soát
- Logic không an toàn

**Sau (ĐÚNG):**

- ✅ CHỈ 1 LẦN hoàn kho cho mỗi đơn hàng
- ✅ Database tracking đầy đủ
- ✅ UI thông minh, real-time updates
- ✅ Không thể duplicate restoration
- ✅ Audit trail đầy đủ

## 🚀 Next Steps

1. **Chạy SQL** để tạo bảng `lich_su_hoan_kho`
2. **Restart backend** để load logic mới
3. **Test thoroughly** các cases trên
4. **Monitor logs** để confirm hoạt động đúng

**Lưu ý:** Đây là thay đổi breaking - cần test kỹ trước khi deploy production!
