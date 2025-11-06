/* eslint-disable no-unused-vars, no-undef */
#!/usr/bin/env node

// CortexBuild Installation Verification Script
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 CortexBuild Installation Verification\n');

const checks = [];

// Check Node.js version
function checkNodeVersion() {
  try {
    const version = process.version;
    const majorVersion = parseInt(version.slice(1).split('.')[0]);
    
    if (majorVersion >= 18) {
      checks.push({ name: 'Node.js Version', status: '✅', details: version });
    } else {
      checks.push({ name: 'Node.js Version', status: '❌', details: `${version} (requires 18+)` });
    }
  } catch (error) {
    checks.push({ name: 'Node.js Version', status: '❌', details: 'Not found' });
  }
}

// Check package.json
function checkPackageJson() {
  try {
    const packagePath = path.join(process.cwd(), 'package.json');
    if (fs.existsSync(packagePath)) {
      const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      checks.push({ name: 'package.json', status: '✅', details: `v${pkg.version}` });
      
      // Check dependencies count
      const depCount = Object.keys(pkg.dependencies || {}).length;
      const devDepCount = Object.keys(pkg.devDependencies || {}).length;
      checks.push({ name: 'Dependencies', status: '✅', details: `${depCount} prod, ${devDepCount} dev` });
    } else {
      checks.push({ name: 'package.json', status: '❌', details: 'Not found' });
    }
  } catch (error) {
    checks.push({ name: 'package.json', status: '❌', details: error.message });
  }
}

// Check node_modules
function checkNodeModules() {
  try {
    const nodeModulesPath = path.join(process.cwd(), 'node_modules');
    if (fs.existsSync(nodeModulesPath)) {
      const stats = fs.statSync(nodeModulesPath);
      checks.push({ name: 'node_modules', status: '✅', details: 'Installed' });
    } else {
      checks.push({ name: 'node_modules', status: '❌', details: 'Not found - run npm install' });
    }
  } catch (error) {
    checks.push({ name: 'node_modules', status: '❌', details: error.message });
  }
}

// Check TypeScript
function checkTypeScript() {
  try {
    execSync('npx tsc --version', { stdio: 'pipe' });
    checks.push({ name: 'TypeScript', status: '✅', details: 'Available' });
  } catch (error) {
    checks.push({ name: 'TypeScript', status: '❌', details: 'Not available' });
  }
}

// Check Vite
function checkVite() {
  try {
    const viteConfigPath = path.join(process.cwd(), 'vite.config.ts');
    if (fs.existsSync(viteConfigPath)) {
      checks.push({ name: 'Vite Config', status: '✅', details: 'Found' });
    } else {
      checks.push({ name: 'Vite Config', status: '❌', details: 'Not found' });
    }
  } catch (error) {
    checks.push({ name: 'Vite Config', status: '❌', details: error.message });
  }
}

// Check Tailwind CSS
function checkTailwind() {
  try {
    const tailwindConfigPath = path.join(process.cwd(), 'tailwind.config.js');
    if (fs.existsSync(tailwindConfigPath)) {
      checks.push({ name: 'Tailwind CSS', status: '✅', details: 'Configured' });
    } else {
      checks.push({ name: 'Tailwind CSS', status: '❌', details: 'Not configured' });
    }
  } catch (error) {
    checks.push({ name: 'Tailwind CSS', status: '❌', details: error.message });
  }
}

// Check source files
function checkSourceFiles() {
  const requiredFiles = [
    'App.tsx',
    'main.tsx',
    'index.css',
    'types.ts'
  ];

  const requiredDirs = [
    'components',
    'services',
    'components/screens',
    'components/layout'
  ];

  requiredFiles.forEach(file => {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      checks.push({ name: `Source File: ${file}`, status: '✅', details: 'Found' });
    } else {
      checks.push({ name: `Source File: ${file}`, status: '❌', details: 'Missing' });
    }
  });

  requiredDirs.forEach(dir => {
    const dirPath = path.join(process.cwd(), dir);
    if (fs.existsSync(dirPath)) {
      const files = fs.readdirSync(dirPath).length;
      checks.push({ name: `Directory: ${dir}`, status: '✅', details: `${files} files` });
    } else {
      checks.push({ name: `Directory: ${dir}`, status: '❌', details: 'Missing' });
    }
  });
}

