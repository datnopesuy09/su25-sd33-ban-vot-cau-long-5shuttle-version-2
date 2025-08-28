package com.example.da_be.dto.request.KhachHang;

import com.example.da_be.entity.DiaChi;
import com.example.da_be.enums.UserType;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@AllArgsConstructor
@NoArgsConstructor
@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class KhachHangUpdateRequest {

    String hoTen;

    String email;

    String sdt;

    LocalDate ngaySinh;

    Integer gioiTinh;

    UserType userType;

    DiaChi diaChi;

}
