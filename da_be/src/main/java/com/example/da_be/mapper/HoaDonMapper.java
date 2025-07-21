package com.example.da_be.mapper;

import com.example.da_be.dto.response.HoaDonResponse;
import com.example.da_be.entity.HoaDon;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface HoaDonMapper {

    @Mapping(source = "taiKhoan.id", target = "taiKhoanId")
    HoaDonResponse toHoaDonResponse(HoaDon hoaDon);

}
