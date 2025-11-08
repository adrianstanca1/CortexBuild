#!/usr/bin/env node

// DevOps Monitoring Script for CortexBuild 2.0
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const SERVICES = {
  frontend: 'http://localhost:3005',
  api: 'http://localhost:3001/api/health',
  chat: 'http://localhost:3001/api/chat/message?sessionId=monitor',
  admin: 'http://localhost:3001/api/platformAdmin'
};

const COLORS = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

class DevOpsMonitor {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      services: {},
      performance: {},
      errors: []
    };
  }

  log(message, color = 'reset') {
    console.log(`${COLORS[color]}${message}${COLORS.reset}`);
  }

  async checkService(name, url) {
    try {
      const startTime = Date.now();
      const response = await axios.get(url, { timeout: 5000 });
      const responseTime = Date.now() - startTime;
      
      const status = response.status === 200 ? 'HEALTHY' : 'UNHEALTHY';
      const color = status === 'HEALTHY' ? 'green' : 'red';
      
      this.results.services[name] = {
        status,
        responseTime,
        statusCode: response.status,
        url
      };
      
      this.log(`✅ ${name.toUpperCase()}: ${status} (${responseTime}ms)`, color);
      return true;
    } catch (error) {
      this.results.services[name] = {
        status: 'FAILED',
        error: error.message,
        url
      };
      this.results.errors.push(`${name}: ${error.message}`);
      this.log(`❌ ${name.toUpperCase()}: FAILED - ${error.message}`, 'red');
      return false;
    }
  }

  async performanceTest() {
    this.log('\n🔍 Running Performance Tests...', 'blue');
    
    const tests = [
      { name: 'Frontend Load', url: SERVICES.frontend },
      { name: 'API Response', url: SERVICES.api },
      { name: 'Chat API', url: SERVICES.chat }
    ];

    for (const test of tests) {
      try {
        const times = [];
        for (let i = 0; i < 3; i++) {
          const start = Date.now();
          await axios.get(test.url, { timeout: 5000 });
          times.push(Date.now() - start);
        }
        
        const avgTime = Math.round(times.reduce((a, b) => a + b) / times.length);
        const maxTime = Math.max(...times);
        const minTime = Math.min(...times);
        
        this.results.performance[test.name] = {
          average: avgTime,
          min: minTime,
          max: maxTime,
          samples: times
        };
        
        const color = avgTime < 1000 ? 'green' : avgTime < 3000 ? 'yellow' : 'red';
        this.log(`📊 ${test.name}: avg ${avgTime}ms (min: ${minTime}ms, max: ${maxTime}ms)`, color);
      } catch (error) {
        this.log(`❌ ${test.name}: Performance test failed - ${error.message}`, 'red');
      }
    }
  }

  async securityCheck() {
    this.log('\n🛡️ Running Security Checks...', 'blue');
    
    try {
      // Check CORS headers
      const response = await axios.get(SERVICES.api);
      const corsHeader = response.headers['access-control-allow-origin'];
      
      if (corsHeader) {
        this.log('✅ CORS: Configured', 'green');
        this.results.security = { cors: 'enabled' };
      } else {
        this.log('⚠️ CORS: Not detected', 'yellow');
        this.results.security = { cors: 'not_detected' };
      }
    } catch (error) {
      this.log(`❌ Security check failed: ${error.message}`, 'red');
    }
  }

  async integrationTest() {
    this.log('\n🔗 Running Integration Tests...', 'blue');
    
    try {
      // Test chat flow
      const sessionId = 'devops-' + Date.now();
      
      // Send message
      await axios.post('http://localhost:3001/api/chat/message', {
        message: 'DevOps integration test',
        sessionId
      });
      
      // Get messages
      const response = await axios.get(`http://localhost:3001/api/chat/message?sessionId=${sessionId}`);
      
      if (response.data && response.data.messages) {
        this.log('✅ Chat Integration: Working', 'green');
        this.results.integration = { chat: 'working' };
      } else {
        this.log('⚠️ Chat Integration: Limited response', 'yellow');
        this.results.integration = { chat: 'limited' };
      }
    } catch (error) {
      this.log(`❌ Integration test failed: ${error.message}`, 'red');
      this.results.integration = { chat: 'failed', error: error.message };
    }
  }

  generateReport() {
    const reportPath = path.join(__dirname, '..', 'devops-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    
    this.log('\n📋 DevOps Report Generated', 'blue');
    this.log(`Report saved to: ${reportPath}`, 'blue');
    
    // Summary
    const totalServices = Object.keys(this.results.services).length;
    const healthyServices = Object.values(this.results.services).filter(s => s.status === 'HEALTHY').length;
    const healthPercentage = Math.round((healthyServices / totalServices) * 100);
    
    this.log('\n📊 SUMMARY:', 'bold');
    this.log(`Services Health: ${healthyServices}/${totalServices} (${healthPercentage}%)`, 
      healthPercentage === 100 ? 'green' : healthPercentage >= 80 ? 'yellow' : 'red');
    
    if (this.results.errors.length > 0) {
      this.log(`Errors: ${this.results.errors.length}`, 'red');
    } else {
      this.log('Errors: 0', 'green');
    }
  }

  async run() {
    this.log('🚀 CortexBuild 2.0 DevOps Monitor Starting...', 'bold');
    this.log('=' * 50, 'blue');
    
    // Service health checks
    this.log('\n💓 Checking Service Health...', 'blue');
    for (const [name, url] of Object.entries(SERVICES)) {
      await this.checkService(name, url);
    }
    
    // Performance tests
    await this.performanceTest();
    
    // Security checks
    await this.securityCheck();
    
    // Integration tests
    await this.integrationTest();
    
    // Generate report
    this.generateReport();
    
    this.log('\n🎉 DevOps Monitoring Complete!', 'bold');
  }
}

// Run if called directly
if (require.main === module) {
  const monitor = new DevOpsMonitor();
  monitor.run().catch(error => {
    console.error('DevOps Monitor failed:', error);
    process.exit(1);
  });
}

module.exports = DevOpsMonitor;
