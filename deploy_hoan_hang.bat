@echo off
echo ==================================================
echo        TRIỂN KHAI CHỨC NĂNG HOÀN HÀNG MỚI
echo ==================================================
echo.

echo 1. Tạo bảng HoanHang trong database...
echo Vui lòng chạy file SQL sau để tạo bảng mới:
echo File: sql/hoan_hang_schema.sql
echo.

echo 2. Khởi động backend server...
echo cd da_be
echo mvn spring-boot:run
echo.

echo 3. Khởi động frontend server...
echo cd da_fe  
echo npm start
echo.

echo 4. Test các API endpoint mới:
echo POST http://localhost:8080/api/hoan-hang
echo GET  http://localhost:8080/api/hoan-hang/hoa-don/{id}
echo GET  http://localhost:8080/api/hoan-hang/tong-tien/{id}
echo.

echo ==================================================
echo             CÁCH SỬ DỤNG CHỨC NĂNG
echo ==================================================
echo.
echo 1. Admin Interface:
echo    - Truy cập đơn hàng có trạng thái "Đang vận chuyển"
echo    - Click nút hoàn hàng (icon xoay vòng màu cam)
echo    - Điền thông tin và xác nhận
echo    - Hệ thống tự động cập nhật:
echo      + Giảm số lượng trong đơn hàng
echo      + Hoàn lại tồn kho
echo      + Cập nhật tổng tiền đơn hàng
echo.
echo 2. User Interface:
echo    - Xem lịch sử hoàn hàng trong chi tiết đơn hàng
echo    - Theo dõi số tiền hoàn lại
echo.

echo ==================================================
echo                   LƯU Ý QUAN TRỌNG
echo ==================================================
echo.
echo - Chức năng hoàn hàng MỚI hoàn toàn độc lập với trả hàng cũ
echo - Xử lý trực tiếp, không cần duyệt
echo - Chỉ áp dụng cho đơn hàng đang vận chuyển (status = 3)
echo - Tự động cập nhật đơn hàng và tồn kho
echo - Validation đầy đủ để tránh lỗi dữ liệu
echo.

pause