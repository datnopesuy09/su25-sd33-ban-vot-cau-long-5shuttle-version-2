package com.example.da_be.service;

import com.example.da_be.dto.request.DiaChi.DiaChiCreationRequest;
import com.example.da_be.dto.request.DiaChi.DiaChiUpdateRequest;
import com.example.da_be.dto.request.KhachHang.KhachHangCreationRequest;
import com.example.da_be.dto.request.KhachHang.KhachHangUpdateRequest;
import com.example.da_be.dto.response.DiaChiResponse;
import com.example.da_be.dto.response.KhachHangResponse;
import com.example.da_be.entity.DiaChi;
import com.example.da_be.entity.Role;
import com.example.da_be.entity.User;
import com.example.da_be.exception.AppException;
import com.example.da_be.exception.ErrorCode;
import com.example.da_be.mapper.DiaChiMapper;
import com.example.da_be.mapper.KhachHangMapper;
import com.example.da_be.repository.DiaChiRepository;
import com.example.da_be.repository.KhachHangRepository;
import com.example.da_be.repository.RoleRepository;
import com.example.da_be.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
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
    DiaChiRepository diaChiRepository;
    DiaChiMapper diaChiMapper;

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

        khachHang.setTrangThai(1);

        khachHang = khachHangRepository.save(khachHang);

        if(request.getDiaChi() != null ) {
            DiaChi diaChi = request.getDiaChi();

            diaChiRepository.save(diaChi);

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

    public KhachHangResponse getKhachHangById(Integer khachHangId) {
        User user = khachHangRepository.findById(khachHangId)
                .orElseThrow(() -> new AppException(ErrorCode.USERID_NOT_EXISTS));

        return khachHangMapper.toKhachHangResponse(user);
    }

    @Transactional
    public KhachHangResponse updateKhachHang(KhachHangUpdateRequest request, Integer khachHangId) {

        User khachHang = userRepository.findById(khachHangId)
                .orElseThrow(() -> new AppException(ErrorCode.USERID_NOT_EXISTS));

        if (request.getEmail() != null && !request.getEmail().equals(khachHang.getEmail())) {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new AppException(ErrorCode.EMAIL_EXISTS);
            }
            khachHang.setEmail(request.getEmail());
        }

        khachHangMapper.updateKhachHang(khachHang, request);

        User updatedUser = userRepository.save(khachHang);

        return khachHangMapper.toKhachHangResponse(updatedUser);
    }

    public DiaChiResponse createDiaChi(DiaChiCreationRequest request, Integer khachHangId) {
        User khachHang = userRepository.findById(khachHangId)
                .orElseThrow(() -> new AppException(ErrorCode.USERID_NOT_EXISTS)) ;

        DiaChi diaChi = diaChiMapper.toDiaChi(request);
        diaChi.setTaiKhoan(khachHang);

        // Mặc định là địa chỉ thường
        int loai = 0;

        if (Boolean.TRUE.equals(request.getIsMacDinh())) {
            diaChiRepository.findByTaiKhoanAndLoai(khachHang, 1).ifPresent(dc -> {
                dc.setLoai(0);
                diaChiRepository.save(dc);
            });

            loai = 1; // Địa chỉ mới là mặc định
        }

        diaChi.setLoai(loai); // Set loại phù hợp (0 hoặc 1)

        diaChi = diaChiRepository.save(diaChi);

        return diaChiMapper.toDiaChiResponse(diaChi);
    }

    public DiaChiResponse updateCustomerAddress(DiaChiUpdateRequest request, Integer diaChiId, Integer khachHangId) {

        User khachHang = userRepository.findById(khachHangId)
                .orElseThrow(() -> new AppException(ErrorCode.USERID_NOT_EXISTS)) ;

        DiaChi diaChi = diaChiRepository.findByIdAndTaiKhoan(diaChiId, khachHang)
                .orElseThrow(() -> new AppException(ErrorCode.ADDRESS_NOT_FOUND));

        diaChiMapper.updateDiaChi(diaChi, request);

        int loai = 0;

        if (Boolean.TRUE.equals(request.getIsMacDinh())) {
            diaChiRepository.findByTaiKhoanAndLoai(khachHang, 1).ifPresent(dc -> {
                dc.setLoai(0);
                diaChiRepository.save(dc);
            });

            loai = 1; // Địa chỉ mới là mặc định
        }

        diaChi.setLoai(loai); // Set loại phù hợp (0 hoặc 1)

        diaChi = diaChiRepository.save(diaChi);

        return diaChiMapper.toDiaChiResponse(diaChi);
    }


}
