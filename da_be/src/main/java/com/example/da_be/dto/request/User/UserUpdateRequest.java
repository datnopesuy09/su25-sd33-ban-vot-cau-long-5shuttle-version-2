package com.example.da_be.dto.request.User;

import jakarta.persistence.Column;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;

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
    String sdt;
    MultipartFile avatar;
    LocalDate ngaySinh;
    Integer gioiTinh;
}
