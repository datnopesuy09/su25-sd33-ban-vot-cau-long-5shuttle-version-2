package com.example.da_be.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "stock_allocation")
public class StockAllocation {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Id")
    private Integer id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "IdHoaDonCT", nullable = false)
    private HoaDonCT hoaDonCT;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "IdSanPhamCT", nullable = false)
    private SanPhamCT sanPhamCT;
    
    @Column(name = "SoLuongReserved")
    private Integer soLuongReserved = 0;
    
    @Column(name = "SoLuongAllocated")
    private Integer soLuongAllocated = 0;
    
    @Column(name = "SoLuongConfirmed")
    private Integer soLuongConfirmed = 0;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "TrangThai")
    private AllocationStatus trangThai = AllocationStatus.RESERVED;
    
    @Column(name = "NgayTao")
    private LocalDateTime ngayTao = LocalDateTime.now();
    
    @Column(name = "NgayCapNhat")
    private LocalDateTime ngayCapNhat = LocalDateTime.now();
    
    // Enum cho trạng thái allocation
    public enum AllocationStatus {
        RESERVED,    // Đặt trước
        ALLOCATED,   // Đã phân bổ
        CONFIRMED,   // Đã xác nhận
        CANCELLED    // Đã hủy
    }
    
    // Constructors
    public StockAllocation() {}
    
    public StockAllocation(HoaDonCT hoaDonCT, SanPhamCT sanPhamCT, Integer soLuongReserved) {
        this.hoaDonCT = hoaDonCT;
        this.sanPhamCT = sanPhamCT;
        this.soLuongReserved = soLuongReserved;
        this.trangThai = AllocationStatus.RESERVED;
    }
    
    // Getters and Setters
    public Integer getId() {
        return id;
    }
    
    public void setId(Integer id) {
        this.id = id;
    }
    
    public HoaDonCT getHoaDonCT() {
        return hoaDonCT;
    }
    
    public void setHoaDonCT(HoaDonCT hoaDonCT) {
        this.hoaDonCT = hoaDonCT;
    }
    
    public SanPhamCT getSanPhamCT() {
        return sanPhamCT;
    }
    
    public void setSanPhamCT(SanPhamCT sanPhamCT) {
        this.sanPhamCT = sanPhamCT;
    }
    
    public Integer getSoLuongReserved() {
        return soLuongReserved;
    }
    
    public void setSoLuongReserved(Integer soLuongReserved) {
        this.soLuongReserved = soLuongReserved;
        updateTimestamp();
    }
    
    public Integer getSoLuongAllocated() {
        return soLuongAllocated;
    }
    
    public void setSoLuongAllocated(Integer soLuongAllocated) {
        this.soLuongAllocated = soLuongAllocated;
        updateTimestamp();
    }
    
    public Integer getSoLuongConfirmed() {
        return soLuongConfirmed;
    }
    
    public void setSoLuongConfirmed(Integer soLuongConfirmed) {
        this.soLuongConfirmed = soLuongConfirmed;
        updateTimestamp();
    }
    
    public AllocationStatus getTrangThai() {
        return trangThai;
    }
    
    public void setTrangThai(AllocationStatus trangThai) {
        this.trangThai = trangThai;
        updateTimestamp();
    }
    
    public LocalDateTime getNgayTao() {
        return ngayTao;
    }
    
    public void setNgayTao(LocalDateTime ngayTao) {
        this.ngayTao = ngayTao;
    }
    
    public LocalDateTime getNgayCapNhat() {
        return ngayCapNhat;
    }
    
    public void setNgayCapNhat(LocalDateTime ngayCapNhat) {
        this.ngayCapNhat = ngayCapNhat;
    }
    
    // Helper methods
    private void updateTimestamp() {
        this.ngayCapNhat = LocalDateTime.now();
    }
    
    /**
     * Lấy số lượng hiệu quả hiện tại (số lượng đang được sử dụng)
     */
    public Integer getEffectiveQuantity() {
        switch (trangThai) {
            case RESERVED:
                return soLuongReserved;
            case ALLOCATED:
                return soLuongAllocated;
            case CONFIRMED:
                return soLuongConfirmed;
            case CANCELLED:
                return 0;
            default:
                return 0;
        }
    }
    
    /**
     * Chuyển từ RESERVED sang ALLOCATED
     */
    public void allocate(Integer quantity) {
        if (this.trangThai != AllocationStatus.RESERVED) {
            throw new IllegalStateException("Chỉ có thể allocate từ trạng thái RESERVED");
        }
        this.soLuongAllocated = quantity;
        this.trangThai = AllocationStatus.ALLOCATED;
        updateTimestamp();
    }
    
    /**
     * Cập nhật số lượng allocated
     */
    public void updateAllocated(Integer newQuantity) {
        if (this.trangThai != AllocationStatus.ALLOCATED) {
            throw new IllegalStateException("Chỉ có thể cập nhật khi trạng thái là ALLOCATED");
        }
        this.soLuongAllocated = newQuantity;
        updateTimestamp();
    }
    
    /**
     * Xác nhận allocation cuối cùng
     */
    public void confirm() {
        if (this.trangThai == AllocationStatus.CANCELLED) {
            throw new IllegalStateException("Không thể xác nhận allocation đã bị hủy");
        }
        this.soLuongConfirmed = this.soLuongAllocated > 0 ? this.soLuongAllocated : this.soLuongReserved;
        this.trangThai = AllocationStatus.CONFIRMED;
        updateTimestamp();
    }
    
    /**
     * Hủy allocation
     */
    public void cancel() {
        this.trangThai = AllocationStatus.CANCELLED;
        updateTimestamp();
    }
}