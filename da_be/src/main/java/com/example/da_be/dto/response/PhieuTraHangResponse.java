package com.example.da_be.dto.response;

import com.example.da_be.enums.TrangThaiTra;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PhieuTraHangResponse {
    Integer id; // ID duy nhất của phiếu trả hàng

    Integer userId; // ID của người dùng đã tạo phiếu

    Integer hoaDonId; // ID của hóa đơn liên quan

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss") // Định dạng ngày giờ khi trả về JSON
    LocalDateTime ngayTao; // Thời gian tạo phiếu

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss") // Định dạng ngày giờ khi trả về JSON
    LocalDateTime ngayCapNhat; // Thời gian cập nhật gần nhất

    String hinhThucTra;

    String ghiChu; // Ghi chú chung cho phiếu trả hàng

    TrangThaiTra trangThai; // Trạng thái hiện tại của phiếu (chờ xác nhận, đã hoàn thành...)

    List<PhieuTraHangChiTietResponse> chiTietPhieuTraHang; // Danh sách các chi tiết trả hàng

}
