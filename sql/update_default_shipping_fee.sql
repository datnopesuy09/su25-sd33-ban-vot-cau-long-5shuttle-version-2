-- Migration để cập nhật phí ship mặc định cho các hóa đơn chưa có phí ship
-- Chạy sau khi deploy code để đảm bảo dữ liệu cũ có phí ship

-- Cập nhật phí ship mặc định 30,000 VNĐ cho các hóa đơn chưa có phí ship (NULL hoặc 0)
UPDATE HoaDon 
SET PhiShip = 30000 
WHERE PhiShip IS NULL OR PhiShip = 0;

-- Kiểm tra kết quả
SELECT 
    COUNT(*) as TotalOrders,
    COUNT(CASE WHEN PhiShip IS NOT NULL AND PhiShip > 0 THEN 1 END) as OrdersWithShippingFee,
    AVG(PhiShip) as AverageShippingFee
FROM HoaDon;