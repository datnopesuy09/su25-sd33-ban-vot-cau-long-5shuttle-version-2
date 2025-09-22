-- Tạo bảng HoanHang cho chức năng hoàn hàng mới
-- Khác với TraHang, HoanHang sẽ xử lý trực tiếp việc cập nhật đơn hàng và tồn kho

-- Tạo bảng HoanHang cho chức năng hoàn hàng mới
-- Khác với TraHang, HoanHang sẽ xử lý trực tiếp việc cập nhật đơn hàng và tồn kho

CREATE TABLE IF NOT EXISTS HoanHang (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ma_hoan_hang VARCHAR(50) UNIQUE NOT NULL,
    hoa_don_id INT NOT NULL,
    hoa_don_chi_tiet_id INT NOT NULL,
    so_luong_hoan INT NOT NULL,
    don_gia DECIMAL(10,2) NOT NULL,
    thanh_tien DECIMAL(10,2) NOT NULL,
    ly_do_hoan TEXT,
    ghi_chu TEXT,
    trang_thai INT DEFAULT 1, -- 1: Đã hoàn hàng (trực tiếp)
    nguoi_tao VARCHAR(100),
    ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    nguoi_cap_nhat VARCHAR(100),
    ngay_cap_nhat TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    FOREIGN KEY (hoa_don_id) REFERENCES HoaDon(Id) ON DELETE CASCADE,
    FOREIGN KEY (hoa_don_chi_tiet_id) REFERENCES HoaDonCT(Id) ON DELETE CASCADE,
    
    -- Indexes
    INDEX idx_hoan_hang_hoa_don (hoa_don_id),
    INDEX idx_hoan_hang_chi_tiet (hoa_don_chi_tiet_id),
    INDEX idx_hoan_hang_ma (ma_hoan_hang),
    INDEX idx_hoan_hang_ngay_tao (ngay_tao),
    
    -- Check constraints
    CONSTRAINT chk_hoan_hang_so_luong CHECK (so_luong_hoan > 0),
    CONSTRAINT chk_hoan_hang_don_gia CHECK (don_gia >= 0),
    CONSTRAINT chk_hoan_hang_thanh_tien CHECK (thanh_tien >= 0)
) COMMENT='Bảng quản lý hoàn hàng - xử lý trực tiếp việc cập nhật đơn hàng và tồn kho';

-- Tạo sequence cho mã hoàn hàng
-- Format: HH + YYYYMMDD + 4 chữ số
-- Ví dụ: HH202509220001

-- Trigger để tự động tạo mã hoàn hàng
DELIMITER $$

CREATE TRIGGER before_insert_hoan_hang
BEFORE INSERT ON HoanHang
FOR EACH ROW
BEGIN
    DECLARE next_id INT DEFAULT 1;
    DECLARE today_prefix VARCHAR(20);
    DECLARE max_today_ma VARCHAR(50);

    -- Prefix cho ngày hôm nay: HH + YYYYMMDD
    SET today_prefix = CONCAT('HH', DATE_FORMAT(NOW(), '%Y%m%d'));

    -- Lấy mã hoàn hàng lớn nhất trong ngày
    SELECT ma_hoan_hang INTO max_today_ma
    FROM HoanHang 
    WHERE ma_hoan_hang LIKE CONCAT(today_prefix, '%')
    ORDER BY ma_hoan_hang DESC 
    LIMIT 1;

    -- Nếu đã có mã trong ngày, tăng số thứ tự
    IF max_today_ma IS NOT NULL THEN
        SET next_id = CAST(SUBSTRING(max_today_ma, -4) AS UNSIGNED) + 1;
    END IF;

    -- Gán mã hoàn hàng mới (HHYYYYMMDD0001)
    SET NEW.ma_hoan_hang = CONCAT(today_prefix, LPAD(next_id, 4, '0'));
END$$

DELIMITER ;


