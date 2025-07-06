package com.example.da_be.service;


import com.example.da_be.entity.TrongLuong;
import com.example.da_be.repository.TrongLuongRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TrongLuongService {
    @Autowired
    private TrongLuongRepository trongLuongRepository;

    public List<TrongLuong> getAllTrongLuong() {
        return trongLuongRepository.findAll();
    }

    public TrongLuong getTrongLuongById(int id) {
        Optional<TrongLuong> trongLuong = this.trongLuongRepository.findById(id);
        return trongLuong.orElseGet(TrongLuong::new);
    }

    public TrongLuong saveOrUpdateTrongLuong(TrongLuong trongLuong) {
        return this.trongLuongRepository.save(trongLuong);
    }

    public void deleteTrongLuongById(int id) {
        this.trongLuongRepository.deleteById(id);
    }
}
