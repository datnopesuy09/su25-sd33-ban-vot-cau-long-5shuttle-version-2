package com.example.da_be.dto.request.DiaChi;

import com.example.da_be.entity.User;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class DiaChiCreationRequest {

    Integer idKhachHang;

    String ten;

    String sdt;

    String tinh;

    String huyen;

    String xa;

    String diaChiCuThe;

    Boolean isMacDinh;
}
