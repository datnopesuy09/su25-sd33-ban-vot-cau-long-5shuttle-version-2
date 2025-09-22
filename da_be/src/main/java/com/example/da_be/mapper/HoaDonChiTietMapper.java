package com.example.da_be.mapper;

import com.example.da_be.dto.response.HoaDonCTResponse;
import com.example.da_be.entity.HinhAnh;
import com.example.da_be.entity.HoaDonCT;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface HoaDonChiTietMapper {

    @Mapping(source = "sanPhamCT.hinhAnh", target = "hinhAnhUrl")
    HoaDonCTResponse toHoaDonChiTietResponse(HoaDonCT hoaDonCT);

    // Hàm hỗ trợ map List<HinhAnh> -> String
    default String map(List<HinhAnh> hinhAnhs) {
        if (hinhAnhs == null || hinhAnhs.isEmpty()) {
            return null;
        }
        return hinhAnhs.get(0).getLink();
    }

}
