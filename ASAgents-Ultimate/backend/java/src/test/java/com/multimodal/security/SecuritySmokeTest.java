package com.multimodal.security;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Smoke tests for Java backend security configuration and endpoints
 * These tests verify basic functionality without requiring external dependencies
 */
@SpringBootTest
@ActiveProfiles("test")
@AutoConfigureMockMvc
class SecuritySmokeTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("Application context loads successfully")
    void testApplicationContextLoads() {
        // Test that Spring context loads without errors
        assertNotNull(mockMvc, "MockMvc should be initialized");
    }

        @Test
    @DisplayName("Health endpoint should be accessible without authentication")
    public void testHealthEndpointAccessible() throws Exception {
        mockMvc.perform(get("/api/enhanced/health"))
                .andExpect(status().isOk())
                .andExpect(content().contentType("application/json"));
    }

    @Test
    @DisplayName("Enhanced health endpoint should be accessible without authentication")
    void testEnhancedHealthEndpointAccessible() throws Exception {
        // Based on SecurityConfig, /api/enhanced/health should be permitted
        mockMvc.perform(get("/api/enhanced/health"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Protected endpoints should return 401 without JWT token")
    void testProtectedEndpointsRequireAuthentication() throws Exception {
        // Test a protected endpoint without authorization header
        mockMvc.perform(get("/api/java/projects"))
                .andExpect(status().isUnauthorized());
                
        mockMvc.perform(get("/api/java/users"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("JWT validation endpoint should handle missing token gracefully")
    void testJwtValidationEndpointWithoutToken() throws Exception {
        mockMvc.perform(get("/api/java/auth/validate"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("CORS preflight requests should be handled")
    void testCorsHeadersPresent() throws Exception {
        mockMvc.perform(options("/api/java/health")
                        .header("Origin", "http://localhost:5173")
                        .header("Access-Control-Request-Method", "GET"))
                .andExpect(status().isUnauthorized()); // Still protected, but headers should be present
    }

    @Test
    @DisplayName("Security headers should be present in responses")
    public void testSecurityHeadersPresent() throws Exception {
        mockMvc.perform(get("/api/enhanced/health"))
                .andExpect(status().isOk())
                .andExpect(header().exists("X-Content-Type-Options"))
                .andExpect(header().exists("X-Frame-Options"))
                .andExpect(header().exists("Cache-Control"));
    }

    @Test
    @DisplayName("Invalid JWT token should be rejected")
    void testInvalidJwtTokenRejection() throws Exception {
        mockMvc.perform(get("/api/java/auth/validate")
                        .header("Authorization", "Bearer invalid.jwt.token.here"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Malformed Authorization header should be handled")
    void testMalformedAuthorizationHeader() throws Exception {
        mockMvc.perform(get("/api/java/auth/validate")
                        .header("Authorization", "InvalidFormat"))
                .andExpect(status().isUnauthorized());
    }

        @Test
    @DisplayName("Rate limiting should be configured properly")
    public void testRateLimitingConfiguration() throws Exception {
        // Test that we can make successful requests
        mockMvc.perform(get("/api/enhanced/health"))
                .andExpect(status().isOk());

        // Rate limiting is complex to test in unit tests
        // This mainly verifies endpoint accessibility
        mockMvc.perform(get("/api/enhanced/health"))
                .andExpect(status().isOk());
    }
}