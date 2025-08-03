package com.example.da_be.controller;

import com.example.da_be.dto.request.ApiResponse;
import com.example.da_be.dto.request.DiaChi.DiaChiCreationRequest;
import com.example.da_be.dto.request.DiaChi.DiaChiUpdateRequest;
import com.example.da_be.dto.response.DiaChiResponse;
import com.example.da_be.service.DiaChiService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/dia-chi")
@CrossOrigin(origins = "http://localhost:5173")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class DiaChiController {

    DiaChiService diaChiService;

    @GetMapping("/getMyAddress")
    ApiResponse<List<DiaChiResponse>> getAll(){
        return ApiResponse.<List<DiaChiResponse>>builder()
                .result(diaChiService.getMyDiaChi())
                .code(1000)
                .build();
    }

    @PostMapping("/create")
    ApiResponse<DiaChiResponse> createDiaChi(@RequestBody DiaChiCreationRequest request){
        return ApiResponse.<DiaChiResponse>builder()
                .result(diaChiService.createDiaChi(request))
                .code(1000)
                .build();
    }

    @PutMapping("/update/{diaChiId}")
    ApiResponse<DiaChiResponse> updateDiaChi(@PathVariable("diaChiId") Integer diaChiId, @RequestBody DiaChiUpdateRequest request){
        return ApiResponse.<DiaChiResponse>builder()
                .result(diaChiService.updateDiaChi(request, diaChiId))
                .code(1000)
                .build();
    }

    @PutMapping("/update-loai/{diaChiId}")
    ApiResponse<DiaChiResponse> updateLoaiDiaChi(@PathVariable("diaChiId") Integer diaChiId){
        return ApiResponse.<DiaChiResponse>builder()
                .result(diaChiService.updateLoaiDiaChi(diaChiId))
                .code(1000)
                .build();
    }

    @DeleteMapping("/{diaChiId}")
    String deleteDiaChi(@PathVariable("diaChiId") Integer diaChiId){
        diaChiService.deleteDiaChi(diaChiId);
        return "Address has been deleted";
    }

    @GetMapping("/mac-dinh")
    ApiResponse<DiaChiResponse> getDiaChiMacDinh() {
        return ApiResponse.<DiaChiResponse>builder()
                .result(diaChiService.getDiaChiMacDinh())
                .code(1000)
                .build();
    }

}
