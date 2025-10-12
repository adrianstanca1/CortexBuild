/**
 * CortexBuild Module Initialization
 * Initialize and register all application modules
 */

import { ModuleRegistry } from './ModuleRegistry';
import { allModules } from './moduleDefinitions';
import { Logger } from '../config/logging.config';

let initialized = false;

/**
 * Initialize all modules
 */
export function initializeModules(): void {
    if (initialized) {
        Logger.warn('⚠️ Modules already initialized');
        return;
    }

    Logger.info('🚀 Initializing CortexBuild Module System...');
    Logger.debug(`📦 Registering ${allModules.length} modules...`);

    // Register all modules
    ModuleRegistry.registerBatch(allModules);

    // Get statistics
    const stats = ModuleRegistry.getStats();
    Logger.debug('📊 Module Statistics:', stats);

    // Preload critical modules
    ModuleRegistry.preloadModules().then(() => {
        Logger.debug('✅ Critical modules preloaded');
    });

    initialized = true;
    Logger.info('✅ Module system initialized successfully');
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
        Logger.warn('⚠️ Modules not initialized. Call initializeModules() first.');
    }
    return ModuleRegistry;
}

