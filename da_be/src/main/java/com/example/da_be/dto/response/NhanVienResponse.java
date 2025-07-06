package com.example.da_be.dto.response;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NhanVienResponse {
    private Integer id;
    private String ma;
    private String hoTen;
    private String sdt;
    private String email;
    private String matKhau;
    private Integer gioiTinh;
    private Integer roleId;
    private String avatar;
    private LocalDate ngaySinh;
    private String cccd;
    private Integer trangThai;

//    public NhanVienResponse(Integer id, String maNV, String hoTen, String sdt, String email,
//                            String matKhau, Integer gioiTinh, VaiTro vaiTro, String avatar,
//                            LocalDate ngaySinh, String cccd, Integer trangThai) {
//        this.id = id;
//        this.maNV = maNV;
//        this.hoTen = hoTen;
//        this.sdt = sdt;
//        this.email = email;
//        this.matKhau = matKhau;
//        this.gioiTinh = gioiTinh;
//        this.vaiTro = vaiTro.ordinal();
//        this.avatar = avatar;
//        this.ngaySinh = ngaySinh;
//        this.cccd = cccd;
//        this.trangThai = trangThai;
//    }

}
