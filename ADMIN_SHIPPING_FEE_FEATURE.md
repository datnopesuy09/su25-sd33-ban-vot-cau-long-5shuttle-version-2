# Tính năng: Admin nhập tay phí giao hàng

## Mô tả
Tính năng này cho phép admin có thể tùy chỉnh phí giao hàng cho từng đơn hàng thay vì sử dụng giá trị cố định 30,000 VNĐ.

## Thay đổi kỹ thuật

### Backend Changes

1. **UpdateDeliveryInfoRequest.java**
   - Thêm trường `phiShip` (BigDecimal) để nhận phí ship từ frontend
   - Thêm constructor và getter/setter tương ứng

2. **HoaDonService.java**
   - Cập nhật method `updateDeliveryInfo()` để xử lý phí ship
   - Kiểm tra và cập nhật phí ship nếu có trong request

3. **DatHangController.java**
   - Set phí ship mặc định 30,000 VNĐ khi tạo đơn hàng mới

### Frontend Changes

1. **OrderInfor.jsx**
   - Thêm hiển thị phí ship trong thông tin cơ bản của đơn hàng
   - Thêm input field cho phí ship trong modal cập nhật thông tin
   - Cập nhật logic submit để gửi phí ship lên server

2. **OrderStatus.jsx**
   - Sử dụng phí ship từ database thay vì hardcode
   - Cập nhật logic refresh thông tin sau khi cập nhật

### Database

- Sử dụng cột `PhiShip` đã có sẵn trong bảng `HoaDon`
- Chạy migration script để cập nhật phí ship mặc định cho dữ liệu cũ

## Hướng dẫn sử dụng

### Cho Admin

1. **Xem phí giao hàng hiện tại:**
   - Vào trang "Quản lý đơn hàng"
   - Click vào đơn hàng cần xem
   - Phí giao hàng hiển thị trong thông tin cơ bản

2. **Cập nhật phí giao hàng:**
   - Trong trang chi tiết đơn hàng, click nút "Cập nhật" ở phần thông tin giao hàng
   - Nhập phí giao hàng mới (VNĐ)
   - Click "Cập nhật" để lưu

3. **Lưu ý:**
   - Chỉ có thể cập nhật phí ship cho đơn hàng ở trạng thái "Chờ xác nhận" và "Chờ giao hàng"
   - Không thể cập nhật khi đơn hàng đã chuyển sang trạng thái "Đang vận chuyển" trở đi

## Giá trị mặc định

- Đơn hàng mới: 30,000 VNĐ
- Đơn hàng cũ (sau khi chạy migration): 30,000 VNĐ

## API Endpoints

- **PUT** `/api/hoa-don/{id}/delivery-info`
  ```json
  {
    "tenNguoiNhan": "string",
    "sdtNguoiNhan": "string", 
    "diaChiNguoiNhan": "string",
    "phiShip": 30000
  }
  ```

## Validation

- Phí ship phải là số dương
- Phí ship tối thiểu: 0 VNĐ
- Không có giới hạn tối đa (admin có thể set tùy ý)

## Testing

1. Tạo đơn hàng mới → Kiểm tra phí ship mặc định 30,000
2. Cập nhật phí ship → Kiểm tra UI hiển thị giá trị mới
3. Tính tổng tiền → Đảm bảo sử dụng phí ship từ database
4. Kiểm tra các trạng thái đơn hàng khác nhau → Đảm bảo chỉ update được khi phù hợp