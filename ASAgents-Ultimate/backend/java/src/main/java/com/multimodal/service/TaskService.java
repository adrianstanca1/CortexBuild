package com.multimodal.service;

import com.multimodal.model.Task;
import com.multimodal.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

/**
 * Service layer for Task management
 * Handles business logic for task operations
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class TaskService {

    private final TaskRepository taskRepository;

    /**
     * Get tasks by tenant with filtering and pagination
     */
    public Page<Task> getTasksByTenant(Long tenantId, Long projectId, String status, String assignedTo, String search, Pageable pageable) {
        Task.TaskStatus taskStatus = null;
        if (status != null && !status.trim().isEmpty()) {
            try {
                taskStatus = Task.TaskStatus.valueOf(status.toUpperCase());
            } catch (IllegalArgumentException e) {
                log.warn("Invalid task status: {}", status);
            }
        }
        
        Long assignedToId = null;
        if (assignedTo != null && !assignedTo.trim().isEmpty()) {
            try {
                assignedToId = Long.parseLong(assignedTo);
            } catch (NumberFormatException e) {
                log.warn("Invalid assignedTo ID: {}", assignedTo);
            }
        }
        
        return taskRepository.findTasksWithFilters(tenantId, projectId, taskStatus, assignedToId, search, pageable);
    }

    /**
     * Get task by ID and tenant
     */
    public Optional<Task> getTaskByIdAndTenant(Long id, Long tenantId) {
        return taskRepository.findByIdAndTenantId(id, tenantId);
    }

    /**
     * Get tasks by project
     */
    public Page<Task> getTasksByProject(Long projectId, Long tenantId, Pageable pageable) {
        return taskRepository.findByProjectIdAndTenantIdOrderByCreatedAtDesc(projectId, tenantId, pageable);
    }

    /**
     * Create a new task
     */
    public Task createTask(Task task) {
        task.setCreatedAt(LocalDateTime.now());
        task.setUpdatedAt(LocalDateTime.now());
        return taskRepository.save(task);
    }

    /**
     * Update an existing task
     */
    public Task updateTask(Task task) {
        task.setUpdatedAt(LocalDateTime.now());
        
        // If task is being marked as completed, set completion date
        if (task.getStatus() == Task.TaskStatus.DONE && task.getCompletedDate() == null) {
            task.setCompletedDate(LocalDateTime.now());
            task.setProgressPercentage(100);
        }
        
        return taskRepository.save(task);
    }

    /**
     * Update task status only
     */
    public boolean updateTaskStatus(Long taskId, Long tenantId, Task.TaskStatus status) {
        Optional<Task> taskOptional = getTaskByIdAndTenant(taskId, tenantId);
        
        if (taskOptional.isPresent()) {
            Task task = taskOptional.get();
            task.setStatus(status);
            task.setUpdatedAt(LocalDateTime.now());
            
            // Set completion date and progress for completed tasks
            if (status == Task.TaskStatus.DONE && task.getCompletedDate() == null) {
                task.setCompletedDate(LocalDateTime.now());
                task.setProgressPercentage(100);
            }
            
            taskRepository.save(task);
            return true;
        }
        
        return false;
    }

    /**
     * Delete task by ID and tenant
     */
    public boolean deleteTaskByIdAndTenant(Long id, Long tenantId) {
        Optional<Task> task = taskRepository.findByIdAndTenantId(id, tenantId);
        if (task.isPresent()) {
            taskRepository.delete(task.get());
            return true;
        }
        return false;
    }

    /**
     * Get task statistics for a project
     */
    public TaskStatistics getTaskStatistics(Long projectId, Long tenantId) {
        long totalTasks = taskRepository.countByProjectIdAndStatus(projectId, null);
        long completedTasks = taskRepository.countByProjectIdAndStatus(projectId, Task.TaskStatus.DONE);
        long inProgressTasks = taskRepository.countByProjectIdAndStatus(projectId, Task.TaskStatus.IN_PROGRESS);
        long todoTasks = taskRepository.countByProjectIdAndStatus(projectId, Task.TaskStatus.TODO);
        
        return TaskStatistics.builder()
            .totalTasks(totalTasks)
            .completedTasks(completedTasks)
            .inProgressTasks(inProgressTasks)
            .todoTasks(todoTasks)
            .completionPercentage(totalTasks > 0 ? (int) ((completedTasks * 100) / totalTasks) : 0)
            .build();
    }

    /**
     * Task statistics inner class
     */
    @lombok.Data
    @lombok.Builder
    public static class TaskStatistics {
        private long totalTasks;
        private long completedTasks;
        private long inProgressTasks;
        private long todoTasks;
        private int completionPercentage;
    }
}