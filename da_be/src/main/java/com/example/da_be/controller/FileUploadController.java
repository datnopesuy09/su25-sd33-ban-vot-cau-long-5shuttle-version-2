package com.example.da_be.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/upload")
public class FileUploadController {

    @Value("${upload.directory}")
    private String uploadDirectory;

    @PostMapping
    public ResponseEntity<?> uploadImages(@RequestParam("images") MultipartFile[] files) {
        try {
            List<String> fileUrls = new ArrayList<>();

            for (MultipartFile file : files) {
                if (!file.isEmpty()) {
                    String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
                    Path filePath = Paths.get(uploadDirectory, fileName);

                    Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

                    String fileUrl = "/uploads/" + fileName;
                    fileUrls.add(fileUrl);
                }
            }

            return ResponseEntity.ok(fileUrls);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error uploading files: " + e.getMessage());
        }
    }
}
