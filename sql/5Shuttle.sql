DROP DATABASE IF EXISTS 5SHUTTLE;
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

CREATE TABLE TaiKhoan (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Ma NVARCHAR(255),
    HoTen NVARCHAR(255),
    Sdt VARCHAR(255),
    Email NVARCHAR(255),
    MatKhau NVARCHAR(255),
    GioiTinh BOOLEAN,
    VaiTro NVARCHAR(255),
    Avatar TEXT,
    NgaySinh DATE,
    CCCD VARCHAR(50),
    TrangThai INT
);

CREATE TABLE Voucher (
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

CREATE TABLE DiaChi (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    IdTaiKhoan INT,
    Ten NVARCHAR(255),
    Sdt VARCHAR(255),
    IdTinh NVARCHAR(255),
    IdHuyen NVARCHAR(255),
    IdXa NVARCHAR(255),
    DiaChiCuThe NVARCHAR(255),
    FOREIGN KEY (IdTaiKhoan) REFERENCES TaiKhoan(Id)
);

CREATE TABLE ThongBao (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    IdKhachHang INT,
    TieuDe NVARCHAR(255),
    NoiDung NVARCHAR(255),
    IdRedirect NVARCHAR(255),
    KieuThongBao NVARCHAR(255),
    TrangThai INT,
    FOREIGN KEY (IdKhachHang) REFERENCES TaiKhoan(Id)
);

CREATE TABLE GioHang (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    IdSanPhamCT INT,
    IdTaiKhoan INT,
    SoLuong INT,
    NgayTao DATETIME,
    NgaySua DATETIME,
    FOREIGN KEY (IdSanPhamCT) REFERENCES SanPhamCT(Id),
    FOREIGN KEY (IdTaiKhoan) REFERENCES TaiKhoan(Id)
);

CREATE TABLE HoaDon (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    IdTaiKhoan INT,
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
    FOREIGN KEY (IdTaiKhoan) REFERENCES TaiKhoan(Id),
    FOREIGN KEY (IdVoucher) REFERENCES Voucher(Id)
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
    IdTaiKhoan INT,
    IdHoaDon INT,
    Ma NVARCHAR(255),
    TongTien DECIMAL(10,2),
    NgayTao DATETIME,
    PhuongThucThanhToan NVARCHAR(255),
    TrangThai INT,
    FOREIGN KEY (IdTaiKhoan) REFERENCES TaiKhoan(Id),
    FOREIGN KEY (IdHoaDon) REFERENCES HoaDon(Id)
);

CREATE TABLE KhachHang_Voucher (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    IdKhachHang INT,
    IdVoucher INT,
    FOREIGN KEY (IdKhachHang) REFERENCES TaiKhoan(Id),
    FOREIGN KEY (IdVoucher) REFERENCES Voucher(Id)
);

CREATE TABLE LichSuDonHang (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    IdTaiKhoan INT,
    IdHoaDon INT,
    MoTa NVARCHAR(255),
    NgayTao DATETIME,
    NgaySua DATETIME,
    TrangThai INT,
    FOREIGN KEY (IdTaiKhoan) REFERENCES TaiKhoan(Id),
    FOREIGN KEY (IdHoaDon) REFERENCES HoaDon(Id)
);
