# OrderInfor - Cập nhật Hệ thống Địa chỉ

## Tổng quan thay đổi

Đã cập nhật modal "Cập nhật thông tin giao hàng" trong component OrderInfor để sử dụng API tỉnh thành thay vì input text đơn giản cho địa chỉ.

## Thay đổi chính

### 1. Import và Dependencies

- Thêm `useEffect` và `axios` để gọi API
- Sử dụng API provinces.open-api.vn cho dữ liệu tỉnh thành

### 2. State Management mới

```jsx
// State for address API
const [provinces, setProvinces] = useState([]);
const [districts, setDistricts] = useState([]);
const [wards, setWards] = useState([]);
const [selectedProvince, setSelectedProvince] = useState(null);
const [selectedDistrict, setSelectedDistrict] = useState(null);
const [selectedWard, setSelectedWard] = useState(null);
```

### 3. Form Data Structure

Thay đổi từ:

```jsx
{
    tenNguoiNhan: '',
    sdtNguoiNhan: '',
    diaChiNguoiNhan: '', // Địa chỉ đầy đủ
}
```

Thành:

```jsx
{
    tenNguoiNhan: '',
    sdtNguoiNhan: '',
    diaChiCuThe: '',     // Địa chỉ cụ thể (số nhà, đường)
    tinh: '',            // Tên tỉnh
    huyen: '',           // Tên huyện
    xa: '',              // Tên xã
}
```

### 4. API Functions

- `fetchProvinces()`: Lấy danh sách tỉnh/thành phố
- `fetchDistricts(provinceCode)`: Lấy danh sách quận/huyện theo tỉnh
- `fetchWards(districtCode)`: Lấy danh sách phường/xã theo huyện
- `parseExistingAddress(fullAddress)`: Parse địa chỉ hiện tại và tự động chọn tỉnh/huyện/xã

### 5. Event Handlers mới

- `handleProvinceChange()`: Xử lý khi chọn tỉnh
- `handleDistrictChange()`: Xử lý khi chọn huyện
- `handleWardChange()`: Xử lý khi chọn xã

## UI Components mới

### 1. Dropdown Tỉnh/Thành phố

```jsx
<select value={selectedProvince?.code || ''} onChange={handleProvinceChange}>
    <option value="">Chọn Tỉnh/Thành phố</option>
    {provinces.map((province) => (
        <option key={province.code} value={province.code}>
            {province.name}
        </option>
    ))}
</select>
```

### 2. Dropdown Quận/Huyện

- Disabled khi chưa chọn tỉnh
- Tự động reset khi thay đổi tỉnh

### 3. Dropdown Phường/Xã

- Disabled khi chưa chọn huyện
- Tự động reset khi thay đổi huyện

### 4. Input Địa chỉ cụ thể

- Textarea cho số nhà, tên đường
- Required validation

### 5. Preview địa chỉ đầy đủ

- Hiển thị địa chỉ được ghép từ: "địa chỉ cụ thể, xã, huyện, tỉnh"

## Logic xử lý

### 1. Khi mở Modal

1. Reset tất cả state
2. Parse địa chỉ hiện tại (nếu có)
3. Tự động chọn tỉnh/huyện/xã dựa trên địa chỉ hiện tại

### 2. Khi Submit

1. Ghép địa chỉ đầy đủ từ 4 phần: `${diaChiCuThe}, ${xa}, ${huyen}, ${tinh}`
2. Gửi data với format cũ để tương thích với API backend

## Format địa chỉ

### Input (địa chỉ hiện tại):

```
"Đối diện trường c2, Phường Khắc Niệm, Thành phố Bắc Ninh, Tỉnh Bắc Ninh"
```

### Được parse thành:

- **Địa chỉ cụ thể**: "Đối diện trường c2"
- **Xã**: "Phường Khắc Niệm"
- **Huyện**: "Thành phố Bắc Ninh"
- **Tỉnh**: "Tỉnh Bắc Ninh"

### Output (khi submit):

```
"Đối diện trường c2, Phường Khắc Niệm, Thành phố Bắc Ninh, Tỉnh Bắc Ninh"
```

## Features

### ✅ Implemented

- ✅ API integration với provinces.open-api.vn
- ✅ Cascading dropdowns (Tỉnh → Huyện → Xã)
- ✅ Auto-parse địa chỉ hiện tại
- ✅ Preview địa chỉ đầy đủ
- ✅ Form validation
- ✅ Responsive design
- ✅ Error handling
- ✅ Compatible với API backend hiện tại

### 🎯 User Experience

- **Intuitive**: Dropdown cascading dễ sử dụng
- **Accurate**: Dữ liệu chuẩn từ API chính thức
- **Fast**: Auto-populate từ địa chỉ hiện tại
- **Visual**: Preview địa chỉ đầy đủ trước khi submit

## Technical Notes

### API Endpoints

- **Provinces**: `https://provinces.open-api.vn/api/p/`
- **Districts**: `https://provinces.open-api.vn/api/p/{provinceCode}?depth=2`
- **Wards**: `https://provinces.open-api.vn/api/d/{districtCode}?depth=2`

### Performance Considerations

- API calls chỉ được thực hiện khi cần thiết
- State được reset khi đóng modal để tránh memory leak
- Timeout để đảm bảo provinces được load trước khi parse address

### Backward Compatibility

- Component vẫn nhận và trả về địa chỉ đầy đủ trong format cũ
- API backend không cần thay đổi
- Existing data vẫn compatible

## Testing

### Test Cases

1. **Mở modal với địa chỉ có sẵn**: Kiểm tra auto-populate
2. **Chọn tỉnh mới**: Kiểm tra reset huyện/xã
3. **Chọn huyện mới**: Kiểm tra reset xã
4. **Submit form**: Kiểm tra format địa chỉ output
5. **Validation**: Kiểm tra required fields

### Browser Testing

- ✅ Chrome/Edge (Modern browsers)
- ✅ Responsive design
- ✅ Form validation

## Deployment

Frontend đang chạy tại: http://localhost:5174/

Có thể test ngay tại trang quản lý đơn hàng admin.
