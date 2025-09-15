package com.example.da_be.mapper;

import com.example.da_be.dto.response.PhieuTraHangChiTietResponse;
import com.example.da_be.dto.response.PhieuTraHangResponse;
import com.example.da_be.dto.response.SanPhamTraResponse;
import com.example.da_be.entity.HoaDonCT;
import com.example.da_be.entity.PhieuTraHang;
import com.example.da_be.entity.PhieuTraHangChiTiet;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

@Mapper(componentModel = "spring")
public interface PhieuTraHangMapper {
    //PhieuTraHang toPhieuTraHang(CreationPhieuTraHangRequest request);

    @Mapping(source = "user.id", target = "userId")
    @Mapping(source = "hoaDon.ma", target = "hoaDonMa")
    @Mapping(source = "hoaDon.taiKhoan.hoTen", target = "hoTenKhachHang")
    @Mapping(source = "hoaDon.taiKhoan.email", target = "emailKhachHang")
    @Mapping(source = "hoaDon.sdtNguoiNhan", target = "sdtKhachHang")
    @Mapping(source = "hoaDon.diaChiNguoiNhan", target = "diaChiKhachHang")
    @Mapping(source = "chiTietPhieuTraHang", target = "chiTietTraHang")
    @Mapping(source = "nhanVienXuLy.email", target = "staffEmail")
    @Mapping(source = "ghiChuKhachHang", target = "ghiChuKhachHang")
    @Mapping(source = "ngayXuLy", target = "ngayXuLy")
    PhieuTraHangResponse toPhieuTraHangResponse(PhieuTraHang phieuTraHang);

    @Mapping(source = "phieuTraHang.id", target = "phieuTraHangId")
    @Mapping(source = "hoaDonChiTiet", target = "thongTinSanPhamTra", qualifiedByName = "mapHoaDonCTToSanPhamTra")
    @Mapping(source = "ghiChuNhanVien", target = "ghiChuNhanVien")
    @Mapping(source = "soLuongPheDuyet", target = "soLuongPheDuyet")
    @Mapping(source = "lyDoTraHang", target = "lyDoTraHang") // Thêm dòng này
    PhieuTraHangChiTietResponse toPhieuTraHangChiTietResponse(PhieuTraHangChiTiet phieuTraHangChiTiet);

    @Named("mapHoaDonCTToSanPhamTra")
    @Mapping(source = "id", target = "hoaDonChiTietId")
    @Mapping(source = "sanPhamCT.id", target = "sanPhamChiTietId")
    @Mapping(source = "sanPhamCT.ma", target = "maSanPhamChiTiet")
    @Mapping(source = "sanPhamCT.sanPham.ten", target = "tenSanPham") // Đi sâu vào SanPham để lấy tên
    @Mapping(source = "sanPhamCT.thuongHieu.ten", target = "tenThuongHieu") // Đi sâu vào ThuongHieu để lấy tên
    @Mapping(source = "sanPhamCT.mauSac.ten", target = "tenMauSac") // Đi sâu vào MauSac để lấy tên
    @Mapping(source = "sanPhamCT.chatLieu.ten", target = "tenChatLieu")
    @Mapping(source = "sanPhamCT.trongLuong.ten", target = "tenTrongLuong")
    @Mapping(source = "sanPhamCT.diemCanBang.ten", target = "tenDiemCanBang")
    @Mapping(source = "sanPhamCT.doCung.ten", target = "tenDoCung")
    @Mapping(source = "sanPhamCT.soLuong", target = "soLuongTrongKho") // SoLuong trong HoaDonCT chính là số lượng ban đầu
    @Mapping(source = "giaBan", target = "giaBan") // GiaBan trong HoaDonCT chính là giá bán tại thời điểm mua
    SanPhamTraResponse mapHoaDonCTToSanPhamTra(HoaDonCT hoaDonCT);


}
