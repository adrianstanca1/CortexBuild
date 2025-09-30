package com.multimodal.repository;

import com.multimodal.model.Project;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for Project entity
 * Provides data access methods for project operations
 */
@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {

    /**
     * Find projects by tenant ID with pagination
     */
    Page<Project> findByTenantIdOrderByCreatedAtDesc(Long tenantId, Pageable pageable);

    /**
     * Find project by ID and tenant ID
     */
    Optional<Project> findByIdAndTenantId(Long id, Long tenantId);

    /**
     * Find projects by tenant and name containing search term (case insensitive)
     */
    Page<Project> findByTenantIdAndNameContainingIgnoreCase(Long tenantId, String name, Pageable pageable);

    /**
     * Find projects by tenant, status, and name containing search term
     */
    Page<Project> findByTenantIdAndNameContainingIgnoreCaseAndStatus(
        Long tenantId, String name, Project.ProjectStatus status, Pageable pageable);

    /**
     * Find projects by tenant and status
     */
    Page<Project> findByTenantIdAndStatus(Long tenantId, Project.ProjectStatus status, Pageable pageable);

    /**
     * Count projects by tenant
     */
    long countByTenantId(Long tenantId);

    /**
     * Count projects by tenant and status
     */
    long countByTenantIdAndStatus(Long tenantId, Project.ProjectStatus status);

    /**
     * Find top 5 recent projects by tenant
     */
    List<Project> findTop5ByTenantIdOrderByCreatedAtDesc(Long tenantId);

    /**
     * Find projects by owner ID
     */
    List<Project> findByOwnerId(Long ownerId);

    /**
     * Find projects by manager ID
     */
    List<Project> findByManagerId(Long managerId);

    /**
     * Custom query to find projects with tasks statistics
     */
    @Query("SELECT p FROM Project p WHERE p.tenantId = :tenantId AND p.status IN :statuses")
    List<Project> findProjectsWithStatuses(@Param("tenantId") Long tenantId, 
                                         @Param("statuses") List<Project.ProjectStatus> statuses);

    /**
     * Find overdue projects
     */
    @Query("SELECT p FROM Project p WHERE p.tenantId = :tenantId AND p.endDate < CURRENT_TIMESTAMP AND p.status NOT IN ('COMPLETED', 'CANCELLED')")
    List<Project> findOverdueProjects(@Param("tenantId") Long tenantId);

    /**
     * Find projects by client name
     */
    List<Project> findByTenantIdAndClientNameContainingIgnoreCase(Long tenantId, String clientName);
}