package com.example.da_be.controller;

import com.example.da_be.dto.request.ApiResponse;
import com.example.da_be.dto.request.User.UserCreationRequest;
import com.example.da_be.dto.request.User.UserUpdateRequest;
import com.example.da_be.dto.response.HoaDonCTResponse;
import com.example.da_be.dto.response.HoaDonResponse;
import com.example.da_be.dto.response.UserResponse;
import com.example.da_be.service.UserService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/users")
@CrossOrigin(origins = "http://localhost:5173")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class UserController {

    UserService userService;

    @PostMapping()
    ApiResponse<UserResponse> createUser(@RequestBody @Valid UserCreationRequest request){
        return ApiResponse.<UserResponse>builder()
                .result(userService.createUser(request))
                .build();

    }

    @GetMapping("/myOrders")
    ApiResponse<List<HoaDonResponse>> getAllMyOders(){
        return ApiResponse.<List<HoaDonResponse>>builder()
                .result(userService.getMyOders())
                .code(1000)
                .build();
    }

    @GetMapping("/myOderDetail/{idHoaDon}")
    ApiResponse<List<HoaDonCTResponse>> getOderDetail(@PathVariable("idHoaDon") Integer idHoaDon) {
        return ApiResponse.<List<HoaDonCTResponse>>builder()
                .result(userService.getMyOdersDetails(idHoaDon))
                .code(1000)
                .build();
    }

    //    @GetMapping
//    ApiResponse<List<UserResponse>> getUsers(){
//
//        var authentication = SecurityContextHolder.getContext().getAuthentication();
//
//        log.info("Username: {}" , authentication.getName());
//        authentication.getAuthorities().forEach(grantedAuthority -> log.info(grantedAuthority.getAuthority()));
//
//        return ApiResponse.<List<UserResponse>>builder()
//                .result(userService.getUsers())
//                .message("Success")
//                .code(1000)
//                .build();
//    }

    //    @GetMapping("/{userId}")
//    ApiResponse<UserResponse> getUser(@PathVariable("userId") String userId) {
//        return ApiResponse.<UserResponse>builder()
//                .result(userService.getUser(userId))
//                .code(1000)
//                .build();
//    }
    @GetMapping("/myInfo")
    ApiResponse<UserResponse> getUser() {
        return ApiResponse.<UserResponse>builder()
                .result(userService.getMyInfo())
                .code(1000)
                .build();
    }

    @PutMapping(value = "/{userId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    ApiResponse<UserResponse> updateUser(@PathVariable("userId") Integer userId, @ModelAttribute UserUpdateRequest request) {
        return ApiResponse.<UserResponse>builder()
                .result(userService.updateUser(request, userId))
                .code(1000)
                .build();
    }

    @GetMapping("/check-email")
    ApiResponse<Boolean> checkEmailExists(@RequestParam String email) {
        return ApiResponse.<Boolean>builder()
                .result(userService.checkEmailExists(email))
                .build();
    }

    @PostMapping()
    ApiResponse<UserResponse> createUser(@RequestBody @Valid UserCreationRequest request){
        return ApiResponse.<UserResponse>builder()
                .result(userService.createUser(request))
                .build();
    }

}