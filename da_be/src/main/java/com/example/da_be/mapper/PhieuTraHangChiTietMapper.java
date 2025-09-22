package com.example.da_be.mapper;

import com.example.da_be.dto.response.PhieuTraHangChiTietResponse;
import com.example.da_be.entity.PhieuTraHangChiTiet;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface PhieuTraHangChiTietMapper {

    @Mapping(source = "phieuTraHang.id", target = "phieuTraHangId")
    @Mapping(source = "hoaDonChiTiet.sanPhamCT", target = "thongTinSanPhamTra")
    @Mapping(source = "soLuongNhapKho", target = "soLuongNhapKho")
    @Mapping(source = "soLuongHong", target = "soLuongHong")
    PhieuTraHangChiTietResponse toResponse(PhieuTraHangChiTiet entity);
}

