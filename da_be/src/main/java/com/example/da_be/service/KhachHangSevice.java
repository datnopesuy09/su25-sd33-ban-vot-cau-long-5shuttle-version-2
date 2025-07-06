package com.example.da_be.service;

import com.example.da_be.dto.request.KhachHangRequest;
import com.example.da_be.dto.response.KhachHangResponse;
import com.example.da_be.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.text.ParseException;
import java.util.List;

public interface KhachHangSevice {
    List<KhachHangResponse> getAllKhachHang();
    User addKhachHang(KhachHangRequest request) throws ParseException;
    Boolean updateKhachHang(KhachHangRequest request, Integer id) throws ParseException;
    KhachHangResponse getKhachHangById(Integer id);
    User deleteKhachHangById(Integer id);
    Page<KhachHangResponse> searchKhachHang( String ten, String email, String sdt, Integer gioiTinh, Integer trangThai, Pageable pageable);
}
