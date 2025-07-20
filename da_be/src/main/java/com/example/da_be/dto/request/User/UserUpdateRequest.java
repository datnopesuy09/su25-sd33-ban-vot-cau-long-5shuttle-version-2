package com.example.da_be.dto.request.User;

import jakarta.persistence.Column;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserUpdateRequest {
    String hoTen;

    String email;

    String matKhau;

    String sdt;

    LocalDate ngaySinh;

    Integer gioiTinh;

    String avatar;

    String cccd;

    Integer trangThai;
}
