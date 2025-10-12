/**
 * CortexBuild Module Initialization
 * Initialize and register all application modules
 */

import { ModuleRegistry } from './ModuleRegistry';
import { allModules } from './moduleDefinitions';

let initialized = false;

/**
 * Initialize all modules
 */
export function initializeModules(): void {
    if (initialized) {
        console.warn('⚠️ Modules already initialized');
        return;
    }

    console.log('🚀 Initializing CortexBuild Module System...');
    console.log(`📦 Registering ${allModules.length} modules...`);

    // Register all modules
    ModuleRegistry.registerBatch(allModules);

    // Get statistics
    const stats = ModuleRegistry.getStats();
    console.log('📊 Module Statistics:', stats);

    // Preload critical modules
    ModuleRegistry.preloadModules().then(() => {
        console.log('✅ Critical modules preloaded');
    });

    initialized = true;
    console.log('✅ Module system initialized successfully');
}

/**
 * Check if modules are initialized
 */
export function isInitialized(): boolean {
    return initialized;
}

/**
 * Get module registry instance
 */
export function getModuleRegistry() {
    if (!initialized) {
        console.warn('⚠️ Modules not initialized. Call initializeModules() first.');
    }
    return ModuleRegistry;
}

