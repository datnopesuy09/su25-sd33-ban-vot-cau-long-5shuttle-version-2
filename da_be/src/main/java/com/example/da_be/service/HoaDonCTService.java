package com.example.da_be.service;

import com.example.da_be.dto.*;
import com.example.da_be.entity.*;
import com.example.da_be.exception.ResourceNotFoundException;
import com.example.da_be.repository.HinhAnhRepository;
import com.example.da_be.repository.HoaDonCTRepository;
import com.example.da_be.repository.HoaDonRepository;
import com.example.da_be.repository.SanPhamCTRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class HoaDonCTService {

    @Autowired
    private HoaDonCTRepository hoaDonCTRepository ;

    @Autowired
    private HoaDonRepository hoaDonRepository ;

    @Autowired
    private HinhAnhRepository hinhAnhRepository; // Inject HinhAnhRepository

    @Autowired
    private SanPhamCTRepository sanPhamCTRepository;

    public List<HoaDonCTDTO> getHoaDonCTByHoaDon(Integer idHoaDon) {
        HoaDon hoaDon = hoaDonRepository.findById(idHoaDon)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tài khoản với ID: " + idHoaDon));
        List<HoaDonCT> hoaDonCTList = hoaDonCTRepository.findByHoaDon(hoaDon);
        return hoaDonCTList.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    private HoaDonCTDTO convertToDTO(HoaDonCT hoaDonCT) {
        HoaDonCTDTO dto = new HoaDonCTDTO();
        dto.setId(hoaDonCT.getId());
        dto.setSoLuong(hoaDonCT.getSoLuong());
        dto.setGiaBan(hoaDonCT.getSoLuong()*hoaDonCT.getSanPhamCT().getDonGia());
        SanPhamCT sanPhamCT = hoaDonCT.getSanPhamCT();
        SanPhamCTDTO sanPhamCTDTO = new SanPhamCTDTO();
        sanPhamCTDTO.setId(sanPhamCT.getId());
        sanPhamCTDTO.setTen(sanPhamCT.getSanPham().getTen());
        sanPhamCTDTO.setDonGia(sanPhamCT.getDonGia());
        sanPhamCTDTO.setSoLuong(sanPhamCT.getSoLuong());
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


    @Transactional
    public void updateQuantity(Integer hoaDonCTId, Integer newQuantity) {
        // Lấy chi tiết hóa đơn
        HoaDonCT hoaDonCT = hoaDonCTRepository.findById(hoaDonCTId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy hóa đơn chi tiết với ID: " + hoaDonCTId));
        // Lấy sản phẩm chi tiết liên quan
        SanPhamCT sanPhamCT = hoaDonCT.getSanPhamCT();
        // Cập nhật số lượng trong hóa đơn chi tiết
        int oldQuantity = hoaDonCT.getSoLuong();
        hoaDonCT.setSoLuong(newQuantity);
        hoaDonCTRepository.save(hoaDonCT);
        // Cập nhật số lượng trong kho
        int quantityDifference = newQuantity - oldQuantity;
        int updatedStock = sanPhamCT.getSoLuong() - quantityDifference;
        // Kiểm tra số lượng không âm
        if (updatedStock < 0) {
            throw new IllegalArgumentException("Số lượng trong kho không đủ.");
        }
        // Cập nhật số lượng trong sản phẩm chi tiết
        sanPhamCT.setSoLuong(updatedStock);
        sanPhamCTRepository.save(sanPhamCT);
    }


    public List<HoaDonCT> getAllHoaDonCT() {
        return hoaDonCTRepository.findAll();
    }
    public HoaDonCT getHoaDonCTById(int id) {
        return hoaDonCTRepository.findById(id).orElse(null);
    }
    public HoaDonCT saveOrUpdateHoaDonCT(HoaDonCT hoaDonCT) {
        return hoaDonCTRepository.save(hoaDonCT);
    }
    public void deleteHoaDonCTById(int id) {
        hoaDonCTRepository.deleteById(id);
    }
    public List<HoaDonCT> getHoaDonCTByHoaDonId(int hoaDonId) {
        return hoaDonCTRepository.findByHoaDonId(hoaDonId);
    }
    public List<HoaDonCT> getHoaDonCTBySanPhamCTId(int sanPhamCTId) {
        return hoaDonCTRepository.findBySanPhamCTId(sanPhamCTId);
    }
    public HoaDonCT updateHoaDonCTStatus(int id, int newStatus) {
        HoaDonCT hoaDonCT = hoaDonCTRepository.findById(id).orElse(null);
        if (hoaDonCT != null) {
            hoaDonCT.setTrangThai(newStatus);
            return hoaDonCTRepository.save(hoaDonCT);
        }
        return null;
    }
}
