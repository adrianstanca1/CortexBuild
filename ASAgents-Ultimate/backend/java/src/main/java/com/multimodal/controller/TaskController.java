package com.multimodal.controller;

import com.multimodal.model.Task;
import com.multimodal.service.TaskService;
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
 * REST Controller for Task management
 * Provides CRUD operations and task-specific endpoints
 * Matches the Node.js backend API patterns
 */
@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = { "http://localhost:5173", "http://localhost:3000" })
public class TaskController {

    private final TaskService taskService;

    /**
     * Get all tasks for the authenticated user's tenant
     * GET /api/tasks
     */
    @GetMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Map<String, Object>> getAllTasks(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) Long projectId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String assignedTo,
            @RequestParam(required = false) String search,
            @RequestHeader("X-Tenant-ID") Long tenantId) {

        try {
            log.debug("Getting tasks for tenant: {}, project: {}", tenantId, projectId);

            Pageable pageable = PageRequest.of(page, size);
            Page<Task> tasks = taskService.getTasksByTenant(tenantId, projectId, status, assignedTo, search, pageable);

            Map<String, Object> response = Map.of(
                    "tasks", tasks.getContent(),
                    "currentPage", tasks.getNumber(),
                    "totalItems", tasks.getTotalElements(),
                    "totalPages", tasks.getTotalPages(),
                    "hasNext", tasks.hasNext(),
                    "hasPrevious", tasks.hasPrevious());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error retrieving tasks for tenant {}: {}", tenantId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve tasks"));
        }
    }

    /**
     * Get a specific task by ID
     * GET /api/tasks/{id}
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Map<String, Object>> getTaskById(
            @PathVariable Long id,
            @RequestHeader("X-Tenant-ID") Long tenantId) {

        try {
            Optional<Task> task = taskService.getTaskByIdAndTenant(id, tenantId);

            if (task.isPresent()) {
                return ResponseEntity.ok(Map.of("task", task.get()));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Task not found"));
            }

        } catch (Exception e) {
            log.error("Error retrieving task {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve task"));
        }
    }

    /**
     * Create a new task
     * POST /api/tasks
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN', 'MANAGER')")
    public ResponseEntity<Map<String, Object>> createTask(
            @Valid @RequestBody Task task,
            @RequestHeader("X-Tenant-ID") Long tenantId,
            @RequestHeader("X-User-ID") Long userId) {

        try {
            // Set tenant and creator from headers
            task.setTenantId(tenantId);
            task.setCreatedBy(userId);

            Task createdTask = taskService.createTask(task);
            log.info("Created task: {} for tenant: {}", createdTask.getId(), tenantId);

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(Map.of(
                            "message", "Task created successfully",
                            "task", createdTask));

        } catch (Exception e) {
            log.error("Error creating task: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to create task"));
        }
    }

    /**
     * Update an existing task
     * PUT /api/tasks/{id}
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN', 'MANAGER')")
    public ResponseEntity<Map<String, Object>> updateTask(
            @PathVariable Long id,
            @Valid @RequestBody Task task,
            @RequestHeader("X-Tenant-ID") Long tenantId,
            @RequestHeader("X-User-ID") Long userId) {

        try {
            // Ensure the task exists and belongs to the tenant
            Optional<Task> existingTask = taskService.getTaskByIdAndTenant(id, tenantId);

            if (!existingTask.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Task not found"));
            }

            task.setId(id);
            task.setTenantId(tenantId);

            Task updatedTask = taskService.updateTask(task);
            log.info("Updated task: {} for tenant: {}", id, tenantId);

            return ResponseEntity.ok(Map.of(
                    "message", "Task updated successfully",
                    "task", updatedTask));

        } catch (Exception e) {
            log.error("Error updating task {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to update task"));
        }
    }

    /**
     * Delete a task
     * DELETE /api/tasks/{id}
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN', 'MANAGER')")
    public ResponseEntity<Map<String, Object>> deleteTask(
            @PathVariable Long id,
            @RequestHeader("X-Tenant-ID") Long tenantId) {

        try {
            boolean deleted = taskService.deleteTaskByIdAndTenant(id, tenantId);

            if (deleted) {
                log.info("Deleted task: {} for tenant: {}", id, tenantId);
                return ResponseEntity.ok(Map.of("message", "Task deleted successfully"));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Task not found"));
            }

        } catch (Exception e) {
            log.error("Error deleting task {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to delete task"));
        }
    }

    /**
     * Update task status
     * PATCH /api/tasks/{id}/status
     */
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Map<String, Object>> updateTaskStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> statusUpdate,
            @RequestHeader("X-Tenant-ID") Long tenantId) {

        try {
            String newStatus = statusUpdate.get("status");
            if (newStatus == null) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Status is required"));
            }

            Task.TaskStatus taskStatus = Task.TaskStatus.valueOf(newStatus.toUpperCase());
            boolean updated = taskService.updateTaskStatus(id, tenantId, taskStatus);

            if (updated) {
                return ResponseEntity.ok(Map.of("message", "Task status updated successfully"));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Task not found"));
            }

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Invalid status value"));
        } catch (Exception e) {
            log.error("Error updating task status {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to update task status"));
        }
    }

    /**
     * Get tasks by project
     * GET /api/tasks/project/{projectId}
     */
    @GetMapping("/project/{projectId}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Map<String, Object>> getTasksByProject(
            @PathVariable Long projectId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestHeader("X-Tenant-ID") Long tenantId) {

        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<Task> tasks = taskService.getTasksByProject(projectId, tenantId, pageable);

            Map<String, Object> response = Map.of(
                    "tasks", tasks.getContent(),
                    "currentPage", tasks.getNumber(),
                    "totalItems", tasks.getTotalElements(),
                    "totalPages", tasks.getTotalPages());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error retrieving tasks for project {}: {}", projectId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve project tasks"));
        }
    }
}