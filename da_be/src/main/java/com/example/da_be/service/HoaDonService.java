package com.example.da_be.service;

import com.example.da_be.dto.UpdateDeliveryInfoRequest;
import com.example.da_be.entity.HoaDon;
import com.example.da_be.entity.PhieuGiamGia;
import com.example.da_be.entity.ThongBao;
import com.example.da_be.exception.ResourceNotFoundException;
import com.example.da_be.repository.HoaDonRepository;
import com.example.da_be.repository.ThongBaoRepository;
import com.example.da_be.repository.VoucherRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Date;
import java.util.List;

@Service
public class HoaDonService {

    private static final Logger log = LoggerFactory.getLogger(HoaDonService.class);

    @Autowired
    private HoaDonRepository hoaDonRepository;
    @Autowired
    private VoucherRepository voucherRepository;
    @Autowired
    private ThongBaoRepository thongBaoRepository;
    @Autowired
    private KhoHangService khoHangService;

    public List<HoaDon> getAllHoaDon() {
        return hoaDonRepository.findAll();
    }

    public HoaDon getHoaDonById(int id) {
        return hoaDonRepository.findById(id).orElse(null);
    }

    public HoaDon saveOrUpdateHoaDon(HoaDon hoaDon) {
        return hoaDonRepository.save(hoaDon);
    }

    public void deleteHoaDonById(int id) {
        hoaDonRepository.deleteById(id);
    }


    @Transactional
    public HoaDon updateHoaDonStatus(int id, int newStatus) {
        HoaDon hoaDon = hoaDonRepository.findById(id).orElse(null);
        if (hoaDon != null) {
            int oldStatus = hoaDon.getTrangThai();
            hoaDon.setTrangThai(newStatus);
            
            // Xử lý hoàn kho khi hủy đơn hàng
            if (newStatus == 7 && oldStatus != 7) { // Trạng thái 7 = Đã hủy
                try {
                    khoHangService.restoreStockOnCancelOrder(hoaDon);
                    log.info("Đã hoàn kho thành công cho đơn hàng bị hủy: {}", hoaDon.getMa());
                } catch (Exception e) {
                    log.error("Lỗi khi hoàn kho cho đơn hàng bị hủy: {} - {}", hoaDon.getMa(), e.getMessage());
                    // Không ném exception để không làm gián đoạn flow chính
                    // Có thể thông báo cho admin để xử lý thủ công
                }
            }
            
            return hoaDonRepository.save(hoaDon);
        }
        return null;
    }

    @Transactional
    public HoaDon xacNhanThanhToan(Integer idHoaDon, BigDecimal tongTien,
                                   BigDecimal khachThanhToan, Integer idVoucher,
                                   String phuongThucThanhToan) {
        // 1. Kiểm tra hóa đơn tồn tại
        HoaDon hoaDon = hoaDonRepository.findById(idHoaDon)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy hóa đơn"));

        // 2. Kiểm tra số tiền thanh toán hợp lệ
        if (khachThanhToan.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Số tiền thanh toán phải lớn hơn 0");
        }

        // 3. Xử lý voucher nếu có
        if (idVoucher != null) {
            PhieuGiamGia voucher = voucherRepository.findById(idVoucher)
                    .orElseThrow(() -> new ResourceNotFoundException("Voucher không tồn tại"));

            // Thực hiện áp dụng voucher (tuỳ logic giảm giá của bạn)
            // Ví dụ: tongTien = tongTien - voucher.getGiaTri();
            hoaDon.setVoucher(voucher);

        }

        // 4. Cập nhật thông tin hóa đơn
        hoaDon.setTongTien(tongTien);
        hoaDon.setPhuongThucThanhToan(phuongThucThanhToan);
        hoaDon.setTrangThai(6); // 6 = Đã thanh toán
        hoaDon.setNgaySua(new Date());

        // 5. Lưu hóa đơn
        HoaDon updatedHoaDon = hoaDonRepository.save(hoaDon);

        // 6. Tạo thông báo cho khách hàng
        ThongBao thongBao = new ThongBao();
        thongBao.setKhachHang(hoaDon.getTaiKhoan());
        thongBao.setTieuDe("Thanh toán thành công");
        thongBao.setNoiDung("Hóa đơn #" + hoaDon.getMa() + " đã được thanh toán");
        thongBao.setTrangThai(1);
        thongBaoRepository.save(thongBao);

        return updatedHoaDon;
    }

    @Transactional
    public HoaDon updateDeliveryInfo(Integer idHoaDon, UpdateDeliveryInfoRequest request) {
        HoaDon hoaDon = hoaDonRepository.findById(idHoaDon)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy hóa đơn"));

        // Cập nhật thông tin giao hàng
        if (request.getTenNguoiNhan() != null) {
            hoaDon.setTenNguoiNhan(request.getTenNguoiNhan());
        }
        if (request.getSdtNguoiNhan() != null) {
            hoaDon.setSdtNguoiNhan(request.getSdtNguoiNhan());
        }
        if (request.getDiaChiNguoiNhan() != null) {
            hoaDon.setDiaChiNguoiNhan(request.getDiaChiNguoiNhan());
        }

        hoaDon.setNgaySua(new Date());
        return hoaDonRepository.save(hoaDon);
    }

}
