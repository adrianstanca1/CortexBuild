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
import java.math.BigDecimal;

/**
 * Expense entity for construction management platform
 * Matches the expenses table in the Node.js backend
 */
@Entity
@Table(name = "expenses")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Expense {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Expense description is required")
    @Column(nullable = false, length = 255)
    private String description;

    @NotNull(message = "Amount is required")
    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    @NotNull(message = "Tenant ID is required")
    @Column(name = "tenant_id", nullable = false)
    private Long tenantId;

    @NotNull(message = "Project ID is required")
    @Column(name = "project_id", nullable = false)
    private Long projectId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @NotBlank(message = "Category is required")
    @Column(nullable = false, length = 100)
    private String category;

    @Column(name = "receipt_path", length = 500)
    private String receiptPath;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private ExpenseStatus status = ExpenseStatus.PENDING;

    @Column(name = "expense_date", nullable = false)
    private LocalDateTime expenseDate;

    @Column(length = 100)
    private String vendor;

    @Column(name = "reimbursable")
    @Builder.Default
    private Boolean reimbursable = false;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    // Many-to-One relationship with Project
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", insertable = false, updatable = false)
    private Project project;

    public enum ExpenseStatus {
        PENDING, APPROVED, REJECTED, REIMBURSED
    }
}