package com.example.da_be.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)

public class SanPhamTraResponse {

    Integer sanPhamChiTietId;
    String maSanPhamChiTiet;
    String tenSanPham;
    String tenThuongHieu;
    String tenMauSac;
    String tenChatLieu;
    String tenTrongLuong;
    String tenDiemCanBang;
    String tenDoCung;
    Integer soLuongTrongKho;
    Double giaBan;



}
