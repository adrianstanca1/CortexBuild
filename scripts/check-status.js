#!/usr/bin/env node
/**
 * CortexBuild System Status Checker
 * Checks all system components and displays status
 */

import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, statSync } from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dbPath = join(__dirname, '..', 'cortexbuild.db');

// Colors for terminal output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
};

const { green, red, yellow, blue, cyan, bright, reset } = colors;

console.log(`\n${bright}${cyan}╔════════════════════════════════════════════════════════════════╗${reset}`);
console.log(`${bright}${cyan}║           🚀 CORTEXBUILD SYSTEM STATUS CHECK 🚀              ║${reset}`);
console.log(`${bright}${cyan}╚════════════════════════════════════════════════════════════════╝${reset}\n`);

// Check if port is in use
async function checkPort(port) {
    try {
        const { stdout } = await execAsync(`lsof -ti:${port}`);
        return stdout.trim() !== '';
    } catch {
        return false;
    }
}

// Check database
function checkDatabase() {
    console.log(`${bright}${blue}📊 DATABASE STATUS:${reset}`);
    console.log(`${cyan}${'─'.repeat(64)}${reset}`);
    
    if (!existsSync(dbPath)) {
        console.log(`${red}❌ Database file not found${reset}`);
        return false;
    }
    
    const stats = statSync(dbPath);
    const sizeKB = (stats.size / 1024).toFixed(2);
    console.log(`${green}✅ Database file exists${reset}`);
    console.log(`   Location: ${dbPath}`);
    console.log(`   Size: ${sizeKB} KB`);
    
    try {
        const db = new Database(dbPath);
        
        // Count tables
        const tables = db.prepare("SELECT COUNT(*) as count FROM sqlite_master WHERE type='table'").get();
        console.log(`   Tables: ${tables.count}`);
        
        // Count users
        const users = db.prepare('SELECT COUNT(*) as count FROM users').get();
        console.log(`   Users: ${users.count}`);
        
        // Count companies
        const companies = db.prepare('SELECT COUNT(*) as count FROM companies').get();
        console.log(`   Companies: ${companies.count}`);
        
        // Count projects
        const projects = db.prepare('SELECT COUNT(*) as count FROM projects').get();
        console.log(`   Projects: ${projects.count}`);
        
        // Check dashboard tables
        const dashboards = db.prepare("SELECT COUNT(*) as count FROM sqlite_master WHERE type='table' AND name LIKE '%dashboard%'").get();
        console.log(`   Dashboard Tables: ${dashboards.count}`);
        
        db.close();
        console.log(`${green}✅ Database is healthy${reset}\n`);
        return true;
    } catch (error) {
        console.log(`${red}❌ Database error: ${error.message}${reset}\n`);
        return false;
    }
}

// Check servers
async function checkServers() {
    console.log(`${bright}${blue}🖥️  SERVER STATUS:${reset}`);
    console.log(`${cyan}${'─'.repeat(64)}${reset}`);
    
    // Check backend
    const backendRunning = await checkPort(5000);
    if (backendRunning) {
        console.log(`${green}✅ Backend server running on port 5000${reset}`);
    } else {
        console.log(`${red}❌ Backend server not running on port 5000${reset}`);
        console.log(`   ${yellow}Start with: npm run server${reset}`);
    }
    
    // Check frontend
    const frontendRunning = await checkPort(3000);
    if (frontendRunning) {
        console.log(`${green}✅ Frontend server running on port 3000${reset}`);
    } else {
        console.log(`${red}❌ Frontend server not running on port 3000${reset}`);
        console.log(`   ${yellow}Start with: npm run dev${reset}`);
    }
    
    console.log('');
    return backendRunning && frontendRunning;
}

