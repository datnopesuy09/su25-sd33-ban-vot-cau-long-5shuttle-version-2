package com.example.da_be.dto.request.PhieuTraHang;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CreationPhieuTraHangOnlineRequest {


    @NotNull(message = "ID hóa đơn không được để trống")
    Integer hoaDonId;

    @Size(max = 255, message = "Ghi chú không được vượt quá 255 ký tự")
    String ghiChu; // Ghi chú chung cho phiếu trả hàng

    // Danh sách các chi tiết phiếu trả hàng
    @NotNull(message = "Phải có ít nhất một chi tiết trả hàng")
    @Size(min = 1, message = "Phải có ít nhất một chi tiết trả hàng")
    @Valid// Đảm bảo các phần tử trong danh sách cũng được validate
            List<PhieuTraHangChiTietRequest> chiTietPhieuTraHang;

}
