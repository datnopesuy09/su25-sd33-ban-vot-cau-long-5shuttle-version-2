package com.example.da_be.controller;


import com.example.da_be.dto.*;
import com.example.da_be.entity.HinhAnh;
import com.example.da_be.entity.SanPham;
import com.example.da_be.entity.SanPhamCT;
import com.example.da_be.exception.ResourceNotFoundException;
import com.example.da_be.repository.*;
import com.example.da_be.service.SanPhamCTService;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.transaction.annotation.Transactional;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("/api/san-pham-ct")
public class SanPhamCTController {

    @Autowired
    private SanPhamCTService sanPhamCTService;

    @Autowired
    private SanPhamCTRepository sanPhamCTRepository;
    @Autowired
    private SanPhamRepository sanPhamRepository;
    @Autowired
    private ThuongHieuRepository thuongHieuRepository;
    @Autowired
    private ChatLieuRepository chatLieuRepository;
    @Autowired
    private DiemCanBangRepository diemCanBangRepository;
    @Autowired
    private DoCungRepository doCungRepository;
    @Autowired
    private MauSacRepository mauSacRepository;
    @Autowired
    private TrongLuongRepository trongLuongRepository;
    @Autowired
    private HinhAnhRepository hinhAnhRepository;

    // Lấy danh sách tất cả sản phẩm chi tiết
    @GetMapping
    public List<SanPhamCT> getAllSanPhamCT() {
        return sanPhamCTService.getAllSanPhamCT();
    }

    // Lấy thông tin sản phẩm chi tiết theo id
    @GetMapping("/{id}")
    public ResponseEntity<SanPhamCT> getSanPhamCTById(@PathVariable int id) {
        SanPhamCT sanPhamCT = sanPhamCTService.getSanPhamCTById(id);
        if (sanPhamCT.getId() == 0) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>(sanPhamCT, HttpStatus.OK);
    }

