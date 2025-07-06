package com.example.da_be.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

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
    String cccd;
}
