# Hướng Dẫn Sử Dụng Chức Năng Trả Hàng - Khách Hàng

## Tổng Quan
Chức năng trả hàng cho phép khách hàng tạo yêu cầu trả hàng cho các đơn hàng đã hoàn thành. Hệ thống hiện đã được cập nhật để tính toán chính xác số tiền hoàn trả có xét đến voucher đã áp dụng.

## Cách Truy Cập

### 1. Từ Trang "Tài Khoản Của Tôi"
1. Đăng nhập vào tài khoản
2. Vào mục **"Tài khoản của tôi"**
3. Chọn tab **"Đơn mua"**
4. Có 2 cách để truy cập chức năng trả hàng:

#### Cách 1: Tạo Yêu Cầu Trả Hàng Mới
- Trong danh sách đơn hàng, tìm đơn hàng có trạng thái **"Hoàn thành"** hoặc **"Đã giao hàng"**
- Nhấn nút **"Yêu cầu trả hàng"** 
- Hệ thống sẽ chuyển đến trang tạo phiếu trả hàng

#### Cách 2: Xem Phiếu Trả Hàng Đã Tạo
- Chọn tab **"Phiếu trả hàng"** trong phần "Đơn mua"
- Xem danh sách các phiếu trả hàng đã tạo
- Nhấn **"Xem chi tiết"** để xem thông tin chi tiết

## Quy Trình Tạo Yêu Cầu Trả Hàng

### Bước 1: Chọn Sản Phẩm Cần Trả
1. **Chọn sản phẩm**: Tick vào checkbox của sản phẩm muốn trả
2. **Điều chỉnh số lượng**: Sử dụng nút +/- để chọn số lượng cần trả
3. **Kiểm tra thông tin**: Xem lại tên sản phẩm, giá và số lượng

### Bước 2: Nhập Lý Do Trả Hàng
1. **Chọn lý do**: Từ dropdown, chọn một trong các lý do:
   - Sản phẩm bị lỗi/hỏng
   - Sản phẩm không đúng mô tả
   - Sản phẩm không vừa size
   - Không còn nhu cầu sử dụng
   - Khác (cần nhập mô tả chi tiết)

2. **Mô tả chi tiết** (nếu chọn "Khác"):
   - Nhập mô tả cụ thể lý do trả hàng
   - Tối đa 1000 ký tự

### Bước 3: Kiểm Tra Thông Tin Hoàn Trả

#### 🔹 **Thông Tin Hiển Thị Mới** 
Hệ thống sẽ hiển thị:

1. **Tổng giá trị sản phẩm trả**: Tổng giá gốc các sản phẩm được chọn
2. **Cảnh báo voucher** (nếu có): Thông báo đơn hàng đã áp dụng voucher
3. **Số tiền hoàn trả thực tế**: Số tiền cuối cùng sẽ được hoàn (đã trừ tỷ lệ voucher)

#### 📊 **Chi Tiết Tính Toán** (hiển thị khi có voucher)
- Tổng giá trị sản phẩm trả
- Giảm giá từ voucher (tỷ lệ)  
- Số tiền hoàn trả thực tế

### Bước 4: Xác Nhận Gửi Yêu Cầu
1. Kiểm tra lại tất cả thông tin
2. Nhấn **"Xác nhận trả hàng"**
3. Hệ thống sẽ tạo phiếu trả hàng và gửi thông báo

## Trạng Thái Phiếu Trả Hàng

### 1. **PENDING** (Chờ duyệt) 🟡
- Phiếu trả hàng vừa được tạo
- Đang chờ admin xem xét và phê duyệt
- Khách hàng có thể xem chi tiết nhưng chưa thể thay đổi

### 2. **APPROVED** (Đã duyệt) ✅
- Admin đã phê duyệt yêu cầu trả hàng
- Hiển thị số tiền hoàn trả chính xác
- Quá trình hoàn tiền sẽ được thực hiện

### 3. **REJECTED** (Từ chối) ❌
- Yêu cầu trả hàng bị từ chối
- Xem lý do từ chối trong ghi chú của admin
- Có thể tạo yêu cầu mới nếu cần

## Cách Tính Số Tiền Hoàn Trả

### 🎯 **Quy Tắc Mới** (Đã được cập nhật)

