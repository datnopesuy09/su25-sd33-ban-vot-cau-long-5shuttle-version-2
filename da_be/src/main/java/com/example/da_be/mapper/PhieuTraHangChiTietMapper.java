package com.example.da_be.mapper;

import com.example.da_be.dto.response.PhieuTraHangChiTietResponse;
import com.example.da_be.entity.PhieuTraHangChiTiet;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface PhieuTraHangChiTietMapper {

    @Mapping(source = "phieuTraHang.id", target = "phieuTraHangId")
    @Mapping(source = "hoaDonChiTiet.sanPhamCT", target = "thongTinSanPhamTra")
    PhieuTraHangChiTietResponse toResponse(PhieuTraHangChiTiet entity);
}

