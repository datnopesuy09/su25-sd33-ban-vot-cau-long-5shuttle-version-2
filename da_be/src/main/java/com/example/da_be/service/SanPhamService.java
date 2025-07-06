package com.example.da_be.service;

import com.example.da_be.entity.SanPham;
import com.example.da_be.repository.SanPhamRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SanPhamService {

    @Autowired
    private SanPhamRepository sanPhamRepository;

    public List<SanPham> getAll() {
        return sanPhamRepository.findAll();
    }

    public SanPham getById(Integer id) {
        return sanPhamRepository.findById(id).orElse(null);
    }

    public SanPham create(SanPham sanPham) {
        return sanPhamRepository.save(sanPham);
    }

    public SanPham update(Integer id, SanPham sanPhamMoi) {
        return sanPhamRepository.findById(id)
                .map(sp -> {
                    sp.setMa(sanPhamMoi.getMa());
                    sp.setTen(sanPhamMoi.getTen());
                    sp.setTrangThai(sanPhamMoi.getTrangThai());
                    return sanPhamRepository.save(sp);
                })
                .orElse(null);
    }

    public void delete(Integer id) {
        sanPhamRepository.deleteById(id);
    }
}
