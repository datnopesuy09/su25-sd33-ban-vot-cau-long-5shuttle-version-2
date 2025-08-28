package com.example.da_be.dto.request.KhachHang;


import com.example.da_be.entity.DiaChi;
import com.example.da_be.entity.Role;
import com.example.da_be.entity.User;
import com.example.da_be.enums.UserType;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@AllArgsConstructor
@NoArgsConstructor
@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class KhachHangCreationRequest {

    String hoTen;

    String email;

    String sdt;

    LocalDate ngaySinh;

    Integer gioiTinh;

    UserType userType;

    DiaChi diaChi;

}
