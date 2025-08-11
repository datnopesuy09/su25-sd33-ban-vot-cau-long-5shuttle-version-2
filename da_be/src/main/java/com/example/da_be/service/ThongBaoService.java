package com.example.da_be.service;

import com.example.da_be.entity.ThongBao;
import com.example.da_be.repository.ThongBaoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
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
        return thongBao.orElseGet(ThongBao::new);
    }

    // Lưu hoặc cập nhật thông báo
//    public ThongBao saveOrUpdateThongBao(ThongBao thongBao) {
//        return thongBaoRepository.save(thongBao);
//    }

    // Lưu hoặc cập nhật thông báo
    public ThongBao saveOrUpdateThongBao(ThongBao thongBao) {
        if (thongBao.getTieuDe() == null || thongBao.getTieuDe().trim().isEmpty()) {
            throw new IllegalArgumentException("Tiêu đề thông báo không được để trống");
        }
        if (thongBao.getNoiDung() == null || thongBao.getNoiDung().trim().isEmpty()) {
            throw new IllegalArgumentException("Nội dung thông báo không được để trống");
        }
        if (thongBao.getKhachHang().getId() == null) {
            throw new IllegalArgumentException("ID khách hàng không được để trống");
        }
        return thongBaoRepository.save(thongBao);
    }


    // Xóa thông báo theo ID
    public void deleteThongBaoById(int id) {
        thongBaoRepository.deleteById(id);
    }

    // Lấy danh sách thông báo theo idKhachHang
    public List<ThongBao> getThongBaoByKhachHang(int idKhachHang) {
        return thongBaoRepository.findByKhachHangId(idKhachHang);
    }
}