# Logic Hoàn Kho Theo Loại Sự Cố - Đã Cập Nhật

## ✅ HOÀN KHO (Hàng còn nguyên vẹn)
| Loại Sự Cố | Mã | Hành Động | Lý Do |
|-------------|-----|-----------|-------|
| Khách hàng không nhận hàng | `KHONG_NHAN_HANG` | **HOÀN KHO** | Hàng còn nguyên vẹn, có thể bán lại |
| Khách hàng chưa nhận hàng | `CHUA_NHAN_HANG` | **HOÀN KHO** | Hàng còn nguyên vẹn, có thể bán lại |

## ❌ KHÔNG HOÀN KHO (Hàng có vấn đề)
| Loại Sự Cố | Mã | Hành Động | Lý Do |
|-------------|-----|-----------|-------|
| Hàng bị mất/thất lạc | `HANG_BI_MAT` | **GHI NHẬN** | Hàng không còn tồn tại |
| Hàng bị hỏng/vỡ | `HANG_BI_HONG` | **GHI NHẬN** | Hàng không thể bán lại |
| Sự cố vận chuyển khác | `SU_CO_VAN_CHUYEN` | **GHI NHẬN** | Hàng có thể bị ảnh hưởng |
| Sự cố khác | `KHAC` | **GHI NHẬN** | Không rõ tình trạng hàng |

## 🔄 Quy Trình Xử Lý

### Khi click "Không giải quyết được":

1. **Kiểm tra loại sự cố**
2. **Nếu là KHONG_NHAN_HANG hoặc CHUA_NHAN_HANG:**
   - ✅ Gọi `restoreStockOnCancelOrder()` 
   - ✅ Hoàn số lượng về kho
   - ✅ Log: "Đã hoàn kho thành công"

3. **Nếu là các loại khác:**
   - ❌ Gọi `recordDamagedOrLostStock()`
   - ❌ KHÔNG hoàn số lượng về kho
   - 📋 Ghi nhận vào `lich_su_hoan_kho` với trạng thái "RECORDED"
   - 🔔 Tạo thông báo nội bộ cho phòng bảo hiểm

## 🎨 Giao Diện Hiển Thị

### Modal Success:
- **Xanh (🔵)**: Khi hoàn kho thành công (KHONG_NHAN_HANG, CHUA_NHAN_HANG)
- **Cam (🟠)**: Khi không hoàn kho (HANG_BI_MAT, HANG_BI_HONG, SU_CO_VAN_CHUYEN, KHAC)

### Thông Báo:
- ✅ **Hoàn kho**: "📦 Đã hoàn hàng về kho thành công"
- ❌ **Không hoàn kho**: "📋 Đã ghi nhận [loại sự cố] - Không hoàn kho"

## 📊 Database Tracking

Tất cả các trường hợp đều được ghi vào bảng `lich_su_hoan_kho`:
- **Hoàn kho**: `trang_thai = "RESTORED"`
- **Không hoàn kho**: `trang_thai = "RECORDED"`
- **Loại**: Theo enum sự cố (HANG_BI_MAT, HANG_BI_HONG, v.v.)
