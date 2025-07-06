package com.example.da_be.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SanPhamResponse {
    private Integer id;

    private String ma;

    private String ten;

    private int trangthai;
}
