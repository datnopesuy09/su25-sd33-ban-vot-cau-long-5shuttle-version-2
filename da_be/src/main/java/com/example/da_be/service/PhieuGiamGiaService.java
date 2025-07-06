package com.example.da_be.service;

import com.example.da_be.dto.request.PhieuGiamGiaRequest;
import com.example.da_be.dto.response.PhieuGiamGiaResponse;
import com.example.da_be.entity.PhieuGiamGia;

import java.text.ParseException;
import java.util.List;

public interface PhieuGiamGiaService {
    List<PhieuGiamGiaResponse> getAllPhieuGiamGia();
    List<String> getAllMaPhieuGiamGia();
    List<String> getAllTenPhieuGiamGia();
    PhieuGiamGiaResponse getPhieuGiamGiaById(Integer id);
    Boolean deletePhieuGiamGia(Integer id);
    PhieuGiamGia addPhieuGiamGia(PhieuGiamGiaRequest phieuGiamGiaRequest);
    PhieuGiamGia updatePhieuGiamGia(Integer id, PhieuGiamGiaRequest phieuGiamGiaRequest) throws ParseException;
}
