ALTER TABLE PhieuTraHangCT
    ADD COLUMN DonGiaGoc DECIMAL(10,2) NULL,
    ADD COLUMN SoTienHoanTra DECIMAL(10,2) NULL,
    ADD COLUMN TyLeGiamGia DECIMAL(5,4) NULL;


-- Relax SoLuongPheDuyet to allow NULL at creation (will be set upon approval)
ALTER TABLE PhieuTraHangCT MODIFY COLUMN SoLuongPheDuyet INT NULL;