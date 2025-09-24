-- Script cleanup để fix dữ liệu Stock Allocation hiện tại
-- QUAN TRỌNG: Backup dữ liệu trước khi chạy!

-- 1. Backup bảng quan trọng
CREATE TABLE stock_allocation_backup_20250924 AS SELECT * FROM stock_allocation;
CREATE TABLE sanphamct_backup_20250924 AS SELECT * FROM SanPhamCT;
CREATE TABLE hoadonct_backup_20250924 AS SELECT * FROM HoaDonCT;

-- 2. Tìm và fix các allocation đã bị ảnh hưởng bởi hoàn hàng
-- (Những allocation vẫn chiếm giữ số lượng đã hoàn hàng)

-- Bước 2a: Tạo temporary table để tính toán
CREATE TEMPORARY TABLE allocation_fixes AS
SELECT 
    sa.Id as allocation_id,
    sa.IdHoaDonCT,
    sa.IdSanPhamCT,
    sa.TrangThai as current_status,
    sa.SoLuongAllocated as current_allocated,
    sa.SoLuongConfirmed as current_confirmed,
    hdct.SoLuong as current_hoadonct_quantity,
    COALESCE(SUM(hh.SoLuongHoan), 0) as total_returned,
    -- Tính số lượng allocation đúng sau khi trừ hoàn hàng
    GREATEST(0, 
        CASE 
            WHEN sa.TrangThai = 'ALLOCATED' THEN sa.SoLuongAllocated
            WHEN sa.TrangThai = 'CONFIRMED' THEN sa.SoLuongConfirmed
            ELSE 0
        END - COALESCE(SUM(hh.SoLuongHoan), 0)
    ) as corrected_allocation
FROM stock_allocation sa
JOIN HoaDonCT hdct ON sa.IdHoaDonCT = hdct.Id
LEFT JOIN HoanHang hh ON hh.HoaDonChiTietId = hdct.Id
WHERE sa.TrangThai IN ('ALLOCATED', 'CONFIRMED')
GROUP BY sa.Id, sa.IdHoaDonCT, sa.IdSanPhamCT, sa.TrangThai, 
         sa.SoLuongAllocated, sa.SoLuongConfirmed, hdct.SoLuong
HAVING total_returned > 0;

-- Bước 2b: Hiển thị những allocation cần fix
SELECT 
    allocation_id,
    IdHoaDonCT,
    current_status,
    current_allocated,
    current_confirmed,
    total_returned,
    corrected_allocation,
    (current_allocated + current_confirmed - corrected_allocation) as stock_to_restore
FROM allocation_fixes
WHERE corrected_allocation != GREATEST(current_allocated, current_confirmed);

-- Bước 2c: Fix allocations (RUN ONLY AFTER REVIEWING ABOVE RESULTS)
/*
UPDATE stock_allocation sa
JOIN allocation_fixes af ON sa.Id = af.allocation_id
SET 
    sa.SoLuongAllocated = CASE 
        WHEN sa.TrangThai = 'ALLOCATED' THEN af.corrected_allocation
        ELSE sa.SoLuongAllocated
    END,
    sa.SoLuongConfirmed = CASE 
        WHEN sa.TrangThai = 'CONFIRMED' THEN af.corrected_allocation  
        ELSE sa.SoLuongConfirmed
    END,
    sa.TrangThai = CASE 
        WHEN af.corrected_allocation = 0 THEN 'CANCELLED'
        ELSE sa.TrangThai
    END,
    sa.NgayCapNhat = NOW()
WHERE af.corrected_allocation != GREATEST(af.current_allocated, af.current_confirmed);
*/

-- 3. Validate kết quả sau khi fix
SELECT 
    spct.Id as SanPhamCT_ID,
    sp.Ten as Ten_SanPham,
    spct.SoLuong as Current_Stock,
    COALESCE(SUM(CASE WHEN sa.TrangThai = 'RESERVED' THEN sa.SoLuongReserved ELSE 0 END), 0) as Total_Reserved,
    COALESCE(SUM(CASE WHEN sa.TrangThai = 'ALLOCATED' THEN sa.SoLuongAllocated ELSE 0 END), 0) as Total_Allocated,
    COALESCE(SUM(CASE WHEN sa.TrangThai = 'CONFIRMED' THEN sa.SoLuongConfirmed ELSE 0 END), 0) as Total_Confirmed,
    (spct.SoLuong - 
        COALESCE(SUM(CASE WHEN sa.TrangThai = 'RESERVED' THEN sa.SoLuongReserved ELSE 0 END), 0) -
        COALESCE(SUM(CASE WHEN sa.TrangThai = 'ALLOCATED' THEN sa.SoLuongAllocated ELSE 0 END), 0) -
        COALESCE(SUM(CASE WHEN sa.TrangThai = 'CONFIRMED' THEN sa.SoLuongConfirmed ELSE 0 END), 0)
    ) as Available_Stock_After_Fix
FROM SanPhamCT spct
JOIN SanPham sp ON spct.IdSanPham = sp.Id
LEFT JOIN stock_allocation sa ON spct.Id = sa.IdSanPhamCT AND sa.TrangThai != 'CANCELLED'
WHERE sp.Ten LIKE '%Vợt cầu lông Yonex%'
GROUP BY spct.Id, sp.Ten, spct.SoLuong;

-- 4. Cleanup temporary table
DROP TEMPORARY TABLE IF EXISTS allocation_fixes;

-- Ghi chú: 
-- 1. Chạy query debug trước để hiểu vấn đề
-- 2. Uncomment phần UPDATE sau khi đã review kỹ
-- 3. Restart application để clear cache
-- 4. Test lại việc đặt hàng