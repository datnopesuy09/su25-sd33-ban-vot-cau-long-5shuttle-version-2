package com.example.da_be.controller;

import com.example.da_be.entity.User;
import com.example.da_be.service.UserService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
@RequestMapping("/api/user")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class AdminUserController {

    UserService userService;

    // Get all customers (users with USER type)
    @GetMapping("/customers")
    public ResponseEntity<List<User>> getAllCustomers() {
        try {
            List<User> customers = userService.getAllCustomers();
            return ResponseEntity.ok(customers);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // Create new customer
    @PostMapping
    public ResponseEntity<User> createCustomer(@RequestBody User user) {
        try {
            if (user.getUserType() == null) {
                user.setUserType(2); // 2 = USER
            }
            if (user.getTrangThai() == null) {
                user.setTrangThai(1);
            }
            User savedUser = userService.createCustomer(user);
            return ResponseEntity.ok(savedUser);
        } catch (Exception e) {
            if (e.getMessage().contains("Email") || e.getMessage().contains("phone")) {
                return ResponseEntity.status(409).build(); // Conflict
            }
            return ResponseEntity.internalServerError().build();
        }
    }

    // Update customer
    @PutMapping("/{id}")
    public ResponseEntity<User> updateCustomer(@PathVariable Integer id, @RequestBody User user) {
        try {
            User updatedUser = userService.updateCustomer(id, user);
            return ResponseEntity.ok(updatedUser);
        } catch (Exception e) {
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.notFound().build();
            }
            if (e.getMessage().contains("Email") || e.getMessage().contains("phone")) {
                return ResponseEntity.status(409).build(); // Conflict
            }
            return ResponseEntity.internalServerError().build();
        }
    }

    // Delete customer
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCustomer(@PathVariable Integer id) {
        try {
            userService.deleteCustomer(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.internalServerError().build();
        }
    }

    // Get customer by ID
    @GetMapping("/{id}")
    public ResponseEntity<User> getCustomerById(@PathVariable Integer id) {
        try {
            User user = userService.getCustomerById(id);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.internalServerError().build();
        }
    }

    // Search customers
    @GetMapping("/search")
    public ResponseEntity<List<User>> searchCustomers(@RequestParam String keyword) {
        try {
            List<User> customers = userService.searchCustomers(keyword);
            return ResponseEntity.ok(customers);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}