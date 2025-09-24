package com.example.da_be.dto;

import lombok.Data;

@Data
public class CustomerInfoRequest {
    private Integer idUser;
    private String tenNguoiNhan;
    private String sdtNguoiNhan;
    private String emailNguoiNhan;
}