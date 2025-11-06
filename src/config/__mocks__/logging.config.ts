/**
 * Mock Logging Configuration for Tests
 */

export interface LoggingConfig {
  enabled: boolean;
  environment: 'development' | 'production' | 'staging';
  console: {
    enabled: boolean;
    level: 'none' | 'error' | 'warn' | 'info' | 'debug';
    colorize: boolean;
    timestamp: boolean;
  };
  performance: {
    enabled: boolean;
    webVitals: boolean;
    navigation: boolean;
    interactions: boolean;
    memory: boolean;
    verbose: boolean;
  };
  errors: {
    enabled: boolean;
    captureConsole: boolean;
    captureBreadcrumbs: boolean;
    verbose: boolean;
  };
  api: {
    enabled: boolean;
    logRequests: boolean;
    logResponses: boolean;
    logErrors: boolean;
    verbose: boolean;
  };
  monitoring: {
    enabled: boolean;
    alerts: boolean;
    metrics: boolean;
    verbose: boolean;
  };
}

export class Logger {
  private static isDevelopment = true;

  static info(message: string, data?: any) {
    // Mock implementation - do nothing in tests
  }

  static warn(message: string, data?: any) {
    // Mock implementation - do nothing in tests
  }

  static error(message: string, error?: any) {
    // Mock implementation - do nothing in tests
  }

  static debug(message: string, data?: any) {
    // Mock implementation - do nothing in tests
  }

  static group(label: string) {
    // Mock implementation - do nothing in tests
  }

  static groupEnd() {
    // Mock implementation - do nothing in tests
  }

  static table(data: any) {
    // Mock implementation - do nothing in tests
  }

  static time(label: string) {
    // Mock implementation - do nothing in tests
  }

  static timeEnd(label: string) {
    // Mock implementation - do nothing in tests
  }
}

export const loggingConfig: LoggingConfig = {
  enabled: false,
  environment: 'development',
  console: {
    enabled: false,
    level: 'none',
    colorize: false,
    timestamp: false
  },
  performance: {
    enabled: false,
    webVitals: false,
    navigation: false,
    interactions: false,
    memory: false,
    verbose: false
  },
  errors: {
    enabled: false,
    captureConsole: false,
    captureBreadcrumbs: false,
    verbose: false
  },
  api: {
    enabled: false,
    logRequests: false,
    logResponses: false,
    logErrors: false,
    verbose: false
  },
  monitoring: {
    enabled: false,
    alerts: false,
    metrics: false,
    verbose: false
  }
};

