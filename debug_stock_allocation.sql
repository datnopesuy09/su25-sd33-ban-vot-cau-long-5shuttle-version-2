-- Script debug Stock Allocation Issue
-- Chạy script này để kiểm tra tình trạng allocation hiện tại

-- 1. Kiểm tra thông tin sản phẩm bị lỗi
SELECT 
    spct.Id as SanPhamCT_ID,
    sp.Ten as Ten_SanPham,
    spct.Ma as Ma_SanPhamCT,
    spct.SoLuong as Stock_Hien_Tai
FROM SanPhamCT spct
JOIN SanPham sp ON spct.IdSanPham = sp.Id
WHERE sp.Ten LIKE '%Vợt cầu lông Yonex%'
ORDER BY spct.Id;

-- 2. Kiểm tra tất cả allocations cho sản phẩm này
SELECT 
    sa.Id as Allocation_ID,
    sa.IdHoaDonCT,
    sa.IdSanPhamCT,
    sa.SoLuongReserved,
    sa.SoLuongAllocated,
    sa.SoLuongConfirmed,
    sa.TrangThai,
    sa.NgayTao,
    sa.NgayCapNhat,
    hd.Ma as Ma_HoaDon,
    hd.TrangThai as TrangThai_HoaDon
FROM stock_allocation sa
JOIN HoaDonCT hdct ON sa.IdHoaDonCT = hdct.Id
JOIN HoaDon hd ON hdct.IdHoaDon = hd.Id
WHERE sa.IdSanPhamCT IN (
    SELECT spct.Id FROM SanPhamCT spct 
    JOIN SanPham sp ON spct.IdSanPham = sp.Id 
    WHERE sp.Ten LIKE '%Vợt cầu lông Yonex%'
)
ORDER BY sa.NgayTao DESC;

-- 3. Kiểm tra HoaDonCT liên quan
SELECT 
    hdct.Id as HoaDonCT_ID,
    hd.Ma as Ma_HoaDon,
    hd.TrangThai as TrangThai_HoaDon,
    hdct.SoLuong as SoLuong_HoaDonCT,
    hdct.GiaBan,
    sp.Ten as Ten_SanPham
FROM HoaDonCT hdct
JOIN HoaDon hd ON hdct.IdHoaDon = hd.Id
JOIN SanPhamCT spct ON hdct.IdSanPhamCT = spct.Id
JOIN SanPham sp ON spct.IdSanPham = sp.Id
WHERE sp.Ten LIKE '%Vợt cầu lông Yonex%'
ORDER BY hd.NgayTao DESC;

-- 4. Kiểm tra lịch sử hoàn hàng
SELECT 
    hh.Id,
    hh.MaHoanHang,
    hh.HoaDonId,
    hh.HoaDonChiTietId,
    hh.SoLuongHoan,
    hh.DonGia,
    hh.ThanhTien,
    hh.NgayTao,
    sp.Ten as Ten_SanPham
FROM HoanHang hh
JOIN HoaDonCT hdct ON hh.HoaDonChiTietId = hdct.Id
JOIN SanPhamCT spct ON hdct.IdSanPhamCT = spct.Id
JOIN SanPham sp ON spct.IdSanPham = sp.Id
WHERE sp.Ten LIKE '%Vợt cầu lông Yonex%'
ORDER BY hh.NgayTao DESC;

-- 5. Tính toán Available Stock theo logic mới
SELECT 
    spct.Id as SanPhamCT_ID,
    sp.Ten as Ten_SanPham,
    spct.SoLuong as Stock_Hien_Tai,
    COALESCE(SUM(CASE WHEN sa.TrangThai = 'RESERVED' THEN sa.SoLuongReserved ELSE 0 END), 0) as Total_Reserved,
    COALESCE(SUM(CASE WHEN sa.TrangThai = 'ALLOCATED' THEN sa.SoLuongAllocated ELSE 0 END), 0) as Total_Allocated,
    COALESCE(SUM(CASE WHEN sa.TrangThai = 'CONFIRMED' THEN sa.SoLuongConfirmed ELSE 0 END), 0) as Total_Confirmed,
    (spct.SoLuong - 
        COALESCE(SUM(CASE WHEN sa.TrangThai = 'RESERVED' THEN sa.SoLuongReserved ELSE 0 END), 0) -
        COALESCE(SUM(CASE WHEN sa.TrangThai = 'ALLOCATED' THEN sa.SoLuongAllocated ELSE 0 END), 0) -
        COALESCE(SUM(CASE WHEN sa.TrangThai = 'CONFIRMED' THEN sa.SoLuongConfirmed ELSE 0 END), 0)
    ) as Available_Stock_NEW_LOGIC
FROM SanPhamCT spct
JOIN SanPham sp ON spct.IdSanPham = sp.Id
LEFT JOIN stock_allocation sa ON spct.Id = sa.IdSanPhamCT AND sa.TrangThai IN ('RESERVED', 'ALLOCATED', 'CONFIRMED')
WHERE sp.Ten LIKE '%Vợt cầu lông Yonex%'
GROUP BY spct.Id, sp.Ten, spct.SoLuong;

-- 6. Kiểm tra logic cũ (có vấn đề)
SELECT 
    spct.Id as SanPhamCT_ID,
    sp.Ten as Ten_SanPham,
    spct.SoLuong as Stock_Hien_Tai,
    COALESCE(SUM(CASE 
        WHEN sa.TrangThai = 'ALLOCATED' THEN sa.SoLuongAllocated 
        WHEN sa.TrangThai = 'CONFIRMED' THEN sa.SoLuongConfirmed 
        ELSE 0 END), 0) as Total_Allocated_OLD_LOGIC,
    (spct.SoLuong - 
        COALESCE(SUM(CASE 
            WHEN sa.TrangThai = 'ALLOCATED' THEN sa.SoLuongAllocated 
            WHEN sa.TrangThai = 'CONFIRMED' THEN sa.SoLuongConfirmed 
            ELSE 0 END), 0)
    ) as Available_Stock_OLD_LOGIC
FROM SanPhamCT spct
JOIN SanPham sp ON spct.IdSanPham = sp.Id
LEFT JOIN stock_allocation sa ON spct.Id = sa.IdSanPhamCT AND sa.TrangThai IN ('ALLOCATED', 'CONFIRMED')
WHERE sp.Ten LIKE '%Vợt cầu lông Yonex%'
GROUP BY spct.Id, sp.Ten, spct.SoLuong;