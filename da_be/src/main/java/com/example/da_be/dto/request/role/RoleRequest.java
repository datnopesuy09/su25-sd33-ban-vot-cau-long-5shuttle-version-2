package com.example.da_be.dto.request.role;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RoleRequest {
    String name;
    String description;
    Set<Integer> permissions;
}
