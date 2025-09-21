        package com.example.da_be.service;

import com.example.da_be.dto.*;
import com.example.da_be.entity.*;
import com.example.da_be.exception.ResourceNotFoundException;
import com.example.da_be.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class HoaDonCTService {

    @Autowired
    private HoaDonCTRepository hoaDonCTRepository;

    @Autowired
    private HoaDonRepository hoaDonRepository;

    @Autowired
    private HinhAnhRepository hinhAnhRepository;

    @Autowired
    private SanPhamCTRepository sanPhamCTRepository;

    @Autowired
    private LichSuDonHangRepository lichSuDonHangRepository;

    @Autowired
    private TraHangRepository traHangRepository;
    @Autowired
    private PreOrderRepository preOrderRepository;
    @Autowired
    private ThongBaoRepository thongBaoRepository;
    @Autowired
    private KhoHangService khoHangService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;


    public List<HoaDonCTDTO> getHoaDonCTByHoaDon(Integer idHoaDon) {
        HoaDon hoaDon = hoaDonRepository.findById(idHoaDon)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tài khoản với ID: " + idHoaDon));
        List<HoaDonCT> hoaDonCTList = hoaDonCTRepository.findByHoaDon(hoaDon);
        return hoaDonCTList.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<TraHangDTO> getTraHangByHoaDon(Integer idHoaDon) {
        HoaDon hoaDon = hoaDonRepository.findById(idHoaDon)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy hóa đơn với ID: " + idHoaDon));
        List<TraHang> traHangList = traHangRepository.findByHoaDonCT_HoaDon_Id(idHoaDon);
        return traHangList.stream()
                .map(this::convertToTraHangDTO)
                .collect(Collectors.toList());
    }

    private HoaDonCTDTO convertToDTO(HoaDonCT hoaDonCT) {
        HoaDonCTDTO dto = new HoaDonCTDTO();
        dto.setId(hoaDonCT.getId());
        dto.setSoLuong(hoaDonCT.getSoLuong());
        // Sử dụng giá đã lưu trong HoaDonCT (giá tại thời điểm mua hàng)
        if (hoaDonCT.getGiaBan() != null) {
            dto.setGiaBan(hoaDonCT.getGiaBan().doubleValue());
        } else {
            // Fallback: tính từ đơn giá gốc * số lượng (chỉ khi không có giá bán lưu)
            double unit = hoaDonCT.getSanPhamCT().getDonGia();
            dto.setGiaBan(unit * hoaDonCT.getSoLuong());
        }
        dto.setTrangThaiHoaDon(hoaDonCT.getHoaDon().getTrangThai());
        SanPhamCT sanPhamCT = hoaDonCT.getSanPhamCT();
        SanPhamCTDTO sanPhamCTDTO = new SanPhamCTDTO();
        sanPhamCTDTO.setId(sanPhamCT.getId());
        sanPhamCTDTO.setTen(sanPhamCT.getSanPham().getTen());
        sanPhamCTDTO.setDonGia(sanPhamCT.getDonGia());
        sanPhamCTDTO.setSoLuong(sanPhamCT.getSoLuong());
        // Không truyền giá khuyến mãi hiện tại để tránh hiển thị sai
        // sanPhamCTDTO.setGiaKhuyenMai(sanPhamCT.getGiaKhuyenMai());
        // sanPhamCTDTO.setGiaTriKhuyenMai(sanPhamCT.getGiaTriKhuyenMai());
        String hinhAnhUrl = hinhAnhRepository.findFirstBySanPhamCT_Id(sanPhamCT.getId())
                .map(HinhAnh::getLink)
                .orElse(null);
        dto.setHinhAnhUrl(hinhAnhUrl);
        dto.setSanPhamCT(sanPhamCTDTO);
        ThuongHieuDTO thuongHieuDTO = new ThuongHieuDTO();
        thuongHieuDTO.setId(sanPhamCT.getThuongHieu().getId());
        thuongHieuDTO.setTen(sanPhamCT.getThuongHieu().getTen());
        sanPhamCTDTO.setThuongHieu(thuongHieuDTO);
        TrongLuongDTO trongLuongDTO = new TrongLuongDTO();
        trongLuongDTO.setId(sanPhamCT.getTrongLuong().getId());
        trongLuongDTO.setTen(sanPhamCT.getTrongLuong().getTen());
        sanPhamCTDTO.setTrongLuong(trongLuongDTO);
        MauSacDTO mauSacDTO = new MauSacDTO();
        mauSacDTO.setId(sanPhamCT.getMauSac().getId());
        mauSacDTO.setTen(sanPhamCT.getMauSac().getTen());
        sanPhamCTDTO.setMauSac(mauSacDTO);
        return dto;
    }

    private TraHangDTO convertToTraHangDTO(TraHang traHang) {
        TraHangDTO dto = new TraHangDTO();
        dto.setId(traHang.getId());
        dto.setSoLuong(traHang.getSoLuong());
        dto.setLyDo(traHang.getLyDo());
        dto.setNgayTao(traHang.getNgayTao());
        dto.setTrangThai(traHang.getTrangThai());
        HoaDonCTDTO hoaDonCTDTO = convertToDTO(traHang.getHoaDonCT());
        dto.setHoaDonCT(hoaDonCTDTO);
        return dto;
    }

    @Transactional
    public void updateQuantity(Integer hoaDonCTId, Integer newQuantity) {
        HoaDonCT hoaDonCT = hoaDonCTRepository.findById(hoaDonCTId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy hóa đơn chi tiết với ID: " + hoaDonCTId));
        SanPhamCT sanPhamCT = hoaDonCT.getSanPhamCT();
        int oldQuantity = hoaDonCT.getSoLuong();
        // Cập nhật số lượng và tính lại giaBan dựa trên đơn giá đã lưu
        hoaDonCT.setSoLuong(newQuantity);
        
        // Tính đơn giá từ giá bán hiện tại chia cho số lượng cũ
        BigDecimal unitPrice;
        if (hoaDonCT.getGiaBan() != null && oldQuantity > 0) {
            unitPrice = hoaDonCT.getGiaBan().divide(BigDecimal.valueOf(oldQuantity));
        } else {
            // Fallback: sử dụng giá hiện tại nếu không có giá bán lưu
            if (sanPhamCT.getGiaKhuyenMai() != null && sanPhamCT.getGiaKhuyenMai() < sanPhamCT.getDonGia()) {
                unitPrice = BigDecimal.valueOf(sanPhamCT.getGiaKhuyenMai());
            } else {
                unitPrice = BigDecimal.valueOf(sanPhamCT.getDonGia());
            }
        }
        
        hoaDonCT.setGiaBan(unitPrice.multiply(BigDecimal.valueOf(newQuantity)));
        hoaDonCTRepository.save(hoaDonCT);
        int quantityDifference = newQuantity - oldQuantity;
        int updatedStock = sanPhamCT.getSoLuong() - quantityDifference;
        if (updatedStock < 0) {
            throw new IllegalArgumentException("Số lượng trong kho không đủ.");
        }
        sanPhamCT.setSoLuong(updatedStock);
        sanPhamCTRepository.save(sanPhamCT);
    }

    public List<HoaDonCT> getAllHoaDonCT() {
        return hoaDonCTRepository.findAll();
    }

    public HoaDonCT getHoaDonCTById(int id) {
        return hoaDonCTRepository.findById(id).orElse(null);
    }

    @Transactional
    public HoaDonCT saveOrUpdateHoaDonCT(HoaDonCT hoaDonCT) {
        return hoaDonCTRepository.save(hoaDonCT);
    }

    @Transactional
    public void deleteHoaDonCTById(int id) {
        HoaDonCT hoaDonCT = hoaDonCTRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy hóa đơn chi tiết với ID: " + id));

        try {
            SanPhamCT sanPhamCT = hoaDonCT.getSanPhamCT();
            int soLuongHoan = hoaDonCT.getSoLuong() != null ? hoaDonCT.getSoLuong() : 0;
            if (sanPhamCT != null && soLuongHoan > 0) {
                // Use KhoHangService to restore stock consistently and record logs
                khoHangService.restoreStock(sanPhamCT.getId(), soLuongHoan);
            }

            // Finally delete the HoaDonCT record
            hoaDonCTRepository.deleteById(id);
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi xóa chi tiết hóa đơn: " + e.getMessage(), e);
        }
    }

    public List<HoaDonCT> getHoaDonCTByHoaDonId(int hoaDonId) {
        return hoaDonCTRepository.findByHoaDonId(hoaDonId);
    }

    public List<HoaDonCT> getHoaDonCTBySanPhamCTId(int sanPhamCTId) {
        return hoaDonCTRepository.findBySanPhamCTId(sanPhamCTId);
    }

    public HoaDonCT updateHoaDonCTStatus(int id, int newStatus) {
        HoaDonCT hoaDonCT = hoaDonCTRepository.findById(id).orElse(null);
        if (hoaDonCT != null) {
            hoaDonCT.setTrangThai(newStatus);
            return hoaDonCTRepository.save(hoaDonCT);
        }
        return null;
    }

    public TraHang processReturn(Integer hoaDonCTId, Integer soLuong, String lyDo) {
        HoaDonCT hoaDonCT = hoaDonCTRepository.findById(hoaDonCTId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy chi tiết hóa đơn"));

        if (soLuong <= 0 || soLuong > hoaDonCT.getSoLuong()) {
            throw new IllegalArgumentException("Số lượng trả không hợp lệ");
        }

        TraHang traHang = new TraHang();
        traHang.setHoaDonCT(hoaDonCT);
        traHang.setSoLuong(soLuong);
        traHang.setLyDo(lyDo);
        traHang.setNgayTao(LocalDateTime.now());
        traHang.setTrangThai(0);
        return traHangRepository.save(traHang);
    }

    @Transactional
    public void approveReturn(Integer traHangId) {
        TraHang traHang = traHangRepository.findById(traHangId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy yêu cầu trả hàng"));

        if (traHang.getTrangThai() != 0) {
            throw new IllegalStateException("Yêu cầu trả hàng không ở trạng thái chờ duyệt");
        }

        HoaDonCT hoaDonCT = traHang.getHoaDonCT();
        int newSoLuong = hoaDonCT.getSoLuong() - traHang.getSoLuong();
        if (newSoLuong < 0) {
            throw new IllegalStateException("Số lượng trả vượt quá số lượng hiện có");
        }
        
        // Cập nhật số lượng trong hóa đơn chi tiết
        hoaDonCT.setSoLuong(newSoLuong);
        hoaDonCTRepository.save(hoaDonCT);

        // Hoàn lại số lượng vào kho
        khoHangService.restoreStockOnReturn(hoaDonCT, traHang.getSoLuong());

        // Cập nhật trạng thái trả hàng
        traHang.setTrangThai(1);
        traHangRepository.save(traHang);

        // Kiểm tra nếu tất cả sản phẩm đã được trả
        HoaDon hoaDon = hoaDonCT.getHoaDon();
        boolean allReturned = hoaDonCTRepository.findByHoaDonId(hoaDon.getId())
                .stream()
                .allMatch(hdct -> hdct.getSoLuong() == 0);
        if (allReturned) {
            hoaDon.setTrangThai(8); // Trạng thái trả hàng hoàn toàn
            hoaDonRepository.save(hoaDon);
        }
    }

    public void rejectReturn(Integer traHangId) {
        TraHang traHang = traHangRepository.findById(traHangId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy yêu cầu trả hàng"));

        if (traHang.getTrangThai() != 0) {
            throw new IllegalStateException("Yêu cầu trả hàng không ở trạng thái chờ duyệt");
        }

        traHang.setTrangThai(2);
        traHangRepository.save(traHang);
    }



    @Transactional
    public void importStock(Integer sanPhamCTId, Integer quantity) {
        SanPhamCT sanPhamCT = sanPhamCTRepository.findById(sanPhamCTId)
                .orElseThrow(() -> new ResourceNotFoundException("Sản phẩm không tồn tại"));
        sanPhamCT.setSoLuong(sanPhamCT.getSoLuong() + quantity);
        sanPhamCTRepository.save(sanPhamCT);

        // Kiểm tra các pre-order liên quan
        List<PreOrder> preOrders = preOrderRepository.findBySanPhamCTIdAndTrangThai(sanPhamCTId, 0);
        for (PreOrder preOrder : preOrders) {
            if (sanPhamCT.getSoLuong() >= preOrder.getSoLuong()) {
                HoaDon hoaDon = preOrder.getHoaDon();
                hoaDon.setTrangThai(1); // Chuyển về Chờ xác nhận
                hoaDonRepository.save(hoaDon);

                // Cập nhật chi tiết hóa đơn
                HoaDonCT hoaDonCT = hoaDonCTRepository.findByHoaDonIdAndSanPhamCTId(hoaDon.getId(), sanPhamCTId)
                        .orElse(null);
                if (hoaDonCT == null) {
                    hoaDonCT = new HoaDonCT();
                    hoaDonCT.setHoaDon(hoaDon);
                    hoaDonCT.setSanPhamCT(sanPhamCT);
                    hoaDonCT.setSoLuong(preOrder.getSoLuong());
                    
                    // Set giá bán: ưu tiên giá khuyến mãi nếu có và nhỏ hơn giá gốc
                    BigDecimal giaBan;
                    if (sanPhamCT.getGiaKhuyenMai() != null && 
                        sanPhamCT.getGiaKhuyenMai() < sanPhamCT.getDonGia()) {
                        giaBan = BigDecimal.valueOf(sanPhamCT.getGiaKhuyenMai());
                    } else {
                        giaBan = BigDecimal.valueOf(sanPhamCT.getDonGia());
                    }
                    hoaDonCT.setGiaBan(giaBan);
                    
                    hoaDonCT.setTrangThai(1);
                } else {
                    hoaDonCT.setSoLuong(hoaDonCT.getSoLuong() + preOrder.getSoLuong());
                }
                sanPhamCT.setSoLuong(sanPhamCT.getSoLuong() - preOrder.getSoLuong());
                sanPhamCTRepository.save(sanPhamCT);
                hoaDonCTRepository.save(hoaDonCT);

                // Cập nhật trạng thái pre-order
                preOrder.setTrangThai(1); // Đã nhập hàng
                preOrderRepository.save(preOrder);

                // Gửi thông báo
                ThongBao thongBao = new ThongBao();
                thongBao.setKhachHang(preOrder.getTaiKhoan());
                thongBao.setTieuDe("Hàng đã về kho");
                thongBao.setNoiDung("Sản phẩm " + sanPhamCT.getSanPham().getTen() + " đã có hàng. Vui lòng xác nhận đơn hàng #" + hoaDon.getMa() + ".");
                thongBao.setTrangThai(1);
                thongBaoRepository.save(thongBao);
                messagingTemplate.convertAndSendToUser(preOrder.getTaiKhoan().getId().toString(), "/queue/notifications", thongBao);
            }
        }
    }
}
