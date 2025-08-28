package com.example.da_be.service;

import com.example.da_be.dto.request.KhachHang.KhachHangCreationRequest;
import com.example.da_be.dto.response.KhachHangResponse;
import com.example.da_be.entity.DiaChi;
import com.example.da_be.entity.Role;
import com.example.da_be.entity.User;
import com.example.da_be.exception.AppException;
import com.example.da_be.exception.ErrorCode;
import com.example.da_be.mapper.KhachHangMapper;
import com.example.da_be.repository.KhachHangRepository;
import com.example.da_be.repository.RoleRepository;
import com.example.da_be.repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Slf4j
@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class KhachHangService {

    KhachHangRepository khachHangRepository;
    UserRepository userRepository;
    KhachHangMapper khachHangMapper;
    RoleRepository roleRepository;

    public KhachHangResponse createKhachHang(KhachHangCreationRequest request) {
        if(khachHangRepository.existsByEmail(request.getEmail()))
            throw new AppException(ErrorCode.EMAIL_EXISTS);

        User khachHang = khachHangMapper.toKhachHang(request);

        var roleName = roleRepository.findByName("USER")
                .orElseThrow(() -> new AppException(ErrorCode.ROLENAME_NOT_EXISTS));

        Set<Role> roles = new HashSet<>();
        roles.add(roleName);
        khachHang.setRoles(roles);

        khachHang.setUserType(request.getUserType());

        khachHang = khachHangRepository.save(khachHang);

        if(request.getDiaChi() != null ) {
            DiaChi diaChi = request.getDiaChi();

            diaChi.setTaiKhoan(khachHang);

            khachHang = khachHangRepository.save(khachHang);
        }

        String maKH = String.format("KH%05d", khachHang.getId());
        khachHang.setMa(maKH);

        khachHang = khachHangRepository.save(khachHang);

        return khachHangMapper.toKhachHangResponse(khachHang);
    }

    public List<KhachHangResponse> getAllKhachHang() {
        var roleName = roleRepository.findByName("USER")
                .orElseThrow(() -> new AppException(ErrorCode.ROLENAME_NOT_EXISTS));

        Set<Role> roles = new HashSet<>();
        roles.add(roleName);

        List<User> khachHangs = khachHangRepository.findByRoles(roles);
        return khachHangs.stream().map(khachHangMapper::toKhachHangResponse).toList();
    }

//    public KhachHangResponse updateKhachHang(KhachHangCreationRequest request, Integer khachHangId) {
//
//        User khachHang = khachHangRepository.findById(khachHangId)
//                .orElseThrow(() -> new AppException(ErrorCode.USERID_NOT_EXISTS));
//
//        khachHangMapper.toKhachHang(request);
//
//    }
}
