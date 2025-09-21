package com.example.da_be.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "lich_su_hoan_kho")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LichSuHoanKho {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;
    
    @Column(name = "hoa_don_id", nullable = false)
    private Integer hoaDonId;
    
    @Column(name = "san_pham_ct_id", nullable = false)
    private Integer sanPhamCtId;
    
    @Column(name = "so_luong_hoan", nullable = false)
    private Integer soLuongHoan;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "loai_hoan_kho", nullable = false)
    private LoaiHoanKho loaiHoanKho;
    
    @Column(name = "ly_do", columnDefinition = "TEXT")
    private String lyDo;
    
    @Column(name = "nguoi_thuc_hien", length = 100)
    private String nguoiThucHien;
    
    @Column(name = "thoi_gian", nullable = false)
    private LocalDateTime thoiGian = LocalDateTime.now();
    
    // Enum cho loại hoàn kho
    public enum LoaiHoanKho {
        AUTO,    // Tự động hoàn khi hủy đơn hàng
        MANUAL,  // Thủ công hoàn bởi admin
        FORCE    // Ép buộc hoàn kho
    }
    
    // Constructor tiện ích
    public LichSuHoanKho(Integer hoaDonId, Integer sanPhamCtId, Integer soLuongHoan, 
                        LoaiHoanKho loaiHoanKho, String lyDo, String nguoiThucHien) {
        this.hoaDonId = hoaDonId;
        this.sanPhamCtId = sanPhamCtId;
        this.soLuongHoan = soLuongHoan;
        this.loaiHoanKho = loaiHoanKho;
        this.lyDo = lyDo;
        this.nguoiThucHien = nguoiThucHien;
        this.thoiGian = LocalDateTime.now();
    }
}
