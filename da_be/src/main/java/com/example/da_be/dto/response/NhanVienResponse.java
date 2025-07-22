package com.example.da_be.dto.response;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
public class NhanVienResponse {
    Integer id;
    String ma;
    String hoTen;
    String email;
    String matKhau;
    String sdt;
    LocalDate ngaySinh;
    Integer gioiTinh;
    String avatar;
    String cccd;
    Integer trangThai;

    String role;

    public NhanVienResponse(Integer id, String ma, String hoTen, String email,
                            String matKhau, String sdt, LocalDate ngaySinh,
                            Integer gioiTinh, String avatar, String cccd,
                            Integer trangThai, String role) {
        this.id = id;
        this.ma = ma;
        this.hoTen = hoTen;
        this.email = email;
        this.matKhau = matKhau;
        this.sdt = sdt;
        this.ngaySinh = ngaySinh;
        this.gioiTinh = gioiTinh;
        this.avatar = avatar;
        this.cccd = cccd;
        this.trangThai = trangThai;
        this.role = role;
    }

}
