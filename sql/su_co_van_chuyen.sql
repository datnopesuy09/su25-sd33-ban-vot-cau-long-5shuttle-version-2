-- Tạo bảng sự cố vận chuyển
CREATE TABLE SuCoVanChuyen (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    IdHoaDon INT NOT NULL,
    LoaiSuCo NVARCHAR(50) NOT NULL COMMENT 'KHONG_NHAN_HANG, CHUA_NHAN_HANG, HANG_BI_MAT, HANG_BI_HONG, SU_CO_VAN_CHUYEN, KHAC',
    MoTa TEXT NOT NULL COMMENT 'Mô tả chi tiết sự cố',
    DiaDiem NVARCHAR(255) COMMENT 'Địa điểm xảy ra sự cố', 
    NgayXayRa DATETIME NOT NULL COMMENT 'Thời gian xảy ra sự cố',
    NguoiBaoCao INT NOT NULL COMMENT 'ID admin báo cáo sự cố',
    TrangThai INT DEFAULT 0 COMMENT '0: Đang xử lý, 1: Đã giải quyết, 2: Không thể giải quyết',
    GhiChu TEXT COMMENT 'Ghi chú thêm về sự cố',
    HinhAnh TEXT COMMENT 'Danh sách URL hình ảnh minh chứng, phân cách bằng dấu phẩy',
    NgayTao DATETIME DEFAULT CURRENT_TIMESTAMP,
    NgayCapNhat DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Ràng buộc khóa ngoại
    FOREIGN KEY (IdHoaDon) REFERENCES HoaDon(Id) ON DELETE CASCADE,
    FOREIGN KEY (NguoiBaoCao) REFERENCES User(Id),
    
    -- Index để tăng hiệu suất truy vấn
    INDEX idx_hoa_don_id (IdHoaDon),
    INDEX idx_loai_su_co (LoaiSuCo),
    INDEX idx_trang_thai (TrangThai),
    INDEX idx_ngay_xay_ra (NgayXayRa)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Bảng lưu trữ thông tin sự cố vận chuyển';

-- Thêm một số ràng buộc kiểm tra
ALTER TABLE SuCoVanChuyen 
ADD CONSTRAINT chk_loai_su_co 
CHECK (LoaiSuCo IN ('KHONG_NHAN_HANG', 'CHUA_NHAN_HANG', 'HANG_BI_MAT', 'HANG_BI_HONG', 'SU_CO_VAN_CHUYEN', 'KHAC'));

ALTER TABLE SuCoVanChuyen 
ADD CONSTRAINT chk_trang_thai 
CHECK (TrangThai IN (0, 1, 2));

-- Tạo bảng chi tiết xử lý sự cố (tùy chọn - để theo dõi quá trình xử lý)
CREATE TABLE ChiTietXuLySuCo (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    IdSuCo INT NOT NULL,
    NguoiXuLy INT NOT NULL COMMENT 'ID admin xử lý',
    HanhDong NVARCHAR(255) NOT NULL COMMENT 'Hành động thực hiện',
    MoTa TEXT COMMENT 'Mô tả chi tiết hành động',
    NgayXuLy DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (IdSuCo) REFERENCES SuCoVanChuyen(Id) ON DELETE CASCADE,
    FOREIGN KEY (NguoiXuLy) REFERENCES User(Id),
    
    INDEX idx_su_co_id (IdSuCo),
    INDEX idx_nguoi_xu_ly (NguoiXuLy),
    INDEX idx_ngay_xu_ly (NgayXuLy)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Bảng lưu trữ chi tiết quá trình xử lý sự cố';

-- Tạo view để dễ dàng truy vấn thông tin sự cố kèm thông tin hóa đơn
CREATE VIEW v_SuCoVanChuyen AS
SELECT 
    sc.Id,
    sc.IdHoaDon,
    hd.Ma as MaHoaDon,
    sc.LoaiSuCo,
    sc.MoTa,
    sc.DiaDiem,
    sc.NgayXayRa,
    sc.NguoiBaoCao,
    u.HoTen as TenNguoiBaoCao,
    sc.TrangThai,
    CASE 
        WHEN sc.TrangThai = 0 THEN 'Đang xử lý'
        WHEN sc.TrangThai = 1 THEN 'Đã giải quyết'
        WHEN sc.TrangThai = 2 THEN 'Không thể giải quyết'
        ELSE 'Không xác định'
    END as TenTrangThai,
    sc.GhiChu,
    sc.HinhAnh,
    sc.NgayTao,
    sc.NgayCapNhat,
    hd.TenNguoiNhan,
    hd.SdtNguoiNhan,
    hd.DiaChiNguoiNhan
FROM SuCoVanChuyen sc
JOIN HoaDon hd ON sc.IdHoaDon = hd.Id
JOIN User u ON sc.NguoiBaoCao = u.Id;

-- Thêm một số dữ liệu mẫu (tùy chọn)
/*
INSERT INTO SuCoVanChuyen (IdHoaDon, LoaiSuCo, MoTa, DiaDiem, NgayXayRa, NguoiBaoCao, TrangThai, GhiChu) 
VALUES 
(1, 'HANG_BI_MAT', 'Hàng bị thất lạc trong quá trình vận chuyển từ kho đến địa chỉ giao hàng', 'Quận 1, TP.HCM', NOW(), 1, 0, 'Đã liên hệ đơn vị vận chuyển để tìm kiếm'),
(1, 'KHONG_NHAN_HANG', 'Khách hàng từ chối nhận hàng vì không liên lạc được', 'Quận 7, TP.HCM', NOW(), 1, 1, 'Đã hoàn trả hàng về kho'),
(1, 'HANG_BI_HONG', 'Hàng bị vỡ trong quá trình vận chuyển', 'Quận Tân Bình, TP.HCM', NOW(), 1, 0, 'Đang xử lý bồi thường với đơn vị vận chuyển');
*/
