# Fix Lỗ Hổng Giá và Giảm Giá Trong Chức Năng Trả Hàng

## Tổng Quan
Đã hoàn thành việc sửa các lỗ hổng nghiêm trọng trong logic tính toán giá hoàn trả của hệ thống trả hàng. Trước đây, hệ thống tính toán hoàn trả dựa trên giá gốc mà không xét đến voucher đã áp dụng, gây thiệt hại tài chính cho doanh nghiệp.

## Các Lỗ Hổng Đã Được Sửa

### 1. **Logic Tính Giá Hoàn Trả Không Xét Voucher**
**Vấn đề**: Hệ thống hoàn trả dựa trên giá gốc sản phẩm, không trừ đi phần giảm giá từ voucher.

**Giải pháp**: 
- Thêm logic tính toán tỷ lệ giảm giá theo voucher
- Áp dụng tỷ lệ giảm giá tương ứng cho từng sản phẩm được trả
- Công thức: `Số tiền hoàn trả = Giá gốc × Số lượng - (Giá gốc × Số lượng × Tỷ lệ giảm giá)`

### 2. **Thiếu Validation Voucher Sau Khi Trả Hàng**
**Vấn đề**: Không kiểm tra voucher có còn hợp lệ sau khi trả một phần sản phẩm.

**Giải pháp**:
- Thêm logic kiểm tra điều kiện tối thiểu của voucher
- Cảnh báo khi voucher không còn hợp lệ sau trả hàng

### 3. **Thiếu Thông Tin Chi Tiết Về Giá Hoàn Trả**
**Vấn đề**: Admin không thấy được số tiền thực tế sẽ hoàn trả cho khách hàng.

**Giải pháp**:
- Thêm API endpoint để tính toán và hiển thị số tiền hoàn trả
- Cập nhật UI để hiển thị cả giá gốc và số tiền hoàn trả thực tế

## Chi Tiết Thay Đổi

### Backend Changes

#### 1. Cấu Trúc Database
**File**: `sql/add_refund_calculation_columns.sql`
```sql
-- Thêm các cột mới vào bảng PhieuTraHangCT
ALTER TABLE PhieuTraHangCT 
ADD COLUMN DonGiaGoc DECIMAL(10,2) NULL,
ADD COLUMN SoTienHoanTra DECIMAL(10,2) NULL,
ADD COLUMN TyLeGiamGia DECIMAL(5,4) NULL;
```

#### 2. Entity PhieuTraHangChiTiet
**File**: `entity/PhieuTraHangChiTiet.java`
- Thêm trường `donGiaGoc`: Lưu giá gốc sản phẩm
- Thêm trường `soTienHoanTra`: Số tiền thực tế hoàn trả
- Thêm trường `tyLeGiamGia`: Tỷ lệ giảm giá áp dụng

#### 3. PhieuTraHangService
**File**: `service/PhieuTraHangService.java`

**Các method mới**:
- `calculateRefundAmount()`: Tính số tiền hoàn trả có xét voucher
- `calculateVoucherDiscount()`: Tính số tiền giảm giá từ voucher
- `calculateAndUpdateRefundAmounts()`: Cập nhật số tiền hoàn trả cho từng item
- `validateVoucherAfterReturn()`: Kiểm tra voucher sau khi trả hàng
- `calculateRefundAmountForPhieu()`: Tính số tiền hoàn trả cho phiếu cụ thể

**Logic tính toán**:
```java
// 1. Tính tổng đơn hàng gốc
BigDecimal totalOrderAmount = // Tổng giá × số lượng của tất cả sản phẩm

// 2. Tính giảm giá từ voucher
BigDecimal discountAmount = calculateVoucherDiscount(voucher, totalOrderAmount);

// 3. Tính tỷ lệ giảm giá
BigDecimal discountRatio = discountAmount / totalOrderAmount;

// 4. Áp dụng cho từng item
BigDecimal itemRefund = itemOriginalAmount × (1 - discountRatio);
```

#### 4. PhieuTraHangController  
**File**: `controller/PhieuTraHangController.java`
- Thêm endpoint `GET /{id}/calculate-refund`: Tính toán số tiền hoàn trả

### Frontend Changes

#### 1. ReturnOrders.jsx
**File**: `pages/admin/Order/ReturnOrders.jsx`

**Thêm state**:
- `refundAmount`: Lưu số tiền hoàn trả
- `isCalculatingRefund`: Trạng thái tính toán

**Thêm function**:
- `calculateRefundAmount()`: Gọi API tính toán refund
- Cập nhật `handleViewDetail()`: Auto calculate khi mở modal

**UI Updates**:
- Hiển thị "Tổng giá trị gốc" và "Số tiền hoàn trả (đã trừ voucher)"
- Thêm loading indicator khi tính toán
- Phân biệt rõ ràng giá gốc và giá hoàn trả thực tế

## Các Trường Hợp Xử Lý

