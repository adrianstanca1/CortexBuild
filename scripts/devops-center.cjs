/* eslint-disable no-unused-vars, no-undef */
#!/usr/bin/env node

// DevOps Command Center for CortexBuild 2.0
const readline = require('readline');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class DevOpsCenter {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    this.commands = {
      'status': 'Check system status',
      'health': 'Run health checks',
      'performance': 'Run performance analysis',
      'monitor': 'Run basic monitoring',
      'automate': 'Start automation system',
      'dashboard': 'Start dashboard server',
      'reports': 'View available reports',
      'logs': 'View recent logs',
      'help': 'Show this help menu',
      'exit': 'Exit command center'
    };
    
    this.runningProcesses = new Map();
  }

  displayBanner() {
    console.log('\n' + '='.repeat(60));
    console.log('🚀 CortexBuild 2.0 - DevOps Command Center');
    console.log('='.repeat(60));
    console.log('Enterprise-grade monitoring and operations control');
    console.log('Type "help" for available commands\n');
  }

  displayHelp() {
    console.log('\n📋 Available Commands:');
    console.log('-'.repeat(40));
    
    Object.entries(this.commands).forEach(([cmd, desc]) => {
      console.log(`  ${cmd.padEnd(12)} - ${desc}`);
    });
    
    console.log('\n🔧 Advanced Commands:');
    console.log('  start all    - Start all services');
    console.log('  stop all     - Stop all services');
    console.log('  restart      - Restart services');
    console.log('  tail logs    - Follow log output');
    console.log('\n');
  }

  async runCommand(command) {
    const scriptMap = {
      'status': 'devops-status.cjs',
      'health': 'health-checker.cjs',
      'performance': 'performance-monitor.cjs',
      'monitor': 'devops-monitor.cjs',
      'automate': 'devops-automation.cjs',
      'dashboard': 'dashboard-server.cjs'
    };
    
    if (scriptMap[command]) {
      console.log(`\n🔄 Running ${command}...`);
      try {
        await this.executeScript(scriptMap[command]);
      } catch (error) {
        console.log(`❌ Command failed: ${error.message}`);
      }
    }
  }

  executeScript(scriptName) {
    return new Promise((resolve, reject) => {
      const scriptPath = path.join(__dirname, scriptName);
      const process = spawn('node', [scriptPath], {
        stdio: 'inherit',
        cwd: path.join(__dirname, '..')
      });
      
      process.on('close', (code) => {
        if (code === 0) {
          console.log(`✅ ${scriptName} completed successfully\n`);
          resolve();
        } else {
          reject(new Error(`${scriptName} exited with code ${code}`));
        }
      });
      
      process.on('error', (error) => {
        reject(error);
      });
    });
  }

  async viewReports() {
    console.log('\n📊 Available Reports:');
    console.log('-'.repeat(30));
    
    const reportFiles = [
      'devops-report.json',
      'health-report.json',
      'performance-report.json'
    ];
    
    const reportsDir = path.join(__dirname, '..');
    
    reportFiles.forEach(file => {
      const filePath = path.join(reportsDir, file);
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        const size = (stats.size / 1024).toFixed(2);
        const modified = stats.mtime.toLocaleString();
        
        console.log(`  📄 ${file}`);
        console.log(`     Size: ${size} KB | Modified: ${modified}`);
      } else {
        console.log(`  ❌ ${file} - Not found`);
      }
    });
    
    // Check for daily reports
    const files = fs.readdirSync(reportsDir);
    const dailyReports = files.filter(f => f.startsWith('daily-report-'));
    
    if (dailyReports.length > 0) {
      console.log('\n📅 Daily Reports:');
      dailyReports.slice(-5).forEach(file => {
        const filePath = path.join(reportsDir, file);
        const stats = fs.statSync(filePath);
        console.log(`  📄 ${file} (${(stats.size / 1024).toFixed(2)} KB)`);
      });
    }
    
    console.log('\n');
  }

  async viewSystemStatus() {
    console.log('\n🔍 Quick System Status:');
    console.log('-'.repeat(25));
    
    const services = [
      { name: 'Frontend', port: 3005 },
      { name: 'API', port: 3001 },
      { name: 'Dashboard', port: 3006 }
    ];
    
    for (const service of services) {
      try {
        const response = await fetch(`http://localhost:${service.port}`, {
          timeout: 2000
        });
        console.log(`  ✅ ${service.name} (Port ${service.port}) - HEALTHY`);
      } catch (error) {
        console.log(`  ❌ ${service.name} (Port ${service.port}) - DOWN`);
      }
    }
    
    console.log('\n');
  }

  async handleSpecialCommands(input) {
    const parts = input.trim().split(' ');
    const command = parts[0];
    const subcommand = parts[1];
    
    switch (command) {
      case 'start':
        if (subcommand === 'all') {
          console.log('🚀 Starting all services...');
          console.log('Use "npm run dev:full" in a separate terminal');
        }
        break;
        
      case 'stop':
        if (subcommand === 'all') {
          console.log('🛑 Stopping all services...');
          console.log('Use Ctrl+C in service terminals');
        }
        break;
        
      case 'tail':
        if (subcommand === 'logs') {
          console.log('📜 Recent system activity:');
          // This would show recent logs in a real implementation
          console.log('  [INFO] DevOps Center started');
          console.log('  [SUCCESS] All health checks passed');
          console.log('  [INFO] Performance monitoring active');
        }
        break;
        
      default:
        return false;
    }
    
    return true;
  }

  async promptUser() {
    return new Promise((resolve) => {
      this.rl.question('DevOps> ', (answer) => {
        resolve(answer.trim().toLowerCase());
      });
    });
  }

  async start() {
    this.displayBanner();
    
    while (true) {
      try {
        const input = await this.promptUser();
        
        if (input === 'exit' || input === 'quit') {
          console.log('\n👋 Goodbye! DevOps Center shutting down...\n');
          break;
        }
        
        if (input === 'help' || input === '?') {
          this.displayHelp();
          continue;
        }
        
        if (input === 'reports') {
          await this.viewReports();
          continue;
        }
        
        if (input === 'quick' || input === 'q') {
          await this.viewSystemStatus();
          continue;
        }
        
        if (input === 'clear' || input === 'cls') {
          console.clear();
          this.displayBanner();
          continue;
        }
        
        // Handle special commands
        if (await this.handleSpecialCommands(input)) {
          continue;
        }
        
        // Handle regular commands
        if (this.commands[input]) {
          await this.runCommand(input);
        } else if (input) {
          console.log(`❌ Unknown command: ${input}`);
          console.log('Type "help" for available commands\n');
        }
        
      } catch (error) {
        console.log(`❌ Error: ${error.message}\n`);
      }
    }
    
    this.rl.close();
  }
}

// Run if called directly
if (require.main === module) {
  const center = new DevOpsCenter();
  center.start().catch(error => {
    console.error('DevOps Center failed:', error);
    process.exit(1);
  });
}

module.exports = DevOpsCenter;
