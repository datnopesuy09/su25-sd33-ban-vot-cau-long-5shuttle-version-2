package com.example.da_be.service;

import com.example.da_be.dto.*;
import com.example.da_be.entity.GioHang;
import com.example.da_be.entity.HinhAnh;
import com.example.da_be.entity.SanPhamCT;
import com.example.da_be.entity.User;
import com.example.da_be.exception.ResourceNotFoundException;
import com.example.da_be.repository.GioHangRepository;
import com.example.da_be.repository.HinhAnhRepository;
import com.example.da_be.repository.SanPhamCTRepository;
import com.example.da_be.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class GioHangService {

    @Autowired
    private GioHangRepository gioHangRepository;

    @Autowired
    private UserRepository taiKhoanRepository;

    @Autowired
    private HinhAnhRepository hinhAnhRepository; // Inject HinhAnhRepository

    @Autowired
    private SanPhamCTRepository sanPhamCTRepository;

    public GioHang themSanPhamVaoGioHang(Integer idTaiKhoan, Integer idSanPhamCT, Integer soLuong) {
        // 1. Validate input
        User taiKhoan = taiKhoanRepository.findById(idTaiKhoan)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tài khoản với ID: " + idTaiKhoan));

        SanPhamCT sanPhamCT = sanPhamCTRepository.findById(idSanPhamCT)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm chi tiết với ID: " + idSanPhamCT));

        if (soLuong <= 0) {
            throw new IllegalArgumentException("Số lượng phải lớn hơn 0");
        }

        // 2. Check if the product is already in the cart
        Optional<GioHang> existingCartItem = gioHangRepository.findByTaiKhoanAndSanPhamCT(taiKhoan, sanPhamCT);

        if (existingCartItem.isPresent()) {
            // 3. If the product is already in the cart, update the quantity
            GioHang cartItem = existingCartItem.get();
            int newQuantity = cartItem.getSoLuong() + soLuong;

            // Check if the new quantity exceeds the available stock
            if (newQuantity > sanPhamCT.getSoLuong()) {
                throw new IllegalArgumentException("Số lượng trong giỏ hàng vượt quá số lượng tồn kho.");
            }

            cartItem.setSoLuong(newQuantity);
            cartItem.setNgaySua(new Date());
            return gioHangRepository.save(cartItem);
        } else {
            // 4. If the product is not in the cart, create a new cart item
            if (soLuong > sanPhamCT.getSoLuong()) {
                throw new IllegalArgumentException("Số lượng thêm vào giỏ hàng vượt quá số lượng tồn kho.");
            }

            GioHang newCartItem = new GioHang();
            newCartItem.setTaiKhoan(taiKhoan);
            newCartItem.setSanPhamCT(sanPhamCT);
            newCartItem.setSoLuong(soLuong);
            newCartItem.setNgayTao(new Date());
            newCartItem.setNgaySua(new Date());
            return gioHangRepository.save(newCartItem);
        }
    }

    public List<GioHangDTO> getGioHangByTaiKhoan(Integer idTaiKhoan) {
        User taiKhoan = taiKhoanRepository.findById(idTaiKhoan)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tài khoản với ID: " + idTaiKhoan));
        List<GioHang> gioHangList = gioHangRepository.findByTaiKhoan(taiKhoan);
        return gioHangList.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    private GioHangDTO convertToDTO(GioHang gioHang) {
        GioHangDTO dto = new GioHangDTO();
        dto.setId(gioHang.getId());
        dto.setSoLuong(gioHang.getSoLuong());
        SanPhamCT sanPhamCT = gioHang.getSanPhamCT();
        SanPhamCTDTO sanPhamCTDTO = new SanPhamCTDTO();
        sanPhamCTDTO.setId(sanPhamCT.getId());
        sanPhamCTDTO.setTen(sanPhamCT.getSanPham().getTen());
        sanPhamCTDTO.setDonGia(sanPhamCT.getDonGia());
        sanPhamCTDTO.setSoLuong(sanPhamCT.getSoLuong());

        // Lấy giá khuyến mãi
        sanPhamCTDTO.setGiaKhuyenMai(sanPhamCT.getGiaKhuyenMai());

        // Lấy giá trị khuyến mãi từ bảng KhuyenMai
        sanPhamCTDTO.setGiaTriKhuyenMai(sanPhamCT.getGiaTriKhuyenMai());



        // Lấy URL ảnh từ bảng HinhAnh (ví dụ: lấy ảnh đầu tiên)
        String hinhAnhUrl = hinhAnhRepository.findFirstBySanPhamCT_Id(sanPhamCT.getId())
                .map(HinhAnh::getLink)
                .orElse(null); // Hoặc URL mặc định nếu không tìm thấy ảnh
        dto.setHinhAnhUrl(hinhAnhUrl);
        dto.setSanPhamCT(sanPhamCTDTO);
        //Map Thuong Hieu
        ThuongHieuDTO thuongHieuDTO = new ThuongHieuDTO();
        thuongHieuDTO.setId(sanPhamCT.getThuongHieu().getId());
        thuongHieuDTO.setTen(sanPhamCT.getThuongHieu().getTen());
        sanPhamCTDTO.setThuongHieu(thuongHieuDTO);
        //Map Trong Luong
        TrongLuongDTO trongLuongDTO = new TrongLuongDTO();
        trongLuongDTO.setId(sanPhamCT.getTrongLuong().getId());
        trongLuongDTO.setTen(sanPhamCT.getTrongLuong().getTen());
        sanPhamCTDTO.setTrongLuong(trongLuongDTO);
        //Map Mau Sac
        MauSacDTO mauSacDTO = new MauSacDTO();
        mauSacDTO.setId(sanPhamCT.getMauSac().getId());
        mauSacDTO.setTen(sanPhamCT.getMauSac().getTen());
        sanPhamCTDTO.setMauSac(mauSacDTO);
        return dto;
    }
    public double calculateTotalPrice(Integer idTaiKhoan) {
        List<GioHangDTO> gioHangList = getGioHangByTaiKhoan(idTaiKhoan);
        return gioHangList.stream()
                .mapToDouble(item -> {
                    // Kiểm tra xem sản phẩm có giá khuyến mãi hay không
                    double price = item.getSanPhamCT().getGiaKhuyenMai() != null ?
                            item.getSanPhamCT().getGiaKhuyenMai() :
                            item.getSanPhamCT().getDonGia();
                    return price * item.getSoLuong();
                })
                .sum();
    }


    public void xoaSanPhamKhoiGioHang(Integer id) {
        gioHangRepository.deleteById(id);
    }

    public void capNhatSoLuong(Integer idGioHang, Integer soLuongMoi) {
        GioHang gioHang = gioHangRepository.findById(idGioHang)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy mục giỏ hàng với ID: " + idGioHang));
        if (soLuongMoi < 1) {
            // Nếu số lượng mới nhỏ hơn 1, có thể bạn muốn xóa sản phẩm hoặc báo lỗi
            throw new IllegalArgumentException("Số lượng phải lớn hơn hoặc bằng 1");
        }
        SanPhamCT sanPhamCT = gioHang.getSanPhamCT();
        if (soLuongMoi > sanPhamCT.getSoLuong()) {
            throw new IllegalArgumentException("Số lượng vượt quá số lượng tồn kho");
        }
        gioHang.setSoLuong(soLuongMoi);
        gioHang.setNgaySua(new Date());
        gioHangRepository.save(gioHang);
    }


    public int getTotalItemCount(Integer idTaiKhoan) {
        List<GioHang> gioHangList = gioHangRepository.findByTaiKhoan(taiKhoanRepository.findById(idTaiKhoan)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tài khoản với ID: " + idTaiKhoan)));
        return gioHangList.size();
    }



    public void xoaGioHangByTaiKhoan(Integer idTaiKhoan) {
        User taiKhoan = taiKhoanRepository.findById(idTaiKhoan)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tài khoản với ID: " + idTaiKhoan));

        List<GioHang> gioHangList = gioHangRepository.findByTaiKhoan(taiKhoan);
        if (!gioHangList.isEmpty()) {
            gioHangRepository.deleteAll(gioHangList);
        }
    }

    public void xoaSanPhamDatHang(List<Integer> ids) {
        List<GioHang> danhSach = gioHangRepository.findAllById(ids);
        gioHangRepository.deleteAll(danhSach);
    }

}
