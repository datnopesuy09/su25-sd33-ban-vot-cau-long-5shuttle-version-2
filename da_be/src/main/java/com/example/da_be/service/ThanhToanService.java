package com.example.da_be.service;

import com.example.da_be.entity.ThanhToan;
import com.example.da_be.exception.ResourceNotFoundException;
import com.example.da_be.repository.ThanhToanRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ThanhToanService {

    @Autowired
    private ThanhToanRepository thanhToanRepository;

    public List<ThanhToan> getAllThanhToan() {
        return thanhToanRepository.findAll();
    }

    public ThanhToan getThanhToanById(int id) {
        return thanhToanRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ThanhToan not found with id " + id));
    }

    public ThanhToan saveOrUpdateThanhToan(ThanhToan thanhToan) {
        return thanhToanRepository.save(thanhToan);
    }

    public void deleteThanhToanById(int id) {
        thanhToanRepository.deleteById(id);
    }

    public List<ThanhToan> getThanhToanByTaiKhoanId(Integer taiKhoanId) {
        return thanhToanRepository.findByTaiKhoan_Id(taiKhoanId);
    }

    public List<ThanhToan> getThanhToanByHoaDonId(Integer hoaDonId) {
        return thanhToanRepository.findByHoaDon_Id(hoaDonId);
    }

}
