package com.multimodal.security;

import com.multimodal.security.JwtAuthenticationFilter;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.context.SecurityContextHolder;

import jakarta.servlet.FilterChain;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for JWT Authentication Filter
 * Tests token verification, tenant context extraction, and security context setup
 */
@ExtendWith(MockitoExtension.class)
class JwtAuthenticationFilterTest {

    @Mock
    private FilterChain filterChain;

    private JwtAuthenticationFilter jwtFilter;
    private MockHttpServletRequest request;
    private MockHttpServletResponse response;

    private final String testSecret = "test-jwt-secret-256-bits-minimum-length-for-hmac-sha256";
    private final String testIssuer = "asagents-api";
    private final String testAudience = "asagents-client";

    @BeforeEach
    void setUp() {
        // Create filter with test configuration
        jwtFilter = new JwtAuthenticationFilter();
        
        // Use reflection to set private fields for testing
        // In real implementation, these would be injected via @Value annotations
        setField(jwtFilter, "jwtSecret", testSecret);
        setField(jwtFilter, "expectedIssuer", testIssuer);
        setField(jwtFilter, "expectedAudience", testAudience);

        request = new MockHttpServletRequest();
        response = new MockHttpServletResponse();
        
        // Clear security context before each test
        SecurityContextHolder.clearContext();
    }

    @Test
    void shouldProcessValidJwtToken() throws Exception {
        // Arrange
        String token = createValidTestToken();
        request.addHeader("Authorization", "Bearer " + token);

        // Act
        jwtFilter.doFilterInternal(request, response, filterChain);

        // Assert
        verify(filterChain).doFilter(request, response);
        
        // Verify security context was set
        assertNotNull(SecurityContextHolder.getContext().getAuthentication());
        
        // Verify tenant attributes were set on request
        assertEquals("test-company-123", request.getAttribute("companyId"));
        assertEquals("test-company-123", request.getAttribute("tenantId"));
    }

    @Test
    void shouldSkipProcessingWhenNoAuthorizationHeader() throws Exception {
        // Act - No Authorization header
        jwtFilter.doFilterInternal(request, response, filterChain);

        // Assert
        verify(filterChain).doFilter(request, response);
        assertNull(SecurityContextHolder.getContext().getAuthentication());
        assertNull(request.getAttribute("companyId"));
    }

    @Test
    void shouldSkipProcessingWhenInvalidAuthorizationFormat() throws Exception {
        // Arrange
        request.addHeader("Authorization", "Basic somebasictoken");

        // Act
        jwtFilter.doFilterInternal(request, response, filterChain);

        // Assert
        verify(filterChain).doFilter(request, response);
        assertNull(SecurityContextHolder.getContext().getAuthentication());
    }

    @Test
    void shouldHandleInvalidTokenGracefully() throws Exception {
        // Arrange
        request.addHeader("Authorization", "Bearer invalid.token.here");

        // Act
        jwtFilter.doFilterInternal(request, response, filterChain);

        // Assert
        verify(filterChain).doFilter(request, response);
        assertNull(SecurityContextHolder.getContext().getAuthentication());
    }

    @Test
    void shouldHandleExpiredTokenGracefully() throws Exception {
        // Arrange
        String expiredToken = createExpiredTestToken();
        request.addHeader("Authorization", "Bearer " + expiredToken);

        // Act
        jwtFilter.doFilterInternal(request, response, filterChain);

        // Assert
        verify(filterChain).doFilter(request, response);
        assertNull(SecurityContextHolder.getContext().getAuthentication());
    }

    @Test
    void shouldHandleTokenWithWrongIssuer() throws Exception {
        // Arrange
        String token = createTokenWithWrongIssuer();
        request.addHeader("Authorization", "Bearer " + token);

        // Act
        jwtFilter.doFilterInternal(request, response, filterChain);

        // Assert
        verify(filterChain).doFilter(request, response);
        assertNull(SecurityContextHolder.getContext().getAuthentication());
    }

