package com.example.da_be.dto.request.UserProductList;

import com.example.da_be.enums.LoaiDanhSach;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserProductListCreationRequest {

    Integer idSanPham;

}
