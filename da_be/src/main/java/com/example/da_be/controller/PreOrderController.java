        package com.example.da_be.controller;

import com.example.da_be.entity.PreOrder;
import com.example.da_be.repository.PreOrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("/api/pre-order")
public class PreOrderController {

    @Autowired
    private PreOrderRepository preOrderRepository;

    @GetMapping("/hoa-don/{hoaDonId}")
    public ResponseEntity<List<PreOrder>> getPreOrdersByHoaDonId(@PathVariable Integer hoaDonId) {
        List<PreOrder> preOrders = preOrderRepository.findByHoaDonId(hoaDonId);
        return ResponseEntity.ok(preOrders);
    }
}