    @Test
    void shouldSupportTenantIdFallback() throws Exception {
        // Arrange - Token with tenantId but no companyId
        String token = createTokenWithTenantIdOnly();
        request.addHeader("Authorization", "Bearer " + token);

        // Act
        jwtFilter.doFilterInternal(request, response, filterChain);

        // Assert
        verify(filterChain).doFilter(request, response);
        assertNotNull(SecurityContextHolder.getContext().getAuthentication());
        assertEquals("tenant-456", request.getAttribute("tenantId"));
    }

    @Test
    void shouldSkipProcessingWhenMissingRequiredClaims() throws Exception {
        // Arrange - Token missing userId
        String token = createTokenMissingUserId();
        request.addHeader("Authorization", "Bearer " + token);

        // Act
        jwtFilter.doFilterInternal(request, response, filterChain);

        // Assert
        verify(filterChain).doFilter(request, response);
        assertNull(SecurityContextHolder.getContext().getAuthentication());
    }

    // Helper methods for creating test tokens

    private String createValidTestToken() {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", "user-123");
        claims.put("email", "test@company.com");
        claims.put("role", "admin");
        claims.put("companyId", "test-company-123");

        return Jwts.builder()
                .setClaims(claims)
                .setIssuer(testIssuer)
                .setAudience(testAudience)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 3600000)) // 1 hour
                .signWith(Keys.hmacShaKeyFor(testSecret.getBytes(StandardCharsets.UTF_8)))
                .compact();
    }

    private String createExpiredTestToken() {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", "user-123");
        claims.put("role", "admin");

        return Jwts.builder()
                .setClaims(claims)
                .setIssuer(testIssuer)
                .setAudience(testAudience)
                .setIssuedAt(new Date(System.currentTimeMillis() - 7200000)) // 2 hours ago
                .setExpiration(new Date(System.currentTimeMillis() - 3600000)) // 1 hour ago
                .signWith(Keys.hmacShaKeyFor(testSecret.getBytes(StandardCharsets.UTF_8)))
                .compact();
    }

    private String createTokenWithWrongIssuer() {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", "user-123");
        claims.put("role", "admin");

        return Jwts.builder()
                .setClaims(claims)
                .setIssuer("wrong-issuer")
                .setAudience(testAudience)
                .setExpiration(new Date(System.currentTimeMillis() + 3600000))
                .signWith(Keys.hmacShaKeyFor(testSecret.getBytes(StandardCharsets.UTF_8)))
                .compact();
    }

    private String createTokenWithTenantIdOnly() {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", "user-456");
        claims.put("email", "test@tenant.com");
        claims.put("role", "manager");
        claims.put("tenantId", "tenant-456"); // Only tenantId, no companyId

        return Jwts.builder()
                .setClaims(claims)
                .setIssuer(testIssuer)
                .setAudience(testAudience)
                .setExpiration(new Date(System.currentTimeMillis() + 3600000))
                .signWith(Keys.hmacShaKeyFor(testSecret.getBytes(StandardCharsets.UTF_8)))
                .compact();
    }

    private String createTokenMissingUserId() {
        Map<String, Object> claims = new HashMap<>();
        claims.put("email", "test@company.com");
        claims.put("role", "admin");
        // Missing userId

        return Jwts.builder()
                .setClaims(claims)
                .setIssuer(testIssuer)
                .setAudience(testAudience)
                .setExpiration(new Date(System.currentTimeMillis() + 3600000))
                .signWith(Keys.hmacShaKeyFor(testSecret.getBytes(StandardCharsets.UTF_8)))
                .compact();
    }

    // Utility method to set private fields via reflection (for testing)
    private void setField(Object target, String fieldName, Object value) {
        try {
            var field = target.getClass().getDeclaredField(fieldName);
            field.setAccessible(true);
            field.set(target, value);
        } catch (Exception e) {
            throw new RuntimeException("Failed to set field: " + fieldName, e);
        }
    }
}