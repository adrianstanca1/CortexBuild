#!/usr/bin/env node

// DevOps Summary Dashboard for CortexBuild 2.0
const fs = require('fs');
const path = require('path');

class DevOpsSummary {
  constructor() {
    this.reports = {
      health: this.loadReport('health-report.json'),
      performance: this.loadReport('performance-report.json'),
      security: this.loadReport('security-report.json'),
      devops: this.loadReport('devops-report.json'),
      deployment: this.loadReport('deployment-history.json')
    };
    
    this.summary = {
      timestamp: new Date().toISOString(),
      overall: 'UNKNOWN',
      scores: {},
      recommendations: [],
      alerts: []
    };
  }

  loadReport(filename) {
    try {
      const reportPath = path.join(__dirname, '..', filename);
      if (fs.existsSync(reportPath)) {
        return JSON.parse(fs.readFileSync(reportPath, 'utf8'));
      }
    } catch (error) {
      console.warn(`Failed to load ${filename}: ${error.message}`);
    }
    return null;
  }

  calculateHealthScore() {
    if (!this.reports.health) return 0;
    
    const { summary } = this.reports.health;
    if (!summary) return 0;
    
    const healthPercentage = (summary.healthy / summary.total) * 100;
    const criticalPenalty = summary.critical_failures * 20;
    
    return Math.max(0, healthPercentage - criticalPenalty);
  }

  calculatePerformanceScore() {
    if (!this.reports.performance) return 0;
    
    const performance = this.reports.performance.performance;
    if (!performance) return 0;
    
    let totalScore = 0;
    let serviceCount = 0;
    
    Object.values(performance).forEach(service => {
      if (service.metrics) {
        let serviceScore = 100;
        
        // Penalize based on response time
        if (service.metrics.average > 2000) serviceScore -= 40;
        else if (service.metrics.average > 1000) serviceScore -= 20;
        else if (service.metrics.average > 500) serviceScore -= 10;
        
        // Penalize based on success rate
        if (service.metrics.successRate < 95) serviceScore -= 30;
        else if (service.metrics.successRate < 99) serviceScore -= 10;
        
        totalScore += Math.max(0, serviceScore);
        serviceCount++;
      }
    });
    
    return serviceCount > 0 ? totalScore / serviceCount : 0;
  }

  calculateSecurityScore() {
    if (!this.reports.security) return 0;
    
    const { summary, vulnerabilities } = this.reports.security;
    if (!summary) return 0;
    
    const passPercentage = (summary.passed / summary.total) * 100;
    const criticalPenalty = vulnerabilities ? vulnerabilities.length * 25 : 0;
    const warningPenalty = summary.warnings * 5;
    
    return Math.max(0, passPercentage - criticalPenalty - warningPenalty);
  }

  calculateDeploymentScore() {
    if (!this.reports.deployment || !this.reports.deployment.deploymentHistory) return 0;
    
    const history = this.reports.deployment.deploymentHistory;
    if (history.length === 0) return 50; // Neutral score for no deployments
    
    const recentDeployments = history.slice(-5); // Last 5 deployments
    const successfulDeployments = recentDeployments.filter(d => d.status === 'SUCCESS').length;
    
    return (successfulDeployments / recentDeployments.length) * 100;
  }

  calculateOverallScore() {
    const weights = {
      health: 0.3,
      performance: 0.25,
      security: 0.3,
      deployment: 0.15
    };
    
    this.summary.scores = {
      health: this.calculateHealthScore(),
      performance: this.calculatePerformanceScore(),
      security: this.calculateSecurityScore(),
      deployment: this.calculateDeploymentScore()
    };
    
    const weightedScore = Object.entries(this.summary.scores).reduce((total, [key, score]) => {
      return total + (score * weights[key]);
    }, 0);
    
    return Math.round(weightedScore);
  }

  generateRecommendations() {
    const recommendations = [];
    
    // Health recommendations
    if (this.summary.scores.health < 80) {
      recommendations.push({
        category: 'Health',
        priority: 'HIGH',
        action: 'Fix critical service failures',
        details: 'Some services are not responding correctly'
      });
    }
    
    // Performance recommendations
    if (this.summary.scores.performance < 70) {
      recommendations.push({
        category: 'Performance',
        priority: 'MEDIUM',
        action: 'Optimize slow services',
        details: 'Some services have high response times'
      });
    }
    
    // Security recommendations
    if (this.summary.scores.security < 60) {
      recommendations.push({
        category: 'Security',
        priority: 'CRITICAL',
        action: 'Address security vulnerabilities',
        details: 'Critical security issues detected'
      });
    }
    
    // Deployment recommendations
    if (this.summary.scores.deployment < 80) {
      recommendations.push({
        category: 'Deployment',
        priority: 'MEDIUM',
        action: 'Improve deployment reliability',
        details: 'Recent deployments have failed'
      });
    }
    
    return recommendations;
  }

