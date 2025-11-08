// CortexBuild Application Configuration
export interface AppConfig {
  app: {
    name: string;
    version: string;
    environment: 'development' | 'staging' | 'production';
    baseUrl: string;
    apiUrl: string;
  };
  features: {
    [key: string]: boolean;
  };
  ui: {
    theme: 'light' | 'dark' | 'auto';
    primaryColor: string;
    secondaryColor: string;
    sidebarCollapsed: boolean;
    animations: boolean;
    notifications: boolean;
  };
  services: {
    [serviceName: string]: {
      enabled: boolean;
      endpoint?: string;
      timeout: number;
      retryAttempts: number;
    };
  };
  integrations: {
    ai: {
      enabled: boolean;
      provider: 'openai' | 'google' | 'custom';
      models: string[];
    };
    analytics: {
      enabled: boolean;
      provider: 'internal' | 'google' | 'mixpanel';
    };
    storage: {
      provider: 'local' | 's3' | 'azure' | 'gcp';
      maxFileSize: number;
      allowedTypes: string[];
    };
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
      inApp: boolean;
    };
  };
  security: {
    sessionTimeout: number;
    passwordPolicy: {
      minLength: number;
      requireUppercase: boolean;
      requireLowercase: boolean;
      requireNumbers: boolean;
      requireSpecialChars: boolean;
    };
    twoFactorAuth: boolean;
    ipWhitelist: string[];
  };
  performance: {
    cacheTimeout: number;
    maxConcurrentRequests: number;
    compressionEnabled: boolean;
    lazyLoading: boolean;
  };
}

export const defaultConfig: AppConfig = {
  app: {
    name: 'CortexBuild',
    version: '2.0.0',
    environment: 'development',
    baseUrl: 'http://localhost:3002',
    apiUrl: 'http://localhost:3002/api'
  },
  features: {
    // Core Features
    dashboard: true,
    projects: true,
    tasks: true,
    rfis: true,
    documents: true,
    
    // Advanced Features
    analytics: true,
    reports: true,
    teamManagement: true,
    timeTracking: true,
    projectPlanning: true,
    
    // AI & ML Features
    aiInsights: true,
    predictiveAnalytics: true,
    smartRecommendations: true,
    automatedWorkflows: true,
    
    // Quality & Safety
    qualityControl: true,
    safetyManagement: true,
    complianceTracking: true,
    inspections: true,
    
    // Business Intelligence
    businessIntelligence: true,
    customDashboards: true,
    advancedReporting: true,
    kpiTracking: true,
    
    // Integration Features
    webhooks: true,
    apiAccess: true,
    dataExport: true,
    dataImport: true,
    
    // Admin Features
    userManagement: true,
    roleManagement: true,
    auditLogs: true,
    systemMonitoring: true
  },
  ui: {
    theme: 'light',
    primaryColor: '#3B82F6',
    secondaryColor: '#1F2937',
    sidebarCollapsed: false,
    animations: true,
    notifications: true
  },
  services: {
    dataService: {
      enabled: true,
      timeout: 30000,
      retryAttempts: 3
    },
    analyticsService: {
      enabled: true,
      timeout: 15000,
      retryAttempts: 2
    },
    teamService: {
      enabled: true,
      timeout: 10000,
      retryAttempts: 3
    },
    timeTrackingService: {
      enabled: true,
      timeout: 10000,
      retryAttempts: 2
    },
    notificationService: {
      enabled: true,
      timeout: 5000,
      retryAttempts: 3
    },
    schedulingService: {
      enabled: true,
      timeout: 20000,
      retryAttempts: 2
    },
    aiMLService: {
      enabled: true,
      timeout: 60000,
      retryAttempts: 1
    },
    qualitySafetyService: {
      enabled: true,
      timeout: 15000,
      retryAttempts: 2
    },
    businessIntelligenceService: {
      enabled: true,
      timeout: 30000,
      retryAttempts: 2
    },
    workflowAutomationService: {
      enabled: true,
      timeout: 45000,
      retryAttempts: 2
    },
    utilityService: {
      enabled: true,
      timeout: 10000,
      retryAttempts: 3
    },
    integrationService: {
      enabled: true,
      timeout: 20000,
      retryAttempts: 2
    }
  },
  integrations: {
    ai: {
      enabled: true,
      provider: 'openai',
      models: ['gpt-4', 'gpt-3.5-turbo', 'text-embedding-ada-002']
    },
    analytics: {
      enabled: true,
      provider: 'internal'
    },
    storage: {
      provider: 'local',
      maxFileSize: 50 * 1024 * 1024, // 50MB
      allowedTypes: [
        'image/jpeg',
        'image/png',
        'image/gif',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/csv',
        'text/plain'
      ]
    },
    notifications: {
      email: true,
      push: true,
      sms: false,
      inApp: true
    }
  },
  security: {
    sessionTimeout: 8 * 60 * 60 * 1000, // 8 hours
    passwordPolicy: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true
    },
    twoFactorAuth: false,
    ipWhitelist: []
  },
  performance: {
    cacheTimeout: 5 * 60 * 1000, // 5 minutes
    maxConcurrentRequests: 10,
    compressionEnabled: true,
    lazyLoading: true
  }
};

