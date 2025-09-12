package com.example.da_be.dto;

import com.example.da_be.entity.SuCoVanChuyen;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SuCoVanChuyenDTO {

    private Integer id;

    private Integer hoaDonId;

    private String maHoaDon; // Mã hóa đơn để hiển thị

    private SuCoVanChuyen.LoaiSuCo loaiSuCo;

    private String moTa;

    private String diaDiem;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime ngayXayRa;

    private Integer nguoiBaoCao;

    private String tenNguoiBaoCao; // Tên người báo cáo để hiển thị

    private Integer trangThai;

    private String tenTrangThai; // Tên trạng thái để hiển thị

    private String ghiChu;

    private String hinhAnh;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime ngayTao;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime ngayCapNhat;

    // Thông tin khách hàng (từ hóa đơn)
    private String tenNguoiNhan;
    private String soDienThoaiNguoiNhan;
    private String diaChiNguoiNhan;
}
