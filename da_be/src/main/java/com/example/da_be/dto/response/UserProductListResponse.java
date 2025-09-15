package com.example.da_be.dto.response;

import com.example.da_be.enums.LoaiDanhSach;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserProductListResponse {

    Integer id;

    Integer userId;

    Integer productId;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    LocalDateTime createdAt;

    LoaiDanhSach loaiDanhSach;
}
