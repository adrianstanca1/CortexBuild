/**
 * CortexBuild Module Hook
 * React hook for accessing and loading modules
 */

import { useState, useEffect, useMemo, ComponentType } from 'react';
import { Screen } from '../types';
import { ModuleRegistry, ModuleConfig, UserRole } from './ModuleRegistry';

export interface UseModuleOptions {
    preload?: boolean;
    userRole?: UserRole;
    permissions?: string[];
}

export interface UseModuleResult {
    module: ModuleConfig | null;
    component: ComponentType<any> | null;
    loading: boolean;
    error: Error | null;
    canAccess: boolean;
    isLoaded: boolean;
}

/**
 * Hook to access and load a module
 */
export function useModule(screen: Screen, options: UseModuleOptions = {}): UseModuleResult {
    const { preload = false, userRole, permissions } = options;

    const [component, setComponent] = useState<ComponentType<any> | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    // Get module configuration
    const module = useMemo(() => {
        return ModuleRegistry.getModule(screen);
    }, [screen]);

    // Check access permissions
    const canAccess = useMemo(() => {
        if (!module || !userRole) return true;
        return ModuleRegistry.canAccessModule(screen, userRole, permissions);
    }, [module, screen, userRole, permissions]);

    // Check if module is already loaded
    const isLoaded = useMemo(() => {
        return ModuleRegistry.isModuleLoaded(screen);
    }, [screen]);

    // Load module component
    useEffect(() => {
        if (!module) {
            setError(new Error(`Module ${screen} not found`));
            return;
        }

        if (!canAccess) {
            setError(new Error(`Access denied to module ${screen}`));
            return;
        }

        // If already loaded, get lazy component
        if (isLoaded) {
            const lazyComp = ModuleRegistry.getLazyComponent(screen);
            if (lazyComp) {
                setComponent(lazyComp);
            }
            return;
        }

        // Load module if preload is enabled
        if (preload) {
            setLoading(true);
            ModuleRegistry.loadModule(screen)
                .then(comp => {
                    if (comp) {
                        setComponent(comp);
                    }
                    setLoading(false);
                })
                .catch(err => {
                    setError(err);
                    setLoading(false);
                });
        } else {
            // Use lazy loading
            const lazyComp = ModuleRegistry.getLazyComponent(screen);
            if (lazyComp) {
                setComponent(lazyComp);
            }
        }
    }, [module, screen, canAccess, isLoaded, preload]);

    return {
        module,
        component,
        loading,
        error,
        canAccess,
        isLoaded
    };
}

/**
 * Hook to get all modules for a user role
 */
export function useModulesForRole(role: UserRole) {
    return useMemo(() => {
        return ModuleRegistry.getModulesForRole(role);
    }, [role]);
}

/**
 * Hook to get modules by category
 */
export function useModulesByCategory(category: string) {
    return useMemo(() => {
        return ModuleRegistry.getModulesByCategory(category as any);
    }, [category]);
}

/**
 * Hook to get module statistics
 */
export function useModuleStats() {
    const [stats, setStats] = useState(ModuleRegistry.getStats());

    useEffect(() => {
        // Update stats periodically
        const interval = setInterval(() => {
            setStats(ModuleRegistry.getStats());
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    return stats;
}

