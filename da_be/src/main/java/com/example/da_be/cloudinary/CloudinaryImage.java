package com.example.da_be.cloudinary;

import com.cloudinary.Cloudinary;
import com.cloudinary.api.ApiResponse;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Component
public class CloudinaryImage {
    @Autowired
    private Cloudinary cloudinary;

    public String uploadImage(MultipartFile imageFile) {
        try {
            Map map = cloudinary.uploader().upload(imageFile.getBytes(), ObjectUtils.emptyMap());
            return (String) map.get("url");
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    public String uploadImage(MultipartFile imageFile, String nameFolder) {
        Map params = ObjectUtils.asMap(
                "folder", nameFolder,
                "resource_type", "image"
        );
        try {
            Map result = cloudinary.uploader().upload(imageFile.getBytes(), params);
            return (String) result.get("url");
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    public List<String> listImagesInFolder(String folderName) {
        try {
            List<String> listUrl = new ArrayList<>();
            int offset = 0;

            while (true) {
                ApiResponse result = cloudinary.api().resources(ObjectUtils.asMap(
                        "type", "upload",
                        "prefix", folderName + "/",
                        "max_results", 500, // Số lượng kết quả tối đa cho mỗi yêu cầu (tùy chọn)
                        "offset", offset
                ));

                List<?> list = (List<?>) result.get("resources");
                if (list.isEmpty()) {
                    break; // Không còn ảnh nào nữa
                }

                for (Object o : list) {
                    listUrl.add((String) ((Map<?, ?>) o).get("url"));
                }

                offset += list.size(); // Tăng offset để lấy các trang tiếp theo

                if (list.size() < 500) {
                    break; // Đã lấy hết tất cả ảnh trong thư mục
                }
            }

            return listUrl;
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }


    public String uploadAvatar(MultipartFile imageFile) {
        Map params = ObjectUtils.asMap(
                "folder", "avatar",
                "resource_type", "image"
        );
        try {
            Map result = cloudinary.uploader().upload(imageFile.getBytes(), params);
            return (String) result.get("url");
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    public void createFolder(String folder) {
        try {
            ApiResponse apiResponse = cloudinary.api().createFolder(folder, ObjectUtils.emptyMap());
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

}