package com.example.da_be.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ThongKeResponse {
    BigDecimal tongTien;
    Integer tongSanPham;
    Integer tongDonThanhCong;
    Integer tongDonHuy;
    Integer tongDonTra;

}
