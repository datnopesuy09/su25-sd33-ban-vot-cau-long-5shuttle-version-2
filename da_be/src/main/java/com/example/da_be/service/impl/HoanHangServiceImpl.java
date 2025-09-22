package com.example.da_be.service.impl;

import com.example.da_be.dto.HoanHangDTO;
import com.example.da_be.dto.request.HoanHangRequest;
import com.example.da_be.dto.response.HoanHangResponse;
import com.example.da_be.entity.*;
import com.example.da_be.repository.*;
import com.example.da_be.service.HoanHangService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HoanHangServiceImpl implements HoanHangService {

    private final HoanHangRepository hoanHangRepository;
    private final HoaDonRepository hoaDonRepository;
    private final HoaDonCTRepository hoaDonCTRepository;
    private final SanPhamCTRepository sanPhamCTRepository;

    @Override
    @Transactional
    public HoanHangResponse processReturn(HoanHangRequest request) {
        // Validate request
        validateReturnRequest(request);
        
        // Lấy thông tin hóa đơn chi tiết
        HoaDonCT hoaDonCT = hoaDonCTRepository.findById(request.getHoaDonChiTietId().intValue())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hóa đơn chi tiết"));
        
        // Lấy thông tin hóa đơn
        HoaDon hoaDon = hoaDonRepository.findById(request.getHoaDonId().intValue())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hóa đơn"));
        
        // Kiểm tra trạng thái hóa đơn (phải là đang vận chuyển)
        if (hoaDon.getTrangThai() != 3) {
            throw new RuntimeException("Chỉ có thể hoàn hàng khi đơn hàng đang vận chuyển");
        }
        
        // Tính thành tiền
        BigDecimal thanhTien = request.getDonGia().multiply(BigDecimal.valueOf(request.getSoLuongHoan()));
        
        // Tạo bản ghi hoàn hàng
        HoanHang hoanHang = new HoanHang(
                request.getHoaDonId(),
                request.getHoaDonChiTietId(),
                request.getSoLuongHoan(),
                request.getDonGia(),
                thanhTien,
                request.getLyDoHoan(),
                request.getGhiChu(),
                request.getNguoiTao()
        );
        
        hoanHang = hoanHangRepository.save(hoanHang);
        
        // 1. Cập nhật số lượng trong hóa đơn chi tiết
        Integer soLuongMoi = hoaDonCT.getSoLuong() - request.getSoLuongHoan();
        if (soLuongMoi < 0) {
            throw new RuntimeException("Số lượng hoàn vượt quá số lượng đã mua");
        }
        
        hoaDonCT.setSoLuong(soLuongMoi);
        // Không cập nhật thanhTien vì HoaDonCT không có trường này
        hoaDonCTRepository.save(hoaDonCT);
        
        // 2. Hoàn lại tồn kho
        SanPhamCT sanPhamCT = hoaDonCT.getSanPhamCT();
        Integer tonKhoMoi = sanPhamCT.getSoLuong() + request.getSoLuongHoan();
        sanPhamCT.setSoLuong(tonKhoMoi);
        sanPhamCTRepository.save(sanPhamCT);
        
        // 3. Cập nhật tổng tiền hóa đơn
        BigDecimal tongTienHoanHang = getTotalReturnAmountByHoaDonId(hoaDon.getId().longValue());
        BigDecimal tongTienMoi = hoaDon.getTongTien().subtract(thanhTien);
        
        hoaDon.setTongTien(tongTienMoi);
        // Bỏ dòng setTongTienSauGiam vì HoaDon entity không có trường này
        hoaDonRepository.save(hoaDon);
        
        // Trả về response
        return new HoanHangResponse(
                hoanHang.getId(),
                hoanHang.getMaHoanHang(),
                thanhTien,
                tongTienMoi,
                tongTienHoanHang.add(thanhTien)
        );
    }

    @Override
    public List<HoanHangDTO> getReturnsByHoaDonId(Long hoaDonId) {
        List<HoanHang> hoanHangs = hoanHangRepository.findByHoaDonIdOrderByNgayTaoDesc(hoaDonId);
        return hoanHangs.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    @Override
    public HoanHangDTO getReturnById(Long id) {
        HoanHang hoanHang = hoanHangRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hoàn hàng"));
        return convertToDTO(hoanHang);
    }

    @Override
    public HoanHangDTO getReturnByMa(String maHoanHang) {
        HoanHang hoanHang = hoanHangRepository.findByMaHoanHang(maHoanHang)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hoàn hàng"));
        return convertToDTO(hoanHang);
    }

    @Override
    public BigDecimal getTotalReturnAmountByHoaDonId(Long hoaDonId) {
        return hoanHangRepository.getTotalReturnAmountByHoaDonId(hoaDonId);
    }

    @Override
    public Page<HoanHangDTO> getAllReturns(Pageable pageable) {
        Page<HoanHang> hoanHangs = hoanHangRepository.findAllOrderByNgayTaoDesc(pageable);
        return hoanHangs.map(this::convertToDTO);
    }

    @Override
    public Integer getAvailableReturnQuantity(Long hoaDonChiTietId) {
        HoaDonCT hoaDonCT = hoaDonCTRepository.findById(hoaDonChiTietId.intValue())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hóa đơn chi tiết"));
        
        Integer soLuongDaHoan = hoanHangRepository.getTotalReturnQuantityByHoaDonChiTietId(hoaDonChiTietId);
        return hoaDonCT.getSoLuong() - (soLuongDaHoan != null ? soLuongDaHoan : 0);
    }

    @Override
    public void validateReturnRequest(HoanHangRequest request) {
        // Kiểm tra số lượng có thể hoàn
        Integer availableQuantity = getAvailableReturnQuantity(request.getHoaDonChiTietId());
        if (request.getSoLuongHoan() > availableQuantity) {
            throw new RuntimeException("Số lượng hoàn (" + request.getSoLuongHoan() + 
                    ") vượt quá số lượng có thể hoàn (" + availableQuantity + ")");
        }
        
        // Kiểm tra đơn giá
        if (request.getDonGia().compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Đơn giá phải lớn hơn 0");
        }
    }

    @Override
    public List<Object[]> getMonthlyReturnStats() {
        return hoanHangRepository.getMonthlyReturnStats();
    }

    private HoanHangDTO convertToDTO(HoanHang hoanHang) {
        HoanHangDTO dto = new HoanHangDTO();
        dto.setId(hoanHang.getId());
        dto.setMaHoanHang(hoanHang.getMaHoanHang());
        dto.setHoaDonId(hoanHang.getHoaDonId());
        dto.setHoaDonChiTietId(hoanHang.getHoaDonChiTietId());
        dto.setSoLuongHoan(hoanHang.getSoLuongHoan());
        dto.setDonGia(hoanHang.getDonGia());
        dto.setThanhTien(hoanHang.getThanhTien());
        dto.setLyDoHoan(hoanHang.getLyDoHoan());
        dto.setGhiChu(hoanHang.getGhiChu());
        dto.setTrangThai(hoanHang.getTrangThai());
        dto.setNguoiTao(hoanHang.getNguoiTao());
        dto.setNgayTao(hoanHang.getNgayTao());
        dto.setNguoiCapNhat(hoanHang.getNguoiCapNhat());
        dto.setNgayCapNhat(hoanHang.getNgayCapNhat());
        
        // Lấy thông tin sản phẩm nếu có
        try {
            // Lấy HoaDonCT từ database
            HoaDonCT hoaDonCT = hoaDonCTRepository.findById(hoanHang.getHoaDonChiTietId().intValue()).orElse(null);
            if (hoaDonCT != null) {
                SanPhamCT sanPhamCT = hoaDonCT.getSanPhamCT();
                
                if (sanPhamCT != null) {
                    dto.setTenSanPham(sanPhamCT.getSanPham().getTen());
                    dto.setMauSac(sanPhamCT.getMauSac().getTen());
                    dto.setTrongLuong(sanPhamCT.getTrongLuong().getTen()); // Sử dụng getTen() thay vì getGiaTri()
                    
                    // Lấy hình ảnh đầu tiên từ SanPhamCT
                    if (sanPhamCT.getHinhAnh() != null && !sanPhamCT.getHinhAnh().isEmpty()) {
                        dto.setHinhAnh(sanPhamCT.getHinhAnh().get(0).getLink()); // Sử dụng getLink() thay vì getUrl()
                    }
                }
                
                dto.setSoLuongDaMua(hoaDonCT.getSoLuong() + hoanHang.getSoLuongHoan());
                dto.setSoLuongDaHoan(hoanHangRepository.getTotalReturnQuantityByHoaDonChiTietId(hoanHang.getHoaDonChiTietId()));
                dto.setSoLuongCoTheHoan(getAvailableReturnQuantity(hoanHang.getHoaDonChiTietId()));
            }
        } catch (Exception e) {
            // Log lỗi nhưng không ném exception để không làm crash service
            System.err.println("Lỗi khi lấy thông tin sản phẩm cho hoàn hàng: " + e.getMessage());
        }
        
        return dto;
    }
}