package com.example.da_be.service;

import com.example.da_be.dto.request.*;
import com.example.da_be.dto.response.BulkOrderInquiryResponse;
import com.example.da_be.entity.*;
import com.example.da_be.repository.*;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
@Transactional
public class BulkOrderService {
    private final BulkOrderInquiryRepository inquiryRepository;
    private final BulkOrderInquiryNoteRepository noteRepository;
    private final BulkOrderQuotationRepository quotationRepository;
    private final BulkOrderInteractionRepository interactionRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public BulkOrderService(BulkOrderInquiryRepository inquiryRepository,
                            BulkOrderInquiryNoteRepository noteRepository,
                            BulkOrderQuotationRepository quotationRepository,
                            BulkOrderInteractionRepository interactionRepository) {
        this.inquiryRepository = inquiryRepository;
        this.noteRepository = noteRepository;
        this.quotationRepository = quotationRepository;
        this.interactionRepository = interactionRepository;
    }

    public BulkOrderInquiryResponse createInquiry(BulkOrderInquiryRequest request){
        BulkOrderInquiry inquiry = new BulkOrderInquiry();
        inquiry.setCustomerName(request.customerInfo.name);
        inquiry.setCustomerPhone(request.customerInfo.phone);
        inquiry.setCustomerEmail(request.customerInfo.email);
        inquiry.setCustomerNote(request.customerInfo.note);
        inquiry.setContactMethod(request.contactMethod);
        inquiry.setStatus(Optional.ofNullable(request.status).orElse("pending"));
        inquiry.setTotalQuantity(request.orderData.totalQuantity);
        inquiry.setTotalValue(request.orderData.totalValue);
        inquiry.setItemCount(request.orderData.itemCount);
        // Serialize cart items nếu có
        try {
            if(request.orderData.cartItems != null && !request.orderData.cartItems.isEmpty()){
                inquiry.setCartItemsJson(objectMapper.writeValueAsString(request.orderData.cartItems));
            }
        } catch (Exception ex){
            // bỏ qua lỗi serialize để không chặn tạo inquiry
        }
        BulkOrderInquiry saved = inquiryRepository.save(inquiry);
        logInteraction(saved.getId(), "create_inquiry", null);
        return map(saved);
    }

    public List<BulkOrderInquiryResponse> getAll(String status, String method, String search){
        Specification<BulkOrderInquiry> spec = Specification.where(null);
        if(status!=null && !status.equals("all")){
            spec = spec.and((root, q, cb) -> cb.equal(root.get("status"), status));
        }
        if(method!=null && !method.equals("all")){
            spec = spec.and((root, q, cb) -> cb.equal(root.get("contactMethod"), method));
        }
        if(search!=null && !search.isBlank()){
            String like = "%"+search+"%";
            spec = spec.and((root,q,cb)-> cb.or(
                    cb.like(root.get("customerName"), like),
                    cb.like(root.get("customerPhone"), like),
                    cb.like(root.get("customerEmail"), like)
            ));
        }
        return inquiryRepository.findAll(spec, Sort.by(Sort.Direction.DESC, "createdAt"))
                .stream().map(this::map).collect(Collectors.toList());
    }

    public BulkOrderInquiryResponse getById(Long id){
        return map(inquiryRepository.findById(id).orElseThrow());
    }

    public BulkOrderInquiryResponse updateStatus(Long id, UpdateInquiryStatusRequest request){
        BulkOrderInquiry inq = inquiryRepository.findById(id).orElseThrow();
        System.out.println("[BulkOrderService] updateStatus called for id="+id+" status="+request.status+" contactMethod="+request.contactMethod);
        inq.setStatus(request.status);
        inq.setAssignedStaff(request.assignedStaff);
        // If contactMethod is provided in the request, persist it
        if(request.contactMethod!=null){
            inq.setContactMethod(request.contactMethod);
            System.out.println("[BulkOrderService] contactMethod persisted="+request.contactMethod);
        }
        inq.setUpdatedAt(LocalDateTime.now());
        logInteraction(id, "status_change", request.status);
        return map(inquiryRepository.save(inq));
    }

