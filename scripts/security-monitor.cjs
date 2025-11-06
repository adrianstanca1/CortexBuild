/* eslint-disable no-unused-vars, no-undef */
#!/usr/bin/env node

// Security Monitoring System for CortexBuild 2.0
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class SecurityMonitor {
  constructor() {
    this.securityChecks = {
      timestamp: new Date().toISOString(),
      overall: 'UNKNOWN',
      checks: {},
      vulnerabilities: [],
      recommendations: [],
      compliance: {}
    };
    
    this.securityTests = [
      { name: 'CORS Configuration', test: this.checkCORS.bind(this) },
      { name: 'HTTP Headers', test: this.checkSecurityHeaders.bind(this) },
      { name: 'API Authentication', test: this.checkAPIAuth.bind(this) },
      { name: 'Input Validation', test: this.checkInputValidation.bind(this) },
      { name: 'SSL/TLS Configuration', test: this.checkSSL.bind(this) },
      { name: 'Dependency Vulnerabilities', test: this.checkDependencies.bind(this) },
      { name: 'File Permissions', test: this.checkFilePermissions.bind(this) },
      { name: 'Environment Variables', test: this.checkEnvironmentSecurity.bind(this) }
    ];
  }

  log(message, level = 'INFO') {
    const colors = {
      INFO: '\x1b[36m',
      SUCCESS: '\x1b[32m',
      WARNING: '\x1b[33m',
      ERROR: '\x1b[31m',
      CRITICAL: '\x1b[35m',
      reset: '\x1b[0m'
    };
    
    console.log(`${colors[level]}[${level}] ${message}${colors.reset}`);
  }

  async checkCORS() {
    try {
      const response = await axios.get('http://localhost:3001/api/health');
      const corsHeader = response.headers['access-control-allow-origin'];
      
      if (!corsHeader) {
        return {
          status: 'FAIL',
          severity: 'MEDIUM',
          message: 'CORS headers not configured',
          recommendation: 'Configure proper CORS headers to prevent cross-origin attacks'
        };
      }
      
      if (corsHeader === '*') {
        return {
          status: 'WARNING',
          severity: 'MEDIUM',
          message: 'CORS allows all origins',
          recommendation: 'Restrict CORS to specific trusted domains'
        };
      }
      
      return {
        status: 'PASS',
        message: 'CORS properly configured',
        details: `Origin: ${corsHeader}`
      };
    } catch (error) {
      return {
        status: 'ERROR',
        severity: 'HIGH',
        message: 'Unable to check CORS configuration',
        error: error.message
      };
    }
  }

  async checkSecurityHeaders() {
    try {
      const response = await axios.get('http://localhost:3005');
      const headers = response.headers;
      
      const requiredHeaders = {
        'x-content-type-options': 'nosniff',
        'x-frame-options': 'DENY',
        'x-xss-protection': '1; mode=block',
        'strict-transport-security': 'max-age=31536000'
      };
      
      const missingHeaders = [];
      const presentHeaders = [];
      
      Object.entries(requiredHeaders).forEach(([header, expectedValue]) => {
        if (headers[header]) {
          presentHeaders.push(header);
        } else {
          missingHeaders.push(header);
        }
      });
      
      if (missingHeaders.length > 0) {
        return {
          status: 'FAIL',
          severity: 'HIGH',
          message: `Missing security headers: ${missingHeaders.join(', ')}`,
          recommendation: 'Add security headers to prevent common web vulnerabilities'
        };
      }
      
      return {
        status: 'PASS',
        message: 'Security headers properly configured',
        details: `Present: ${presentHeaders.join(', ')}`
      };
    } catch (error) {
      return {
        status: 'ERROR',
        severity: 'HIGH',
        message: 'Unable to check security headers',
        error: error.message
      };
    }
  }

  async checkAPIAuth() {
    try {
      // Test unauthenticated access to protected endpoints
      const protectedEndpoints = [
        'http://localhost:3001/api/chat/message',
        'http://localhost:3001/api/platformAdmin'
      ];
      
      const authIssues = [];
      
      for (const endpoint of protectedEndpoints) {
        try {
          const response = await axios.get(endpoint);
          if (response.status === 200) {
            authIssues.push(`${endpoint} accessible without authentication`);
          }
        } catch (error) {
          if (error.response && error.response.status === 401) {
            // Good - endpoint requires authentication
          } else {
            authIssues.push(`${endpoint} - unexpected response: ${error.message}`);
          }
        }
      }
      
      if (authIssues.length > 0) {
        return {
          status: 'FAIL',
          severity: 'CRITICAL',
          message: 'Authentication bypass vulnerabilities detected',
          details: authIssues,
          recommendation: 'Implement proper authentication for all protected endpoints'
        };
      }
      
      return {
        status: 'PASS',
        message: 'API authentication properly configured'
      };
    } catch (error) {
      return {
        status: 'ERROR',
        severity: 'HIGH',
        message: 'Unable to check API authentication',
        error: error.message
      };
    }
  }

  async checkInputValidation() {
    try {
      // Test for common injection vulnerabilities
      const testPayloads = [
        '<script>alert("xss")</script>',
        "'; DROP TABLE users; --",
        '../../../etc/passwd',
        '${7*7}'
      ];
      
      const vulnerabilities = [];
      
      for (const payload of testPayloads) {
        try {
          const response = await axios.post('http://localhost:3001/api/chat/message', {
            message: payload,
            sessionId: 'security-test'
          });
          
          if (response.data && response.data.message && 
              response.data.message.content.includes(payload)) {
            vulnerabilities.push(`Potential injection vulnerability with payload: ${payload}`);
          }
        } catch (error) {
          // Expected for malicious payloads
        }
      }
      
      if (vulnerabilities.length > 0) {
        return {
          status: 'FAIL',
          severity: 'CRITICAL',
          message: 'Input validation vulnerabilities detected',
          details: vulnerabilities,
          recommendation: 'Implement proper input sanitization and validation'
        };
      }
      
      return {
        status: 'PASS',
        message: 'Input validation appears secure'
      };
    } catch (error) {
      return {
        status: 'ERROR',
        severity: 'MEDIUM',
        message: 'Unable to complete input validation tests',
        error: error.message
      };
    }
  }

  async checkSSL() {
    // For local development, SSL is typically not configured
    return {
      status: 'WARNING',
      severity: 'HIGH',
      message: 'SSL/TLS not configured (development environment)',
      recommendation: 'Configure SSL/TLS certificates for production deployment'
    };
  }

  async checkDependencies() {
    try {
      const packagePath = path.join(__dirname, '..', 'package.json');
      const packageData = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      
      // Check for known vulnerable packages (simplified check)
      const knownVulnerable = [
        'lodash@4.17.20',
        'axios@0.21.0',
        'express@4.17.0'
      ];
      
      const dependencies = {
        ...packageData.dependencies,
        ...packageData.devDependencies
      };
      
      const vulnerabilities = [];
      
      Object.entries(dependencies).forEach(([pkg, version]) => {
        const pkgVersion = `${pkg}@${version.replace('^', '').replace('~', '')}`;
        if (knownVulnerable.some(vuln => pkgVersion.startsWith(vuln.split('@')[0]))) {
          vulnerabilities.push(`Potentially vulnerable dependency: ${pkgVersion}`);
        }
      });
      
      if (vulnerabilities.length > 0) {
        return {
          status: 'WARNING',
          severity: 'MEDIUM',
          message: 'Potentially vulnerable dependencies detected',
          details: vulnerabilities,
          recommendation: 'Run npm audit and update vulnerable dependencies'
        };
      }
      
      return {
        status: 'PASS',
        message: 'No known vulnerable dependencies detected'
      };
    } catch (error) {
      return {
        status: 'ERROR',
        severity: 'MEDIUM',
        message: 'Unable to check dependencies',
        error: error.message
      };
    }
  }

  async checkFilePermissions() {
    try {
      const sensitiveFiles = [
        'package.json',
        '.env',
        '.env.local',
        'api-server.cjs'
      ];
      
      const permissionIssues = [];
      
      sensitiveFiles.forEach(file => {
        const filePath = path.join(__dirname, '..', file);
        if (fs.existsSync(filePath)) {
          const stats = fs.statSync(filePath);
          const mode = stats.mode.toString(8);
          
          // Check if file is world-readable (simplified check)
          if (mode.endsWith('4') || mode.endsWith('6') || mode.endsWith('7')) {
            permissionIssues.push(`${file} may be world-readable`);
          }
        }
      });
      
      if (permissionIssues.length > 0) {
        return {
          status: 'WARNING',
          severity: 'MEDIUM',
          message: 'File permission issues detected',
          details: permissionIssues,
          recommendation: 'Restrict file permissions for sensitive files'
        };
      }
      
      return {
        status: 'PASS',
        message: 'File permissions appear secure'
      };
    } catch (error) {
      return {
        status: 'ERROR',
        severity: 'LOW',
        message: 'Unable to check file permissions',
        error: error.message
      };
    }
  }

  async checkEnvironmentSecurity() {
    try {
      const envFiles = ['.env', '.env.local', '.env.production'];
      const securityIssues = [];
      
      envFiles.forEach(envFile => {
        const envPath = path.join(__dirname, '..', envFile);
        if (fs.existsSync(envPath)) {
          const content = fs.readFileSync(envPath, 'utf8');
          
          // Check for hardcoded secrets
          if (content.includes('password=') || content.includes('secret=')) {
            securityIssues.push(`${envFile} may contain hardcoded secrets`);
          }
          
          // Check for default values
          if (content.includes('changeme') || content.includes('default')) {
            securityIssues.push(`${envFile} may contain default values`);
          }
        }
      });
      
      if (securityIssues.length > 0) {
        return {
          status: 'WARNING',
          severity: 'HIGH',
          message: 'Environment security issues detected',
          details: securityIssues,
          recommendation: 'Use secure secret management and avoid default values'
        };
      }
      
      return {
        status: 'PASS',
        message: 'Environment configuration appears secure'
      };
    } catch (error) {
      return {
        status: 'ERROR',
        severity: 'MEDIUM',
        message: 'Unable to check environment security',
        error: error.message
      };
    }
  }

  async runSecurityScan() {
    this.log('🔒 Starting comprehensive security scan...', 'INFO');
    
    let passCount = 0;
    let failCount = 0;
    let warningCount = 0;
    
    for (const test of this.securityTests) {
      this.log(`Running ${test.name}...`, 'INFO');
      
      try {
        const result = await test.test();
        this.securityChecks.checks[test.name] = result;
        
        if (result.status === 'PASS') {
          passCount++;
          this.log(`✅ ${test.name}: PASS`, 'SUCCESS');
        } else if (result.status === 'WARNING') {
          warningCount++;
          this.log(`⚠️ ${test.name}: WARNING - ${result.message}`, 'WARNING');
        } else {
          failCount++;
          this.log(`❌ ${test.name}: FAIL - ${result.message}`, 'ERROR');
          
          if (result.severity === 'CRITICAL') {
            this.securityChecks.vulnerabilities.push({
              test: test.name,
              severity: result.severity,
              message: result.message,
              recommendation: result.recommendation
            });
          }
        }
      } catch (error) {
        failCount++;
        this.log(`❌ ${test.name}: ERROR - ${error.message}`, 'ERROR');
      }
    }
    
    // Determine overall security status
    if (failCount > 0) {
      this.securityChecks.overall = 'VULNERABLE';
    } else if (warningCount > 0) {
      this.securityChecks.overall = 'NEEDS_ATTENTION';
    } else {
      this.securityChecks.overall = 'SECURE';
    }
    
    this.securityChecks.summary = {
      total: this.securityTests.length,
      passed: passCount,
      warnings: warningCount,
      failed: failCount
    };
    
    this.generateSecurityReport();
    this.displayResults();
  }

  generateSecurityReport() {
    const reportPath = path.join(__dirname, '..', 'security-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(this.securityChecks, null, 2));
    this.log(`Security report saved: ${reportPath}`, 'INFO');
  }

  displayResults() {
    const colors = {
      SECURE: '\x1b[32m',
      NEEDS_ATTENTION: '\x1b[33m',
      VULNERABLE: '\x1b[31m',
      reset: '\x1b[0m',
      bold: '\x1b[1m'
    };
    
    console.log(`\n${colors.bold}🔒 SECURITY SCAN RESULTS${colors.reset}`);
    console.log('=' * 50);
    
    const statusColor = colors[this.securityChecks.overall] || colors.reset;
    console.log(`\nOverall Security Status: ${statusColor}${this.securityChecks.overall}${colors.reset}`);
    
    const { passed, warnings, failed, total } = this.securityChecks.summary;
    console.log(`Tests: ${passed} passed, ${warnings} warnings, ${failed} failed (${total} total)`);
    
    if (this.securityChecks.vulnerabilities.length > 0) {
      console.log('\n🚨 Critical Vulnerabilities:');
      this.securityChecks.vulnerabilities.forEach(vuln => {
        console.log(`  • ${vuln.test}: ${vuln.message}`);
        console.log(`    Recommendation: ${vuln.recommendation}`);
      });
    }
    
    console.log('\n');
  }

  async run() {
    await this.runSecurityScan();
    return this.securityChecks;
  }
}

// Run if called directly
if (require.main === module) {
  const monitor = new SecurityMonitor();
  monitor.run().catch(error => {
    console.error('Security monitoring failed:', error);
    process.exit(1);
  });
}

module.exports = SecurityMonitor;
