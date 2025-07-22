package com.example.da_be.enums;


import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter

public enum HinhThucTra {
    ONLINE("Online"),
    TAI_QUAY("Tại quầy");

    private final String name;

}
