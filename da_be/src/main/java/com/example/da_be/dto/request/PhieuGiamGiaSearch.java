package com.example.da_be.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PhieuGiamGiaSearch {
    public String tenSearch;
    public LocalDateTime ngayBatDauSearch;
    public LocalDateTime ngayKetThucSearch;
    public Integer kieuGiaTriSearch;
    public Integer trangThaiSearch;
}