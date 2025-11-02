#!/usr/bin/env node

// Automated Health Check System for CortexBuild 2.0
const axios = require('axios');
const fs = require('fs');
const path = require('path');

class HealthChecker {
  constructor() {
    this.services = [
      {
        name: 'Frontend Application',
        url: 'http://localhost:3005',
        type: 'web',
        critical: true,
        timeout: 5000
      },
      {
        name: 'API Health Endpoint',
        url: 'http://localhost:3001/api/health',
        type: 'api',
        critical: true,
        timeout: 3000,
        expectedResponse: { status: 'ok' }
      },
      {
        name: 'DevOps Dashboard',
        url: 'http://localhost:3006',
        type: 'web',
        critical: false,
        timeout: 5000
      },
      {
        name: 'DevOps Report API',
        url: 'http://localhost:3006/devops-report.json',
        type: 'api',
        critical: false,
        timeout: 3000
      },
      {
        name: 'Chat API',
        url: 'http://localhost:3001/api/chat/message?sessionId=health-check',
        type: 'api',
        critical: false,
        timeout: 3000,
        expectedStatus: [200, 401] // 401 is acceptable for auth-required endpoints
      }
    ];
    
    this.results = {
      timestamp: new Date().toISOString(),
      overall: 'UNKNOWN',
      services: {},
      summary: {
        total: this.services.length,
        healthy: 0,
        unhealthy: 0,
        critical_failures: 0
      },
      uptime: this.calculateUptime()
    };
  }

  calculateUptime() {
    // Simple uptime calculation based on process start time
    const uptimeSeconds = process.uptime();
    const hours = Math.floor(uptimeSeconds / 3600);
    const minutes = Math.floor((uptimeSeconds % 3600) / 60);
    const seconds = Math.floor(uptimeSeconds % 60);
    
    return {
      seconds: uptimeSeconds,
      formatted: `${hours}h ${minutes}m ${seconds}s`
    };
  }

  async checkService(service) {
    const startTime = Date.now();
    
    try {
      const response = await axios.get(service.url, {
        timeout: service.timeout,
        validateStatus: (status) => {
          if (service.expectedStatus) {
            return service.expectedStatus.includes(status);
          }
          return status >= 200 && status < 300;
        }
      });
      
      const responseTime = Date.now() - startTime;
      const isHealthy = this.validateResponse(service, response);
      
      return {
        name: service.name,
        status: isHealthy ? 'HEALTHY' : 'UNHEALTHY',
        responseTime,
        statusCode: response.status,
        critical: service.critical,
        url: service.url,
        lastCheck: new Date().toISOString(),
        details: isHealthy ? 'Service responding correctly' : 'Response validation failed'
      };
      
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      return {
        name: service.name,
        status: 'FAILED',
        responseTime,
        critical: service.critical,
        url: service.url,
        lastCheck: new Date().toISOString(),
        error: error.message,
        details: this.categorizeError(error)
      };
    }
  }

  validateResponse(service, response) {
    if (service.expectedResponse) {
      try {
        const data = response.data;
        return Object.keys(service.expectedResponse).every(key => 
          data[key] === service.expectedResponse[key]
        );
      } catch {
        return false;
      }
    }
    return true;
  }

  categorizeError(error) {
    if (error.code === 'ECONNREFUSED') {
      return 'Service not running or connection refused';
    } else if (error.code === 'ETIMEDOUT') {
      return 'Request timeout - service may be overloaded';
    } else if (error.response) {
      return `HTTP ${error.response.status} - ${error.response.statusText}`;
    } else {
      return 'Network or configuration error';
    }
  }

  async runHealthChecks() {
    console.log('🔍 Running health checks...');
    
    const promises = this.services.map(service => this.checkService(service));
    const results = await Promise.all(promises);
    
    results.forEach(result => {
      this.results.services[result.name] = result;
      
      if (result.status === 'HEALTHY') {
        this.results.summary.healthy++;
      } else {
        this.results.summary.unhealthy++;
        if (result.critical) {
          this.results.summary.critical_failures++;
        }
      }
    });
    
    // Determine overall system health
    if (this.results.summary.critical_failures > 0) {
      this.results.overall = 'CRITICAL';
    } else if (this.results.summary.unhealthy > 0) {
      this.results.overall = 'DEGRADED';
    } else {
      this.results.overall = 'HEALTHY';
    }
  }

