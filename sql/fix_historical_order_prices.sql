-- Script to fix historical order data where giaBan was saved incorrectly
-- This script will update HoaDonCT.GiaBan to reflect the actual price paid at the time of purchase

-- Backup existing data first (optional but recommended)
CREATE TABLE HoaDonCT_backup AS SELECT * FROM HoaDonCT;

-- Update HoaDonCT.GiaBan to use the promotional price that was active at the time of purchase
-- For orders where the product had a promotion at the time of purchase
UPDATE HoaDonCT hd_ct
JOIN SanPham_KhuyenMai skm ON hd_ct.IdSanPhamCT = skm.IdSanPhamCT
JOIN KhuyenMai km ON skm.IdKhuyenMai = km.Id
JOIN HoaDon hd ON hd_ct.IdHoaDon = hd.Id
SET hd_ct.GiaBan = skm.GiaKhuyenMai * hd_ct.SoLuong
WHERE 
    -- Check if the order was created during the promotion period
    hd.NgayTao >= km.TG_BatDau 
    AND hd.NgayTao <= km.TG_KetThuc
    AND km.TrangThai = 1  -- Active promotion
    -- Only update if current GiaBan equals original price * quantity
    -- (indicating it was saved with original price, not promotional price)
    AND hd_ct.GiaBan = (
        SELECT spct.DonGia * hd_ct.SoLuong 
        FROM SanPhamCT spct 
        WHERE spct.Id = hd_ct.IdSanPhamCT
    );

-- Log the changes (optional)
SELECT 
    'Fixed price data for HoaDonCT' as message,
    COUNT(*) as affected_rows
FROM HoaDonCT hd_ct
JOIN SanPham_KhuyenMai skm ON hd_ct.IdSanPhamCT = skm.IdSanPhamCT
JOIN KhuyenMai km ON skm.IdKhuyenMai = km.Id
JOIN HoaDon hd ON hd_ct.IdHoaDon = hd.Id
WHERE 
    hd.NgayTao >= km.TG_BatDau 
    AND hd.NgayTao <= km.TG_KetThuc
    AND km.TrangThai = 1;