package com.multimodal.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.multimodal.model.MultimodalContent;
import com.multimodal.repository.MultimodalContentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/**
 * Multimodal Processing Service
 * Enterprise-grade service for processing multimodal content
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class MultimodalProcessingService {

    private final MultimodalContentRepository contentRepository;
    private final ObjectMapper objectMapper;
    private final ExecutorService processingExecutor = Executors.newFixedThreadPool(10);

    @Value("${multimodal.storage.path:./storage}")
    private String storagePath;

    @Value("${multimodal.max-file-size:104857600}") // 100MB
    private long maxFileSize;

    @Value("${multimodal.python-service.url:http://localhost:8000}")
    private String pythonServiceUrl;

    /**
     * Process uploaded multimodal content
     */
    public CompletableFuture<MultimodalContent> processContent(
            MultipartFile file, 
            String userId, 
            String projectId,
            String description,
            List<String> tags) {
        
        return CompletableFuture.supplyAsync(() -> {
            try {
                // Validate file
                validateFile(file);
                
                // Create content entity
                MultimodalContent content = createContentEntity(file, userId, projectId, description, tags);
                
                // Save file to storage
                String filePath = saveFile(file, content.getId());
                content.setFilePath(filePath);
                content.setChecksum(calculateChecksum(file.getBytes()));
                
                // Save to database
                content = contentRepository.save(content);
                
                // Start async processing
                processContentAsync(content);
                
                return content;
                
            } catch (Exception e) {
                log.error("Error processing content", e);
                throw new RuntimeException("Failed to process content", e);
            }
        }, processingExecutor);
    }

    /**
     * Create content entity from uploaded file
     */
    private MultimodalContent createContentEntity(
            MultipartFile file, 
            String userId, 
            String projectId,
            String description,
            List<String> tags) throws IOException {
        
        String contentId = generateContentId();
        MultimodalContent.MediaType mediaType = determineMediaType(file.getContentType());
        
        Map<String, Object> metadata = new HashMap<>();
        metadata.put("filename", file.getOriginalFilename());
        metadata.put("fileSize", file.getSize());
        metadata.put("mimeType", file.getContentType());
        metadata.put("source", "upload");
        
        return MultimodalContent.builder()
                .id(contentId)
                .type(mediaType)
                .status(MultimodalContent.ProcessingStatus.PENDING)
                .userId(userId)
                .projectId(projectId)
                .description(description)
                .tags(tags != null ? tags : new ArrayList<>())
                .fileSize(file.getSize())
                .mimeType(file.getContentType())
                .metadata(objectMapper.writeValueAsString(metadata))
                .createdBy(userId)
                .updatedBy(userId)
                .build();
    }

    /**
     * Determine media type from MIME type
     */
    private MultimodalContent.MediaType determineMediaType(String mimeType) {
        if (mimeType == null) {
            return MultimodalContent.MediaType.DOCUMENT;
        }
        
        String type = mimeType.toLowerCase();
        if (type.startsWith("image/")) {
            return MultimodalContent.MediaType.IMAGE;
        } else if (type.startsWith("audio/")) {
            return MultimodalContent.MediaType.AUDIO;
        } else if (type.startsWith("video/")) {
            return MultimodalContent.MediaType.VIDEO;
        } else if (type.startsWith("text/") || type.contains("document") || type.contains("pdf")) {
            return MultimodalContent.MediaType.DOCUMENT;
        } else {
            return MultimodalContent.MediaType.DOCUMENT;
        }
    }

    /**
     * Save uploaded file to storage
     */
    private String saveFile(MultipartFile file, String contentId) throws IOException {
        // Create storage directory if it doesn't exist
        Path storageDir = Paths.get(storagePath);
        if (!Files.exists(storageDir)) {
            Files.createDirectories(storageDir);
        }
        
        // Generate unique filename
        String originalFilename = file.getOriginalFilename();
        String extension = originalFilename != null && originalFilename.contains(".") 
            ? originalFilename.substring(originalFilename.lastIndexOf("."))
            : "";
        String filename = contentId + extension;
        
        Path filePath = storageDir.resolve(filename);
        
        // Save file
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
        
        return filePath.toString();
    }

    /**
     * Process content asynchronously
     */
    private void processContentAsync(MultimodalContent content) {
        CompletableFuture.runAsync(() -> {
            try {
                // Update status to processing
                content.setStatus(MultimodalContent.ProcessingStatus.PROCESSING);
                content.setUpdatedAt(LocalDateTime.now());
                contentRepository.save(content);
                
                // Process based on media type
                Map<String, Object> results = processBasedOnType(content);
                
                // Save results
                content.setProcessingResults(objectMapper.writeValueAsString(results));
                content.setStatus(MultimodalContent.ProcessingStatus.COMPLETED);
                content.setUpdatedAt(LocalDateTime.now());
                contentRepository.save(content);
                
                log.info("Successfully processed content: {}", content.getId());
                
            } catch (Exception e) {
                log.error("Error processing content: {}", content.getId(), e);
                
                // Update status to failed
                content.setStatus(MultimodalContent.ProcessingStatus.FAILED);
                content.setUpdatedAt(LocalDateTime.now());
                contentRepository.save(content);
            }
        }, processingExecutor);
    }

    /**
     * Process content based on its type
     */
    private Map<String, Object> processBasedOnType(MultimodalContent content) throws Exception {
        Map<String, Object> results = new HashMap<>();
        results.put("aiProvider", "java-service");
        results.put("modelVersion", "1.0.0");
        results.put("processingTime", System.currentTimeMillis());
        results.put("confidence", 0.8);
        
        switch (content.getType()) {
            case TEXT:
                results.putAll(processText(content));
                break;
            case IMAGE:
                results.putAll(processImage(content));
                break;
            case AUDIO:
                results.putAll(processAudio(content));
                break;
            case VIDEO:
                results.putAll(processVideo(content));
                break;
            case DOCUMENT:
                results.putAll(processDocument(content));
                break;
            default:
                throw new UnsupportedOperationException("Unsupported media type: " + content.getType());
        }
        
        return results;
    }

    /**
     * Process text content
     */
    private Map<String, Object> processText(MultimodalContent content) throws IOException {
        Map<String, Object> results = new HashMap<>();
        
        // Read text content
        String text = Files.readString(Paths.get(content.getFilePath()));
        
        // Basic text analysis
        Map<String, Object> textAnalysis = new HashMap<>();
        textAnalysis.put("extractedText", text);
        textAnalysis.put("language", "en");
        textAnalysis.put("wordCount", text.split("\\s+").length);
        textAnalysis.put("characterCount", text.length());
        
        // Simple sentiment analysis (placeholder)
        Map<String, Object> sentiment = new HashMap<>();
        sentiment.put("score", 0.0);
        sentiment.put("label", "neutral");
        sentiment.put("confidence", 0.8);
        textAnalysis.put("sentiment", sentiment);
        
        textAnalysis.put("entities", new ArrayList<>());
        textAnalysis.put("keywords", new ArrayList<>());
        textAnalysis.put("topics", new ArrayList<>());
        
        results.put("textAnalysis", textAnalysis);
        return results;
    }

    /**
     * Process image content
     */
    private Map<String, Object> processImage(MultimodalContent content) {
        Map<String, Object> results = new HashMap<>();
        
        // Basic image analysis (placeholder)
        Map<String, Object> imageAnalysis = new HashMap<>();
        imageAnalysis.put("objects", new ArrayList<>());
        imageAnalysis.put("faces", new ArrayList<>());
        imageAnalysis.put("text", "");
        imageAnalysis.put("scenes", new ArrayList<>());
        imageAnalysis.put("colors", new ArrayList<>());
        imageAnalysis.put("safetyLabels", new ArrayList<>());
        imageAnalysis.put("description", "Image processed by Java service");
        imageAnalysis.put("tags", Arrays.asList("image", "processed"));
        
        results.put("imageAnalysis", imageAnalysis);
        return results;
    }

    /**
     * Process audio content
     */
    private Map<String, Object> processAudio(MultimodalContent content) {
        Map<String, Object> results = new HashMap<>();
        
        // Basic audio analysis (placeholder)
        Map<String, Object> audioAnalysis = new HashMap<>();
        
        Map<String, Object> transcription = new HashMap<>();
        transcription.put("text", "Audio transcription not implemented");
        transcription.put("confidence", 0.0);
        transcription.put("language", "en");
        audioAnalysis.put("transcription", transcription);
        
        Map<String, Object> audioFeatures = new HashMap<>();
        audioFeatures.put("volume", 0.5);
        audioFeatures.put("pitch", 440.0);
        audioAnalysis.put("audioFeatures", audioFeatures);
        
        audioAnalysis.put("noiseLevel", 0.1);
        audioAnalysis.put("silenceSegments", new ArrayList<>());
        
        results.put("audioAnalysis", audioAnalysis);
        return results;
    }

    /**
     * Process video content
     */
    private Map<String, Object> processVideo(MultimodalContent content) {
        Map<String, Object> results = new HashMap<>();
        
        // Basic video analysis (placeholder)
        Map<String, Object> videoAnalysis = new HashMap<>();
        videoAnalysis.put("scenes", new ArrayList<>());
        videoAnalysis.put("faces", new ArrayList<>());
        
        Map<String, Object> motion = new HashMap<>();
        motion.put("intensity", 0.5);
        motion.put("direction", "");
        motion.put("cameraMovement", "static");
        videoAnalysis.put("motion", motion);
        
        Map<String, Object> quality = new HashMap<>();
        quality.put("resolution", "1920x1080");
        quality.put("frameRate", 30.0);
        quality.put("stability", 0.8);
        videoAnalysis.put("quality", quality);
        
        results.put("videoAnalysis", videoAnalysis);
        return results;
    }

    /**
     * Process document content
     */
    private Map<String, Object> processDocument(MultimodalContent content) {
        Map<String, Object> results = new HashMap<>();
        
        // Basic document analysis (placeholder)
        Map<String, Object> documentAnalysis = new HashMap<>();
        documentAnalysis.put("documentType", "pdf");
        documentAnalysis.put("extractedText", "Document text extraction not implemented");
        
        Map<String, Object> structure = new HashMap<>();
        structure.put("headings", new ArrayList<>());
        structure.put("tables", new ArrayList<>());
        structure.put("images", new ArrayList<>());
        documentAnalysis.put("structure", structure);
        
        documentAnalysis.put("metadata", new HashMap<>());
        documentAnalysis.put("language", "en");
        documentAnalysis.put("summary", "Document processed by Java service");
        documentAnalysis.put("keyPoints", new ArrayList<>());
        
        results.put("documentAnalysis", documentAnalysis);
        return results;
    }

    /**
     * Validate uploaded file
     */
    private void validateFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }
        
        if (file.getSize() > maxFileSize) {
            throw new IllegalArgumentException("File size exceeds maximum allowed size");
        }
        
        // Add more validation as needed
    }

    /**
     * Generate unique content ID
     */
    private String generateContentId() {
        return "content_" + System.currentTimeMillis() + "_" + UUID.randomUUID().toString().substring(0, 8);
    }

    /**
     * Calculate file checksum
     */
    private String calculateChecksum(byte[] data) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] hash = md.digest(data);
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Error calculating checksum", e);
        }
    }

    /**
     * Get content by ID
     */
    public Optional<MultimodalContent> getContent(String contentId) {
        return contentRepository.findById(contentId);
    }

    /**
     * Get all content for a user
     */
    public List<MultimodalContent> getContentByUser(String userId) {
        return contentRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    /**
     * Search content
     */
    public List<MultimodalContent> searchContent(String query, String userId, List<MultimodalContent.MediaType> types) {
        if (types == null || types.isEmpty()) {
            return contentRepository.findByUserIdAndDescriptionContainingIgnoreCaseOrderByCreatedAtDesc(userId, query);
        } else {
            return contentRepository.findByUserIdAndTypeInAndDescriptionContainingIgnoreCaseOrderByCreatedAtDesc(userId, types, query);
        }
    }

    /**
     * Delete content
     */
    public void deleteContent(String contentId, String userId) {
        Optional<MultimodalContent> content = contentRepository.findById(contentId);
        if (content.isPresent() && content.get().getUserId().equals(userId)) {
            // Delete file from storage
            try {
                Files.deleteIfExists(Paths.get(content.get().getFilePath()));
            } catch (IOException e) {
                log.warn("Failed to delete file: {}", content.get().getFilePath(), e);
            }
            
            // Delete from database
            contentRepository.delete(content.get());
        } else {
            throw new IllegalArgumentException("Content not found or access denied");
        }
    }
}