    // Xóa sản phẩm chi tiết theo id
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSanPhamCT(@PathVariable int id) {
        sanPhamCTService.deleteSanPhamCTById(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    // Thêm sản phẩm chi tiết mới
    @PostMapping
    public ResponseEntity<SanPhamCT> addSanPhamCT(@RequestBody SanPhamCT sanPhamCT) {
        SanPhamCT createdSanPhamCT = sanPhamCTService.saveOrUpdateSanPhamCT(sanPhamCT);
        return new ResponseEntity<>(createdSanPhamCT, HttpStatus.CREATED);
    }

    // Cập nhật thông tin sản phẩm chi tiết
//    @PutMapping("/{id}")
//    public ResponseEntity<SanPhamCT> updateSanPhamCTT(@PathVariable int id, @RequestBody SanPhamCT sanPhamCT) {
//        sanPhamCT.setId(id);  // Đảm bảo ID trong body và path là giống nhau
//        SanPhamCT updatedSanPhamCT = sanPhamCTService.saveOrUpdateSanPhamCT(sanPhamCT);
//        return new ResponseEntity<>(updatedSanPhamCT, HttpStatus.OK);
//    }

    @PutMapping("/{id}")
    public ResponseEntity<SanPhamCT> updateSanPhamCT(@PathVariable int id, @RequestBody SanPhamCT sanPhamCT) {
        SanPhamCT existingSanPhamCT = sanPhamCTRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SanPhamCT not found"));

        // Chỉ cập nhật các thuộc tính đơn giản
        existingSanPhamCT.setSoLuong(sanPhamCT.getSoLuong());
        existingSanPhamCT.setDonGia(sanPhamCT.getDonGia());
        
        // Chỉ cập nhật trạng thái và mô tả nếu có
        if (sanPhamCT.getTrangThai() != null) {
            existingSanPhamCT.setTrangThai(sanPhamCT.getTrangThai());
        }
        if (sanPhamCT.getMoTa() != null) {
            existingSanPhamCT.setMoTa(sanPhamCT.getMoTa());
        }

        // Không cập nhật các entity liên quan để tránh lỗi TransientPropertyValueException
        // Các entity liên quan (ThuongHieu, ChatLieu, etc.) không nên thay đổi khi chỉ update số lượng và giá

        sanPhamCTRepository.save(existingSanPhamCT);

        return ResponseEntity.ok(existingSanPhamCT);
    }

    @GetMapping("/sp")
    public List<SanPhamCT> getAllSanPhamCT(@RequestParam(required = false) Integer productId) {
        if (productId != null) {
            return sanPhamCTService.getSanPhamCTByProductId(productId);
        }
        return sanPhamCTService.getAllSanPhamCT();
    }

    @PutMapping("/with-images/{id}")
    public ResponseEntity<Void> updateHinhAnhUrls(@PathVariable int id, @RequestBody List<String> hinhAnhUrls) {
        sanPhamCTService.updateHinhAnhUrls(id, hinhAnhUrls);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/update-quantity/{id}")
    public ResponseEntity<?> updateQuantity(
            @PathVariable Long id,
            @RequestBody Map<String, Integer> payload
    ) {
        try {
            Integer soLuong = payload.get("soLuong");
            sanPhamCTService.updateQuantity(id, soLuong);
            return ResponseEntity.ok().build();
        } catch (ResourceNotFoundException e) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Sản phẩm không tồn tại");
        } catch (IllegalArgumentException e) {
            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Có lỗi xảy ra: " + e.getMessage());
        }
    }

    @PutMapping("/update-basic/{id}")
    @Transactional
    public ResponseEntity<?> updateBasicInfo(
            @PathVariable int id,
            @RequestBody Map<String, Object> payload
    ) {
        try {
            SanPhamCT existingSanPhamCT = sanPhamCTRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Sản phẩm không tồn tại"));

            // ====== Các trường cơ bản ======
            if (payload.containsKey("soLuong")) {
                existingSanPhamCT.setSoLuong(Integer.parseInt(payload.get("soLuong").toString()));
            }
            if (payload.containsKey("donGia")) {
                existingSanPhamCT.setDonGia(Double.parseDouble(payload.get("donGia").toString()));
            }
            if (payload.containsKey("trangThai")) {
                String status = payload.get("trangThai").toString();
                existingSanPhamCT.setTrangThai("Active".equalsIgnoreCase(status) ? 1 : 0);
            }
            if (payload.containsKey("moTa")) {
                existingSanPhamCT.setMoTa(payload.get("moTa").toString());
            }

            // ====== Các quan hệ (lookup theo tên) ======
            if (payload.containsKey("brand")) {
                String brand = payload.get("brand").toString();
                existingSanPhamCT.setThuongHieu(
                        thuongHieuRepository.findByTen(brand).orElse(null)
                );
            }
            if (payload.containsKey("material")) {
                String material = payload.get("material").toString();
                existingSanPhamCT.setChatLieu(
                        chatLieuRepository.findByTen(material).orElse(null)
                );
            }
            if (payload.containsKey("balancePoint")) {
                String balancePoint = payload.get("balancePoint").toString();
                existingSanPhamCT.setDiemCanBang(
                        diemCanBangRepository.findByTen(balancePoint).orElse(null)
                );
            }
            if (payload.containsKey("hardness")) {
                String hardness = payload.get("hardness").toString();
                existingSanPhamCT.setDoCung(
                        doCungRepository.findByTen(hardness).orElse(null)
                );
            }
            if (payload.containsKey("color")) {
                String color = payload.get("color").toString();
                existingSanPhamCT.setMauSac(
                        mauSacRepository.findByTen(color).orElse(null)
                );
            }
            if (payload.containsKey("weight")) {
                String weight = payload.get("weight").toString();
                existingSanPhamCT.setTrongLuong(
                        trongLuongRepository.findByTen(weight).orElse(null)
                );
            }

//            // ====== Xử lý ảnh: đồng bộ cho tất cả biến thể cùng màu ======
            if (payload.containsKey("hinhAnhUrls")) {
                @SuppressWarnings("unchecked")
                List<String> hinhAnhUrls = (List<String>) payload.get("hinhAnhUrls");

                System.out.println("=== CẬP NHẬT ẢNH CHO SANPHAMCT ID: " + id + " ===");
                System.out.println("Số lượng ảnh mới: " + (hinhAnhUrls != null ? hinhAnhUrls.size() : 0));

                try {
                    // Tìm tất cả biến thể cùng màu
                    List<SanPhamCT> sameColorVariants = 
                        sanPhamCTRepository.findBySanPhamAndMauSac(
                            existingSanPhamCT.getSanPham(), 
                            existingSanPhamCT.getMauSac()
                        );
                    
                    System.out.println("Số biến thể cùng màu: " + sameColorVariants.size());

                    // Cập nhật ảnh cho tất cả biến thể cùng màu
                    for (SanPhamCT variant : sameColorVariants) {
                        System.out.println("Đang cập nhật ảnh cho biến thể ID: " + variant.getId());
                        
                        // Xóa tất cả ảnh cũ của biến thể này
                        List<HinhAnh> existingHinhAnhs = variant.getHinhAnh();
                        if (existingHinhAnhs != null && !existingHinhAnhs.isEmpty()) {
                            for (HinhAnh hinhAnh : existingHinhAnhs) {
                                try {
                                    hinhAnhRepository.deleteById(hinhAnh.getId());
                                    System.out.println("Đã xóa ảnh ID: " + hinhAnh.getId());
                                } catch (Exception e) {
                                    System.err.println("Lỗi khi xóa ảnh ID " + hinhAnh.getId() + ": " + e.getMessage());
                                }
                            }
                            variant.getHinhAnh().clear();
                        }

                        // Thêm ảnh mới nếu có
                        if (hinhAnhUrls != null && !hinhAnhUrls.isEmpty()) {
                            for (String url : hinhAnhUrls) {
                                try {
                                    HinhAnh newHinhAnh = new HinhAnh();
                                    newHinhAnh.setLink(url);
                                    newHinhAnh.setTrangThai(1);
                                    newHinhAnh.setSanPhamCT(variant);
                                    HinhAnh savedHinhAnh = hinhAnhRepository.save(newHinhAnh);
                                    variant.getHinhAnh().add(savedHinhAnh);
                                    System.out.println("Đã thêm ảnh mới ID: " + savedHinhAnh.getId() + " - URL: " + url);
                                } catch (Exception e) {
                                    System.err.println("Lỗi khi thêm ảnh URL " + url + ": " + e.getMessage());
                                }
                            }
                        }

                        // Lưu biến thể
                        sanPhamCTRepository.save(variant);
                    }

                    System.out.println("=== HOÀN THÀNH CẬP NHẬT ẢNH CHO TẤT CẢ BIẾN THỂ CÙNG MÀU ===");

                } catch (Exception e) {
                    System.err.println("Lỗi tổng quát khi xử lý ảnh: " + e.getMessage());
                    e.printStackTrace();
                }
            }


            // ====== Lưu lại ======
            sanPhamCTRepository.save(existingSanPhamCT);
            
            // Cập nhật trạng thái sản phẩm cha dựa trên trạng thái của tất cả biến thể
            sanPhamCTService.updateParentProductStatus(existingSanPhamCT.getSanPham().getId());

            return ResponseEntity.ok(existingSanPhamCT);

        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().body("Dữ liệu không hợp lệ");
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Có lỗi xảy ra: " + e.getMessage());
        }
    }

    @GetMapping("/summary")
    public ResponseEntity<List<SanPhamCTListDTO>> getAllSanPhamCTSummary() {
        List<SanPhamCTListDTO> dtoList = sanPhamCTService.getAllSanPhamCTSummary();
        return ResponseEntity.ok(dtoList);
    }

    @GetMapping("/summaryy")
    public ResponseEntity<List<SanPhamCTListDTOo>> getAllSanPhamCTSummaryy() {
        List<SanPhamCTListDTOo> dtoList = sanPhamCTService.getAllSanPhamCTSummaryy();
        return ResponseEntity.ok(dtoList);
    }

    @GetMapping("/{id}/detaill")
    public ResponseEntity<SanPhamCTDetailDTO> getSanPhamCTDetail(@PathVariable int id) {
        SanPhamCTDetailDTO detailDTO = sanPhamCTService.getSanPhamCTDetail(id);
        return new ResponseEntity<>(detailDTO, HttpStatus.OK);
    }

    @GetMapping("/all-with-image")
    public ResponseEntity<List<SanPhamCTFullDTO>> getAllSanPhamCTWithImage() {
        List<SanPhamCTFullDTO> dtoList = sanPhamCTService.getAllSanPhamCTWithImage();
        return ResponseEntity.ok(dtoList);
    }

    private String generateProductCode() {
        // Sử dụng UUID để tạo mã sản phẩm duy nhất
        return "SP-" + UUID.randomUUID().toString();
    }

    @PostMapping("/add-with-variants")
    public ResponseEntity<?> addProductWithVariants(@RequestBody AddProductRequest request) {
        try {
            // 1. Tạo sản phẩm chính
            SanPham sanPham = new SanPham();
            sanPham.setTen(request.getProductName());
            sanPham.setTrangThai(1); // Active
            // Lưu sản phẩm chính (nếu chưa có repository cho SanPham, bạn cần tạo)
            sanPhamRepository.save(sanPham);

            // 2. Tạo các biến thể sản phẩm
            List<SanPhamCT> createdVariants = new ArrayList<>();
            for (VariantDTO variant : request.getVariants()) {
                SanPhamCT sanPhamCT = new SanPhamCT();
                sanPhamCT.setSanPham(sanPham);

                // Lấy các thuộc tính từ request
                sanPhamCT.setThuongHieu(thuongHieuRepository.findByTen(request.getBrand()).orElse(null));
                sanPhamCT.setChatLieu(chatLieuRepository.findByTen(request.getMaterial()).orElse(null));
                sanPhamCT.setDiemCanBang(diemCanBangRepository.findByTen(request.getBalancePoint()).orElse(null));
                sanPhamCT.setDoCung(doCungRepository.findByTen(request.getHardness()).orElse(null));

                // Lấy màu sắc và trọng lượng
                sanPhamCT.setMauSac(mauSacRepository.findByTen(variant.getMauSacTen()).orElse(null));
                sanPhamCT.setTrongLuong(trongLuongRepository.findByTen(variant.getTrongLuongTen()).orElse(null));

                // Các thông tin khác
                sanPhamCT.setMa(generateProductCode()); // Hàm tự tạo mã sản phẩm
                sanPhamCT.setSoLuong(variant.getSoLuong());
                sanPhamCT.setDonGia(variant.getDonGia());
                sanPhamCT.setMoTa(request.getDescription());
                sanPhamCT.setTrangThai(1); // Active

                // Lưu biến thể
                SanPhamCT savedVariant = sanPhamCTRepository.save(sanPhamCT);
                createdVariants.add(savedVariant);

                // 3. Lưu hình ảnh cho biến thể
                for (String imageUrl : variant.getHinhAnhUrls()) {
                    HinhAnh hinhAnh = new HinhAnh();
                    hinhAnh.setSanPhamCT(savedVariant);
                    hinhAnh.setLink(imageUrl);
                    hinhAnh.setTrangThai(1);
                    hinhAnhRepository.save(hinhAnh);
                }
            }

            return ResponseEntity.ok(createdVariants);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error adding product: " + e.getMessage());
        }
    }

    @GetMapping("/{id}/detaill-with-promotion")
    public ResponseEntity<SanPhamCTDetailDTO> getSanPhamCTDetailWithPromotion(@PathVariable int id) {
        SanPhamCTDetailDTO detailDTO = sanPhamCTService.getSanPhamCTDetailWithPromotion(id);
        return new ResponseEntity<>(detailDTO, HttpStatus.OK);
    }

    @PostMapping("/add-variant/{productId}")
    @Transactional
    public ResponseEntity<?> addVariantToExistingProduct(
            @PathVariable int productId,
            @RequestBody Map<String, Object> variantData) {
        try {
            // 1. Tìm sản phẩm chính
            SanPham sanPham = sanPhamRepository.findById(productId)
                    .orElseThrow(() -> new ResourceNotFoundException("Sản phẩm không tồn tại"));

            // 2. Tạo biến thể mới
            SanPhamCT sanPhamCT = new SanPhamCT();
            sanPhamCT.setSanPham(sanPham);

            // Lấy các thuộc tính từ request
            if (variantData.containsKey("brand")) {
                String brand = variantData.get("brand").toString();
                sanPhamCT.setThuongHieu(thuongHieuRepository.findByTen(brand).orElse(null));
            }
            if (variantData.containsKey("material")) {
                String material = variantData.get("material").toString();
                sanPhamCT.setChatLieu(chatLieuRepository.findByTen(material).orElse(null));
            }
            if (variantData.containsKey("balancePoint")) {
                String balancePoint = variantData.get("balancePoint").toString();
                sanPhamCT.setDiemCanBang(diemCanBangRepository.findByTen(balancePoint).orElse(null));
            }
            if (variantData.containsKey("hardness")) {
                String hardness = variantData.get("hardness").toString();
                sanPhamCT.setDoCung(doCungRepository.findByTen(hardness).orElse(null));
            }
            if (variantData.containsKey("mauSacTen")) {
                String color = variantData.get("mauSacTen").toString();
                sanPhamCT.setMauSac(mauSacRepository.findByTen(color).orElse(null));
            }
            if (variantData.containsKey("trongLuongTen")) {
                String weight = variantData.get("trongLuongTen").toString();
                sanPhamCT.setTrongLuong(trongLuongRepository.findByTen(weight).orElse(null));
            }

            // Các thông tin khác
            sanPhamCT.setMa(generateProductCode());
            if (variantData.containsKey("soLuong")) {
                sanPhamCT.setSoLuong(Integer.parseInt(variantData.get("soLuong").toString()));
            }
            if (variantData.containsKey("donGia")) {
                sanPhamCT.setDonGia(Double.parseDouble(variantData.get("donGia").toString()));
            }
            if (variantData.containsKey("description")) {
                sanPhamCT.setMoTa(variantData.get("description").toString());
            }
            if (variantData.containsKey("status")) {
                String status = variantData.get("status").toString();
                sanPhamCT.setTrangThai("Active".equalsIgnoreCase(status) ? 1 : 0);
            } else {
                sanPhamCT.setTrangThai(1); // Default Active
            }

            // Lưu biến thể
            SanPhamCT savedVariant = sanPhamCTRepository.save(sanPhamCT);

            // 3. Lưu hình ảnh cho biến thể
            if (variantData.containsKey("hinhAnhUrls")) {
                @SuppressWarnings("unchecked")
                List<String> hinhAnhUrls = (List<String>) variantData.get("hinhAnhUrls");
                
                if (hinhAnhUrls != null && !hinhAnhUrls.isEmpty()) {
                    for (String imageUrl : hinhAnhUrls) {
                        HinhAnh hinhAnh = new HinhAnh();
                        hinhAnh.setSanPhamCT(savedVariant);
                        hinhAnh.setLink(imageUrl);
                        hinhAnh.setTrangThai(1);
                        hinhAnhRepository.save(hinhAnh);
                    }
                }
            }

            return ResponseEntity.ok(savedVariant);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().body("Dữ liệu không hợp lệ");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error adding variant: " + e.getMessage());
        }
    }




    // Thêm DTO cho request
    @Data
    public static class AddProductRequest {
        private String productName;
        private String brand;
        private String material;
        private String balancePoint;
        private String hardness;
        private String description;
        private List<VariantDTO> variants;
    }

}

