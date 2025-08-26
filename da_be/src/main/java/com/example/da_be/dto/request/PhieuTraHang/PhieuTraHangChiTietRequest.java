package com.example.da_be.dto.request.PhieuTraHang;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PhieuTraHangChiTietRequest {
    @NotNull(message = "ID chi tiết hóa đơn không được để trống")
    Integer hoaDonChiTietId; // ID của chi tiết hóa đơn gốc (trong bảng HoaDonCT)

    @NotNull(message = "Số lượng trả không được để trống")
    @Min(value = 1, message = "Số lượng trả phải lớn hơn hoặc bằng 1")
    Integer soLuongTra; // Số lượng sản phẩm muốn trả

    @Size(max = 500, message = "Ghi chú chi tiết không được vượt quá 500 ký tự")
    @NotNull(message = "Lý do trả hàng không được bỏ trống")
    String lyDoTraHang; // Ghi chú riêng cho từng mặt hàng trả

}
