package com.example.da_be.service;

import com.example.da_be.dto.request.PhieuTraHang.CreationPhieuTraHangOnlineRequest;
import com.example.da_be.dto.request.PhieuTraHang.PhieuTraHangApprovalRequest;
import com.example.da_be.dto.request.PhieuTraHang.PhieuTraHangChiTietApprovalDetail;
import com.example.da_be.dto.request.PhieuTraHang.PhieuTraHangChiTietRequest;
import com.example.da_be.dto.response.PhieuTraHangResponse;
import com.example.da_be.dto.response.SanPhamTraResponse;
import com.example.da_be.email.Email;
import com.example.da_be.email.EmailSender;
import com.example.da_be.entity.*;
import com.example.da_be.enums.LoaiHoaDon;
import com.example.da_be.enums.TrangThaiTra;
import com.example.da_be.exception.AppException;
import com.example.da_be.exception.ErrorCode;
import com.example.da_be.mapper.PhieuTraHangMapper;
import com.example.da_be.repository.*;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class PhieuTraHangService {

    PhieuTraHangRepository phieuTraHangRepository;
    PhieuTraHangChiTietRepository phieuTraHangChiTietRepository;
    PhieuTraHangMapper phieuTraHangMapper;
    UserRepository userRepository;
    HoaDonRepository hoaDonRepository;
    HoaDonCTRepository hoaDonCTRepository;
    EmailSender emailSender;
    SanPhamCTRepository sanPhamCTRepository;

    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_STAFF')")
    public List<PhieuTraHangResponse> getAllOnlineOrders() {
        List<PhieuTraHang> phieuTraHangList = phieuTraHangRepository.findAllWithDetails();
        return phieuTraHangList.stream().map(phieuTraHangMapper::toPhieuTraHangResponse).collect(Collectors.toList());
    }

    @Transactional
    public PhieuTraHangResponse createPhieuTraHangOnline(CreationPhieuTraHangOnlineRequest request) {
        var context = SecurityContextHolder.getContext();
        var email = context.getAuthentication().getName();

        User user = userRepository.findUserByEmail(email)
                .orElseThrow(() -> new RuntimeException(ErrorCode.EMAIL_NOT_EXISTS.getMessage()));

        HoaDon hoaDon = hoaDonRepository.findById(request.getHoaDonId())
                .orElseThrow(() -> new RuntimeException(ErrorCode.ORDER_NOT_EXISTS.getMessage()));

    boolean exists = phieuTraHangRepository.existsByHoaDon_Id(hoaDon.getId());
        if (exists) {
            throw new AppException(ErrorCode.RETURN_EXISTS);
        }

        if (hoaDon.getTrangThai() != 6 && hoaDon.getTrangThai() != 5) {
            throw new AppException(ErrorCode.INCOMPLETE_ORDER);
        }

        String phieuTraHangCode = "PTH-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        PhieuTraHang phieuTraHang = PhieuTraHang.builder()
                .maPhieuTraHang(phieuTraHangCode)
                .user(user)
                .hoaDon(hoaDon)
                .ngayTao(LocalDateTime.now())
                .hinhThucTra(LoaiHoaDon.TRUC_TUYEN.getName())
                .trangThai(TrangThaiTra.PENDING)
                .ghiChuKhachHang(request.getGhiChuKhachHang())
                .build();

        phieuTraHang = phieuTraHangRepository.save(phieuTraHang);

        List<PhieuTraHangChiTiet> chiTietList = new ArrayList<>();
        int tongSoLuongHoaDon = 0;
        int tongSoLuongTra = 0;
        int tongSoLuongDuyet = 0;

        for (PhieuTraHangChiTietRequest chiTietRequest : request.getChiTietPhieuTraHang()) {
            HoaDonCT hoaDonCT = hoaDonCTRepository.findById(chiTietRequest.getHoaDonChiTietId())
                    .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy chi tiết hóa đơn với ID: " + chiTietRequest.getHoaDonChiTietId()));

            if (!hoaDonCT.getHoaDon().getId().equals(hoaDon.getId())) {
                throw new RuntimeException("Chi tiết hóa đơn với ID " + chiTietRequest.getHoaDonChiTietId() + " không thuộc về hóa đơn " + hoaDon.getId());
            }

            if (chiTietRequest.getSoLuongTra() > hoaDonCT.getSoLuong()) {
                throw new RuntimeException("Số lượng trả cho sản phẩm " + hoaDonCT.getSanPhamCT().getSanPham().getTen() + " vượt quá số lượng mua ban đầu.");
            }

            String chiTietCode = "PTHCT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

            PhieuTraHangChiTiet chiTiet = PhieuTraHangChiTiet.builder()
                    .maPhieuTraHangChiTiet(chiTietCode)
                    .phieuTraHang(phieuTraHang)
                    .hoaDonChiTiet(hoaDonCT)
                    .soLuongTra(chiTietRequest.getSoLuongTra())
                    .lyDoTraHang(chiTietRequest.getLyDoTraHang())
                    .trangThai(TrangThaiTra.PENDING)
                    .build();

            chiTietList.add(chiTiet);

            hoaDonCTRepository.save(hoaDonCT);
        }

        if (!chiTietList.isEmpty()) {
            phieuTraHangChiTietRepository.saveAll(chiTietList);
            phieuTraHang.setChiTietPhieuTraHang(chiTietList);

            hoaDonRepository.save(hoaDon);
        }

        return phieuTraHangMapper.toPhieuTraHangResponse(phieuTraHang);
    }


    public List<PhieuTraHangResponse> getMyOnlineReturns() {
        try {
            var context = SecurityContextHolder.getContext();
            var authentication = context != null ? context.getAuthentication() : null;

            // Trả về danh sách rỗng nếu chưa đăng nhập để tránh 400 từ NPE
            if (authentication == null || !authentication.isAuthenticated()
                    || "anonymousUser".equalsIgnoreCase(String.valueOf(authentication.getName()))) {
                return List.of();
            }

            var email = authentication.getName();
            Integer idUser = userRepository.findIdByEmail(email);
            if (idUser == null) {
                // Không tìm thấy user khớp email trong token -> trả về rỗng thay vì lỗi cứng
                return List.of();
            }

            // Dùng fetch join để lấy đầy đủ chi tiết, tránh lỗi LazyInitialization/NPE khi map DTO
            List<PhieuTraHang> phieuTraHang = phieuTraHangRepository.findByUserIdWithDetails(idUser);
            return phieuTraHang.stream().map(p -> {
                try {
                    return phieuTraHangMapper.toPhieuTraHangResponse(p);
                } catch (Exception ex) {
                    log.error("Mapping lỗi cho phiếu trả hàng {}: {}", p.getId(), ex.getMessage(), ex);
                    return com.example.da_be.dto.response.PhieuTraHangResponse.builder()
                            .id(p.getId())
                            .maPhieuTraHang(p.getMaPhieuTraHang())
                            .trangThai(p.getTrangThai())
                            .ngayTao(p.getNgayTao())
                            .ngayXuLy(p.getNgayXuLy())
                            .build();
                }
            }).toList();
        } catch (Exception e) {
            log.error("Lỗi không phân loại khi lấy phiếu trả hàng của tôi: {}", e.getMessage(), e);
            return List.of();
        }
    }

    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_STAFF')")
    @Transactional
    public PhieuTraHangResponse approveReturn(PhieuTraHangApprovalRequest request) {
        var context = SecurityContextHolder.getContext();
        var staffEmail = context.getAuthentication().getName();

        User user = userRepository.findUserByEmail(staffEmail)
                .orElseThrow(() -> new RuntimeException(ErrorCode.EMAIL_NOT_EXISTS.getMessage()));

        PhieuTraHang phieuTraHang = phieuTraHangRepository.findById(request.getPhieuTraHangId())
                .orElseThrow(() -> new AppException(ErrorCode.RETURN_NOT_EXISTS));

        // Kiểm tra trạng thái trước khi xử lý
        if (phieuTraHang.getTrangThai() == TrangThaiTra.APPROVED) {
            log.info("Phiếu trả hàng {} đã được phê duyệt trước đó, bỏ qua xử lý trùng lặp",
                    phieuTraHang.getMaPhieuTraHang());
            return phieuTraHangMapper.toPhieuTraHangResponse(phieuTraHang);
        }

        // Cập nhật thông tin phiếu
        phieuTraHang.setNhanVienXuLy(user);
        phieuTraHang.setNgayXuLy(LocalDateTime.now());
        phieuTraHang.setGhiChuNhanVien(request.getGhiChuNhanVien());
        phieuTraHang.setTrangThai(TrangThaiTra.APPROVED);

        phieuTraHangRepository.save(phieuTraHang);

        // Tính toán giá hoàn trả cho từng item
        List<PhieuTraHangChiTiet> approvedItems = new ArrayList<>();
        
        // Xử lý chi tiết phiếu
        for (PhieuTraHangChiTietApprovalDetail chiTietRequest : request.getChiTietPheDuyet()) {
            HoaDonCT hoaDonCT = hoaDonCTRepository.findById(chiTietRequest.getHoaDonChiTietId())
                    .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy chi tiết hóa đơn với ID: " +
                            chiTietRequest.getHoaDonChiTietId()));

            PhieuTraHangChiTiet phieuTraHangChiTiet = phieuTraHangChiTietRepository.findById(chiTietRequest.getPhieuTraHangChiTietId())
                    .orElseThrow(() -> new AppException(ErrorCode.RETURN_DETAIL_NOT_EXISTS));

            phieuTraHangChiTiet.setPhieuTraHang(phieuTraHang);
            phieuTraHangChiTiet.setHoaDonChiTiet(hoaDonCT);
            
            // Lưu đơn giá gốc theo đơn vị (hoaDonCT.getGiaBan() là tổng dòng = đơn giá * số lượng)
            BigDecimal unitOriginalPrice = BigDecimal.ZERO;
            if (hoaDonCT.getGiaBan() != null && hoaDonCT.getSoLuong() != null && hoaDonCT.getSoLuong() > 0) {
                unitOriginalPrice = hoaDonCT.getGiaBan()
                        .divide(BigDecimal.valueOf(hoaDonCT.getSoLuong()), 2, RoundingMode.HALF_UP);
            } else if (hoaDonCT.getGiaBan() != null) {
                unitOriginalPrice = hoaDonCT.getGiaBan();
            }
            phieuTraHangChiTiet.setDonGiaGoc(unitOriginalPrice);

            if (chiTietRequest.getSoLuongDuocPheDuyet() == null || chiTietRequest.getSoLuongDuocPheDuyet() <= 0) {
                phieuTraHangChiTiet.setGhiChuNhanVien(chiTietRequest.getLyDoXuLy());
                phieuTraHangChiTiet.setSoLuongPheDuyet(0);
                phieuTraHangChiTiet.setTrangThai(TrangThaiTra.REJECTED);
                phieuTraHangChiTiet.setSoTienHoanTra(BigDecimal.ZERO);
                phieuTraHangChiTiet.setTyLeGiamGia(BigDecimal.ZERO);
            } else {
                phieuTraHangChiTiet.setGhiChuNhanVien(chiTietRequest.getLyDoXuLy());
                phieuTraHangChiTiet.setSoLuongPheDuyet(chiTietRequest.getSoLuongDuocPheDuyet());
                phieuTraHangChiTiet.setTrangThai(TrangThaiTra.APPROVED);
                phieuTraHangChiTiet.setSoLuongNhapKho(chiTietRequest.getSoLuongNhapKho());
                phieuTraHangChiTiet.setSoLuongHong(chiTietRequest.getSoLuongHong());
                hoaDonCT.setTrangThai(8);
                
                // Thêm vào danh sách để tính toán giá hoàn trả
                approvedItems.add(phieuTraHangChiTiet);
            }

            // Nếu có số lượng nhập kho thì cộng lại tồn kho
            if (chiTietRequest.getSoLuongNhapKho() > 0) {
                SanPhamCT spct = hoaDonCT.getSanPhamCT();
                spct.setSoLuong(spct.getSoLuong() + chiTietRequest.getSoLuongNhapKho());
                sanPhamCTRepository.save(spct);
            }

            phieuTraHangChiTietRepository.save(phieuTraHangChiTiet);
        }
        
        // Tính toán giá hoàn trả cho các item được phê duyệt
        if (!approvedItems.isEmpty()) {
            calculateAndUpdateRefundAmounts(phieuTraHang.getHoaDon(), approvedItems);
            
            // Kiểm tra voucher sau khi trả hàng
            boolean voucherStillValid = validateVoucherAfterReturn(phieuTraHang.getHoaDon(), 
                    phieuTraHang.getChiTietPhieuTraHang());
            
            if (!voucherStillValid) {
                log.warn("Voucher không còn hợp lệ sau khi trả hàng cho đơn hàng {}", 
                        phieuTraHang.getHoaDon().getMa());
                // Có thể thêm logic xử lý thêm ở đây nếu cần
            }
        }

        // Làm mới dữ liệu phiếu sau khi lưu chi tiết
        phieuTraHang = phieuTraHangRepository.findById(request.getPhieuTraHangId())
                .orElseThrow(() -> new AppException(ErrorCode.RETURN_NOT_EXISTS));

        HoaDon hoaDon = phieuTraHang.getHoaDon();

        boolean yeuCauTraToanBoSoLuong = phieuTraHang.getChiTietPhieuTraHang().stream()
                .allMatch(ct -> ct.getSoLuongTra().equals(ct.getHoaDonChiTiet().getSoLuong()));

        boolean adminDuyetToanBo = phieuTraHang.getChiTietPhieuTraHang().stream()
                .allMatch(ct -> ct.getSoLuongPheDuyet() != null
                        && ct.getSoLuongPheDuyet().equals(ct.getSoLuongTra()));

        // điều kiện: tổng số chi tiết trong phiếu trả = tổng số chi tiết trong hóa đơn
        boolean traTatCaChiTiet = phieuTraHang.getChiTietPhieuTraHang().size() == hoaDon.getChiTietHoaDon().size();

        // Nếu cả hai đúng → set trạng thái hóa đơn = 8
        if (yeuCauTraToanBoSoLuong && adminDuyetToanBo && traTatCaChiTiet) {
            hoaDon.setTrangThai(8); // 8 = TRẢ HÀNG
            hoaDonRepository.save(hoaDon);
            log.info("Hóa đơn {} đã được cập nhật trạng thái TRẢ HÀNG (8)", hoaDon.getMa());
        }

        // Gửi email xác nhận cho khách hàng
        try {
            String customerEmail = phieuTraHang.getHoaDon().getTaiKhoan().getEmail();
            String subject = "Xác nhận yêu cầu trả hàng của bạn đã được duyệt - " + phieuTraHang.getMaPhieuTraHang();
            String titleEmail = "Yêu cầu trả hàng của bạn đã được duyệt!";
            String emailBody = "<p>Xin chào " + phieuTraHang.getHoaDon().getTaiKhoan().getHoTen() + ",</p>"
                    + "<p>Yêu cầu trả hàng của bạn với mã <strong>" + phieuTraHang.getMaPhieuTraHang() + "</strong> đã được duyệt.</p>"
                    + "<p>Chúng tôi sẽ xử lý yêu cầu của bạn trong thời gian sớm nhất.</p>"
                    + "<p>Cảm ơn bạn đã mua sắm tại cửa hàng của chúng tôi!</p>"
                    + "<p>Trân trọng,</p>"
                    + "<p>Đội ngũ hỗ trợ khách hàng</p>";

            Email emailToSend = new Email(new String[]{customerEmail}, subject, emailBody, titleEmail);
            emailSender.sendEmail(emailToSend);
            log.info("Email xác nhận duyệt trả hàng đã được gửi tới: " + customerEmail);
        } catch (Exception e) {
            log.error("Lỗi khi gửi email xác nhận duyệt trả hàng: " + e.getMessage(), e);
            // Không ném ngoại lệ ở đây để đảm bảo quá trình phê duyệt vẫn hoàn tất
        }
        return phieuTraHangMapper.toPhieuTraHangResponse(phieuTraHang);
    }


    public List<PhieuTraHangResponse> getMyOrdersReturn() {
        try {
            var context = SecurityContextHolder.getContext();
            var authentication = context != null ? context.getAuthentication() : null;

            if (authentication == null || !authentication.isAuthenticated()
                    || "anonymousUser".equalsIgnoreCase(String.valueOf(authentication.getName()))) {
                return List.of();
            }

            var email = authentication.getName();
            Integer idUser = userRepository.findIdByEmail(email);
            if (idUser == null) {
                return List.of();
            }

            List<PhieuTraHang> phieuTraHang = phieuTraHangRepository.findByUserIdWithDetails(idUser);
            return phieuTraHang.stream()
                    .map(p -> {
                        try {
                            return phieuTraHangMapper.toPhieuTraHangResponse(p);
                        } catch (Exception ex) {
                            log.error("Mapping lỗi cho phiếu trả hàng {}: {}", p.getId(), ex.getMessage(), ex);
                            return com.example.da_be.dto.response.PhieuTraHangResponse.builder()
                                    .id(p.getId())
                                    .maPhieuTraHang(p.getMaPhieuTraHang())
                                    .trangThai(p.getTrangThai())
                                    .ngayTao(p.getNgayTao())
                                    .ngayXuLy(p.getNgayXuLy())
                                    .build();
                        }
                    })
                    .toList();
        } catch (Exception e) {
            log.error("Lỗi không phân loại khi lấy phiếu trả theo đơn của tôi: {}", e.getMessage(), e);
            return List.of();
        }
    }

    public PhieuTraHangResponse getByOrderId(Integer orderId) {
        PhieuTraHang phieu = phieuTraHangRepository.findByHoaDonIdWithDetails(orderId);
        if (phieu == null) {
            throw new AppException(ErrorCode.RETURN_NOT_EXISTS);
        }
        return phieuTraHangMapper.toPhieuTraHangResponse(phieu);
    }

    /**
     * Tính số tiền hoàn trả có xét đến voucher đã áp dụng
     */
    public BigDecimal calculateRefundAmount(HoaDon hoaDon, List<PhieuTraHangChiTiet> returnItems) {
        // 1. Tính tổng tiền gốc của các sản phẩm được trả
        BigDecimal totalOriginalAmount = BigDecimal.ZERO;
        BigDecimal totalOrderAmount = BigDecimal.ZERO;
        
        for (PhieuTraHangChiTiet item : returnItems) {
            if (item.getSoLuongPheDuyet() != null && item.getSoLuongPheDuyet() > 0) {
                // Tính đơn giá từ tổng dòng trong hóa đơn (giaBan = đơn giá * số lượng)
                BigDecimal itemPriceTotal = item.getHoaDonChiTiet() != null ? item.getHoaDonChiTiet().getGiaBan() : null;
                Integer soLuongMua = item.getHoaDonChiTiet() != null ? item.getHoaDonChiTiet().getSoLuong() : null;
                BigDecimal unitPrice = BigDecimal.ZERO;
                if (itemPriceTotal != null && soLuongMua != null && soLuongMua > 0) {
                    unitPrice = itemPriceTotal.divide(BigDecimal.valueOf(soLuongMua), 2, RoundingMode.HALF_UP);
                } else if (item.getDonGiaGoc() != null) {
                    unitPrice = item.getDonGiaGoc();
                }
                BigDecimal returnAmount = unitPrice.multiply(BigDecimal.valueOf(item.getSoLuongPheDuyet()));
                totalOriginalAmount = totalOriginalAmount.add(returnAmount);
            }
        }
        
        // 2. Tính tổng tiền gốc của toàn bộ đơn hàng (không bao gồm phí ship)
        for (HoaDonCT chiTiet : hoaDon.getChiTietHoaDon()) {
            if (chiTiet.getGiaBan() == null) continue;
            // giaBan đã là tổng tiền dòng
            totalOrderAmount = totalOrderAmount.add(chiTiet.getGiaBan());
        }
        
        // 3. Tính tỷ lệ hoàn trả
        BigDecimal refundRatio = BigDecimal.ZERO;
        if (totalOrderAmount.compareTo(BigDecimal.ZERO) > 0) {
            refundRatio = totalOriginalAmount.divide(totalOrderAmount, 4, RoundingMode.HALF_UP);
        }
        
        // 4. Xử lý voucher
        BigDecimal refundAmount = totalOriginalAmount;
        PhieuGiamGia voucher = hoaDon.getVoucher();
        
        if (voucher != null) {
            BigDecimal discountAmount = calculateVoucherDiscount(voucher, totalOrderAmount);
            BigDecimal proportionalDiscount = discountAmount.multiply(refundRatio);
            refundAmount = totalOriginalAmount.subtract(proportionalDiscount);
        }
        
        // 5. Đảm bảo số tiền hoàn trả không âm
        return refundAmount.max(BigDecimal.ZERO);
    }
    
    /**
     * Tính số tiền giảm giá từ voucher
     */
    private BigDecimal calculateVoucherDiscount(PhieuGiamGia voucher, BigDecimal orderAmount) {
        if (voucher == null) {
            return BigDecimal.ZERO;
        }
        
        BigDecimal discountAmount = BigDecimal.ZERO;
        
        // KieuGiaTri: 0/1 = phần trăm, 2 = số tiền cố định (đồng bộ với DatHangController)
        if (voucher.getKieuGiaTri() == 1 || voucher.getKieuGiaTri() == 0) {
            // Giảm theo phần trăm
            discountAmount = orderAmount.multiply(BigDecimal.valueOf(voucher.getGiaTri()))
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            
            // Áp dụng giới hạn tối đa nếu có
            if (voucher.getGiaTriMax() != null && voucher.getGiaTriMax() > 0) {
                BigDecimal maxDiscount = BigDecimal.valueOf(voucher.getGiaTriMax());
                discountAmount = discountAmount.min(maxDiscount);
            }
        } else if (voucher.getKieuGiaTri() == 2) {
            // Giảm số tiền cố định
            discountAmount = BigDecimal.valueOf(voucher.getGiaTri());
        }
        
        // Đảm bảo số tiền giảm không vượt quá tổng đơn hàng
        return discountAmount.min(orderAmount);
    }
    
    /**
     * Tính toán và cập nhật số tiền hoàn trả cho từng item
     */
    private void calculateAndUpdateRefundAmounts(HoaDon hoaDon, List<PhieuTraHangChiTiet> approvedItems) {
        // 1. Tính tổng tiền gốc của toàn bộ đơn hàng
        BigDecimal totalOrderAmount = BigDecimal.ZERO;
        for (HoaDonCT chiTiet : hoaDon.getChiTietHoaDon()) {
            if (chiTiet.getGiaBan() == null) continue;
            // giaBan đã là tổng tiền dòng tại thời điểm mua
            totalOrderAmount = totalOrderAmount.add(chiTiet.getGiaBan());
        }
        
        // 2. Tính tổng số tiền giảm giá từ voucher
        PhieuGiamGia voucher = hoaDon.getVoucher();
        BigDecimal totalDiscountAmount = calculateVoucherDiscount(voucher, totalOrderAmount);
        
        // 3. Tính tỷ lệ giảm giá chung
        BigDecimal discountRatio = BigDecimal.ZERO;
        if (totalOrderAmount.compareTo(BigDecimal.ZERO) > 0 && totalDiscountAmount.compareTo(BigDecimal.ZERO) > 0) {
            discountRatio = totalDiscountAmount.divide(totalOrderAmount, 4, RoundingMode.HALF_UP);
        }
        
        // 4. Tính toán và cập nhật cho từng item
        for (PhieuTraHangChiTiet item : approvedItems) {
        // Tính tiền gốc của item được trả từ đơn giá gốc (đơn vị) đã lưu
        BigDecimal unitPrice = item.getDonGiaGoc() != null ? item.getDonGiaGoc() : BigDecimal.ZERO;
        BigDecimal itemOriginalAmount = unitPrice.multiply(BigDecimal.valueOf(item.getSoLuongPheDuyet()));
            
            // Tính số tiền giảm giá tương ứng cho item này
            BigDecimal itemDiscountAmount = itemOriginalAmount.multiply(discountRatio);
            
            // Số tiền hoàn trả thực tế
            BigDecimal refundAmount = itemOriginalAmount.subtract(itemDiscountAmount);
            
            // Cập nhật thông tin
            item.setSoTienHoanTra(refundAmount.max(BigDecimal.ZERO));
            item.setTyLeGiamGia(discountRatio);
            
            // Lưu lại
            phieuTraHangChiTietRepository.save(item);
            
            log.info("Item ID {}: Gốc = {}, Giảm = {}, Hoàn trả = {}", 
                    item.getId(), itemOriginalAmount, itemDiscountAmount, refundAmount);
        }
    }
    
    /**
     * Kiểm tra voucher có còn hợp lệ sau khi trả hàng không
     */
    public boolean validateVoucherAfterReturn(HoaDon hoaDon, List<PhieuTraHangChiTiet> returnItems) {
        PhieuGiamGia voucher = hoaDon.getVoucher();
        if (voucher == null || voucher.getDieuKienNhoNhat() == null) {
            return true; // Không có voucher hoặc không có điều kiện tối thiểu
        }
        
        // Tính tổng tiền còn lại sau khi trả hàng
        BigDecimal remainingAmount = BigDecimal.ZERO;
        
        for (HoaDonCT chiTiet : hoaDon.getChiTietHoaDon()) {
            int returnedQuantity = returnItems.stream()
                    .filter(item -> item.getHoaDonChiTiet().getId().equals(chiTiet.getId()) 
                                  && item.getSoLuongPheDuyet() != null)
                    .mapToInt(item -> item.getSoLuongPheDuyet())
                    .sum();
            
            int remainingQuantity = chiTiet.getSoLuong() - returnedQuantity;
            if (remainingQuantity > 0) {
                // Tính đơn giá từ tổng dòng
                BigDecimal lineTotal = chiTiet.getGiaBan();
                BigDecimal unit = BigDecimal.ZERO;
                if (lineTotal != null && chiTiet.getSoLuong() != null && chiTiet.getSoLuong() > 0) {
                    unit = lineTotal.divide(BigDecimal.valueOf(chiTiet.getSoLuong()), 2, RoundingMode.HALF_UP);
                }
                BigDecimal itemTotalRemaining = unit.multiply(BigDecimal.valueOf(remainingQuantity));
                remainingAmount = remainingAmount.add(itemTotalRemaining);
            }
        }
        
        // Kiểm tra điều kiện tối thiểu
        return remainingAmount.compareTo(BigDecimal.valueOf(voucher.getDieuKienNhoNhat())) >= 0;
    }
    
    /**
     * Tính số tiền hoàn trả cho một phiếu trả hàng cụ thể
     */
    public BigDecimal calculateRefundAmountForPhieu(Integer phieuTraHangId) {
        PhieuTraHang phieuTraHang = phieuTraHangRepository.findById(phieuTraHangId)
                .orElseThrow(() -> new AppException(ErrorCode.RETURN_NOT_EXISTS));
        
        List<PhieuTraHangChiTiet> approvedItems = phieuTraHang.getChiTietPhieuTraHang().stream()
                .filter(item -> item.getTrangThai() == TrangThaiTra.APPROVED 
                              && item.getSoLuongPheDuyet() != null 
                              && item.getSoLuongPheDuyet() > 0)
                .collect(Collectors.toList());
        
        return calculateRefundAmount(phieuTraHang.getHoaDon(), approvedItems);
    }

}