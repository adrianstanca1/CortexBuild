/**
 * CortexBuild Module Registry
 * Centralized module management system with lazy loading, permissions, and routing
 */

import { lazy, ComponentType } from 'react';
import { Screen } from '../types';

// ============================================
// MODULE TYPES
// ============================================

export interface ModuleMetadata {
    id: string;
    name: string;
    description: string;
    version: string;
    category: ModuleCategory;
    icon?: string;
    author?: string;
    tags?: string[];
}

export interface ModulePermissions {
    requiredRole?: UserRole[];
    requiredPermissions?: string[];
    requiresProjectContext?: boolean;
    requiresCompanyContext?: boolean;
}

export interface ModuleConfig {
    screen: Screen;
    metadata: ModuleMetadata;
    permissions: ModulePermissions;
    component: () => Promise<{ default: ComponentType<any> }>;
    preload?: boolean;
    dependencies?: string[];
}

export type ModuleCategory = 
    | 'core'
    | 'ai'
    | 'developer'
    | 'admin'
    | 'company'
    | 'project'
    | 'financial'
    | 'operations'
    | 'marketplace'
    | 'tools';

export type UserRole = 
    | 'super_admin'
    | 'company_admin'
    | 'developer'
    | 'project_manager'
    | 'field_worker'
    | 'client';

// ============================================
// MODULE REGISTRY CLASS
// ============================================

class ModuleRegistryClass {
    private modules: Map<Screen, ModuleConfig> = new Map();
    private loadedModules: Set<Screen> = new Set();
    private preloadQueue: Screen[] = [];

    /**
     * Register a new module
     */
    register(config: ModuleConfig): void {
        if (this.modules.has(config.screen)) {
            console.warn(`Module ${config.screen} is already registered. Overwriting...`);
        }

        this.modules.set(config.screen, config);

        // Add to preload queue if needed
        if (config.preload) {
            this.preloadQueue.push(config.screen);
        }

        console.log(`✅ Module registered: ${config.metadata.name} (${config.screen})`);
    }

    /**
     * Register multiple modules at once
     */
    registerBatch(configs: ModuleConfig[]): void {
        configs.forEach(config => this.register(config));
    }

    /**
     * Get module configuration
     */
    getModule(screen: Screen): ModuleConfig | undefined {
        return this.modules.get(screen);
    }

    /**
     * Get all registered modules
     */
    getAllModules(): ModuleConfig[] {
        return Array.from(this.modules.values());
    }

    /**
     * Get modules by category
     */
    getModulesByCategory(category: ModuleCategory): ModuleConfig[] {
        return this.getAllModules().filter(m => m.metadata.category === category);
    }

    /**
     * Get modules accessible by user role
     */
    getModulesForRole(role: UserRole): ModuleConfig[] {
        return this.getAllModules().filter(module => {
            const { requiredRole } = module.permissions;
            if (!requiredRole || requiredRole.length === 0) return true;
            return requiredRole.includes(role);
        });
    }

    /**
     * Check if user can access module
     */
    canAccessModule(screen: Screen, userRole: UserRole, permissions?: string[]): boolean {
        const module = this.getModule(screen);
        if (!module) return false;

        const { requiredRole, requiredPermissions } = module.permissions;

        // Check role
        if (requiredRole && requiredRole.length > 0) {
            if (!requiredRole.includes(userRole)) {
                return false;
            }
        }

        // Check permissions
        if (requiredPermissions && requiredPermissions.length > 0 && permissions) {
            const hasAllPermissions = requiredPermissions.every(perm => 
                permissions.includes(perm)
            );
            if (!hasAllPermissions) {
                return false;
            }
        }

        return true;
    }

    /**
     * Load module component
     */
    async loadModule(screen: Screen): Promise<ComponentType<any> | null> {
        const module = this.getModule(screen);
        if (!module) {
            console.error(`Module ${screen} not found in registry`);
            return null;
        }

        try {
            const loaded = await module.component();
            this.loadedModules.add(screen);
            console.log(`✅ Module loaded: ${module.metadata.name}`);
            return loaded.default;
        } catch (error) {
            console.error(`❌ Failed to load module ${screen}:`, error);
            return null;
        }
    }

    /**
     * Preload critical modules
     */
    async preloadModules(): Promise<void> {
        console.log(`🚀 Preloading ${this.preloadQueue.length} modules...`);
        
        const promises = this.preloadQueue.map(screen => this.loadModule(screen));
        await Promise.allSettled(promises);
        
        console.log(`✅ Preload complete`);
    }

    /**
     * Get lazy component for module
     */
    getLazyComponent(screen: Screen): ComponentType<any> | null {
        const module = this.getModule(screen);
        if (!module) return null;

        return lazy(module.component);
    }

    /**
     * Check if module is loaded
     */
    isModuleLoaded(screen: Screen): boolean {
        return this.loadedModules.has(screen);
    }

    /**
     * Get module dependencies
     */
    getDependencies(screen: Screen): string[] {
        const module = this.getModule(screen);
        return module?.dependencies || [];
    }

    /**
     * Validate module dependencies
     */
    validateDependencies(screen: Screen): boolean {
        const deps = this.getDependencies(screen);
        return deps.every(dep => this.modules.has(dep as Screen));
    }

    /**
     * Get module statistics
     */
    getStats() {
        return {
            total: this.modules.size,
            loaded: this.loadedModules.size,
            preloadQueue: this.preloadQueue.length,
            byCategory: this.getAllModules().reduce((acc, module) => {
                const cat = module.metadata.category;
                acc[cat] = (acc[cat] || 0) + 1;
                return acc;
            }, {} as Record<ModuleCategory, number>)
        };
    }

    /**
     * Clear registry (for testing)
     */
    clear(): void {
        this.modules.clear();
        this.loadedModules.clear();
        this.preloadQueue = [];
    }
}

// ============================================
// SINGLETON INSTANCE
// ============================================

export const ModuleRegistry = new ModuleRegistryClass();

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Create module configuration helper
 */
export function createModule(config: ModuleConfig): ModuleConfig {
    return config;
}

/**
 * Create module with default permissions
 */
export function createPublicModule(
    screen: Screen,
    metadata: ModuleMetadata,
    component: () => Promise<{ default: ComponentType<any> }>
): ModuleConfig {
    return {
        screen,
        metadata,
        permissions: {},
        component
    };
}

/**
 * Create role-restricted module
 */
export function createRoleModule(
    screen: Screen,
    metadata: ModuleMetadata,
    component: () => Promise<{ default: ComponentType<any> }>,
    requiredRole: UserRole[]
): ModuleConfig {
    return {
        screen,
        metadata,
        permissions: { requiredRole },
        component
    };
}

