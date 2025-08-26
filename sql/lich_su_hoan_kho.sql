-- Bảng tracking lịch sử hoàn kho để tránh duplicate restoration
USE 5SHUTTLE;

CREATE TABLE IF NOT EXISTS lich_su_hoan_kho (
    id INT AUTO_INCREMENT PRIMARY KEY,
    hoa_don_id INT NOT NULL,
    san_pham_ct_id INT NOT NULL,
    so_luong_hoan INT NOT NULL,
    loai_hoan_kho ENUM('AUTO', 'MANUAL', 'FORCE') NOT NULL,
    ly_do TEXT,
    nguoi_thuc_hien VARCHAR(100),
    thoi_gian TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (hoa_don_id) REFERENCES HoaDon(id) ON DELETE CASCADE,
    INDEX idx_hoa_don_id (hoa_don_id),
    INDEX idx_san_pham_ct_id (san_pham_ct_id),
    
    -- Constraint để tránh duplicate hoàn kho cho cùng 1 đơn hàng và sản phẩm
    UNIQUE KEY unique_restore (hoa_don_id, san_pham_ct_id, loai_hoan_kho)
);

-- Thêm comment cho bảng
ALTER TABLE lich_su_hoan_kho COMMENT = 'Tracking lịch sử hoàn kho để tránh duplicate restoration';
