package com.example.da_be.service;

import com.example.da_be.dto.request.NhanVienRequest;
import com.example.da_be.dto.response.NhanVienResponse;
import com.example.da_be.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.text.ParseException;
import java.util.List;

public interface NhanVienService {
    List<NhanVienResponse> getAllNhanVien();
    NhanVienResponse getNhanVienById(Integer id);
    User add(NhanVienRequest request) throws ParseException;
    Boolean update(NhanVienRequest request, Integer id) throws ParseException;
    User delete(Integer id);
    Page<NhanVienResponse> searchNhanVien( String ten, String email, String sdt, Integer gioiTinh, Integer trangThai, Pageable pageable);
}