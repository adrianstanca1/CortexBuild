package com.multimodal.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Project entity for construction management platform
 * Matches the projects table in the Node.js backend
 */
@Entity
@Table(name = "projects")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Project name is required")
    @Column(nullable = false, length = 255)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @NotNull(message = "Tenant ID is required")
    @Column(name = "tenant_id", nullable = false)
    private Long tenantId;

    @NotNull(message = "Owner ID is required")
    @Column(name = "owner_id", nullable = false)
    private Long ownerId;

    @Column(name = "manager_id")
    private Long managerId;

    @Column(name = "company_id")
    private Long companyId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private ProjectStatus status = ProjectStatus.PLANNING;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private ProjectPriority priority = ProjectPriority.MEDIUM;

    @Column(name = "start_date")
    private LocalDateTime startDate;

    @Column(name = "end_date")
    private LocalDateTime endDate;

    @Column(name = "estimated_budget", precision = 15, scale = 2)
    private java.math.BigDecimal estimatedBudget;

    @Column(name = "actual_budget", precision = 15, scale = 2)
    private java.math.BigDecimal actualBudget;

    @Column(length = 500)
    private String location;

    @Column(name = "client_name", length = 255)
    private String clientName;

    @Column(name = "client_email", length = 255)
    private String clientEmail;

    @Column(name = "client_phone", length = 50)
    private String clientPhone;

    @Column(name = "progress_percentage")
    @Builder.Default
    private Integer progressPercentage = 0;

    @Column(columnDefinition = "JSON")
    private String metadata; // JSON field for additional project data

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    // Navigation properties (mapped by JPA relationships)
    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Task> tasks;

    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Expense> expenses;

    public enum ProjectStatus {
        PLANNING, ACTIVE, ON_HOLD, COMPLETED, CANCELLED
    }

    public enum ProjectPriority {
        LOW, MEDIUM, HIGH, CRITICAL
    }
}