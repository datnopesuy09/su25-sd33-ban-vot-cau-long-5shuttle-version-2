-- ===============================================
-- TEST SCRIPT: PHƯƠNG ÁN 1 - BỎ RESERVATION HOÀN TOÀN
-- ===============================================

-- 1. Kiểm tra trạng thái hiện tại
SELECT 
    'CURRENT STATE' as test_phase,
    sp.Id,
    sp.Ma as product_code,
    sp.SoLuong as current_stock,
    COALESCE(reserved.total_reserved, 0) as total_reserved,
    COALESCE(allocated.total_allocated, 0) as total_allocated,
    COALESCE(confirmed.total_confirmed, 0) as total_confirmed,
    sp.SoLuong as new_available_stock -- Với phương án 1: available = stock thực tế
FROM SanPhamCT sp
LEFT JOIN (
    SELECT IdSanPhamCT, SUM(SoLuongReserved) as total_reserved
    FROM stock_allocation 
    WHERE TrangThai = 'RESERVED'
    GROUP BY IdSanPhamCT
) reserved ON sp.Id = reserved.IdSanPhamCT
LEFT JOIN (
    SELECT IdSanPhamCT, SUM(SoLuongAllocated) as total_allocated
    FROM stock_allocation 
    WHERE TrangThai = 'ALLOCATED'
    GROUP BY IdSanPhamCT
) allocated ON sp.Id = allocated.IdSanPhamCT
LEFT JOIN (
    SELECT IdSanPhamCT, SUM(SoLuongConfirmed) as total_confirmed
    FROM stock_allocation 
    WHERE TrangThai = 'CONFIRMED'
    GROUP BY IdSanPhamCT
) confirmed ON sp.Id = confirmed.IdSanPhamCT
WHERE sp.SoLuong > 0 -- Chỉ hiển thị sản phẩm có stock
ORDER BY sp.Id
LIMIT 10;

-- 2. Tìm sản phẩm có vấn đề trong kịch bản của bạn (Vợt cầu lông Yonex)
SELECT 
    'PROBLEM PRODUCT ANALYSIS' as test_phase,
    sp.Id,
    sp.Ma,
    san_pham.Ten as product_name,
    sp.SoLuong as current_stock,
    
    -- Tính theo logic cũ (có vấn đề)
    sp.SoLuong - COALESCE(reserved.total_reserved, 0) - COALESCE(allocated.total_allocated, 0) - COALESCE(confirmed.total_confirmed, 0) as old_available,
    
    -- Tính theo logic mới (Phương án 1)
    sp.SoLuong as new_available,
    
    COALESCE(reserved.total_reserved, 0) as reserved_qty,
    COALESCE(allocated.total_allocated, 0) as allocated_qty,
    COALESCE(confirmed.total_confirmed, 0) as confirmed_qty
    
FROM SanPhamCT sp
JOIN SanPham san_pham ON sp.IdSanPham = san_pham.Id
LEFT JOIN (
    SELECT IdSanPhamCT, SUM(SoLuongReserved) as total_reserved
    FROM stock_allocation 
    WHERE TrangThai = 'RESERVED'
    GROUP BY IdSanPhamCT
) reserved ON sp.Id = reserved.IdSanPhamCT
LEFT JOIN (
    SELECT IdSanPhamCT, SUM(SoLuongAllocated) as total_allocated
    FROM stock_allocation 
    WHERE TrangThai = 'ALLOCATED'
    GROUP BY IdSanPhamCT
) allocated ON sp.Id = allocated.IdSanPhamCT
LEFT JOIN (
    SELECT IdSanPhamCT, SUM(SoLuongConfirmed) as total_confirmed
    FROM stock_allocation 
    WHERE TrangThai = 'CONFIRMED'
    GROUP BY IdSanPhamCT
) confirmed ON sp.Id = confirmed.IdSanPhamCT
WHERE san_pham.Ten LIKE '%Vợt%' OR san_pham.Ten LIKE '%Yonex%'
ORDER BY sp.Id;

