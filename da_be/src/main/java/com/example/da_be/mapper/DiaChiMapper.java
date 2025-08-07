package com.example.da_be.mapper;

import com.example.da_be.dto.request.DiaChi.DiaChiCreationRequest;
import com.example.da_be.dto.request.DiaChi.DiaChiUpdateRequest;
import com.example.da_be.dto.response.DiaChiResponse;
import com.example.da_be.entity.DiaChi;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface DiaChiMapper {

    @Mapping(source = "tinh", target = "tinh")
    @Mapping(source = "huyen", target = "huyen")
    @Mapping(source = "xa", target = "xa")
    DiaChiResponse toDiaChiResponse(DiaChi diaChi);

    @Mapping(source = "tinh", target = "tinh")
    @Mapping(source = "huyen", target = "huyen")
    @Mapping(source = "xa", target = "xa")
    DiaChi toDiaChi(DiaChiCreationRequest request);

    @Mapping(source = "tinh", target = "tinh")
    @Mapping(source = "huyen", target = "huyen")
    @Mapping(source = "xa", target = "xa")
    @Mapping(target = "loai", ignore = true)
    void updateDiaChi(@MappingTarget DiaChi diaChi, DiaChiUpdateRequest request);
}

