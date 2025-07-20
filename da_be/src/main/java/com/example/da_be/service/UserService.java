package com.example.da_be.service;

import com.example.da_be.dto.request.User.UserCreationRequest;
import com.example.da_be.dto.request.User.UserUpdateRequest;
import com.example.da_be.dto.response.HoaDonCTResponse;
import com.example.da_be.dto.response.HoaDonResponse;
import com.example.da_be.dto.response.UserResponse;
import com.example.da_be.entity.HoaDon;
import com.example.da_be.entity.HoaDonCT;
import com.example.da_be.entity.Role;
import com.example.da_be.entity.User;
import com.example.da_be.enums.LoaiHoaDon;
import com.example.da_be.exception.AppException;
import com.example.da_be.exception.ErrorCode;
import com.example.da_be.mapper.HoaDonChiTietMapper;
import com.example.da_be.mapper.HoaDonMapper;
import com.example.da_be.mapper.UserMapper;
import com.example.da_be.repository.HoaDonCTRepository;
import com.example.da_be.repository.HoaDonRepository;
import com.example.da_be.repository.RoleRepository;
import com.example.da_be.repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Slf4j
@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class UserService {

    UserRepository userRepository;
    UserMapper userMapper;
    PasswordEncoder passwordEncoder;
    RoleRepository roleRepository;
    HoaDonRepository hoaDonRepository;
    HoaDonMapper hoaDonMapper;
    HoaDonCTRepository hoaDonCTRepository;
    HoaDonChiTietMapper hoaDonCTMapper;

    public UserResponse createUser(UserCreationRequest request){
        if(userRepository.existsTaiKhoanByEmail(request.getEmail()))
            throw new AppException(ErrorCode.EMAIL_EXISTS);

        User user = userMapper.toUser(request);

        user.setMatKhau(passwordEncoder.encode(user.getMatKhau()));

        var userRole = roleRepository.findByName("Staff")
                .orElseThrow(() -> new AppException(ErrorCode.ROLENAME_NOT_EXISTS));

        Set<Role> roles = new HashSet<>();
        roles.add(userRole);
        user.setRoles(roles);

        return userMapper.toUserResponse(userRepository.save(user));
    }

    public UserResponse updateUser(UserUpdateRequest request, Integer userId){
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USERID_NOT_EXISTS));

        userMapper.updateUser(user, request);
        userRepository.save(user);


        return userMapper.toUserResponse(user);
    }

    public UserResponse getMyInfo(){
        var context = SecurityContextHolder.getContext();
        var email = context.getAuthentication().getName();

        User user = userRepository.findUserByEmail(email)
                .orElseThrow(() -> new RuntimeException(ErrorCode.EMAIL_NOT_EXISTS.getMessage()));

        return userMapper.toUserResponse(user);
    }

    public List<HoaDonResponse> getMyOders() {
        var context = SecurityContextHolder.getContext();
        var email = context.getAuthentication().getName();

        Integer idUser = userRepository.findIdByEmail(email);

        List<HoaDon> hoaDon = hoaDonRepository.findHoaDonByTaiKhoan_IdAndLoaiHoaDon(idUser, LoaiHoaDon.ONLINE.getName());

        return hoaDon.stream().map(hoaDonMapper::toHoaDonResponse).toList();
    }

    public List<HoaDonCTResponse> getMyOdersDetails(Integer idHoaDon) {

//        var context = SecurityContextHolder.getContext();
//        var email = context.getAuthentication().getName();
//
//        Integer idUser = userRepository.findIdByEmail(email);
//
//        List<HoaDon> hoaDon = hoaDonRepository.findHoaDonByTaiKhoan_IdAndLoaiHoaDon(idUser, LoaiHoaDon.ONLINE.getName());

        List<HoaDonCT> hdct = hoaDonCTRepository.findByHoaDonId(idHoaDon);

        return hdct.stream().map(hoaDonCTMapper::toHoaDonChiTietResponse).toList();
    }
}
