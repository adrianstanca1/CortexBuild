#!/usr/bin/env node

import fs from 'fs';
import { execSync } from 'child_process';

console.log('🚀 Setting up ASAgents Ultimate Platform...\n');

// Check if Node.js version is compatible
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);

if (majorVersion < 18) {
    console.error('❌ Node.js 18+ is required. Current version:', nodeVersion);
    process.exit(1);
}

console.log('✅ Node.js version compatible:', nodeVersion);

// Install dependencies
console.log('\n📦 Installing frontend dependencies...');
try {
    execSync('npm install', { stdio: 'inherit', cwd: process.cwd() });
    console.log('✅ Frontend dependencies installed');
} catch (error) {
    console.error('❌ Failed to install frontend dependencies');
    process.exit(1);
}

// Install backend dependencies
console.log('\n🔧 Installing backend dependencies...');
try {
    if (fs.existsSync('./backend')) {
        execSync('npm install', { stdio: 'inherit', cwd: './backend' });
        console.log('✅ Backend dependencies installed');
    }
    
    if (fs.existsSync('./server')) {
        execSync('npm install', { stdio: 'inherit', cwd: './server' });
        console.log('✅ Server dependencies installed');
    }
} catch (error) {
    console.error('❌ Failed to install backend dependencies');
    process.exit(1);
}

// Create necessary directories
const directories = [
    './uploads',
    './logs',
    './database',
    './dist',
    './coverage'
];

console.log('\n📁 Creating project directories...');
directories.forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`✅ Created directory: ${dir}`);
    }
});

// Copy environment file if it doesn't exist
if (!fs.existsSync('./.env.local')) {
    console.log('\n⚙️  Setting up environment file...');
    if (fs.existsSync('./.env.example')) {
        fs.copyFileSync('./.env.example', './.env.local');
        console.log('✅ Created .env.local from example');
        console.log('📝 Please edit .env.local with your configuration');
    }
}

// Check TypeScript compilation
console.log('\n🔍 Checking TypeScript compilation...');
try {
    execSync('npm run type-check', { stdio: 'inherit' });
    console.log('✅ TypeScript compilation successful');
} catch (error) {
    console.log('⚠️  TypeScript has some issues, but setup continues...');
}

// Display success message
console.log('\n🎉 ASAgents Ultimate Platform setup complete!');
console.log('\n📋 Next steps:');
console.log('1. Edit .env.local with your API keys and configuration');
console.log('2. Run "npm run dev" to start the frontend');
console.log('3. Run "npm run backend:dev" to start the backend');
console.log('4. Run "npm run server:dev" to start the AI services');
console.log('5. Or run "npm run full:dev" to start everything at once');
console.log('\n🌟 Features available:');
console.log('   - 60+ React components');
console.log('   - Dual backend architecture');
console.log('   - Complete OAuth integration');
console.log('   - AI-powered features');
console.log('   - Production-ready deployments');
console.log('\n🚀 Happy coding with ASAgents Ultimate!');