package com.example.da_be.service;


import com.example.da_be.entity.ChatLieu;
import com.example.da_be.repository.ChatLieuRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ChatLieuService {
    @Autowired
    private ChatLieuRepository chatLieuRepository;

    public List<ChatLieu> getAllChatLieu() {
        return chatLieuRepository.findAll();
    }

    public ChatLieu getChatLieuById(int id) {
        Optional<ChatLieu> chatLieu = chatLieuRepository.findById(id);
        return chatLieu.orElseGet(ChatLieu::new);
    }

    public ChatLieu saveOrUpdateChatLieu(ChatLieu chatLieu) {
        return chatLieuRepository.save(chatLieu);
    }

    public void deleteChatLieuById(int id) {
        chatLieuRepository.deleteById(id);
    }
}
