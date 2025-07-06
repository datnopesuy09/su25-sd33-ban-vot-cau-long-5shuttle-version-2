package com.example.da_be.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class KhuyenMaiSearch {
    public String tenSearch;
    public LocalDateTime tgBatDauSearch;
    public LocalDateTime tgKetThucSearch;
    public Integer trangThaiSearch;

}
