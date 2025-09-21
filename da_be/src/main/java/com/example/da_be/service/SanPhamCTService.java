package com.example.da_be.service;

import com.example.da_be.dto.*;
import com.example.da_be.entity.HinhAnh;
import com.example.da_be.entity.SanPham;
import com.example.da_be.entity.SanPhamCT;
import com.example.da_be.entity.SanPhamKhuyenMai;
import com.example.da_be.exception.ResourceNotFoundException;
import com.example.da_be.repository.HinhAnhRepository;
import com.example.da_be.repository.SanPhamCTRepository;
import com.example.da_be.repository.SanPhamKhuyenMaiRepository;
import com.example.da_be.repository.SanPhamRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class SanPhamCTService {
    @Autowired
    private SanPhamCTRepository sanPhamCTRepository;

    @Autowired
    private HinhAnhRepository hinhAnhRepository;
    @Autowired
    private SanPhamKhuyenMaiRepository sanPhamKhuyenMaiRepository;
    
    @Autowired
    private SanPhamRepository sanPhamRepository;

    // Lấy tất cả sản phẩm chi tiết
    public List<SanPhamCT> getAllSanPhamCT() {
        return sanPhamCTRepository.findAll();
    }

    // Lấy sản phẩm chi tiết theo ID
    public SanPhamCT getSanPhamCTById(int id) {
        return sanPhamCTRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SanPhamCT not found with id " + id));
    }

    // Lưu hoặc cập nhật sản phẩm chi tiết
    public SanPhamCT saveOrUpdateSanPhamCT(SanPhamCT sanPhamCT) {
        return sanPhamCTRepository.save(sanPhamCT);
    }

    // Xóa sản phẩm chi tiết theo ID
    public void deleteSanPhamCTById(int id) {
        sanPhamCTRepository.deleteById(id);
    }

    // Lấy sản phẩm chi tiết theo ID sản phẩm
    public List<SanPhamCT> getSanPhamCTByProductId(Integer productId) {
        return sanPhamCTRepository.findBySanPham_Id(productId);
    }

    // Cập nhật URL hình ảnh
    public void updateHinhAnhUrls(int sanPhamCTId, List<String> hinhAnhUrls) {
        SanPhamCT sanPhamCT = sanPhamCTRepository.findById(sanPhamCTId)
                .orElseThrow(() -> new ResourceNotFoundException("SanPhamCT not found with id " + sanPhamCTId));

        // Xóa tất cả hình ảnh hiện tại
        List<HinhAnh> existingHinhAnhs = sanPhamCT.getHinhAnh();
        for (HinhAnh hinhAnh : existingHinhAnhs) {
            hinhAnhRepository.delete(hinhAnh);
        }

        // Thêm hình ảnh mới
        for (String url : hinhAnhUrls) {
            HinhAnh newHinhAnh = new HinhAnh();
            newHinhAnh.setLink(url);
            newHinhAnh.setTrangThai(1); // Ví dụ: 1 cho trạng thái hoạt động
            newHinhAnh.setSanPhamCT(sanPhamCT); // Thiết lập sản phẩm liên quan
            hinhAnhRepository.save(newHinhAnh);
        }
    }

    // Cập nhật số lượng sản phẩm
    @Transactional
    public void updateQuantity(Long id, Integer soLuong) {
        SanPhamCT sanPhamCT = sanPhamCTRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sản phẩm chi tiết không tồn tại"));

        // Kiểm tra số lượng không âm
        if (soLuong < 0) {
            throw new IllegalArgumentException("Số lượng không được âm");
        }

        // Cập nhật số lượng
        sanPhamCT.setSoLuong(soLuong);
        sanPhamCTRepository.save(sanPhamCT);
    }



    // Lấy danh sách sản phẩm chi tiết tóm tắt
    public List<SanPhamCTListDTO> getAllSanPhamCTSummary() {
        List<SanPhamCT> sanPhamCTList = sanPhamCTRepository.findAll();

        // Sử dụng Map để lưu trữ sản phẩm đã thấy
        Map<Integer, SanPhamCTListDTO> uniqueProducts = new HashMap<>();

        for (SanPhamCT spct : sanPhamCTList) {
            // Lấy tên sản phẩm
            String tenSanPham = spct.getSanPham() != null ? spct.getSanPham().getTen() : null;

            // Nếu sản phẩm chưa tồn tại trong Map, thêm vào
            if (tenSanPham != null && !uniqueProducts.containsKey(spct.getSanPham().getId())) {
                String anhDaiDien = null;
                if (spct.getHinhAnh() != null && !spct.getHinhAnh().isEmpty()) {
                    // Lấy link ảnh đầu tiên làm ảnh đại diện
                    anhDaiDien = spct.getHinhAnh().get(0).getLink();
                }
                SanPhamCTListDTO dto = new SanPhamCTListDTO(
                        spct.getSanPham().getId(),
                        tenSanPham,
                        spct.getDonGia(),
                        anhDaiDien
                );
                uniqueProducts.put(spct.getSanPham().getId(), dto);
            }
        }

        // Trả về danh sách các sản phẩm duy nhất
        return new ArrayList<>(uniqueProducts.values());
    }


    // Lấy thông tin chi tiết sản phẩm
    public SanPhamCTDetailDTO getSanPhamCTDetail(Integer sanPhamId) {
        // Lấy danh sách tất cả SanPhamCT theo sản phẩm cha và chỉ lấy những biến thể active (trangThai = 1)
        List<SanPhamCT> sanPhamCTList = sanPhamCTRepository.findBySanPham_Id(sanPhamId)
                .stream()
                .filter(spct -> spct.getTrangThai() != null && spct.getTrangThai() == 1)
                .collect(Collectors.toList());
        if (sanPhamCTList.isEmpty()) {
            throw new ResourceNotFoundException("No active SanPhamCT found for SanPham id " + sanPhamId);
        }
        // Lấy thông tin chung sản phẩm từ sản phẩm cha
        SanPham sanPham = sanPhamCTList.get(0).getSanPham();
        SanPhamCTDetailDTO detailDTO = new SanPhamCTDetailDTO();
        detailDTO.setId(sanPham.getId());
        detailDTO.setTenSanPham(sanPham.getTen());
        // Mô tả, donGia, soLuong có thể lấy từ 1 bản SanPhamCT (ví dụ bản đầu tiên)
        SanPhamCT spctDauTien = sanPhamCTList.get(0);

        detailDTO.setMoTa(spctDauTien.getMoTa());
        detailDTO.setTrangThai(spctDauTien.getTrangThai());
        detailDTO.setDonGia(spctDauTien.getDonGia());
        detailDTO.setSoLuong(spctDauTien.getSoLuong());
        // ThuongHieu
        detailDTO.setThuongHieu(spctDauTien.getThuongHieu() != null ? spctDauTien.getThuongHieu().getTen() : "");
        // ChatLieu
        detailDTO.setChatLieu(spctDauTien.getChatLieu() != null ? spctDauTien.getChatLieu().getTen() : "");
        // DiemCanBang
        detailDTO.setDiemCanBang(spctDauTien.getDiemCanBang() != null ? spctDauTien.getDiemCanBang().getTen() : "");
        // DoCung
        detailDTO.setDoCung(spctDauTien.getDoCung() != null ? spctDauTien.getDoCung().getTen() : "");
        // Gom tất cả hình ảnh liên quan của các SanPhamCT thành danh sách url duy nhất
        Set<String> allImageUrls = sanPhamCTList.stream()
                .flatMap(spct -> spct.getHinhAnh().stream())
                .map(hinhAnh -> hinhAnh.getLink())
                .collect(Collectors.toSet());
        detailDTO.setHinhAnhUrls(new ArrayList<>(allImageUrls));
        // Lấy danh sách màu sắc và trọng lượng duy nhất có trong tất cả bản ghi SanPhamCT
        Set<String> allColors = sanPhamCTList.stream()
                .map(spct -> spct.getMauSac() != null ? spct.getMauSac().getTen() : null)
                .filter(Objects::nonNull)
                .collect(Collectors.toCollection(LinkedHashSet::new));
        detailDTO.setMauSac(new ArrayList<>(allColors));
        Set<String> allWeights = sanPhamCTList.stream()
                .map(spct -> spct.getTrongLuong() != null ? spct.getTrongLuong().getTen() : null)
                .filter(Objects::nonNull)
                .collect(Collectors.toCollection(LinkedHashSet::new));
        detailDTO.setTrongLuong(new ArrayList<>(allWeights));
        // Tạo biến thể bằng tổ hợp màu và trọng lượng
        List<VariantDTO> variants = new ArrayList<>();
        for (String color : allColors) {
            for (String weight : allWeights) {
                // Tìm SanPhamCT có màu và trọng lượng phù hợp
                Optional<SanPhamCT> variantOpt = sanPhamCTList.stream()
                        .filter(spct -> spct.getMauSac() != null && spct.getMauSac().getTen().equals(color)
                                && spct.getTrongLuong() != null && spct.getTrongLuong().getTen().equals(weight))
                        .findFirst();
                if (variantOpt.isPresent()) {
                    SanPhamCT matched = variantOpt.get();
                    VariantDTO variantDTO = new VariantDTO();
                    variantDTO.setId(matched.getId());
                    variantDTO.setMaSanPham(matched.getMa());
                    variantDTO.setMauSacTen(color);
                    variantDTO.setTrongLuongTen(weight);
                    variantDTO.setDonGia(matched.getDonGia());
                    variantDTO.setSoLuong(matched.getSoLuong());
                    variantDTO.setTrangThai(matched.getTrangThai());
                    List<String> imageUrls = matched.getHinhAnh().stream()
                            .map(h -> h.getLink())
                            .collect(Collectors.toList());
                    variantDTO.setHinhAnhUrls(imageUrls);
                    variants.add(variantDTO);
                }
            }
        }
        detailDTO.setVariants(variants);
        return detailDTO;
    }


    public List<SanPhamCTFullDTO> getAllSanPhamCTWithImage() {
        List<SanPhamCT> sanPhamCTList = sanPhamCTRepository.findAll();
        return sanPhamCTList.stream().map(spct -> {
            String anhDaiDien = null;
            if (spct.getHinhAnh() != null && !spct.getHinhAnh().isEmpty()) {
                anhDaiDien = spct.getHinhAnh().get(0).getLink();
            }

            // Lấy giá khuyến mãi và giá trị khuyến mãi
            Integer giaKhuyenMai = null;
            Integer giaTriKhuyenMai = null;

            List<SanPhamKhuyenMai> promotions = sanPhamKhuyenMaiRepository.findActivePromotionsBySanPhamCTId(spct.getId());
            if (!promotions.isEmpty()) {
                SanPhamKhuyenMai promotion = promotions.get(0);
                giaKhuyenMai = promotion.getGiaKhuyenMai() != null ? promotion.getGiaKhuyenMai() : null;
                giaTriKhuyenMai = promotion.getKhuyenMai() != null ? promotion.getKhuyenMai().getGiaTri() : null;
            }

            return new SanPhamCTFullDTO(
                    spct.getId(),
                    spct.getMa(),
                    spct.getMoTa(),
                    spct.getSoLuong(),
                    spct.getDonGia(),
                    spct.getTrangThai(),
                    spct.getSanPham() != null ? spct.getSanPham().getTen() : null,
                    spct.getThuongHieu() != null ? spct.getThuongHieu().getTen() : null,
                    spct.getMauSac() != null ? spct.getMauSac().getTen() : null,
                    spct.getChatLieu() != null ? spct.getChatLieu().getTen() : null,
                    spct.getTrongLuong() != null ? spct.getTrongLuong().getTen() : null,
                    spct.getDiemCanBang() != null ? spct.getDiemCanBang().getTen() : null,
                    spct.getDoCung() != null ? spct.getDoCung().getTen() : null,
                    anhDaiDien,
                    giaKhuyenMai, // Thêm giá khuyến mãi
                    giaTriKhuyenMai // Thêm giá trị khuyến mãi
            );
        }).collect(Collectors.toList());
    }




    public SanPhamCTDetailDTO getSanPhamCTDetailWithPromotion(Integer sanPhamId) {
        // Lấy danh sách tất cả SanPhamCT theo sản phẩm cha và chỉ lấy những biến thể active (trangThai = 1)
        List<SanPhamCT> sanPhamCTList = sanPhamCTRepository.findBySanPham_Id(sanPhamId)
                .stream()
                .filter(spct -> spct.getTrangThai() != null && spct.getTrangThai() == 1)
                .collect(Collectors.toList());
        if (sanPhamCTList.isEmpty()) {
            throw new ResourceNotFoundException("No active SanPhamCT found for SanPham id " + sanPhamId);
        }

        // Lấy thông tin chung sản phẩm từ sản phẩm cha
        SanPham sanPham = sanPhamCTList.get(0).getSanPham();
        SanPhamCTDetailDTO detailDTO = new SanPhamCTDetailDTO();
        detailDTO.setId(sanPham.getId());
        detailDTO.setTenSanPham(sanPham.getTen());
        SanPhamCT spctDauTien = sanPhamCTList.get(0);
        detailDTO.setMoTa(spctDauTien.getMoTa());
        detailDTO.setDonGia(spctDauTien.getDonGia());
        detailDTO.setSoLuong(spctDauTien.getSoLuong());
        detailDTO.setThuongHieu(spctDauTien.getThuongHieu() != null ? spctDauTien.getThuongHieu().getTen() : "");
        detailDTO.setChatLieu(spctDauTien.getChatLieu() != null ? spctDauTien.getChatLieu().getTen() : "");
        detailDTO.setDiemCanBang(spctDauTien.getDiemCanBang() != null ? spctDauTien.getDiemCanBang().getTen() : "");
        detailDTO.setDoCung(spctDauTien.getDoCung() != null ? spctDauTien.getDoCung().getTen() : "");

        // Lấy danh sách hình ảnh
        Set<String> allImageUrls = sanPhamCTList.stream()
                .flatMap(spct -> spct.getHinhAnh().stream())
                .map(HinhAnh::getLink)
                .collect(Collectors.toSet());
        detailDTO.setHinhAnhUrls(new ArrayList<>(allImageUrls));

        // Lấy danh sách màu sắc và trọng lượng duy nhất
        Set<String> allColors = sanPhamCTList.stream()
                .map(spct -> spct.getMauSac() != null ? spct.getMauSac().getTen() : null)
                .filter(Objects::nonNull)
                .collect(Collectors.toCollection(LinkedHashSet::new));
        detailDTO.setMauSac(new ArrayList<>(allColors));

        Set<String> allWeights = sanPhamCTList.stream()
                .map(spct -> spct.getTrongLuong() != null ? spct.getTrongLuong().getTen() : null)
                .filter(Objects::nonNull)
                .collect(Collectors.toCollection(LinkedHashSet::new));
        detailDTO.setTrongLuong(new ArrayList<>(allWeights));

        // Tạo biến thể bằng tổ hợp màu và trọng lượng
        List<VariantDTO> variants = new ArrayList<>();
        for (String color : allColors) {
            for (String weight : allWeights) {
                Optional<SanPhamCT> variantOpt = sanPhamCTList.stream()
                        .filter(spct -> spct.getMauSac() != null && spct.getMauSac().getTen().equals(color)
                                && spct.getTrongLuong() != null && spct.getTrongLuong().getTen().equals(weight))
                        .findFirst();
                if (variantOpt.isPresent()) {
                    SanPhamCT matched = variantOpt.get();
                    VariantDTO variantDTO = new VariantDTO();
                    variantDTO.setId(matched.getId());
                    variantDTO.setMauSacTen(color);
                    variantDTO.setTrongLuongTen(weight);
                    variantDTO.setDonGia(matched.getDonGia());
                    variantDTO.setSoLuong(matched.getSoLuong());
                    variantDTO.setTrangThai(matched.getTrangThai());
                    variantDTO.setHinhAnhUrls(matched.getHinhAnh().stream()
                            .map(HinhAnh::getLink)
                            .collect(Collectors.toList()));

                    // Lấy giá khuyến mãi và giá trị khuyến mãi
                    getPromotionPrice(matched.getId(), variantDTO);

                    variants.add(variantDTO);
                }
            }
        }
        detailDTO.setVariants(variants);
        return detailDTO;
    }


    // Phương thức để lấy giá khuyến mãi
    private Double getPromotionPrice(Integer sanPhamCTId, VariantDTO variantDTO) {
        // Lấy danh sách khuyến mãi đang hoạt động cho sản phẩm chi tiết
        List<SanPhamKhuyenMai> promotions = sanPhamKhuyenMaiRepository.findActivePromotionsBySanPhamCTId(sanPhamCTId);

        if (promotions.isEmpty()) {
            return null; // Không có khuyến mãi
        }

        // Giả sử mỗi sản phẩm chỉ có một khuyến mãi đang hoạt động
        SanPhamKhuyenMai promotion = promotions.get(0);

        // Gán giá trị khuyến mãi vào variantDTO
        variantDTO.setGiaKhuyenMai(promotion.getGiaKhuyenMai().doubleValue());
        variantDTO.setGiaTriKhuyenMai(promotion.getKhuyenMai().getGiaTri()); // Lấy giá trị khuyến mãi

        // Nếu giá khuyến mãi đã được tính sẵn trong bảng SanPham_KhuyenMai
        if (promotion.getGiaKhuyenMai() != null) {
            return promotion.getGiaKhuyenMai().doubleValue(); // Trả về giá khuyến mãi
        }

        // Nếu không có giá khuyến mãi, có thể tính toán dựa trên loại khuyến mãi
        SanPhamCT sanPhamCT = sanPhamCTRepository.findById(sanPhamCTId)
                .orElseThrow(() -> new ResourceNotFoundException("SanPhamCT not found"));

        double originalPrice = sanPhamCT.getDonGia();
        int discountValue = promotion.getKhuyenMai().getGiaTri(); // Lấy giá trị khuyến mãi

        // Kiểm tra loại khuyến mãi
        if (promotion.getKhuyenMai().getLoai()) { // Nếu loại là true, giảm theo phần trăm
            return originalPrice * (1 - discountValue / 100.0);
        } else { // Nếu loại là false, giảm theo giá cố định
            return originalPrice - discountValue;
        }
    }


    public List<SanPhamCTListDTOo> getAllSanPhamCTWithPromotions() {
        return sanPhamCTRepository.findAllWithPromotions();
    }


    // Cập nhật trạng thái sản phẩm cha dựa trên trạng thái của tất cả biến thể
    @Transactional
    public void updateParentProductStatus(Integer sanPhamId) {
        // Lấy tất cả biến thể của sản phẩm
        List<SanPhamCT> variants = sanPhamCTRepository.findBySanPham_Id(sanPhamId);
        
        if (variants.isEmpty()) {
            return; // Không có biến thể nào
        }
        
        // Kiểm tra xem có biến thể nào còn active không
        boolean hasActiveVariant = variants.stream()
                .anyMatch(variant -> variant.getTrangThai() != null && variant.getTrangThai() == 1);
        
        // Lấy sản phẩm cha
        SanPham parentProduct = variants.get(0).getSanPham();
        
        // Cập nhật trạng thái sản phẩm cha
        if (hasActiveVariant) {
            parentProduct.setTrangThai(1); // Active
        } else {
            parentProduct.setTrangThai(0); // Inactive
        }
        
        // Lưu sản phẩm cha
        sanPhamRepository.save(parentProduct);
    }

    public List<SanPhamCTListDTOo> getAllSanPhamCTSummaryy() {
        List<SanPhamCT> sanPhamCTList = sanPhamCTRepository.findAll();

        // Sử dụng Map để lưu trữ sản phẩm đã thấy
        Map<Integer, SanPhamCTListDTOo> uniqueProducts = new HashMap<>();

        for (SanPhamCT spct : sanPhamCTList) {
            String tenSanPham = spct.getSanPham() != null ? spct.getSanPham().getTen() : null;

            if (tenSanPham != null && !uniqueProducts.containsKey(spct.getSanPham().getId())) {
                String anhDaiDien = null;
                if (spct.getHinhAnh() != null && !spct.getHinhAnh().isEmpty()) {
                    anhDaiDien = spct.getHinhAnh().get(0).getLink();
                }

                // Lấy giá khuyến mãi và giá trị khuyến mãi
                Double giaKhuyenMai = null;
                Integer giaTri = null;

                // Lấy danh sách khuyến mãi đang hoạt động cho sản phẩm chi tiết
                List<SanPhamKhuyenMai> promotions = sanPhamKhuyenMaiRepository.findActivePromotionsBySanPhamCTId(spct.getId());
                if (!promotions.isEmpty()) {
                    SanPhamKhuyenMai promotion = promotions.get(0);
                    giaKhuyenMai = promotion.getGiaKhuyenMai() != null ? promotion.getGiaKhuyenMai().doubleValue() : null;
                    giaTri = promotion.getKhuyenMai() != null ? promotion.getKhuyenMai().getGiaTri() : null;
                }

                SanPhamCTListDTOo dto = new SanPhamCTListDTOo(
                        spct.getSanPham().getId(),
                        tenSanPham,
                        spct.getDonGia(),
                        anhDaiDien,
                        giaKhuyenMai,
                        giaTri
                );
                uniqueProducts.put(spct.getSanPham().getId(), dto);
            }
        }

        return new ArrayList<>(uniqueProducts.values());
    }


}
