/* eslint-disable no-unused-vars, no-undef */
#!/usr/bin/env node

// DevOps Automation Script for CortexBuild 2.0
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class DevOpsAutomation {
  constructor() {
    this.processes = new Map();
    this.monitoring = false;
    this.config = {
      healthCheckInterval: 30000, // 30 seconds
      performanceCheckInterval: 300000, // 5 minutes
      logRetention: 7, // days
      alertThresholds: {
        responseTime: 2000,
        errorRate: 5,
        downtime: 60000 // 1 minute
      }
    };
    this.logs = [];
  }

  log(message, level = 'INFO') {
    const timestamp = new Date().toISOString();
    const logEntry = { timestamp, level, message };
    this.logs.push(logEntry);
    
    const colors = {
      INFO: '\x1b[36m',
      SUCCESS: '\x1b[32m',
      WARNING: '\x1b[33m',
      ERROR: '\x1b[31m',
      reset: '\x1b[0m'
    };
    
    console.log(`${colors[level] || colors.INFO}[${timestamp}] ${level}: ${message}${colors.reset}`);
    
    // Keep only recent logs
    if (this.logs.length > 1000) {
      this.logs = this.logs.slice(-500);
    }
  }

  async runScript(scriptName, args = []) {
    return new Promise((resolve, reject) => {
      const scriptPath = path.join(__dirname, scriptName);
      const process = spawn('node', [scriptPath, ...args], {
        stdio: 'pipe',
        cwd: path.join(__dirname, '..')
      });
      
      let output = '';
      let error = '';
      
      process.stdout.on('data', (data) => {
        output += data.toString();
      });
      
      process.stderr.on('data', (data) => {
        error += data.toString();
      });
      
      process.on('close', (code) => {
        if (code === 0) {
          resolve({ success: true, output, code });
        } else {
          reject({ success: false, error, output, code });
        }
      });
      
      // Store process reference
      this.processes.set(scriptName, process);
    });
  }

  async startHealthMonitoring() {
    this.log('Starting automated health monitoring...', 'INFO');
    
    const runHealthCheck = async () => {
      try {
        const result = await this.runScript('health-checker.cjs');
        this.log('Health check completed successfully', 'SUCCESS');
        
        // Parse health report for alerts
        await this.checkHealthAlerts();
      } catch (error) {
        this.log(`Health check failed: ${error.error || error.message}`, 'ERROR');
      }
    };
    
    // Run initial check
    await runHealthCheck();
    
    // Schedule recurring checks
    this.healthInterval = setInterval(runHealthCheck, this.config.healthCheckInterval);
    this.log(`Health monitoring scheduled every ${this.config.healthCheckInterval / 1000} seconds`, 'INFO');
  }

  async startPerformanceMonitoring() {
    this.log('Starting automated performance monitoring...', 'INFO');
    
    const runPerformanceCheck = async () => {
      try {
        const result = await this.runScript('performance-monitor.cjs');
        this.log('Performance check completed successfully', 'SUCCESS');
        
        // Parse performance report for alerts
        await this.checkPerformanceAlerts();
      } catch (error) {
        this.log(`Performance check failed: ${error.error || error.message}`, 'ERROR');
      }
    };
    
    // Run initial check
    await runPerformanceCheck();
    
    // Schedule recurring checks
    this.performanceInterval = setInterval(runPerformanceCheck, this.config.performanceCheckInterval);
    this.log(`Performance monitoring scheduled every ${this.config.performanceCheckInterval / 1000} seconds`, 'INFO');
  }

  async checkHealthAlerts() {
    try {
      const healthReportPath = path.join(__dirname, '..', 'health-report.json');
      if (!fs.existsSync(healthReportPath)) return;
      
      const healthReport = JSON.parse(fs.readFileSync(healthReportPath, 'utf8'));
      
      if (healthReport.overall === 'CRITICAL') {
        this.log('🚨 CRITICAL ALERT: System health is critical!', 'ERROR');
        await this.handleCriticalAlert(healthReport);
      } else if (healthReport.overall === 'DEGRADED') {
        this.log('⚠️ WARNING: System health is degraded', 'WARNING');
        await this.handleWarningAlert(healthReport);
      }
      
      // Check for critical service failures
      Object.values(healthReport.services).forEach(service => {
        if (service.critical && service.status !== 'HEALTHY') {
          this.log(`🚨 CRITICAL SERVICE DOWN: ${service.name}`, 'ERROR');
        }
      });
      
    } catch (error) {
      this.log(`Failed to check health alerts: ${error.message}`, 'ERROR');
    }
  }

  async checkPerformanceAlerts() {
    try {
      const perfReportPath = path.join(__dirname, '..', 'performance-report.json');
      if (!fs.existsSync(perfReportPath)) return;
      
      const perfReport = JSON.parse(fs.readFileSync(perfReportPath, 'utf8'));
      
      // Check for performance alerts
      perfReport.alerts?.forEach(alert => {
        if (alert.level === 'CRITICAL') {
          this.log(`🚨 PERFORMANCE CRITICAL: ${alert.message}`, 'ERROR');
        } else if (alert.level === 'WARNING') {
          this.log(`⚠️ PERFORMANCE WARNING: ${alert.message}`, 'WARNING');
        }
      });
      
    } catch (error) {
      this.log(`Failed to check performance alerts: ${error.message}`, 'ERROR');
    }
  }

  async handleCriticalAlert(healthReport) {
    this.log('Executing critical alert response procedures...', 'ERROR');
    
    // Log critical services that are down
    Object.values(healthReport.services).forEach(service => {
      if (service.critical && service.status !== 'HEALTHY') {
        this.log(`Critical service failure: ${service.name} - ${service.error || service.details}`, 'ERROR');
      }
    });
    
    // Attempt automatic recovery (placeholder for future implementation)
    this.log('Automatic recovery procedures would be executed here', 'INFO');
  }

  async handleWarningAlert(healthReport) {
    this.log('Logging warning conditions for review...', 'WARNING');
    
    Object.values(healthReport.services).forEach(service => {
      if (service.status !== 'HEALTHY') {
        this.log(`Service issue: ${service.name} - ${service.error || service.details}`, 'WARNING');
      }
    });
  }

  async generateDailyReport() {
    this.log('Generating daily DevOps report...', 'INFO');
    
    try {
      // Collect all reports
      const reports = {
        timestamp: new Date().toISOString(),
        health: this.loadReport('health-report.json'),
        performance: this.loadReport('performance-report.json'),
        devops: this.loadReport('devops-report.json'),
        logs: this.logs.slice(-100) // Last 100 log entries
      };
      
      const dailyReportPath = path.join(__dirname, '..', `daily-report-${new Date().toISOString().split('T')[0]}.json`);
      fs.writeFileSync(dailyReportPath, JSON.stringify(reports, null, 2));
      
      this.log(`Daily report generated: ${dailyReportPath}`, 'SUCCESS');
      
      // Cleanup old reports
      await this.cleanupOldReports();
      
    } catch (error) {
      this.log(`Failed to generate daily report: ${error.message}`, 'ERROR');
    }
  }

  loadReport(filename) {
    try {
      const reportPath = path.join(__dirname, '..', filename);
      if (fs.existsSync(reportPath)) {
        return JSON.parse(fs.readFileSync(reportPath, 'utf8'));
      }
    } catch (error) {
      this.log(`Failed to load ${filename}: ${error.message}`, 'WARNING');
    }
    return null;
  }

  async cleanupOldReports() {
    try {
      const reportsDir = path.join(__dirname, '..');
      const files = fs.readdirSync(reportsDir);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - this.config.logRetention);
      
      files.forEach(file => {
        if (file.startsWith('daily-report-')) {
          const filePath = path.join(reportsDir, file);
          const stats = fs.statSync(filePath);
          
          if (stats.mtime < cutoffDate) {
            fs.unlinkSync(filePath);
            this.log(`Cleaned up old report: ${file}`, 'INFO');
          }
        }
      });
      
    } catch (error) {
      this.log(`Failed to cleanup old reports: ${error.message}`, 'WARNING');
    }
  }

  async start() {
    this.log('🚀 Starting CortexBuild 2.0 DevOps Automation', 'SUCCESS');
    this.log('Initializing monitoring systems...', 'INFO');
    
    this.monitoring = true;
    
    // Start monitoring systems
    await this.startHealthMonitoring();
    await this.startPerformanceMonitoring();
    
    // Schedule daily report generation (run at midnight)
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const msUntilMidnight = tomorrow.getTime() - now.getTime();
    setTimeout(() => {
      this.generateDailyReport();
      // Then schedule daily
      setInterval(() => this.generateDailyReport(), 24 * 60 * 60 * 1000);
    }, msUntilMidnight);
    
    this.log('✅ DevOps automation fully operational', 'SUCCESS');
    this.log('Monitoring systems active and scheduled', 'INFO');
    
    // Keep the process running
    process.on('SIGINT', () => this.shutdown());
    process.on('SIGTERM', () => this.shutdown());
  }

  async shutdown() {
    this.log('🛑 Shutting down DevOps automation...', 'INFO');
    
    this.monitoring = false;
    
    // Clear intervals
    if (this.healthInterval) clearInterval(this.healthInterval);
    if (this.performanceInterval) clearInterval(this.performanceInterval);
    
    // Kill running processes
    this.processes.forEach((process, name) => {
      if (!process.killed) {
        process.kill();
        this.log(`Terminated ${name}`, 'INFO');
      }
    });
    
    // Generate final report
    await this.generateDailyReport();
    
    this.log('✅ DevOps automation shutdown complete', 'SUCCESS');
    process.exit(0);
  }
}

// Run if called directly
if (require.main === module) {
  const automation = new DevOpsAutomation();
  automation.start().catch(error => {
    console.error('DevOps automation failed:', error);
    process.exit(1);
  });
}

module.exports = DevOpsAutomation;
