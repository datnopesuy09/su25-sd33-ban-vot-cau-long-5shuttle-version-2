package com.example.da_be.dto.request.PhieuTraHang;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PhieuTraHangChiTietApprovalDetail {

    Integer phieuTraHangChiTietId;
    Integer hoaDonChiTietId;
    Integer soLuongDuocPheDuyet;
    Integer soLuongNhapKho;
    Integer soLuongHong;
    String lyDoXuLy;

}
