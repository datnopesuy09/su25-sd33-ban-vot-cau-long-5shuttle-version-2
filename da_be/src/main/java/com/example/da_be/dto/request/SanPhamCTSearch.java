package com.example.da_be.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class SanPhamCTSearch {
    public String tenSearch;
    public Integer idThuongHieuSearch;
    public Integer idMauSacSearch;
    public Integer idChatLieuSearch;
    public Integer idTrongLuongSearch;
    public Integer idDiemCanBangSearch;
    public Integer idDoCungSearch;
}