// Environment-specific configurations
export const environmentConfigs = {
  development: {
    ...defaultConfig,
    app: {
      ...defaultConfig.app,
      environment: 'development' as const
    },
    ui: {
      ...defaultConfig.ui,
      animations: true
    },
    performance: {
      ...defaultConfig.performance,
      cacheTimeout: 1 * 60 * 1000 // 1 minute for development
    }
  },
  staging: {
    ...defaultConfig,
    app: {
      ...defaultConfig.app,
      environment: 'staging' as const,
      baseUrl: 'https://staging.cortexbuild.com',
      apiUrl: 'https://staging.cortexbuild.com/api'
    },
    security: {
      ...defaultConfig.security,
      twoFactorAuth: true
    }
  },
  production: {
    ...defaultConfig,
    app: {
      ...defaultConfig.app,
      environment: 'production' as const,
      baseUrl: 'https://cortexbuild.com',
      apiUrl: 'https://api.cortexbuild.com'
    },
    security: {
      ...defaultConfig.security,
      twoFactorAuth: true,
      sessionTimeout: 4 * 60 * 60 * 1000 // 4 hours in production
    },
    performance: {
      ...defaultConfig.performance,
      cacheTimeout: 15 * 60 * 1000, // 15 minutes in production
      maxConcurrentRequests: 20
    }
  }
};

// Feature flags for gradual rollout
export const featureFlags = {
  // AI Features
  ADVANCED_AI_INSIGHTS: true,
  PREDICTIVE_ANALYTICS: true,
  SMART_RECOMMENDATIONS: true,
  AUTOMATED_WORKFLOWS: true,
  
  // Business Intelligence
  CUSTOM_DASHBOARDS: true,
  ADVANCED_REPORTING: true,
  REAL_TIME_KPI: true,
  
  // Quality & Safety
  DIGITAL_INSPECTIONS: true,
  SAFETY_INCIDENT_TRACKING: true,
  COMPLIANCE_MONITORING: true,
  
  // Integration Features
  WEBHOOK_INTEGRATIONS: true,
  API_ACCESS: true,
  BULK_DATA_OPERATIONS: true,
  
  // Experimental Features
  VOICE_COMMANDS: false,
  AUGMENTED_REALITY: false,
  BLOCKCHAIN_VERIFICATION: false,
  IOT_SENSOR_INTEGRATION: false
};

// Screen configurations
export const screenConfigs = {
  dashboard: {
    refreshInterval: 30000, // 30 seconds
    maxWidgets: 12,
    defaultLayout: 'grid'
  },
  projects: {
    itemsPerPage: 20,
    defaultView: 'grid',
    sortBy: 'updatedAt'
  },
  tasks: {
    itemsPerPage: 50,
    defaultView: 'list',
    sortBy: 'priority'
  },
  analytics: {
    refreshInterval: 60000, // 1 minute
    defaultTimeRange: '30d',
    maxDataPoints: 1000
  },
  reports: {
    maxReportSize: 10 * 1024 * 1024, // 10MB
    defaultFormat: 'pdf',
    scheduleOptions: ['daily', 'weekly', 'monthly', 'quarterly']
  }
};

// Navigation configuration
export const navigationConfig = {
  sidebar: {
    collapsible: true,
    defaultCollapsed: false,
    showIcons: true,
    showLabels: true
  },
  breadcrumbs: {
    enabled: true,
    maxItems: 5,
    showHome: true
  },
  tabs: {
    closable: true,
    maxTabs: 10,
    persistState: true
  }
};

// Notification configuration
export const notificationConfig = {
  maxNotifications: 100,
  autoMarkReadAfter: 7 * 24 * 60 * 60 * 1000, // 7 days
  categories: {
    system: { color: 'blue', priority: 'low' },
    project: { color: 'green', priority: 'medium' },
    task: { color: 'yellow', priority: 'medium' },
    safety: { color: 'red', priority: 'high' },
    quality: { color: 'purple', priority: 'medium' }
  },
  channels: {
    inApp: { enabled: true, realTime: true },
    email: { enabled: true, batchInterval: 15 * 60 * 1000 }, // 15 minutes
    push: { enabled: true, requirePermission: true },
    sms: { enabled: false, requireVerification: true }
  }
};

// Get current configuration based on environment
export function getConfig(): AppConfig {
  const env = process.env.NODE_ENV || 'development';
  return environmentConfigs[env as keyof typeof environmentConfigs] || environmentConfigs.development;
}

// Check if feature is enabled
export function isFeatureEnabled(featureName: string): boolean {
  const config = getConfig();
  return config.features[featureName] || featureFlags[featureName as keyof typeof featureFlags] || false;
}

// Get service configuration
export function getServiceConfig(serviceName: string) {
  const config = getConfig();
  return config.services[serviceName] || {
    enabled: false,
    timeout: 10000,
    retryAttempts: 1
  };
}

// Update configuration at runtime
export function updateConfig(updates: Partial<AppConfig>): void {
  // In a real implementation, this would update the configuration
  // and potentially persist changes to storage
  console.log('Configuration updated:', updates);
}

export default getConfig();
