package com.example.da_be.service;

import com.example.da_be.dto.ghn.GHNShippingFeeRequestDTO;
import com.example.da_be.dto.ghn.GHNShippingFeeResponseDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;

@Service
public class GHNShippingService {
    
    private static final Logger log = LoggerFactory.getLogger(GHNShippingService.class);
    
    private static final String GHN_API_URL = "https://online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/fee";
    private static final String GHN_TOKEN = "04ae91c9-b3a5-11ef-b074-aece61c107bd";
    private static final String SHOP_ID = "5505325";
    
    // Thông tin cửa hàng mặc định (có thể cấu hình trong properties file)
    private static final int FROM_DISTRICT_ID = 1444; // ID quận/huyện của cửa hàng
    
    // Thông số vợt cầu lông mặc định
    private static final int DEFAULT_WEIGHT_PER_RACKET = 85; // 85 gram cho 1 vợt
    private static final int DEFAULT_LENGTH = 68; // 68cm chiều dài vợt
    private static final int DEFAULT_WIDTH = 23;  // 23cm chiều rộng vợt
    private static final int DEFAULT_HEIGHT = 5;  // 5cm chiều cao

    private final RestTemplate restTemplate;

    public GHNShippingService() {
        this.restTemplate = new RestTemplate();
    }

    /**
     * Tính phí ship dựa trên thông tin đơn hàng
     * 
     * @param toDistrictId ID quận/huyện người nhận
     * @param toWardCode Mã phường/xã người nhận
     * @param totalQuantity Tổng số lượng sản phẩm
     * @param insuranceValue Giá trị bảo hiểm (tổng tiền đơn hàng)
     * @return Phí ship tính bằng VNĐ
     */
    public BigDecimal calculateShippingFee(int toDistrictId, String toWardCode, int totalQuantity, BigDecimal insuranceValue) {
        try {
            log.info("Tính phí ship với GHN API - District: {}, Ward: {}, Quantity: {}, Value: {}", 
                    toDistrictId, toWardCode, totalQuantity, insuranceValue);

            // Tạo request DTO
            GHNShippingFeeRequestDTO request = new GHNShippingFeeRequestDTO();
            request.setFromDistrictId(FROM_DISTRICT_ID);
            request.setToDistrictId(toDistrictId);
            request.setToWardCode(toWardCode);
            request.setInsuranceValue(insuranceValue.intValue());
            
            // Tính trọng lượng dựa trên số lượng sản phẩm
            int totalWeight = calculateTotalWeight(totalQuantity);
            request.setWeight(totalWeight);
            
            // Tính kích thước gói hàng
            calculatePackageDimensions(request, totalQuantity);

            // Tạo headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("token", GHN_TOKEN);
            headers.set("shop_id", SHOP_ID);

            HttpEntity<GHNShippingFeeRequestDTO> entity = new HttpEntity<>(request, headers);

            // Gọi API
            ResponseEntity<GHNShippingFeeResponseDTO> response = restTemplate.exchange(
                    GHN_API_URL,
                    HttpMethod.POST,
                    entity,
                    GHNShippingFeeResponseDTO.class
            );

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                GHNShippingFeeResponseDTO responseBody = response.getBody();
                
                if (responseBody.getCode() == 200 && responseBody.getData() != null) {
                    int totalFee = responseBody.getData().getTotal();
                    log.info("Phí ship từ GHN: {} VNĐ", totalFee);
                    return BigDecimal.valueOf(totalFee);
                } else {
                    log.warn("GHN API trả về lỗi: Code {}, Message: {}", 
                            responseBody.getCode(), responseBody.getMessage());
                }
            }

        } catch (Exception e) {
            log.error("Lỗi khi gọi API GHN: {}", e.getMessage(), e);
        }

        // Trả về phí ship mặc định nếu có lỗi
        BigDecimal defaultFee = BigDecimal.valueOf(30000); // 30,000 VNĐ
        log.info("Sử dụng phí ship mặc định: {} VNĐ", defaultFee);
        return defaultFee;
    }

    /**
     * Tính trọng lượng tổng dựa trên số lượng sản phẩm
     */
    private int calculateTotalWeight(int quantity) {
        int totalWeight = quantity * DEFAULT_WEIGHT_PER_RACKET;
        
        // Trọng lượng tối thiểu 200g
        if (totalWeight < 200) {
            totalWeight = 200;
        }
        
        log.debug("Tổng trọng lượng: {} gram cho {} sản phẩm", totalWeight, quantity);
        return totalWeight;
    }

    /**
     * Tính toán kích thước gói hàng dựa trên số lượng vợt
     */
    private void calculatePackageDimensions(GHNShippingFeeRequestDTO request, int quantity) {
        // Với vợt cầu lông, thường đóng gói theo chiều dài
        request.setLength(DEFAULT_LENGTH);
        request.setWidth(DEFAULT_WIDTH);
        
        // Chiều cao tăng theo số lượng (mỗi vợt khoảng 5cm)
        int height = Math.max(DEFAULT_HEIGHT, quantity * 5);
        // Giới hạn chiều cao tối đa 50cm
        height = Math.min(height, 50);
        
        request.setHeight(height);
        
        log.debug("Kích thước gói hàng: {}x{}x{} cm", 
                request.getLength(), request.getWidth(), request.getHeight());
    }

    /**
     * Tính phí ship với thông tin tối thiểu
     */
    public BigDecimal calculateShippingFee(int toDistrictId, String toWardCode, int totalQuantity) {
        return calculateShippingFee(toDistrictId, toWardCode, totalQuantity, BigDecimal.valueOf(100000));
    }
}