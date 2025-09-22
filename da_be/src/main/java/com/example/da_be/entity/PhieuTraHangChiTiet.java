package com.example.da_be.entity;

import com.example.da_be.enums.TrangThaiTra;
import com.fasterxml.jackson.annotation.JsonBackReference;
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

    @Column(name = "Ma")
    String maPhieuTraHangChiTiet;

    // Khóa ngoại đến PhieuTraHang (IdPhieuTraHang INT NOT NULL)
    @JsonBackReference
    @ManyToOne
    @JoinColumn(name = "IdPhieuTraHang", nullable = false)
    PhieuTraHang phieuTraHang; // Giả sử bạn đã có entity PhieuTraHang

    // Khóa ngoại đến HoaDonCT (IdHoaDonCT INT NOT NULL)
    @ManyToOne
    @JoinColumn(name = "IdHoaDonCT", nullable = false)
    HoaDonCT hoaDonChiTiet; // Giả sử bạn đã có entity HoaDonChiTiet

    @Column(name = "SoLuongTra", nullable = false)
    Integer soLuongTra;

    @Column(name = "SoLuongPheDuyet", nullable = false)
    Integer soLuongPheDuyet;

    @Column(name = "SoLuongNhapKho")
    Integer soLuongNhapKho;

    @Column(name = "SoLuongHong")
    Integer soLuongHong;

    @Column(name = "LyDoTraHang", length = 500)
    String lyDoTraHang;

    @Column(name = "GhiChuNhanVien", length = 255) // Ánh xạ đến cột GhiChu NVARCHAR(500)
    String ghiChuNhanVien;

    // Ánh xạ đến cột TrangThai ENUM
    @Enumerated(EnumType.STRING) // Lưu giá trị enum dưới dạng chuỗi trong cơ sở dữ liệu
    @Column(name = "TrangThai", columnDefinition = "ENUM('PENDING', 'APPROVED', 'REJECTED') DEFAULT 'PENDING'")
    TrangThaiTra trangThai;

}
