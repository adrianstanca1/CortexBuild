#!/usr/bin/env node

// Advanced Performance Monitoring for CortexBuild 2.0
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const COLORS = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

class PerformanceMonitor {
  constructor() {
    this.metrics = {
      timestamp: new Date().toISOString(),
      performance: {},
      trends: {},
      alerts: [],
      recommendations: []
    };
    this.thresholds = {
      frontend: { warning: 1000, critical: 3000 },
      api: { warning: 500, critical: 1500 },
      memory: { warning: 80, critical: 90 },
      cpu: { warning: 70, critical: 85 }
    };
  }

  log(message, color = 'reset') {
    console.log(`${COLORS[color]}${message}${COLORS.reset}`);
  }

  async measureEndpoint(name, url, iterations = 5) {
    const measurements = [];
    this.log(`📊 Testing ${name} (${iterations} iterations)...`, 'blue');
    
    for (let i = 0; i < iterations; i++) {
      try {
        const start = process.hrtime.bigint();
        const response = await axios.get(url, { timeout: 10000 });
        const end = process.hrtime.bigint();
        
        const responseTime = Number(end - start) / 1000000; // Convert to milliseconds
        const size = JSON.stringify(response.data).length;
        
        measurements.push({
          responseTime,
          statusCode: response.status,
          size,
          timestamp: new Date().toISOString()
        });
        
        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        measurements.push({
          responseTime: null,
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    }
    
    return this.analyzePerformance(name, measurements);
  }

  analyzePerformance(name, measurements) {
    const validMeasurements = measurements.filter(m => m.responseTime !== null);
    
    if (validMeasurements.length === 0) {
      return {
        name,
        status: 'FAILED',
        error: 'All requests failed',
        measurements
      };
    }
    
    const responseTimes = validMeasurements.map(m => m.responseTime);
    const avg = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
    const min = Math.min(...responseTimes);
    const max = Math.max(...responseTimes);
    const p95 = this.percentile(responseTimes, 95);
    const p99 = this.percentile(responseTimes, 99);
    
    const analysis = {
      name,
      status: this.getPerformanceStatus(name, avg),
      metrics: {
        average: Math.round(avg * 100) / 100,
        min: Math.round(min * 100) / 100,
        max: Math.round(max * 100) / 100,
        p95: Math.round(p95 * 100) / 100,
        p99: Math.round(p99 * 100) / 100,
        successRate: (validMeasurements.length / measurements.length) * 100,
        totalRequests: measurements.length
      },
      measurements
    };
    
    this.checkThresholds(name, analysis);
    return analysis;
  }

  percentile(arr, p) {
    const sorted = arr.slice().sort((a, b) => a - b);
    const index = (p / 100) * (sorted.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const weight = index % 1;
    
    if (upper >= sorted.length) return sorted[sorted.length - 1];
    return sorted[lower] * (1 - weight) + sorted[upper] * weight;
  }

  getPerformanceStatus(name, avgTime) {
    const threshold = this.thresholds[name] || this.thresholds.api;
    
    if (avgTime > threshold.critical) return 'CRITICAL';
    if (avgTime > threshold.warning) return 'WARNING';
    return 'GOOD';
  }

  checkThresholds(name, analysis) {
    const { average, successRate } = analysis.metrics;
    const threshold = this.thresholds[name] || this.thresholds.api;
    
    if (average > threshold.critical) {
      this.metrics.alerts.push({
        level: 'CRITICAL',
        service: name,
        message: `Response time ${average}ms exceeds critical threshold ${threshold.critical}ms`,
        timestamp: new Date().toISOString()
      });
    } else if (average > threshold.warning) {
      this.metrics.alerts.push({
        level: 'WARNING',
        service: name,
        message: `Response time ${average}ms exceeds warning threshold ${threshold.warning}ms`,
        timestamp: new Date().toISOString()
      });
    }
    
    if (successRate < 95) {
      this.metrics.alerts.push({
        level: 'WARNING',
        service: name,
        message: `Success rate ${successRate}% is below 95%`,
        timestamp: new Date().toISOString()
      });
    }
  }

  generateRecommendations() {
    const performance = this.metrics.performance;
    
    Object.values(performance).forEach(service => {
      if (service.status === 'CRITICAL') {
        this.metrics.recommendations.push({
          service: service.name,
          priority: 'HIGH',
          action: 'Immediate optimization required',
          details: `Average response time ${service.metrics.average}ms is critically high`
        });
      } else if (service.status === 'WARNING') {
        this.metrics.recommendations.push({
          service: service.name,
          priority: 'MEDIUM',
          action: 'Performance optimization recommended',
          details: `Response time ${service.metrics.average}ms could be improved`
        });
      }
      
      if (service.metrics.successRate < 100) {
        this.metrics.recommendations.push({
          service: service.name,
          priority: 'HIGH',
          action: 'Investigate request failures',
          details: `${100 - service.metrics.successRate}% of requests are failing`
        });
      }
    });
  }

  displayResults() {
    this.log('\n🎯 PERFORMANCE ANALYSIS RESULTS', 'bold');
    this.log('=' * 50, 'cyan');
    
    Object.values(this.metrics.performance).forEach(service => {
      const statusColor = service.status === 'GOOD' ? 'green' : 
                         service.status === 'WARNING' ? 'yellow' : 'red';
      
      this.log(`\n📊 ${service.name.toUpperCase()}`, 'bold');
      this.log(`Status: ${service.status}`, statusColor);
      this.log(`Average: ${service.metrics.average}ms`);
      this.log(`Range: ${service.metrics.min}ms - ${service.metrics.max}ms`);
      this.log(`P95: ${service.metrics.p95}ms | P99: ${service.metrics.p99}ms`);
      this.log(`Success Rate: ${service.metrics.successRate}%`);
    });
    
    if (this.metrics.alerts.length > 0) {
      this.log('\n🚨 ALERTS', 'bold');
      this.metrics.alerts.forEach(alert => {
        const color = alert.level === 'CRITICAL' ? 'red' : 'yellow';
        this.log(`${alert.level}: ${alert.message}`, color);
      });
    }
    
    if (this.metrics.recommendations.length > 0) {
      this.log('\n💡 RECOMMENDATIONS', 'bold');
      this.metrics.recommendations.forEach(rec => {
        this.log(`${rec.service} (${rec.priority}): ${rec.action}`, 'cyan');
        this.log(`  └─ ${rec.details}`, 'cyan');
      });
    }
  }

  async saveReport() {
    const reportPath = path.join(__dirname, '..', 'performance-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(this.metrics, null, 2));
    this.log(`\n📋 Performance report saved: ${reportPath}`, 'blue');
  }

  async run() {
    this.log('🚀 CortexBuild 2.0 - Advanced Performance Monitor', 'bold');
    this.log('Starting comprehensive performance analysis...', 'blue');
    
    const endpoints = [
      { name: 'frontend', url: 'http://localhost:3005' },
      { name: 'api', url: 'http://localhost:3001/api/health' },
      { name: 'dashboard', url: 'http://localhost:3006' },
      { name: 'report-api', url: 'http://localhost:3006/devops-report.json' }
    ];
    
    for (const endpoint of endpoints) {
      const result = await this.measureEndpoint(endpoint.name, endpoint.url);
      this.metrics.performance[endpoint.name] = result;
    }
    
    this.generateRecommendations();
    this.displayResults();
    await this.saveReport();
    
    this.log('\n✅ Performance monitoring complete!', 'green');
  }
}

// Run if called directly
if (require.main === module) {
  const monitor = new PerformanceMonitor();
  monitor.run().catch(error => {
    console.error('Performance monitoring failed:', error);
    process.exit(1);
  });
}

module.exports = PerformanceMonitor;
