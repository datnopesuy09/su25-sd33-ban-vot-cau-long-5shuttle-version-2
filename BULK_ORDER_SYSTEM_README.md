# 📦 Hệ thống Phát hiện và Quản lý Đơn hàng Số lượng lớn (Bulk Order)

## 🎯 Mục đích

Hệ thống tự động phát hiện khi khách hàng có ý định mua số lượng lớn và chuyển hướng họ làm việc trực tiếp với nhân viên tư vấn để được hỗ trợ tốt nhất.

## 🔧 Các thành phần chính

### 1. **Hook phát hiện Bulk Order** (`useBulkOrderDetection.js`)

- **Chức năng**: Tự động phát hiện các điều kiện bulk order
- **Ngưỡng phát hiện**:
  - Số lượng sản phẩm ≥ 8
  - Giá trị đơn hàng ≥ 3,000,000đ
  - Số thương hiệu khác nhau ≥ 3
  - Có sản phẩm ≥ 800,000đ
  - Tổng số loại sản phẩm ≥ 5

### 2. **Component Modal thông báo** (`BulkOrderDetector.jsx`)

- Hiển thị cảnh báo khi phát hiện bulk order
- Liệt kê lợi ích khi liên hệ nhân viên
- Cung cấp các phương thức liên hệ

### 3. **Component Notification nâng cao** (`BulkOrderNotification.jsx`)

- Modal thông báo với UI đẹp hơn
- Form thu thập thông tin khách hàng
- Các nút liên hệ trực tiếp

### 4. **Trang quản lý Admin** (`BulkOrderManagement.jsx`)

- Dashboard thống kê
- Danh sách yêu cầu bulk order
- Cập nhật trạng thái và phân công nhân viên
- Xuất báo cáo

### 5. **API Service** (`bulkOrderAPI.js`)

- Các hàm gọi API để quản lý bulk orders
- Helper functions tiện ích

## 🚀 Cách sử dụng

### Tích hợp vào trang Giỏ hàng:

```jsx
import BulkOrderDetector from "../../../components/BulkOrderDetector";
import useBulkOrderDetection from "../../../hooks/useBulkOrderDetection";

// Trong component Cart
const { shouldShowBulkWarning, bulkOrderData, resetBulkWarning } =
  useBulkOrderDetection(selectedCartItems, totalPrice);

// Render component
<BulkOrderDetector
  cartItems={selectedCartItems}
  totalQuantity={bulkOrderData.totalQuantity || 0}
  totalValue={totalPrice}
  onContactStaff={handleContactStaff}
  onContinueNormal={handleContinueNormal}
/>;
```

### Tích hợp vào trang Checkout:

```jsx
import BulkOrderNotification from "../../../components/BulkOrderNotification";

<BulkOrderNotification
  show={shouldShowBulkWarning}
  orderData={{
    totalQuantity: bulkOrderData.totalQuantity || 0,
    totalValue: totalPrice,
    itemCount: carts.length,
  }}
  onContactMethod={handleContactMethod}
  onDismiss={resetBulkWarning}
/>;
```

## 🎨 Tùy chỉnh ngưỡng phát hiện

Trong file `useBulkOrderDetection.js`, bạn có thể điều chỉnh:

```javascript
const BULK_THRESHOLDS = {
  QUANTITY: 8, // Số lượng sản phẩm
  VALUE: 3000000, // Giá trị đơn hàng (VND)
  CATEGORIES: 3, // Số thương hiệu khác nhau
  EXPENSIVE_ITEM: 800000, // Giá sản phẩm cao cấp (VND)
  TOTAL_ITEMS: 5, // Tổng số loại sản phẩm
};
```

## 📊 Logic phát hiện Bulk Order

Hệ thống sẽ cảnh báo khi:

- **Có ít nhất 1 điều kiện mức cao** (số lượng lớn HOẶC giá trị cao)
- **2 điều kiện mức trung + ít nhất 3 sản phẩm**
- **Tổng cộng ≥ 3 điều kiện bất kỳ**

