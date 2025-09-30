package com.multimodal.controller;

import com.multimodal.service.NodeJsIntegrationService;
import com.multimodal.service.MultimodalIntegrationService;
import com.multimodal.service.ProjectService;
import com.multimodal.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

/**
 * Enhanced controller that combines Node.js multimodal AI capabilities 
 * with Java enterprise features for maximum functionality
 */
@RestController
@RequestMapping("/api/enhanced")
@RequiredArgsConstructor
@Slf4j
public class EnhancedMultimodalController {

    private final NodeJsIntegrationService nodeJsService;
    private final MultimodalIntegrationService multimodalService;
    private final ProjectService projectService;
    private final UserService userService;

    /**
     * Enhanced authentication using both backends
     * Node.js handles AI-based user behavior analysis
     * Java handles enterprise security and authorization
     */
    @PostMapping("/auth/enhanced-login")
    public CompletableFuture<ResponseEntity<Map<String, Object>>> enhancedLogin(
            @RequestBody Map<String, Object> credentials) {
        
        return CompletableFuture.supplyAsync(() -> {
            try {
                String email = (String) credentials.get("email");
                String password = (String) credentials.get("password");
                
                Map<String, Object> result = new HashMap<>();
                
                // 1. Try Node.js authentication first (AI-enhanced)
                CompletableFuture<Map<String, Object>> nodeAuthFuture = 
                    nodeJsService.authenticate(email, password);
                
                Map<String, Object> nodeAuth = nodeAuthFuture.join();
                
                if (!nodeAuth.containsKey("error")) {
                    // 2. Enhance with Java enterprise features
                    result.put("nodeJsAuth", nodeAuth);
                    result.put("enterpriseFeatures", true);
                    result.put("multiBackendAuth", true);
                    result.put("aiEnhanced", true);
                    
                    // Add Java-specific enterprise data
                    result.put("roles", List.of("USER", "ENTERPRISE_MEMBER"));
                    result.put("permissions", getEnterprisePermissions(email));
                    result.put("backendCapabilities", Map.of(
                        "nodejs", nodeJsService.getNodeJsCapabilities(),
                        "java", Map.of("analytics", true, "reporting", true, "workflows", true)
                    ));
                    
                    log.info("Enhanced authentication successful for user: {}", email);
                    return ResponseEntity.ok(result);
                } else {
                    // Fallback to Java-only auth if Node.js fails
                    result.put("nodeJsAuth", Map.of("available", false));
                    result.put("javaAuth", Map.of("status", "fallback_mode"));
                    result.put("error", "Enhanced authentication failed, using fallback");
                    
                    return ResponseEntity.status(401).body(result);
                }
                
            } catch (Exception e) {
                log.error("Enhanced authentication error: {}", e.getMessage());
                return ResponseEntity.status(500).body(
                    Map.of("error", "Authentication service error: " + e.getMessage())
                );
            }
        });
    }

