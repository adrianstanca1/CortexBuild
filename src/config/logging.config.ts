/**
 * Logging Configuration
 * Centralized logging settings for the application
 */

import { getEnv } from '../utils/env';

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
  private static isDevelopment = process.env.NODE_ENV === 'development';

  static info(message: string, data?: any) {
    if (this.isDevelopment) {
      console.log(`[INFO] ${message}`, data || '');
    }
  }

  static warn(message: string, data?: any) {
    console.warn(`[WARN] ${message}`, data || '');
  }

  static error(message: string, data?: any) {
    console.error(`[ERROR] ${message}`, data || '');
  }

  static debug(message: string, data?: any) {
    if (this.isDevelopment) {
      console.debug(`[DEBUG] ${message}`, data || '');
    }
  }
}

/**
 * Default logging configuration
 */
export const loggingConfig: LoggingConfig = {
  enabled: true,
  environment: (getEnv('MODE', 'development') as any),
  console: {
    enabled: Logger.isDevelopment,
    level: Logger.isDevelopment ? 'debug' : 'error',
    colorize: false,
    timestamp: true
  },
  performance: {
    enabled: Logger.isDevelopment,
    webVitals: true,
    navigation: false,
    interactions: false,
    memory: false,
    verbose: false
  },
  errors: {
    enabled: true,
    captureConsole: true,
    captureBreadcrumbs: true,
    verbose: false
  },
  api: {
    enabled: true,
    logRequests: Logger.isDevelopment,
    logResponses: Logger.isDevelopment,
    logErrors: true,
    verbose: Logger.isDevelopment
  },
  monitoring: {
    enabled: true,
    alerts: true,
    metrics: true,
    verbose: false
  }
};