## 🎁 Lợi ích cho khách hàng

1. **Tư vấn chuyên sâu**: Nhận tư vấn từ chuyên gia
2. **Giá ưu đãi đặc biệt**: Chiết khấu lên đến 15%
3. **Xử lý ưu tiên**: Đơn hàng được ưu tiên
4. **Hỗ trợ sau bán**: Chăm sóc chuyên biệt

## 📞 Phương thức liên hệ

- **Điện thoại**: Gọi trực tiếp
- **Zalo**: Chat trực tuyến
- **Email**: Gửi yêu cầu tư vấn
- **Đến cửa hàng**: Tư vấn trực tiếp

## 📈 Theo dõi và Phân tích

### Dành cho Admin:

- Dashboard thống kê tổng quan
- Danh sách yêu cầu theo trạng thái
- Lọc theo thời gian, phương thức liên hệ
- Xuất báo cáo Excel
- Phân công nhân viên xử lý

### Các trạng thái:

- **Chờ xử lý**: Yêu cầu mới
- **Đã liên hệ**: Nhân viên đã liên hệ
- **Hoàn thành**: Chốt được đơn hàng
- **Đã hủy**: Khách hàng không quan tâm

## 🔄 Workflow xử lý

1. **Phát hiện**: Hệ thống tự động phát hiện bulk order
2. **Thông báo**: Hiển thị modal cho khách hàng
3. **Lưu trữ**: Lưu thông tin yêu cầu vào database
4. **Phân công**: Admin phân công nhân viên xử lý
5. **Liên hệ**: Nhân viên liên hệ tư vấn khách hàng
6. **Theo dõi**: Cập nhật trạng thái và kết quả

## 🛠️ Cấu hình Backend (Cần implement)

### Database Schema:

```sql
CREATE TABLE bulk_order_inquiries (
    id INT PRIMARY KEY AUTO_INCREMENT,
    customer_name VARCHAR(255),
    customer_phone VARCHAR(20),
    customer_email VARCHAR(255),
    customer_note TEXT,
    total_quantity INT,
    total_value DECIMAL(15,2),
    item_count INT,
    cart_items JSON,
    contact_method VARCHAR(50),
    status ENUM('pending', 'contacted', 'completed', 'cancelled'),
    assigned_staff VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE bulk_order_notes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    inquiry_id INT,
    note_text TEXT,
    staff_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (inquiry_id) REFERENCES bulk_order_inquiries(id)
);
```

### API Endpoints cần tạo:

```
POST   /api/bulk-orders/inquiries           - Tạo yêu cầu mới
GET    /api/bulk-orders/inquiries           - Lấy danh sách
GET    /api/bulk-orders/inquiries/:id       - Chi tiết yêu cầu
PATCH  /api/bulk-orders/inquiries/:id/status - Cập nhật trạng thái
POST   /api/bulk-orders/inquiries/:id/notes  - Thêm ghi chú
GET    /api/bulk-orders/statistics          - Thống kê
GET    /api/bulk-orders/export              - Xuất Excel
```

## 📱 Responsive Design

Tất cả components đều được thiết kế responsive, hoạt động tốt trên:

- Desktop
- Tablet
- Mobile

## 🎨 Customization

### Thay đổi màu sắc theme:

Tìm và thay đổi các class Tailwind CSS trong components:

- `bg-blue-600` → `bg-your-color-600`
- `text-blue-600` → `text-your-color-600`

### Thay đổi nội dung:

Cập nhật text trong các file component hoặc tạo file i18n để đa ngôn ngữ.

## 🔒 Security

- Validate tất cả input từ client
- Sanitize dữ liệu trước khi lưu
- Rate limiting cho API calls
- Log tất cả hoạt động quan trọng

## 📞 Support

Nếu có vấn đề hay cần hỗ trợ, liên hệ team phát triển.

---

**Lưu ý**: Đây là hệ thống hoàn chỉnh giúp tối ưu hóa trải nghiệm khách hàng và tăng tỷ lệ chuyển đổi cho đơn hàng số lượng lớn.
