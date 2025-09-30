package com.multimodal.service;

import com.multimodal.model.Project;
import com.multimodal.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

/**
 * Service layer for Project management
 * Handles business logic for project operations
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ProjectService {

    private final ProjectRepository projectRepository;

    /**
     * Get projects by tenant with pagination and filtering
     */
    public Page<Project> getProjectsByTenant(Long tenantId, Pageable pageable, String search, String status) {
        if (search != null && !search.trim().isEmpty()) {
            if (status != null && !status.trim().isEmpty()) {
                Project.ProjectStatus projectStatus = Project.ProjectStatus.valueOf(status.toUpperCase());
                return projectRepository.findByTenantIdAndNameContainingIgnoreCaseAndStatus(
                    tenantId, search.trim(), projectStatus, pageable);
            } else {
                return projectRepository.findByTenantIdAndNameContainingIgnoreCase(
                    tenantId, search.trim(), pageable);
            }
        } else if (status != null && !status.trim().isEmpty()) {
            Project.ProjectStatus projectStatus = Project.ProjectStatus.valueOf(status.toUpperCase());
            return projectRepository.findByTenantIdAndStatus(tenantId, projectStatus, pageable);
        } else {
            return projectRepository.findByTenantIdOrderByCreatedAtDesc(tenantId, pageable);
        }
    }

    /**
     * Get project by ID and tenant
     */
    public Optional<Project> getProjectByIdAndTenant(Long id, Long tenantId) {
        return projectRepository.findByIdAndTenantId(id, tenantId);
    }

    /**
     * Create a new project
     */
    public Project createProject(Project project) {
        project.setCreatedAt(LocalDateTime.now());
        project.setUpdatedAt(LocalDateTime.now());
        return projectRepository.save(project);
    }

    /**
     * Update an existing project
     */
    public Project updateProject(Project project) {
        project.setUpdatedAt(LocalDateTime.now());
        return projectRepository.save(project);
    }

    /**
     * Delete project by ID and tenant
     */
    public boolean deleteProjectByIdAndTenant(Long id, Long tenantId) {
        Optional<Project> project = projectRepository.findByIdAndTenantId(id, tenantId);
        if (project.isPresent()) {
            projectRepository.delete(project.get());
            return true;
        }
        return false;
    }

    /**
     * Get project statistics
     */
    public Map<String, Object> getProjectStatistics(Long projectId, Long tenantId) {
        Optional<Project> project = getProjectByIdAndTenant(projectId, tenantId);
        
        if (!project.isPresent()) {
            throw new RuntimeException("Project not found");
        }

        Map<String, Object> stats = new HashMap<>();
        Project p = project.get();
        
        // Basic project info
        stats.put("project", p);
        
        // Task statistics (would need TaskRepository)
        stats.put("totalTasks", 0);
        stats.put("completedTasks", 0);
        stats.put("pendingTasks", 0);
        
        // Expense statistics (would need ExpenseRepository) 
        stats.put("totalExpenses", 0);
        stats.put("totalBudget", p.getEstimatedBudget());
        stats.put("actualBudget", p.getActualBudget());
        
        // Timeline statistics
        stats.put("daysRemaining", 0);
        stats.put("progressPercentage", p.getProgressPercentage());
        
        return stats;
    }

    /**
     * Get projects summary for dashboard
     */
    public Map<String, Object> getProjectsSummary(Long tenantId) {
        Map<String, Object> summary = new HashMap<>();
        
        // Project counts by status
        long totalProjects = projectRepository.countByTenantId(tenantId);
        long activeProjects = projectRepository.countByTenantIdAndStatus(tenantId, Project.ProjectStatus.ACTIVE);
        long completedProjects = projectRepository.countByTenantIdAndStatus(tenantId, Project.ProjectStatus.COMPLETED);
        long onHoldProjects = projectRepository.countByTenantIdAndStatus(tenantId, Project.ProjectStatus.ON_HOLD);
        
        summary.put("totalProjects", totalProjects);
        summary.put("activeProjects", activeProjects);
        summary.put("completedProjects", completedProjects);
        summary.put("onHoldProjects", onHoldProjects);
        
        // Recent projects
        summary.put("recentProjects", projectRepository.findTop5ByTenantIdOrderByCreatedAtDesc(tenantId));
        
        return summary;
    }
}