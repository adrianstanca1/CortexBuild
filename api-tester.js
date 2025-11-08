#!/usr/bin/env node

/**
 * 🎮 CortexBuild API Fun Tester
 * Interactive command-line tool for testing APIs with style!
 */

const http = require('http');
const { URL } = require('url');
const readline = require('readline');

// Fun colors and emojis
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m'
};

const emojis = {
    rocket: '🚀',
    check: '✅',
    cross: '❌',
    warning: '⚠️',
    info: 'ℹ️',
    fire: '🔥',
    party: '🎉',
    tools: '🔧',
    target: '🎯',
    magic: '✨'
};

class FunAPITester {
    constructor() {
        this.baseUrl = 'http://localhost:3001';
        this.token = null;
        this.stats = {
            requests: 0,
            successes: 0,
            failures: 0,
            totalTime: 0
        };
        
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
    }

    log(message, color = 'white', emoji = '') {
        const timestamp = new Date().toLocaleTimeString();
        console.log(`${colors[color]}${emoji} [${timestamp}] ${message}${colors.reset}`);
    }

    async makeRequest(path, options = {}) {
        return new Promise((resolve, reject) => {
            const startTime = Date.now();
            this.stats.requests++;
            
            const url = new URL(path, this.baseUrl);
            const requestOptions = {
                hostname: url.hostname,
                port: url.port,
                path: url.pathname + url.search,
                method: options.method || 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                }
            };

            const req = http.request(requestOptions, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    const endTime = Date.now();
                    const responseTime = endTime - startTime;
                    this.stats.totalTime += responseTime;
                    
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        this.stats.successes++;
                        this.log(`${options.method || 'GET'} ${path} - ${res.statusCode} (${responseTime}ms)`, 'green', emojis.check);
                    } else {
                        this.stats.failures++;
                        this.log(`${options.method || 'GET'} ${path} - ${res.statusCode} (${responseTime}ms)`, 'red', emojis.cross);
                    }
                    
                    try {
                        resolve({
                            status: res.statusCode,
                            data: JSON.parse(data),
                            responseTime
                        });
                    } catch {
                        resolve({
                            status: res.statusCode,
                            data: data,
                            responseTime
                        });
                    }
                });
            });

            req.on('error', (error) => {
                this.stats.failures++;
                this.log(`Request failed: ${error.message}`, 'red', emojis.cross);
                reject(error);
            });

            if (options.body) {
                req.write(JSON.stringify(options.body));
            }
            
            req.end();
        });
    }

    async testLogin() {
        this.log('Testing login...', 'cyan', emojis.rocket);
        
        try {
            const response = await this.makeRequest('/api/auth/login', {
                method: 'POST',
                body: {
                    email: 'demo@cortexbuild.com',
                    password: 'demo-password'
                }
            });
            
            if (response.data.success) {
                this.token = response.data.token;
                this.log(`Login successful! Welcome ${response.data.user.name}`, 'green', emojis.party);
                return true;
            } else {
                this.log('Login failed!', 'red', emojis.cross);
                return false;
            }
        } catch (error) {
            this.log(`Login error: ${error.message}`, 'red', emojis.cross);
            return false;
        }
    }

    async testDashboard() {
        if (!this.token) {
            this.log('Please login first!', 'yellow', emojis.warning);
            return;
        }
        
        this.log('Testing dashboard endpoints...', 'cyan', emojis.target);
        
        const endpoints = [
            '/api/dashboard/stats',
            '/api/dashboard/projects',
            '/api/dashboard/tasks',
            '/api/user/profile'
        ];
        
        for (const endpoint of endpoints) {
            try {
                const response = await this.makeRequest(endpoint, {
                    headers: { 'Authorization': `Bearer ${this.token}` }
                });
                
                if (response.status === 200) {
                    this.log(`${endpoint} - Success!`, 'green', emojis.check);
                    if (endpoint === '/api/dashboard/stats') {
                        const stats = response.data.stats;
                        this.log(`  📊 Projects: ${stats.totalProjects}, Tasks: ${stats.totalTasks}`, 'blue');
                    }
                } else {
                    this.log(`${endpoint} - Failed (${response.status})`, 'red', emojis.cross);
                }
            } catch (error) {
                this.log(`${endpoint} - Error: ${error.message}`, 'red', emojis.cross);
            }
        }
    }

    async stressTest() {
        this.log('Starting stress test...', 'yellow', emojis.fire);
        
        const promises = [];
        const testCount = 20;
        
        for (let i = 0; i < testCount; i++) {
            promises.push(this.makeRequest('/api/health'));
        }
        
        try {
            const startTime = Date.now();
            await Promise.all(promises);
            const endTime = Date.now();
            const totalTime = endTime - startTime;
            
            this.log(`Stress test completed! ${testCount} requests in ${totalTime}ms`, 'green', emojis.party);
            this.log(`Average: ${Math.round(totalTime / testCount)}ms per request`, 'blue', emojis.info);
        } catch (error) {
            this.log(`Stress test failed: ${error.message}`, 'red', emojis.cross);
        }
    }

    showStats() {
        this.log('=== API Testing Statistics ===', 'magenta', emojis.target);
        this.log(`Total Requests: ${this.stats.requests}`, 'white');
        this.log(`Successes: ${this.stats.successes}`, 'green');
        this.log(`Failures: ${this.stats.failures}`, 'red');
        
        if (this.stats.requests > 0) {
            const successRate = Math.round((this.stats.successes / this.stats.requests) * 100);
            const avgTime = Math.round(this.stats.totalTime / this.stats.requests);
            this.log(`Success Rate: ${successRate}%`, successRate > 90 ? 'green' : 'yellow');
            this.log(`Average Response Time: ${avgTime}ms`, avgTime < 100 ? 'green' : 'yellow');
        }
    }

    async showMenu() {
        console.log(`\n${colors.cyan}${emojis.rocket} CortexBuild API Fun Tester ${emojis.rocket}${colors.reset}`);
        console.log(`${colors.yellow}Choose your adventure:${colors.reset}`);
        console.log(`${colors.green}1.${colors.reset} ${emojis.check} Test Login`);
        console.log(`${colors.green}2.${colors.reset} ${emojis.target} Test Dashboard`);
        console.log(`${colors.green}3.${colors.reset} ${emojis.fire} Stress Test`);
        console.log(`${colors.green}4.${colors.reset} ${emojis.tools} Test All Endpoints`);
        console.log(`${colors.green}5.${colors.reset} ${emojis.info} Show Statistics`);
        console.log(`${colors.green}6.${colors.reset} ${emojis.magic} Random Fun Test`);
        console.log(`${colors.green}7.${colors.reset} ${emojis.party} Exit`);
        
        return new Promise((resolve) => {
            this.rl.question(`\n${colors.cyan}Enter your choice (1-7): ${colors.reset}`, (answer) => {
                resolve(answer.trim());
            });
        });
    }

    async randomFunTest() {
        const funTests = [
            async () => {
                this.log('Testing with random user agent...', 'magenta', emojis.magic);
                await this.makeRequest('/api/health', {
                    headers: { 'User-Agent': 'CortexBuild-Fun-Bot/1.0 🤖' }
                });
            },
            async () => {
                this.log('Rapid fire health checks...', 'magenta', emojis.fire);
                for (let i = 0; i < 5; i++) {
                    await this.makeRequest('/api/health');
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
            },
            async () => {
                this.log('Testing with fun headers...', 'magenta', emojis.party);
                await this.makeRequest('/api/health', {
                    headers: { 
                        'X-Fun-Level': '9000',
                        'X-Debug-Mode': 'party-time'
                    }
                });
            }
        ];
        
        const randomTest = funTests[Math.floor(Math.random() * funTests.length)];
        await randomTest();
        this.log('Random fun test completed!', 'green', emojis.party);
    }

    async testAllEndpoints() {
        this.log('Testing all available endpoints...', 'cyan', emojis.tools);
        
        // Test public endpoints
        await this.makeRequest('/api/health');
        
        // Test login
        const loginSuccess = await this.testLogin();
        
        if (loginSuccess) {
            // Test protected endpoints
            await this.testDashboard();
            
            // Test admin endpoints (if admin)
            try {
                await this.makeRequest('/api/admin/users', {
                    headers: { 'Authorization': `Bearer ${this.token}` }
                });
            } catch (err) {
                console.error('Error:', err);
                this.log('Admin endpoints require admin role', 'yellow', emojis.warning);
            }
        }
        
        this.log('All endpoint testing completed!', 'green', emojis.party);
    }

    async run() {
        this.log('Welcome to the CortexBuild API Fun Tester!', 'green', emojis.rocket);
        this.log('Let\'s make API testing fun and interactive!', 'cyan', emojis.party);
        
        while (true) {
            const choice = await this.showMenu();
            
            switch (choice) {
                case '1':
                    await this.testLogin();
                    break;
                case '2':
                    await this.testDashboard();
                    break;
                case '3':
                    await this.stressTest();
                    break;
                case '4':
                    await this.testAllEndpoints();
                    break;
                case '5':
                    this.showStats();
                    break;
                case '6':
                    await this.randomFunTest();
                    break;
                case '7':
                    this.log('Thanks for testing! Keep building awesome things!', 'green', emojis.party);
                    this.rl.close();
                    return;
                default:
                    this.log('Invalid choice! Please try again.', 'red', emojis.warning);
            }
            
            // Wait for user to press enter
            await new Promise((resolve) => {
                this.rl.question('\nPress Enter to continue...', () => resolve());
            });
        }
    }
}

// Run the tester
if (require.main === module) {
    const tester = new FunAPITester();
    tester.run().catch(console.error);
}

module.exports = FunAPITester;
