package com.example.da_be.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class KhuyenMaiResponse {
    private Integer id;

    private String ten;

    private LocalDateTime tgBatDau;

    private LocalDateTime tgKetThuc;

    private Integer trangThai;

    private Integer giaTri;

    private Boolean loai;
}
