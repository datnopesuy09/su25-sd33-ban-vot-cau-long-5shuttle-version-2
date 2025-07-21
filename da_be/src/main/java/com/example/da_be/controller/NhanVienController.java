package com.example.da_be.controller;

import com.example.da_be.dto.request.ApiResponse;
import com.example.da_be.dto.request.NhanVien.NVCreationRequest;
import com.example.da_be.dto.request.NhanVien.SearchNVRequest;
import com.example.da_be.dto.request.NhanVienRequest;
import com.example.da_be.dto.response.NhanVienResponse;
//import com.example.da_be.service.NhanVienService;
import com.example.da_be.service.NhanVienServices;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.text.ParseException;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/nhan-vien")
@CrossOrigin(origins = "http://localhost:5173")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class NhanVienController {

    NhanVienServices nhanVienServices;

    @GetMapping()
    public ApiResponse<List<NhanVienResponse>> getAllNhanVien() {
        return ApiResponse.<List<NhanVienResponse>>builder()
                .result(nhanVienServices.getAllNhanVien())
                .build();
    }

    @PostMapping()
    ApiResponse<NhanVienResponse> addNhanVien(@ModelAttribute @Valid NVCreationRequest request){
        return ApiResponse.<NhanVienResponse>builder()
                .result(nhanVienServices.addNhanVien(request))
                .build();

    }

    @GetMapping("/search")
    public ApiResponse<Page<NhanVienResponse>> searchNhanVien(
            @RequestParam(required = false) String hoTen,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String sdt,
            @RequestParam(required = false) Integer gioiTinh,
            @RequestParam(required = false) Integer trangThai,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);

        SearchNVRequest searchReq = SearchNVRequest.builder()
                .hoTen(hoTen)
                .email(email)
                .sdt(sdt)
                .gioiTinh(gioiTinh)
                .trangThai(trangThai)
                .build();

        return ApiResponse.<Page<NhanVienResponse>>builder()
                .result(nhanVienServices.searchNhanVien(searchReq, pageable))
                .build();
    }

    @PutMapping("/delete/{id}")
    public ApiResponse<String> delete(@PathVariable Integer id) {
        nhanVienServices.deleteNhanVien(id);
        return ApiResponse.<String>builder()
                .result("Xóa nhân viên thành công")
                .build();
    }
//    @Autowired
//    private NhanVienService nhanVienService;
//
//    @GetMapping("")
//    public List<NhanVienResponse> getNhanVien() {
//        return nhanVienService.getAllNhanVien();
//    }
//
//    @GetMapping("/{id}")
//    public NhanVienResponse getNhanVienById(@PathVariable Integer id) {
//        return nhanVienService.getNhanVienById(id);
//    }
//
//    @PostMapping("/add")
//    public ResponseEntity<?> add(NhanVienRequest nhanVienRequest) throws ParseException {
//        return ResponseEntity.ok(nhanVienService.add(nhanVienRequest));
//    }
//
//    @PutMapping("/update/{id}")
//    public ResponseEntity<?> update(NhanVienRequest nhanVienRequest, @PathVariable Integer id) throws ParseException {
//        return ResponseEntity.ok(nhanVienService.update(nhanVienRequest, id));
//    }
//
//    @PutMapping("/delete/{id}")
//    public ResponseEntity<?> delete(@PathVariable Integer id) {
//        return ResponseEntity.ok(nhanVienService.delete(id));
//    }
//
//    @GetMapping("/search")
//    public ResponseEntity<?> searchNhanVien(
//            @RequestParam(required = false) String hoTen,
//            @RequestParam(required = false) String email,
//            @RequestParam(required = false) String sdt,
//            @RequestParam(required = false) Integer gioiTinh,
//            @RequestParam(required = false) Integer trangThai,
//            @RequestParam(defaultValue = "0") int page,
//            @RequestParam(defaultValue = "5") int size
//    ) {
//        Pageable pageable = PageRequest.of(page, size);
//        return ResponseEntity.ok(
//                nhanVienService.searchNhanVien(hoTen, email, sdt, gioiTinh, trangThai, pageable)
//        );
//    }
}