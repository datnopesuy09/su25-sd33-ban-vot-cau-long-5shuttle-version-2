# Hệ Thống Quản Lý Sự Cố Vận Chuyển

## Tổng Quan

Hệ thống quản lý sự cố vận chuyển được thiết kế để giải quyết vấn đề: **"Trong quá trình vận chuyển, phải có cơ chế ghi nhận được những trường hợp khách hàng không/chưa nhận, hàng bị mất/thất lạc/hỏng/có sự cố giữa đường"**

## Tính Năng Chính

### 1. Ghi Nhận Sự Cố

- **Loại sự cố hỗ trợ:**

  - Khách hàng không nhận hàng
  - Khách hàng chưa nhận hàng
  - Hàng bị mất/thất lạc
  - Hàng bị hỏng/vỡ
  - Sự cố vận chuyển khác
  - Sự cố khác

- **Thông tin ghi nhận:**
  - Mô tả chi tiết sự cố
  - Địa điểm xảy ra sự cố
  - Thời gian xảy ra
  - Ghi chú thêm
  - Hình ảnh minh chứng (tối đa 5 ảnh)

### 2. Quản Lý Sự Cố

- **Trạng thái xử lý:**

  - Đang xử lý (0)
  - Đã giải quyết (1)
  - Không thể giải quyết (2)

- **Theo dõi và cập nhật:**
  - Xem danh sách sự cố theo đơn hàng
  - Cập nhật trạng thái xử lý
  - Xem chi tiết sự cố
  - Lịch sử xử lý

### 3. Thông Báo Tự Động

- Gửi thông báo cho khách hàng khi có sự cố
- Cập nhật trạng thái qua WebSocket
- Ghi log vào hệ thống

## Cấu Trúc Hệ Thống

### Backend (Spring Boot)

#### 1. Entity

```java
// SuCoVanChuyen.java
- id: ID sự cố
- hoaDon: Liên kết với hóa đơn
- loaiSuCo: Loại sự cố (enum)
- moTa: Mô tả chi tiết
- diaDiem: Địa điểm xảy ra
- ngayXayRa: Thời gian xảy ra
- nguoiBaoCao: ID admin báo cáo
- trangThai: Trạng thái xử lý
- ghiChu: Ghi chú thêm
- hinhAnh: Danh sách URL ảnh
```

#### 2. API Endpoints

```
POST   /api/su-co-van-chuyen              - Tạo sự cố mới
GET    /api/su-co-van-chuyen/{id}         - Lấy sự cố theo ID
PUT    /api/su-co-van-chuyen/{id}         - Cập nhật sự cố
DELETE /api/su-co-van-chuyen/{id}         - Xóa sự cố
PUT    /api/su-co-van-chuyen/{id}/status  - Cập nhật trạng thái

GET    /api/su-co-van-chuyen/hoa-don/{hoaDonId}  - Lấy sự cố theo đơn hàng
GET    /api/su-co-van-chuyen/status/{status}     - Lấy sự cố theo trạng thái
GET    /api/su-co-van-chuyen/unresolved          - Lấy sự cố chưa giải quyết
GET    /api/su-co-van-chuyen/stats/status        - Thống kê theo trạng thái
GET    /api/su-co-van-chuyen/stats/type          - Thống kê theo loại sự cố
```

### Frontend (React)

#### 1. Components

- **DeliveryIncidentModal**: Modal báo cáo sự cố mới
- **DeliveryIncidentList**: Danh sách sự cố của đơn hàng

#### 2. Tích Hợp trong OrderStatus

- Hiển thị khi đơn hàng ở trạng thái "Đang vận chuyển" (3) hoặc "Đã giao hàng" (4)
- Button "Báo cáo sự cố" để mở modal
- Danh sách sự cố với khả năng cập nhật trạng thái

### Database

#### 1. Bảng Chính

```sql
-- Bảng su_co_van_chuyen
CREATE TABLE su_co_van_chuyen (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    hoa_don_id BIGINT NOT NULL,
    loai_su_co VARCHAR(50) NOT NULL,
    mo_ta TEXT NOT NULL,
    dia_diem VARCHAR(255),
    ngay_xay_ra DATETIME NOT NULL,
    nguoi_bao_cao BIGINT NOT NULL,
    trang_thai INT DEFAULT 0,
    ghi_chu TEXT,
    hinh_anh TEXT,
    ngay_tao DATETIME DEFAULT CURRENT_TIMESTAMP,
    ngay_cap_nhat DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (hoa_don_id) REFERENCES hoa_don(id),
    FOREIGN KEY (nguoi_bao_cao) REFERENCES tai_khoan(id)
);
```

#### 2. Bảng Phụ (Tùy chọn)

```sql
-- Bảng chi_tiet_xu_ly_su_co - Theo dõi quá trình xử lý
CREATE TABLE chi_tiet_xu_ly_su_co (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    su_co_id BIGINT NOT NULL,
    nguoi_xu_ly BIGINT NOT NULL,
    hanh_dong VARCHAR(255) NOT NULL,
    mo_ta TEXT,
    ngay_xu_ly DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (su_co_id) REFERENCES su_co_van_chuyen(id)
);
```

## Hướng Dẫn Sử Dụng

### 1. Báo Cáo Sự Cố Mới

1. Vào trang chi tiết đơn hàng (OrderStatus)
2. Trong phần "Quản lý sự cố vận chuyển", click "Báo cáo sự cố"
3. Chọn loại sự cố phù hợp
4. Điền mô tả chi tiết
5. Thêm địa điểm, thời gian (tùy chọn)
6. Upload ảnh minh chứng (tùy chọn)
7. Click "Ghi nhận sự cố"

### 2. Quản Lý Sự Cố

1. Xem danh sách sự cố trong phần "Quản lý sự cố vận chuyển"
2. Click "Chi tiết" để xem thông tin đầy đủ
3. Sử dụng các button:
   - "Đã giải quyết": Đánh dấu sự cố đã được xử lý
   - "Không giải quyết được": Đánh dấu không thể xử lý

### 3. Theo Dõi và Báo Cáo

- Xem thống kê sự cố qua API `/stats/status` và `/stats/type`
- Lọc sự cố theo trạng thái, loại, thời gian
- Xuất báo cáo sự cố chưa giải quyết

## Lợi Ích

1. **Minh Bạch**: Ghi nhận đầy đủ các sự cố trong vận chuyển
2. **Trách Nhiệm**: Xác định rõ người báo cáo và xử lý
3. **Theo Dõi**: Quản lý trạng thái xử lý từng sự cố
4. **Báo Cáo**: Thống kê và phân tích xu hướng sự cố
5. **Khách Hàng**: Thông báo kịp thời cho khách hàng
6. **Minh Chứng**: Lưu trữ hình ảnh và tài liệu liên quan

## Mở Rộng Tương Lai

1. **Dashboard Analytics**: Biểu đồ thống kê sự cố
2. **Auto Assignment**: Tự động phân công xử lý sự cố
3. **SLA Tracking**: Theo dõi thời gian xử lý sự cố
4. **Integration**: Tích hợp với hệ thống vận chuyển bên thứ 3
5. **Mobile App**: Ứng dụng mobile cho shipper báo cáo sự cố
6. **AI Prediction**: Dự đoán sự cố dựa trên pattern
7. **Customer Portal**: Cho phép khách hàng xem trạng thái xử lý sự cố
