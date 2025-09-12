DROP DATABASE IF EXISTS `5SHUTTLE`;
CREATE DATABASE 5SHUTTLE CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE 5SHUTTLE;

CREATE TABLE ThuongHieu (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Ten NVARCHAR(255),
    TrangThai INT
);

CREATE TABLE MauSac (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Ten NVARCHAR(255),
    TrangThai INT
);

CREATE TABLE ChatLieu (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Ten NVARCHAR(255),
    TrangThai INT
);

CREATE TABLE TrongLuong (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Ten NVARCHAR(255),
    TrangThai INT
);

CREATE TABLE DiemCanBang (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Ten NVARCHAR(255),
    TrangThai INT
);

CREATE TABLE DoCung (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Ten NVARCHAR(255),
    TrangThai INT
);

CREATE TABLE KhuyenMai (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Ten NVARCHAR(255),
    TG_BatDau DATETIME,
    TG_KetThuc DATETIME,
    GiaTri INT,
    Loai BOOLEAN,
    TrangThai INT
);

CREATE TABLE PhieuGiamGia (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Ma NVARCHAR(255),
    Ten NVARCHAR(255),
    GiaTri INT,
    GiaTriMax INT,
    DieuKienNhoNhat INT,
    Kieu INT,
    KieuGiaTri INT,
    SoLuong INT,
    NgayBatDau DATETIME,
    NgayKetThuc DATETIME,
    TrangThai INT
);

CREATE TABLE SanPham (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Ma NVARCHAR(255),
    Ten NVARCHAR(255),
    TrangThai INT
);

CREATE TABLE SanPhamCT (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    IdSanPham INT,
    IdThuongHieu INT,
    IdMauSac INT,
    IdChatLieu INT,
    IdTrongLuong INT,
    IdDiemCanBang INT,
    IdDoCung INT,
    Ma NVARCHAR(255),
    SoLuong INT,
    DonGia DECIMAL(10,2),
    MoTa NVARCHAR(255),
    TrangThai INT,
    FOREIGN KEY (IdSanPham) REFERENCES SanPham(Id),
    FOREIGN KEY (IdThuongHieu) REFERENCES ThuongHieu(Id),
    FOREIGN KEY (IdMauSac) REFERENCES MauSac(Id),
    FOREIGN KEY (IdChatLieu) REFERENCES ChatLieu(Id),
    FOREIGN KEY (IdTrongLuong) REFERENCES TrongLuong(Id),
    FOREIGN KEY (IdDiemCanBang) REFERENCES DiemCanBang(Id),
    FOREIGN KEY (IdDoCung) REFERENCES DoCung(Id)
);

CREATE TABLE HinhAnh (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    IdSanPhamCT INT,
    Link NVARCHAR(255),
    TrangThai INT,
    FOREIGN KEY (IdSanPhamCT) REFERENCES SanPhamCT(Id)
);

CREATE TABLE User
(
    Id         INT AUTO_INCREMENT NOT NULL,
    Ma         VARCHAR(255)       NULL,
    HoTen      VARCHAR(255)       NULL,
    Email      VARCHAR(255)       NULL,
    MatKhau    VARCHAR(255)       NULL,
    Sdt        VARCHAR(255)       NULL,
    NgaySinh   DATE               NULL,
    GioiTinh   INT                NULL,
    Avatar     VARCHAR(255)       NULL,
    CCCD       VARCHAR(255)       NULL,
    TrangThai  INT                NULL,
    CONSTRAINT pk_user PRIMARY KEY (Id)
);

CREATE TABLE DiaChi (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    IdUser INT,
    Ten NVARCHAR(255),
    Sdt VARCHAR(255),
    Tinh NVARCHAR(255),
    Huyen NVARCHAR(255),
    Xa NVARCHAR(255),
    DiaChiCuThe NVARCHAR(255),
    LoaiDiaChi NVARCHAR(255),
    FOREIGN KEY (IdUser) REFERENCES User(Id)
);

CREATE TABLE ThongBao (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    IdKhachHang INT NULL,
    Email VARCHAR(255) NULL,
    TieuDe NVARCHAR(255),
    NoiDung NVARCHAR(255),
    IdRedirect NVARCHAR(255),
    KieuThongBao NVARCHAR(255),
    TrangThai INT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (IdKhachHang) REFERENCES User(Id)
);


CREATE TABLE GioHang (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    IdSanPhamCT INT,
    IdUser INT,
    SoLuong INT,
    NgayTao DATETIME,
    NgaySua DATETIME,
    FOREIGN KEY (IdSanPhamCT) REFERENCES SanPhamCT(Id),
    FOREIGN KEY (IdUser) REFERENCES User(Id)
);

