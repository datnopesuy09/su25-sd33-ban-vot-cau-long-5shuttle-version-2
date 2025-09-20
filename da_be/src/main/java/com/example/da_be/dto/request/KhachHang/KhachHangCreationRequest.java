package com.example.da_be.dto.request.KhachHang;


import com.example.da_be.entity.DiaChi;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@AllArgsConstructor
@NoArgsConstructor
@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class KhachHangCreationRequest {

    String hoTen;

    String email;

    String sdt;

    LocalDate ngaySinh;

    Integer gioiTinh;

    DiaChi diaChi;

}
