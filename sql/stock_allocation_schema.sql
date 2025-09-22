
-- 1. Bảng theo dõi allocation cho từng hóa đơn chi tiết
CREATE TABLE stock_allocation (
    Id INT PRIMARY KEY AUTO_INCREMENT,
    IdHoaDonCT INT NOT NULL,
    IdSanPhamCT INT NOT NULL,
    SoLuongReserved INT DEFAULT 0,     -- Số lượng đặt trước (khi đặt hàng)
    SoLuongAllocated INT DEFAULT 0,    -- Số lượng đã phân bổ thực tế
    SoLuongConfirmed INT DEFAULT 0,    -- Số lượng đã xác nhận cuối cùng
    TrangThai ENUM('RESERVED', 'ALLOCATED', 'CONFIRMED', 'CANCELLED') DEFAULT 'RESERVED',
    NgayTao DATETIME DEFAULT CURRENT_TIMESTAMP,
    NgayCapNhat DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (IdHoaDonCT) REFERENCES HoaDonCT(Id) ON DELETE CASCADE,
    FOREIGN KEY (IdSanPhamCT) REFERENCES SanPhamCT(Id) ON DELETE CASCADE,
    UNIQUE KEY unique_allocation (IdHoaDonCT, IdSanPhamCT)
) ENGINE=InnoDB;

-- 2. Bảng lịch sử thay đổi stock allocation
CREATE TABLE stock_allocation_history (
    Id INT PRIMARY KEY AUTO_INCREMENT,
    IdStockAllocation INT NOT NULL,
    HanhDong ENUM('CREATE', 'UPDATE_QUANTITY', 'DELETE_PRODUCT', 'ADD_PRODUCT', 'CONFIRM', 'CANCEL') NOT NULL,
    SoLuongTruoc INT DEFAULT 0,
    SoLuongSau INT DEFAULT 0,
    TrangThaiTruoc VARCHAR(20),
    TrangThaiSau VARCHAR(20),
    LyDo VARCHAR(500),
    NguoiThucHien VARCHAR(100),
    NgayTao DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (IdStockAllocation) REFERENCES stock_allocation(Id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 3. Thêm cột tracking vào bảng HoaDonCT
ALTER TABLE HoaDonCT 
ADD COLUMN IsStockAllocated BOOLEAN DEFAULT FALSE,
ADD COLUMN AllocationStatus ENUM('RESERVED', 'ALLOCATED', 'CONFIRMED') DEFAULT 'RESERVED';

-- 4. Thêm indexes để tối ưu hiệu suất
CREATE INDEX idx_stock_allocation_hoa_don_ct ON stock_allocation(IdHoaDonCT);
CREATE INDEX idx_stock_allocation_san_pham_ct ON stock_allocation(IdSanPhamCT);
CREATE INDEX idx_stock_allocation_status ON stock_allocation(TrangThai);
CREATE INDEX idx_hoa_don_ct_allocation_status ON HoaDonCT(AllocationStatus);

-- 5. View để xem tổng quan stock allocation
CREATE OR REPLACE VIEW view_stock_allocation_summary AS
SELECT 
    sp.Ten as TenSanPham,
    spct.Ma as MaSanPhamCT,
    spct.SoLuong as TonKhoHienTai,
    COALESCE(SUM(CASE WHEN sa.TrangThai = 'RESERVED' THEN sa.SoLuongReserved ELSE 0 END), 0) as TongReserved,
    COALESCE(SUM(CASE WHEN sa.TrangThai = 'ALLOCATED' THEN sa.SoLuongAllocated ELSE 0 END), 0) as TongAllocated,
    COALESCE(SUM(CASE WHEN sa.TrangThai = 'CONFIRMED' THEN sa.SoLuongConfirmed ELSE 0 END), 0) as TongConfirmed,
    (spct.SoLuong - COALESCE(SUM(CASE WHEN sa.TrangThai IN ('ALLOCATED', 'CONFIRMED') THEN sa.SoLuongAllocated ELSE 0 END), 0)) as TonKhoCoSan
FROM SanPhamCT spct
LEFT JOIN SanPham sp ON spct.IdSanPham = sp.Id
LEFT JOIN stock_allocation sa ON spct.Id = sa.IdSanPhamCT
GROUP BY spct.Id, sp.Ten, spct.Ma, spct.SoLuong;

-- 6. Trigger để tự động cập nhật allocation status
DELIMITER //
DROP TRIGGER IF EXISTS update_allocation_status_after_insert//
CREATE TRIGGER update_allocation_status_after_insert
AFTER INSERT ON stock_allocation
FOR EACH ROW
BEGIN
    UPDATE HoaDonCT 
    SET 
        IsStockAllocated = TRUE,
        AllocationStatus = NEW.TrangThai
    WHERE Id = NEW.IdHoaDonCT;
END//

DROP TRIGGER IF EXISTS update_allocation_status_after_update//
CREATE TRIGGER update_allocation_status_after_update
AFTER UPDATE ON stock_allocation
FOR EACH ROW
BEGIN
    UPDATE HoaDonCT 
    SET AllocationStatus = NEW.TrangThai
    WHERE Id = NEW.IdHoaDonCT;
END//
DELIMITER ;

-- 7. Stored procedure để cleanup allocation cũ
DELIMITER //
DROP PROCEDURE IF EXISTS cleanup_old_allocations//
CREATE PROCEDURE cleanup_old_allocations()
BEGIN
    -- Xóa các allocation của đơn hàng đã hủy sau 30 ngày
    DELETE sa FROM stock_allocation sa
    INNER JOIN HoaDonCT hdct ON sa.IdHoaDonCT = hdct.Id
    INNER JOIN HoaDon hd ON hdct.IdHoaDon = hd.Id
    WHERE hd.TrangThai = 7 
    AND sa.TrangThai = 'CANCELLED'
    AND sa.NgayCapNhat < DATE_SUB(NOW(), INTERVAL 30 DAY);
END//
DELIMITER ;

-- 8. Function để tính available stock
DELIMITER //
DROP FUNCTION IF EXISTS get_available_stock//
CREATE FUNCTION get_available_stock(p_san_pham_ct_id INT)
RETURNS INT
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE v_ton_kho INT DEFAULT 0;
    DECLARE v_allocated INT DEFAULT 0;
    DECLARE v_available INT DEFAULT 0;
    
    -- Lấy tồn kho hiện tại
    SELECT SoLuong INTO v_ton_kho 
    FROM SanPhamCT 
    WHERE Id = p_san_pham_ct_id;
    
    -- Lấy tổng số lượng đã allocated/confirmed
    SELECT COALESCE(SUM(CASE 
        WHEN TrangThai IN ('ALLOCATED', 'CONFIRMED') THEN SoLuongAllocated 
        ELSE 0 
    END), 0) INTO v_allocated
    FROM stock_allocation 
    WHERE IdSanPhamCT = p_san_pham_ct_id;
    
    SET v_available = v_ton_kho - v_allocated;
    
    RETURN GREATEST(v_available, 0);
END//
DELIMITER ;