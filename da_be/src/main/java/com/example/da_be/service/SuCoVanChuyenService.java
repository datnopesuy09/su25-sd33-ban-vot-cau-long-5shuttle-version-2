package com.example.da_be.service;

import com.example.da_be.dto.SuCoVanChuyenDTO;
import com.example.da_be.dto.SuCoVanChuyenRequest;
import com.example.da_be.entity.SuCoVanChuyen;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface SuCoVanChuyenService {

    /**
     * Tạo mới sự cố vận chuyển
     */
    SuCoVanChuyenDTO createIncident(SuCoVanChuyenRequest request);

    /**
     * Cập nhật sự cố vận chuyển
     */
    SuCoVanChuyenDTO updateIncident(Integer id, SuCoVanChuyenRequest request);

    /**
     * Cập nhật trạng thái sự cố
     */
    SuCoVanChuyenDTO updateIncidentStatus(Integer id, Integer newStatus);

    /**
     * Xóa sự cố vận chuyển
     */
    void deleteIncident(Integer id);

    /**
     * Lấy sự cố theo ID
     */
    Optional<SuCoVanChuyenDTO> getIncidentById(Integer id);

    /**
     * Lấy tất cả sự cố theo hóa đơn ID
     */
    List<SuCoVanChuyenDTO> getIncidentsByHoaDonId(Integer hoaDonId);

    /**
     * Lấy tất cả sự cố
     */
    List<SuCoVanChuyenDTO> getAllIncidents();

    /**
     * Lấy sự cố theo trạng thái
     */
    List<SuCoVanChuyenDTO> getIncidentsByStatus(Integer status);

    /**
     * Lấy sự cố theo loại
     */
    List<SuCoVanChuyenDTO> getIncidentsByType(SuCoVanChuyen.LoaiSuCo loaiSuCo);

    /**
     * Lấy sự cố trong khoảng thời gian
     */
    List<SuCoVanChuyenDTO> getIncidentsByDateRange(LocalDateTime startDate, LocalDateTime endDate);

    /**
     * Lấy sự cố theo người báo cáo
     */
    List<SuCoVanChuyenDTO> getIncidentsByReporter(Integer reporterId);

    /**
     * Lấy sự cố chưa giải quyết
     */
    List<SuCoVanChuyenDTO> getUnresolvedIncidents();

    /**
     * Lấy thống kê sự cố theo trạng thái
     */
    Map<String, Long> getIncidentStatsByStatus();

    /**
     * Lấy thống kê sự cố theo loại
     */
    Map<String, Long> getIncidentStatsByType();

    /**
     * Kiểm tra hóa đơn có sự cố nào không
     */
    boolean hasIncidents(Integer hoaDonId);

    /**
     * Đếm số lượng sự cố theo hóa đơn
     */
    long countIncidentsByHoaDon(Integer hoaDonId);

    /**
     * Lấy sự cố gần đây nhất theo hóa đơn
     */
    Optional<SuCoVanChuyenDTO> getLatestIncidentByHoaDon(Integer hoaDonId);
}
