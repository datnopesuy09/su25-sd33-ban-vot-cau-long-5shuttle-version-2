package com.example.da_be.service;

import com.example.da_be.entity.MauSac;
import com.example.da_be.repository.MauSacRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class MauSacService {
    @Autowired
    private MauSacRepository mauSacRepository;

    public List<MauSac> getAllMauSac() {
        return mauSacRepository.findAll();
    }

    public MauSac getMauSacById(int id) {
        Optional<MauSac> mauSac = this.mauSacRepository.findById(id);
        return mauSac.orElseGet(MauSac::new);
    }

    public MauSac saveOrUpdateMauSac(MauSac mauSac) {
        return this.mauSacRepository.save(mauSac);
    }

    public void deleteMauSacById(int id) {
        this.mauSacRepository.deleteById(id);
    }
}

