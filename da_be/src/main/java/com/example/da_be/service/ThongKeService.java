package com.example.da_be.service;

import com.example.da_be.dto.response.ProductsOutOfStockResponse;
import com.example.da_be.dto.response.ThongKeResponse;
import com.example.da_be.dto.response.TopSellingProductResponse;
import com.example.da_be.mapper.ThongKeMapper;
import com.example.da_be.repository.OrderStatsProjection;
import com.example.da_be.repository.ProductsOutOfStockProjection;
import com.example.da_be.repository.ThongKeRepository;
import com.example.da_be.repository.TopSellingProductProjection;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
//import org.springframework.security.access.prepost.PreAuthorize;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
//@PreAuthorize("hasRole('Admin')")
public class ThongKeService {

    ThongKeRepository thongKeRepository;
    ThongKeMapper thongKeMapper;

    public ThongKeResponse getThongKeByDate(){
        OrderStatsProjection stats = thongKeRepository.getStatsByCurrentDate();
        Map<String, Object> timeInfo = thongKeRepository.getServerDate();
        log.info("NOW()     (MySQL) = {}", timeInfo.get("nowTime"));
        log.info("CURDATE() (MySQL) = {}", timeInfo.get("curDate"));
        return thongKeMapper.toThongKeResponse(stats);
    }

    //Tuần
    public ThongKeResponse getThongKeByWeek(){
        OrderStatsProjection stats = thongKeRepository.getStatsByCurrentWeek();
        return thongKeMapper.toThongKeResponse(stats);
    }

    //Tháng
    public ThongKeResponse getThongKeByMonth(){
        OrderStatsProjection stats = thongKeRepository.getStatsByCurrentMonth();
        return thongKeMapper.toThongKeResponse(stats);
    }

    //Năm
    public ThongKeResponse getThongKeByYear(){
        OrderStatsProjection stats = thongKeRepository.getStatsByCurrentYear();
        return thongKeMapper.toThongKeResponse(stats);
    }

    //Tùy chỉnh
    public ThongKeResponse getThongKeByDateRange(Date fromDate, Date toDate){
        OrderStatsProjection stats = thongKeRepository.getStatsByDateRange(fromDate, toDate);
        return thongKeMapper.toThongKeResponse(stats);
    }


    public List<TopSellingProductResponse> getTopSellingProductsByDate() {
        List<TopSellingProductProjection> projections = thongKeRepository.findTopSellingProductsByCurrentDate();
        return thongKeMapper.toTopSellingProductResponseList(projections);
    }

    public List<TopSellingProductResponse> getTopSellingProductsByWeek() {
        List<TopSellingProductProjection> projections = thongKeRepository.findTopSellingProductsByCurrentWeek();
        return thongKeMapper.toTopSellingProductResponseList(projections);
    }

    public List<TopSellingProductResponse> getTopSellingProductsByMonth() {
        List<TopSellingProductProjection> projections = thongKeRepository.findTopSellingProductsByCurrentMonth();
        return thongKeMapper.toTopSellingProductResponseList(projections);
    }

    public List<TopSellingProductResponse> getTopSellingProductsByYear() {
        List<TopSellingProductProjection> projections = thongKeRepository.findTopSellingProductsByCurrentYear();
        return thongKeMapper.toTopSellingProductResponseList(projections);
    }

    public List<TopSellingProductResponse> getTopSellingProductsByDateRange(Date fromDate, Date toDate) {
        List<TopSellingProductProjection> projections = thongKeRepository.findTopSellingProductsByDateRange(fromDate, toDate);
        return thongKeMapper.toTopSellingProductResponseList(projections);
    }

    //Sản phẩm sắp hết hàng
    public List<ProductsOutOfStockResponse> getProductsOutOfStockList() {
        List<ProductsOutOfStockProjection> projections = thongKeRepository.findProductsOutOfStock();
        return thongKeMapper.toProductsOutOfStockResponseList(projections);
    }
}
