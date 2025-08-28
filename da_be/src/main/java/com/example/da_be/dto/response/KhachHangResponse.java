package com.example.da_be.dto.response;

import com.example.da_be.enums.UserType;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

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
    Integer trangThai;
}
