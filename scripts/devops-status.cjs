#!/usr/bin/env node

// DevOps Status Check Script
const axios = require('axios');

const COLORS = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${COLORS[color]}${message}${COLORS.reset}`);
}

async function checkService(name, url) {
  try {
    const response = await axios.get(url, { timeout: 5000 });
    const status = response.status === 200 ? 'HEALTHY' : 'UNHEALTHY';
    const color = status === 'HEALTHY' ? 'green' : 'red';
    log(`✅ ${name}: ${status}`, color);
    return true;
  } catch (error) {
    log(`❌ ${name}: FAILED - ${error.message}`, 'red');
    return false;
  }
}

async function main() {
  log('🔍 CortexBuild 2.0 - DevOps Status Check', 'bold');
  log('=' * 50, 'blue');
  
  const services = [
    { name: 'Frontend App', url: 'http://localhost:3005' },
    { name: 'API Health', url: 'http://localhost:3001/api/health' },
    { name: 'DevOps Dashboard', url: 'http://localhost:3006' },
    { name: 'DevOps Report API', url: 'http://localhost:3006/devops-report.json' }
  ];
  
  let healthyCount = 0;
  
  log('\n💓 Checking Services...', 'blue');
  for (const service of services) {
    const isHealthy = await checkService(service.name, service.url);
    if (isHealthy) healthyCount++;
  }
  
  const totalServices = services.length;
  const healthPercentage = Math.round((healthyCount / totalServices) * 100);
  
  log('\n📊 SUMMARY:', 'bold');
  log(`Services: ${healthyCount}/${totalServices} healthy (${healthPercentage}%)`, 
    healthPercentage === 100 ? 'green' : healthPercentage >= 75 ? 'yellow' : 'red');
  
  if (healthPercentage === 100) {
    log('\n🎉 All systems operational!', 'green');
  } else if (healthPercentage >= 75) {
    log('\n⚠️ Some services need attention', 'yellow');
  } else {
    log('\n🚨 Critical issues detected', 'red');
  }
  
  log('\n🔗 Access Points:', 'blue');
  log('Frontend: http://localhost:3005/', 'blue');
  log('DevOps Dashboard: http://localhost:3006/', 'blue');
  log('API Health: http://localhost:3001/api/health', 'blue');
}

main().catch(error => {
  log(`\n❌ Status check failed: ${error.message}`, 'red');
  process.exit(1);
});
