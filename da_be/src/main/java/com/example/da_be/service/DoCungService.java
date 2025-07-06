package com.example.da_be.service;


import com.example.da_be.entity.DoCung;
import com.example.da_be.repository.DoCungRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class DoCungService {
    @Autowired
    private DoCungRepository doCungRepository;

    public List<DoCung> getAllDoCung() {
        return doCungRepository.findAll();
    }

    public DoCung getDoCungById(int id) {
        Optional<DoCung> doCung = this.doCungRepository.findById(id);
        return doCung.orElseGet(DoCung::new);
    }

    public DoCung saveOrUpdateDoCung(DoCung doCung) {
        return this.doCungRepository.save(doCung);
    }

    public void deleteDoCungById(int id) {
        this.doCungRepository.deleteById(id);
    }
}
