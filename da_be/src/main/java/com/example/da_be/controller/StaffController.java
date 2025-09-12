package com.example.da_be.controller;

import com.example.da_be.dto.request.ApiResponse;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/staff")
@CrossOrigin(origins = {"http://localhost:5173","http://localhost:3000"}, allowCredentials = "true")
public class StaffController {

    @GetMapping("/bulk-order-handlers")
    public ApiResponse<List<String>> bulkOrderHandlers(){
        // TODO: integrate with real user/role table (Role = STAFF)
        return ApiResponse.<List<String>>builder().result(List.of("Nhân viên A","Nhân viên B","Nhân viên C")).build();
    }
}