#### Đơn Hàng Không Có Voucher
```
Số tiền hoàn trả = Giá sản phẩm × Số lượng trả
```

#### Đơn Hàng Có Voucher Giảm Theo %
```
Tỷ lệ giảm = Min(Giá trị % × Tổng đơn hàng, Giá trị tối đa) / Tổng đơn hàng
Số tiền hoàn trả = (Giá sản phẩm × Số lượng) × (1 - Tỷ lệ giảm)
```

#### Đơn Hàng Có Voucher Giảm Cố Định
```
Tỷ lệ giảm = Số tiền giảm / Tổng đơn hàng
Số tiền hoàn trả = (Giá sản phẩm × Số lượng) × (1 - Tỷ lệ giảm)
```

### 📝 **Ví Dụ Cụ Thể**

#### Ví dụ 1: Voucher giảm 10%, tối đa 100K
```
Đơn hàng: 1.000.000 VND
Voucher: Giảm 10%, tối đa 100.000 VND
→ Giảm thực tế: 100.000 VND (10% = 100K, áp dụng max)
→ Tỷ lệ giảm: 100.000 / 1.000.000 = 10%

Trả sản phẩm 500.000 VND:
→ Số tiền hoàn trả = 500.000 × (1 - 0.1) = 450.000 VND
```

#### Ví dụ 2: Voucher giảm 50K cố định
```
Đơn hàng: 1.000.000 VND  
Voucher: Giảm 50.000 VND
→ Tỷ lệ giảm: 50.000 / 1.000.000 = 5%

Trả sản phẩm 500.000 VND:
→ Số tiền hoàn trả = 500.000 × (1 - 0.05) = 475.000 VND
```

## Lưu Ý Quan Trọng

### ⚠️ **Điều Kiện Trả Hàng**
1. **Thời gian**: Trong vòng 7-30 ngày kể từ khi nhận hàng (tùy chính sách)
2. **Trạng thái đơn hàng**: Chỉ trả được đơn hàng đã hoàn thành
3. **Tình trạng sản phẩm**: Sản phẩm phải còn nguyên vẹn, chưa sử dụng
4. **Một lần duy nhất**: Mỗi đơn hàng chỉ được tạo 1 phiếu trả hàng

### 💰 **Về Số Tiền Hoàn Trả**
1. **Có voucher**: Số tiền hoàn sẽ được tính theo tỷ lệ (không phải 100% giá gốc)
2. **Phí ship**: Thường không được hoàn trả (trừ trường hợp lỗi từ shop)
3. **Thời gian hoàn tiền**: 3-7 ngày làm việc sau khi được duyệt

### 📱 **Theo Dõi Trạng Thái**
1. **Email thông báo**: Nhận email khi trạng thái thay đổi
2. **Kiểm tra online**: Vào tab "Phiếu trả hàng" để xem trạng thái
3. **Liên hệ hỗ trợ**: Nếu có thắc mắc về quá trình xử lý

## Các Tình Huống Thường Gặp

### ❓ **Tại sao số tiền hoàn trả ít hơn giá gốc?**
- Đơn hàng của bạn đã áp dụng voucher giảm giá
- Số tiền hoàn được tính theo tỷ lệ tương ứng với voucher
- Đây là chính sách công bằng và minh bạch

### ❓ **Tôi có thể trả một phần sản phẩm không?**
- Có, bạn có thể chọn chỉ trả một số sản phẩm trong đơn hàng
- Điều chỉnh số lượng cho từng sản phẩm muốn trả

### ❓ **Làm sao biết phiếu trả hàng đã được duyệt?**
- Kiểm tra email thông báo
- Vào tab "Phiếu trả hàng" xem trạng thái
- Trạng thái "APPROVED" có nghĩa là đã được duyệt

### ❓ **Voucher có được hoàn lại không?**
- Voucher không được hoàn lại
- Số tiền hoàn trả đã được điều chỉnh theo voucher đã sử dụng

## Liên Hệ Hỗ Trợ

Nếu gặp vấn đề hoặc có thắc mắc:
- **Email**: support@5shuttle.com
- **Hotline**: 1900-xxxx
- **Live Chat**: Góc phải màn hình website

---

*Cập nhật lần cuối: Tháng 9, 2025*  
*Phiên bản: 2.0 - Đã cập nhật logic tính toán voucher*