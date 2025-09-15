package com.example.da_be.dto;

public class ImportStockRequest {
    private Integer sanPhamCTId;
    private Integer quantity;

    public Integer getSanPhamCTId() { return sanPhamCTId; }
    public void setSanPhamCTId(Integer sanPhamCTId) { this.sanPhamCTId = sanPhamCTId; }
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
}

