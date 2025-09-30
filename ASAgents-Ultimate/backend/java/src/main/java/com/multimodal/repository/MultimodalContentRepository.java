package com.multimodal.repository;

import com.multimodal.model.MultimodalContent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Repository for MultimodalContent entities
 */
@Repository
public interface MultimodalContentRepository extends JpaRepository<MultimodalContent, String> {

    /**
     * Find all content by user ID, ordered by creation date descending
     */
    List<MultimodalContent> findByUserIdOrderByCreatedAtDesc(String userId);

    /**
     * Find content by user ID and project ID
     */
    List<MultimodalContent> findByUserIdAndProjectIdOrderByCreatedAtDesc(String userId, String projectId);

    /**
     * Find content by user ID and media type
     */
    List<MultimodalContent> findByUserIdAndTypeOrderByCreatedAtDesc(String userId, MultimodalContent.MediaType type);

    /**
     * Find content by user ID and multiple media types
     */
    List<MultimodalContent> findByUserIdAndTypeInOrderByCreatedAtDesc(String userId, List<MultimodalContent.MediaType> types);

    /**
     * Find content by user ID and status
     */
    List<MultimodalContent> findByUserIdAndStatusOrderByCreatedAtDesc(String userId, MultimodalContent.ProcessingStatus status);

    /**
     * Search content by description (case-insensitive)
     */
    List<MultimodalContent> findByUserIdAndDescriptionContainingIgnoreCaseOrderByCreatedAtDesc(String userId, String description);

    /**
     * Search content by description and media types
     */
    List<MultimodalContent> findByUserIdAndTypeInAndDescriptionContainingIgnoreCaseOrderByCreatedAtDesc(
            String userId, List<MultimodalContent.MediaType> types, String description);

    /**
     * Find content created within a date range
     */
    List<MultimodalContent> findByUserIdAndCreatedAtBetweenOrderByCreatedAtDesc(
            String userId, LocalDateTime startDate, LocalDateTime endDate);

    /**
     * Find content by tags (using native query for JSON array search)
     */
    @Query(value = "SELECT * FROM multimodal_content mc " +
                   "JOIN content_tags ct ON mc.id = ct.content_id " +
                   "WHERE mc.user_id = :userId AND ct.tag IN :tags " +
                   "ORDER BY mc.created_at DESC", nativeQuery = true)
    List<MultimodalContent> findByUserIdAndTagsIn(@Param("userId") String userId, @Param("tags") List<String> tags);

    /**
     * Count content by user and status
     */
    long countByUserIdAndStatus(String userId, MultimodalContent.ProcessingStatus status);

    /**
     * Count content by user and type
     */
    long countByUserIdAndType(String userId, MultimodalContent.MediaType type);

    /**
     * Find content that needs processing (pending status)
     */
    List<MultimodalContent> findByStatusOrderByCreatedAtAsc(MultimodalContent.ProcessingStatus status);

    /**
     * Find content by file size range
     */
    List<MultimodalContent> findByUserIdAndFileSizeBetweenOrderByCreatedAtDesc(
            String userId, Long minSize, Long maxSize);

    /**
     * Find content by MIME type
     */
    List<MultimodalContent> findByUserIdAndMimeTypeOrderByCreatedAtDesc(String userId, String mimeType);

    /**
     * Find recently updated content
     */
    List<MultimodalContent> findByUserIdAndUpdatedAtAfterOrderByUpdatedAtDesc(String userId, LocalDateTime since);

    /**
     * Advanced search query combining multiple criteria
     */
    @Query("SELECT mc FROM MultimodalContent mc WHERE " +
           "mc.userId = :userId AND " +
           "(:projectId IS NULL OR mc.projectId = :projectId) AND " +
           "(:type IS NULL OR mc.type = :type) AND " +
           "(:status IS NULL OR mc.status = :status) AND " +
           "(:query IS NULL OR LOWER(mc.description) LIKE LOWER(CONCAT('%', :query, '%'))) AND " +
           "(:startDate IS NULL OR mc.createdAt >= :startDate) AND " +
           "(:endDate IS NULL OR mc.createdAt <= :endDate) " +
           "ORDER BY mc.createdAt DESC")
    List<MultimodalContent> findWithCriteria(
            @Param("userId") String userId,
            @Param("projectId") String projectId,
            @Param("type") MultimodalContent.MediaType type,
            @Param("status") MultimodalContent.ProcessingStatus status,
            @Param("query") String query,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    /**
     * Get content statistics for a user
     */
    @Query("SELECT " +
           "COUNT(*) as totalCount, " +
           "SUM(CASE WHEN mc.status = 'COMPLETED' THEN 1 ELSE 0 END) as completedCount, " +
           "SUM(CASE WHEN mc.status = 'PROCESSING' THEN 1 ELSE 0 END) as processingCount, " +
           "SUM(CASE WHEN mc.status = 'FAILED' THEN 1 ELSE 0 END) as failedCount, " +
           "SUM(COALESCE(mc.fileSize, 0)) as totalSize " +
           "FROM MultimodalContent mc WHERE mc.userId = :userId")
    Object[] getContentStatistics(@Param("userId") String userId);

    /**
     * Find duplicate content by checksum
     */
    List<MultimodalContent> findByUserIdAndChecksumOrderByCreatedAtDesc(String userId, String checksum);

    /**
     * Delete old content (for cleanup)
     */
    void deleteByUserIdAndCreatedAtBefore(String userId, LocalDateTime cutoffDate);

    /**
     * Find content with processing errors
     */
    @Query("SELECT mc FROM MultimodalContent mc WHERE " +
           "mc.userId = :userId AND mc.status = 'FAILED' " +
           "ORDER BY mc.updatedAt DESC")
    List<MultimodalContent> findFailedContent(@Param("userId") String userId);

    /**
     * Find content ready for reprocessing
     */
    @Query("SELECT mc FROM MultimodalContent mc WHERE " +
           "mc.status IN ('FAILED', 'PENDING') AND " +
           "mc.updatedAt < :cutoffTime " +
           "ORDER BY mc.createdAt ASC")
    List<MultimodalContent> findContentForReprocessing(@Param("cutoffTime") LocalDateTime cutoffTime);
}
