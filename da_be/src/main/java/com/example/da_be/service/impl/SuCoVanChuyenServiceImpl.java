package com.example.da_be.service.impl;

import com.example.da_be.dto.SuCoVanChuyenDTO;
import com.example.da_be.dto.SuCoVanChuyenRequest;
import com.example.da_be.entity.HoaDon;
import com.example.da_be.entity.SuCoVanChuyen;
import com.example.da_be.entity.User;
import com.example.da_be.repository.HoaDonRepository;
import com.example.da_be.repository.SuCoVanChuyenRepository;
import com.example.da_be.repository.UserRepository;
import com.example.da_be.service.SuCoVanChuyenService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class SuCoVanChuyenServiceImpl implements SuCoVanChuyenService {

    private final SuCoVanChuyenRepository suCoVanChuyenRepository;
    private final HoaDonRepository hoaDonRepository;
    private final UserRepository userRepository;

    @Override
    public SuCoVanChuyenDTO createIncident(SuCoVanChuyenRequest request) {
    // Debug log tạm thời (có thể chuyển sang logger nếu dùng @Slf4j)
    System.out.println("[SuCoVanChuyen] Creating incident với payload: hoaDonId=" + request.getHoaDonId()
        + ", loaiSuCo=" + request.getLoaiSuCo()
        + ", ngayXayRa=" + request.getNgayXayRa()
        + ", nguoiBaoCao=" + request.getNguoiBaoCao());

        // Kiểm tra hóa đơn tồn tại
        HoaDon hoaDon = hoaDonRepository.findById(request.getHoaDonId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hóa đơn với ID: " + request.getHoaDonId()));

        if (request.getLoaiSuCo() == null) {
            throw new IllegalArgumentException("Loại sự cố không được để trống");
        }
        if (request.getMoTa() == null || request.getMoTa().trim().isEmpty()) {
            throw new IllegalArgumentException("Mô tả không được để trống");
        }

        // Xử lý thời gian nếu null
        LocalDateTime ngayXayRa = request.getNgayXayRa() != null ? request.getNgayXayRa() : LocalDateTime.now();

        // Tạo entity mới
        SuCoVanChuyen incident = new SuCoVanChuyen();
        incident.setHoaDon(hoaDon);
        incident.setLoaiSuCo(request.getLoaiSuCo());
        incident.setMoTa(request.getMoTa());
        incident.setDiaDiem(request.getDiaDiem());
        incident.setNgayXayRa(ngayXayRa);
        incident.setNguoiBaoCao(request.getNguoiBaoCao() != null ? request.getNguoiBaoCao() : 1);
        incident.setTrangThai(request.getTrangThai() != null ? request.getTrangThai() : 0);
        incident.setGhiChu(request.getGhiChu());
        incident.setHinhAnh(request.getHinhAnh());

        // Lưu vào database
        try {
            SuCoVanChuyen savedIncident = suCoVanChuyenRepository.save(incident);
            SuCoVanChuyenDTO dto = convertToDTO(savedIncident);
            return dto;
        } catch (Exception e) {
            System.err.println("[SuCoVanChuyen] Lỗi khi lưu sự cố: " + e.getMessage());
            throw e;
        }
    }

    @Override
    public SuCoVanChuyenDTO updateIncident(Integer id, SuCoVanChuyenRequest request) {
        SuCoVanChuyen incident = suCoVanChuyenRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sự cố với ID: " + id));

        // Cập nhật thông tin
        if (request.getLoaiSuCo() != null) {
            incident.setLoaiSuCo(request.getLoaiSuCo());
        }
        if (request.getMoTa() != null) {
            incident.setMoTa(request.getMoTa());
        }
        if (request.getDiaDiem() != null) {
            incident.setDiaDiem(request.getDiaDiem());
        }
        if (request.getNgayXayRa() != null) {
            incident.setNgayXayRa(request.getNgayXayRa());
        }
        if (request.getTrangThai() != null) {
            incident.setTrangThai(request.getTrangThai());
        }
        if (request.getGhiChu() != null) {
            incident.setGhiChu(request.getGhiChu());
        }
        if (request.getHinhAnh() != null) {
            incident.setHinhAnh(request.getHinhAnh());
        }

        SuCoVanChuyen updatedIncident = suCoVanChuyenRepository.save(incident);
        return convertToDTO(updatedIncident);
    }

    @Override
    public SuCoVanChuyenDTO updateIncidentStatus(Integer id, Integer newStatus) {
        SuCoVanChuyen incident = suCoVanChuyenRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sự cố với ID: " + id));

        incident.setTrangThai(newStatus);
        SuCoVanChuyen updatedIncident = suCoVanChuyenRepository.save(incident);
        return convertToDTO(updatedIncident);
    }

    @Override
    public void deleteIncident(Integer id) {
        if (!suCoVanChuyenRepository.existsById(id)) {
            throw new RuntimeException("Không tìm thấy sự cố với ID: " + id);
        }
        suCoVanChuyenRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<SuCoVanChuyenDTO> getIncidentById(Integer id) {
        return suCoVanChuyenRepository.findById(id)
                .map(this::convertToDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SuCoVanChuyenDTO> getIncidentsByHoaDonId(Integer hoaDonId) {
        return suCoVanChuyenRepository.findByHoaDonIdOrderByNgayTaoDesc(hoaDonId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<SuCoVanChuyenDTO> getAllIncidents() {
        return suCoVanChuyenRepository.findAll()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<SuCoVanChuyenDTO> getIncidentsByStatus(Integer status) {
        return suCoVanChuyenRepository.findByTrangThaiOrderByNgayTaoDesc(status)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<SuCoVanChuyenDTO> getIncidentsByType(SuCoVanChuyen.LoaiSuCo loaiSuCo) {
        return suCoVanChuyenRepository.findByLoaiSuCoOrderByNgayTaoDesc(loaiSuCo)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<SuCoVanChuyenDTO> getIncidentsByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        return suCoVanChuyenRepository.findByNgayXayRaBetweenOrderByNgayTaoDesc(startDate, endDate)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<SuCoVanChuyenDTO> getIncidentsByReporter(Integer reporterId) {
        return suCoVanChuyenRepository.findByNguoiBaoCaoOrderByNgayTaoDesc(reporterId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<SuCoVanChuyenDTO> getUnresolvedIncidents() {
        return suCoVanChuyenRepository.findUnresolvedIncidents()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Long> getIncidentStatsByStatus() {
        List<Object[]> results = suCoVanChuyenRepository.countByTrangThai();
        Map<String, Long> stats = new HashMap<>();
        
        for (Object[] result : results) {
            Integer status = (Integer) result[0];
            Long count = (Long) result[1];
            
            String statusName = switch (status) {
                case 0 -> "Đang xử lý";
                case 1 -> "Đã giải quyết";
                case 2 -> "Không thể giải quyết";
                default -> "Không xác định";
            };
            
            stats.put(statusName, count);
        }
        
        return stats;
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Long> getIncidentStatsByType() {
        List<Object[]> results = suCoVanChuyenRepository.countByLoaiSuCo();
        Map<String, Long> stats = new HashMap<>();
        
        for (Object[] result : results) {
            SuCoVanChuyen.LoaiSuCo type = (SuCoVanChuyen.LoaiSuCo) result[0];
            Long count = (Long) result[1];
            stats.put(type.getDescription(), count);
        }
        
        return stats;
    }

    @Override
    @Transactional(readOnly = true)
    public boolean hasIncidents(Integer hoaDonId) {
        return suCoVanChuyenRepository.existsByHoaDonId(hoaDonId);
    }

    @Override
    @Transactional(readOnly = true)
    public long countIncidentsByHoaDon(Integer hoaDonId) {
        return suCoVanChuyenRepository.countByHoaDonId(hoaDonId);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<SuCoVanChuyenDTO> getLatestIncidentByHoaDon(Integer hoaDonId) {
        List<SuCoVanChuyen> incidents = suCoVanChuyenRepository.findByHoaDonIdOrderByNgayTaoDesc(hoaDonId);
        return incidents.isEmpty() ? Optional.empty() : Optional.of(convertToDTO(incidents.get(0)));
    }

    /**
     * Chuyển đổi entity sang DTO
     */
    private SuCoVanChuyenDTO convertToDTO(SuCoVanChuyen incident) {
        SuCoVanChuyenDTO dto = new SuCoVanChuyenDTO();
        dto.setId(incident.getId());
        dto.setHoaDonId(incident.getHoaDon().getId());
        dto.setMaHoaDon(incident.getHoaDon().getMa());
        dto.setLoaiSuCo(incident.getLoaiSuCo());
        dto.setMoTa(incident.getMoTa());
        dto.setDiaDiem(incident.getDiaDiem());
        dto.setNgayXayRa(incident.getNgayXayRa());
        dto.setNguoiBaoCao(incident.getNguoiBaoCao());
        dto.setTrangThai(incident.getTrangThai());
        dto.setGhiChu(incident.getGhiChu());
        dto.setHinhAnh(incident.getHinhAnh());
        dto.setNgayTao(incident.getNgayTao());
        dto.setNgayCapNhat(incident.getNgayCapNhat());

        // Thêm thông tin trạng thái
        dto.setTenTrangThai(switch (incident.getTrangThai()) {
            case 0 -> "Đang xử lý";
            case 1 -> "Đã giải quyết";
            case 2 -> "Không thể giải quyết";
            default -> "Không xác định";
        });

        // Thêm thông tin người báo cáo
        Optional<User> reporter = userRepository.findById(incident.getNguoiBaoCao());
        dto.setTenNguoiBaoCao(reporter.map(User::getHoTen).orElse("Không xác định"));

        // Thêm thông tin khách hàng từ hóa đơn
        HoaDon hoaDon = incident.getHoaDon();
        dto.setTenNguoiNhan(hoaDon.getTenNguoiNhan());
        dto.setSoDienThoaiNguoiNhan(hoaDon.getSdtNguoiNhan());
        dto.setDiaChiNguoiNhan(hoaDon.getDiaChiNguoiNhan());

        return dto;
    }
}
