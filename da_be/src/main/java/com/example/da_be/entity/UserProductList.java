package com.example.da_be.entity;

import com.example.da_be.enums.LoaiDanhSach;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "UserProductList",
        uniqueConstraints = @UniqueConstraint(columnNames = {"IdUser", "IdSanPham"})
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserProductList {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Integer id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "IdUser", nullable = false)
    User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "IdSanPham", nullable = false)
    SanPham sanPham;

    @Column(name = "CreatedAt", updatable = false, insertable = false,
            columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    LocalDateTime createdAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "LoaiDanhSach", nullable = false)
    LoaiDanhSach loaiDanhSach;
}
