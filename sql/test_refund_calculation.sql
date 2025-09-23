-- Test script để kiểm tra logic tính giá hoàn trả có xét voucher
-- Thực hiện: [Ngày hiện tại]
-- Mục đích: Validate các fix đã được implement

USE 5shuttle;

-- Test Case 1: Đơn hàng không có voucher
-- Tạo đơn hàng test
INSERT INTO HoaDon (Ma, IdUser, TongTien, TrangThai, NgayTao, LoaiHoaDon, PhuongThucThanhToan)
VALUES ('TEST-001', 1, 1000000, 6, NOW(), 'TRUC_TUYEN', 'VNPAY');

SET @test_order_id = LAST_INSERT_ID();

-- Thêm chi tiết đơn hàng
INSERT INTO HoaDonCT (IdHoaDon, IdSanPhamCT, SoLuong, DonGia, TrangThai)
VALUES 
(@test_order_id, 1, 2, 250000, 1),  -- 2 sản phẩm * 250,000 = 500,000
(@test_order_id, 2, 1, 500000, 1);  -- 1 sản phẩm * 500,000 = 500,000
                                     -- Tổng: 1,000,000

-- Test Case 2: Đơn hàng có voucher giảm 10%
INSERT INTO PhieuGiamGia (Ma, Ten, GiaTri, GiaTriMax, KieuGiaTri, DieuKienNhoNhat, TrangThai, NgayBatDau, NgayKetThuc)
VALUES ('VOUCHER10', 'Giảm 10%', 10, 100000, 1, 500000, 1, '2024-01-01 00:00:00', '2024-12-31 23:59:59');

SET @voucher_id = LAST_INSERT_ID();

INSERT INTO HoaDon (Ma, IdUser, IdVoucher, TongTien, TrangThai, NgayTao, LoaiHoaDon, PhuongThucThanhToan)
VALUES ('TEST-002', 1, @voucher_id, 900000, 6, NOW(), 'TRUC_TUYEN', 'VNPAY'); -- 1,000,000 - 100,000 (max discount)

SET @test_order_id_2 = LAST_INSERT_ID();

INSERT INTO HoaDonCT (IdHoaDon, IdSanPhamCT, SoLuong, DonGia, TrangThai)
VALUES 
(@test_order_id_2, 1, 2, 250000, 1),
(@test_order_id_2, 2, 1, 500000, 1);

-- Test Case 3: Voucher số tiền cố định
INSERT INTO PhieuGiamGia (Ma, Ten, GiaTri, KieuGiaTri, DieuKienNhoNhat, TrangThai, NgayBatDau, NgayKetThuc)
VALUES ('VOUCHER50K', 'Giảm 50K', 50000, 2, 300000, 1, '2024-01-01 00:00:00', '2024-12-31 23:59:59');

SET @voucher_id_2 = LAST_INSERT_ID();

INSERT INTO HoaDon (Ma, IdUser, IdVoucher, TongTien, TrangThai, NgayTao, LoaiHoaDon, PhuongThucThanhToan)
VALUES ('TEST-003', 1, @voucher_id_2, 950000, 6, NOW(), 'TRUC_TUYEN', 'VNPAY'); -- 1,000,000 - 50,000

SET @test_order_id_3 = LAST_INSERT_ID();

INSERT INTO HoaDonCT (IdHoaDon, IdSanPhamCT, SoLuong, DonGia, TrangThai)
VALUES 
(@test_order_id_3, 1, 2, 250000, 1),
(@test_order_id_3, 2, 1, 500000, 1);

-- Tạo phiếu trả hàng test
INSERT INTO PhieuTraHang (MaPhieuTraHang, IdUser, IdHoaDon, NgayTao, HinhThucTra, TrangThai, GhiChuKhachHang)
VALUES 
('PTH-TEST-001', 1, @test_order_id, NOW(), 'TRUC_TUYEN', 'APPROVED', 'Test không voucher'),
('PTH-TEST-002', 1, @test_order_id_2, NOW(), 'TRUC_TUYEN', 'APPROVED', 'Test voucher 10%'),
('PTH-TEST-003', 1, @test_order_id_3, NOW(), 'TRUC_TUYEN', 'APPROVED', 'Test voucher 50K');

-- Kiểm tra kết quả
SELECT 'TEST RESULTS' as title;

-- Test 1: Kiểm tra cấu trúc bảng PhieuTraHangCT có các cột mới
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE,
    COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'PhieuTraHangCT' 
    AND COLUMN_NAME IN ('DonGiaGoc', 'SoTienHoanTra', 'TyLeGiamGia')
ORDER BY COLUMN_NAME;

-- Test 2: Kiểm tra ràng buộc
SELECT 
    CONSTRAINT_NAME,
    CHECK_CLAUSE
FROM INFORMATION_SCHEMA.CHECK_CONSTRAINTS 
WHERE CONSTRAINT_SCHEMA = '5shuttle' 
    AND TABLE_NAME = 'PhieuTraHangCT';

-- Test 3: Kiểm tra dữ liệu test
SELECT 
    h.Ma as 'Mã đơn hàng',
    COALESCE(v.Ma, 'Không có') as 'Voucher',
    v.KieuGiaTri as 'Loại voucher',
    v.GiaTri as 'Giá trị voucher',
    v.GiaTriMax as 'Giá trị max',
    h.TongTien as 'Tổng tiền'
FROM HoaDon h
LEFT JOIN PhieuGiamGia v ON h.IdVoucher = v.Id
WHERE h.Ma LIKE 'TEST-%'
ORDER BY h.Ma;

-- Cleanup test data (uncomment để xóa dữ liệu test)
/*
DELETE FROM PhieuTraHang WHERE MaPhieuTraHang LIKE 'PTH-TEST-%';
DELETE FROM HoaDonCT WHERE IdHoaDon IN (
    SELECT Id FROM HoaDon WHERE Ma LIKE 'TEST-%'
);
DELETE FROM HoaDon WHERE Ma LIKE 'TEST-%';
DELETE FROM PhieuGiamGia WHERE Ma IN ('VOUCHER10', 'VOUCHER50K');
*/

SELECT 'Test script completed successfully!' as status;