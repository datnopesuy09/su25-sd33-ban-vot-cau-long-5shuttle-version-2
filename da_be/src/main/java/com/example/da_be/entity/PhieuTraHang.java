package com.example.da_be.entity;


import com.example.da_be.enums.TrangThaiTra;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime; // Sử dụng LocalDateTime cho kiểu DATETIME trong SQL
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
@Table(name = "PhieuTraHang") // Khớp với tên bảng SQL
public class PhieuTraHang {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Integer id;

    // Khóa ngoại đến bảng User (IdUser INT NOT NULL)
    @ManyToOne
    @JoinColumn(name = "IdUser", nullable = false)
    User user;

    // Khóa ngoại đến bảng HoaDon (IdHoaDon INT NOT NULL)
    @ManyToOne
    @JoinColumn(name = "IdHoaDon", nullable = false)
    HoaDon hoaDon; // Giả sử bạn đã có entity HoaDon

    @Column(name = "NgayTao") // Ánh xạ đến cột NgayTao DATETIME
    LocalDateTime ngayTao;

    @Column(name = "NgayXuLy") // Ánh xạ đến cột NgayXuLy DATETIME
    LocalDateTime ngayXuLy;

    // Ánh xạ đến cột HinhThucTra ENUM

    @Column(name = "HinhThucTra")
    String hinhThucTra;


    // Ánh xạ đến cột TrangThai ENUM
    @Enumerated(EnumType.STRING) // Lưu giá trị enum dưới dạng chuỗi trong cơ sở dữ liệu
    @Column(name = "TrangThai", columnDefinition = "ENUM('PENDING', 'APPROVED', 'REJECTED', 'REFUNDED') DEFAULT 'pending'")
    TrangThaiTra trangThai;

    @Column(name = "GhiChu", length = 255) // Ánh xạ đến cột GhiChu NVARCHAR(255)
    String ghiChu;

    // Khóa ngoại đến bảng User cho người xử lý (IdNhanVienXuLy INT NULL)
    @ManyToOne
    @JoinColumn(name = "IdNhanVienXuLy") // nullable mặc định là true
    User nhanVienXuLy; // Giả sử bạn đã có entity User

    @OneToMany(mappedBy = "phieuTraHang", cascade = CascadeType.ALL, orphanRemoval = true)
    List<PhieuTraHangChiTiet> chiTietPhieuTraHang;

}