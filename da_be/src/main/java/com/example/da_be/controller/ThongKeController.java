package com.example.da_be.controller;

import com.example.da_be.dto.response.ThongKeResponse;
import com.example.da_be.dto.response.TopSellingProductResponse;
import com.example.da_be.service.ThongKeService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.List;

@CrossOrigin(origins = "http://localhost:5173")
@RestController()
@RequestMapping("/thong-ke")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class ThongKeController {

    ThongKeService thongKeService;

    // === ENDPOINT CHO 5 CARD THỐNG KÊ TỔNG QUAN ===

    @GetMapping("/overall/ngay")
    public ThongKeResponse getOverallStatsByDate(){
        return thongKeService.getThongKeByDate();
    }

    @GetMapping("/overall/tuan")
    public ThongKeResponse getOverallStatsByWeek(){
        return thongKeService.getThongKeByWeek();
    }

    @GetMapping("/overall/thang")
    public ThongKeResponse getOverallStatsByMonth(){
        return thongKeService.getThongKeByMonth();
    }

    @GetMapping("/overall/nam")
    public ThongKeResponse getOverallStatsByYear(){
        return thongKeService.getThongKeByYear();
    }

    @GetMapping("/overall/tuy-chinh")
    public ThongKeResponse getOverallStatsByDateRange(
            @RequestParam("fromDate") @DateTimeFormat(pattern = "yyyy-MM-dd") Date fromDate,
            @RequestParam("toDate") @DateTimeFormat(pattern = "yyyy-MM-dd") Date toDate) {
        return thongKeService.getThongKeByDateRange(fromDate, toDate);
    }

    // === ENDPOINT CHO SẢN PHẨM BÁN CHẠY ===

    @GetMapping("/top-selling/ngay")
    public List<TopSellingProductResponse> getTopSellingProductsByDate(){
        return thongKeService.getTopSellingProductsByDate();
    }

    @GetMapping("/top-selling/tuan")
    public List<TopSellingProductResponse> getTopSellingProductsByWeek(){
        return thongKeService.getTopSellingProductsByWeek();
    }

    @GetMapping("/top-selling/thang")
    public List<TopSellingProductResponse> getTopSellingProductsByMonth(){
        return thongKeService.getTopSellingProductsByMonth();
    }

    @GetMapping("/top-selling/nam")
    public List<TopSellingProductResponse> getTopSellingProductsByYear(){
        return thongKeService.getTopSellingProductsByYear();
    }

    @GetMapping("/top-selling/tuy-chinh")
    public List<TopSellingProductResponse> getTopSellingProductsByDateRange(
            @RequestParam("fromDate") @DateTimeFormat(pattern = "yyyy-MM-dd") Date fromDate,
            @RequestParam("toDate") @DateTimeFormat(pattern = "yyyy-MM-dd") Date toDate) {
        return thongKeService.getTopSellingProductsByDateRange(fromDate, toDate);
    }
}