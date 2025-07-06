package com.example.da_be.dto.response;

import lombok.*;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class KhachHangResponse {
    private Integer id;
    private String ma;
    private String hoTen;
    private String sdt;
    private String email;
    private String matKhau;
    private Integer gioiTinh;
    private String avatar;
    private LocalDate ngaySinh;
    private Integer trangThai;
}
