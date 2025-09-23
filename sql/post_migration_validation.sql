-- Optional: Extra validation for GiaBan unit price migration
USE `5SHUTTLE`;

-- 1) Orders with large discrepancy between recomputed subtotal and stored TongTien
-- Note: shipping and voucher discounts affect TongTien; this flags extreme cases only
SELECT hd.Id AS HoaDonId,
       hd.NgayTao,
       SUM(hdct.GiaBan * hdct.SoLuong) AS RecomputedSubtotal,
       hd.TongTien AS StoredTongTien,
       (SUM(hdct.GiaBan * hdct.SoLuong) - hd.TongTien) AS Delta
FROM HoaDon hd
JOIN HoaDonCT hdct ON hdct.IdHoaDon = hd.Id
GROUP BY hd.Id, hd.NgayTao, hd.TongTien
HAVING ABS(Delta) > 200000 -- adjust threshold to your context
ORDER BY ABS(Delta) DESC
LIMIT 200;

-- 2) Any HoaDonCT rows with suspicious GiaBan vs current product DonGia (post-migration)
SELECT hdct.Id, hdct.IdHoaDon, hdct.IdSanPhamCT, hdct.SoLuong,
       hdct.GiaBan AS UnitGiaBan,
       spct.DonGia AS CurrentDonGia,
       (hdct.GiaBan - spct.DonGia) AS Diff
FROM HoaDonCT hdct
LEFT JOIN SanPhamCT spct ON spct.Id = hdct.IdSanPhamCT
WHERE hdct.SoLuong > 0
  AND spct.DonGia IS NOT NULL
  AND hdct.GiaBan > spct.DonGia * 2 -- looks too high for a unit price
ORDER BY hdct.Id DESC
LIMIT 200;

-- 3) Sample recent orders (last 50) to eyeball unit prices
SELECT hd.Id AS HoaDonId,
       hd.NgayTao,
       hdct.Id AS HoaDonCTId,
       hdct.IdSanPhamCT,
       hdct.SoLuong,
       hdct.GiaBan AS UnitGiaBan,
       (hdct.GiaBan * hdct.SoLuong) AS LineTotal
FROM HoaDon hd
JOIN HoaDonCT hdct ON hdct.IdHoaDon = hd.Id
ORDER BY hd.NgayTao DESC, hdct.Id DESC
LIMIT 200;