'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface Tenant {
  id: string;
  name: string;
  domain?: string;
  settings?: Record<string, any>;
}

interface TenantContextType {
  tenant: Tenant | null;
  setTenant: (tenant: Tenant | null) => void;
  tenants: Tenant[];
  switchTenant: (tenantId: string) => void;
  loading: boolean;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load tenants and current tenant from API
    const loadTenantData = async () => {
      try {
        // Try to fetch from tenants endpoint, fallback to clients if not available
        try {
          const response = await fetch('/api/tenants');
          if (response.ok) {
            const data = await response.json();
            setTenants(data.tenants || []);
            setTenant(data.currentTenant || null);
            return;
          }
        } catch (error) {
          // Tenants endpoint doesn't exist, use fallback
        }

        // Fallback: Create default tenant from available data
        const defaultTenant = {
          id: 'default',
          name: 'CortexBuild Platform',
          domain: 'localhost',
          settings: {}
        };

        setTenants([defaultTenant]);
        setTenant(defaultTenant);
      } catch (error) {
        console.error('Failed to load tenant data:', error);
        // Set default tenant even on error
        const defaultTenant = {
          id: 'default',
          name: 'CortexBuild Platform',
          domain: 'localhost',
          settings: {}
        };
        setTenants([defaultTenant]);
        setTenant(defaultTenant);
      } finally {
        setLoading(false);
      }
    };

    loadTenantData();
  }, []);

  const switchTenant = async (tenantId: string) => {
    try {
      const response = await fetch(`/api/tenants/${tenantId}/switch`, {
        method: 'POST',
      });
      if (response.ok) {
        const newTenant = tenants.find(t => t.id === tenantId);
        if (newTenant) {
          setTenant(newTenant);
        }
      }
    } catch (error) {
      console.error('Failed to switch tenant:', error);
    }
  };

  return (
    <TenantContext.Provider value={{
      tenant,
      setTenant,
      tenants,
      switchTenant,
      loading,
    }}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
}