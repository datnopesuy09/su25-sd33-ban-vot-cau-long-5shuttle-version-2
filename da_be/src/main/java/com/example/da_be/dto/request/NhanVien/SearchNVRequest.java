package com.example.da_be.dto.request.NhanVien;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SearchNVRequest {
    String hoTen;
    String email;
    String sdt;
    Integer gioiTinh;
    Integer trangThai;
}
