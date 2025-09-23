-- Migration to add missing columns for PhieuTraHangCT used by refund logic
ALTER TABLE PhieuTraHangCT
    ADD COLUMN IF NOT EXISTS DonGiaGoc DECIMAL(10,2) NULL,
    ADD COLUMN IF NOT EXISTS SoTienHoanTra DECIMAL(10,2) NULL,
    ADD COLUMN IF NOT EXISTS TyLeGiamGia DECIMAL(5,4) NULL;

-- Relax SoLuongPheDuyet to allow NULL at creation (will be set upon approval)
ALTER TABLE PhieuTraHangCT MODIFY COLUMN SoLuongPheDuyet INT NULL;
