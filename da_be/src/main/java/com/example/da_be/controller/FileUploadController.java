package com.example.da_be.controller;

import com.cloudinary.Cloudinary;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/upload")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class FileUploadController {

//    @Value("${upload.directory}")
//    private String uploadDirectory;
    @Autowired
    private Cloudinary cloudinary;

    @PostMapping
    public ResponseEntity<?> uploadImages(@RequestParam("images") MultipartFile[] files) {
        List<String> fileUrls = new ArrayList<>();
        try {
            for (MultipartFile file : files) {
                if (!file.isEmpty()) {
                    Map uploadResult = cloudinary.uploader().upload(file.getBytes(), Map.of());
                    String url = uploadResult.get("secure_url").toString();
                    fileUrls.add(url);
                }
            }
            Map<String, Object> response = new HashMap<>();
            response.put("urls", fileUrls);
            response.put("message", "Upload thành công " + fileUrls.size() + " file");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi upload: " + e.getMessage());
        }
    }


//    @PostMapping
//    public ResponseEntity<?> uploadImages(@RequestParam("images") MultipartFile[] files) {
//        try {
//            // Tạo thư mục nếu chưa tồn tại
//            Path uploadPath = Paths.get(uploadDirectory);
//            if (!Files.exists(uploadPath)) {
//                Files.createDirectories(uploadPath);
//            }
//
//            List<String> fileUrls = new ArrayList<>();
//
//            for (MultipartFile file : files) {
//                if (!file.isEmpty()) {
//                    // Validate file type
//                    String contentType = file.getContentType();
//                    if (contentType == null || !contentType.startsWith("image/")) {
//                        return ResponseEntity.badRequest()
//                                .body("Chỉ chấp nhận file ảnh");
//                    }
//
//                    // Validate file size (max 5MB)
//                    if (file.getSize() > 5 * 1024 * 1024) {
//                        return ResponseEntity.badRequest()
//                                .body("File quá lớn. Kích thước tối đa 5MB");
//                    }
//
//                    String originalFilename = file.getOriginalFilename();
//                    String fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
//                    String fileName = System.currentTimeMillis() + "_" +
//                            originalFilename.replaceAll("[^a-zA-Z0-9.]", "_");
//
//                    Path filePath = Paths.get(uploadDirectory, fileName);
//
//                    try {
//                        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
//                        String fileUrl = "/uploads/" + fileName;
//                        fileUrls.add(fileUrl);
//                    } catch (IOException e) {
//                        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
//                                .body("Lỗi khi lưu file: " + e.getMessage());
//                    }
//                }
//            }
//
//            Map<String, Object> response = new HashMap<>();
//            response.put("urls", fileUrls);
//            response.put("message", "Upload thành công " + fileUrls.size() + " file");
//            response.put("count", fileUrls.size());
//
//            return ResponseEntity.ok(response);
//        } catch (Exception e) {
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
//                    .body("Lỗi upload: " + e.getMessage());
//        }
//    }
}