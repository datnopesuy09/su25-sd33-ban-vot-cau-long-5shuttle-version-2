package com.example.da_be.dto;

import java.util.List;

public class DatHangRequestDTO {
    private Integer idTaiKhoan;
    private List<CartItemDTO> cartItems;
    private ThongTinGiaoHangDTO thongTinGiaoHang;
    private Integer discountId;

    public static class CartItemDTO {
        private Integer sanPhamCTId;
        private Integer soLuong;

        public Integer getSanPhamCTId() {
            return sanPhamCTId;
        }

        public void setSanPhamCTId(Integer sanPhamCTId) {
            this.sanPhamCTId = sanPhamCTId;
        }

        public Integer getSoLuong() {
            return soLuong;
        }

        public void setSoLuong(Integer soLuong) {
            this.soLuong = soLuong;
        }
    }

    public static class ThongTinGiaoHangDTO {
        private String hoTen;
        private String sdt;
        private String email;
        private String diaChiCuThe;

        public String getHoTen() {
            return hoTen;
        }

        public void setHoTen(String hoTen) {
            this.hoTen = hoTen;
        }

        public String getSdt() {
            return sdt;
        }

        public void setSdt(String sdt) {
            this.sdt = sdt;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getDiaChiCuThe() {
            return diaChiCuThe;
        }

        public void setDiaChiCuThe(String diaChiCuThe) {
            this.diaChiCuThe = diaChiCuThe;
        }
    }

    public Integer getIdTaiKhoan() {
        return idTaiKhoan;
    }

    public void setIdTaiKhoan(Integer idTaiKhoan) {
        this.idTaiKhoan = idTaiKhoan;
    }

    public List<CartItemDTO> getCartItems() {
        return cartItems;
    }

    public void setCartItems(List<CartItemDTO> cartItems) {
        this.cartItems = cartItems;
    }

    public ThongTinGiaoHangDTO getThongTinGiaoHang() {
        return thongTinGiaoHang;
    }

    public void setThongTinGiaoHang(ThongTinGiaoHangDTO thongTinGiaoHang) {
        this.thongTinGiaoHang = thongTinGiaoHang;
    }

    public Integer getDiscountId() {
        return discountId;
    }

    public void setDiscountId(Integer discountId) {
        this.discountId = discountId;
    }
}
