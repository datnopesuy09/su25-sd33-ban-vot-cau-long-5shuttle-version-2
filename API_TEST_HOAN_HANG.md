# API Test Collection cho Chức Năng Hoàn Hàng

## 1. Test API Hoàn Hàng

### POST /api/hoan-hang
```bash
curl -X POST http://localhost:8080/api/hoan-hang \
  -H "Content-Type: application/json" \
  -d '{
    "hoaDonId": 1,
    "hoaDonChiTietId": 1,
    "soLuongHoan": 2,
    "donGia": 150000,
    "lyDoHoan": "Khách hàng đổi ý",
    "ghiChu": "Hoàn hàng do đang vận chuyển",
    "nguoiTao": "Admin"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Hoàn hàng thành công",
  "data": {
    "id": 1,
    "maHoanHang": "HH202509220001",
    "thanhTien": 300000,
    "tongTienMoi": 1200000,
    "tongTienHoanHang": 300000
  }
}
```

## 2. Test API Lấy Lịch Sử Hoàn Hàng

### GET /api/hoan-hang/hoa-don/{hoaDonId}
```bash
curl -X GET http://localhost:8080/api/hoan-hang/hoa-don/1
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Lấy danh sách hoàn hàng thành công",
  "data": [
    {
      "id": 1,
      "maHoanHang": "HH202509220001",
      "hoaDonId": 1,
      "hoaDonChiTietId": 1,
      "soLuongHoan": 2,
      "donGia": 150000,
      "thanhTien": 300000,
      "lyDoHoan": "Khách hàng đổi ý",
      "ghiChu": "Hoàn hàng do đang vận chuyển",
      "trangThai": 1,
      "nguoiTao": "Admin",
      "ngayTao": "2025-09-22T10:30:00",
      "tenSanPham": "Vợt cầu lông Yonex",
      "mauSac": "Đỏ",
      "trongLuong": "85g",
      "hinhAnh": "image_url.jpg"
    }
  ]
}
```

## 3. Test API Tổng Tiền Hoàn Hàng

### GET /api/hoan-hang/tong-tien/{hoaDonId}
```bash
curl -X GET http://localhost:8080/api/hoan-hang/tong-tien/1
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Lấy tổng tiền hoàn hàng thành công",
  "data": 300000
}
```

## 4. Test Cases Cần Kiểm Tra

### 4.1 Validation Tests
- ✅ Số lượng hoàn > số lượng có thể hoàn
- ✅ Đơn giá <= 0
- ✅ Hoàn hàng khi đơn hàng không ở trạng thái vận chuyển
- ✅ Hóa đơn chi tiết không tồn tại

### 4.2 Business Logic Tests
- ✅ Cập nhật số lượng trong hóa đơn chi tiết
- ✅ Hoàn lại tồn kho sản phẩm
- ✅ Cập nhật tổng tiền hóa đơn
- ✅ Tạo mã hoàn hàng tự động

### 4.3 Frontend Integration Tests
- ✅ UI hiển thị nút hoàn hàng khi status = 3
- ✅ Modal hoàn hàng hoạt động đúng
- ✅ Callback cập nhật tổng tiền
- ✅ Hiển thị lịch sử hoàn hàng cho user

## 5. Database Verification

### Kiểm tra bảng HoanHang
```sql
SELECT * FROM HoanHang WHERE hoa_don_id = 1;
```

### Kiểm tra cập nhật HoaDonCT
```sql
SELECT id, so_luong, thanh_tien FROM HoaDonChiTiet WHERE id = 1;
```

### Kiểm tra cập nhật tồn kho
```sql
SELECT sp.ten, spct.so_luong FROM SanPhamCT spct 
JOIN SanPham sp ON spct.san_pham_id = sp.id 
WHERE spct.id = (SELECT san_pham_ct_id FROM HoaDonChiTiet WHERE id = 1);
```

### Kiểm tra cập nhật HoaDon
```sql
SELECT id, tong_tien, tong_tien_sau_giam FROM HoaDon WHERE id = 1;
```