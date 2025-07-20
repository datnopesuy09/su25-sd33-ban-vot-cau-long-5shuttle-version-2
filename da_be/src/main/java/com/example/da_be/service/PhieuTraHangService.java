package com.example.da_be.service;

import com.example.da_be.dto.request.PhieuTraHang.CreationPhieuTraHangOnlineRequest;
import com.example.da_be.dto.response.PhieuTraHangResponse;
import com.example.da_be.mapper.PhieuTraHangMapper;
import com.example.da_be.repository.HoaDonRepository;
import com.example.da_be.repository.PhieuTraHangRepository;
import com.example.da_be.repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class PhieuTraHangService {

    PhieuTraHangRepository phieuTraHangRepository;
    PhieuTraHangMapper phieuTraHangMapper;
    UserRepository userRepository;
    HoaDonRepository hoaDonRepository;


}
