package com.example.da_be.service;

import com.example.da_be.cloudinary.CloudinaryImage;
import com.example.da_be.dto.request.User.UserCreationRequest;
import com.example.da_be.dto.request.User.UserUpdateRequest;
import com.example.da_be.dto.response.HoaDonCTResponse;
import com.example.da_be.dto.response.HoaDonResponse;
import com.example.da_be.dto.response.PhieuTraHangChiTietResponse;
import com.example.da_be.dto.response.UserResponse;
import com.example.da_be.entity.*;
import com.example.da_be.enums.LoaiHoaDon;
import com.example.da_be.exception.AppException;
import com.example.da_be.exception.ErrorCode;
import com.example.da_be.mapper.HoaDonChiTietMapper;
import com.example.da_be.mapper.HoaDonMapper;
import com.example.da_be.mapper.PhieuTraHangChiTietMapper;
import com.example.da_be.mapper.UserMapper;
import com.example.da_be.repository.*;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Date;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Slf4j
@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class
UserService {

    UserRepository userRepository;
    UserMapper userMapper;
    PasswordEncoder passwordEncoder;
    RoleRepository roleRepository;
    HoaDonRepository hoaDonRepository;
    HoaDonMapper hoaDonMapper;
    HoaDonCTRepository hoaDonCTRepository;
    HoaDonChiTietMapper hoaDonCTMapper;
    HinhAnhRepository hinhAnhRepository;
    PhieuTraHangRepository phieuTraHangRepository;
    PhieuTraHangChiTietRepository phieuTraHangChiTietRepository;
    PhieuTraHangChiTietMapper phieuTraHangChiTietMapper;
    CloudinaryImage cloudinaryImage;

    public UserResponse createUser(UserCreationRequest request){
        if(userRepository.existsByEmail(request.getEmail()))
            throw new AppException(ErrorCode.EMAIL_EXISTS);

        User user = userMapper.toUser(request);

        user.setTrangThai(1);

        user.setMatKhau(passwordEncoder.encode(user.getMatKhau()));

        var userRole = roleRepository.findByName("USER")
                .orElseThrow(() -> new AppException(ErrorCode.ROLENAME_NOT_EXISTS));

        Set<Role> roles = new HashSet<>();
        roles.add(userRole);
        user.setRoles(roles);

        // Bước 1: Lưu lần đầu để lấy ID
        user = userRepository.save(user);

        // Bước 2: Sinh mã KH + id định dạng KH00001
        String maKH = String.format("KH%05d", user.getId());
        user.setMa(maKH);

        // Bước 3: Lưu lại lần 2 để cập nhật mã
        user = userRepository.save(user);

        return userMapper.toUserResponse(user);
    }

    public UserResponse updateUser(UserUpdateRequest request, Integer userId){
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USERID_NOT_EXISTS));

        userMapper.updateUser(user, request);

        if (request.getAvatar() != null && !request.getAvatar().isEmpty()) {
            String avatarUrl = cloudinaryImage.uploadAvatar(request.getAvatar());
            if (avatarUrl != null) {
                user.setAvatar(avatarUrl);
            }
        }

        userRepository.save(user);
        return userMapper.toUserResponse(user);
    }

    public UserResponse getMyInfo(){
        var context = SecurityContextHolder.getContext();
        var email = context.getAuthentication().getName();

        User user = userRepository.findUserByEmail(email)
                .orElseThrow(() -> new RuntimeException(ErrorCode.EMAIL_NOT_EXISTS.getMessage()));

        UserResponse response = userMapper.toUserResponse(user);

        // 🧪 Test:
        System.out.println("Mapped ID: " + response.getId());

        return response;
    }

    public User getUserById(Integer id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + id));
    }

    public boolean checkEmailExists(String email) {
        return userRepository.existsByEmail(email);
    }

    public List<HoaDonResponse> getMyOders() {
        var context = SecurityContextHolder.getContext();
        var email = context.getAuthentication().getName();

        Integer idUser = userRepository.findIdByEmail(email);

        List<HoaDon> hoaDon = hoaDonRepository.findHoaDonByTaiKhoan_IdAndLoaiHoaDon(idUser, LoaiHoaDon.TRUC_TUYEN.getName());

        return hoaDon.stream().map(hoaDonMapper::toHoaDonResponse).toList();
    }

    public List<HoaDonCTResponse> getMyOdersDetails(Integer idHoaDon) {

        List<HoaDonCT> hdctList = hoaDonCTRepository.findByHoaDonId(idHoaDon);

        boolean trangThaiTraHang = phieuTraHangRepository.existsByHoaDonId(idHoaDon);

        log.info("Trang thai tra hang: " + trangThaiTraHang);
        return hdctList.stream()
                .map(hdct -> {
                    HoaDonCTResponse response = hoaDonCTMapper.toHoaDonChiTietResponse(hdct);
                    response.setTrangThaiTraHang(trangThaiTraHang); // gán cho từng item
                    return response;
                })
                .toList();
    }

    public HoaDonResponse updateMyOrderStatus(Integer idHoaDon, int newStatus) {
        var context = SecurityContextHolder.getContext();
        String email = context.getAuthentication().getName();

        User user = userRepository.findUserByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.EMAIL_NOT_EXISTS));

        HoaDon hoaDon = hoaDonRepository.findById(idHoaDon)
                .orElseThrow(() -> new AppException(ErrorCode.HOADON_NOT_EXISTS));

        if (!hoaDon.getTaiKhoan().getId().equals(user.getId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        if (newStatus == 7 && hoaDon.getTrangThai() != 1) {
            throw new AppException(ErrorCode.INVALID_ORDER_STATUS);
        }

        hoaDon.setTrangThai(newStatus);
        hoaDon.setNgaySua(new Date());
        hoaDonRepository.save(hoaDon);

        return hoaDonMapper.toHoaDonResponse(hoaDon);
    }

}
