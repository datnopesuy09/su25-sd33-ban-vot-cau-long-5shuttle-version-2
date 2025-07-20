package com.example.da_be.mapper;

import com.example.da_be.dto.response.HoaDonCTResponse;
import com.example.da_be.entity.HoaDonCT;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface HoaDonChiTietMapper {

    HoaDonCTResponse toHoaDonChiTietResponse(HoaDonCT hoaDonCT);

}
