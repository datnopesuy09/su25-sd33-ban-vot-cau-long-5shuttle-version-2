package com.example.da_be.service;

import com.example.da_be.dto.SanPhamKhuyenMaiDTO;
import com.example.da_be.entity.SanPhamKhuyenMai;
import com.example.da_be.repository.SanPhamKhuyenMaiRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class SanPhamKhuyenMaiService {
    @Autowired
    private SanPhamKhuyenMaiRepository sanPhamKhuyenMaiRepository;

    public List<SanPhamKhuyenMai> getAllSanPhamKhuyenMai() {
        return sanPhamKhuyenMaiRepository.findAll();
    }

    public SanPhamKhuyenMai getSanPhamKhuyenMaiById(int id) {
        Optional<SanPhamKhuyenMai> sanPhamKhuyenMai = this.sanPhamKhuyenMaiRepository.findById(id);
        return sanPhamKhuyenMai.orElseGet(SanPhamKhuyenMai::new);
    }

    public SanPhamKhuyenMai saveOrUpdateSanPhamKhuyenMai(SanPhamKhuyenMai sanPhamKhuyenMai) {
        return this.sanPhamKhuyenMaiRepository.save(sanPhamKhuyenMai);
    }

    public void deleteSanPhamKhuyenMaiById(int id) {
        this.sanPhamKhuyenMaiRepository.deleteById(id);
    }

    // Trong Service
    public List<SanPhamKhuyenMaiDTO> getSanPhamKhuyenMaiBySanPhamCtId(Integer sanPhamCtId) {
        List<SanPhamKhuyenMai> sanPhamKhuyenMais = sanPhamKhuyenMaiRepository.findBySanPhamCT_Id(sanPhamCtId);

        return sanPhamKhuyenMais.stream()
                .map(item -> {
                    SanPhamKhuyenMaiDTO dto = new SanPhamKhuyenMaiDTO();
                    dto.setId(item.getId());
                    dto.setSanPhamCtId(item.getSanPhamCT().getId());
                    dto.setKhuyenMaiId(item.getKhuyenMai().getId());
                    dto.setTenKhuyenMai(item.getKhuyenMai().getTen());
                    dto.setGiaKhuyenMai(item.getGiaKhuyenMai());
                    dto.setNgayBatDau(item.getKhuyenMai().getTgBatDau());
                    dto.setNgayKetThuc(item.getKhuyenMai().getTgKetThuc());
                    return dto;
                })
                .collect(Collectors.toList());
    }

    public List<SanPhamKhuyenMai> getSanPhamKhuyenMaiBySanPhamCTId(Integer idSanPhamCT) {
        return sanPhamKhuyenMaiRepository.findBySanPhamCTId(idSanPhamCT);
    }
}
