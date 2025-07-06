package com.example.da_be.dto.request.User;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserUpdateRequest {

    Integer id;
    String ma;
    String hoTen;
    String email;
    String matKhau;
    String sdt;
    String avatar;
    String cccd;
}
