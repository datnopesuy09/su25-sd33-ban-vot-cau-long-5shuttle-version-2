package com.example.da_be.dto.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class HoanHangRequest {
    
    @NotNull(message = "Hóa đơn ID không được để trống")
    private Long hoaDonId;
    
    @NotNull(message = "Hóa đơn chi tiết ID không được để trống")
    private Long hoaDonChiTietId;
    
    @NotNull(message = "Số lượng hoàn không được để trống")
    @Positive(message = "Số lượng hoàn phải lớn hơn 0")
    private Integer soLuongHoan;
    
    @NotNull(message = "Đơn giá không được để trống")
    private BigDecimal donGia;
    
    private String lyDoHoan;
    private String ghiChu;
    private String nguoiTao;
}