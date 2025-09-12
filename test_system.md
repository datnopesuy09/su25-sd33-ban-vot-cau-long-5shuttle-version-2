# Hướng dẫn Test Hệ thống Quản lý Sự cố Vận chuyển

## 1. Kiểm tra Backend (Spring Boot)

### Khởi động Backend:

```bash
cd da_be
./mvnw spring-boot:run
```

### Kiểm tra API endpoints:

#### 1.1 Tạo sự cố vận chuyển mới:

```bash
POST http://localhost:8080/api/admin/su-co-van-chuyen/create
Content-Type: application/json

{
    "hoaDonId": 1,
    "nguoiBaoCao": 1,
    "loaiSuCo": "KHACH_HANG_KHONG_NHAN",
    "moTa": "Khách hàng báo không nhận được hàng",
    "diaChi": "123 Nguyễn Trãi, Hà Nội"
}
```

#### 1.2 Lấy danh sách sự cố:

```bash
GET http://localhost:8080/api/admin/su-co-van-chuyen/all
```

#### 1.3 Lấy sự cố theo ID hóa đơn:

```bash
GET http://localhost:8080/api/admin/su-co-van-chuyen/by-order/1
```

#### 1.4 Cập nhật trạng thái sự cố:

```bash
PUT http://localhost:8080/api/admin/su-co-van-chuyen/1/status
Content-Type: application/json

{
    "trangThai": "DANG_XU_LY"
}
```

## 2. Kiểm tra Frontend (React)

### Khởi động Frontend:

```bash
cd da_fe
npm run dev
```

### Các trang cần test:

#### 2.1 Trang quản lý đơn hàng:

- URL: `http://localhost:5173/admin/order`
- Kiểm tra: Button "Báo cáo sự cố" xuất hiện khi order có trạng thái phù hợp

#### 2.2 Modal báo cáo sự cố:

- Click vào button "Báo cáo sự cố"
- Kiểm tra form hiển thị đúng
- Test tạo sự cố mới
- Kiểm tra validation

#### 2.3 Danh sách sự cố:

- Kiểm tra component DeliveryIncidentList hiển thị
- Test filter theo trạng thái
- Test pagination

## 3. Kiểm tra Database

### Kết nối database và chạy:

```sql
-- Kiểm tra dữ liệu trong bảng sự cố
SELECT * FROM SuCoVanChuyen;

-- Kiểm tra view
SELECT * FROM VW_SuCoVanChuyen_ChiTiet;

-- Kiểm tra trigger hoạt động
SELECT * FROM ChiTietXuLySuCo;
```

## 4. Test Cases cần thực hiện:

### 4.1 Test tạo sự cố:

- [x] Tạo sự cố với đầy đủ thông tin
- [x] Tạo sự cố thiếu thông tin (validation)
- [x] Tạo sự cố với hóa đơn không tồn tại
- [x] Tạo sự cố với user không tồn tại

### 4.2 Test hiển thị danh sách:

- [x] Hiển thị tất cả sự cố
- [x] Filter theo trạng thái
- [x] Filter theo loại sự cố
- [x] Pagination

### 4.3 Test cập nhật sự cố:

- [x] Cập nhật trạng thái
- [x] Thêm ghi chú xử lý
- [x] Ghi lại lịch sử thay đổi

### 4.4 Test integration:

- [x] Tích hợp với quản lý đơn hàng
- [x] Thông báo real-time (nếu có)
- [x] Export báo cáo

## 5. Kết quả mong đợi:

### Backend:

- ✅ Không có lỗi compilation
- ✅ Tất cả API endpoints hoạt động
- ✅ Database schema tương thích
- ✅ Validation hoạt động đúng

### Frontend:

- ✅ UI hiển thị đúng
- ✅ Form validation hoạt động
- ✅ API calls thành công
- ✅ Error handling đúng

### Database:

- ✅ Tables và views tạo thành công
- ✅ Triggers hoạt động
- ✅ Foreign keys đúng
- ✅ Data types tương thích

## 6. Checklist hoàn thành:

- [x] Backend Entity sử dụng Integer cho IDs
- [x] Frontend components không có lỗi syntax
- [x] Database schema đúng convention
- [x] API endpoints hoạt động
- [x] UI integration hoàn thành
- [x] Type consistency được đảm bảo

## 7. Lưu ý:

- Tất cả các file đã được cập nhật để sử dụng `Integer` thay vì `Long`
- Database schema sử dụng `INT` và `NVARCHAR` theo convention của dự án
- Naming convention sử dụng PascalCase cho database
- Frontend components được đặt trong thư mục `/components/admin/`
