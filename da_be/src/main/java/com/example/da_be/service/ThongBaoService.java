package com.example.da_be.service;

import com.example.da_be.entity.ThongBao;
import com.example.da_be.repository.ThongBaoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class ThongBaoService {

    @Autowired
    private ThongBaoRepository thongBaoRepository;

    // Lấy danh sách tất cả thông báo
    public List<ThongBao> getAllThongBao() {
        return thongBaoRepository.findAll();
    }

    // Lấy thông báo theo ID
    public ThongBao getThongBaoById(int id) {
        Optional<ThongBao> thongBao = thongBaoRepository.findById(id);
        if (thongBao.isPresent()) {
            return thongBao.get();
        } else {
            throw new RuntimeException("Không tìm thấy thông báo với ID: " + id);
        }
    }

    // Lưu hoặc cập nhật thông báo
    public ThongBao saveOrUpdateThongBao(ThongBao thongBao) {
        // Validation cho thông báo mới
        if (thongBao.getId() == null) {
            if (thongBao.getTieuDe() == null || thongBao.getTieuDe().trim().isEmpty()) {
                throw new IllegalArgumentException("Tiêu đề thông báo không được để trống");
            }
            if (thongBao.getNoiDung() == null || thongBao.getNoiDung().trim().isEmpty()) {
                throw new IllegalArgumentException("Nội dung thông báo không được để trống");
            }
            if (thongBao.getKhachHang() != null && thongBao.getKhachHang().getId() == null) {
                throw new IllegalArgumentException("ID khách hàng không được để trống");
            }
        }
        
        return thongBaoRepository.save(thongBao);
    }

    // Phương thức riêng để cập nhật trạng thái thông báo
    public ThongBao updateTrangThaiThongBao(int id, Integer trangThai) {
        ThongBao existingThongBao = getThongBaoById(id);
        existingThongBao.setTrangThai(trangThai);
        existingThongBao.setUpdatedAt(LocalDateTime.now());
        return thongBaoRepository.save(existingThongBao);
    }

    // Xóa thông báo theo ID
    public void deleteThongBaoById(int id) {
        if (!thongBaoRepository.existsById(id)) {
            throw new RuntimeException("Không tìm thấy thông báo với ID: " + id);
        }
        thongBaoRepository.deleteById(id);
    }

    // Lấy danh sách thông báo theo idKhachHang (sắp xếp theo thời gian tạo giảm dần)
    public List<ThongBao> getThongBaoByKhachHang(int idKhachHang) {
        return thongBaoRepository.findByKhachHangIdOrderByCreatedAtDesc(idKhachHang);
    }
}
