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
public class SuCoVanChuyenRequest {

    private Integer hoaDonId;

    private SuCoVanChuyen.LoaiSuCo loaiSuCo;

    private String moTa;

    private String diaDiem;

    // Frontend gửi định dạng yyyy-MM-dd'T'HH:mm (không có giây), nên pattern điều chỉnh lại để tránh lỗi 400
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm")
    private LocalDateTime ngayXayRa;

    private Integer nguoiBaoCao;

    private Integer trangThai = 0; // Mặc định là đang xử lý

    private String ghiChu;

    private String hinhAnh;
}
