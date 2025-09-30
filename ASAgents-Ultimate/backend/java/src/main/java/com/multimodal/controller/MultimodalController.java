package com.multimodal.controller;

import com.multimodal.model.MultimodalContent;
import com.multimodal.service.MultimodalProcessingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;

/**
 * REST Controller for Multimodal Content Processing
 */
@RestController
@RequestMapping("/api/multimodal")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class MultimodalController {

    private final MultimodalProcessingService processingService;

    /**
     * Upload and process multimodal content
     */
    @PostMapping("/upload")
    public CompletableFuture<ResponseEntity<MultimodalContent>> uploadContent(
            @RequestParam("file") @NotNull MultipartFile file,
            @RequestParam("userId") @NotBlank String userId,
            @RequestParam(value = "projectId", required = false) String projectId,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "tags", required = false) List<String> tags) {

        log.info("Uploading content for user: {}, file: {}", userId, file.getOriginalFilename());

        return processingService.processContent(file, userId, projectId, description, tags)
                .thenApply(content -> ResponseEntity.ok(content))
                .exceptionally(throwable -> {
                    log.error("Error uploading content", throwable);
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
                });
    }

    /**
     * Get content by ID
     */
    @GetMapping("/{contentId}")
    public ResponseEntity<MultimodalContent> getContent(
            @PathVariable String contentId,
            @RequestParam("userId") String userId) {

        Optional<MultimodalContent> content = processingService.getContent(contentId);

        if (content.isPresent() && content.get().getUserId().equals(userId)) {
            return ResponseEntity.ok(content.get());
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Get all content for a user
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<MultimodalContent>> getUserContent(@PathVariable String userId) {
        List<MultimodalContent> content = processingService.getContentByUser(userId);
        return ResponseEntity.ok(content);
    }

    /**
     * Search content
     */
    @GetMapping("/search")
    public ResponseEntity<List<MultimodalContent>> searchContent(
            @RequestParam("query") String query,
            @RequestParam("userId") String userId,
            @RequestParam(value = "types", required = false) List<MultimodalContent.MediaType> types) {

        List<MultimodalContent> results = processingService.searchContent(query, userId, types);
        return ResponseEntity.ok(results);
    }

    /**
     * Delete content
     */
    @DeleteMapping("/{contentId}")
    public ResponseEntity<Void> deleteContent(
            @PathVariable String contentId,
            @RequestParam("userId") String userId) {

        try {
            processingService.deleteContent(contentId, userId);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Error deleting content", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Reprocess content
     */
    @PostMapping("/{contentId}/reprocess")
    public CompletableFuture<ResponseEntity<MultimodalContent>> reprocessContent(
            @PathVariable String contentId,
            @RequestParam("userId") String userId) {

        Optional<MultimodalContent> content = processingService.getContent(contentId);

        if (content.isEmpty() || !content.get().getUserId().equals(userId)) {
            return CompletableFuture.completedFuture(ResponseEntity.notFound().build());
        }

        // Reset status and reprocess
        MultimodalContent contentToReprocess = content.get();
        contentToReprocess.setStatus(MultimodalContent.ProcessingStatus.PENDING);

        return processingService.processContent(
                null, // File already exists
                userId,
                contentToReprocess.getProjectId(),
                contentToReprocess.getDescription(),
                contentToReprocess.getTags()).thenApply(ResponseEntity::ok)
                .exceptionally(throwable -> {
                    log.error("Error reprocessing content", throwable);
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
                });
    }

    /**
     * Get content statistics
     */
    @GetMapping("/stats/{userId}")
    public ResponseEntity<Map<String, Object>> getContentStatistics(@PathVariable String userId) {
        try {
            // This would be implemented in the service
            Map<String, Object> stats = Map.of(
                    "totalContent", processingService.getContentByUser(userId).size(),
                    "message", "Statistics endpoint - implementation pending");
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            log.error("Error getting statistics", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Health check endpoint
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> healthCheck() {
        return ResponseEntity.ok(Map.of(
                "status", "healthy",
                "service", "multimodal-processing",
                "timestamp", String.valueOf(System.currentTimeMillis())));
    }

    /**
     * Get supported media types
     */
    @GetMapping("/media-types")
    public ResponseEntity<List<MultimodalContent.MediaType>> getSupportedMediaTypes() {
        return ResponseEntity.ok(List.of(MultimodalContent.MediaType.values()));
    }

    /**
     * Batch upload multiple files
     */
    @PostMapping("/batch-upload")
    public CompletableFuture<ResponseEntity<List<MultimodalContent>>> batchUpload(
            @RequestParam("files") List<MultipartFile> files,
            @RequestParam("userId") String userId,
            @RequestParam(value = "projectId", required = false) String projectId,
            @RequestParam(value = "descriptions", required = false) List<String> descriptions,
            @RequestParam(value = "tags", required = false) List<String> tags) {

        log.info("Batch uploading {} files for user: {}", files.size(), userId);

        List<CompletableFuture<MultimodalContent>> futures = files.stream()
                .map(file -> processingService.processContent(
                        file,
                        userId,
                        projectId,
                        descriptions != null && !descriptions.isEmpty() ? descriptions.get(0) : null,
                        tags))
                .toList();

        return CompletableFuture.allOf(futures.toArray(new CompletableFuture[0]))
                .thenApply(v -> futures.stream()
                        .map(CompletableFuture::join)
                        .toList())
                .thenApply(ResponseEntity::ok)
                .exceptionally(throwable -> {
                    log.error("Error in batch upload", throwable);
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
                });
    }

    /**
     * Update content metadata
     */
    @PutMapping("/{contentId}")
    public ResponseEntity<MultimodalContent> updateContent(
            @PathVariable String contentId,
            @RequestParam("userId") String userId,
            @RequestBody UpdateContentRequest request) {

        Optional<MultimodalContent> content = processingService.getContent(contentId);

        if (content.isEmpty() || !content.get().getUserId().equals(userId)) {
            return ResponseEntity.notFound().build();
        }

        MultimodalContent contentToUpdate = content.get();

        if (request.getDescription() != null) {
            contentToUpdate.setDescription(request.getDescription());
        }

        if (request.getTags() != null) {
            contentToUpdate.setTags(request.getTags());
        }

        if (request.getProjectId() != null) {
            contentToUpdate.setProjectId(request.getProjectId());
        }

        // Save updated content (this would be implemented in the service)
        return ResponseEntity.ok(contentToUpdate);
    }

    /**
     * Request class for updating content
     */
    public static class UpdateContentRequest {
        private String description;
        private List<String> tags;
        private String projectId;

        // Getters and setters
        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }

        public List<String> getTags() {
            return tags;
        }

        public void setTags(List<String> tags) {
            this.tags = tags;
        }

        public String getProjectId() {
            return projectId;
        }

        public void setProjectId(String projectId) {
            this.projectId = projectId;
        }
    }

    /**
     * Exception handler for validation errors
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleValidationError(IllegalArgumentException e) {
        return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
    }

    /**
     * Exception handler for general errors
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleGeneralError(Exception e) {
        log.error("Unexpected error", e);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Internal server error"));
    }
}
