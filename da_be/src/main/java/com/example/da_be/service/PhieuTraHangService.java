package com.example.da_be.service;

import com.example.da_be.dto.request.PhieuTraHang.CreationPhieuTraHangOnlineRequest;
import com.example.da_be.dto.request.PhieuTraHang.PhieuTraHangChiTietRequest;
import com.example.da_be.dto.response.PhieuTraHangResponse;
import com.example.da_be.entity.*;
import com.example.da_be.enums.LoaiHoaDon;
import com.example.da_be.enums.TrangThaiTra;
import com.example.da_be.exception.ErrorCode;
import com.example.da_be.mapper.PhieuTraHangMapper;
import com.example.da_be.repository.*;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class PhieuTraHangService {

    PhieuTraHangRepository phieuTraHangRepository;
    PhieuTraHangChiTietRepository phieuTraHangChiTietRepository;
    PhieuTraHangMapper phieuTraHangMapper;
    UserRepository userRepository;
    HoaDonRepository hoaDonRepository;
    HoaDonCTRepository hoaDonCTRepository;

    @Transactional
    public PhieuTraHangResponse createPhieuTraHangOnline(CreationPhieuTraHangOnlineRequest request){
        var context = SecurityContextHolder.getContext();
        var email = context.getAuthentication().getName();

        User user = userRepository.findUserByEmail(email)
                .orElseThrow(() -> new RuntimeException(ErrorCode.EMAIL_NOT_EXISTS.getMessage()));

        HoaDon hoaDon = hoaDonRepository.findById(request.getHoaDonId())
                .orElseThrow(() -> new RuntimeException(ErrorCode.ORDER_NOT_EXISTS.getMessage()));

        PhieuTraHang phieuTraHang = PhieuTraHang.builder()
                .user(user)
                .hoaDon(hoaDon)
                .ngayTao(LocalDateTime.now())
                .hinhThucTra(LoaiHoaDon.TRUC_TUYEN.getName())
                .trangThai(TrangThaiTra.PENDING)
                .ghiChu(request.getGhiChu())
                .build();

        phieuTraHang = phieuTraHangRepository.save(phieuTraHang);

        List<PhieuTraHangChiTiet> chiTietList = new ArrayList<>();
        for (PhieuTraHangChiTietRequest chiTietRequest : request.getChiTietPhieuTraHang()) {
            HoaDonCT hoaDonCT = hoaDonCTRepository.findById(chiTietRequest.getHoaDonChiTietId())
                    .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy chi tiết hóa đơn với ID: " + chiTietRequest.getHoaDonChiTietId()));

            // a. Đảm bảo chi tiết hóa đơn này thuộc về hóa đơn đang được trả
            if (!hoaDonCT.getHoaDon().getId().equals(hoaDon.getId())) {
                throw new RuntimeException("Chi tiết hóa đơn với ID " + chiTietRequest.getHoaDonChiTietId() + " không thuộc về hóa đơn " + hoaDon.getId());
            }

            // b. Đảm bảo số lượng trả không vượt quá số lượng trong hóa đơn gốc
            // (Bạn có thể cần tính toán số lượng đã trả trước đó để tránh trả quá số lượng)
            if (chiTietRequest.getSoLuongTra() > hoaDonCT.getSoLuong()) {
                throw new RuntimeException("Số lượng trả cho sản phẩm " + hoaDonCT.getSanPhamCT().getSanPham().getTen() + " vượt quá số lượng mua ban đầu.");
            }

            PhieuTraHangChiTiet chiTiet = PhieuTraHangChiTiet.builder()
                    .phieuTraHang(phieuTraHang)
                    .hoaDonChiTiet(hoaDonCT)
                    .soLuongTra(chiTietRequest.getSoLuongTra())
                    .ghiChu(chiTietRequest.getGhiChu())
                    .trangThai(TrangThaiTra.PENDING) // Trạng thái ban đầu cho từng sản phẩm là "chờ xử lý"
                    .build();
            chiTietList.add(chiTiet);
        }

        if (!chiTietList.isEmpty()) {
            phieuTraHangChiTietRepository.saveAll(chiTietList);
            phieuTraHang.setChiTietPhieuTraHang(chiTietList); // Set lại danh sách chi tiết cho phiếu trả hàng cha
        }

        return phieuTraHangMapper.toPhieuTraHangResponse(phieuTraHang);

    }


}
