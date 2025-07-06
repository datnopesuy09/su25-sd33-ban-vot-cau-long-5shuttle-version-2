package com.example.da_be.configuration;

import com.example.da_be.entity.Role;
import com.example.da_be.entity.User;
// import com.example.da_be.enums.Role; // Xóa bỏ import này
import com.example.da_be.repository.RoleRepository;
import com.example.da_be.repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.HashSet;
import java.util.Optional;
import java.util.Set; // Thêm import này

@Configuration
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class ApplicationInitConfig {

    PasswordEncoder passwordEncoder;
    RoleRepository roleRepository; // Đã được inject

    @Bean
    ApplicationRunner applicationRunner(UserRepository userRepository) {
        return args -> {
            // Kiểm tra nếu người dùng admin chưa tồn tại
            if(!userRepository.existsTaiKhoanByEmail("admin")) {
                // Tìm hoặc tạo vai trò ADMIN
                Optional<Role> adminRoleOpt = roleRepository.findByName("ADMIN");
                Role adminRole;

                if (adminRoleOpt.isEmpty()) {
                    // Nếu vai trò ADMIN chưa tồn tại, tạo mới
                    adminRole = Role.builder().name("ADMIN").description("ADMIN role").build();
                    roleRepository.save(adminRole);
                    log.info("Role 'ADMIN' created.");
                } else {
                    // Nếu đã tồn tại, lấy vai trò đó
                    adminRole = adminRoleOpt.get();
                }

                // Gán vai trò ADMIN cho người dùng
                Set<Role> roles = new HashSet<>();
                roles.add(adminRole);

                // Tạo người dùng admin
                User user = User.builder()
                        .email("admin")
                        .matKhau(passwordEncoder.encode("admin"))
                        .hoTen("Admin User") // Có thể thêm các trường khác nếu cần
                        .roles(roles) // Gán Set<Role> đã chuẩn bị
                        .build();

                userRepository.save(user);
                log.warn("Admin user has been created with default password: admin, please change it!");
            }
        };
    }
}


