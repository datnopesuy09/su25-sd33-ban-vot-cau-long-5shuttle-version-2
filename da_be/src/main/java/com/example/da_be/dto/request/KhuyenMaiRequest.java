package com.example.da_be.dto.request;

import com.example.da_be.entity.KhuyenMai;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class KhuyenMaiRequest {

    private String ten;

    private LocalDateTime tgBatDau;

    private LocalDateTime tgKetThuc;

    private Integer trangThai;

    private Integer giaTri;

    private Boolean loai;

    private List<Integer> idProductDetail;

    public KhuyenMai newKhuyenMaiAddSanPham(KhuyenMai khuyenMai) {
        khuyenMai.setTen(this.ten);
        khuyenMai.setTgBatDau(this.tgBatDau);
        khuyenMai.setTgKetThuc(this.tgKetThuc);
        khuyenMai.setGiaTri(this.giaTri);
        khuyenMai.setLoai(this.loai);
        if (LocalDateTime.now().isBefore(this.tgBatDau)) {
            khuyenMai.setTrangThai(0); // Sắp diễn ra
        } else if (LocalDateTime.now().isAfter(this.tgBatDau.minusDays(1)) && LocalDateTime.now().isBefore(this.tgKetThuc.plusDays(1))) {
            khuyenMai.setTrangThai(1); // Đang diễn ra
        } else {
            khuyenMai.setTrangThai(2); // Đã kết thúc
        }
        return khuyenMai;
    }
}