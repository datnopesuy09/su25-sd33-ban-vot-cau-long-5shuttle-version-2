package com.example.da_be.service.impl;

import com.example.da_be.dto.request.KhuyenMaiRequest;
import com.example.da_be.dto.request.KhuyenMaiSearch;
import com.example.da_be.dto.request.SanPhamCTSearch;
import com.example.da_be.dto.request.SanPhamSearch;
import com.example.da_be.dto.response.KhuyenMaiResponse;
import com.example.da_be.dto.response.SanPhamCTResponse;
import com.example.da_be.dto.response.SanPhamResponse;
import com.example.da_be.entity.KhuyenMai;
import com.example.da_be.entity.SanPhamCT;
import com.example.da_be.entity.SanPhamKhuyenMai;
import com.example.da_be.repository.DotGiamGiaRepository;
import com.example.da_be.repository.SanPhamCTRepository;
import com.example.da_be.repository.SanPhamKhuyenMaiRepository;
import com.example.da_be.service.DotGiamGiaService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class DotGiamGiaServiceImpl implements DotGiamGiaService {
    @Autowired
    private DotGiamGiaRepository dotGiamGiaRepository;

    @Autowired
    private SanPhamCTRepository sanPhamChiTietRepository;

    @Autowired
    private SanPhamKhuyenMaiRepository sanPhamKhuyenMaiRepository;

    @Override
    public List<KhuyenMaiResponse> getAllKhuyenMai() {
        return dotGiamGiaRepository.getAllKhuyenMai();
    }

    @Override
    public List<SanPhamResponse> getAllSanPhamByTen(String ten) {
        return dotGiamGiaRepository.getAllSanPhamByTen(ten);
    }

    @Override
    public List<SanPhamCTResponse> getAllSanPhamChiTiet() {
        return dotGiamGiaRepository.getAllSanPhamChiTiet();
    }

    @Override
    public List<SanPhamCTResponse> getSanPhamChiTietBySanPham(List<Integer> id) {
        return dotGiamGiaRepository.getSanPhamChiTietBySanPham(id);
    }

//    @Override
//    public KhuyenMai addKhuyenMaiOnProduct(KhuyenMaiRequest khuyenMaiRequest) {
//        KhuyenMai khuyenMai = khuyenMaiRequest.newKhuyenMaiAddSanPham(new KhuyenMai());
//        khuyenMaiRepository.save(khuyenMai);
//
//        List<SanPhamCT> spctList = sanPhamChiTietRepository.findAll();
//        List<SanPhamKhuyenMai> sanPhamKhuyenMaiList = new ArrayList<>();
//
//        // Nếu type == false: Áp dụng cho TẤT CẢ sản phẩm
//        if (khuyenMaiRequest.getLoai() == false) {
//            for (SanPhamCT spct : spctList) {
//                SanPhamRequest addRequest = new SanPhamRequest();
//                addRequest.setKhuyenMai(khuyenMai);
//                addRequest.setSanPhamChiTiet(spct);
//                SanPhamKhuyenMai sanPhamKhuyenMai = addRequest.newSanPhamKhuyenMai(new SanPhamKhuyenMai());
//                sanPhamKhuyenMaiList.add(sanPhamKhuyenMai);
//            }
//        }
//        // Nếu type == true: Áp dụng cho các sản phẩm ĐƯỢC CHỌN
//        else {
//            for (Integer idProductDetail : khuyenMaiRequest.getIdProductDetail()) {
//                SanPhamCT spct = sanPhamChiTietRepository.findById(idProductDetail).get();
//                SanPhamRequest addRequest = new SanPhamRequest();
//                addRequest.setKhuyenMai(khuyenMai);
//                addRequest.setSanPhamChiTiet(spct);
//                SanPhamKhuyenMai sanPhamKhuyenMai = addRequest.newSanPhamKhuyenMai(new SanPhamKhuyenMai());
//                sanPhamKhuyenMaiList.add(sanPhamKhuyenMai);
//            }
//        }
//        sanPhamKhuyenMaiRepository.saveAll(sanPhamKhuyenMaiList);
//        return khuyenMai;
//    }

    @Override
    public KhuyenMai addKhuyenMaiOnProduct(KhuyenMaiRequest khuyenMaiRequest) {
        // Kiểm tra trùng lặp khuyến mãi trước khi tạo mới
        List<Integer> productDetailIds = new ArrayList<>();
        
        if (khuyenMaiRequest.getLoai()) {
            // Nếu loại khuyến mãi là true, lấy danh sách sản phẩm được chọn
            productDetailIds = khuyenMaiRequest.getIdProductDetail();
        } else {
            // Nếu loại khuyến mãi là false, lấy tất cả sản phẩm chi tiết
            List<SanPhamCT> allProducts = sanPhamChiTietRepository.findAll();
            productDetailIds = allProducts.stream()
                    .map(SanPhamCT::getId)
                    .collect(Collectors.toList());
        }
        
        // Kiểm tra trùng lặp thời gian khuyến mãi
        if (checkPromotionOverlap(productDetailIds, khuyenMaiRequest.getTgBatDau(), khuyenMaiRequest.getTgKetThuc())) {
            String overlapDetails = getOverlapDetails(productDetailIds, khuyenMaiRequest.getTgBatDau(), khuyenMaiRequest.getTgKetThuc());
            throw new IllegalArgumentException("Không thể tạo khuyến mãi do trùng lặp thời gian: " + overlapDetails);
        }
        
        // Tạo đối tượng KhuyenMai từ request và lưu vào cơ sở dữ liệu
        KhuyenMai khuyenMai = khuyenMaiRequest.newKhuyenMaiAddSanPham(new KhuyenMai());
        dotGiamGiaRepository.save(khuyenMai);

        // Lấy danh sách tất cả sản phẩm chi tiết từ cơ sở dữ liệu
        List<SanPhamCT> spctList = sanPhamChiTietRepository.findAll();
        List<SanPhamKhuyenMai> sanPhamKhuyenMaiList = new ArrayList<>();

        // Lấy giá trị phần trăm giảm từ request
        double discountPercent = khuyenMaiRequest.getGiaTri(); // Phần trăm khuyến mãi

        // Nếu loại khuyến mãi là false, áp dụng cho tất cả sản phẩm
        if (khuyenMaiRequest.getLoai() == false) {
            for (SanPhamCT spct : spctList) {
                SanPhamKhuyenMai sanPhamKhuyenMai = new SanPhamKhuyenMai();
                sanPhamKhuyenMai.setKhuyenMai(khuyenMai);
                sanPhamKhuyenMai.setSanPhamCT(spct);

                // Tính giá khuyến mãi cho sản phẩm này
                double originalPrice = spct.getDonGia(); // Giá gốc của sản phẩm (kiểu double)
                int discountPrice = calculateDiscountPrice(originalPrice, discountPercent); // Tính giá khuyến mãi

                sanPhamKhuyenMai.setGiaKhuyenMai(discountPrice); // Lưu giá khuyến mãi vào bảng

                sanPhamKhuyenMaiList.add(sanPhamKhuyenMai);
            }
        } else { // Nếu loại khuyến mãi là true, áp dụng cho các sản phẩm được chọn
            for (Integer idProductDetail : khuyenMaiRequest.getIdProductDetail()) {
                SanPhamCT spct = sanPhamChiTietRepository.findById(idProductDetail).get();
                SanPhamKhuyenMai sanPhamKhuyenMai = new SanPhamKhuyenMai();
                sanPhamKhuyenMai.setKhuyenMai(khuyenMai);
                sanPhamKhuyenMai.setSanPhamCT(spct);

                // Tính giá khuyến mãi cho sản phẩm được chọn
                double originalPrice = spct.getDonGia(); // Giá gốc của sản phẩm (kiểu double)
                int discountPrice = calculateDiscountPrice(originalPrice, discountPercent); // Tính giá khuyến mãi

                sanPhamKhuyenMai.setGiaKhuyenMai(discountPrice); // Lưu giá khuyến mãi vào bảng

                sanPhamKhuyenMaiList.add(sanPhamKhuyenMai);
            }
        }

        // Lưu tất cả các sản phẩm khuyến mãi vào cơ sở dữ liệu
        sanPhamKhuyenMaiRepository.saveAll(sanPhamKhuyenMaiList);

        return khuyenMai;
    }

    private int calculateDiscountPrice(double originalPrice, double discountPercent) {
        // Tính giá khuyến mãi theo phần trăm
        double discountPrice = originalPrice * (1 - discountPercent / 100.0); // Giảm giá theo phần trăm

        // Đảm bảo giá không âm
        if (discountPrice < 0) {
            discountPrice = 0;
        }

        // Chuyển kết quả từ double sang int (có thể làm tròn nếu cần)
        return (int) Math.round(discountPrice); // Làm tròn giá sau khi tính toán
    }

    // cập nhật lại hàm voucher vì thêm tính giá tiền: chưa làm
//    @Override
//    public KhuyenMai updateKhuyenMai(KhuyenMaiRequest khuyenMaiRequest, Integer id) {
//        KhuyenMai existingKhuyenMai = khuyenMaiRepository.findById(id)
//                .orElseThrow(() -> new IllegalArgumentException("KhuyenMai not found for ID: " + id));
//
//        // Xóa tất cả sản phẩm khuyến mãi cũ
//        List<SanPhamKhuyenMai> oldSanPhamKhuyenMai = sanPhamKhuyenMaiRepository.getListSanPhamKhuyenMaiByIdKhuyenMai(id);
//        if (!oldSanPhamKhuyenMai.isEmpty()) {
//            sanPhamKhuyenMaiRepository.deleteAll(oldSanPhamKhuyenMai);
//        }
//
//        // Cập nhật thông tin khuyến mãi
//        KhuyenMai updatedKhuyenMai = khuyenMaiRequest.newKhuyenMaiAddSanPham(existingKhuyenMai);
//        khuyenMaiRepository.save(updatedKhuyenMai);
//
//        // Thêm mới danh sách sản phẩm khuyến mãi
//        List<SanPhamKhuyenMai> newSanPhamKhuyenMaiList = new ArrayList<>();
//        if (!khuyenMaiRequest.getLoai()) {
//            List<SanPhamCT> spctList = sanPhamChiTietRepository.findAll();
//            for (SanPhamCT spct : spctList) {
//                SanPhamKhuyenMai newSanPhamKhuyenMai = new SanPhamKhuyenMai();
//                newSanPhamKhuyenMai.setKhuyenMai(updatedKhuyenMai);
//                newSanPhamKhuyenMai.setSanPhamCT(spct);
//                newSanPhamKhuyenMaiList.add(newSanPhamKhuyenMai);
//            }
//        } else {
//            for (Integer idProductDetail : khuyenMaiRequest.getIdProductDetail()) {
//                SanPhamCT spct = sanPhamChiTietRepository.findById(idProductDetail)
//                        .orElseThrow(() -> new IllegalArgumentException("SanPhamChiTiet not found for ID: " + idProductDetail));
//                SanPhamKhuyenMai newSanPhamKhuyenMai = new SanPhamKhuyenMai();
//                newSanPhamKhuyenMai.setKhuyenMai(updatedKhuyenMai);
//                newSanPhamKhuyenMai.setSanPhamCT(spct);
//                newSanPhamKhuyenMaiList.add(newSanPhamKhuyenMai);
//            }
//        }
//        sanPhamKhuyenMaiRepository.saveAll(newSanPhamKhuyenMaiList);
//
//        return updatedKhuyenMai;
//    }

    @Override
    public KhuyenMai updateKhuyenMai(KhuyenMaiRequest khuyenMaiRequest, Integer id) {
        // Lấy thông tin khuyến mãi hiện có từ cơ sở dữ liệu
        KhuyenMai existingKhuyenMai = dotGiamGiaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("KhuyenMai not found for ID: " + id));

        // Kiểm tra trùng lặp khuyến mãi trước khi cập nhật
        List<Integer> productDetailIds = new ArrayList<>();
        
        if (khuyenMaiRequest.getLoai()) {
            // Nếu loại khuyến mãi là true, lấy danh sách sản phẩm được chọn
            productDetailIds = khuyenMaiRequest.getIdProductDetail();
        } else {
            // Nếu loại khuyến mãi là false, lấy tất cả sản phẩm chi tiết
            List<SanPhamCT> allProducts = sanPhamChiTietRepository.findAll();
            productDetailIds = allProducts.stream()
                    .map(SanPhamCT::getId)
                    .collect(Collectors.toList());
        }
        
        // Kiểm tra trùng lặp thời gian khuyến mãi (loại trừ khuyến mãi hiện tại đang cập nhật)
        List<Integer> productDetailIdsToCheck = new ArrayList<>();
        for (Integer productDetailId : productDetailIds) {
            List<KhuyenMai> existingPromotions = dotGiamGiaRepository.getPromotionsByProductDetailId(productDetailId);
            // Lọc bỏ khuyến mãi hiện tại đang cập nhật
            existingPromotions = existingPromotions.stream()
                    .filter(promotion -> !promotion.getId().equals(id))
                    .collect(Collectors.toList());
            
            // Nếu còn khuyến mãi khác, thêm vào danh sách kiểm tra
            if (!existingPromotions.isEmpty()) {
                productDetailIdsToCheck.add(productDetailId);
            }
        }
        
        if (!productDetailIdsToCheck.isEmpty() && 
            checkPromotionOverlapForUpdate(productDetailIdsToCheck, khuyenMaiRequest.getTgBatDau(), khuyenMaiRequest.getTgKetThuc(), id)) {
            String overlapDetails = getOverlapDetailsForUpdate(productDetailIdsToCheck, khuyenMaiRequest.getTgBatDau(), khuyenMaiRequest.getTgKetThuc(), id);
            throw new IllegalArgumentException("Không thể cập nhật khuyến mãi do trùng lặp thời gian: " + overlapDetails);
        }

        // Xóa tất cả các sản phẩm khuyến mãi cũ liên quan đến khuyến mãi
        List<SanPhamKhuyenMai> oldSanPhamKhuyenMai = sanPhamKhuyenMaiRepository.getListSanPhamKhuyenMaiByIdKhuyenMai(id);
        if (!oldSanPhamKhuyenMai.isEmpty()) {
            sanPhamKhuyenMaiRepository.deleteAll(oldSanPhamKhuyenMai);
        }

        // Cập nhật thông tin khuyến mãi từ request
        KhuyenMai updatedKhuyenMai = khuyenMaiRequest.newKhuyenMaiAddSanPham(existingKhuyenMai);
        dotGiamGiaRepository.save(updatedKhuyenMai);

        // Thêm mới danh sách sản phẩm khuyến mãi
        List<SanPhamKhuyenMai> newSanPhamKhuyenMaiList = new ArrayList<>();

        // Lấy giá trị phần trăm giảm từ request
        double discountPercent = khuyenMaiRequest.getGiaTri(); // Phần trăm khuyến mãi

        if (!khuyenMaiRequest.getLoai()) {
            // Nếu loại khuyến mãi là false, áp dụng cho tất cả sản phẩm
            List<SanPhamCT> spctList = sanPhamChiTietRepository.findAll();
            for (SanPhamCT spct : spctList) {
                SanPhamKhuyenMai newSanPhamKhuyenMai = new SanPhamKhuyenMai();
                newSanPhamKhuyenMai.setKhuyenMai(updatedKhuyenMai);
                newSanPhamKhuyenMai.setSanPhamCT(spct);

                // Tính giá khuyến mãi
                double originalPrice = spct.getDonGia();
                int discountPrice = calculateDiscountPrice(originalPrice, discountPercent);

                newSanPhamKhuyenMai.setGiaKhuyenMai(discountPrice);
                newSanPhamKhuyenMaiList.add(newSanPhamKhuyenMai);
            }
        } else {
            // Nếu loại khuyến mãi là true, áp dụng cho các sản phẩm được chọn
            for (Integer idProductDetail : khuyenMaiRequest.getIdProductDetail()) {
                SanPhamCT spct = sanPhamChiTietRepository.findById(idProductDetail)
                        .orElseThrow(() -> new IllegalArgumentException("SanPhamChiTiet not found for ID: " + idProductDetail));

                SanPhamKhuyenMai newSanPhamKhuyenMai = new SanPhamKhuyenMai();
                newSanPhamKhuyenMai.setKhuyenMai(updatedKhuyenMai);
                newSanPhamKhuyenMai.setSanPhamCT(spct);

                // Tính giá khuyến mãi
                double originalPrice = spct.getDonGia();
                int discountPrice = calculateDiscountPrice(originalPrice, discountPercent);

                newSanPhamKhuyenMai.setGiaKhuyenMai(discountPrice);
                newSanPhamKhuyenMaiList.add(newSanPhamKhuyenMai);
            }
        }

        // Lưu tất cả các sản phẩm khuyến mãi mới vào cơ sở dữ liệu
        sanPhamKhuyenMaiRepository.saveAll(newSanPhamKhuyenMaiList);

        return updatedKhuyenMai;
    }

    @Override
    public KhuyenMai getKhuyenMaiById(Integer id) {
        return dotGiamGiaRepository.findById(id).orElse(null);
    }

    @Override
    public List<Integer> getIdSanPhamByIdKhuyenMai(Integer idKhuyenMai) {
        return dotGiamGiaRepository.getIdSanPhamByIdKhuyenMai(idKhuyenMai);
    }

    @Override
    public List<Integer> getIdSanPhamChiTietByIdKhuyenMai(Integer idKhuyenMai) {
        return dotGiamGiaRepository.getIdSanPhamChiTietByIdKhuyenMai(idKhuyenMai);
    }

    public static SanPhamCTResponse convertToResponse(SanPhamCT entity) {
        SanPhamCTResponse dto = new SanPhamCTResponse();
        dto.setId(entity.getId());
        dto.setTenSanPham(entity.getSanPham().getTen());
        dto.setTenThuongHieu(entity.getThuongHieu().getTen());
        dto.setTenMauSac(entity.getMauSac().getTen());
        dto.setTenChatLieu(entity.getChatLieu().getTen());
        dto.setTenTrongLuong(entity.getTrongLuong().getTen());
        dto.setTenDiemCanBang(entity.getDiemCanBang().getTen());
        dto.setTenDoCung(entity.getDoCung().getTen());
        return dto;
    }

    @Override
    public List<SanPhamCTResponse> getAllBySanPhamId(Long idSanPham) {
        List<SanPhamCT> list = sanPhamChiTietRepository.findBySanPhamId(idSanPham);
        return list.stream().map(spct -> convertToResponse(spct)).collect(Collectors.toList());
    }

    @Override
    public KhuyenMai deleteKhuyenMai(Integer id) {
        // Lấy ngày giờ hiện tại (bao gồm cả giờ)
        LocalDateTime currentDateTime = LocalDateTime.now();

        // Tìm khuyến mãi theo id
        Optional<KhuyenMai> optionalKhuyenMai = dotGiamGiaRepository.findById(id);
        if (optionalKhuyenMai.isPresent()) {
            KhuyenMai khuyenMai = optionalKhuyenMai.get();
            // Cập nhật trạng thái và thời gian kết thúc
            khuyenMai.setTrangThai(2);
            khuyenMai.setTgKetThuc(currentDateTime);
            return dotGiamGiaRepository.save(khuyenMai);
        } else {
            return null;
        }
    }

    @Override
    public Page<KhuyenMaiResponse> getSearchKhuyenMai(KhuyenMaiSearch khuyenMaiSearch, Pageable pageable) {
        return dotGiamGiaRepository.getSearchKhuyenMai(khuyenMaiSearch, pageable);
    }

    @Override
    public Page<SanPhamResponse> getSearchSanPham(SanPhamSearch sanPhamSearch, Pageable pageable) {
        return dotGiamGiaRepository.getSearchSanPham(sanPhamSearch, pageable);
    }

    @Override
    public Page<SanPhamCTResponse> phanTrangSanPhamCT(Pageable pageable) {
        return dotGiamGiaRepository.phanTrangSanPhamCT(pageable);
    }

    @Override
    public List<SanPhamCTResponse> fillterSanPhamCT(SanPhamCTSearch sanPhamCTSearch) {
        return dotGiamGiaRepository.fillterSanPhamCT(sanPhamCTSearch);
    }

    @Override
    public Page<SanPhamCTResponse> getSanPhamChiTietBySanPham(SanPhamCTSearch search, List<Integer> id, Pageable pageable) {
        return dotGiamGiaRepository.getSanPhamChiTietBySanPham(search, id, pageable);
    }

    @Override
    public List<String> getAllTenKhuyenMai() {
        return dotGiamGiaRepository.getAllTenKhuyenMai();
    }

    @Scheduled(cron = "0 * * * * ?")
    @Transactional
    public void cronJobCheckPromotion() {
        boolean flag = false;
        LocalDateTime dateNow = LocalDateTime.now();

        List<KhuyenMai> khuyenMaisList = dotGiamGiaRepository.getAllKhuyenMaiWrong(dateNow);

        for (KhuyenMai khuyenMai : khuyenMaisList) {
            if (khuyenMai.getTgBatDau().isAfter(dateNow) &&
                    khuyenMai.getTrangThai() != 0) {
                khuyenMai.setTrangThai(0);
                flag = true;
            } else if (khuyenMai.getTgKetThuc().isBefore(dateNow) &&
                    khuyenMai.getTrangThai() != 2) {
                khuyenMai.setTrangThai(2);
                flag = true;
            } else if (khuyenMai.getTgBatDau().isBefore(dateNow) &&
                    khuyenMai.getTgKetThuc().isAfter(dateNow) &&
                    khuyenMai.getTrangThai() != 1) {
                khuyenMai.setTrangThai(1);
                flag = true;
            }
        }
    }

    @Override
    public Boolean checkPromotionOverlap(List<Integer> idSanPhamCT, LocalDateTime newTgBatDau, LocalDateTime newTgKetThuc) {
        for (Integer id : idSanPhamCT) {
            // Retrieve the existing promotions for the product detail ID
            List<KhuyenMai> existingPromotions = dotGiamGiaRepository.getPromotionsByProductDetailId(id);

            for (KhuyenMai existingPromotion : existingPromotions) {
                LocalDateTime existingTgBatDau = existingPromotion.getTgBatDau();
                LocalDateTime existingTgKetThuc = existingPromotion.getTgKetThuc();

                // Check for overlap
                if (isTimeOverlap(existingTgBatDau, existingTgKetThuc, newTgBatDau, newTgKetThuc)) {
                    return true; // Overlap found
                }
            }
        }
        return false; // No overlap found
    }

    /**
     * Kiểm tra trùng lặp khuyến mãi khi cập nhật (loại trừ đợt giảm giá hiện tại)
     * @param idSanPhamCT Danh sách ID sản phẩm chi tiết cần kiểm tra
     * @param newTgBatDau Thời gian bắt đầu mới
     * @param newTgKetThuc Thời gian kết thúc mới
     * @param currentPromotionId ID của đợt giảm giá hiện tại đang được cập nhật
     * @return true nếu có trùng lặp, false nếu không
     */
    public Boolean checkPromotionOverlapForUpdate(List<Integer> idSanPhamCT, LocalDateTime newTgBatDau, LocalDateTime newTgKetThuc, Integer currentPromotionId) {
        for (Integer id : idSanPhamCT) {
            // Retrieve the existing promotions for the product detail ID
            List<KhuyenMai> existingPromotions = dotGiamGiaRepository.getPromotionsByProductDetailId(id);

            for (KhuyenMai existingPromotion : existingPromotions) {
                // Loại trừ đợt giảm giá hiện tại đang được cập nhật
                if (existingPromotion.getId().equals(currentPromotionId)) {
                    continue;
                }
                
                LocalDateTime existingTgBatDau = existingPromotion.getTgBatDau();
                LocalDateTime existingTgKetThuc = existingPromotion.getTgKetThuc();

                // Check for overlap
                if (isTimeOverlap(existingTgBatDau, existingTgKetThuc, newTgBatDau, newTgKetThuc)) {
                    return true; // Overlap found
                }
            }
        }
        return false; // No overlap found
    }

    /**
     * Kiểm tra trùng lặp khuyến mãi và trả về thông tin chi tiết về sản phẩm bị trùng
     * @param idSanPhamCT Danh sách ID sản phẩm chi tiết cần kiểm tra
     * @param newTgBatDau Thời gian bắt đầu mới
     * @param newTgKetThuc Thời gian kết thúc mới
     * @return Thông tin chi tiết về sản phẩm bị trùng lặp
     */
    public String getOverlapDetails(List<Integer> idSanPhamCT, LocalDateTime newTgBatDau, LocalDateTime newTgKetThuc) {
        StringBuilder overlapDetails = new StringBuilder();
        
        for (Integer id : idSanPhamCT) {
            List<KhuyenMai> existingPromotions = dotGiamGiaRepository.getPromotionsByProductDetailId(id);
            
            for (KhuyenMai existingPromotion : existingPromotions) {
                LocalDateTime existingTgBatDau = existingPromotion.getTgBatDau();
                LocalDateTime existingTgKetThuc = existingPromotion.getTgKetThuc();
                
                if (isTimeOverlap(existingTgBatDau, existingTgKetThuc, newTgBatDau, newTgKetThuc)) {
                    // Lấy thông tin sản phẩm chi tiết
                    SanPhamCT spct = sanPhamChiTietRepository.findById(id).orElse(null);
                    if (spct != null) {
                        overlapDetails.append(String.format(
                            "Sản phẩm '%s' đã có khuyến mãi '%s' từ %s đến %s. ",
                            spct.getSanPham().getTen(),
                            existingPromotion.getTen(),
                            existingTgBatDau.toString(),
                            existingTgKetThuc.toString()
                        ));
                    }
                }
            }
        }
        
        return overlapDetails.toString();
    }

    /**
     * Kiểm tra trùng lặp khuyến mãi khi cập nhật và trả về thông tin chi tiết về sản phẩm bị trùng
     * @param idSanPhamCT Danh sách ID sản phẩm chi tiết cần kiểm tra
     * @param newTgBatDau Thời gian bắt đầu mới
     * @param newTgKetThuc Thời gian kết thúc mới
     * @param currentPromotionId ID của đợt giảm giá hiện tại đang được cập nhật
     * @return Thông tin chi tiết về sản phẩm bị trùng lặp
     */
    public String getOverlapDetailsForUpdate(List<Integer> idSanPhamCT, LocalDateTime newTgBatDau, LocalDateTime newTgKetThuc, Integer currentPromotionId) {
        StringBuilder overlapDetails = new StringBuilder();
        
        for (Integer id : idSanPhamCT) {
            List<KhuyenMai> existingPromotions = dotGiamGiaRepository.getPromotionsByProductDetailId(id);
            
            for (KhuyenMai existingPromotion : existingPromotions) {
                // Loại trừ đợt giảm giá hiện tại đang được cập nhật
                if (existingPromotion.getId().equals(currentPromotionId)) {
                    continue;
                }
                
                LocalDateTime existingTgBatDau = existingPromotion.getTgBatDau();
                LocalDateTime existingTgKetThuc = existingPromotion.getTgKetThuc();
                
                if (isTimeOverlap(existingTgBatDau, existingTgKetThuc, newTgBatDau, newTgKetThuc)) {
                    // Lấy thông tin sản phẩm chi tiết
                    SanPhamCT spct = sanPhamChiTietRepository.findById(id).orElse(null);
                    if (spct != null) {
                        overlapDetails.append(String.format(
                            "Sản phẩm '%s' đã có khuyến mãi '%s' từ %s đến %s. ",
                            spct.getSanPham().getTen(),
                            existingPromotion.getTen(),
                            existingTgBatDau.toString(),
                            existingTgKetThuc.toString()
                        ));
                    }
                }
            }
        }
        
        return overlapDetails.toString();
    }

    // Helper method to check if two time intervals overlap
    private boolean isTimeOverlap(LocalDateTime existingTgBatDau, LocalDateTime existingTgKetThuc, LocalDateTime newTgBatDau, LocalDateTime newTgKetThuc) {
        return !(newTgBatDau.isAfter(existingTgKetThuc) || newTgKetThuc.isBefore(existingTgBatDau));
    }
}