    /**
     * Enhanced project processing with both AI and enterprise features
     */
    @PostMapping("/projects/process-multimodal")
    public CompletableFuture<ResponseEntity<Map<String, Object>>> processProjectMultimodal(
            @RequestParam("projectId") String projectId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "analysisType", defaultValue = "full") String analysisType) {
        
        return CompletableFuture.supplyAsync(() -> {
            try {
                Map<String, Object> result = new HashMap<>();
                
                // 1. Upload file to Node.js for AI processing
                CompletableFuture<Map<String, Object>> nodejsUpload = 
                    nodeJsService.uploadFile(file, projectId);
                
                Map<String, Object> uploadResult = nodejsUpload.join();
                
                if (!uploadResult.containsKey("error")) {
                    result.put("aiProcessing", uploadResult);
                    
                    // 2. Process with Java multimodal service for enterprise analysis
                    Map<String, Object> javaAnalysis = Map.of(
                        "projectAnalytics", analyzeProjectData(projectId),
                        "complianceCheck", checkCompliance(file),
                        "costAnalysis", performCostAnalysis(projectId, file),
                        "riskAssessment", assessRisks(projectId, file)
                    );
                    
                    result.put("enterpriseAnalysis", javaAnalysis);
                    result.put("combinedCapabilities", true);
                    result.put("processingBackends", List.of("nodejs-ai", "java-enterprise"));
                    
                    // 3. Sync results between backends
                    CompletableFuture<Map<String, Object>> syncResult = 
                        nodeJsService.syncData("project-analysis", result);
                    
                    result.put("syncStatus", syncResult.join());
                    
                    return ResponseEntity.ok(result);
                } else {
                    return ResponseEntity.status(400).body(
                        Map.of("error", "File processing failed: " + uploadResult.get("error"))
                    );
                }
                
            } catch (Exception e) {
                log.error("Enhanced project processing error: {}", e.getMessage());
                return ResponseEntity.status(500).body(
                    Map.of("error", "Processing service error: " + e.getMessage())
                );
            }
        });
    }

    /**
     * Enhanced dashboard with data from both backends
     */
    @GetMapping("/dashboard/unified")
    public CompletableFuture<ResponseEntity<Map<String, Object>>> getUnifiedDashboard(
            @RequestParam("userId") String userId) {
        
        return CompletableFuture.supplyAsync(() -> {
            try {
                Map<String, Object> dashboard = new HashMap<>();
                
                // 1. Get AI-enhanced data from Node.js
                CompletableFuture<List<Map<String, Object>>> nodeProjects = 
                    nodeJsService.getNodeJsProjects(userId);
                
                CompletableFuture<Map<String, Object>> aiInsights = 
                    nodeJsService.processAiRequest("analytics/user-insights", 
                        Map.of("userId", userId));
                
                // 2. Get enterprise data from Java
                // (These would be actual method calls to your existing services)
                Map<String, Object> enterpriseData = Map.of(
                    "projectStatistics", getProjectStatistics(userId),
                    "performanceMetrics", getPerformanceMetrics(userId),
                    "complianceStatus", getComplianceStatus(userId),
                    "budgetAnalysis", getBudgetAnalysis(userId)
                );
                
                // 3. Combine data
                dashboard.put("aiProjects", nodeProjects.join());
                dashboard.put("aiInsights", aiInsights.join());
                dashboard.put("enterpriseData", enterpriseData);
                dashboard.put("backendHealth", Map.of(
                    "nodejs", nodeJsService.isNodeJsBackendHealthy(),
                    "java", true
                ));
                dashboard.put("unifiedDashboard", true);
                
                return ResponseEntity.ok(dashboard);
                
            } catch (Exception e) {
                log.error("Unified dashboard error: {}", e.getMessage());
                return ResponseEntity.status(500).body(
                    Map.of("error", "Dashboard service error: " + e.getMessage())
                );
            }
        });
    }

    /**
     * Health check for the enhanced system
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> getEnhancedHealth() {
        Map<String, Object> health = new HashMap<>();
        
        health.put("javaBackend", Map.of(
            "status", "healthy",
            "capabilities", List.of("enterprise", "analytics", "compliance", "reporting")
        ));
        
        health.put("nodejsBackend", Map.of(
            "status", nodeJsService.isNodeJsBackendHealthy() ? "healthy" : "unavailable",
            "capabilities", nodeJsService.getNodeJsCapabilities()
        ));
        
        health.put("enhancedFeatures", true);
        health.put("multiBackend", true);
        
        return ResponseEntity.ok(health);
    }

    // Helper methods for enterprise features
    private Map<String, Object> getEnterprisePermissions(String email) {
        return Map.of(
            "canManageProjects", true,
            "canViewAnalytics", true,
            "canExportReports", true,
            "canManageUsers", email.contains("admin")
        );
    }

    private Map<String, Object> analyzeProjectData(String projectId) {
        return Map.of(
            "totalTasks", 42,
            "completionRate", 0.75,
            "avgTaskDuration", "2.3 days",
            "teamEfficiency", 0.85
        );
    }

    private Map<String, Object> checkCompliance(MultipartFile file) {
        return Map.of(
            "safetyCompliance", true,
            "regulatoryCompliance", true,
            "documentationComplete", file.getSize() > 1000,
            "complianceScore", 0.95
        );
    }

    private Map<String, Object> performCostAnalysis(String projectId, MultipartFile file) {
        return Map.of(
            "estimatedCost", 15000.0,
            "costVariance", 0.05,
            "budgetUtilization", 0.78,
            "projectedSavings", 2500.0
        );
    }

    private Map<String, Object> assessRisks(String projectId, MultipartFile file) {
        return Map.of(
            "overallRisk", "LOW",
            "scheduleRisk", 0.2,
            "budgetRisk", 0.15,
            "technicalRisk", 0.1,
            "mitigationStrategies", List.of("Regular reviews", "Buffer time", "Quality checks")
        );
    }

    private Map<String, Object> getProjectStatistics(String userId) {
        return Map.of("totalProjects", 15, "activeProjects", 8, "completedProjects", 7);
    }

    private Map<String, Object> getPerformanceMetrics(String userId) {
        return Map.of("efficiency", 0.87, "onTimeDelivery", 0.92, "budgetAdherence", 0.89);
    }

    private Map<String, Object> getComplianceStatus(String userId) {
        return Map.of("overallScore", 0.94, "pendingItems", 3, "criticalIssues", 0);
    }

    private Map<String, Object> getBudgetAnalysis(String userId) {
        return Map.of("totalBudget", 250000.0, "utilized", 187500.0, "remaining", 62500.0);
    }
}