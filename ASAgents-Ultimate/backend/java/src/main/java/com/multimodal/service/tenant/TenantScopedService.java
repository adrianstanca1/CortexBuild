package com.multimodal.service.tenant;

import com.multimodal.tenant.TenantContext;

/**
 * Base class for services needing tenant scoping. Provides helper to fetch the
 * current tenant id
 * from ThreadLocal context and convert to Long when present.
 */
public abstract class TenantScopedService {

    protected Long currentTenantIdOrNull() {
        String id = TenantContext.getTenantId();
        if (id == null || id.isBlank())
            return null;
        try {
            return Long.parseLong(id);
        } catch (NumberFormatException e) {
            return null; // Allow caller to handle missing/invalid tenant
        }
    }

    protected Long requireTenantId() {
        Long id = currentTenantIdOrNull();
        if (id == null) {
            throw new IllegalStateException("Tenant context required but not present or invalid");
        }
        return id;
    }
}
