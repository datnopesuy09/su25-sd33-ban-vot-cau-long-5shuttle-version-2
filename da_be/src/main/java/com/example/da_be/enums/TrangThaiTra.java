package com.example.da_be.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum TrangThaiTra {

    PENDING("PENDING"), // Đang chờ duyệt
    APPROVED("APPROVED"), // Đã chấp nhận trả
    REJECTED("REJECTED"), // 	Từ chối yêu cầu trả
    REFUNDED("REFUNDED"); // Đã hoàn tiền

    private final String name;

}
