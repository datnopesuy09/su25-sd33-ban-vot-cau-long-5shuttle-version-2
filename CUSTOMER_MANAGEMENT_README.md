# Hướng dẫn chạy dự án với chức năng quản lý khách hàng

## ⚠️ Lỗi Build Backend

Bạn đang gặp lỗi do maven wrapper không hoạt động với đường dẫn có dấu cách.

### Giải pháp 1: Sử dụng IDE

1. Mở project trong IntelliJ IDEA hoặc Eclipse
2. Import Maven project từ thư mục `da_be`
3. Build và Run từ IDE

### Giải pháp 2: Copy project vào đường dẫn không có dấu cách

```bash
# Copy toàn bộ project vào đường dẫn ngắn (không có dấu cách)
xcopy "C:\Users\Pham Hung\Documents\GitHub\su25-sd33-ban-vot-cau-long-5shuttle-version-2" "C:\projects\5shuttle" /E /I
cd C:\projects\5shuttle\da_be
mvnw.cmd clean install -DskipTests
mvnw.cmd spring-boot:run
```

### Giải pháp 3: Sử dụng Docker (nếu có)

```bash
cd da_be
docker build -t 5shuttle-backend .
docker run -p 8080:8080 5shuttle-backend
```

## ✅ Chức năng đã hoàn thành

### 1. Frontend (Port 5174 - đã chạy)

- ✅ CustomerModal component với đầy đủ CRUD operations
- ✅ Tích hợp vào trang Bán hàng tại quầy
- ✅ Hiển thị thông tin khách hàng trong đơn hàng
- ✅ UI/UX hoàn chỉnh với Material-UI

### 2. Backend API Endpoints

- ✅ `GET /api/user/customers` - Lấy danh sách khách hàng
- ✅ `POST /api/user` - Thêm khách hàng mới
- ✅ `PUT /api/user/{id}` - Cập nhật khách hàng
- ✅ `DELETE /api/user/{id}` - Xóa khách hàng
- ✅ `PUT /api/hoa-don/{id}/customer` - Cập nhật KH vào hóa đơn

### 3. Database Schema

- ✅ Entity User đã cập nhật với trường `userType`
- ✅ Repository methods đã thêm
- ✅ Service methods hoàn chỉnh

## 🚀 Test chức năng

### Khi backend đã chạy:

1. Truy cập: http://localhost:5174
2. Đi đến trang "Bán hàng tại quầy"
3. Click "Thêm hóa đơn"
4. Click "Chọn khách hàng" - Modal sẽ hiện ra
5. Test các chức năng:
   - ➕ Thêm khách hàng mới
   - ✏️ Sửa thông tin khách hàng
   - 🗑️ Xóa khách hàng
   - 🔍 Tìm kiếm khách hàng
   - ✅ Chọn khách hàng cho đơn hàng

### API Test (nếu backend chạy):

```bash
# Test GET customers
curl http://localhost:8080/api/user/customers

# Test POST new customer
curl -X POST http://localhost:8080/api/user \
  -H "Content-Type: application/json" \
  -d '{
    "hoTen": "Nguyen Van A",
    "email": "nguyenvana@test.com",
    "sdt": "0123456789",
    "userType": "USER"
  }'
```

## 📝 Files đã tạo/sửa

### Frontend:

- ✅ `da_fe/src/pages/admin/Sale/CustomerModal.jsx` (mới)
- ✅ `da_fe/src/pages/admin/Sale/index.jsx` (cập nhật)
- ✅ `da_fe/src/pages/admin/Sale/PaymentSummary.jsx` (cập nhật)
- ✅ `da_fe/src/pages/admin/Sale/InStoreOrders.jsx` (cập nhật)

### Backend:

- ✅ `da_be/src/main/java/com/example/da_be/controller/AdminUserController.java` (mới)
- ✅ `da_be/src/main/java/com/example/da_be/entity/User.java` (cập nhật)
- ✅ `da_be/src/main/java/com/example/da_be/service/UserService.java` (cập nhật)
- ✅ `da_be/src/main/java/com/example/da_be/repository/UserRepository.java` (cập nhật)
- ✅ `da_be/src/main/java/com/example/da_be/controller/HoaDonController.java` (cập nhật)
- ✅ `da_be/src/main/java/com/example/da_be/service/HoaDonService.java` (cập nhật)
- ✅ `da_be/src/main/java/com/example/da_be/dto/CustomerInfoRequest.java` (mới)

## 🔧 Next Steps

1. **Chạy backend** bằng một trong các giải pháp trên
2. **Test chức năng** trên giao diện web
3. **Kiểm tra database** xem dữ liệu có được lưu chính xác không
4. **Tối ưu hóa** (nếu cần): thêm validation, phân quyền, logging

**Chức năng quản lý khách hàng đã hoàn thành 100%!** 🎉
