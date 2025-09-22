package com.example.da_be.service;

import com.example.da_be.dto.HoanHangDTO;
import com.example.da_be.dto.request.HoanHangRequest;
import com.example.da_be.dto.response.HoanHangResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.List;

public interface HoanHangService {
    
    /**
     * Thực hiện hoàn hàng - cập nhật trực tiếp đơn hàng và tồn kho
     */
    HoanHangResponse processReturn(HoanHangRequest request);
    
    /**
     * Lấy danh sách hoàn hàng theo hóa đơn
     */
    List<HoanHangDTO> getReturnsByHoaDonId(Long hoaDonId);
    
    /**
     * Lấy chi tiết hoàn hàng theo ID
     */
    HoanHangDTO getReturnById(Long id);
    
    /**
     * Lấy hoàn hàng theo mã
     */
    HoanHangDTO getReturnByMa(String maHoanHang);
    
    /**
     * Tính tổng tiền hoàn hàng theo hóa đơn
     */
    BigDecimal getTotalReturnAmountByHoaDonId(Long hoaDonId);
    
    /**
     * Lấy danh sách hoàn hàng với phân trang
     */
    Page<HoanHangDTO> getAllReturns(Pageable pageable);
    
    /**
     * Kiểm tra số lượng có thể hoàn hàng
     */
    Integer getAvailableReturnQuantity(Long hoaDonChiTietId);
    
    /**
     * Validate dữ liệu hoàn hàng
     */
    void validateReturnRequest(HoanHangRequest request);
    
    /**
     * Lấy thống kê hoàn hàng theo tháng
     */
    List<Object[]> getMonthlyReturnStats();
}