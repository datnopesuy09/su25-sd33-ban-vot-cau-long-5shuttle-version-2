package com.example.da_be.service;


import com.example.da_be.entity.DiemCanBang;
import com.example.da_be.repository.DiemCanBangRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class DiemCanBangService {
    @Autowired
    private DiemCanBangRepository diemCanBangRepository;

    public List<DiemCanBang> getAllDiemCanBang() {
        return diemCanBangRepository.findAll();
    }

    public DiemCanBang getDiemCanBangById(int id) {
        Optional<DiemCanBang> diemCanBang = this.diemCanBangRepository.findById(id);
        return diemCanBang.orElseGet(DiemCanBang::new);
    }

    public DiemCanBang saveOrUpdateDiemCanBang(DiemCanBang diemCanBang) {
        return this.diemCanBangRepository.save(diemCanBang);
    }

    public void deleteDiemCanBangById(int id) {
        this.diemCanBangRepository.deleteById(id);
    }
}
