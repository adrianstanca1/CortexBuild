package com.multimodal.repository;

import com.multimodal.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for User entity
 * Provides data access methods for user operations
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * Find user by email and tenant ID
     */
    Optional<User> findByEmailAndTenantId(String email, Long tenantId);

    /**
     * Find user by ID and tenant ID
     */
    Optional<User> findByIdAndTenantId(Long id, Long tenantId);

    /**
     * Find users by tenant ID with pagination
     */
    Page<User> findByTenantIdOrderByCreatedAtDesc(Long tenantId, Pageable pageable);

    /**
     * Find active users by tenant ID
     */
    Page<User> findByTenantIdAndIsActiveOrderByCreatedAtDesc(Long tenantId, boolean isActive, Pageable pageable);

    /**
     * Find users by role and tenant ID
     */
    Page<User> findByTenantIdAndRole(Long tenantId, User.UserRole role, Pageable pageable);

    /**
     * Find users with complex filtering
     */
    @Query("SELECT u FROM User u WHERE u.tenantId = :tenantId " +
            "AND (:role IS NULL OR u.role = :role) " +
            "AND (:search IS NULL OR LOWER(u.firstName) LIKE LOWER(CONCAT('%', :search, '%')) " +
            "    OR LOWER(u.lastName) LIKE LOWER(CONCAT('%', :search, '%')) " +
            "    OR LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%'))) " +
            "ORDER BY u.createdAt DESC")
    Page<User> findUsersWithFilters(@Param("tenantId") Long tenantId,
            @Param("search") String search,
            @Param("role") User.UserRole role,
            Pageable pageable);

    /**
     * Count users by tenant
     */
    long countByTenantId(Long tenantId);

    /**
     * Count active users by tenant
     */
    long countByTenantIdAndIsActive(Long tenantId, boolean isActive);

    /**
     * Count users by role and tenant
     */
    long countByTenantIdAndRole(Long tenantId, User.UserRole role);

    /**
     * Find top 5 recent users by tenant
     */
    List<User> findTop5ByTenantIdOrderByCreatedAtDesc(Long tenantId);

    /**
     * Find users by department and tenant
     */
    List<User> findByTenantIdAndDepartment(Long tenantId, String department);

    /**
     * Find users by job title and tenant
     */
    List<User> findByTenantIdAndJobTitle(Long tenantId, String jobTitle);

    /**
     * Check if email exists in tenant
     */
    boolean existsByEmailAndTenantId(String email, Long tenantId);

    /**
     * Find users needing email verification
     */
    List<User> findByTenantIdAndEmailVerifiedFalse(Long tenantId);
}