package com.example.da_be.service;

import com.example.da_be.dto.request.User.UserCreationRequest;
import com.example.da_be.dto.request.User.UserUpdateRequest;
import com.example.da_be.dto.response.UserResponse;
import com.example.da_be.entity.Role;
import com.example.da_be.entity.User;
import com.example.da_be.exception.AppException;
import com.example.da_be.exception.ErrorCode;
import com.example.da_be.mapper.UserMapper;
import com.example.da_be.repository.RoleRepository;
import com.example.da_be.repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.mapstruct.MappingTarget;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.HashSet;
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
            String fileName = request.getAvatar().getOriginalFilename();
            user.setAvatar(fileName);
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

    public boolean checkEmailExists(String email) {
        return userRepository.existsByEmail(email);
    }

}
