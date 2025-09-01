package com.example.da_be.controller;

import com.example.da_be.dto.request.*;
import com.example.da_be.dto.request.ApiResponse;
import com.example.da_be.dto.response.BulkOrderInquiryResponse;
import com.example.da_be.service.BulkOrderService;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletResponse;

import java.util.List;

@RestController
@RequestMapping("/api/bulk-orders")
@CrossOrigin(origins = {"http://localhost:5173","http://localhost:3000"}, allowCredentials = "true")
public class BulkOrderController {
    private final BulkOrderService bulkOrderService;

    public BulkOrderController(BulkOrderService bulkOrderService) {
        this.bulkOrderService = bulkOrderService;
    }

    @PostMapping("/inquiries")
    public ApiResponse<BulkOrderInquiryResponse> createInquiry(@RequestBody BulkOrderInquiryRequest request){
        return ApiResponse.<BulkOrderInquiryResponse>builder().result(bulkOrderService.createInquiry(request)).build();
    }

    @GetMapping("/inquiries")
    public ApiResponse<List<BulkOrderInquiryResponse>> getAll(@RequestParam(required = false) String status,
                                                              @RequestParam(name = "contactMethod", required = false) String method,
                                                              @RequestParam(required = false) String search){
        return ApiResponse.<List<BulkOrderInquiryResponse>>builder().result(bulkOrderService.getAll(status, method, search)).build();
    }

    @GetMapping("/inquiries/{id}")
    public ApiResponse<BulkOrderInquiryResponse> getById(@PathVariable Long id){
        return ApiResponse.<BulkOrderInquiryResponse>builder().result(bulkOrderService.getById(id)).build();
    }

    @PatchMapping("/inquiries/{id}/status")
    public ApiResponse<BulkOrderInquiryResponse> updateStatus(@PathVariable Long id, @RequestBody UpdateInquiryStatusRequest request){
        return ApiResponse.<BulkOrderInquiryResponse>builder().result(bulkOrderService.updateStatus(id, request)).build();
    }

    @PostMapping("/inquiries/{id}/notes")
    public ApiResponse<BulkOrderInquiryResponse> addNote(@PathVariable Long id, @RequestBody AddInquiryNoteRequest request){
        return ApiResponse.<BulkOrderInquiryResponse>builder().result(bulkOrderService.addNote(id, request)).build();
    }

    @PostMapping("/inquiries/{id}/quotation")
    public ApiResponse<BulkOrderInquiryResponse> createQuotation(@PathVariable Long id, @RequestBody CreateQuotationRequest request){
        return ApiResponse.<BulkOrderInquiryResponse>builder().result(bulkOrderService.createQuotation(id, request)).build();
    }

    @GetMapping("/inquiries/{id}/history")
    public ApiResponse<List<?>> history(@PathVariable Long id){
        return ApiResponse.<List<?>>builder().result(bulkOrderService.getInquiryHistory(id)).build();
    }

    @PatchMapping("/inquiries/{id}/customer")
    public ApiResponse<BulkOrderInquiryResponse> updateCustomer(@PathVariable Long id, @RequestBody UpdateCustomerInfoRequest request){
        return ApiResponse.<BulkOrderInquiryResponse>builder().result(bulkOrderService.updateCustomerInfo(id, request)).build();
    }

    // Placeholder endpoints for features not yet fully implemented
    @GetMapping("/statistics")
    public ApiResponse<Object> statistics(@RequestParam(defaultValue = "month") String range){
        // simple mock
        return ApiResponse.builder().result(java.util.Map.of(
                "range", range,
                "total", bulkOrderService.getAll(null,null,null).size()
        )).build();
    }

    @GetMapping("/export")
    public void export(HttpServletResponse response) throws Exception {
        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        response.setHeader("Content-Disposition", "attachment; filename=bulk-orders.xlsx");
        // Very simple CSV-like content for now
        StringBuilder sb = new StringBuilder();
        sb.append("ID,Customer,Phone,Status,TotalValue\n");
        for(var inq : bulkOrderService.getAll(null,null,null)){
            sb.append(inq.id).append(',')
              .append(inq.customerName).append(',')
              .append(inq.customerPhone).append(',')
              .append(inq.status).append(',')
              .append(inq.totalValue).append('\n');
        }
        response.getOutputStream().write(sb.toString().getBytes());
        response.flushBuffer();
    }

    @PostMapping("/inquiries/{id}/send-email")
    public ApiResponse<String> sendEmail(@PathVariable Long id, @RequestBody SendEmailRequest req){
        // Stub - integrate with Mail service later
        bulkOrderService.logInteraction(id, "email_sent", req.template);
        return ApiResponse.<String>builder().result("SENT").build();
    }

    @PostMapping("/interactions")
    public ApiResponse<String> trackInteraction(@RequestBody java.util.Map<String,Object> map){
        Long inquiryId = Long.valueOf(map.getOrDefault("inquiryId",0).toString());
        String type = map.getOrDefault("type","custom").toString();
        bulkOrderService.logInteraction(inquiryId, type, map.toString());
        return ApiResponse.<String>builder().result("OK").build();
    }

    @PostMapping("/inquiries/{id}/convert")
    public ApiResponse<BulkOrderInquiryResponse> convert(@PathVariable Long id){
        return ApiResponse.<BulkOrderInquiryResponse>builder().result(bulkOrderService.convertToOrder(id)).build();
    }
}
    
