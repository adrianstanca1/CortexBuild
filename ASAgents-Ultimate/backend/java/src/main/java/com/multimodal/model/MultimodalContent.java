package com.multimodal.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * Multimodal Content Entity
 * Represents multimodal content with processing results
 */
@Entity
@Table(name = "multimodal_content")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MultimodalContent {

    @Id
    @Column(name = "id", length = 100)
    private String id;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    private MediaType type;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private ProcessingStatus status;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @NotNull
    @Column(name = "user_id", nullable = false)
    private String userId;

    @Column(name = "project_id")
    private String projectId;

    @Lob
    @Column(name = "metadata", columnDefinition = "TEXT")
    private String metadata; // JSON string

    @Lob
    @Column(name = "processing_results", columnDefinition = "TEXT")
    private String processingResults; // JSON string

    @ElementCollection
    @CollectionTable(name = "content_tags", joinColumns = @JoinColumn(name = "content_id"))
    @Column(name = "tag")
    private List<String> tags;

    @Size(max = 1000)
    @Column(name = "description", length = 1000)
    private String description;

    @Column(name = "file_path")
    private String filePath;

    @Column(name = "file_size")
    private Long fileSize;

    @Column(name = "mime_type")
    private String mimeType;

    @Column(name = "checksum")
    private String checksum;

    // Audit fields
    @Column(name = "created_by")
    private String createdBy;

    @Column(name = "updated_by")
    private String updatedBy;

    @Version
    @Column(name = "version")
    private Long version;

    public enum MediaType {
        TEXT, IMAGE, AUDIO, VIDEO, DOCUMENT, MIXED
    }

    public enum ProcessingStatus {
        PENDING, PROCESSING, COMPLETED, FAILED, CANCELLED
    }

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (updatedAt == null) {
            updatedAt = LocalDateTime.now();
        }
        if (status == null) {
            status = ProcessingStatus.PENDING;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