  generateHealthReport() {
    const report = {
      ...this.results,
      recommendations: this.generateRecommendations(),
      nextCheck: new Date(Date.now() + 30000).toISOString() // Next check in 30 seconds
    };
    
    const reportPath = path.join(__dirname, '..', 'health-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    return reportPath;
  }

  generateRecommendations() {
    const recommendations = [];
    
    Object.values(this.results.services).forEach(service => {
      if (service.status === 'FAILED' && service.critical) {
        recommendations.push({
          priority: 'CRITICAL',
          service: service.name,
          action: 'Immediate attention required',
          reason: 'Critical service is down'
        });
      } else if (service.status === 'FAILED') {
        recommendations.push({
          priority: 'HIGH',
          service: service.name,
          action: 'Investigate service failure',
          reason: service.details || service.error
        });
      } else if (service.responseTime > 2000) {
        recommendations.push({
          priority: 'MEDIUM',
          service: service.name,
          action: 'Optimize performance',
          reason: `Slow response time: ${service.responseTime}ms`
        });
      }
    });
    
    return recommendations;
  }

  displayResults() {
    const colors = {
      HEALTHY: '\x1b[32m',
      DEGRADED: '\x1b[33m',
      CRITICAL: '\x1b[31m',
      FAILED: '\x1b[31m',
      UNHEALTHY: '\x1b[33m',
      reset: '\x1b[0m',
      bold: '\x1b[1m'
    };
    
    console.log(`\n${colors.bold}🏥 HEALTH CHECK RESULTS${colors.reset}`);
    console.log('=' * 50);
    
    const overallColor = colors[this.results.overall] || colors.reset;
    console.log(`\n${colors.bold}Overall Status: ${overallColor}${this.results.overall}${colors.reset}`);
    console.log(`Uptime: ${this.results.uptime.formatted}`);
    console.log(`Services: ${this.results.summary.healthy}/${this.results.summary.total} healthy`);
    
    if (this.results.summary.critical_failures > 0) {
      console.log(`${colors.CRITICAL}Critical Failures: ${this.results.summary.critical_failures}${colors.reset}`);
    }
    
    console.log('\n📊 Service Details:');
    Object.values(this.results.services).forEach(service => {
      const statusColor = colors[service.status] || colors.reset;
      const criticalMark = service.critical ? ' [CRITICAL]' : '';
      
      console.log(`\n${statusColor}● ${service.name}${criticalMark}${colors.reset}`);
      console.log(`  Status: ${statusColor}${service.status}${colors.reset}`);
      console.log(`  Response: ${service.responseTime}ms`);
      
      if (service.error) {
        console.log(`  Error: ${service.error}`);
      }
      if (service.details) {
        console.log(`  Details: ${service.details}`);
      }
    });
    
    const recommendations = this.generateRecommendations();
    if (recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      recommendations.forEach(rec => {
        const priorityColor = rec.priority === 'CRITICAL' ? colors.CRITICAL : 
                             rec.priority === 'HIGH' ? colors.FAILED : colors.DEGRADED;
        console.log(`${priorityColor}${rec.priority}: ${rec.service} - ${rec.action}${colors.reset}`);
        console.log(`  └─ ${rec.reason}`);
      });
    }
  }

  async run() {
    await this.runHealthChecks();
    this.displayResults();
    const reportPath = this.generateHealthReport();
    
    console.log(`\n📋 Health report saved: ${reportPath}`);
    console.log(`🔄 Next check scheduled in 30 seconds`);
    
    return this.results;
  }
}

// Run if called directly
if (require.main === module) {
  const checker = new HealthChecker();
  checker.run().catch(error => {
    console.error('Health check failed:', error);
    process.exit(1);
  });
}

module.exports = HealthChecker;
