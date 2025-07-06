package com.example.da_be.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SanPhamCTResponse {
    private Integer id;

    private String tenSanPham;

    private String tenThuongHieu;

    private String tenMauSac;

    private String tenChatLieu;

    private String tenTrongLuong;

    private String tenDiemCanBang;

    private String tenDoCung;
}
