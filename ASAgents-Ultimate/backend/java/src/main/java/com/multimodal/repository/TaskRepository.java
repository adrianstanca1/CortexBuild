package com.multimodal.repository;

import com.multimodal.model.Task;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for Task entity
 * Provides data access methods for task operations
 */
@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    /**
     * Find tasks by tenant ID with pagination
     */
    Page<Task> findByTenantIdOrderByCreatedAtDesc(Long tenantId, Pageable pageable);

    /**
     * Find task by ID and tenant ID
     */
    Optional<Task> findByIdAndTenantId(Long id, Long tenantId);

    /**
     * Find tasks by project ID and tenant ID
     */
    Page<Task> findByProjectIdAndTenantIdOrderByCreatedAtDesc(Long projectId, Long tenantId, Pageable pageable);

    /**
     * Find tasks by tenant and title containing search term (case insensitive)
     */
    Page<Task> findByTenantIdAndTitleContainingIgnoreCase(Long tenantId, String title, Pageable pageable);

    /**
     * Find tasks by tenant and status
     */
    Page<Task> findByTenantIdAndStatus(Long tenantId, Task.TaskStatus status, Pageable pageable);

    /**
     * Find tasks by tenant and assigned user
     */
    Page<Task> findByTenantIdAndAssignedTo(Long tenantId, Long assignedTo, Pageable pageable);

    /**
     * Find tasks with complex filtering
     */
    @Query("SELECT t FROM Task t WHERE t.tenantId = :tenantId " +
           "AND (:projectId IS NULL OR t.projectId = :projectId) " +
           "AND (:status IS NULL OR t.status = :status) " +
           "AND (:assignedTo IS NULL OR t.assignedTo = :assignedTo) " +
           "AND (:search IS NULL OR LOWER(t.title) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(t.description) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "ORDER BY t.createdAt DESC")
    Page<Task> findTasksWithFilters(@Param("tenantId") Long tenantId,
                                   @Param("projectId") Long projectId,
                                   @Param("status") Task.TaskStatus status,
                                   @Param("assignedTo") Long assignedTo,
                                   @Param("search") String search,
                                   Pageable pageable);

    /**
     * Count tasks by tenant
     */
    long countByTenantId(Long tenantId);

    /**
     * Count tasks by tenant and status
     */
    long countByTenantIdAndStatus(Long tenantId, Task.TaskStatus status);

    /**
     * Count tasks by project and status
     */
    long countByProjectIdAndStatus(Long projectId, Task.TaskStatus status);

    /**
     * Find tasks assigned to user
     */
    List<Task> findByAssignedToAndTenantIdOrderByDueDateAsc(Long assignedTo, Long tenantId);

    /**
     * Find overdue tasks
     */
    @Query("SELECT t FROM Task t WHERE t.tenantId = :tenantId AND t.dueDate < CURRENT_TIMESTAMP AND t.status NOT IN ('DONE', 'CANCELLED')")
    List<Task> findOverdueTasks(@Param("tenantId") Long tenantId);

    /**
     * Find tasks by creator
     */
    List<Task> findByCreatedByAndTenantId(Long createdBy, Long tenantId);
}