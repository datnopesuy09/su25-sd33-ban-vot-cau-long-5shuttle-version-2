package com.example.da_be.controller;

import com.example.da_be.dto.request.KhuyenMaiRequest;
import com.example.da_be.dto.request.KhuyenMaiSearch;
import com.example.da_be.dto.request.SanPhamCTSearch;
import com.example.da_be.dto.request.SanPhamSearch;
import com.example.da_be.dto.response.KhuyenMaiResponse;
import com.example.da_be.dto.response.SanPhamCTResponse;
import com.example.da_be.dto.response.SanPhamResponse;
import com.example.da_be.entity.KhuyenMai;
import com.example.da_be.service.DotGiamGiaService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
@RequestMapping("/api/dot-giam-gia")
public class DotGiamGiaController {
    @Autowired
    private DotGiamGiaService dotGiamGiaService;

    @GetMapping("/list-dot-giam-gia")
    public List<KhuyenMaiResponse> getAllKhuyenMai() {
        return dotGiamGiaService.getAllKhuyenMai();
    }

    @GetMapping("/list-san-pham")
    public List<SanPhamResponse> getAllSanPham(@RequestParam(value = "ten", defaultValue = "") String ten) {
        return dotGiamGiaService.getAllSanPhamByTen(ten);
    }

    @GetMapping("/list-san-pham-chi-tiet")
    public List<SanPhamCTResponse> getAllSanPhamChiTiet() {
        return dotGiamGiaService.getAllSanPhamChiTiet();
    }

    @GetMapping("/get-san-pham-chi-tiet-by-san-pham")
    public List<SanPhamCTResponse> getSanPhamChiTietBySanPham(@RequestParam(name = "id") List<Integer> id) {
        return dotGiamGiaService.getSanPhamChiTietBySanPham(id);
    }

    @PostMapping("/add")
    public void addKhuyenMaiOnProduct(@RequestBody @Valid KhuyenMaiRequest khuyenMaiRequest) {
        dotGiamGiaService.addKhuyenMaiOnProduct(khuyenMaiRequest);
    }

    @PutMapping("/update/{id}")
    public void updateKhuyenMai(@RequestBody @Valid KhuyenMaiRequest khuyenMaiRequest, @PathVariable Integer id) {
        dotGiamGiaService.updateKhuyenMai(khuyenMaiRequest, id);
    }

    @GetMapping("/detail/{id}")
    public KhuyenMai getKhuyenMaiById(@PathVariable Integer id) {
        return dotGiamGiaService.getKhuyenMaiById(id);
    }

    //Lấy id sản phẩm by id khuyến mãi
    @GetMapping("/get-id-san-pham-by-id-khuyen-mai/{idKhuyenMai}")
    public List<Integer> getIdSanPhamByIdKhuyenMai(@PathVariable Integer idKhuyenMai) {
        return dotGiamGiaService.getIdSanPhamByIdKhuyenMai(idKhuyenMai);
    }

    //Lấy id sản phẩm chi tiết by id khuyến mãi
    @GetMapping("/get-id-san-pham-chi-tiet-by-id-khuyen-mai/{idKhuyenMai}")
    public List<Integer> getIdSanPhamChiTietByIdKhuyenMai(@PathVariable Integer idKhuyenMai) {
        return dotGiamGiaService.getIdSanPhamChiTietByIdKhuyenMai(idKhuyenMai);
    }

    @GetMapping("/san-pham-ct/san-pham/{id}")
    public List<SanPhamCTResponse> getAllBySanPhamId(@PathVariable("id") Long idSanPham) {
        return dotGiamGiaService.getAllBySanPhamId(idSanPham);
    }

    @PutMapping("/delete/{id}")
    public void deleteKhuyenMai(@PathVariable Integer id) {
        dotGiamGiaService.deleteKhuyenMai(id);
    }

