package com.example.da_be.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PhieuGiamGiaResponse {
    private Integer id;

    private String ma;

    private String ten;

    private Integer giaTri;

    private Integer giaTriMax;

    private Integer dieuKienNhoNhat;

    private Integer soLuong;

    private LocalDateTime ngayBatDau;

    private LocalDateTime ngayKetThuc;

    private Integer trangThai;

    private Integer kieuGiaTri;
}