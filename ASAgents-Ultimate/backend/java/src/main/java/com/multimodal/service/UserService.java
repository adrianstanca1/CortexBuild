package com.multimodal.service;

import com.multimodal.model.User;
import com.multimodal.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

/**
 * Service layer for User management
 * Handles business logic for user operations, authentication, and authorization
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class UserService {

    private final UserRepository userRepository;
    // private final PasswordEncoder passwordEncoder; // Will be needed when
    // security is enabled

    /**
     * Get users by tenant with filtering and pagination
     */
    public Page<User> getUsersByTenant(Long tenantId, String search, String role, Pageable pageable) {
        User.UserRole userRole = null;
        if (role != null && !role.trim().isEmpty()) {
            try {
                userRole = User.UserRole.valueOf(role.toUpperCase());
            } catch (IllegalArgumentException e) {
                log.warn("Invalid user role: {}", role);
            }
        }

        return userRepository.findUsersWithFilters(tenantId, search, userRole, pageable);
    }

    /**
     * Get user by ID and tenant
     */
    public Optional<User> getUserByIdAndTenant(Long id, Long tenantId) {
        return userRepository.findByIdAndTenantId(id, tenantId);
    }

    /**
     * Get user by email and tenant
     */
    public Optional<User> getUserByEmailAndTenant(String email, Long tenantId) {
        return userRepository.findByEmailAndTenantId(email, tenantId);
    }

    /**
     * Create a new user
     */
    public User createUser(User user) {
        // Check if user already exists
        Optional<User> existingUser = userRepository.findByEmailAndTenantId(user.getEmail(), user.getTenantId());
        if (existingUser.isPresent()) {
            throw new RuntimeException("User with email already exists: " + user.getEmail());
        }

        // Hash password if provided
        if (user.getPasswordHash() != null && !user.getPasswordHash().isEmpty()) {
            // user.setPasswordHash(passwordEncoder.encode(user.getPasswordHash())); //
            // Enable when security is configured
        }

        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        user.setEmailVerified(false);
        user.setIsActive(true);

        return userRepository.save(user);
    }

    /**
     * Update an existing user
     */
    public User updateUser(User user) {
        Optional<User> existingUser = getUserByIdAndTenant(user.getId(), user.getTenantId());

        if (!existingUser.isPresent()) {
            throw new RuntimeException("User not found: " + user.getId());
        }

        User existing = existingUser.get();

        // Update only non-null fields
        if (user.getFirstName() != null)
            existing.setFirstName(user.getFirstName());
        if (user.getLastName() != null)
            existing.setLastName(user.getLastName());
        if (user.getPhone() != null)
            existing.setPhone(user.getPhone());
        if (user.getAvatarUrl() != null)
            existing.setAvatarUrl(user.getAvatarUrl());
        if (user.getJobTitle() != null)
            existing.setJobTitle(user.getJobTitle());
        if (user.getDepartment() != null)
            existing.setDepartment(user.getDepartment());
        if (user.getHourlyRate() != null)
            existing.setHourlyRate(user.getHourlyRate());
        if (user.getRole() != null)
            existing.setRole(user.getRole());
        if (user.getPreferences() != null)
            existing.setPreferences(user.getPreferences());

        existing.setUpdatedAt(LocalDateTime.now());

        return userRepository.save(existing);
    }

    /**
     * Update user profile (self-service with limited fields)
     */
    public boolean updateUserProfile(Long userId, Long tenantId, Map<String, Object> updates) {
        Optional<User> userOptional = getUserByIdAndTenant(userId, tenantId);

        if (userOptional.isPresent()) {
            User user = userOptional.get();

            // Only allow specific profile updates
            if (updates.containsKey("firstName")) {
                user.setFirstName((String) updates.get("firstName"));
            }
            if (updates.containsKey("lastName")) {
                user.setLastName((String) updates.get("lastName"));
            }
            if (updates.containsKey("phone")) {
                user.setPhone((String) updates.get("phone"));
            }
            if (updates.containsKey("avatarUrl")) {
                user.setAvatarUrl((String) updates.get("avatarUrl"));
            }
            if (updates.containsKey("preferences")) {
                user.setPreferences((String) updates.get("preferences"));
            }

            user.setUpdatedAt(LocalDateTime.now());
            userRepository.save(user);
            return true;
        }

        return false;
    }

    /**
     * Deactivate user (soft delete)
     */
    public boolean deactivateUser(Long id, Long tenantId) {
        Optional<User> userOptional = getUserByIdAndTenant(id, tenantId);

        if (userOptional.isPresent()) {
            User user = userOptional.get();
            user.setIsActive(false);
            user.setUpdatedAt(LocalDateTime.now());
            userRepository.save(user);
            return true;
        }

        return false;
    }

    /**
     * Activate user
     */
    public boolean activateUser(Long id, Long tenantId) {
        Optional<User> userOptional = getUserByIdAndTenant(id, tenantId);

        if (userOptional.isPresent()) {
            User user = userOptional.get();
            user.setIsActive(true);
            user.setUpdatedAt(LocalDateTime.now());
            userRepository.save(user);
            return true;
        }

        return false;
    }

    /**
     * Update user last login timestamp
     */
    public void updateLastLogin(Long userId, Long tenantId) {
        Optional<User> userOptional = getUserByIdAndTenant(userId, tenantId);

        if (userOptional.isPresent()) {
            User user = userOptional.get();
            user.setLastLogin(LocalDateTime.now());
            userRepository.save(user);
        }
    }

    /**
     * Get user statistics for admin dashboard
     */
    public Map<String, Object> getUserStatistics(Long tenantId) {
        Map<String, Object> stats = new HashMap<>();

        // User counts by role
        long totalUsers = userRepository.countByTenantId(tenantId);
        long activeUsers = userRepository.countByTenantIdAndIsActive(tenantId, true);
        long inactiveUsers = totalUsers - activeUsers;

        stats.put("totalUsers", totalUsers);
        stats.put("activeUsers", activeUsers);
        stats.put("inactiveUsers", inactiveUsers);

        // Role distribution
        for (User.UserRole role : User.UserRole.values()) {
            long count = userRepository.countByTenantIdAndRole(tenantId, role);
            stats.put("role_" + role.name().toLowerCase(), count);
        }

        // Recent users
        stats.put("recentUsers", userRepository.findTop5ByTenantIdOrderByCreatedAtDesc(tenantId));

        return stats;
    }

    /**
     * Verify user email
     */
    public boolean verifyEmail(Long userId, Long tenantId) {
        Optional<User> userOptional = getUserByIdAndTenant(userId, tenantId);

        if (userOptional.isPresent()) {
            User user = userOptional.get();
            user.setEmailVerified(true);
            user.setUpdatedAt(LocalDateTime.now());
            userRepository.save(user);
            return true;
        }

        return false;
    }
}