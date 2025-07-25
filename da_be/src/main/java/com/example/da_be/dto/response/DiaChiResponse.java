package com.example.da_be.dto.response;

import com.example.da_be.entity.User;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class DiaChiResponse {
    Integer id;

    String ten;

    String sdt;

    String idTinh;

    String idHuyen;

    String idXa;

    String diaChiCuThe;

    Integer loai;

    User taiKhoan;
}