CREATE TABLE HoaDon (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    IdUser INT,
    IdVoucher INT,
    Ma NVARCHAR(255),
    SoLuong INT,
    LoaiHoaDon NVARCHAR(255),
    PhuongThucThanhToan NVARCHAR(255),
    TenNguoiNhan NVARCHAR(255),
    SdtNguoiNhan NVARCHAR(255),
    EmailNguoiNhan NVARCHAR(255),
    DiaChiNguoiNhan NVARCHAR(255),
    PhiShip DECIMAL(10,2),
    TongTien DECIMAL(10,2),
    NgayTao DATETIME,
    NgaySua DATETIME,
    TrangThai INT,
    FOREIGN KEY (IdUser) REFERENCES User(Id),
    FOREIGN KEY (IdVoucher) REFERENCES PhieuGiamGia(Id)
);

CREATE TABLE HoaDonCT (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    IdSanPhamCT INT,
    IdHoaDon INT,
    SoLuong INT,
    GiaBan DECIMAL(10,2),
    TrangThai INT,
    FOREIGN KEY (IdSanPhamCT) REFERENCES SanPhamCT(Id),
    FOREIGN KEY (IdHoaDon) REFERENCES HoaDon(Id)
);

CREATE TABLE SanPham_KhuyenMai (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    IdSanPhamCT INT,
    IdKhuyenMai INT,
    GiaKhuyenMai INT,
    FOREIGN KEY (IdSanPhamCT) REFERENCES SanPhamCT(Id),
    FOREIGN KEY (IdKhuyenMai) REFERENCES KhuyenMai(Id)
);

CREATE TABLE ThanhToan (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    IdUser INT,
    IdHoaDon INT,
    Ma NVARCHAR(255),
    TongTien DECIMAL(10,2),
    NgayTao DATETIME,
    PhuongThucThanhToan NVARCHAR(255),
    TrangThai INT,
    FOREIGN KEY (IdUser) REFERENCES User(Id),
    FOREIGN KEY (IdHoaDon) REFERENCES HoaDon(Id)
);

CREATE TABLE KhachHang_Voucher (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    IdKhachHang INT,
    IdVoucher INT,
    FOREIGN KEY (IdKhachHang) REFERENCES User(Id),
    FOREIGN KEY (IdVoucher) REFERENCES PhieuGiamGia(Id)
);

CREATE TABLE LichSuDonHang (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    IdUser INT,
    IdHoaDon INT,
    MoTa NVARCHAR(255),
    NgayTao DATETIME,
    NgaySua DATETIME,
    TrangThai INT,
    FOREIGN KEY (IdUser) REFERENCES User(Id),
    FOREIGN KEY (IdHoaDon) REFERENCES HoaDon(Id)
);

CREATE TABLE TraHang (
    id INT AUTO_INCREMENT PRIMARY KEY,
    hoa_don_ct_id INT NOT NULL,
    so_luong INT NOT NULL,
    ly_do VARCHAR(255),
    ngay_tao DATETIME NOT NULL,
    trang_thai INT NOT NULL DEFAULT 0, -- 0: Chờ duyệt, 1: Đã duyệt, 2: Từ chối
    FOREIGN KEY (hoa_don_ct_id) REFERENCES HoaDonCT(id)
);

CREATE TABLE PreOrder (
    id INT AUTO_INCREMENT PRIMARY KEY,

    id_hoa_don INT NULL, -- Cho phép NULL
    id_tai_khoan INT NOT NULL,
    Email VARCHAR(255) NULL,
    Phone VARCHAR(255) NULL,
    id_san_pham_ct INT NOT NULL,
    so_luong INT NOT NULL,
    RequestedQuantity INT NOT NULL DEFAULT 1,
    ngay_tao DATETIME NOT NULL,
    requested_quantity INT NOT NULL DEFAULT 1,
    trang_thai INT DEFAULT 0, -- 0: Chờ nhập hàng, 1: Đã nhập hàng, 2: Đã xác nhận
    FOREIGN KEY (id_hoa_don) REFERENCES HoaDon(id),
    FOREIGN KEY (id_tai_khoan) REFERENCES User(id),
    FOREIGN KEY (id_san_pham_ct) REFERENCES SanPhamCT(id)
);


