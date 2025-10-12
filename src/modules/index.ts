/**
 * CortexBuild Module System
 * Centralized exports for the module system
 */

// Core exports
export { ModuleRegistry } from './ModuleRegistry';
export type {
    ModuleMetadata,
    ModulePermissions,
    ModuleConfig,
    ModuleCategory,
    UserRole
} from './ModuleRegistry';

export {
    createModule,
    createPublicModule,
    createRoleModule
} from './ModuleRegistry';

// Module definitions
export {
    allModules,
    coreModules,
    aiModules,
    developerModules,
    adminModules,
    businessModules,
    projectModules,
    marketplaceModules,
    toolsModules
} from './moduleDefinitions';

// Initialization
export {
    initializeModules,
    isInitialized,
    getModuleRegistry
} from './initializeModules';

// Hooks
export {
    useModule,
    useModulesForRole,
    useModulesByCategory,
    useModuleStats
} from './useModule';

export type {
    UseModuleOptions,
    UseModuleResult
} from './useModule';

