package com.example.da_be.dto.request;

import com.example.da_be.entity.PhieuGiamGia;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.text.ParseException;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PhieuGiamGiaRequest {
    private String ma;

    private String ten;

    private Integer giaTri;

    private Integer giaTriMax;

    private Integer kieuGiaTri;

    private Integer soLuong;

    private Integer dieuKienNhoNhat;

    private LocalDateTime ngayBatDau;

    private LocalDateTime ngayKetThuc;

    private Integer trangThai;

    public Integer setDataStatus(LocalDateTime startDate, LocalDateTime endDate, Integer status) {
        LocalDateTime currentDateTime = LocalDateTime.now();
        if (!currentDateTime.isBefore(startDate) && currentDateTime.isBefore(endDate.plusMinutes(1))) {
            return 1;
        } else {
            return status;
        }
    }

    public PhieuGiamGia newPhieuGiamGia(PhieuGiamGia phieuGiamGia) throws ParseException {
        phieuGiamGia.setMa(this.getMa());
        phieuGiamGia.setTen(this.getTen());
        phieuGiamGia.setGiaTri(this.getGiaTri());
        phieuGiamGia.setGiaTriMax(this.getGiaTriMax());
        phieuGiamGia.setKieuGiaTri(this.getKieuGiaTri());
        phieuGiamGia.setSoLuong(this.getSoLuong());
        phieuGiamGia.setDieuKienNhoNhat(this.getDieuKienNhoNhat());
        phieuGiamGia.setNgayBatDau(this.getNgayBatDau());
        phieuGiamGia.setNgayKetThuc(this.getNgayKetThuc());
        phieuGiamGia.setTrangThai(this.setDataStatus(this.getNgayBatDau(), this.getNgayKetThuc(), this.getTrangThai()));
        return phieuGiamGia;
    }
}