// Check services
function checkServices() {
  const services = [
    'dataService.ts',
    'analyticsService.ts',
    'teamService.ts',
    'timeTrackingService.ts',
    'notificationService.ts',
    'schedulingService.ts',
    'aiMLService.ts',
    'qualitySafetyService.ts',
    'businessIntelligenceService.ts',
    'workflowAutomationService.ts',
    'utilityService.ts',
    'integrationService.ts'
  ];

  services.forEach(service => {
    const servicePath = path.join(process.cwd(), 'services', service);
    if (fs.existsSync(servicePath)) {
      checks.push({ name: `Service: ${service}`, status: '✅', details: 'Found' });
    } else {
      checks.push({ name: `Service: ${service}`, status: '❌', details: 'Missing' });
    }
  });
}

// Check screens
function checkScreens() {
  const screens = [
    'DashboardScreen.tsx',
    'MyDayScreen.tsx',
    'ProjectsListScreen.tsx',
    'ProjectHomeScreen.tsx',
    'TasksScreen.tsx',
    'MyTasksScreen.tsx',
    'RFIsScreen.tsx',
    'DocumentsScreen.tsx',
    'AnalyticsScreen.tsx',
    'ReportsScreen.tsx',
    'TeamManagementScreen.tsx',
    'TimeTrackingScreen.tsx',
    'NotificationsScreen.tsx',
    'ProjectPlanningScreen.tsx',
    'AIInsightsScreen.tsx',
    'QualitySafetyScreen.tsx',
    'BusinessIntelligenceScreen.tsx'
  ];

  let foundScreens = 0;
  screens.forEach(screen => {
    const screenPath = path.join(process.cwd(), 'components', 'screens', screen);
    if (fs.existsSync(screenPath)) {
      foundScreens++;
    }
  });

  if (foundScreens >= screens.length * 0.8) {
    checks.push({ name: 'Screen Components', status: '✅', details: `${foundScreens}/${screens.length} found` });
  } else {
    checks.push({ name: 'Screen Components', status: '⚠️', details: `${foundScreens}/${screens.length} found` });
  }
}

// Check build capability
function checkBuild() {
  try {
    console.log('Testing build capability...');
    execSync('npm run build', { stdio: 'pipe', timeout: 60000 });
    checks.push({ name: 'Build Test', status: '✅', details: 'Successful' });
  } catch (error) {
    checks.push({ name: 'Build Test', status: '❌', details: 'Failed' });
  }
}

// Check if dev server can start
function checkDevServer() {
  try {
    console.log('Testing dev server startup...');
    const child = execSync('timeout 10s npm run dev || true', { stdio: 'pipe' });
    checks.push({ name: 'Dev Server', status: '✅', details: 'Can start' });
  } catch (error) {
    checks.push({ name: 'Dev Server', status: '⚠️', details: 'Check manually' });
  }
}

// Run all checks
async function runAllChecks() {
  console.log('Running installation verification checks...\n');

  checkNodeVersion();
  checkPackageJson();
  checkNodeModules();
  checkTypeScript();
  checkVite();
  checkTailwind();
  checkSourceFiles();
  checkServices();
  checkScreens();
  
  // Skip build and dev server checks if in CI or if requested
  if (!process.env.CI && !process.argv.includes('--skip-build')) {
    checkBuild();
  }

  // Display results
  console.log('\n📋 Verification Results:\n');
  
  let passed = 0;
  let failed = 0;
  let warnings = 0;

  checks.forEach(check => {
    console.log(`${check.status} ${check.name.padEnd(30)} ${check.details}`);
    if (check.status === '✅') passed++;
    else if (check.status === '❌') failed++;
    else warnings++;
  });

  console.log('\n📊 Summary:');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`⚠️  Warnings: ${warnings}`);
  console.log(`📈 Success Rate: ${((passed / checks.length) * 100).toFixed(1)}%`);

  if (failed === 0) {
    console.log('\n🎉 Installation verification completed successfully!');
    console.log('🚀 Your CortexBuild platform is ready to use.');
    console.log('\n📝 Next steps:');
    console.log('   1. Run: npm run dev');
    console.log('   2. Open: http://localhost:3002');
    console.log('   3. Login with default credentials');
    console.log('   4. Explore all 16+ features and modules');
    return true;
  } else {
    console.log('\n❌ Installation verification found issues.');
    console.log('🔧 Please fix the failed checks and run again.');
    return false;
  }
}

// Main execution
if (require.main === module) {
  runAllChecks().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('Verification failed:', error);
    process.exit(1);
  });
}

module.exports = { runAllChecks };