  generateAlerts() {
    const alerts = [];
    
    // Critical health alerts
    if (this.reports.health && this.reports.health.summary.critical_failures > 0) {
      alerts.push({
        level: 'CRITICAL',
        message: `${this.reports.health.summary.critical_failures} critical services are down`,
        timestamp: new Date().toISOString()
      });
    }
    
    // Security alerts
    if (this.reports.security && this.reports.security.vulnerabilities.length > 0) {
      alerts.push({
        level: 'CRITICAL',
        message: `${this.reports.security.vulnerabilities.length} critical security vulnerabilities detected`,
        timestamp: new Date().toISOString()
      });
    }
    
    // Performance alerts
    if (this.reports.performance && this.reports.performance.alerts) {
      this.reports.performance.alerts.forEach(alert => {
        alerts.push({
          level: alert.level,
          message: alert.message,
          timestamp: alert.timestamp
        });
      });
    }
    
    return alerts;
  }

  getOverallStatus(score) {
    if (score >= 90) return 'EXCELLENT';
    if (score >= 80) return 'GOOD';
    if (score >= 70) return 'FAIR';
    if (score >= 60) return 'POOR';
    return 'CRITICAL';
  }

  displaySummary() {
    const overallScore = this.calculateOverallScore();
    this.summary.overall = this.getOverallStatus(overallScore);
    this.summary.recommendations = this.generateRecommendations();
    this.summary.alerts = this.generateAlerts();
    
    const colors = {
      EXCELLENT: '\x1b[32m',
      GOOD: '\x1b[32m',
      FAIR: '\x1b[33m',
      POOR: '\x1b[31m',
      CRITICAL: '\x1b[35m',
      reset: '\x1b[0m',
      bold: '\x1b[1m'
    };
    
    console.log(`\n${colors.bold}🚀 CORTEXBUILD 2.0 - DEVOPS SUMMARY${colors.reset}`);
    console.log('=' * 60);
    
    const statusColor = colors[this.summary.overall] || colors.reset;
    console.log(`\n${colors.bold}Overall Status: ${statusColor}${this.summary.overall} (${overallScore}/100)${colors.reset}`);
    
    console.log(`\n📊 Component Scores:`);
    console.log(`  Health:      ${this.summary.scores.health.toFixed(1)}/100`);
    console.log(`  Performance: ${this.summary.scores.performance.toFixed(1)}/100`);
    console.log(`  Security:    ${this.summary.scores.security.toFixed(1)}/100`);
    console.log(`  Deployment:  ${this.summary.scores.deployment.toFixed(1)}/100`);
    
    if (this.summary.alerts.length > 0) {
      console.log(`\n🚨 Active Alerts (${this.summary.alerts.length}):`);
      this.summary.alerts.forEach(alert => {
        const alertColor = alert.level === 'CRITICAL' ? colors.CRITICAL : colors.POOR;
        console.log(`  ${alertColor}${alert.level}: ${alert.message}${colors.reset}`);
      });
    }
    
    if (this.summary.recommendations.length > 0) {
      console.log(`\n💡 Recommendations (${this.summary.recommendations.length}):`);
      this.summary.recommendations.forEach(rec => {
        const priorityColor = rec.priority === 'CRITICAL' ? colors.CRITICAL : 
                             rec.priority === 'HIGH' ? colors.POOR : colors.FAIR;
        console.log(`  ${priorityColor}${rec.priority}: ${rec.action}${colors.reset}`);
        console.log(`    └─ ${rec.details}`);
      });
    }
    
    console.log(`\n📋 Report Details:`);
    console.log(`  Health Report:      ${this.reports.health ? '✅ Available' : '❌ Missing'}`);
    console.log(`  Performance Report: ${this.reports.performance ? '✅ Available' : '❌ Missing'}`);
    console.log(`  Security Report:    ${this.reports.security ? '✅ Available' : '❌ Missing'}`);
    console.log(`  DevOps Report:      ${this.reports.devops ? '✅ Available' : '❌ Missing'}`);
    console.log(`  Deployment History: ${this.reports.deployment ? '✅ Available' : '❌ Missing'}`);
    
    console.log(`\n🔗 Quick Actions:`);
    console.log(`  npm run devops:health      - Run health checks`);
    console.log(`  npm run devops:performance - Run performance analysis`);
    console.log(`  npm run devops:security    - Run security scan`);
    console.log(`  npm run devops:dashboard   - Open monitoring dashboard`);
    
    console.log('\n');
  }

  saveSummary() {
    const summaryPath = path.join(__dirname, '..', 'devops-summary.json');
    fs.writeFileSync(summaryPath, JSON.stringify(this.summary, null, 2));
    console.log(`📋 DevOps summary saved: ${summaryPath}`);
  }

  async run() {
    this.displaySummary();
    this.saveSummary();
    return this.summary;
  }
}

// Run if called directly
if (require.main === module) {
  const summary = new DevOpsSummary();
  summary.run().catch(error => {
    console.error('DevOps summary failed:', error);
    process.exit(1);
  });
}

module.exports = DevOpsSummary;
