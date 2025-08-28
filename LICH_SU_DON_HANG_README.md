# Tính Năng Lịch Sử Đơn Hàng

## Mô tả

Tính năng này cho phép lưu lại lịch sử thay đổi trạng thái đơn hàng để theo dõi ai đã thực hiện các thay đổi và lý do thay đổi.

## Các thay đổi đã thực hiện

### Backend

1. **Cập nhật Entity LichSuDonHang**

   - Entity đã có sẵn trường `trangThaiHoaDon` với getter/setter

2. **Cập nhật LichSuDonHangController**

   - Thêm API endpoint mới `/add-status-change` để lưu lịch sử với đầy đủ thông tin

3. **Database Schema**
   - Bảng `LichSuDonHang` đã có cột `TrangThaiHoaDon` trong SQL

### Frontend

1. **Cập nhật OrderStatus.jsx**
   - Import `useAdminAuth` để lấy thông tin nhân viên đang đăng nhập
   - Thêm hàm `saveOrderHistory()` để lưu lịch sử
   - Cập nhật `updateOrderStatus()` để gọi `saveOrderHistory()`
   - Cập nhật `handleActionButtonClick()` để nhận tham số note từ OrderProgress
   - Cập nhật `handleCancelOrder()` để nhận lý do hủy đơn
   - Cập nhật `handleSave()` để lưu thông tin thanh toán

## Cách hoạt động

1. **Khi nhân viên thay đổi trạng thái đơn hàng:**

   - Nhân viên click "Lưu thay đổi" trong OrderProgress
   - Hệ thống tự động lưu:
     - `IdUser`: ID của nhân viên đang đăng nhập (từ admin context)
     - `IdHoaDon`: ID của hóa đơn hiện tại
     - `MoTa`: Ghi chú từ ô text trong OrderProgress
     - `TrangThaiHoaDon`: Tên trạng thái mới (ví dụ: "Chờ xác nhận", "Đã xác nhận", v.v.)
     - `NgayTao`: Thời gian hiện tại

2. **Khi hủy đơn hàng:**

   - Lý do hủy đơn từ modal sẽ được lưu vào `MoTa`
   - `TrangThaiHoaDon` sẽ là "Đã hủy"

3. **Khi thanh toán:**
   - Thông tin phương thức thanh toán và ghi chú sẽ được lưu vào `MoTa`
   - `TrangThaiHoaDon` sẽ là "Đã thanh toán"

## Flow hoạt động

```
OrderProgress (Modal) -> handleConfirmStatusChange()
                      -> handleActionButtonClick(pendingStatus, note)
                      -> updateOrderStatus(newStatus, description)
                      -> saveOrderHistory(newStatus, description)
                      -> API call to /add-status-change
```

## API Endpoints

### Thêm lịch sử đơn hàng khi thay đổi trạng thái

```
POST /api/lich-su-don-hang/add-status-change
Parameters:
- hoaDonId: ID của hóa đơn
- userId: ID của nhân viên
- moTa: Mô tả/ghi chú
- trangThaiHoaDon: Tên trạng thái đơn hàng
- trangThai: Trạng thái record (mặc định = 1)
```

### Lấy lịch sử đơn hàng theo hóa đơn

```
GET /api/lich-su-don-hang/hoa-don/{hoaDonId}
```

## Lưu ý

- Tính năng này chạy trong nền và không ảnh hưởng đến luồng chính của ứng dụng
- Nếu có lỗi khi lưu lịch sử, hệ thống sẽ tiếp tục hoạt động bình thường
- Thông tin nhân viên được lấy từ context authentication hiện tại
- OrderProgress đã sẵn sàng truyền note vào handleActionButtonClick

## Kiểm tra tính năng

1. Đăng nhập với tài khoản admin/staff
2. Vào trang quản lý đơn hàng
3. Thay đổi trạng thái đơn hàng với ghi chú
4. Kiểm tra bảng LichSuDonHang trong database
5. Sử dụng button "Xem lịch sử" để xem các thay đổi