CREATE TABLE BackInStockRequest (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    IdSanPhamCT INT NOT NULL,
    IdUser INT NULL,
    Email VARCHAR(255) NULL,
    Phone VARCHAR(255) NULL,
    RequestedQuantity INT NOT NULL DEFAULT 1,
    RequestDate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    Status INT NOT NULL DEFAULT 0, -- 0: Pending, 1: Notified, 2: Canceled
    TrangThai INT NULL,
    FOREIGN KEY (IdSanPhamCT) REFERENCES SanPhamCT(Id),
    FOREIGN KEY (IdUser) REFERENCES User(Id)
);

CREATE TABLE PhieuTraHang (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    IdUser INT NOT NULL,
    IdHoaDon INT NOT NULL,
    Ma NVARCHAR(100) NOT NULL,
    NgayTao DATETIME,
    NgayXuLy DATETIME,
    HinhThucTra NVARCHAR(50),
    TrangThai ENUM('PENDING', 'APPROVED', 'REJECTED', 'REFUNDED') DEFAULT 'PENDING',
    IdNhanVienXuLy INT NULL,
    GhiChuKhachHang NVARCHAR(255),
    GhiChuNhanVien NVARCHAR(255),
    FOREIGN KEY (IdUser) REFERENCES User(Id),
    FOREIGN KEY (IdHoaDon) REFERENCES HoaDon(Id),
    FOREIGN KEY (IdNhanVienXuLy) REFERENCES User(Id)
);

CREATE TABLE PhieuTraHangCT (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    IdPhieuTraHang INT NOT NULL,
    IdHoaDonCT INT NOT NULL,
    Ma NVARCHAR(100) NOT NULL,
    SoLuongTra INT NOT NULL,
    SoLuongPheDuyet INT NULL,
    LyDoTraHang NVARCHAR(500),
	GhiChuNhanVien NVARCHAR(255),
    TrangThai ENUM('PENDING', 'APPROVED', 'REJECTED') DEFAULT 'PENDING',
    FOREIGN KEY (IdPhieuTraHang) REFERENCES PhieuTraHang(Id),
    FOREIGN KEY (IdHoaDonCT) REFERENCES HoaDonCT(Id)
);

CREATE TABLE User
(
    Id         INT AUTO_INCREMENT NOT NULL,
    Ma         VARCHAR(255)       NULL,
    HoTen      VARCHAR(255)       NULL,
    Email      VARCHAR(255)       NULL,
    MatKhau    VARCHAR(255)       NULL,
    Sdt        VARCHAR(255)       NULL,
    NgaySinh   DATE               NULL,
    GioiTinh   INT                NULL,
    Avatar     VARCHAR(255)       NULL,
    CCCD       VARCHAR(255)       NULL,
    TrangThai  INT                NULL,
    CONSTRAINT pk_user PRIMARY KEY (Id)
   
);

CREATE TABLE `Role`
(
    Id            INT AUTO_INCREMENT NOT NULL,
    Name          VARCHAR(255)       NULL,
    `Description` VARCHAR(255)       NULL,
    CONSTRAINT pk_role PRIMARY KEY (Id),
    CONSTRAINT uc_Role_Description UNIQUE (`Description`)
);

CREATE TABLE Permission
(
    Id            INT AUTO_INCREMENT NOT NULL,
    Name          VARCHAR(255)       NULL,
    `Description` VARCHAR(255)       NULL,
    CONSTRAINT pk_permission PRIMARY KEY (Id)
);

CREATE TABLE User_Roles
(
    IdUser  INT NOT NULL,
    IdRole  INT NOT NULL,
    CONSTRAINT pk_user_roles PRIMARY KEY (IdUser, IdRole),
    CONSTRAINT fk_user_roles_user FOREIGN KEY (IdUser) REFERENCES User (Id),
    CONSTRAINT fk_user_roles_role FOREIGN KEY (IdRole) REFERENCES `Role` (Id)
);

CREATE TABLE Role_Permissions
(
    IdRole        INT NOT NULL,
    IdPermission  INT NOT NULL,
    CONSTRAINT pk_role_permissions PRIMARY KEY (IdRole, IdPermission),
    CONSTRAINT fk_role_permissions_role FOREIGN KEY (IdRole) REFERENCES `Role` (Id),
    CONSTRAINT fk_role_permissions_permission FOREIGN KEY (IdPermission) REFERENCES Permission (Id)
);


