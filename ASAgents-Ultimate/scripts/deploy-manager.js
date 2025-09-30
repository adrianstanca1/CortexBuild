#!/usr/bin/env node

/**
 * ASAgents Platform - Deployment Configuration Manager
 * Manages deployment configurations across multiple platforms
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class DeploymentManager {
  constructor() {
    this.projectRoot = path.join(__dirname, '..');
    this.deploymentConfigs = new Map();
    this.loadConfigurations();
  }

  // Color codes for output
  colors = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    purple: '\x1b[35m',
    reset: '\x1b[0m',
  };

  log(level, message) {
    const timestamp = new Date().toISOString();
    const color = this.colors[level] || this.colors.reset;
    console.log(`${color}[${timestamp}] ${message}${this.colors.reset}`);
  }

  loadConfigurations() {
    // Vercel configuration
    this.deploymentConfigs.set('vercel', {
      name: 'Vercel',
      type: 'serverless',
      buildCommand: 'npm run build:production',
      outputDirectory: 'dist',
      envFile: '.env.production',
      healthCheckUrl: (domain) => `https://${domain}/health`,
      deployCommand: 'vercel --prod',
      requirements: ['vercel-cli', 'VERCEL_TOKEN'],
      supports: ['frontend', 'api-routes'],
    });

    // Railway configuration
    this.deploymentConfigs.set('railway', {
      name: 'Railway',
      type: 'container',
      buildCommand: 'npm run build:production',
      outputDirectory: 'dist',
      envFile: '.env.production',
      healthCheckUrl: (domain) => `https://${domain}/health`,
      deployCommand: 'railway up --detach',
      requirements: ['railway-cli', 'RAILWAY_TOKEN'],
      supports: ['frontend', 'backend', 'database'],
    });

    // IONOS configuration
    this.deploymentConfigs.set('ionos', {
      name: 'IONOS Webspace',
      type: 'traditional-hosting',
      buildCommand: 'npm run build:production',
      outputDirectory: 'dist',
      envFile: '.env.production',
      healthCheckUrl: (domain) => `https://${domain}/health`,
      deployCommand: 'node scripts/deploy.js production ionos',
      requirements: ['sftp-credentials'],
      supports: ['frontend'],
    });

    // Docker configuration
    this.deploymentConfigs.set('docker', {
      name: 'Docker/Container',
      type: 'container',
      buildCommand: 'docker build -f Dockerfile.frontend.production .',
      outputDirectory: 'docker-image',
      envFile: '.env.production',
      healthCheckUrl: (domain) => `http://${domain}:80/health`,
      deployCommand: 'docker-compose -f docker-compose.production.yml up -d',
      requirements: ['docker', 'docker-compose'],
      supports: ['frontend', 'backend', 'database'],
    });

    this.log('blue', `Loaded ${this.deploymentConfigs.size} deployment configurations`);
  }

  async validatePlatform(platformName) {
    const config = this.deploymentConfigs.get(platformName);
    
    if (!config) {
      throw new Error(`Unknown deployment platform: ${platformName}`);
    }

    this.log('cyan', `Validating ${config.name} deployment requirements...`);

    const validation = {
      platform: platformName,
      config,
      requirements: [],
      environment: [],
      errors: [],
      warnings: [],
    };

    // Check requirements
    for (const requirement of config.requirements) {
      if (requirement === 'vercel-cli') {
        const hasVercel = await this.checkCommand('vercel --version');
        validation.requirements.push({
          name: 'Vercel CLI',
          satisfied: hasVercel,
          command: 'npm install -g vercel',
        });
      } else if (requirement === 'railway-cli') {
        const hasRailway = await this.checkCommand('railway --version');
        validation.requirements.push({
          name: 'Railway CLI',
          satisfied: hasRailway,
          command: 'curl -fsSL https://railway.app/install.sh | sh',
        });
      } else if (requirement === 'docker') {
        const hasDocker = await this.checkCommand('docker --version');
        validation.requirements.push({
          name: 'Docker',
          satisfied: hasDocker,
          command: 'Install Docker Desktop',
        });
      } else if (requirement === 'docker-compose') {
        const hasCompose = await this.checkCommand('docker-compose --version');
        validation.requirements.push({
          name: 'Docker Compose',
          satisfied: hasCompose,
          command: 'Install Docker Compose',
        });
      }
    }

    // Check environment file
    const envPath = path.join(this.projectRoot, config.envFile);
    if (fs.existsSync(envPath)) {
      validation.environment.push({
        name: config.envFile,
        exists: true,
        path: envPath,
      });
    } else {
      validation.errors.push(`Missing environment file: ${config.envFile}`);
    }

    // Check build directory
    const buildPath = path.join(this.projectRoot, config.outputDirectory);
    const hasBuild = fs.existsSync(buildPath);
    
    if (!hasBuild && config.outputDirectory !== 'docker-image') {
      validation.warnings.push(`Build directory not found: ${config.outputDirectory}. Run build command first.`);
    }

    return validation;
  }

  async checkCommand(command) {
    try {
      const { execSync } = await import('child_process');
      execSync(command, { stdio: 'ignore' });
      return true;
    } catch {
      return false;
    }
  }

  async deploy(platformName, options = {}) {
    const validation = await this.validatePlatform(platformName);
    
    // Report validation results
    this.reportValidation(validation);
    
    // Check for critical errors
    const criticalErrors = validation.errors.length > 0;
    const missingRequirements = validation.requirements.filter(req => !req.satisfied);
    
    if (criticalErrors || (missingRequirements.length > 0 && !options.force)) {
      this.log('red', '❌ Deployment validation failed');
      
      if (missingRequirements.length > 0) {
        this.log('yellow', '\nMissing requirements:');
        missingRequirements.forEach(req => {
          console.log(`  - ${req.name}: ${req.command}`);
        });
      }
      
      if (criticalErrors) {
        this.log('red', '\nCritical errors:');
        validation.errors.forEach(error => {
          console.log(`  - ${error}`);
        });
      }
      
      if (!options.force) {
        process.exit(1);
      }
    }

    // Proceed with deployment
    await this.executeDeployment(platformName, validation.config, options);
  }

  reportValidation(validation) {
    this.log('blue', `\n📋 Deployment Validation Report: ${validation.config.name}`);
    this.log('blue', '=====================================');

    // Requirements
    console.log(`\n${this.colors.cyan}🔧 Requirements:${this.colors.reset}`);
    validation.requirements.forEach(req => {
      const icon = req.satisfied ? '✅' : '❌';
      console.log(`  ${icon} ${req.name}`);
    });

    // Environment
    console.log(`\n${this.colors.cyan}🌍 Environment:${this.colors.reset}`);
    validation.environment.forEach(env => {
      const icon = env.exists ? '✅' : '❌';
      console.log(`  ${icon} ${env.name}`);
    });

    // Warnings
    if (validation.warnings.length > 0) {
      console.log(`\n${this.colors.yellow}⚠️  Warnings:${this.colors.reset}`);
      validation.warnings.forEach(warning => {
        console.log(`  - ${warning}`);
      });
    }

    // Errors
    if (validation.errors.length > 0) {
      console.log(`\n${this.colors.red}❌ Errors:${this.colors.reset}`);
      validation.errors.forEach(error => {
        console.log(`  - ${error}`);
      });
    }
  }

  async executeDeployment(platformName, config, options) {
    this.log('purple', `🚀 Starting deployment to ${config.name}...`);
    
    try {
      const { execSync } = await import('child_process');
      
      // Build if needed
      if (!options.skipBuild) {
        this.log('blue', 'Building application...');
        execSync(config.buildCommand, { 
          stdio: 'inherit',
          cwd: this.projectRoot 
        });
        this.log('green', '✅ Build completed');
      }

      // Execute deployment
      this.log('purple', `Deploying to ${config.name}...`);
      execSync(config.deployCommand, { 
        stdio: 'inherit',
        cwd: this.projectRoot 
      });
      
      this.log('green', `✅ Deployment to ${config.name} completed successfully!`);
      
      // Health check (if URL provided)
      if (options.healthCheck && options.url) {
        await this.performHealthCheck(config, options.url);
      }
      
    } catch (error) {
      this.log('red', `❌ Deployment failed: ${error.message}`);
      process.exit(1);
    }
  }

  async performHealthCheck(config, url) {
    this.log('cyan', 'Performing post-deployment health check...');
    
    const healthUrl = config.healthCheckUrl(url);
    const maxAttempts = 10;
    let attempts = 0;
    
    while (attempts < maxAttempts) {
      try {
        const fetch = (await import('node-fetch')).default;
        const response = await fetch(healthUrl, { timeout: 5000 });
        
        if (response.ok) {
          this.log('green', '✅ Health check passed');
          return true;
        }
        
        attempts++;
        this.log('yellow', `Health check attempt ${attempts}/${maxAttempts} failed, retrying...`);
        await this.sleep(5000);
        
      } catch (error) {
        attempts++;
        if (attempts >= maxAttempts) {
          this.log('red', `❌ Health check failed after ${maxAttempts} attempts`);
          return false;
        }
        await this.sleep(5000);
      }
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  listPlatforms() {
    this.log('blue', '📋 Available Deployment Platforms:');
    this.log('blue', '=====================================');
    
    this.deploymentConfigs.forEach((config, name) => {
      console.log(`\n${this.colors.cyan}${config.name} (${name})${this.colors.reset}`);
      console.log(`  Type: ${config.type}`);
      console.log(`  Supports: ${config.supports.join(', ')}`);
      console.log(`  Requirements: ${config.requirements.join(', ')}`);
    });
  }

  generateDeploymentScript(platformName) {
    const config = this.deploymentConfigs.get(platformName);
    
    if (!config) {
      throw new Error(`Unknown platform: ${platformName}`);
    }

    const scriptContent = `#!/bin/bash
# Generated deployment script for ${config.name}
# Generated at: ${new Date().toISOString()}

set -e

echo "🚀 Deploying to ${config.name}..."

# Build application
echo "📦 Building application..."
${config.buildCommand}

# Deploy
echo "🚀 Deploying..."
${config.deployCommand}

echo "✅ Deployment completed!"
`;

    const scriptPath = path.join(this.projectRoot, 'scripts', `deploy-${platformName}.sh`);
    fs.writeFileSync(scriptPath, scriptContent);
    fs.chmodSync(scriptPath, '755');
    
    this.log('green', `✅ Generated deployment script: ${scriptPath}`);
  }
}

// CLI interface
const args = process.argv.slice(2);
const manager = new DeploymentManager();

const command = args[0];
const platform = args[1];
const options = {
  force: args.includes('--force'),
  skipBuild: args.includes('--skip-build'),
  healthCheck: args.includes('--health-check'),
  url: args.find(arg => arg.startsWith('--url='))?.split('=')[1],
};

switch (command) {
  case 'deploy':
    if (!platform) {
      console.error('Usage: node deploy-manager.js deploy <platform> [options]');
      process.exit(1);
    }
    manager.deploy(platform, options);
    break;

  case 'validate':
    if (!platform) {
      console.error('Usage: node deploy-manager.js validate <platform>');
      process.exit(1);
    }
    manager.validatePlatform(platform).then(validation => {
      manager.reportValidation(validation);
    });
    break;

  case 'list':
    manager.listPlatforms();
    break;

  case 'generate':
    if (!platform) {
      console.error('Usage: node deploy-manager.js generate <platform>');
      process.exit(1);
    }
    manager.generateDeploymentScript(platform);
    break;

  default:
    console.log(`
ASAgents Deployment Manager

Usage:
  node deploy-manager.js deploy <platform> [options]    - Deploy to platform
  node deploy-manager.js validate <platform>           - Validate platform setup
  node deploy-manager.js list                          - List available platforms
  node deploy-manager.js generate <platform>           - Generate deployment script

Platforms: vercel, railway, ionos, docker

Options:
  --force                - Continue despite validation errors
  --skip-build          - Skip build step
  --health-check        - Perform health check after deployment
  --url=<domain>        - URL for health check

Examples:
  node deploy-manager.js deploy vercel --health-check --url=myapp.vercel.app
  node deploy-manager.js validate railway
  node deploy-manager.js generate docker
`);
    break;
}

export default DeploymentManager;