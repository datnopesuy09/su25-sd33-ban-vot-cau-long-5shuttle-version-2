-- Migration script để thêm các cột tính toán giá hoàn trả vào bảng PhieuTraHangCT
-- Thực hiện: [Ngày hiện tại]
-- Mục đích: Fix lỗ hổng tính giá hoàn trả không xét voucher

USE 5shuttle;

-- Thêm các cột mới vào bảng PhieuTraHangCT
ALTER TABLE PhieuTraHangCT 
ADD COLUMN DonGiaGoc DECIMAL(10,2) NULL COMMENT 'Giá gốc của sản phẩm trước khi giảm giá',
ADD COLUMN SoTienHoanTra DECIMAL(10,2) NULL COMMENT 'Số tiền thực tế hoàn trả đã trừ voucher',
ADD COLUMN TyLeGiamGia DECIMAL(5,4) NULL COMMENT 'Tỷ lệ giảm giá từ voucher áp dụng cho item này';

-- Cập nhật dữ liệu có sẵn (nếu có)
-- Đặt DonGiaGoc = DonGia từ HoaDonCT tương ứng
UPDATE PhieuTraHangCT pth
INNER JOIN HoaDonCT hd ON pth.IdHoaDonCT = hd.Id
SET pth.DonGiaGoc = hd.DonGia
WHERE pth.DonGiaGoc IS NULL;

-- Tạm thời đặt SoTienHoanTra = DonGiaGoc * SoLuongPheDuyet cho dữ liệu cũ
-- (sẽ được tính toán lại khi chạy logic mới)
UPDATE PhieuTraHangCT 
SET SoTienHoanTra = DonGiaGoc * COALESCE(SoLuongPheDuyet, 0),
    TyLeGiamGia = 0.0000
WHERE SoTienHoanTra IS NULL AND DonGiaGoc IS NOT NULL;

-- Thêm index để tăng hiệu suất query
CREATE INDEX idx_phieu_tra_hang_ct_don_gia ON PhieuTraHangCT(DonGiaGoc);
CREATE INDEX idx_phieu_tra_hang_ct_so_tien_hoan_tra ON PhieuTraHangCT(SoTienHoanTra);

-- Thêm ràng buộc để đảm bảo dữ liệu hợp lệ
ALTER TABLE PhieuTraHangCT 
ADD CONSTRAINT chk_don_gia_goc_positive CHECK (DonGiaGoc >= 0),
ADD CONSTRAINT chk_so_tien_hoan_tra_positive CHECK (SoTienHoanTra >= 0),
ADD CONSTRAINT chk_ty_le_giam_gia_valid CHECK (TyLeGiamGia >= 0 AND TyLeGiamGia <= 1);

SELECT 'Migration completed successfully!' as status;