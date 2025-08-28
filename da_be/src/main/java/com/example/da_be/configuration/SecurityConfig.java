package com.example.da_be.configuration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;

import javax.crypto.spec.SecretKeySpec;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final String[] PUBLIC_ENDPOINTS = {
            "/users", "/auth/token", "/auth/introspect"
    };

    @Value("${jwt.signerKey}")
    private String signerKey;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity httpSecurity) throws Exception {
        httpSecurity.authorizeHttpRequests(request ->
                request.anyRequest().permitAll());

//        httpSecurity
//                .oauth2Login(oauth2 -> oauth2
//                        .defaultSuccessUrl("http://localhost:5173/login/success", true)
//                        .failureUrl("http://localhost:5173/login/failure")
//                );

        httpSecurity.oauth2ResourceServer(oauth2 ->
                oauth2.jwt(jwtConfigurer ->
                                jwtConfigurer.decoder(jwtDecoder())
                                        .jwtAuthenticationConverter(jwtAuthenticationConverter()))
                        .authenticationEntryPoint(new JWTAuthenticationEntryPoint())
        );

        httpSecurity.csrf(AbstractHttpConfigurer::disable);

        return httpSecurity.build();
    }

//        @Bean
//        JwtAuthenticationConverter jwtAuthenticationConverter() {
//            JwtGrantedAuthoritiesConverter jwtGrantedAuthoritiesConverter = new JwtGrantedAuthoritiesConverter();
//            jwtGrantedAuthoritiesConverter.setAuthorityPrefix("");
//            JwtAuthenticationConverter jwtAuthenticationConverter = new JwtAuthenticationConverter();
//            jwtAuthenticationConverter.setJwtGrantedAuthoritiesConverter(jwtGrantedAuthoritiesConverter);
//            return jwtAuthenticationConverter;
//        }

    @Bean
    JwtAuthenticationConverter jwtAuthenticationConverter() {
        // Khởi tạo JwtGrantedAuthoritiesConverter
        JwtGrantedAuthoritiesConverter jwtGrantedAuthoritiesConverter = new JwtGrantedAuthoritiesConverter();
        // Đặt prefix cho authority là rỗng, vì bạn đã thêm "ROLE_" ở AuthenticationService rồi.
        jwtGrantedAuthoritiesConverter.setAuthorityPrefix("");
        // Đặt tên claim chứa quyền (authorities). Trong trường hợp của bạn là "scope".
        jwtGrantedAuthoritiesConverter.setAuthoritiesClaimName("scope"); // <--- Dòng đã sửa

        // Khởi tạo JwtAuthenticationConverter
        JwtAuthenticationConverter jwtAuthenticationConverter = new JwtAuthenticationConverter();
        // Gán converter quyền đã cấu hình
        jwtAuthenticationConverter.setJwtGrantedAuthoritiesConverter(jwtGrantedAuthoritiesConverter);
        // Đặt tên claim chứa principal (tên người dùng). Mặc định là "sub".
        // Trong AuthenticationService, bạn đặt user.getEmail() vào subject, nên "sub" là đúng.
        jwtAuthenticationConverter.setPrincipalClaimName("sub"); // <--- Dòng đã sửa

        return jwtAuthenticationConverter;
    }


    @Bean
    JwtDecoder jwtDecoder() {
        SecretKeySpec secretKeySpec = new SecretKeySpec(signerKey.getBytes(), "HS512");
        return NimbusJwtDecoder
                .withSecretKey(secretKeySpec)
                .macAlgorithm(MacAlgorithm.HS512)
                .build();
    }

    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(10);
    }

//    @Bean
//    public AuthenticationSuccessHandler oAuth2SuccessHandler() {
//        return new CustomOAuth2SuccessHandler(); // sẽ viết ở bước 3
//    }
}


