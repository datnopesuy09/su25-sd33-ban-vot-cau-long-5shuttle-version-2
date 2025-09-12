package com.example.da_be.service;

import com.example.da_be.entity.LichSuDonHang;
import com.example.da_be.repository.LichSuDonHangRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class LichSuDonHangService {

    @Autowired
    private LichSuDonHangRepository lichSuDonHangRepository;

    // Lấy tất cả lịch sử đơn hàng
    public List<LichSuDonHang> getAllLichSuDonHang() {
        return lichSuDonHangRepository.findAll();
    }

    // Lấy lịch sử đơn hàng theo ID
    public Optional<LichSuDonHang> getLichSuDonHangById(Integer id) {
        return lichSuDonHangRepository.findById(id);
    }

    // Lấy lịch sử đơn hàng theo ID User
    public List<LichSuDonHang> getLichSuDonHangByUserId(Integer userId) {
        return lichSuDonHangRepository.findByUserId(userId);
    }

    // Lấy lịch sử đơn hàng theo ID Hóa đơn
    public List<LichSuDonHang> getLichSuDonHangByHoaDonId(Integer hoaDonId) {
        return lichSuDonHangRepository.findByHoaDonId(hoaDonId);
    }

    // Lấy lịch sử đơn hàng theo trạng thái
    public List<LichSuDonHang> getLichSuDonHangByTrangThai(Integer trangThai) {
        return lichSuDonHangRepository.findByTrangThai(trangThai);
    }

    // Thêm mới lịch sử đơn hàng
    public LichSuDonHang createLichSuDonHang(LichSuDonHang lichSuDonHang) {
        return lichSuDonHangRepository.save(lichSuDonHang);
    }

    // Cập nhật lịch sử đơn hàng
    public LichSuDonHang updateLichSuDonHang(Integer id, LichSuDonHang lichSuDonHangDetails) {
        Optional<LichSuDonHang> optionalLichSuDonHang = lichSuDonHangRepository.findById(id);
        if (optionalLichSuDonHang.isPresent()) {
            LichSuDonHang lichSuDonHang = optionalLichSuDonHang.get();
            lichSuDonHang.setUser(lichSuDonHangDetails.getUser());
            lichSuDonHang.setHoaDon(lichSuDonHangDetails.getHoaDon());
            lichSuDonHang.setMoTa(lichSuDonHangDetails.getMoTa());
            lichSuDonHang.setNgayTao(lichSuDonHangDetails.getNgayTao());
            lichSuDonHang.setTrangThai(lichSuDonHangDetails.getTrangThai());
            return lichSuDonHangRepository.save(lichSuDonHang);
        }
        return null;
    }

    // Xóa lịch sử đơn hàng
    public boolean deleteLichSuDonHang(Integer id) {
        Optional<LichSuDonHang> optionalLichSuDonHang = lichSuDonHangRepository.findById(id);
        if (optionalLichSuDonHang.isPresent()) {
            lichSuDonHangRepository.deleteById(id);
            return true;
        }
        return false;
    }

    // Kiểm tra tồn tại
    public boolean existsById(Integer id) {
        return lichSuDonHangRepository.existsById(id);
    }
}
