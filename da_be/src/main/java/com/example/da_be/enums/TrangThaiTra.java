package com.example.da_be.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum TrangThaiTra {

    PENDING("pending"), // Đang chờ duyệt
    APPROVED("approved"), // Đã chấp nhận trả
    REJECTED("rejected"), // 	Từ chối yêu cầu trả
    REFUNDED("refunded"); // Đã hoàn tiền

    private final String name;

}
