# Sửa lỗi tính giá trong trang Bán hàng tại quầy

## Vấn đề
- Khi bán sản phẩm với số lượng > 1, giá hiển thị và tổng tiền không đúng
- Frontend hiểu nhầm field `giaBan` trong database là tổng tiền (total), thực tế là đơn giá (unit price)

## Nguyên nhân
### 1. Logic sai trong hàm `updateQuantity` (lines 302-308)
```javascript
// SAI - nhân đơn giá với số lượng rồi lưu vào giaBan
giaBan: item.sanPhamCT.donGia * newQuantity
```

### 2. Logic sai trong hàm `resolvePrices` (lines 250-252)
```javascript
// SAI - chia giaBan cho quantity vì tưởng giaBan là total
const savedTotalPrice = Number(item.giaBan);
const unitPrice = savedTotalPrice / qty;
```

## Giải pháp đã triển khai

### 1. Sửa hàm `updateQuantity` trong `index.jsx`
- **Trước**: 
```javascript
return {
    ...item,
    soLuong: newQuantity,
    giaBan: item.sanPhamCT.donGia * newQuantity, // SAI
};
```

- **Sau**:
```javascript
return {
    ...item,
    soLuong: newQuantity,
    // giaBan là đơn giá (unit price), không nhân với số lượng
    // Total sẽ được tính trong component PaymentSummary
};
```

### 2. Sửa hàm `resolvePrices` trong `index.jsx`
- **Trước**:
```javascript
// Cho rằng giaBan là total price
const savedTotalPrice = Number(item.giaBan);
const unitPrice = savedTotalPrice / qty; // SAI
```

- **Sau**:
```javascript
// giaBan là đơn giá, không phải total
const unitPrice = Number(item.giaBan); // ĐÚNG
```

### 3. Thêm debug logs để theo dõi
```javascript
useEffect(() => {
    const newSubtotal = billDetails.reduce((total, orderDetail) => {
        const { unitPrice } = resolvePrices(orderDetail);
        const lineTotal = unitPrice * (orderDetail.soLuong || 0);
        console.log(`Product: ${orderDetail.sanPhamCT?.sanPham?.ten}, UnitPrice: ${unitPrice}, Quantity: ${orderDetail.soLuong}, LineTotal: ${lineTotal}`);
        return total + lineTotal;
    }, 0);
    console.log(`Total Subtotal: ${newSubtotal}`);
    setSubtotal(newSubtotal);
}, [billDetails]);
```

## Xác nhận Backend đã đúng

### Backend đã lưu giaBan đúng cách:
1. **Khi thêm sản phẩm** (`add-to-bill` endpoint):
```java
// Lưu GiaBan LÀ ĐƠN GIÁ, không nhân số lượng
hoaDonCT.setGiaBan(unitPrice);
```

2. **Khi update số lượng** (`updateQuantity` service):
```java
// Lưu lại đơn giá (không nhân số lượng)
hoaDonCT.setGiaBan(unitPrice);
```

## Database Schema
```sql
-- HoaDonCT table
giaBan DECIMAL(15,2) -- Đây là ĐƠN GIÁ (unit price), không phải tổng tiền (total)
soLuong INT         -- Số lượng sản phẩm
-- Total = giaBan * soLuong (tính trong frontend)
```

## Kết quả
- ✅ Tính toán giá đúng cho mọi số lượng
- ✅ Hiển thị đơn giá và tổng tiền chính xác
- ✅ Tương thích với dữ liệu hiện có trong database
- ✅ Frontend build thành công

## Test Cases để kiểm tra
1. Thêm sản phẩm với giá 100,000 VNĐ, số lượng 1 → Tổng: 100,000 VNĐ
2. Thay đổi số lượng thành 3 → Tổng: 300,000 VNĐ
3. Thêm sản phẩm khác với giá khuyến mãi → Dùng giá khuyến mãi
4. Kiểm tra tính tổng tiền cuối cùng với nhiều sản phẩm