package com.example.da_be.mapper;

import com.example.da_be.dto.response.PhieuTraHangResponse;
import com.example.da_be.entity.PhieuTraHang;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface PhieuTraHangMapper {
    //PhieuTraHang toPhieuTraHang(CreationPhieuTraHangRequest request);

    PhieuTraHangResponse toPhieuTraHangResponse(PhieuTraHang phieuTraHang);
}
