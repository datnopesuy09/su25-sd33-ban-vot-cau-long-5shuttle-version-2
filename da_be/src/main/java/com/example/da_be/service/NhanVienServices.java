package com.example.da_be.service;
import com.example.da_be.dto.request.NhanVien.NVCreationRequest;
import com.example.da_be.dto.request.NhanVien.SearchNVRequest;
import com.example.da_be.dto.response.NhanVienResponse;
import com.example.da_be.email.Email;
import com.example.da_be.entity.Role;
import com.example.da_be.entity.User;
import com.example.da_be.exception.AppException;
import com.example.da_be.exception.ErrorCode;
import com.example.da_be.mapper.UserMapper;
import com.example.da_be.repository.NhanVienRepository;
import com.example.da_be.repository.RoleRepository;
import com.example.da_be.repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class NhanVienServices {
    UserRepository userRepository;
    NhanVienRepository repository;
    RoleRepository roleRepository;
    PasswordEncoder passwordEncoder;
    UserMapper userMapper;

    public List<NhanVienResponse> getAllNhanVien() {
        return repository.getAllNhanVien();
    }

    public NhanVienResponse addNhanVien(NVCreationRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new AppException(ErrorCode.EMAIL_EXISTS);
        }

        // Tạo mới đối tượng User
        User user = new User();
        user.setHoTen(request.getHoTen());
        user.setEmail(request.getEmail());
        user.setMatKhau(passwordEncoder.encode("123456"));
        user.setSdt(request.getSdt());
        user.setNgaySinh(request.getNgaySinh());
        user.setGioiTinh(request.getGioiTinh());
        user.setTrangThai(1); // Mặc định hoạt động
        user.setCccd(request.getCccd());

        if (request.getAvatar() != null && !request.getAvatar().isEmpty()) {
            user.setAvatar(request.getAvatar().getOriginalFilename());
        }

        Role staffRole = roleRepository.findByName("STAFF")
                .orElseThrow(() -> new AppException(ErrorCode.ROLENAME_NOT_EXISTS));

        Set<Role> roles = new HashSet<>();
        roles.add(staffRole);
        user.setRoles(roles);

        // Lưu lần đầu để có ID
        user = userRepository.save(user);

        String maNV = String.format("NV%05d", user.getId());
        user.setMa(maNV);

//        String matKhauPlain = "@" + maNV;
//        user.setMatKhau(passwordEncoder.encode(matKhauPlain));
//
//        sendAccountEmail(request.getEmail(), maNV, matKhauPlain);

        // Lưu lần 2 cập nhật mã và mật khẩu
        user = userRepository.save(user);

        return userMapper.toNhanVienResponse(user);
    }

    @Transactional(readOnly = true)
    public Page<NhanVienResponse> searchNhanVien(SearchNVRequest req, Pageable pageable) {
        return repository.searchNhanVien(
                req.getHoTen(),
                req.getEmail(),
                req.getSdt(),
                req.getGioiTinh(),
                req.getTrangThai(),
                pageable
        );
    }


//    public NhanVienResponse updateNhanVien(Integer id, NhanVienUpdateRequest request) {
//        User user = userRepository.findById(id)
//                .orElseThrow(() -> new AppException(ErrorCode.USERID_NOT_EXISTS));
//
//        userMapper.updateNhanVien(user, request);
//
//        if (request.getAvatar() != null && !request.getAvatar().isEmpty()) {
//            user.setAvatar(request.getAvatar().getOriginalFilename());
//        }
//
//        userRepository.save(user);
//        return userMapper.toNhanVienResponse(user);
//    }

    public void deleteNhanVien(Integer id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USERID_NOT_EXISTS));

        user.setTrangThai(0);
        userRepository.save(user);
    }

//    private void sendAccountEmail(String toEmail, String maNV, String rawPassword) {
//        String[] to = {toEmail};
//        Email email = new Email();
//        email.setToEmail(to);
//        email.setSubject("Tài khoản nhân viên 5Shuttle");
//        email.setTitleEmail("Mật khẩu đăng nhập là:");
//        email.setBody(
//                "<p>Chào bạn <b>" + maNV + "</b>,</p>" +
//                        "<p>Mật khẩu đăng nhập mặc định là:</p>" +
//                        "<h3 style='color: #1976d2;'>@"+ maNV +"</h3>" +
//                        "<p>Vui lòng đổi mật khẩu sau khi đăng nhập để bảo mật tài khoản.</p>"
//        );
//        emailSender.sendEmail(email);
//    }

}
