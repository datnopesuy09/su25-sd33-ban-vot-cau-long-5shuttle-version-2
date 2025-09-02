package com.example.da_be.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "SuCoVanChuyen")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SuCoVanChuyen {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Id")
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "IdHoaDon", nullable = false)
    private HoaDon hoaDon;

    @Enumerated(EnumType.STRING)
    @Column(name = "LoaiSuCo", nullable = false, length = 50)
    private LoaiSuCo loaiSuCo;

    @Column(name = "MoTa", nullable = false, columnDefinition = "TEXT")
    private String moTa;

    @Column(name = "DiaDiem")
    private String diaDiem;

    @Column(name = "NgayXayRa", nullable = false)
    private LocalDateTime ngayXayRa;

    @Column(name = "NguoiBaoCao", nullable = false)
    private Integer nguoiBaoCao;

    @Column(name = "TrangThai", nullable = false)
    private Integer trangThai = 0; // 0: Đang xử lý, 1: Đã giải quyết, 2: Không thể giải quyết

    @Column(name = "GhiChu", columnDefinition = "TEXT")
    private String ghiChu;

    @Column(name = "HinhAnh", columnDefinition = "TEXT")
    private String hinhAnh; // Danh sách URL hình ảnh, phân cách bằng dấu phẩy

    @CreationTimestamp
    @Column(name = "NgayTao")
    private LocalDateTime ngayTao;

    @UpdateTimestamp
    @Column(name = "NgayCapNhat")
    private LocalDateTime ngayCapNhat;

    // Enum cho loại sự cố
    public enum LoaiSuCo {
        KHONG_NHAN_HANG("Khách hàng không nhận hàng"),
        CHUA_NHAN_HANG("Khách hàng chưa nhận hàng"),
        HANG_BI_MAT("Hàng bị mất/thất lạc"),
        HANG_BI_HONG("Hàng bị hỏng/vỡ"),
        SU_CO_VAN_CHUYEN("Sự cố vận chuyển khác"),
        KHAC("Sự cố khác");

        private final String description;

        LoaiSuCo(String description) {
            this.description = description;
        }

        public String getDescription() {
            return description;
        }
    }

    // Enum cho trạng thái xử lý
    public enum TrangThaiXuLy {
        DANG_XU_LY(0, "Đang xử lý"),
        DA_GIAI_QUYET(1, "Đã giải quyết"),
        KHONG_THE_GIAI_QUYET(2, "Không thể giải quyết");

        private final Integer value;
        private final String description;

        TrangThaiXuLy(Integer value, String description) {
            this.value = value;
            this.description = description;
        }

        public Integer getValue() {
            return value;
        }

        public String getDescription() {
            return description;
        }

        public static TrangThaiXuLy fromValue(Integer value) {
            for (TrangThaiXuLy status : TrangThaiXuLy.values()) {
                if (status.getValue().equals(value)) {
                    return status;
                }
            }
            throw new IllegalArgumentException("Không tìm thấy trạng thái với giá trị: " + value);
        }
    }
}
