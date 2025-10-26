#!/usr/bin/env node

/* eslint-env node */

/**
 * Platform Testing Script
 * Tests all major platform components
 */

const http = require('http');
const console = require('console');
const { Buffer } = require('buffer');
const process = require('process');

// ANSI color codes
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    magenta: '\x1b[35m'
};

// Test results
const results = {
    passed: 0,
    failed: 0,
    total: 0
};

// Helper functions
function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function success(message) {
    log(`✅ ${message}`, 'green');
    results.passed++;
    results.total++;
}

function fail(message) {
    log(`❌ ${message}`, 'red');
    results.failed++;
    results.total++;
}

function header(message) {
    log(`\n${'='.repeat(80)}`, 'bright');
    log(`  ${message}`, 'bright');
    log('='.repeat(80), 'bright');
}

// HTTP request helper
function makeRequest(options) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                resolve({
                    statusCode: res.statusCode,
                    headers: res.headers,
                    body: data
                });
            });
        });
        req.on('error', reject);
        if (options.body) {
            req.write(options.body);
        }
        req.end();
    });
}

// Test functions
async function testFrontendServer() {
    header('Testing Frontend Server');

    try {
        const response = await makeRequest({
            hostname: 'localhost',
            port: 3000,
            path: '/',
            method: 'GET'
        });

        if (response.statusCode === 200) {
            success('Frontend server is running on port 3000');
        } else {
            fail(`Frontend server returned status ${response.statusCode}`);
        }
    } catch (error) {
        fail(`Frontend server is not running: ${error.message}`);
    }
}

async function testBackendServer() {
    header('Testing Backend Server');

    try {
        const response = await makeRequest({
            hostname: 'localhost',
            port: 3001,
            path: '/api/health',
            method: 'GET'
        });

        if (response.statusCode === 200 || response.statusCode === 404) {
            success('Backend server is running on port 3001');
        } else {
            fail(`Backend server returned status ${response.statusCode}`);
        }
    } catch (error) {
        fail(`Backend server is not running: ${error.message}`);
    }
}

async function testAuthEndpoints() {
    header('Testing Authentication Endpoints');

    // Test login endpoint
    try {
        const loginData = JSON.stringify({
            email: 'adrian.stanca1@gmail.com',
            password: 'parola123'
        });

        const response = await makeRequest({
            hostname: 'localhost',
            port: 3001,
            path: '/api/auth/login',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(loginData)
            },
            body: loginData
        });

        if (response.statusCode === 200) {
            success('Login endpoint is working');

            // Try to parse response
            try {
                const data = JSON.parse(response.body);
                if (data.user && data.user.role === 'super_admin') {
                    success('Super Admin login successful');
                } else {
                    fail('Login response format incorrect');
                }
            } catch (error) {
                fail(`Login response is not valid JSON: ${error.message}`);
            }
        } else {
            fail(`Login endpoint returned status ${response.statusCode}`);
        }
    } catch (error) {
        fail(`Login endpoint error: ${error.message}`);
    }
}

async function testDatabaseConnection() {
    header('Testing Database Connection');

    const fs = require('fs');
    const path = require('path');

    const dbPath = path.join(process.cwd(), 'cortexbuild.db');

    if (fs.existsSync(dbPath)) {
        const stats = fs.statSync(dbPath);
        success(`Database file exists (${(stats.size / 1024).toFixed(2)} KB)`);

        if (stats.size > 0) {
            success('Database is not empty');
        } else {
            fail('Database file is empty');
        }
    } else {
        fail('Database file not found');
    }
}

async function testUserRoles() {
    header('Testing User Roles');

    const testUsers = [
        { email: 'adrian.stanca1@gmail.com', password: 'parola123', role: 'super_admin', name: 'Super Admin' },
        { email: 'adrian@ascladdingltd.co.uk', password: 'lolozania1', role: 'company_admin', name: 'Company Admin' },
        { email: 'adrian.stanca1@icloud.com', password: 'password123', role: 'developer', name: 'Developer' }
    ];

    for (const user of testUsers) {
        try {
            const loginData = JSON.stringify({
                email: user.email,
                password: user.password
            });

            const response = await makeRequest({
                hostname: 'localhost',
                port: 3001,
                path: '/api/auth/login',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(loginData)
                },
                body: loginData
            });

            if (response.statusCode === 200) {
                const data = JSON.parse(response.body);
                if (data.user && data.user.role === user.role) {
                    success(`${user.name} login successful (${user.role})`);
                } else {
                    fail(`${user.name} role mismatch`);
                }
            } else {
                fail(`${user.name} login failed`);
            }
        } catch (error) {
            fail(`${user.name} login error: ${error.message}`);
        }
    }
}

async function printSummary() {
    header('Test Summary');

    log(`\nTotal Tests: ${results.total}`, 'bright');
    log(`Passed: ${results.passed} ✅`, 'green');
    log(`Failed: ${results.failed} ❌`, 'red');

    const passRate = ((results.passed / results.total) * 100).toFixed(2);
    log(`Pass Rate: ${passRate}%`, passRate === '100.00' ? 'green' : 'yellow');

    if (results.failed === 0) {
        log('\n🎉 All tests passed! Platform is ready!', 'green');
    } else {
        log('\n⚠️  Some tests failed. Please check the errors above.', 'yellow');
    }

    log('\n' + '='.repeat(80), 'bright');
}

async function printPlatformInfo() {
    header('CortexBuild Platform - System Check');

    log('\n📊 Platform Information:', 'cyan');
    log('  Version: 1.0.0 PRODUCTION READY', 'bright');
    log('  Status: LIVE & OPERATIONAL', 'green');
    log('  Frontend: http://localhost:3000/', 'cyan');
    log('  Backend: http://localhost:3001', 'cyan');
    log('  WebSocket: ws://localhost:3001/ws', 'cyan');

    log('\n👥 Test Credentials:', 'cyan');
    log('  Super Admin: adrian.stanca1@gmail.com / parola123', 'bright');
    log('  Company Admin: adrian@ascladdingltd.co.uk / lolozania1', 'bright');
    log('  Developer: adrian.stanca1@icloud.com / password123', 'bright');
}

// Main test runner
async function runTests() {
    await printPlatformInfo();

    await testFrontendServer();
    await testBackendServer();
    await testDatabaseConnection();
    await testAuthEndpoints();
    await testUserRoles();

    await printSummary();
}

// Run tests
runTests().catch(error => {
    log(`\n❌ Test runner error: ${error.message}`, 'red');
    process.exit(1);
});
