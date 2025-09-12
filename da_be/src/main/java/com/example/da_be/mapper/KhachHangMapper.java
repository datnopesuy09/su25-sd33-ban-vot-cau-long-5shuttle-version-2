package com.example.da_be.mapper;

import com.example.da_be.dto.request.KhachHang.KhachHangCreationRequest;
import com.example.da_be.dto.request.KhachHang.KhachHangUpdateRequest;
import com.example.da_be.dto.response.KhachHangResponse;
import com.example.da_be.entity.DiaChi;
import com.example.da_be.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.Named;

import java.util.HashSet;
import java.util.Set;

@Mapper(componentModel = "spring")
public interface KhachHangMapper {

    @Mapping(target = "diaChi", ignore = true)
    User toKhachHang(KhachHangCreationRequest request);

    @Mapping(target = "diaChi", ignore = true)
    void updateKhachHang(@MappingTarget User user, KhachHangUpdateRequest request);

    @Mapping(source = "diaChi", target = "diaChi", qualifiedByName = "getAllAddresses")
    KhachHangResponse toKhachHangResponse(User user);

    // Thêm phương thức này với annotation @Named đúng tên
    @Named("getAllAddresses")
    default Set<DiaChi> getAllAddresses(Set<DiaChi> addresses) {
        if (addresses == null) {
            return new HashSet<>();
        }
        return addresses;
    }

}


