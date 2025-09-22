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

        boolean exists = phieuTraHangRepository.existsByHoaDonId((hoaDon.getId()));
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
        var context = SecurityContextHolder.getContext();
        var email = context.getAuthentication().getName();

        Integer idUser = userRepository.findIdByEmail(email);

        List<PhieuTraHang> phieuTraHang = phieuTraHangRepository.findByUserId(idUser);
        return phieuTraHang.stream().map(phieuTraHangMapper::toPhieuTraHangResponse).toList();
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

        // Xử lý chi tiết phiếu
        for (PhieuTraHangChiTietApprovalDetail chiTietRequest : request.getChiTietPheDuyet()) {
            HoaDonCT hoaDonCT = hoaDonCTRepository.findById(chiTietRequest.getHoaDonChiTietId())
                    .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy chi tiết hóa đơn với ID: " +
                            chiTietRequest.getHoaDonChiTietId()));

            PhieuTraHangChiTiet phieuTraHangChiTiet = phieuTraHangChiTietRepository.findById(chiTietRequest.getPhieuTraHangChiTietId())
                    .orElseThrow(() -> new AppException(ErrorCode.RETURN_DETAIL_NOT_EXISTS));

            phieuTraHangChiTiet.setPhieuTraHang(phieuTraHang);
            phieuTraHangChiTiet.setHoaDonChiTiet(hoaDonCT);

            if (chiTietRequest.getSoLuongDuocPheDuyet() == null || chiTietRequest.getSoLuongDuocPheDuyet() <= 0) {
                phieuTraHangChiTiet.setGhiChuNhanVien(chiTietRequest.getLyDoXuLy());
                phieuTraHangChiTiet.setSoLuongPheDuyet(0);
                phieuTraHangChiTiet.setTrangThai(TrangThaiTra.REJECTED);
            } else {
                phieuTraHangChiTiet.setGhiChuNhanVien(chiTietRequest.getLyDoXuLy());
                phieuTraHangChiTiet.setSoLuongPheDuyet(chiTietRequest.getSoLuongDuocPheDuyet());
                phieuTraHangChiTiet.setTrangThai(TrangThaiTra.APPROVED);
                phieuTraHangChiTiet.setSoLuongNhapKho(chiTietRequest.getSoLuongNhapKho());
                phieuTraHangChiTiet.setSoLuongHong(chiTietRequest.getSoLuongHong());
                hoaDonCT.setTrangThai(8);
            }

            // Nếu có số lượng nhập kho thì cộng lại tồn kho
            if (chiTietRequest.getSoLuongNhapKho() > 0) {
                SanPhamCT spct = hoaDonCT.getSanPhamCT();
                spct.setSoLuong(spct.getSoLuong() + chiTietRequest.getSoLuongNhapKho());
                sanPhamCTRepository.save(spct);
            }

            phieuTraHangChiTietRepository.save(phieuTraHangChiTiet);
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
        var context = SecurityContextHolder.getContext();
        var email = context.getAuthentication().getName();

        Integer idUser = userRepository.findIdByEmail(email);

        List<PhieuTraHang> phieuTraHang = phieuTraHangRepository.findByUserIdWithDetails(idUser);
        return phieuTraHang.stream()
                .map(phieuTraHangMapper::toPhieuTraHangResponse)
                .toList();
    }

    public PhieuTraHangResponse getByOrderId(Integer orderId) {
        PhieuTraHang phieu = phieuTraHangRepository.findByHoaDonIdWithDetails(orderId);
        if (phieu == null) {
            throw new AppException(ErrorCode.RETURN_NOT_EXISTS);
        }
        return phieuTraHangMapper.toPhieuTraHangResponse(phieu);
    }

}