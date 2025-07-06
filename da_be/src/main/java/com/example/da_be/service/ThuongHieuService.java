package com.example.da_be.service;

import com.example.da_be.entity.ThuongHieu;
import com.example.da_be.repository.ThuongHieuRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ThuongHieuService {
    @Autowired
    private ThuongHieuRepository thuongHieuRepository;

    public List<ThuongHieu> getAllThuongHieu() {
        return thuongHieuRepository.findAll();
    }

    public ThuongHieu getThuongHieuById(int id) {
        Optional<ThuongHieu> thuongHieu = this.thuongHieuRepository.findById(id);
        return thuongHieu.orElseGet(ThuongHieu::new);
    }

    public ThuongHieu saveOrUpdateThuongHieu(ThuongHieu thuongHieu) {
        return this.thuongHieuRepository.save(thuongHieu);
    }

    public void deleteThuongHieuById(int id) {
        this.thuongHieuRepository.deleteById(id);
    }
}

