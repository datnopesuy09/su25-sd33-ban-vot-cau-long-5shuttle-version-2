package com.example.da_be.dto.request;

import com.example.da_be.entity.Role;
import com.example.da_be.entity.User;
import lombok.*;
import org.springframework.web.multipart.MultipartFile;

import java.text.ParseException;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class NhanVienRequest {

    private String hoTen;
    private String email;
    private String matKhau;
    private String sdt;
    private LocalDate ngaySinh;
    private Integer gioiTinh;
    private MultipartFile avatar;
    private Integer roleId = 1;
    private String cccd;
    private Integer trangThai = 0;

    public User tranStaff(User nv, Role role) throws ParseException {
        nv.setHoTen(this.getHoTen());
        nv.setSdt(this.getSdt());
        nv.setEmail(this.getEmail());
        nv.setGioiTinh(this.getGioiTinh());
        nv.setNgaySinh(this.getNgaySinh());
        nv.setCccd(this.getCccd());
        nv.setTrangThai(this.getTrangThai());
        Set<Role> roles = new HashSet<>();
        roles.add(role);
        nv.setRoles(roles);

        return nv;
    }

}