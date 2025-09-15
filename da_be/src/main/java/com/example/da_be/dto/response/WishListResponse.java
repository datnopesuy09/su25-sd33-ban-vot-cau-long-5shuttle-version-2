package com.example.da_be.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class WishListResponse {

    Integer userId;
    String userEmail;
    List<SanPhamResponse> sanPhamList;
}
