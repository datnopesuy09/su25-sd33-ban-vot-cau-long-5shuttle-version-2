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
@Table(name = "Role") // Khớp với tên bảng SQL
public class Role {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Integer id;

    @Column(name = "Name", nullable = false, unique = true) // Ánh xạ đến cột "Name". Thường tên vai trò phải duy nhất.
    String name;

    @Column(name = "Description", unique = true) // Ánh xạ đến cột "Description" và khớp với UNIQUE constraint
    String description;

    @ManyToMany(mappedBy = "roles", fetch = FetchType.LAZY) // mappedBy chỉ ra mối quan hệ được quản lý bởi trường "roles" trong User
    Set<User> users;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "Role_Permissions",
            joinColumns = @JoinColumn(name = "IdRole"),
            inverseJoinColumns = @JoinColumn(name = "IdPermission")
    )
    Set<Permission> permissions;
}