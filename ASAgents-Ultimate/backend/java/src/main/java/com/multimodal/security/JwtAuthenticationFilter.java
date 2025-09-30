package com.multimodal.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.*;

/**
 * Simple JWT authentication filter that accepts tokens issued by the Node.js
 * backend.
 * The Node service signs tokens with an HMAC secret (HS256). We reuse the same
 * secret via env var.
 * Expected claims: userId, email, role, companyId (optional), iss, aud.
 */
@Slf4j
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Value("${app.security.jwt.secret:your-super-secret-jwt-key-change-in-production}")
    private String jwtSecret;

    @Value("${app.security.jwt.expected-issuer:asagents-api}")
    private String expectedIssuer;

    @Value("${app.security.jwt.expected-audience:asagents-client}")
    private String expectedAudience;

    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {
        String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);
        try {
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .requireIssuer(expectedIssuer)
                    .requireAudience(expectedAudience)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();

            String userId = claims.get("userId", String.class);
            String email = claims.get("email", String.class);
            String role = claims.get("role", String.class);
            String companyId = claims.get("companyId", String.class);
            if (companyId == null) {
                // Support alternate tenantId claim name
                companyId = claims.get("tenantId", String.class);
            }

            if (userId == null || role == null) {
                filterChain.doFilter(request, response);
                return;
            }

            // Map role claim to authority
            List<GrantedAuthority> authorities = List.of(new SimpleGrantedAuthority("ROLE_" + role.toUpperCase()));

            Map<String, Object> principal = new HashMap<>();
            principal.put("userId", userId);
            principal.put("email", email);
            principal.put("role", role);
            if (companyId != null) {
                principal.put("companyId", companyId);
                // Expose as request attributes for TenantFilter / downstream services
                request.setAttribute("companyId", companyId);
                request.setAttribute("tenantId", companyId);
            }

            Authentication authentication = new UsernamePasswordAuthenticationToken(principal, token, authorities);
            SecurityContextHolder.getContext().setAuthentication(authentication);
        } catch (Exception e) {
            log.debug("JWT parsing/validation failed: {}", e.getMessage());
            // Intentionally do not abort; downstream may handle anonymous access if
            // permitted
        }

        filterChain.doFilter(request, response);
    }
}
