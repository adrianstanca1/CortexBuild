package com.multimodal.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

/**
 * Service for integrating with Node.js multimodal backend
 * Provides access to Node.js AI capabilities while maintaining Java enterprise
 * features
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class NodeJsIntegrationService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${app.nodejs-service.url:http://localhost:4000}")
    private String nodeJsServiceUrl;

    @Value("${app.nodejs-service.timeout:30000}")
    private int timeoutMs;

    /**
     * Forward authentication requests to Node.js backend
     */
    public CompletableFuture<Map<String, Object>> authenticate(String email, String password) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                String endpoint = nodeJsServiceUrl + "/api/auth/login";

                Map<String, Object> request = Map.of(
                        "email", email,
                        "password", password);

                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);
                HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, headers);

                ResponseEntity<Map> response = restTemplate.postForEntity(endpoint, entity, Map.class);

                if (response.getStatusCode() == HttpStatus.OK) {
                    Map<String, Object> result = response.getBody();
                    log.info("Authentication successful via Node.js backend");
                    return result;
                } else {
                    return Map.of("error", "Authentication failed", "status", response.getStatusCode().value());
                }

            } catch (Exception e) {
                log.error("Error authenticating with Node.js backend: {}", e.getMessage());
                return Map.of("error", "Node.js authentication service unavailable: " + e.getMessage());
            }
        });
    }

    /**
     * Process AI/multimodal requests through Node.js backend
     */
    public CompletableFuture<Map<String, Object>> processAiRequest(String endpoint, Map<String, Object> data) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                String fullUrl = nodeJsServiceUrl + "/api/" + endpoint;

                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);
                HttpEntity<Map<String, Object>> entity = new HttpEntity<>(data, headers);

                ResponseEntity<Map> response = restTemplate.postForEntity(fullUrl, entity, Map.class);

                if (response.getStatusCode() == HttpStatus.OK) {
                    Map<String, Object> result = response.getBody();
                    result.put("processedBy", "nodejs-ai-service");
                    result.put("javaEnhanced", true);
                    return result;
                } else {
                    return Map.of("error", "Node.js AI processing failed", "status", response.getStatusCode().value());
                }

            } catch (Exception e) {
                log.error("Error processing AI request with Node.js: {}", e.getMessage());
                return Map.of("error", "Node.js AI service unavailable: " + e.getMessage());
            }
        });
    }

    /**
     * Upload file to Node.js backend for processing
     */
    public CompletableFuture<Map<String, Object>> uploadFile(MultipartFile file, String projectId) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                String endpoint = nodeJsServiceUrl + "/api/upload";

                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.MULTIPART_FORM_DATA);

                // Create multipart request (simplified for now)
                Map<String, Object> requestData = new HashMap<>();
                requestData.put("file", file.getOriginalFilename());
                requestData.put("projectId", projectId);
                requestData.put("size", file.getSize());
                requestData.put("contentType", file.getContentType());

                HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestData, headers);
                ResponseEntity<Map> response = restTemplate.postForEntity(endpoint, entity, Map.class);

                if (response.getStatusCode() == HttpStatus.OK) {
                    Map<String, Object> result = response.getBody();
                    log.info("File upload successful via Node.js backend");
                    return result;
                } else {
                    return Map.of("error", "File upload failed", "status", response.getStatusCode().value());
                }

            } catch (Exception e) {
                log.error("Error uploading file to Node.js backend: {}", e.getMessage());
                return Map.of("error", "Node.js upload service unavailable: " + e.getMessage());
            }
        });
    }

    /**
     * Get project data from Node.js backend
     */
    public CompletableFuture<List<Map<String, Object>>> getNodeJsProjects(String userId) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                String endpoint = nodeJsServiceUrl + "/api/projects?userId=" + userId;

                ResponseEntity<List> response = restTemplate.getForEntity(endpoint, List.class);

                if (response.getStatusCode() == HttpStatus.OK) {
                    List<Map<String, Object>> projects = response.getBody();
                    log.info("Retrieved {} projects from Node.js backend", projects.size());
                    return projects;
                } else {
                    log.warn("Failed to get projects from Node.js: {}", response.getStatusCode());
                    return List.of();
                }

            } catch (Exception e) {
                log.error("Error getting projects from Node.js backend: {}", e.getMessage());
                return List.of();
            }
        });
    }

    /**
     * Sync data between Node.js and Java backends
     */
    public CompletableFuture<Map<String, Object>> syncData(String dataType, Map<String, Object> data) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                String endpoint = nodeJsServiceUrl + "/api/sync/" + dataType;

                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);
                headers.add("X-Source", "java-backend");

                HttpEntity<Map<String, Object>> entity = new HttpEntity<>(data, headers);
                ResponseEntity<Map> response = restTemplate.postForEntity(endpoint, entity, Map.class);

                if (response.getStatusCode() == HttpStatus.OK) {
                    Map<String, Object> result = response.getBody();
                    log.info("Data sync successful for type: {}", dataType);
                    return result;
                } else {
                    return Map.of("error", "Data sync failed", "status", response.getStatusCode().value());
                }

            } catch (Exception e) {
                log.error("Error syncing data with Node.js backend: {}", e.getMessage());
                return Map.of("error", "Node.js sync service unavailable: " + e.getMessage());
            }
        });
    }

    /**
     * Health check for Node.js backend
     */
    public boolean isNodeJsBackendHealthy() {
        try {
            String endpoint = nodeJsServiceUrl + "/api/health";
            ResponseEntity<String> response = restTemplate.getForEntity(endpoint, String.class);
            return response.getStatusCode() == HttpStatus.OK;
        } catch (Exception e) {
            log.warn("Node.js backend health check failed: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Get Node.js backend capabilities
     */
    public Map<String, Object> getNodeJsCapabilities() {
        try {
            String endpoint = nodeJsServiceUrl + "/api/capabilities";
            ResponseEntity<Map> response = restTemplate.getForEntity(endpoint, Map.class);

            if (response.getStatusCode() == HttpStatus.OK) {
                return response.getBody();
            } else {
                return Map.of("available", false, "error", "Unable to fetch capabilities");
            }
        } catch (Exception e) {
            log.warn("Failed to get Node.js capabilities: {}", e.getMessage());
            return Map.of("available", false, "error", e.getMessage());
        }
    }
}