CREATE TABLE IF NOT EXISTS lich_su_hoan_kho (
    id INT AUTO_INCREMENT PRIMARY KEY,
    hoa_don_id INT NOT NULL,
    san_pham_ct_id INT NOT NULL,
    so_luong_hoan INT NOT NULL,
    loai_hoan_kho ENUM('AUTO', 'MANUAL', 'FORCE') NOT NULL,
    ly_do TEXT,
    nguoi_thuc_hien VARCHAR(100),
    thoi_gian TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (hoa_don_id) REFERENCES HoaDon(id),
    INDEX idx_hoa_don_id (hoa_don_id),
    INDEX idx_san_pham_ct_id (san_pham_ct_id)
);



-- Bảng Role
INSERT INTO `Role` (Name, `Description`)
VALUES ('ADMIN', 'Admin'),
		('STAFF', 'Staff'),
		('USER', 'Vai trò mặc định của người dùng');
        
INSERT INTO User (Ma, HoTen, Email, MatKhau, Sdt, NgaySinh, GioiTinh, Avatar, CCCD, TrangThai)
VALUES
('KH001', 'Nguyen Van A', 'a@gmail.com', '123456', '0901234567', '1990-01-01', 1, NULL, '123456789', 1),
('KH002', 'Tran Thi B', 'b@gmail.com', '123456', '0912345678', '1995-05-20', 0, NULL, '987654321', 1);

-- Thương hiệu
INSERT INTO ThuongHieu (Ten, TrangThai) VALUES ('Yonex', 1), ('Lining', 1);

-- Màu sắc
INSERT INTO MauSac (Ten, TrangThai) VALUES ('Đỏ', 1), ('Xanh', 1);

-- Chất liệu
INSERT INTO ChatLieu (Ten, TrangThai) VALUES ('Carbon', 1), ('Graphite', 1);

-- Trọng lượng
INSERT INTO TrongLuong (Ten, TrangThai) VALUES ('3U', 1), ('4U', 1);

-- Điểm cân bằng
INSERT INTO DiemCanBang (Ten, TrangThai) VALUES ('290mm', 1), ('300mm', 1);

-- Độ cứng
INSERT INTO DoCung (Ten, TrangThai) VALUES ('Cứng', 1), ('Trung bình', 1);

-- Khuyến mãi
INSERT INTO KhuyenMai (Ten, TG_BatDau, TG_KetThuc, GiaTri, Loai, TrangThai)
VALUES ('Sale 10%', NOW(), DATE_ADD(NOW(), INTERVAL 10 DAY), 10, 1, 1);

-- Voucher
INSERT INTO PhieuGiamGia (Ma, Ten, GiaTri, GiaTriMax, DieuKienNhoNhat, Kieu, KieuGiaTri, SoLuong, NgayBatDau, NgayKetThuc, TrangThai)
VALUES ('VOUCHER10', 'Giảm 10%', 10, 50000, 100000, 0, 0, 100, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), 1);

-- Sản phẩm
INSERT INTO SanPham (Ma, Ten, TrangThai)
VALUES ('SP001', 'Vợt Cầu Lông Yonex', 1);

-- Sản phẩm chi tiết
INSERT INTO SanPhamCT (IdSanPham, IdThuongHieu, IdMauSac, IdChatLieu, IdTrongLuong, IdDiemCanBang, IdDoCung, Ma, SoLuong, DonGia, MoTa, TrangThai)
VALUES (1, 1, 1, 1, 1, 1, 1, 'SPCT001', 50, 1500000, 'Vợt chuyên công', 1);

INSERT INTO HinhAnh (IdSanPhamCT, Link, TrangThai)
VALUES (1, 'https://example.com/image1.jpg', 1);

INSERT INTO DiaChi (IdUser, Ten, Sdt, IdTinh, IdHuyen, IdXa, DiaChiCuThe)
VALUES (1, 'Nguyen Van A', '0901234567', '02', '001', '0001', '123 Đường ABC');

INSERT INTO GioHang (IdSanPhamCT, IdUser, SoLuong, NgayTao, NgaySua)
VALUES (1, 1, 2, NOW(), NOW());

INSERT INTO HoaDon (IdUser, IdVoucher, Ma, SoLuong, LoaiHoaDon, PhuongThucThanhToan, TenNguoiNhan, SdtNguoiNhan, EmailNguoiNhan, DiaChiNguoiNhan, PhiShip, TongTien, NgayTao, NgaySua, TrangThai)
VALUES (1, 1, 'HD001', 2, 'Online', 'COD', 'Nguyen Van A', '0901234567', 'a@gmail.com', '123 Đường ABC', 30000, 2970000, NOW(), NOW(), 1);

INSERT INTO HoaDonCT (IdSanPhamCT, IdHoaDon, SoLuong, GiaBan, TrangThai)
VALUES (1, 1, 2, 1500000, 1);