    @GetMapping("/search")
    public Map<String, Object> searchKhuyenMai(
            @RequestParam(required = false) String tenSearch,       // Tìm kiếm theo mã hoặc tên
            @RequestParam(required = false) LocalDateTime tgBatDauSearch,  // Tìm kiếm theo ngày bắt đầu
            @RequestParam(required = false) LocalDateTime tgKetThucSearch,
            @RequestParam(required = false) Integer trangThaiSearch,
            @RequestParam(value = "currentPage", defaultValue = "0") Integer currentPage,  // Trang hiện tại
            @RequestParam(value = "size", defaultValue = "5") Integer size
    ) {
        KhuyenMaiSearch search = new KhuyenMaiSearch();
        search.setTenSearch(tenSearch);
        search.setTgBatDauSearch(tgBatDauSearch);
        search.setTgKetThucSearch(tgKetThucSearch);
        search.setTrangThaiSearch(trangThaiSearch);

        Pageable pageable = PageRequest.of(currentPage, size);

        Page<KhuyenMaiResponse> pageResult = dotGiamGiaService.getSearchKhuyenMai(search, pageable);

        Map<String, Object> response = new HashMap<>();
        response.put("content", pageResult.getContent());
        response.put("totalPages", pageResult.getTotalPages());
        response.put("totalElements", pageResult.getTotalElements());
        response.put("currentPage", pageResult.getNumber());
        response.put("size", pageResult.getSize());

        return response;
    }

    @GetMapping("/searchSanPham")
    public Map<String, Object> searchSanPham(
            @RequestParam(required = false) String tenSearch,       // Tìm kiếm theo mã hoặc tên
            @RequestParam(value = "currentPage", defaultValue = "0") Integer currentPage,  // Trang hiện tại
            @RequestParam(value = "size", defaultValue = "5") Integer size
    ) {
        SanPhamSearch search = new SanPhamSearch();
        search.setTenSearch(tenSearch);

        Pageable pageable = PageRequest.of(currentPage, size);

        Page<SanPhamResponse> pageResult = dotGiamGiaService.getSearchSanPham(search, pageable);

        Map<String, Object> response = new HashMap<>();
        response.put("content", pageResult.getContent());
        response.put("totalPages", pageResult.getTotalPages());
        response.put("totalElements", pageResult.getTotalElements());
        response.put("currentPage", pageResult.getNumber());
        response.put("size", pageResult.getSize());

        return response;
    }

    @GetMapping("/getSanPhamCTBySanPham")
    public Map<String, Object> getSanPhamCTBySanPham(
            @RequestParam(required = false) List<Integer> id,
            @RequestParam(required = false) String tenSearch,      // Tìm kiếm theo mã hoặc tên
            @RequestParam(required = false) Integer idThuongHieuSearch,
            @RequestParam(required = false) Integer idMauSacSearch,
            @RequestParam(required = false) Integer idChatLieuSearch,
            @RequestParam(required = false) Integer idTrongLuongSearch,
            @RequestParam(required = false) Integer idDiemCanBangSearch,
            @RequestParam(required = false) Integer idDoCungSearch,
            @RequestParam(value = "currentPage", defaultValue = "0") Integer currentPage,  // Trang hiện tại
            @RequestParam(value = "size", defaultValue = "5") Integer size
    ) {
        SanPhamCTSearch search = new SanPhamCTSearch();
        search.setTenSearch(tenSearch);
        search.setIdThuongHieuSearch(idThuongHieuSearch);
        search.setIdMauSacSearch(idMauSacSearch);
        search.setIdChatLieuSearch(idChatLieuSearch);
        search.setIdTrongLuongSearch(idTrongLuongSearch);
        search.setIdDiemCanBangSearch(idDiemCanBangSearch);
        search.setIdDoCungSearch(idDoCungSearch);

        Pageable pageable = PageRequest.of(currentPage, size);

        Page<SanPhamCTResponse> pageResult = dotGiamGiaService.getSanPhamChiTietBySanPham(search, id, pageable);

        Map<String, Object> response = new HashMap<>();
        response.put("content", pageResult.getContent());
        response.put("totalPages", pageResult.getTotalPages());
        response.put("totalElements", pageResult.getTotalElements());
        response.put("currentPage", pageResult.getNumber());
        response.put("size", pageResult.getSize());

        return response;
    }

