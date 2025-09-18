package com.example.da_be.service;

import com.example.da_be.entity.HoaDon;
import com.example.da_be.entity.HoaDonCT;
import com.example.da_be.entity.SanPhamCT;
import com.example.da_be.entity.SuCoVanChuyen;
import com.example.da_be.entity.ThongBao;
import com.example.da_be.repository.HoaDonCTRepository;
import com.example.da_be.repository.SanPhamCTRepository;
import com.example.da_be.repository.ThongBaoRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class KhoHangService {

    private static final Logger log = LoggerFactory.getLogger(KhoHangService.class);

    @Autowired
    private SanPhamCTRepository sanPhamCTRepository;

    @Autowired
    private HoaDonCTRepository hoaDonCTRepository;

    @Autowired
    private ThongBaoRepository thongBaoRepository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    /**
     * Kiểm tra xem đơn hàng đã được hoàn kho chưa (bất kỳ loại nào)
     */
    public boolean isOrderAlreadyRestored(Integer hoaDonId) {
        try {
            String sql = "SELECT COUNT(*) FROM lich_su_hoan_kho WHERE hoa_don_id = ?";
            Integer count = jdbcTemplate.queryForObject(sql, Integer.class, hoaDonId);
            return count != null && count > 0;
        } catch (Exception e) {
            log.error("Lỗi khi kiểm tra lịch sử hoàn kho: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Kiểm tra số lần force restore cho đơn hàng
     */
    public int getForceRestoreCount(Integer hoaDonId) {
        try {
            String sql = "SELECT COUNT(*) FROM lich_su_hoan_kho WHERE hoa_don_id = ? AND loai_hoan_kho = 'FORCE'";
            Integer count = jdbcTemplate.queryForObject(sql, Integer.class, hoaDonId);
            return count != null ? count : 0;
        } catch (Exception e) {
            log.error("Lỗi khi kiểm tra số lần force restore: {}", e.getMessage());
            return 0;
        }
    }

    /**
     * Lưu lịch sử hoàn kho để tracking
     */
    private void saveRestoreHistory(Integer hoaDonId, Integer sanPhamCTId, Integer soLuong, 
                                   String loaiHoanKho, String lyDo, String nguoiThucHien) {
        try {
            String sql = """
                INSERT INTO lich_su_hoan_kho (hoa_don_id, san_pham_ct_id, so_luong_hoan, 
                                            loai_hoan_kho, ly_do, nguoi_thuc_hien) 
                VALUES (?, ?, ?, ?, ?, ?)
                """;
            
            jdbcTemplate.update(sql, hoaDonId, sanPhamCTId, soLuong, loaiHoanKho, lyDo, nguoiThucHien);
            log.info("Đã lưu lịch sử hoàn kho: HoaDon={}, SanPhamCT={}, SoLuong={}, Loai={}", 
                    hoaDonId, sanPhamCTId, soLuong, loaiHoanKho);
            
        } catch (Exception e) {
            log.error("Lỗi khi lưu lịch sử hoàn kho: {}", e.getMessage());
            throw new RuntimeException("Không thể lưu lịch sử hoàn kho: " + e.getMessage());
        }
    }

    /**
     * Kiểm tra tồn kho có đủ số lượng yêu cầu không
     */
    public boolean checkStockAvailability(Integer sanPhamCTId, Integer soLuongYeuCau) {
        try {
            SanPhamCT sanPhamCT = sanPhamCTRepository.findById(sanPhamCTId).orElse(null);
            if (sanPhamCT == null) {
                return false;
            }
            return sanPhamCT.getSoLuong() >= soLuongYeuCau;
        } catch (Exception e) {
            log.error("Lỗi khi kiểm tra tồn kho: {}", e.getMessage(), e);
            return false;
        }
    }

    /**
     * Hoàn kho tự động khi đơn hàng bị hủy (trạng thái = 7)
     * CHỈ THỰC HIỆN 1 LẦN DUY NHẤT để tránh duplicate restoration
     */
    @Transactional
    public void restoreStockOnCancelOrder(HoaDon hoaDon) {
        try {
            log.info("Bắt đầu kiểm tra hoàn kho cho hóa đơn: {}", hoaDon.getMa());

            // KIỂM TRA QUAN TRỌNG: Đã hoàn kho chưa?
            if (isOrderAlreadyRestored(hoaDon.getId())) {
                log.warn("⚠️ CẢNH BÁO: Đơn hàng {} đã được hoàn kho trước đó. Bỏ qua để tránh duplicate!", hoaDon.getMa());
                throw new RuntimeException("Đơn hàng này đã được hoàn kho trước đó!");
            }

            List<HoaDonCT> hoaDonCTList = hoaDonCTRepository.findByHoaDon(hoaDon);
            
            for (HoaDonCT hoaDonCT : hoaDonCTList) {
                SanPhamCT sanPhamCT = hoaDonCT.getSanPhamCT();
                
                // Hoàn lại số lượng đã trừ
                int soLuongHoan = hoaDonCT.getSoLuong();
                int soLuongHienTai = sanPhamCT.getSoLuong();
                int soLuongMoi = soLuongHienTai + soLuongHoan;
                
                sanPhamCT.setSoLuong(soLuongMoi);
                sanPhamCTRepository.save(sanPhamCT);
                
                // Lưu lịch sử hoàn kho AUTO
                saveRestoreHistory(hoaDon.getId(), sanPhamCT.getId(), soLuongHoan, "AUTO", 
                                 "Tự động hoàn kho khi hủy đơn hàng", "SYSTEM");
                
                log.info("✅ Hoàn kho AUTO: {} - Số lượng từ {} thành {}", 
                    sanPhamCT.getSanPham().getTen(), soLuongHienTai, soLuongMoi);
            }

            // Tạo thông báo cho khách hàng
            createCancelNotification(hoaDon);
            
            log.info("✅ Hoàn kho AUTO thành công cho hóa đơn: {}", hoaDon.getMa());
            
        } catch (Exception e) {
            log.error("❌ Lỗi khi hoàn kho cho hóa đơn {}: {}", hoaDon.getMa(), e.getMessage(), e);
            throw new RuntimeException("Lỗi khi hoàn kho: " + e.getMessage());
        }
    }

    /**
     * Hoàn kho thủ công cho admin (chỉ áp dụng cho đơn hàng đã hủy)
     * CHỈ THỰC HIỆN NẾU CHƯA HOÀN KHO TRƯỚC ĐÓ
     */
    @Transactional
    public void manualRestoreStock(HoaDon hoaDon, String adminName) {
        try {
            log.info("Bắt đầu hoàn kho thủ công cho hóa đơn: {} bởi admin: {}", hoaDon.getMa(), adminName);

            // Kiểm tra trạng thái đơn hàng
            if (hoaDon.getTrangThai() != 7) {
                throw new RuntimeException("Chỉ có thể hoàn kho thủ công cho đơn hàng đã hủy!");
            }

            // KIỂM TRA QUAN TRỌNG: Đã hoàn kho chưa?
            if (isOrderAlreadyRestored(hoaDon.getId())) {
                throw new RuntimeException("Đơn hàng này đã được hoàn kho trước đó!");
            }

            List<HoaDonCT> hoaDonCTList = hoaDonCTRepository.findByHoaDon(hoaDon);
            
            for (HoaDonCT hoaDonCT : hoaDonCTList) {
                SanPhamCT sanPhamCT = hoaDonCT.getSanPhamCT();
                
                int soLuongHoan = hoaDonCT.getSoLuong();
                int soLuongHienTai = sanPhamCT.getSoLuong();
                int soLuongMoi = soLuongHienTai + soLuongHoan;
                
                sanPhamCT.setSoLuong(soLuongMoi);
                sanPhamCTRepository.save(sanPhamCT);
                
                // Lưu lịch sử hoàn kho MANUAL
                saveRestoreHistory(hoaDon.getId(), sanPhamCT.getId(), soLuongHoan, "MANUAL", 
                                 "Hoàn kho thủ công bởi admin", adminName);
                
                log.info("✅ Hoàn kho MANUAL: {} - Số lượng từ {} thành {}", 
                        sanPhamCT.getSanPham().getTen(), soLuongHienTai, soLuongMoi);
            }
            
            log.info("✅ Hoàn kho thủ công thành công cho hóa đơn: {}", hoaDon.getMa());
            
        } catch (Exception e) {
            log.error("❌ Lỗi khi hoàn kho thủ công: {}", e.getMessage(), e);
            throw new RuntimeException("Hoàn kho thủ công thất bại: " + e.getMessage());
        }
    }

    /**
     * Force hoàn kho cho admin - CHỈ 1 LẦN DUY NHẤT
     * Chỉ sử dụng trong trường hợp đặc biệt và có lý do rõ ràng
     */
    @Transactional
    public void forceRestoreStock(HoaDon hoaDon, String reason, String adminName) {
        try {
            log.warn("🚨 Bắt đầu FORCE RESTORE cho hóa đơn: {} bởi admin: {}", hoaDon.getMa(), adminName);

            // KIỂM TRA NGHIÊM NGẶT: Số lần force restore
            int forceCount = getForceRestoreCount(hoaDon.getId());
            if (forceCount >= 1) {
                throw new RuntimeException("🚫 ĐÃ ĐẠT GIỚI HẠN: Chỉ được Force Hoàn Kho 1 lần duy nhất cho mỗi đơn hàng!");
            }

            // Kiểm tra lý do
            if (reason == null || reason.trim().isEmpty()) {
                throw new RuntimeException("Lý do force restore là bắt buộc!");
            }

            List<HoaDonCT> hoaDonCTList = hoaDonCTRepository.findByHoaDon(hoaDon);
            
            for (HoaDonCT hoaDonCT : hoaDonCTList) {
                SanPhamCT sanPhamCT = hoaDonCT.getSanPhamCT();
                
                int soLuongHoan = hoaDonCT.getSoLuong();
                int soLuongHienTai = sanPhamCT.getSoLuong();
                int soLuongMoi = soLuongHienTai + soLuongHoan;
                
                sanPhamCT.setSoLuong(soLuongMoi);
                sanPhamCTRepository.save(sanPhamCT);
                
                // Lưu lịch sử hoàn kho FORCE với lý do
                saveRestoreHistory(hoaDon.getId(), sanPhamCT.getId(), soLuongHoan, "FORCE", 
                                 reason, adminName);
                
                log.warn("⚠️ FORCE RESTORE: {} - Số lượng từ {} thành {} - Lý do: {}", 
                        sanPhamCT.getSanPham().getTen(), soLuongHienTai, soLuongMoi, reason);
            }
            
            log.warn("⚠️ FORCE RESTORE HOÀN THÀNH cho hóa đơn: {} - Lý do: {}", hoaDon.getMa(), reason);
            
        } catch (Exception e) {
            log.error("❌ Lỗi khi force hoàn kho: {}", e.getMessage(), e);
            throw new RuntimeException("Force hoàn kho thất bại: " + e.getMessage());
        }
    }
    /**
     * Tạo thông báo khi hủy đơn hàng
     */
    private void createCancelNotification(HoaDon hoaDon) {
        try {
            if (hoaDon.getTaiKhoan() != null) {
                ThongBao thongBao = new ThongBao();
                thongBao.setKhachHang(hoaDon.getTaiKhoan());
                thongBao.setTieuDe("Đơn hàng đã hủy");
                thongBao.setNoiDung("Đơn hàng #" + hoaDon.getMa() + " đã được hủy và số lượng sản phẩm đã được hoàn về kho.");
                thongBao.setTrangThai(1);
                thongBaoRepository.save(thongBao);
                
                log.info("Đã tạo thông báo hủy đơn hàng cho khách hàng: {}", hoaDon.getTaiKhoan().getEmail());
            }
        } catch (Exception e) {
            log.error("Lỗi khi tạo thông báo hủy đơn hàng: {}", e.getMessage(), e);
        }
    }

    /**
     * Hoàn kho khi trả hàng
     */
    @Transactional
    public void restoreStockOnReturn(HoaDonCT hoaDonCT, Integer soLuongTra) {
        try {
            log.info("Bắt đầu hoàn kho do trả hàng - HoaDonCT ID: {}, Số lượng trả: {}", 
                    hoaDonCT.getId(), soLuongTra);

            SanPhamCT sanPhamCT = hoaDonCT.getSanPhamCT();
            int soLuongHienTai = sanPhamCT.getSoLuong();
            int soLuongMoi = soLuongHienTai + soLuongTra;
            
            sanPhamCT.setSoLuong(soLuongMoi);
            sanPhamCTRepository.save(sanPhamCT);
            
            log.info("Hoàn kho do trả hàng: {} - Số lượng từ {} thành {}", 
                    sanPhamCT.getSanPham().getTen(), soLuongHienTai, soLuongMoi);
            
        } catch (Exception e) {
            log.error("Lỗi khi hoàn kho do trả hàng: {}", e.getMessage(), e);
            throw new RuntimeException("Lỗi khi hoàn kho do trả hàng: " + e.getMessage());
        }
    }

    /**
     * Hoàn kho cho một sản phẩm cụ thể (dùng cho sự cố vận chuyển)
     */
    @Transactional
    public void restoreStock(Integer sanPhamCTId, Integer soLuongHoan) {
        try {
            log.info("Bắt đầu hoàn kho cho sản phẩm ID: {}, Số lượng: {}", sanPhamCTId, soLuongHoan);

            SanPhamCT sanPhamCT = sanPhamCTRepository.findById(sanPhamCTId)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm với ID: " + sanPhamCTId));

            int soLuongHienTai = sanPhamCT.getSoLuong();
            int soLuongMoi = soLuongHienTai + soLuongHoan;

            sanPhamCT.setSoLuong(soLuongMoi);
            sanPhamCTRepository.save(sanPhamCT);

            log.info("Hoàn kho thành công cho sản phẩm: {} - Số lượng từ {} thành {}", 
                    sanPhamCT.getSanPham().getTen(), soLuongHienTai, soLuongMoi);

        } catch (Exception e) {
            log.error("Lỗi khi hoàn kho cho sản phẩm ID {}: {}", sanPhamCTId, e.getMessage(), e);
            throw new RuntimeException("Lỗi khi hoàn kho: " + e.getMessage());
        }
    }

    /**
     * Ghi nhận hàng không thể hoàn kho (hỏng/mất/sự cố) thay vì hoàn kho bình thường
     * Để tracking cho mục đích kiểm toán và bảo hiểm
     */
    @Transactional
    public void recordDamagedOrLostStock(HoaDon hoaDon, SuCoVanChuyen.LoaiSuCo loaiSuCo, String reason) {
        try {
            log.info("Ghi nhận hàng hỏng/mất cho đơn hàng: {} - Loại: {} - Lý do: {}", 
                    hoaDon.getMa(), loaiSuCo, reason);

            List<HoaDonCT> hoaDonCTList = hoaDonCTRepository.findByHoaDon(hoaDon);
            
            for (HoaDonCT hoaDonCT : hoaDonCTList) {
                SanPhamCT sanPhamCT = hoaDonCT.getSanPhamCT();
                Integer soLuongMat = hoaDonCT.getSoLuong();
                
                // Ghi log kho hàng hỏng/mất cho tracking
                String logSql = "INSERT INTO lich_su_hoan_kho (hoa_don_id, san_pham_ct_id, so_luong_hoan, " +
                               "loai_hoan_kho, ly_do, ngay_tao, trang_thai) VALUES (?, ?, ?, ?, ?, NOW(), ?)";
                
                // Xác định loại ghi nhận dựa trên sự cố
                String loaiHoanKho;
                switch (loaiSuCo) {
                    case HANG_BI_HONG:
                        loaiHoanKho = "HANG_BI_HONG";
                        break;
                    case HANG_BI_MAT:
                        loaiHoanKho = "HANG_BI_MAT";
                        break;
                    case SU_CO_VAN_CHUYEN:
                        loaiHoanKho = "SU_CO_VAN_CHUYEN";
                        break;
                    case KHAC:
                        loaiHoanKho = "SU_CO_KHAC";
                        break;
                    default:
                        loaiHoanKho = "KHONG_HOAN_KHO";
                        break;
                }
                
                String lyDo = String.format("Sự cố: %s - %s - Số lượng: %d - KHÔNG HOÀN KHO", loaiSuCo, reason, soLuongMat);
                
                jdbcTemplate.update(logSql, 
                    hoaDon.getId(), 
                    sanPhamCT.getId(), 
                    soLuongMat,
                    loaiHoanKho, 
                    lyDo, 
                    "RECORDED" // Chỉ ghi nhận, không hoàn kho
                );
                
                log.info("Đã ghi nhận {} {} sản phẩm '{}' (ID: {}) - KHÔNG HOÀN KHO do: {}", 
                        soLuongMat, loaiHoanKho, sanPhamCT.getSanPham().getTen(), sanPhamCT.getId(), loaiSuCo);
            }

            // Tạo thông báo nội bộ về hàng hỏng/mất để xử lý bảo hiểm
            try {
                ThongBao internalNotice = new ThongBao();
                internalNotice.setTieuDe("Báo cáo sự cố không hoàn kho - Cần xử lý bồi thường");
                internalNotice.setNoiDung(String.format(
                    "Đơn hàng #%s: %s - %s. Hàng hóa KHÔNG được hoàn kho do sự cố. Cần liên hệ đơn vị vận chuyển để bồi thường.",
                    hoaDon.getMa(), loaiSuCo, reason
                ));
                internalNotice.setTrangThai(0); // Chưa đọc
                thongBaoRepository.save(internalNotice);
                
                log.info("Đã tạo thông báo nội bộ về hàng hỏng/mất cho đơn hàng {}", hoaDon.getMa());
            } catch (Exception e) {
                log.warn("Không thể tạo thông báo nội bộ: {}", e.getMessage());
            }

        } catch (Exception e) {
            log.error("Lỗi khi ghi nhận hàng hỏng/mất cho đơn hàng {}: {}", hoaDon.getMa(), e.getMessage(), e);
            throw new RuntimeException("Lỗi khi ghi nhận hàng hỏng/mất: " + e.getMessage());
        }
    }

    /**
     * Đặt trước kho (reserve stock) khi đặt hàng
     */
    @Transactional
    public void reserveStock(HoaDon hoaDon, List<HoaDonCT> hoaDonCTList) {
        try {
            log.info("Bắt đầu đặt trước kho cho hóa đơn: {}", hoaDon.getMa());

            for (HoaDonCT hoaDonCT : hoaDonCTList) {
                SanPhamCT sanPhamCT = hoaDonCT.getSanPhamCT();
                int soLuongDat = hoaDonCT.getSoLuong();
                int soLuongHienTai = sanPhamCT.getSoLuong();
                
                if (soLuongHienTai < soLuongDat) {
                    throw new RuntimeException("Không đủ hàng trong kho cho sản phẩm: " + 
                                             sanPhamCT.getSanPham().getTen());
                }
                
                int soLuongMoi = soLuongHienTai - soLuongDat;
                sanPhamCT.setSoLuong(soLuongMoi);
                sanPhamCTRepository.save(sanPhamCT);
                
                log.info("Đặt trước kho: {} - Số lượng từ {} thành {}", 
                        sanPhamCT.getSanPham().getTen(), soLuongHienTai, soLuongMoi);
            }
            
            log.info("Đặt trước kho thành công cho hóa đơn: {}", hoaDon.getMa());
            
        } catch (Exception e) {
            log.error("Lỗi khi đặt trước kho cho hóa đơn {}: {}", hoaDon.getMa(), e.getMessage(), e);
            throw new RuntimeException("Lỗi khi đặt trước kho: " + e.getMessage());
        }
    }
}
