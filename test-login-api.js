/* eslint-disable no-unused-vars, no-undef */
#!/usr/bin/env node

/**
 * CortexBuild Login API Test Script
 * Tests the /api/auth/login endpoint
 *
 * Usage: node test-login-api.js [frontend-url] [email] [password]
 */

import https from 'https';
import http from 'http';
import { URL } from 'url';

// Configuration
const FRONTEND_URL = process.argv[2] || 'https://cortex-build-mcnrk7yba-adrian-b7e84541.vercel.app';
const TEST_EMAIL = process.argv[3] || 'adrian.stanca1@gmail.com';
const TEST_PASSWORD = process.argv[4] || 'password123';
const API_ENDPOINT = '/api/auth/login';

// Colors
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
};

function log(color, message) {
    console.log(`${color}${message}${colors.reset}`);
}

function makeRequest(url, method, data) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const isHttps = urlObj.protocol === 'https:';
        const client = isHttps ? https : http;

        const options = {
            hostname: urlObj.hostname,
            port: urlObj.port,
            path: urlObj.pathname + urlObj.search,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'CortexBuild-Test/1.0',
            },
        };

        if (data) {
            const jsonData = JSON.stringify(data);
            options.headers['Content-Length'] = Buffer.byteLength(jsonData);
        }

        const req = client.request(options, (res) => {
            let responseData = '';

            res.on('data', (chunk) => {
                responseData += chunk;
            });

            res.on('end', () => {
                resolve({
                    status: res.statusCode,
                    headers: res.headers,
                    body: responseData,
                });
            });
        });

        req.on('error', reject);

        if (data) {
            req.write(JSON.stringify(data));
        }

        req.end();
    });
}

async function testLoginEndpoint() {
    log(colors.blue, '========================================');
    log(colors.blue, 'CortexBuild Login API Test');
    log(colors.blue, '========================================');
    console.log('');

    log(colors.yellow, `Testing: ${FRONTEND_URL}${API_ENDPOINT}`);
    log(colors.yellow, `Email: ${TEST_EMAIL}`);
    console.log('');

    try {
        const response = await makeRequest(
            `${FRONTEND_URL}${API_ENDPOINT}`,
            'POST',
            {
                email: TEST_EMAIL,
                password: TEST_PASSWORD,
            }
        );

        log(colors.blue, 'Response Status: ' + response.status);
        log(colors.blue, 'Response Headers:');
        console.log(JSON.stringify(response.headers, null, 2));
        console.log('');

        log(colors.blue, 'Response Body:');
        try {
            const body = JSON.parse(response.body);
            console.log(JSON.stringify(body, null, 2));

            if (response.status === 200 && body.success) {
                log(colors.green, '✅ Login successful!');
                if (body.token) {
                    log(colors.green, `Token: ${body.token.substring(0, 50)}...`);
                }
                if (body.user) {
                    log(colors.green, `User: ${body.user.email}`);
                }
            } else if (response.status === 401) {
                log(colors.red, `❌ Authentication failed: ${body.error}`);
            } else if (response.status === 405) {
                log(colors.red, '❌ Method not allowed - API endpoint not deployed');
            } else {
                log(colors.red, `❌ Error: ${body.error || 'Unknown error'}`);
            }
        } catch (e) {
            log(colors.red, '❌ Failed to parse response as JSON');
            console.log(response.body);
        }
    } catch (error) {
        log(colors.red, `❌ Request failed: ${error.message}`);
    }

    console.log('');
    log(colors.blue, '========================================');
    log(colors.blue, 'Test Complete');
    log(colors.blue, '========================================');
}

// Run tests
testLoginEndpoint().catch(console.error);

