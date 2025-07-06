package com.example.da_be.controller;


import com.example.da_be.entity.ChatLieu;
import com.example.da_be.service.ChatLieuService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:5173") // Cho phép kết nối từ React
@RequestMapping("/api/chat-lieu")
public class ChatLieuController {

    @Autowired
    private ChatLieuService chatLieuService;

    // Lấy danh sách tất cả chất liệu
    @GetMapping
    public List<ChatLieu> getAllChatLieu() {
        return chatLieuService.getAllChatLieu();
    }

    // Lấy thông tin chất liệu theo id
    @GetMapping("/{id}")
    public ChatLieu getChatLieuById(@PathVariable int id) {
        return chatLieuService.getChatLieuById(id);
    }

    // Xóa chất liệu theo id
    @DeleteMapping("/{id}")
    public void deleteChatLieu(@PathVariable int id) {
        chatLieuService.deleteChatLieuById(id);
    }

    // Thêm chất liệu mới
    @PostMapping
    public ChatLieu addChatLieu(@RequestBody ChatLieu chatLieu) {
        return chatLieuService.saveOrUpdateChatLieu(chatLieu);
    }

    // Cập nhật thông tin chất liệu
    @PutMapping("/{id}")
    public ChatLieu updateChatLieu(@PathVariable int id, @RequestBody ChatLieu chatLieu) {
        chatLieu.setId(id);  // Đảm bảo ID trong body và path là giống nhau
        return chatLieuService.saveOrUpdateChatLieu(chatLieu);
    }
}
