package com.example.da_be.dto.response;

import com.example.da_be.entity.DiaChi;
import com.example.da_be.enums.UserType;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@FieldDefaults(level = AccessLevel.PRIVATE)
public class KhachHangResponse {
    Integer id;
    String ma;
    String hoTen;
    String sdt;
    String email;
    Integer gioiTinh;
    LocalDate ngaySinh;
    UserType userType;
    Set<DiaChi> diaChi;
    Integer trangThai;
}
