package com.example.da_be.service;

import com.example.da_be.dto.request.DiaChi.DiaChiCreationRequest;
import com.example.da_be.dto.request.DiaChi.DiaChiUpdateRequest;
import com.example.da_be.dto.response.DiaChiResponse;
import com.example.da_be.entity.DiaChi;
import com.example.da_be.entity.User;
import com.example.da_be.exception.ErrorCode;
import com.example.da_be.mapper.DiaChiMapper;
import com.example.da_be.repository.DiaChiRepository;
import com.example.da_be.repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class DiaChiService {

    DiaChiRepository diaChiRepository;
    DiaChiMapper diaChiMapper;
    UserRepository userRepository;

    public List<DiaChiResponse> getAllDiaChi() {
        List<DiaChi> diaChiList = diaChiRepository.findAll();
        return diaChiList.stream()
                .map(diaChiMapper::toDiaChiResponse)
                .toList();
    }


    public List<DiaChiResponse> getDiaChiByUserId(Integer userId) {
    User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found with id: " + userId)); // Thay đổi này
    
    List<DiaChi> diaChiList = diaChiRepository.findByTaiKhoanId(userId); // Thay đổi này
    return diaChiList.stream()
            .map(diaChiMapper::toDiaChiResponse)
            .toList();
}

    private User getCurrentAuthenticatedUser() {
        var context = SecurityContextHolder.getContext();
        var email = context.getAuthentication().getName();
        return userRepository.findUserByEmail(email)
                .orElseThrow(() -> new RuntimeException(ErrorCode.EMAIL_NOT_EXISTS.getMessage()));
    }


//    public DiaChiResponse createDiaChi(DiaChiCreationRequest request) {
//        User user = getCurrentAuthenticatedUser();
//
//        DiaChi diaChi = diaChiMapper.toDiaChi(request);
//
//        diaChi.setTaiKhoan(user);
//
//        diaChi.setLoai(0);
//
//        diaChi = diaChiRepository.save(diaChi);
//
//        return diaChiMapper.toDiaChiResponse(diaChi);
//    }
    public DiaChiResponse createDiaChi(DiaChiCreationRequest request) {
        User user = getCurrentAuthenticatedUser();

        DiaChi diaChi = diaChiMapper.toDiaChi(request);
        diaChi.setTaiKhoan(user);

        // Mặc định là địa chỉ thường
        int loai = 0;

        if (Boolean.TRUE.equals(request.getIsMacDinh())) {
            // Nếu user muốn set làm địa chỉ mặc định
            // Reset tất cả các địa chỉ hiện tại về không mặc định
            diaChiRepository.findByTaiKhoanAndLoai(user, 1).ifPresent(dc -> {
                dc.setLoai(0);
                diaChiRepository.save(dc);
            });

            loai = 1; // Địa chỉ mới là mặc định
        }

        diaChi.setLoai(loai); // Set loại phù hợp (0 hoặc 1)

        diaChi = diaChiRepository.save(diaChi);

        return diaChiMapper.toDiaChiResponse(diaChi);
    }

    public List<DiaChiResponse> getMyDiaChi() {
        var context = SecurityContextHolder.getContext();
        var email = context.getAuthentication().getName();

        List<DiaChi> diaChiList = diaChiRepository.findByTaiKhoan_Email(email);

        return diaChiList.stream().map(diaChiMapper::toDiaChiResponse).toList();
    }

    public DiaChiResponse updateDiaChi(DiaChiUpdateRequest request, Integer idDiaChi) {
        User user = getCurrentAuthenticatedUser();

        DiaChi diaChi = diaChiRepository.findByTaiKhoanAndId(user, idDiaChi);

        diaChi.setTaiKhoan(user);

        diaChiMapper.updateDiaChi(diaChi,request);

        return diaChiMapper.toDiaChiResponse(diaChiRepository.save(diaChi));
    }

    public DiaChiResponse updateLoaiDiaChi(Integer idDiaChi) {
        User user = getCurrentAuthenticatedUser();

        DiaChi diaChi = diaChiRepository.findByIdAndTaiKhoan(idDiaChi, user)
                .orElseThrow(() -> new RuntimeException(ErrorCode.ADDRESS_NOT_FOUND.getMessage())); // Đã đổi ErrorCode để thống nhất

        // Đặt tất cả các địa chỉ mặc định khác của người dùng thành không mặc định
        diaChiRepository.findByTaiKhoanAndLoai(user, 1).stream()
                .filter(otherDiaChi -> !otherDiaChi.getId().equals(diaChi.getId())) // Loại trừ địa chỉ hiện tại
                .forEach(otherDiaChi -> {
                    otherDiaChi.setLoai(0); // Đặt địa chỉ mặc định cũ thành không mặc định
                    diaChiRepository.save(otherDiaChi); // <--- SỬA LỖI Ở ĐÂY: Lưu otherDiaChi
                });

        // Đặt địa chỉ hiện tại thành mặc định
        diaChi.setLoai(1);

        // Chỉ lưu thay đổi cho trường 'Loai', bỏ qua các trường khác trong request vì mục đích chỉ là cập nhật loại
        DiaChi savedDiaChi = diaChiRepository.save(diaChi);

        return diaChiMapper.toDiaChiResponse(savedDiaChi);
    }

    public void deleteDiaChi(Integer idDiaChi) {
        User user = getCurrentAuthenticatedUser();

        DiaChi diaChi = diaChiRepository.findByTaiKhoanAndId(user, idDiaChi);

        diaChiRepository.delete(diaChi);
    }

    public DiaChiResponse getDiaChiMacDinh() {
        User user = getCurrentAuthenticatedUser();

        DiaChi diaChiMacDinh = diaChiRepository.findByTaiKhoanAndLoai(user, 1)
                .orElseThrow(() -> new RuntimeException(ErrorCode.ADDRESS_NOT_FOUND.getMessage()));

        return diaChiMapper.toDiaChiResponse(diaChiMacDinh);
    }









    // Tạo địa chỉ công khai cho user cụ thể (không cần token)
    public DiaChiResponse createDiaChiPublic(DiaChiCreationRequest request, Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        DiaChi diaChi = diaChiMapper.toDiaChi(request);
        diaChi.setTaiKhoan(user);

        // Mặc định là địa chỉ thường
        int loai = 0;

        if (Boolean.TRUE.equals(request.getIsMacDinh())) {
            // Nếu muốn set làm địa chỉ mặc định
            // Reset tất cả các địa chỉ hiện tại về không mặc định
            diaChiRepository.findByTaiKhoanAndLoai(user, 1).ifPresent(dc -> {
                dc.setLoai(0);
                diaChiRepository.save(dc);
            });

            loai = 1; // Địa chỉ mới là mặc định
        }

        diaChi.setLoai(loai);
        diaChi = diaChiRepository.save(diaChi);

        return diaChiMapper.toDiaChiResponse(diaChi);
    }

    // Cập nhật địa chỉ công khai (không cần token)
    public DiaChiResponse updateDiaChiPublic(DiaChiUpdateRequest request, Integer diaChiId) {
        DiaChi diaChi = diaChiRepository.findById(diaChiId)
                .orElseThrow(() -> new RuntimeException("Address not found with id: " + diaChiId));

        // Cập nhật thông tin từ request
        diaChiMapper.updateDiaChi(diaChi, request);

        diaChi = diaChiRepository.save(diaChi);
        return diaChiMapper.toDiaChiResponse(diaChi);
    }

    // Xóa địa chỉ công khai (không cần token)
    public void deleteDiaChiPublic(Integer diaChiId) {
        DiaChi diaChi = diaChiRepository.findById(diaChiId)
                .orElseThrow(() -> new RuntimeException("Address not found with id: " + diaChiId));

        diaChiRepository.delete(diaChi);
    }

    // Set địa chỉ mặc định công khai (không cần token)
    public DiaChiResponse setDefaultAddressPublic(Integer diaChiId, Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        DiaChi diaChi = diaChiRepository.findById(diaChiId)
                .orElseThrow(() -> new RuntimeException("Address not found with id: " + diaChiId));

        // Kiểm tra địa chỉ có thuộc về user này không
        if (!diaChi.getTaiKhoan().getId().equals(userId)) {
            throw new RuntimeException("Address does not belong to this user");
        }

        // Đặt tất cả các địa chỉ mặc định khác của người dùng thành không mặc định
        diaChiRepository.findByTaiKhoanAndLoai(user, 1).stream()
                .filter(otherDiaChi -> !otherDiaChi.getId().equals(diaChi.getId()))
                .forEach(otherDiaChi -> {
                    otherDiaChi.setLoai(0);
                    diaChiRepository.save(otherDiaChi);
                });

        // Đặt địa chỉ hiện tại thành mặc định
        diaChi.setLoai(1);
        DiaChi savedDiaChi = diaChiRepository.save(diaChi);

        return diaChiMapper.toDiaChiResponse(savedDiaChi);
    }

    // Lấy địa chỉ mặc định công khai (không cần token)
    public DiaChiResponse getDefaultAddressPublic(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        DiaChi diaChiMacDinh = diaChiRepository.findByTaiKhoanAndLoai(user, 1)
                .orElseThrow(() -> new RuntimeException("Default address not found for user"));

        return diaChiMapper.toDiaChiResponse(diaChiMacDinh);
    }

    // Lấy chi tiết địa chỉ công khai (không cần token)
    public DiaChiResponse getDiaChiByIdPublic(Integer diaChiId) {
        DiaChi diaChi = diaChiRepository.findById(diaChiId)
                .orElseThrow(() -> new RuntimeException("Address not found with id: " + diaChiId));

        return diaChiMapper.toDiaChiResponse(diaChi);
    }
}
