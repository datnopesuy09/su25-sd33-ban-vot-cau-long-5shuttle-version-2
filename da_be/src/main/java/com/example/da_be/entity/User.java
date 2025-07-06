package com.example.da_be.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.util.Set;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
@Table(name = "User") // Khớp với tên bảng SQL
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Integer id;

    @Column(name = "Ma") // Ánh xạ đến cột "Ma"
    String ma;

    @Column(name = "HoTen") // Ánh xạ đến cột "HoTen"
    String hoTen;

    @Column(name = "Email") // Ánh xạ đến cột "Email"
    String email;

    @Column(name = "MatKhau") // Ánh xạ đến cột "MatKhau"
    String matKhau;

    @Column(name = "Sdt") // Ánh xạ đến cột "Sdt"
    String sdt;

    @Column(name = "NgaySinh") // Ánh xạ đến cột "NgaySinh"
    LocalDate ngaySinh;

    @Column(name = "GioiTinh") // Ánh xạ đến cột "GioiTinh"
    Integer gioiTinh;

    @Column(name = "Avatar") // Ánh xạ đến cột "Avatar"
    String avatar;

    @Column(name = "CCCD") // Ánh xạ đến cột "CCCD"
    String cccd;

    @Column(name = "TrangThai") // Ánh xạ đến cột "TrangThai"
    Integer trangThai;

    @ManyToMany(fetch = FetchType.EAGER) // Hoặc FetchType.LAZY tùy nhu cầu
    @JoinTable(
            name = "User_Roles",
            joinColumns = @JoinColumn(name = "IdUser"),
            inverseJoinColumns = @JoinColumn(name = "IdRole")
    )
    @JsonIgnore
    Set<Role> roles;
}