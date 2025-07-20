package com.example.da_be.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PhieuTraHangChiTietResponse {
    Integer id; // ID của chi tiết phiếu trả hàng

    Integer hoaDonChiTietId; // ID của chi tiết hóa đơn gốc

    Integer soLuongTra; // Số lượng sản phẩm đã trả

    String ghiChu;

}