    public BulkOrderInquiryResponse addNote(Long id, AddInquiryNoteRequest request){
        BulkOrderInquiry inq = inquiryRepository.findById(id).orElseThrow();
        BulkOrderInquiryNote note = new BulkOrderInquiryNote();
        note.setInquiry(inq);
        note.setStaffName(request.staffName);
        note.setText(request.text);
        noteRepository.save(note);
        logInteraction(id, "note_added", request.text);
        return getById(id);
    }

    public BulkOrderInquiryResponse createQuotation(Long id, CreateQuotationRequest request){
        BulkOrderInquiry inq = inquiryRepository.findById(id).orElseThrow();
        BulkOrderQuotation existing = quotationRepository.findByInquiry_Id(id);
        if(existing!=null){
            quotationRepository.delete(existing);
        }
        BulkOrderQuotation q = new BulkOrderQuotation();
        q.setInquiry(inq);
        q.setDiscountPercent(request.discountPercent);
        q.setSubTotal(request.subTotal);
        q.setDiscountAmount(request.discountAmount);
        q.setTotal(request.total);
        quotationRepository.save(q);
        logInteraction(id, "create_quotation", String.valueOf(request.discountPercent));
        return getById(id);
    }

    public BulkOrderInquiryResponse updateCustomerInfo(Long id, UpdateCustomerInfoRequest request){
        BulkOrderInquiry inq = inquiryRepository.findById(id).orElseThrow();
        inq.setCustomerName(request.name);
        inq.setCustomerPhone(request.phone);
        inq.setCustomerEmail(request.email);
        inq.setCustomerNote(request.note);
        inq.setUpdatedAt(LocalDateTime.now());
        return map(inquiryRepository.save(inq));
    }

    public List<?> getInquiryHistory(Long id){
        return interactionRepository.findByInquiryIdOrderByCreatedAtDesc(id);
    }

    public BulkOrderInquiryResponse convertToOrder(Long id){
        // Future: create HoaDon from inquiry
        logInteraction(id, "convert_to_order", null);
        return getById(id);
    }

    public void logInteraction(Long inquiryId, String type, String metadata){
        BulkOrderInteraction i = new BulkOrderInteraction();
        i.setInquiryId(inquiryId);
        i.setType(type);
        i.setMetadata(metadata);
        interactionRepository.save(i);
    }

    private BulkOrderInquiryResponse map(BulkOrderInquiry inq){
        BulkOrderInquiryResponse r = new BulkOrderInquiryResponse();
        r.id = inq.getId();
        r.customerName = inq.getCustomerName();
        r.customerPhone = inq.getCustomerPhone();
        r.customerEmail = inq.getCustomerEmail();
        r.customerNote = inq.getCustomerNote();
        r.contactMethod = inq.getContactMethod();
        r.status = inq.getStatus();
        r.assignedStaff = inq.getAssignedStaff();
        r.totalQuantity = inq.getTotalQuantity();
        r.totalValue = inq.getTotalValue();
        r.itemCount = inq.getItemCount();
        r.createdAt = inq.getCreatedAt();
        r.updatedAt = inq.getUpdatedAt();
        r.notes = inq.getNotes().stream().map(n->{
            BulkOrderInquiryResponse.Note note = new BulkOrderInquiryResponse.Note();
            note.id = n.getId();
            note.text = n.getText();
            note.staffName = n.getStaffName();
            note.createdAt = n.getCreatedAt();
            return note;}).collect(Collectors.toList());
        if(inq.getQuotation()!=null){
            BulkOrderInquiryResponse.Quotation q = new BulkOrderInquiryResponse.Quotation();
            q.id = inq.getQuotation().getId();
            q.discountPercent = inq.getQuotation().getDiscountPercent();
            q.subTotal = inq.getQuotation().getSubTotal();
            q.discountAmount = inq.getQuotation().getDiscountAmount();
            q.total = inq.getQuotation().getTotal();
            r.quotation = q;
        }
        // Parse cart items JSON -> list
        if(inq.getCartItemsJson()!=null){
            try {
                r.cartItems = objectMapper.readValue(inq.getCartItemsJson(), new TypeReference<List<BulkOrderInquiryResponse.CartItem>>() {});
            } catch (Exception ex){
                // nếu lỗi parse giữ null
            }
        }
        return r;
    }
}
