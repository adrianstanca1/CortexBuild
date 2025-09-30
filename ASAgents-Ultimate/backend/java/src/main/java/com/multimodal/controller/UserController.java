package com.multimodal.controller;

import com.multimodal.model.User;
import com.multimodal.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

/**
 * REST Controller for User management
 * Provides CRUD operations and user-specific endpoints
 * Matches the Node.js backend API patterns
 */
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class UserController {

    private final UserService userService;

    /**
     * Get all users for the authenticated tenant
     * GET /api/users
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN', 'MANAGER')")
    public ResponseEntity<Map<String, Object>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String role,
            @RequestHeader("X-Tenant-ID") Long tenantId) {
        
        try {
            log.debug("Getting users for tenant: {}, page: {}, size: {}", tenantId, page, size);
            
            Pageable pageable = PageRequest.of(page, size);
            Page<User> users = userService.getUsersByTenant(tenantId, search, role, pageable);
            
            Map<String, Object> response = Map.of(
                "users", users.getContent(),
                "currentPage", users.getNumber(),
                "totalItems", users.getTotalElements(),
                "totalPages", users.getTotalPages(),
                "hasNext", users.hasNext(),
                "hasPrevious", users.hasPrevious()
            );
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error retrieving users for tenant {}: {}", tenantId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to retrieve users"));
        }
    }

    /**
     * Get current user profile
     * GET /api/users/profile
     */
    @GetMapping("/profile")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Map<String, Object>> getCurrentUser(
            @RequestHeader("X-User-ID") Long userId,
            @RequestHeader("X-Tenant-ID") Long tenantId) {
        
        try {
            Optional<User> user = userService.getUserByIdAndTenant(userId, tenantId);
            
            if (user.isPresent()) {
                return ResponseEntity.ok(Map.of("user", user.get()));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "User not found"));
            }
            
        } catch (Exception e) {
            log.error("Error retrieving user profile {}: {}", userId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to retrieve user profile"));
        }
    }

    /**
     * Get a specific user by ID
     * GET /api/users/{id}
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN', 'MANAGER')")
    public ResponseEntity<Map<String, Object>> getUserById(
            @PathVariable Long id,
            @RequestHeader("X-Tenant-ID") Long tenantId) {
        
        try {
            Optional<User> user = userService.getUserByIdAndTenant(id, tenantId);
            
            if (user.isPresent()) {
                return ResponseEntity.ok(Map.of("user", user.get()));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "User not found"));
            }
            
        } catch (Exception e) {
            log.error("Error retrieving user {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to retrieve user"));
        }
    }

    /**
     * Create a new user
     * POST /api/users
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> createUser(
            @Valid @RequestBody User user,
            @RequestHeader("X-Tenant-ID") Long tenantId,
            @RequestHeader("X-User-ID") Long creatorId) {
        
        try {
            // Set tenant from header
            user.setTenantId(tenantId);
            
            User createdUser = userService.createUser(user);
            log.info("Created user: {} for tenant: {}", createdUser.getId(), tenantId);
            
            return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of(
                    "message", "User created successfully",
                    "user", createdUser
                ));
                
        } catch (Exception e) {
            log.error("Error creating user: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to create user"));
        }
    }

    /**
     * Update an existing user
     * PUT /api/users/{id}
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN') or (#id == principal.id)")
    public ResponseEntity<Map<String, Object>> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody User user,
            @RequestHeader("X-Tenant-ID") Long tenantId,
            @RequestHeader("X-User-ID") Long updaterId) {
        
        try {
            // Ensure the user exists and belongs to the tenant
            Optional<User> existingUser = userService.getUserByIdAndTenant(id, tenantId);
            
            if (!existingUser.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "User not found"));
            }
            
            user.setId(id);
            user.setTenantId(tenantId);
            
            User updatedUser = userService.updateUser(user);
            log.info("Updated user: {} for tenant: {}", id, tenantId);
            
            return ResponseEntity.ok(Map.of(
                "message", "User updated successfully",
                "user", updatedUser
            ));
            
        } catch (Exception e) {
            log.error("Error updating user {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to update user"));
        }
    }

    /**
     * Update user profile (self-service)
     * PATCH /api/users/profile
     */
    @PatchMapping("/profile")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Map<String, Object>> updateProfile(
            @RequestBody Map<String, Object> updates,
            @RequestHeader("X-User-ID") Long userId,
            @RequestHeader("X-Tenant-ID") Long tenantId) {
        
        try {
            boolean updated = userService.updateUserProfile(userId, tenantId, updates);
            
            if (updated) {
                return ResponseEntity.ok(Map.of("message", "Profile updated successfully"));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "User not found"));
            }
            
        } catch (Exception e) {
            log.error("Error updating user profile {}: {}", userId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to update profile"));
        }
    }

    /**
     * Deactivate a user (soft delete)
     * DELETE /api/users/{id}
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> deactivateUser(
            @PathVariable Long id,
            @RequestHeader("X-Tenant-ID") Long tenantId) {
        
        try {
            boolean deactivated = userService.deactivateUser(id, tenantId);
            
            if (deactivated) {
                log.info("Deactivated user: {} for tenant: {}", id, tenantId);
                return ResponseEntity.ok(Map.of("message", "User deactivated successfully"));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "User not found"));
            }
            
        } catch (Exception e) {
            log.error("Error deactivating user {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to deactivate user"));
        }
    }

    /**
     * Get user statistics for admin dashboard
     * GET /api/users/statistics
     */
    @GetMapping("/statistics")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> getUserStatistics(
            @RequestHeader("X-Tenant-ID") Long tenantId) {
        
        try {
            Map<String, Object> stats = userService.getUserStatistics(tenantId);
            return ResponseEntity.ok(stats);
            
        } catch (Exception e) {
            log.error("Error retrieving user statistics for tenant {}: {}", tenantId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to retrieve user statistics"));
        }
    }
}