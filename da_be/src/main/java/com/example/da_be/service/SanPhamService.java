package com.example.da_be.service;

import com.example.da_be.entity.SanPham;
import com.example.da_be.repository.SanPhamRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class SanPhamService {

    @Autowired
    private SanPhamRepository sanPhamRepository;

    public List<Map<String, Object>> getAllSanPham() {
        List<Object[]> rawData = sanPhamRepository.getAllSanPham();
        List<Map<String, Object>> result = new ArrayList<>();

        for (Object[] row : rawData) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", row[0]);
            map.put("ten", row[1]);
            map.put("soLuong", ((Number) row[2]).intValue());
            map.put("trangThai", row[3]);
            result.add(map);
        }

        return result;
    }

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
