// NhanVienServiceImpl.java
package com.example.da_be.service.impl;

import com.example.da_be.cloudinary.CloudinaryImage;
import com.example.da_be.dto.request.NhanVienRequest;
import com.example.da_be.dto.response.NhanVienResponse;
import com.example.da_be.entity.Role;
import com.example.da_be.entity.User;
import com.example.da_be.repository.NhanVienRepository;
import com.example.da_be.repository.RoleRepository;
import com.example.da_be.service.NhanVienService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.text.ParseException;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
public class NhanVienServiceImpl implements NhanVienService {
    @Autowired
    private NhanVienRepository repository;

    @Autowired
    private CloudinaryImage cloudinaryImage;

//    @Autowired
//    private EmailSender emailSender;

    @Autowired
    private RoleRepository roleRepository;

    @Override
    @Transactional
    public User add(NhanVienRequest nhanVienRequest) throws ParseException {
        String setMaNV = "NV" + repository.findAll().size();

        Optional<Role> userRoleOptional = roleRepository.findByName("STAFF");

        Role userRole;
        if (userRoleOptional.isPresent()) {
            userRole = userRoleOptional.get();
        } else {
            throw new RuntimeException("Role 'STAFF' not found in database.");
        }

        Set<Role> roles = new HashSet<>();
        roles.add(userRole);

        User nv = User.builder()
                .ma(setMaNV)
                .hoTen(nhanVienRequest.getHoTen())
                .sdt(nhanVienRequest.getSdt())
                .email(nhanVienRequest.getEmail())
                .ngaySinh(nhanVienRequest.getNgaySinh())
                .gioiTinh(nhanVienRequest.getGioiTinh())
                .cccd(nhanVienRequest.getCccd())
                .trangThai(nhanVienRequest.getTrangThai())
                .build();

        if(nhanVienRequest.getAvatar() != null) {
            nv.setAvatar(cloudinaryImage.uploadAvatar(nhanVienRequest.getAvatar()));
        }

//        String matKhau = generatePassword();
//        String[] toMail = {nhanVienRequest.getEmail()};
//        Email email = new Email();
//        email.setBody("<b style="text-align: center;">" + matKhau + "</b>");
//        email.setToEmail(toMail);
//        email.setSubject("Tạo tài khoản thành công");
//        email.setTitleEmail("Mật khẩu đăng nhập là:");
//        emailSender.sendEmail(email);
//        nv.setMatKhau(matKhau);
        return repository.save(nv);
    }

    @Override
    public List<NhanVienResponse> getAllNhanVien() {
        return repository.getAllNhanVien();
    }

    @Override
    public NhanVienResponse getNhanVienById(Integer id) {
        return repository.findNhanVienById(id);
    }

    @Override
    public User delete(Integer id) {
        User nv = repository.findById(id).orElse(null);
        assert nv != null;
        if (nv.getTrangThai() == 0) {
            nv.setTrangThai(1);
        } else {
            nv.setTrangThai(0);
        }
        return repository.save(nv);
    }

    @Override
    @Transactional
    public Boolean update(NhanVienRequest request, Integer id) throws ParseException {
        Optional<User> optional = repository.findById(id);
        if (optional.isPresent()) {
            Role role = roleRepository.findById(request.getRoleId())
                    .orElseThrow(() -> new RuntimeException("Role not found"));

            User nv = request.tranStaff(optional.get(), role);
            if (request.getAvatar() != null) {
                nv.setAvatar(cloudinaryImage.uploadAvatar(request.getAvatar()));
            }
            repository.save(nv);
            return true;
        } else {
            return false;
        }
    }

    @Override
    public Page<NhanVienResponse> searchNhanVien(
            String ten,
            String email,
            String sdt,
            Integer gioiTinh,
            Integer trangThai,
            Pageable pageable
    ) {
        return repository.searchNhanVien(ten, email, sdt, gioiTinh, trangThai, pageable);
    }

    private String generatePassword() {
        String CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        StringBuilder password = new StringBuilder();
        SecureRandom random = new SecureRandom();
        for (int i = 0; i < 12; i++) {
            int randomIndex = random.nextInt(CHARACTERS.length());
            char randomChar = CHARACTERS.charAt(randomIndex);
            password.append(randomChar);
        }
        return password.toString();
    }
}