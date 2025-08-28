package com.example.da_be.dto.request.PhieuTraHang;

import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PhieuTraHangApprovalRequest {

    Integer phieuTraHangId;

    @NotNull(message = "Hãy điền ghi chú chung")
    String ghiChuNhanVien;

    @NotNull(message = "Phải có nhân viên xử lí")
    Integer nhanVienXuLyId;

    List<PhieuTraHangChiTietApprovalDetail> chiTietPheDuyet;

}
