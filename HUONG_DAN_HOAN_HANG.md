# Chức Năng Hoàn Hàng - Hướng Dẫn Sử Dụng

## 📋 Tổng Quan
Chức năng hoàn hàng đã được triển khai để cho phép admin hoàn hàng khi đơn hàng đang trong trạng thái "Đang vận chuyển" (status = 3).

## ✅ Những Gì Đã Hoàn Thành

### 1. **Phía Admin (OrderStatus.jsx & ProductList.jsx)**
- ✅ Thay đổi nút từ "Xóa" thành "Hoàn hàng" khi đơn hàng đang vận chuyển
- ✅ Modal hoàn hàng với đầy đủ thông tin sản phẩm, hình ảnh, số lượng hoàn, ghi chú
- ✅ Hiển thị danh sách sản phẩm hoàn hàng với trạng thái và tổng tiền
- ✅ Tự động tính toán lại tổng tiền đơn hàng sau khi hoàn hàng
- ✅ Hiển thị tiền hoàn hàng trong PaymentDetails

### 2. **Phía User (order.jsx & orderDetail.jsx)**
- ✅ Hiển thị lịch sử hoàn hàng trong chi tiết đơn hàng
- ✅ Cập nhật tính toán tổng tiền có tính đến hoàn hàng
- ✅ Trạng thái "Số tiền hoàn lại" cho đơn hàng hoàn hàng

### 3. **API Integration**
- ✅ Tích hợp với API trả hàng hiện tại
- ✅ Fetch lịch sử hoàn hàng từ server
- ✅ Cập nhật thông tin đơn hàng real-time

## 🔧 Cách Sử Dụng

### Phía Admin:
1. Truy cập vào chi tiết đơn hàng có trạng thái "Đang vận chuyển"
2. Trong danh sách sản phẩm, click nút "Hoàn hàng" (icon ↻ màu cam)
3. Điền thông tin trong modal:
   - Số lượng hoàn (tối đa = số lượng đã mua)
   - Ghi chú (tùy chọn)
4. Click "Xác nhận hoàn hàng"
5. Sản phẩm sẽ xuất hiện trong "Danh sách sản phẩm hoàn hàng"
6. Tổng tiền đơn hàng sẽ tự động cập nhật

### Phía User:
1. Truy cập "Tài khoản của tôi" > "Đơn hàng"
2. Click "Xem chi tiết" đơn hàng đã hoàn hàng
3. Xem phần "Lịch sử hoàn hàng" để theo dõi trạng thái
4. Kiểm tra tổng tiền đã trừ đi tiền hoàn hàng

## 🎨 Giao Diện

### Modal Hoàn Hàng:
- Header màu cam với tiêu đề "Hoàn hàng sản phẩm"
- Hiển thị hình ảnh và thông tin chi tiết sản phẩm
- Input số lượng hoàn với validation
- Textarea ghi chú
- Hiển thị số tiền hoàn ngay lập tức

### Danh Sách Hoàn Hàng:
- Background màu cam nhạt
- Card riêng cho mỗi sản phẩm hoàn
- Hiển thị đầy đủ thông tin: tên, màu sắc, trọng lượng, số lượng, đơn giá
- Badge trạng thái "Chờ xử lý"
- Tổng tiền hoàn hàng được tính tự động

## 📊 Luồng Dữ Liệu

```
User Action → Modal Input → API Call → Database Update → UI Update → Real-time Sync
```

## 🔗 File Đã Chỉnh Sửa

### Frontend:
1. `ProductList.jsx` - Thay đổi logic nút và modal hoàn hàng
2. `OrderStatus.jsx` - Thêm state và callback xử lý hoàn hàng  
3. `PaymentDetai.jsx` - Hiển thị tiền hoàn hàng
4. `order.jsx` - Cập nhật hiển thị cho user (đã có sẵn logic)
5. `orderDetail.jsx` - Thêm lịch sử hoàn hàng và tính toán

### API Endpoints Sử Dụng:
- `POST /api/hoa-don-ct/return` - Tạo yêu cầu hoàn hàng
- `GET /api/tra-hang/hoa-don/{hoaDonId}` - Lấy lịch sử hoàn hàng

## ⚠️ Lưu Ý Quan Trọng

1. **Điều Kiện Hoàn Hàng**: Chỉ áp dụng cho đơn hàng trạng thái = 3 (Đang vận chuyển)
2. **Validation**: Số lượng hoàn không được vượt quá số lượng đã mua
3. **API**: Hiện tại sử dụng API trả hàng, có thể cần tạo API riêng cho hoàn hàng
4. **Đồng Bộ**: Thông tin hoàn hàng được đồng bộ real-time giữa admin và user
5. **Tính Toán**: Tổng tiền đơn hàng tự động cập nhật sau hoàn hàng

## 🚀 Các Tính Năng Nâng Cao Có Thể Thêm

1. **Email Notification**: Gửi email thông báo khi hoàn hàng
2. **Workflow Approval**: Quy trình duyệt hoàn hàng nhiều cấp
3. **Bulk Return**: Hoàn nhiều sản phẩm cùng lúc
4. **Return Reason Categories**: Phân loại lý do hoàn hàng
5. **Partial Return**: Hoàn hàng từng phần với theo dõi chi tiết

## 🐛 Debug & Troubleshooting

1. **Nút không đổi**: Kiểm tra `currentOrderStatus === 3`
2. **Modal không hiển thị**: Kiểm tra state `showReturnModal`
3. **Tổng tiền không cập nhật**: Kiểm tra callback `onReturnSuccess`
4. **API error**: Kiểm tra network tab và response từ server
5. **UI không đồng bộ**: Kiểm tra WebSocket connection

---

**Chức năng hoàn hàng đã được triển khai hoàn chỉnh và sẵn sàng sử dụng!** 🎉