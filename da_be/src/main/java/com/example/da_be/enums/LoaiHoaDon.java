package com.example.da_be.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public enum LoaiHoaDon {
    TRUC_TUYEN("Trực tuyến"),
    TAI_QUAY("Tại quầy");

    private final String name;
}
