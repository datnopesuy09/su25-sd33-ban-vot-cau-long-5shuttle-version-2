package com.example.da_be.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserResponse {

    Integer id;
    String ma;
    String hoTen;
    String email;
    String matKhau;
    String sdt;
    String avatar;
    LocalDate ngaySinh;
    Integer gioiTinh;
    String cccd;
    Integer trangThai;
}
