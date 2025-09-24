package com.example.da_be.service.impl;

import com.example.da_be.dto.request.PhieuGiamGiaRequest;
import com.example.da_be.dto.request.PhieuGiamGiaSearch;
import com.example.da_be.dto.response.PhieuGiamGiaResponse;
import com.example.da_be.entity.PhieuGiamGia;
import com.example.da_be.repository.PhieuGiamGiaRepository;
import com.example.da_be.repository.HoaDonRepository;
import com.example.da_be.service.PhieuGiamGiaService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.text.ParseException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class PhieuGiamGiaServiceImpl implements PhieuGiamGiaService {
    @Autowired
    private PhieuGiamGiaRepository phieuGiamGiaRepository;
    
    @Autowired
    private HoaDonRepository hoaDonRepository;

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
    public boolean isVoucherInUse(Integer voucherId) {
        return hoaDonRepository.existsByVoucherId(voucherId);
    }

    @Override
    public PhieuGiamGia updatePhieuGiamGia(Integer id, PhieuGiamGiaRequest phieuGiamGiaRequest) throws ParseException {
        // Kiểm tra voucher có đang được sử dụng trong hóa đơn không (bất kể trạng thái)
        if (isVoucherInUse(id)) {
            throw new IllegalStateException("Không thể cập nhật phiếu giảm giá đã được sử dụng trong các hóa đơn!");
        }
        
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
    public Page<PhieuGiamGiaResponse> getSearchPhieuGiamGia(PhieuGiamGiaSearch phieuGiamGiaSearch, Pageable pageable) {
        return phieuGiamGiaRepository.getSearchPhieuGiamGia(phieuGiamGiaSearch, pageable);
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

    @Scheduled(cron = "0 * * * * ?")
    @Transactional
    public void updateTrangThaiVoucher() {
        boolean flag = false;
        LocalDateTime now = LocalDateTime.now(); // Lấy thời gian hiện tại

        List<PhieuGiamGia> voucherList = phieuGiamGiaRepository.getAllVoucherWrong(now);

        for (PhieuGiamGia voucher : voucherList) {
            LocalDateTime ngayBatDau = voucher.getNgayBatDau();
            LocalDateTime ngayKetThuc = voucher.getNgayKetThuc();

            if (ngayBatDau.isAfter(now) && voucher.getTrangThai() != 0) {
                voucher.setTrangThai(0);
                flag = true;
            } else if (ngayKetThuc.isBefore(now) && voucher.getTrangThai() != 2) {
                voucher.setTrangThai(2);
                flag = true;
            } else if ((ngayBatDau.isBefore(now) || ngayBatDau.isEqual(now)) && ngayKetThuc.isAfter(now) && voucher.getTrangThai() != 1) {
                voucher.setTrangThai(1);
                flag = true;
            }
        }
        
        // Lưu tất cả các thay đổi nếu có
        if (flag) {
            phieuGiamGiaRepository.saveAll(voucherList);
        }
    }
}