### 1. Voucher Giảm Theo Phần Trăm
```
Đơn hàng: 1,000,000 VND
Voucher: Giảm 10%, tối đa 100,000 VND
Giảm giá thực tế: 100,000 VND (10% = 100,000, áp dụng max)
Tỷ lệ giảm: 100,000 / 1,000,000 = 0.1 (10%)

Trả 1 sản phẩm 500,000 VND:
- Giá gốc: 500,000 VND  
- Giảm giá tương ứng: 500,000 × 0.1 = 50,000 VND
- Số tiền hoàn trả: 500,000 - 50,000 = 450,000 VND
```

### 2. Voucher Giảm Số Tiền Cố Định
```
Đơn hàng: 1,000,000 VND
Voucher: Giảm 50,000 VND
Tỷ lệ giảm: 50,000 / 1,000,000 = 0.05 (5%)

Trả 1 sản phẩm 500,000 VND:
- Giá gốc: 500,000 VND
- Giảm giá tương ứng: 500,000 × 0.05 = 25,000 VND  
- Số tiền hoàn trả: 500,000 - 25,000 = 475,000 VND
```

### 3. Không Có Voucher
```
Đơn hàng: 1,000,000 VND
Không có voucher
Tỷ lệ giảm: 0%

Trả 1 sản phẩm 500,000 VND:
- Số tiền hoàn trả: 500,000 VND (100% giá gốc)
```

## Testing & Validation

### 1. Database Testing
**File**: `sql/test_refund_calculation.sql`
- Tạo test cases với các scenario voucher khác nhau
- Validate cấu trúc database và constraints
- Kiểm tra data integrity

### 2. Manual Testing Scenarios
1. **Test không voucher**: Hoàn trả = giá gốc
2. **Test voucher %**: Hoàn trả = giá gốc - tỷ lệ % tương ứng  
3. **Test voucher cố định**: Hoàn trả = giá gốc - tỷ lệ tương ứng
4. **Test voucher với giới hạn max**: Áp dụng đúng giới hạn
5. **Test trả một phần**: Tính đúng tỷ lệ cho phần được trả
6. **Test validation voucher**: Cảnh báo khi voucher không hợp lệ

## Migration Instructions

### 1. Database Migration
```bash
# 1. Backup database
mysqldump -u username -p 5shuttle > backup_before_refund_fix.sql

# 2. Apply migration
mysql -u username -p 5shuttle < sql/add_refund_calculation_columns.sql

# 3. Run test script (optional)
mysql -u username -p 5shuttle < sql/test_refund_calculation.sql
```

### 2. Application Deployment
```bash
# 1. Backend
cd da_be
mvn clean package
# Deploy da_be-0.0.1-SNAPSHOT.jar

# 2. Frontend  
cd da_fe
npm run build
# Deploy dist folder
```

## Security Improvements

### 1. Validation Enhancements
- Thêm ràng buộc database cho số tiền hoàn trả >= 0
- Validation tỷ lệ giảm giá hợp lệ (0-1)
- Kiểm tra điều kiện voucher trước khi áp dụng

### 2. Business Logic Protection
- Ngăn chặn hoàn trả quá số tiền đã thanh toán
- Kiểm tra voucher hợp lệ theo thời gian và điều kiện
- Log chi tiết các thao tác tính toán để audit

## Performance Considerations

### 1. Database Indexing
```sql
CREATE INDEX idx_phieu_tra_hang_ct_don_gia ON PhieuTraHangCT(DonGiaGoc);
CREATE INDEX idx_phieu_tra_hang_ct_so_tien_hoan_tra ON PhieuTraHangCT(SoTienHoanTra);
```

### 2. Caching Strategy
- Cache voucher information để tránh query repeated
- Minimize API calls khi tính toán refund amount

## Monitoring & Alerts

### 1. Business Metrics
- Track tổng số tiền hoàn trả hàng ngày/tháng
- Monitor tỷ lệ đơn hàng có voucher bị trả
- Alert khi số tiền hoàn trả bất thường

### 2. Technical Metrics  
- Log errors trong quá trình tính toán refund
- Monitor API response time cho calculate-refund endpoint
- Track database performance sau khi thêm cột mới

## Conclusion

Việc fix này đã:
1. ✅ **Khắc phục lỗ hổng tài chính nghiêm trọng** - không còn hoàn trả sai số tiền
2. ✅ **Cải thiện trải nghiệm admin** - hiển thị rõ ràng số tiền hoàn trả thực tế  
3. ✅ **Tăng tính minh bạch** - phân biệt giá gốc và giá hoàn trả
4. ✅ **Đảm bảo tính toàn vẹn dữ liệu** - validation và constraints đầy đủ
5. ✅ **Hỗ trợ audit và compliance** - log chi tiết quá trình tính toán

**Impact ước tính**: Giảm thiệt hại tài chính từ hoàn trả sai có thể lên đến hàng triệu VND mỗi tháng, tùy thuộc vào volume đơn hàng và tỷ lệ sử dụng voucher.