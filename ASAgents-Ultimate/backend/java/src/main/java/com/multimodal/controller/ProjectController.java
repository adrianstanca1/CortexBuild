package com.multimodal.controller;

import com.multimodal.model.Project;
import com.multimodal.service.ProjectService;
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

import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * REST Controller for Project management
 * Provides CRUD operations and project-specific endpoints
 * Matches the Node.js backend API patterns
 */
@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = { "http://localhost:5173", "http://localhost:3000" })
public class ProjectController {

    private final ProjectService projectService;

    /**
     * Get all projects for the authenticated user's tenant
     * GET /api/projects
     */
    @GetMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Map<String, Object>> getAllProjects(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sort,
            @RequestParam(defaultValue = "desc") String direction,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestHeader("X-Tenant-ID") Long tenantId) {

        try {
            log.debug("Getting projects for tenant: {}, page: {}, size: {}", tenantId, page, size);

            Pageable pageable = PageRequest.of(page, size);
            Page<Project> projects = projectService.getProjectsByTenant(tenantId, pageable, search, status);

            Map<String, Object> response = Map.of(
                    "projects", projects.getContent(),
                    "currentPage", projects.getNumber(),
                    "totalItems", projects.getTotalElements(),
                    "totalPages", projects.getTotalPages(),
                    "hasNext", projects.hasNext(),
                    "hasPrevious", projects.hasPrevious());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error retrieving projects for tenant {}: {}", tenantId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve projects"));
        }
    }

    /**
     * Get a specific project by ID
     * GET /api/projects/{id}
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Map<String, Object>> getProjectById(
            @PathVariable Long id,
            @RequestHeader("X-Tenant-ID") Long tenantId) {

        try {
            Optional<Project> project = projectService.getProjectByIdAndTenant(id, tenantId);

            if (project.isPresent()) {
                return ResponseEntity.ok(Map.of("project", project.get()));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Project not found"));
            }

        } catch (Exception e) {
            log.error("Error retrieving project {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve project"));
        }
    }

    /**
     * Create a new project
     * POST /api/projects
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN', 'MANAGER')")
    public ResponseEntity<Map<String, Object>> createProject(
            @Valid @RequestBody Project project,
            @RequestHeader("X-Tenant-ID") Long tenantId,
            @RequestHeader("X-User-ID") Long userId) {

        try {
            // Set tenant and owner from headers
            project.setTenantId(tenantId);
            project.setOwnerId(userId);

            Project createdProject = projectService.createProject(project);
            log.info("Created project: {} for tenant: {}", createdProject.getId(), tenantId);

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(Map.of(
                            "message", "Project created successfully",
                            "project", createdProject));

        } catch (Exception e) {
            log.error("Error creating project: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to create project"));
        }
    }

    /**
     * Update an existing project
     * PUT /api/projects/{id}
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN', 'MANAGER')")
    public ResponseEntity<Map<String, Object>> updateProject(
            @PathVariable Long id,
            @Valid @RequestBody Project project,
            @RequestHeader("X-Tenant-ID") Long tenantId,
            @RequestHeader("X-User-ID") Long userId) {

        try {
            // Ensure the project exists and belongs to the tenant
            Optional<Project> existingProject = projectService.getProjectByIdAndTenant(id, tenantId);

            if (!existingProject.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Project not found"));
            }

            project.setId(id);
            project.setTenantId(tenantId);

            Project updatedProject = projectService.updateProject(project);
            log.info("Updated project: {} for tenant: {}", id, tenantId);

            return ResponseEntity.ok(Map.of(
                    "message", "Project updated successfully",
                    "project", updatedProject));

        } catch (Exception e) {
            log.error("Error updating project {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to update project"));
        }
    }

    /**
     * Delete a project
     * DELETE /api/projects/{id}
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> deleteProject(
            @PathVariable Long id,
            @RequestHeader("X-Tenant-ID") Long tenantId) {

        try {
            boolean deleted = projectService.deleteProjectByIdAndTenant(id, tenantId);

            if (deleted) {
                log.info("Deleted project: {} for tenant: {}", id, tenantId);
                return ResponseEntity.ok(Map.of("message", "Project deleted successfully"));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Project not found"));
            }

        } catch (Exception e) {
            log.error("Error deleting project {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to delete project"));
        }
    }

    /**
     * Get project statistics and summary
     * GET /api/projects/{id}/statistics
     */
    @GetMapping("/{id}/statistics")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Map<String, Object>> getProjectStatistics(
            @PathVariable Long id,
            @RequestHeader("X-Tenant-ID") Long tenantId) {

        try {
            Map<String, Object> stats = projectService.getProjectStatistics(id, tenantId);
            return ResponseEntity.ok(stats);

        } catch (Exception e) {
            log.error("Error retrieving project statistics for {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve project statistics"));
        }
    }

    /**
     * Get projects summary for dashboard
     * GET /api/projects/summary
     */
    @GetMapping("/summary")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Map<String, Object>> getProjectsSummary(
            @RequestHeader("X-Tenant-ID") Long tenantId) {

        try {
            Map<String, Object> summary = projectService.getProjectsSummary(tenantId);
            return ResponseEntity.ok(summary);

        } catch (Exception e) {
            log.error("Error retrieving projects summary for tenant {}: {}", tenantId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve projects summary"));
        }
    }
}