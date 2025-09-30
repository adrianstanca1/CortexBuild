package com.multimodal.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * User entity for construction management platform
 * Matches the users table in the Node.js backend
 */
@Entity
@Table(name = "users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank(message = "Email is required")
    @Email(message = "Valid email is required")
    @Column(nullable = false, unique = true, length = 255)
    private String email;
    
    @Column(name = "password_hash", length = 255)
    private String passwordHash;
    
    @NotBlank(message = "First name is required")
    @Column(name = "first_name", nullable = false, length = 100)
    private String firstName;
    
    @NotBlank(message = "Last name is required")
    @Column(name = "last_name", nullable = false, length = 100)
    private String lastName;
    
    @NotNull(message = "Tenant ID is required")
    @Column(name = "tenant_id", nullable = false)
    private Long tenantId;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private UserRole role = UserRole.WORKER;
    
    @Column(length = 20)
    private String phone;
    
    @Column(name = "avatar_url", length = 500)
    private String avatarUrl;
    
    @Column(name = "job_title", length = 100)
    private String jobTitle;
    
    @Column(length = 100)
    private String department;
    
    @Column(name = "hire_date")
    private LocalDateTime hireDate;
    
    @Column(name = "hourly_rate", precision = 10, scale = 2)
    private java.math.BigDecimal hourlyRate;
    
    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;
    
    @Column(name = "email_verified")
    @Builder.Default
    private Boolean emailVerified = false;
    
    @Column(name = "last_login")
    private LocalDateTime lastLogin;
    
    @Column(columnDefinition = "JSON")
    private String preferences; // JSON field for user preferences
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
    
    public enum UserRole {
        OWNER, ADMIN, MANAGER, SUPERVISOR, WORKER
    }
}