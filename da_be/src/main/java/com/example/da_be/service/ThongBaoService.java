package com.example.da_be.service;

import com.example.da_be.dto.InternalNotificationRequest;
import com.example.da_be.dto.InternalNotificationResponse;
import com.example.da_be.entity.ThongBao;
import com.example.da_be.repository.ThongBaoRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class ThongBaoService {

    private static final Logger log = LoggerFactory.getLogger(ThongBaoService.class);

    @Autowired
    private ThongBaoRepository thongBaoRepository;

    // Lấy danh sách tất cả thông báo
    public List<ThongBao> getAllThongBao() {
        return thongBaoRepository.findAll();
    }

    // Lấy thông báo theo ID
    public ThongBao getThongBaoById(int id) {
        Optional<ThongBao> thongBao = thongBaoRepository.findById(id);
        if (thongBao.isPresent()) {
            return thongBao.get();
        } else {
            throw new RuntimeException("Không tìm thấy thông báo với ID: " + id);
        }
    }

    // Lưu hoặc cập nhật thông báo
    public ThongBao saveOrUpdateThongBao(ThongBao thongBao) {
        // Validation cho thông báo mới
        if (thongBao.getId() == null) {
            if (thongBao.getTieuDe() == null || thongBao.getTieuDe().trim().isEmpty()) {
                throw new IllegalArgumentException("Tiêu đề thông báo không được để trống");
            }
            if (thongBao.getNoiDung() == null || thongBao.getNoiDung().trim().isEmpty()) {
                throw new IllegalArgumentException("Nội dung thông báo không được để trống");
            }
            if (thongBao.getKhachHang() != null && thongBao.getKhachHang().getId() == null) {
                throw new IllegalArgumentException("ID khách hàng không được để trống");
            }
        }
        
        return thongBaoRepository.save(thongBao);
    }

    // Phương thức riêng để cập nhật trạng thái thông báo
    public ThongBao updateTrangThaiThongBao(int id, Integer trangThai) {
        ThongBao existingThongBao = getThongBaoById(id);
        existingThongBao.setTrangThai(trangThai);
        existingThongBao.setUpdatedAt(LocalDateTime.now());
        return thongBaoRepository.save(existingThongBao);
    }

    // Xóa thông báo theo ID
    public void deleteThongBaoById(int id) {
        if (!thongBaoRepository.existsById(id)) {
            throw new RuntimeException("Không tìm thấy thông báo với ID: " + id);
        }
        thongBaoRepository.deleteById(id);
    }

    // Lấy danh sách thông báo theo idKhachHang (sắp xếp theo thời gian tạo giảm dần)
    public List<ThongBao> getThongBaoByKhachHang(int idKhachHang) {
        return thongBaoRepository.findByKhachHangIdOrderByCreatedAtDesc(idKhachHang);
    }

    /**
     * Tạo thông báo nội bộ cho admin/nhân viên về các sự kiện quan trọng
     */
    public InternalNotificationResponse createInternalNotification(InternalNotificationRequest request) {
        // 1. Validation
        if (request.getTieuDe() == null || request.getTieuDe().trim().isEmpty()) {
            throw new IllegalArgumentException("Tiêu đề thông báo nội bộ không được để trống");
        }
        if (request.getNoiDung() == null || request.getNoiDung().trim().isEmpty()) {
            throw new IllegalArgumentException("Nội dung thông báo nội bộ không được để trống");
        }

        // 2. Tạo notification ID
        String notificationId = "INT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        // 3. Tạo thông báo nội bộ
        ThongBao internalNotification = new ThongBao();
        internalNotification.setTieuDe(request.getTieuDe());
        internalNotification.setNoiDung(request.getNoiDung());
        internalNotification.setTrangThai(0); // Chưa đọc
        // Không set khachHang vì đây là thông báo nội bộ

        // 4. Xử lý metadata nếu có
        if (request.getMetadata() != null && !request.getMetadata().isEmpty()) {
            // Có thể lưu metadata vào một field riêng hoặc append vào noiDung
            StringBuilder metadataStr = new StringBuilder("\n--- Metadata ---\n");
            request.getMetadata().forEach((key, value) -> 
                metadataStr.append(key).append(": ").append(value).append("\n"));
            
            internalNotification.setNoiDung(
                internalNotification.getNoiDung() + metadataStr.toString()
            );
        }

        // 5. Lưu thông báo
        ThongBao savedNotification = thongBaoRepository.save(internalNotification);

        // 6. Log cho mục đích audit
        log.info("Tạo thông báo nội bộ: {} - {} - Loại: {} - Độ ưu tiên: {}", 
                notificationId, request.getTieuDe(), request.getLoai(), request.getSeverity());

        // 7. Xử lý độ ưu tiên cao
        if ("HIGH".equals(request.getSeverity())) {
            log.warn("THÔNG BÁO NỘI BỘ ĐỘ ÊU TIÊN CAO: {} - {}", 
                    notificationId, request.getTieuDe());
            
            // TODO: Có thể thêm logic gửi email/SMS cho admin ngay lập tức
            // hoặc tích hợp với hệ thống alerting
        }

        // 8. Xử lý yêu cầu hành động
        if (Boolean.TRUE.equals(request.getRequiresAction())) {
            log.info("Thông báo nội bộ {} yêu cầu hành động từ admin", notificationId);
            
            // TODO: Có thể tạo task trong hệ thống quản lý công việc
            // hoặc gửi thông báo đến các admin đang online
        }

        return new InternalNotificationResponse(
                "CREATED",
                notificationId,
                "Thông báo nội bộ đã được tạo thành công"
        );
    }
}
