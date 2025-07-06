package com.example.da_be.service.impl;

import com.example.da_be.dto.request.PhieuGiamGiaRequest;
import com.example.da_be.dto.response.PhieuGiamGiaResponse;
import com.example.da_be.entity.PhieuGiamGia;
import com.example.da_be.repository.PhieuGiamGiaRepository;
import com.example.da_be.service.PhieuGiamGiaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.text.ParseException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class PhieuGiamGiaServiceImpl implements PhieuGiamGiaService {
    @Autowired
    private PhieuGiamGiaRepository phieuGiamGiaRepository;

    @Override
    public List<PhieuGiamGiaResponse> getAllPhieuGiamGia() {
        return phieuGiamGiaRepository.getAllPhieuGiamGia();
    }

    @Override
    public PhieuGiamGia addPhieuGiamGia(PhieuGiamGiaRequest phieuGiamGiaRequest) {
        try {
            PhieuGiamGia phieuGiamGia = phieuGiamGiaRequest.newPhieuGiamGia(new PhieuGiamGia());
            phieuGiamGiaRepository.save(phieuGiamGia);
            return phieuGiamGia;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    @Override
    public Boolean deletePhieuGiamGia(Integer id) {
        LocalDateTime currentDateTime = LocalDateTime.now();

        Optional<PhieuGiamGia> optionalPhieuGiamGia = phieuGiamGiaRepository.findById(id);

        if (optionalPhieuGiamGia.isPresent()) {
            PhieuGiamGia phieuGiamGia = optionalPhieuGiamGia.get();
            phieuGiamGia.setNgayKetThuc(currentDateTime);
            phieuGiamGia.setTrangThai(2);
            phieuGiamGiaRepository.save(phieuGiamGia);
            return true;
        } else {
            return false;
        }
    }

    @Override
    public PhieuGiamGia updatePhieuGiamGia(Integer id, PhieuGiamGiaRequest phieuGiamGiaRequest) throws ParseException {
        Optional<PhieuGiamGia> optionalPhieuGiamGia = phieuGiamGiaRepository.findById(id);

        if (optionalPhieuGiamGia.isPresent()) {
            PhieuGiamGia phieuGiamGia = optionalPhieuGiamGia.get();
            PhieuGiamGia phieuGiamGiaUpdate = phieuGiamGiaRepository.save(phieuGiamGiaRequest.newPhieuGiamGia(phieuGiamGia));
            return phieuGiamGiaUpdate;
        } else {
            System.out.println("Không tìm thấy phiếu giảm giá với ID: " + id);
            return null;
        }
    }

    @Override
    public List<String> getAllMaPhieuGiamGia() {
        return phieuGiamGiaRepository.getAllMaPhieuGiamGia();
    }

    @Override
    public List<String> getAllTenPhieuGiamGia() {
        return phieuGiamGiaRepository.getAllTenPhieuGiamGia();
    }

    @Override
    public PhieuGiamGiaResponse getPhieuGiamGiaById(Integer id) {
        return phieuGiamGiaRepository.getPhieuGiamGiaById(id);
    }
}