// Check users
function checkUsers() {
    console.log(`${bright}${blue}👥 USER ACCOUNTS:${reset}`);
    console.log(`${cyan}${'─'.repeat(64)}${reset}`);
    
    try {
        const db = new Database(dbPath);
        const users = db.prepare('SELECT email, role, name FROM users ORDER BY role DESC').all();
        
        for (const user of users) {
            const roleColor = user.role === 'super_admin' ? red : 
                            user.role === 'company_admin' ? yellow : 
                            user.role === 'developer' ? cyan : green;
            console.log(`${roleColor}●${reset} ${user.role.padEnd(15)} | ${user.email.padEnd(35)} | ${user.name}`);
        }
        
        db.close();
        console.log('');
        return true;
    } catch (error) {
        console.log(`${red}❌ Error checking users: ${error.message}${reset}\n`);
        return false;
    }
}

// Display login credentials
function displayCredentials() {
    console.log(`${bright}${blue}🔐 LOGIN CREDENTIALS:${reset}`);
    console.log(`${cyan}${'─'.repeat(64)}${reset}`);
    console.log(`${bright}Super Admin:${reset}`);
    console.log(`   Email:    adrian.stanca1@gmail.com`);
    console.log(`   Password: parola123`);
    console.log('');
    console.log(`${bright}Company Admin:${reset}`);
    console.log(`   Email:    adrian@ascladdingltd.co.uk`);
    console.log(`   Password: lolozania1`);
    console.log('');
    console.log(`${bright}Developer:${reset}`);
    console.log(`   Email:    dev@constructco.com`);
    console.log(`   Password: password123`);
    console.log('');
}

// Display URLs
async function displayURLs() {
    console.log(`${bright}${blue}🌐 ACCESS URLS:${reset}`);
    console.log(`${cyan}${'─'.repeat(64)}${reset}`);
    
    const frontendRunning = await checkPort(3000);
    const backendRunning = await checkPort(5000);
    
    if (frontendRunning) {
        console.log(`${green}✅ Frontend:${reset}  http://localhost:3000/`);
        console.log(`              http://192.168.1.140:3000/`);
    } else {
        console.log(`${red}❌ Frontend:${reset}  Not running`);
    }
    
    if (backendRunning) {
        console.log(`${green}✅ Backend:${reset}   http://localhost:5000/`);
    } else {
        console.log(`${red}❌ Backend:${reset}   Not running`);
    }
    
    console.log('');
}

// Display statistics
function displayStats() {
    console.log(`${bright}${blue}📊 PLATFORM STATISTICS:${reset}`);
    console.log(`${cyan}${'─'.repeat(64)}${reset}`);
    console.log(`   Total Components:        27`);
    console.log(`   Database Tables:         50+`);
    console.log(`   API Operations:          12`);
    console.log(`   Real-time Subscriptions: 8`);
    console.log(`   Lines of Code:           ~20,000+`);
    console.log('');
}

// Main function
async function main() {
    const dbOk = checkDatabase();
    const serversOk = await checkServers();
    const usersOk = checkUsers();
    
    displayCredentials();
    await displayURLs();
    displayStats();
    
    // Final status
    console.log(`${bright}${cyan}╔════════════════════════════════════════════════════════════════╗${reset}`);
    if (dbOk && serversOk && usersOk) {
        console.log(`${bright}${cyan}║${reset}  ${green}✅ ALL SYSTEMS OPERATIONAL - READY TO USE!${reset}                 ${bright}${cyan}║${reset}`);
    } else {
        console.log(`${bright}${cyan}║${reset}  ${yellow}⚠️  SOME SYSTEMS NEED ATTENTION${reset}                            ${bright}${cyan}║${reset}`);
    }
    console.log(`${bright}${cyan}╚════════════════════════════════════════════════════════════════╝${reset}\n`);
    
    if (!serversOk) {
        console.log(`${yellow}💡 Quick Start:${reset}`);
        console.log(`   1. Start backend:  npm run server`);
        console.log(`   2. Start frontend: npm run dev`);
        console.log(`   3. Open browser:   http://localhost:3000\n`);
    }
}

main().catch(console.error);