    @GetMapping("/phan-trang-san-pham-ct")
    public Map<String, Object> phanTrang(
            @RequestParam(value = "currentPage", defaultValue = "0") Integer currentPage,
            @RequestParam(value = "size", defaultValue = "5") Integer size) {
        Pageable pageable = PageRequest.of(currentPage, size);
        Page<SanPhamCTResponse> page = dotGiamGiaService.phanTrangSanPhamCT(pageable);

        Map<String, Object> response = new HashMap<>();
        response.put("content", page.getContent());
        response.put("totalPages", page.getTotalPages());
        response.put("totalElements", page.getTotalElements());
        response.put("currentPage", page.getNumber());
        response.put("size", page.getSize());

        return response;
    }

    @GetMapping("/fillter-san-pham-chi-tiet")
    public List<SanPhamCTResponse> fillterSanPhamCT(
            @RequestParam(required = false) String tenSearch,      // Tìm kiếm theo mã hoặc tên
            @RequestParam(required = false) Integer idThuongHieu,
            @RequestParam(required = false) Integer idMauSac,
            @RequestParam(required = false) Integer idChatLieu,
            @RequestParam(required = false) Integer idTrongLuong,
            @RequestParam(required = false) Integer idDiemCanBang,
            @RequestParam(required = false) Integer idDoCung
    ) {
        SanPhamCTSearch search = new SanPhamCTSearch();
        search.setTenSearch(tenSearch);
        search.setIdThuongHieuSearch(idThuongHieu);
        search.setIdMauSacSearch(idMauSac);
        search.setIdChatLieuSearch(idChatLieu);
        search.setIdTrongLuongSearch(idTrongLuong);
        search.setIdDiemCanBangSearch(idDiemCanBang);
        search.setIdDoCungSearch(idDoCung);

        return dotGiamGiaService.fillterSanPhamCT(search);
    }

    @GetMapping("/list-ten-khuyen-mai")
    public List<String> getAllTenKhuyenMai() {
        return dotGiamGiaService.getAllTenKhuyenMai();
    }

    @PostMapping("/check-overlap")
    public Map<String, Object> checkPromotionOverlap(@RequestBody Map<String, Object> request) {
        @SuppressWarnings("unchecked")
        List<Integer> idSanPhamCT = (List<Integer>) request.get("idSanPhamCT");
        String tgBatDauStr = (String) request.get("tgBatDau");
        String tgKetThucStr = (String) request.get("tgKetThuc");
        Integer currentPromotionId = (Integer) request.get("currentPromotionId");
        
        LocalDateTime tgBatDau = LocalDateTime.parse(tgBatDauStr);
        LocalDateTime tgKetThuc = LocalDateTime.parse(tgKetThucStr);
        
        boolean hasOverlap;
        String overlapDetails = "";
        
        // Nếu có currentPromotionId thì đây là request cập nhật, sử dụng phương thức cho cập nhật
        if (currentPromotionId != null) {
            hasOverlap = dotGiamGiaService.checkPromotionOverlapForUpdate(idSanPhamCT, tgBatDau, tgKetThuc, currentPromotionId);
            if (hasOverlap) {
                overlapDetails = dotGiamGiaService.getOverlapDetailsForUpdate(idSanPhamCT, tgBatDau, tgKetThuc, currentPromotionId);
            }
        } else {
            // Nếu không có currentPromotionId thì đây là request tạo mới
            hasOverlap = dotGiamGiaService.checkPromotionOverlap(idSanPhamCT, tgBatDau, tgKetThuc);
            if (hasOverlap) {
                overlapDetails = dotGiamGiaService.getOverlapDetails(idSanPhamCT, tgBatDau, tgKetThuc);
            }
        }
        
        Map<String, Object> response = new HashMap<>();
        response.put("hasOverlap", hasOverlap);
        response.put("overlapDetails", overlapDetails);
        
        return response;
    }
}
