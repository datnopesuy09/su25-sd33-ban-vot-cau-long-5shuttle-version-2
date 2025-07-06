package com.example.da_be.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.Set;
@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@Table(name = "Permission") // Khớp với tên bảng SQL
public class Permission {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Integer id;

    @Column(name = "Name", nullable = false) // Ánh xạ đến cột "Name".
    // Để nhất quán với Best Practice, bạn nên thêm UNIQUE constraint cho cột "Name" trong SQL.
    String name;

    @Column(name = "Description")
    String description;

    @ManyToMany(mappedBy = "permissions", fetch = FetchType.LAZY)
    Set<Role> roles;
}