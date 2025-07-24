package com.example.da_be.mapper;

import com.example.da_be.dto.request.DiaChi.DiaChiCreationRequest;
import com.example.da_be.dto.request.DiaChi.DiaChiUpdateRequest;
import com.example.da_be.dto.response.DiaChiResponse;
import com.example.da_be.entity.DiaChi;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface DiaChiMapper {

    DiaChi toDiaChi(DiaChiCreationRequest request);

    DiaChiResponse toDiaChiResponse(DiaChi diaChi);

    void updateDiaChi(@MappingTarget DiaChi diaChi, DiaChiUpdateRequest request);
}
