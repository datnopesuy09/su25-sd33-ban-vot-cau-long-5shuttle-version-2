package com.example.da_be.entity;

import com.example.da_be.enums.TrangThaiTra;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
@Table(name = "PhieuTraHangCT") // Khớp với tên bảng SQL
public class PhieuTraHangChiTiet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Integer id;

    // Khóa ngoại đến PhieuTraHang (IdPhieuTraHang INT NOT NULL)
    @ManyToOne
    @JoinColumn(name = "IdPhieuTraHang", nullable = false)
    PhieuTraHang phieuTraHang; // Giả sử bạn đã có entity PhieuTraHang

    // Khóa ngoại đến HoaDonCT (IdHoaDonCT INT NOT NULL)
    @ManyToOne
    @JoinColumn(name = "IdHoaDonCT", nullable = false)
    HoaDonCT hoaDonChiTiet; // Giả sử bạn đã có entity HoaDonChiTiet

    @Column(name = "SoLuongTra", nullable = false)
    Integer soLuongTra;

    @Column(name = "GhiChu", length = 500) // Ánh xạ đến cột GhiChu NVARCHAR(500)
    String ghiChu;

    // Ánh xạ đến cột TrangThai ENUM
    @Enumerated(EnumType.STRING) // Lưu giá trị enum dưới dạng chuỗi trong cơ sở dữ liệu
    @Column(name = "TrangThai", columnDefinition = "ENUM('PENDING', 'APPROVED', 'REJECTED') DEFAULT 'PENDING'")
    TrangThaiTra trangThai;

}
