package com.multimodal.tenant;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Simple tenant context filter extracting tenant/company id from either
 * X-Tenant-ID header or JWT-authenticated principal.
 */
@Component
@Order(20)
public class TenantFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        try {
            String tenantId = request.getHeader("X-Tenant-ID");
            if (tenantId == null && request.getUserPrincipal() != null) {
                Object principal = request.getUserPrincipal();
                // Principal is a Map from JwtAuthenticationFilter
                if (principal instanceof java.security.Principal p && p.getName() != null) {
                    // Not using name for tenant; attempt attribute from request if set by security layer (future)
                }
                // Fallback attribute set by JwtAuthenticationFilter
                Object auth = request.getAttribute("companyId");
                if (auth instanceof String) {
                    tenantId = (String) auth;
                }
            }
            if (tenantId != null) {
                TenantContext.setTenantId(tenantId);
            }
            filterChain.doFilter(request, response);
        } finally {
            TenantContext.clear();
        }
    }
}