-- 3. Kiểm tra các đơn hàng liên quan
SELECT 
    'ORDER ANALYSIS' as test_phase,
    hd.Id as order_id,
    hd.Ma as order_code,
    hd.TrangThai as order_status,
    hdct.Id as order_detail_id,
    sp.Ma as product_code,
    san_pham.Ten as product_name,
    hdct.SoLuong as ordered_qty,
    sp.SoLuong as current_stock,
    
    -- Kiểm tra allocation
    sa.TrangThai as allocation_status,
    sa.SoLuongReserved as reserved_qty,
    sa.SoLuongAllocated as allocated_qty,
    sa.SoLuongConfirmed as confirmed_qty
    
FROM HoaDon hd
JOIN HoaDonCT hdct ON hd.Id = hdct.IdHoaDon
JOIN SanPhamCT sp ON hdct.IdSanPhamCT = sp.Id
JOIN SanPham san_pham ON sp.IdSanPham = san_pham.Id
LEFT JOIN stock_allocation sa ON hdct.Id = sa.IdHoaDonCT
WHERE hd.NgayTao >= DATE_SUB(NOW(), INTERVAL 1 DAY) -- Đơn hàng trong 24h qua
ORDER BY hd.Id DESC, hdct.Id;

-- 4. Test scenario: Giả lập đặt hàng mới với logic mới
SELECT 
    'NEW ORDER SIMULATION' as test_phase,
    'Scenario: Khách muốn mua 7 sản phẩm' as description,
    sp.Id as product_id,
    sp.Ma as product_code,
    san_pham.Ten as product_name,
    sp.SoLuong as current_stock,
    7 as requested_qty,
    
    -- Logic cũ (có vấn đề)
    CASE 
        WHEN (sp.SoLuong - COALESCE(reserved.total_reserved, 0) - COALESCE(allocated.total_allocated, 0) - COALESCE(confirmed.total_confirmed, 0)) >= 7 
        THEN 'CAN ORDER (OLD LOGIC)' 
        ELSE 'CANNOT ORDER (OLD LOGIC)' 
    END as old_result,
    
    -- Logic mới (Phương án 1)
    CASE 
        WHEN sp.SoLuong >= 7 
        THEN 'CAN ORDER (NEW LOGIC)' 
        ELSE 'CANNOT ORDER (NEW LOGIC)' 
    END as new_result,
    
    'Admin will validate when confirming' as note
    
FROM SanPhamCT sp
JOIN SanPham san_pham ON sp.IdSanPham = san_pham.Id
LEFT JOIN (
    SELECT IdSanPhamCT, SUM(SoLuongReserved) as total_reserved
    FROM stock_allocation 
    WHERE TrangThai = 'RESERVED'
    GROUP BY IdSanPhamCT
) reserved ON sp.Id = reserved.IdSanPhamCT
LEFT JOIN (
    SELECT IdSanPhamCT, SUM(SoLuongAllocated) as total_allocated
    FROM stock_allocation 
    WHERE TrangThai = 'ALLOCATED'
    GROUP BY IdSanPhamCT
) allocated ON sp.Id = allocated.IdSanPhamCT
LEFT JOIN (
    SELECT IdSanPhamCT, SUM(SoLuongConfirmed) as total_confirmed
    FROM stock_allocation 
    WHERE TrangThai = 'CONFIRMED'
    GROUP BY IdSanPhamCT
) confirmed ON sp.Id = confirmed.IdSanPhamCT
WHERE (san_pham.Ten LIKE '%Vợt%' OR san_pham.Ten LIKE '%Yonex%')
   AND sp.SoLuong > 0
LIMIT 5;

-- 5. Khuyến nghị cleanup data (chạy sau khi test xong)
/*
-- CLEANUP SCRIPT - CHỈ CHẠY KHI CONFIRM MUỐN XÓA DỮ LIỆU TEST
-- Xóa các allocation không còn cần thiết (do không dùng reservation nữa)
DELETE FROM stock_allocation 
WHERE TrangThai = 'RESERVED' 
  AND NgayTao < DATE_SUB(NOW(), INTERVAL 1 HOUR);
  
-- Hoặc có thể set status thành CANCELLED thay vì xóa
UPDATE stock_allocation 
SET TrangThai = 'CANCELLED' 
WHERE TrangThai = 'RESERVED' 
  AND NgayTao < DATE_SUB(NOW(), INTERVAL 1 HOUR);
*/

SELECT 'TEST COMPLETED - Phương án 1: Bỏ reservation hoàn toàn' as final_message;