-- Migration: Normalize HoaDonCT.GiaBan to unit price (don gia)
-- Context: Historically GiaBan may have been stored as line total (don gia * so luong)
-- This script converts legacy rows to unit price to match new backend semantics.
--
-- SAFETY: Run in a transaction if your MySQL mode supports it for DDL/DML mix, or run steps manually.
-- Always back up before running. Test on staging first.

USE `5SHUTTLE`;

-- 0) CONFIG: choose a cutoff datetime when new code was deployed
-- Replace the value below with your actual deployment time
SET @CUTOFF := '2025-09-23 00:00:00';

-- 1) Backup table snapshot (structure + data)
CREATE TABLE IF NOT EXISTS HoaDonCT_backup_before_giaban_migration LIKE HoaDonCT;
INSERT INTO HoaDonCT_backup_before_giaban_migration SELECT * FROM HoaDonCT;

-- 2) Identify suspect rows where GiaBan likely equals line total
-- Heuristic: If exists a linked SanPhamCT.DonGia and HoaDonCT.GiaBan >= SanPhamCT.DonGia * SoLuong - small epsilon
-- Also focus on orders created before cutoff
CREATE TEMPORARY TABLE tmp_giaban_line_total_candidates AS
SELECT hdct.Id AS HoaDonCTId,
       hd.Id AS HoaDonId,
       hd.NgayTao,
       hdct.SoLuong,
       hdct.GiaBan AS GiaBanStored,
       spct.DonGia AS DonGiaSP,
       (spct.DonGia * hdct.SoLuong) AS ExpectedLineTotal
FROM HoaDonCT hdct
JOIN HoaDon hd ON hd.Id = hdct.IdHoaDon
LEFT JOIN SanPhamCT spct ON spct.Id = hdct.IdSanPhamCT
WHERE hd.NgayTao < @CUTOFF
  AND hdct.SoLuong IS NOT NULL AND hdct.SoLuong > 0
  AND spct.DonGia IS NOT NULL
  AND ABS(hdct.GiaBan - (spct.DonGia * hdct.SoLuong)) <= 0.01; -- tolerance for rounding

-- 3) Update those candidates to unit price by dividing by quantity
UPDATE HoaDonCT hdct
JOIN tmp_giaban_line_total_candidates c ON c.HoaDonCTId = hdct.Id
SET hdct.GiaBan = ROUND(hdct.GiaBan / NULLIF(hdct.SoLuong,0), 2);

-- 4) Optional: broader fallback for any remaining pre-cutoff rows where GiaBan looks too high vs unit price
-- If GiaBan > 1.5 * DonGiaSP, treat as line total and divide by SoLuong
UPDATE HoaDonCT hdct
JOIN HoaDon hd ON hd.Id = hdct.IdHoaDon
LEFT JOIN SanPhamCT spct ON spct.Id = hdct.IdSanPhamCT
SET hdct.GiaBan = ROUND(hdct.GiaBan / NULLIF(hdct.SoLuong,0), 2)
WHERE hd.NgayTao < @CUTOFF
  AND hdct.SoLuong > 0
  AND spct.DonGia IS NOT NULL
  AND hdct.GiaBan > spct.DonGia * 1.5;

-- 5) Verification: compare recomputed totals vs stored TongTien per order (pre-cutoff)
-- Note: TongTien might also include shipping and voucher discounts; this is just a sanity check for gross line totals.
SELECT hd.Id AS HoaDonId,
       hd.NgayTao,
       SUM(hdct.GiaBan * hdct.SoLuong) AS RecomputedSubtotal,
       hd.TongTien AS StoredTongTien
FROM HoaDon hd
JOIN HoaDonCT hdct ON hdct.IdHoaDon = hd.Id
WHERE hd.NgayTao < @CUTOFF
GROUP BY hd.Id, hd.NgayTao, hd.TongTien
ORDER BY hd.Id
LIMIT 200;

-- 6) Spot-check sample rows after migration
SELECT hdct.Id, hdct.IdHoaDon, hdct.IdSanPhamCT, hdct.SoLuong, hdct.GiaBan AS DonGia_After
FROM HoaDonCT hdct
JOIN HoaDon hd ON hd.Id = hdct.IdHoaDon
WHERE hd.NgayTao < @CUTOFF
ORDER BY hdct.Id DESC
LIMIT 100;

-- ROLLBACK: Restore from backup if needed
-- TRUNCATE TABLE HoaDonCT;
-- INSERT INTO HoaDonCT SELECT * FROM HoaDonCT_backup_before_giaban_migration;
