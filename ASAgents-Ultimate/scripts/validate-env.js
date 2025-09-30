#!/usr/bin/env node

/**
 * ASAgents Platform - Environment Configuration Validator
 * Validates environment variables across all deployment configurations
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class EnvironmentValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.validatedConfigs = [];
  }

  // Color codes for output
  colors = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    reset: '\x1b[0m',
  };

  log(level, message) {
    const timestamp = new Date().toISOString();
    const color = this.colors[level] || this.colors.reset;
    console.log(`${color}[${timestamp}] ${message}${this.colors.reset}`);
  }

  validateEnvironmentFiles() {
    this.log('blue', '🔍 Starting environment configuration validation...');
    
    const envFiles = [
      '.env.example',
      '.env.production',
      '.env.staging',
      '.env.development',
    ];

    const projectRoot = path.join(__dirname, '..');

    envFiles.forEach(file => {
      const filePath = path.join(projectRoot, file);
      if (fs.existsSync(filePath)) {
        this.validateFile(file, filePath);
      } else if (file === '.env.example') {
        this.errors.push(`Missing required ${file}`);
      } else {
        this.warnings.push(`Optional ${file} not found`);
      }
    });

    this.generateReport();
  }

  validateFile(fileName, filePath) {
    this.log('cyan', `Validating ${fileName}...`);
    
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const config = this.parseEnvFile(content);
      const validation = this.validateConfiguration(fileName, config);
      
      this.validatedConfigs.push({
        file: fileName,
        config,
        validation,
      });

    } catch (error) {
      this.errors.push(`Failed to read ${fileName}: ${error.message}`);
    }
  }

  parseEnvFile(content) {
    const config = {};
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      line = line.trim();
      
      // Skip comments and empty lines
      if (line.startsWith('#') || !line) return;
      
      const equalIndex = line.indexOf('=');
      if (equalIndex === -1) return;
      
      const key = line.substring(0, equalIndex).trim();
      const value = line.substring(equalIndex + 1).trim();
      
      config[key] = {
        value,
        line: index + 1,
        hasPlaceholder: this.isPlaceholder(value),
      };
    });

    return config;
  }

  isPlaceholder(value) {
    const placeholders = [
      'your-',
      'replace-with-',
      'change-this',
      'your_',
      'REPLACE_WITH_',
      'TODO',
      'FIXME',
    ];
    
    return placeholders.some(placeholder => 
      value.toLowerCase().includes(placeholder.toLowerCase())
    );
  }

  validateConfiguration(fileName, config) {
    const validation = {
      critical: [],
      warnings: [],
      security: [],
      missing: [],
    };

    // Critical environment variables
    const criticalVars = [
      'JWT_SECRET',
      'DATABASE_URL',
      'NODE_ENV',
    ];

    // Security-sensitive variables
    const securityVars = [
      'JWT_SECRET',
      'SESSION_SECRET',
      'DATABASE_URL',
      'MYSQL_PASSWORD',
      'REDIS_PASSWORD',
      'GOOGLE_CLIENT_SECRET',
      'GITHUB_CLIENT_SECRET',
    ];

    // Production-specific validations
    if (fileName.includes('production')) {
      this.validateProductionConfig(config, validation);
    }

    // Check critical variables
    criticalVars.forEach(varName => {
      const variable = config[varName];
      
      if (!variable) {
        validation.missing.push(`Missing critical variable: ${varName}`);
      } else if (variable.hasPlaceholder) {
        validation.critical.push(`${varName} contains placeholder value`);
      }
    });

    // Check security variables
    securityVars.forEach(varName => {
      const variable = config[varName];
      
      if (variable && !variable.hasPlaceholder) {
        this.validateSecurityVariable(varName, variable.value, validation);
      }
    });

    // Validate specific configurations
    this.validateSpecificConfigs(config, validation);

    return validation;
  }

  validateProductionConfig(config, validation) {
    // Production-specific checks
    const nodeEnv = config['NODE_ENV']?.value;
    if (nodeEnv !== 'production') {
      validation.critical.push('NODE_ENV must be "production" in production config');
    }

    const mockFallback = config['VITE_ALLOW_MOCK_FALLBACK']?.value;
    if (mockFallback === 'true') {
      validation.warnings.push('Mock fallback enabled in production - security risk');
    }

    const debugMode = config['VITE_ENABLE_DEBUG_MODE']?.value;
    if (debugMode === 'true') {
      validation.warnings.push('Debug mode enabled in production - security risk');
    }

    // SSL/HTTPS checks
    const cookieSecure = config['COOKIE_SECURE']?.value;
    if (cookieSecure !== 'true') {
      validation.security.push('COOKIE_SECURE should be true in production');
    }

    // Monitoring checks
    const monitoring = config['ENABLE_MONITORING']?.value;
    if (monitoring !== 'true') {
      validation.warnings.push('Monitoring disabled in production');
    }
  }

  validateSecurityVariable(varName, value, validation) {
    if (varName.includes('SECRET') || varName.includes('PASSWORD')) {
      if (value.length < 16) {
        validation.security.push(`${varName} is too short (minimum 16 characters)`);
      }
      
      if (varName === 'JWT_SECRET' && value.length < 32) {
        validation.critical.push(`JWT_SECRET must be at least 32 characters`);
      }
      
      // Check for common weak values
      const weakValues = ['password', '123456', 'secret', 'admin'];
      if (weakValues.some(weak => value.toLowerCase().includes(weak))) {
        validation.security.push(`${varName} contains common weak pattern`);
      }
    }
  }

  validateSpecificConfigs(config, validation) {
    // URL validations
    Object.keys(config).forEach(key => {
      const variable = config[key];
      
      if (key.includes('URL') && variable.value && !variable.hasPlaceholder) {
        if (!this.isValidUrl(variable.value)) {
          validation.warnings.push(`${key} is not a valid URL`);
        }
      }
      
      if (key.includes('EMAIL') && variable.value && !variable.hasPlaceholder) {
        if (!this.isValidEmail(variable.value)) {
          validation.warnings.push(`${key} is not a valid email`);
        }
      }
    });

    // Check for environment consistency
    const frontendApiUrl = config['VITE_API_BASE_URL']?.value;
    const backendPort = config['PORT']?.value;
    
    if (frontendApiUrl && backendPort && !frontendApiUrl.includes(backendPort)) {
      validation.warnings.push('Frontend API URL and backend PORT may be inconsistent');
    }
  }

  isValidUrl(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  generateReport() {
    this.log('blue', '\n📊 Environment Validation Report');
    this.log('blue', '=====================================');

    let totalIssues = 0;

    this.validatedConfigs.forEach(({ file, validation }) => {
      console.log(`\n${this.colors.cyan}📄 ${file}${this.colors.reset}`);
      
      const issues = [
        ...validation.critical,
        ...validation.missing,
        ...validation.security,
        ...validation.warnings,
      ];

      if (issues.length === 0) {
        this.log('green', '✅ No issues found');
      } else {
        totalIssues += issues.length;
        
        if (validation.critical.length > 0) {
          this.log('red', '❌ Critical Issues:');
          validation.critical.forEach(issue => console.log(`  - ${issue}`));
        }
        
        if (validation.missing.length > 0) {
          this.log('red', '❌ Missing Variables:');
          validation.missing.forEach(issue => console.log(`  - ${issue}`));
        }
        
        if (validation.security.length > 0) {
          this.log('yellow', '🔒 Security Issues:');
          validation.security.forEach(issue => console.log(`  - ${issue}`));
        }
        
        if (validation.warnings.length > 0) {
          this.log('yellow', '⚠️  Warnings:');
          validation.warnings.forEach(issue => console.log(`  - ${issue}`));
        }
      }
    });

    // Summary
    console.log(`\n${this.colors.blue}📋 Summary${this.colors.reset}`);
    console.log(`Files validated: ${this.validatedConfigs.length}`);
    console.log(`Total issues found: ${totalIssues}`);

    if (totalIssues === 0) {
      this.log('green', '🎉 All environment configurations are valid!');
      process.exit(0);
    } else {
      const criticalCount = this.validatedConfigs.reduce(
        (count, { validation }) => count + validation.critical.length + validation.missing.length,
        0
      );
      
      if (criticalCount > 0) {
        this.log('red', `❌ Validation failed with ${criticalCount} critical issues`);
        process.exit(1);
      } else {
        this.log('yellow', `⚠️  Validation completed with ${totalIssues} warnings`);
        process.exit(0);
      }
    }
  }

  generateSecureDefaults() {
    this.log('blue', '🔐 Generating secure default values...');
    
    const secureDefaults = {
      JWT_SECRET: crypto.randomBytes(32).toString('hex'),
      SESSION_SECRET: crypto.randomBytes(32).toString('hex'),
      ENCRYPTION_KEY: crypto.randomBytes(32).toString('hex'),
    };

    console.log('\n🔑 Secure values generated (use these in production):');
    Object.entries(secureDefaults).forEach(([key, value]) => {
      console.log(`${key}=${value}`);
    });

    return secureDefaults;
  }
}

// CLI interface
const args = process.argv.slice(2);
const validator = new EnvironmentValidator();

if (args.includes('--generate-secrets')) {
  validator.generateSecureDefaults();
} else {
  validator.validateEnvironmentFiles();
}

export default EnvironmentValidator;