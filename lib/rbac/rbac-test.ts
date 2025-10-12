/**
 * RBAC Testing Utility
 * Test role-based access control system
 */

import {
    hasPermission,
    canAccessDashboard,
    canAccessFeature,
    UserRole,
    getRoleDisplayName,
    getRoleDescription
} from './permissions';

interface TestResult {
    role: UserRole;
    test: string;
    expected: boolean;
    actual: boolean;
    passed: boolean;
}

/**
 * Run comprehensive RBAC tests
 */
export function runRBACTests(): {
    results: TestResult[];
    summary: {
        total: number;
        passed: number;
        failed: number;
        passRate: number;
    };
} {
    const results: TestResult[] = [];

    // Test Super Admin permissions
    results.push(
        testPermission('super_admin', 'users', 'manage', true),
        testPermission('super_admin', 'companies', 'manage', true),
        testPermission('super_admin', 'projects', 'manage', true),
        testPermission('super_admin', 'billing', 'manage', true),
        testPermission('super_admin', 'settings', 'manage', true),
        testDashboard('super_admin', 'super-admin-dashboard', true),
        testDashboard('super_admin', 'company-admin-dashboard', true),
        testDashboard('super_admin', 'developer-dashboard', true),
        testFeature('super_admin', 'platform-settings', true),
        testFeature('super_admin', 'code-editor', true)
    );

    // Test Company Admin permissions
    results.push(
        testPermission('company_admin', 'users', 'manage', true),
        testPermission('company_admin', 'companies', 'manage', false),
        testPermission('company_admin', 'projects', 'manage', true),
        testPermission('company_admin', 'billing', 'read', true),
        testPermission('company_admin', 'platform_settings', 'manage', false),
        testDashboard('company_admin', 'super-admin-dashboard', false),
        testDashboard('company_admin', 'company-admin-dashboard', true),
        testDashboard('company_admin', 'developer-dashboard', false),
        testFeature('company_admin', 'platform-settings', false),
        testFeature('company_admin', 'company-settings', true),
        testFeature('company_admin', 'code-editor', false),
        testFeature('company_admin', 'daily-logs', true),
        testFeature('company_admin', 'safety-reports', true)
    );

    // Test Developer permissions
    results.push(
        testPermission('developer', 'users', 'manage', false),
        testPermission('developer', 'companies', 'manage', false),
        testPermission('developer', 'projects', 'manage', false),
        testPermission('developer', 'code_editor', 'manage', true),
        testPermission('developer', 'terminal', 'manage', true),
        testDashboard('developer', 'super-admin-dashboard', false),
        testDashboard('developer', 'company-admin-dashboard', false),
        testDashboard('developer', 'developer-dashboard', true),
        testFeature('developer', 'platform-settings', false),
        testFeature('developer', 'company-settings', false),
        testFeature('developer', 'code-editor', true),
        testFeature('developer', 'terminal', true),
        testFeature('developer', 'git-integration', true),
        testFeature('developer', 'daily-logs', false)
    );

    // Test Supervisor permissions
    results.push(
        testPermission('supervisor', 'users', 'manage', false),
        testPermission('supervisor', 'projects', 'read', true),
        testPermission('supervisor', 'daily_logs', 'create', true),
        testPermission('supervisor', 'safety_reports', 'create', true),
        testPermission('supervisor', 'billing', 'manage', false),
        testDashboard('supervisor', 'super-admin-dashboard', false),
        testDashboard('supervisor', 'company-admin-dashboard', false),
        testDashboard('supervisor', 'supervisor-dashboard', true),
        testFeature('supervisor', 'daily-logs', true),
        testFeature('supervisor', 'safety-reports', true),
        testFeature('supervisor', 'code-editor', false)
    );

    // Test Worker permissions
    results.push(
        testPermission('worker', 'users', 'manage', false),
        testPermission('worker', 'projects', 'read', true),
        testPermission('worker', 'daily_logs', 'create', true),
        testPermission('worker', 'time_tracking', 'create', true),
        testPermission('worker', 'billing', 'manage', false),
        testDashboard('worker', 'super-admin-dashboard', false),
        testDashboard('worker', 'company-admin-dashboard', false),
        testDashboard('worker', 'worker-dashboard', true),
        testFeature('worker', 'daily-logs', true),
        testFeature('worker', 'code-editor', false)
    );

    // Calculate summary
    const passed = results.filter(r => r.passed).length;
    const failed = results.filter(r => !r.passed).length;
    const total = results.length;
    const passRate = (passed / total) * 100;

    return {
        results,
        summary: {
            total,
            passed,
            failed,
            passRate
        }
    };
}

/**
 * Test a single permission
 */
function testPermission(
    role: UserRole,
    resource: string,
    action: 'create' | 'read' | 'update' | 'delete' | 'manage',
    expected: boolean
): TestResult {
    const actual = hasPermission(role, resource, action);
    return {
        role,
        test: `${role} can ${action} ${resource}`,
        expected,
        actual,
        passed: actual === expected
    };
}

/**
 * Test dashboard access
 */
function testDashboard(
    role: UserRole,
    dashboard: string,
    expected: boolean
): TestResult {
    const actual = canAccessDashboard(role, dashboard);
    return {
        role,
        test: `${role} can access ${dashboard}`,
        expected,
        actual,
        passed: actual === expected
    };
}

/**
 * Test feature access
 */
function testFeature(
    role: UserRole,
    feature: string,
    expected: boolean
): TestResult {
    const actual = canAccessFeature(role, feature);
    return {
        role,
        test: `${role} can use ${feature}`,
        expected,
        actual,
        passed: actual === expected
    };
}

/**
 * Print test results to console
 */
export function printTestResults(results: TestResult[], summary: any): void {
    console.log('\n🔒 RBAC Test Results\n');
    console.log('='.repeat(80));

    // Group by role
    const roles: UserRole[] = ['super_admin', 'company_admin', 'developer', 'supervisor', 'worker'];
    
    roles.forEach(role => {
        const roleResults = results.filter(r => r.role === role);
        const rolePassed = roleResults.filter(r => r.passed).length;
        const roleTotal = roleResults.length;
        
        console.log(`\n${getRoleDisplayName(role)} (${rolePassed}/${roleTotal} passed)`);
        console.log('-'.repeat(80));
        
        roleResults.forEach(result => {
            const icon = result.passed ? '✅' : '❌';
            const status = result.passed ? 'PASS' : 'FAIL';
            console.log(`${icon} [${status}] ${result.test}`);
            if (!result.passed) {
                console.log(`   Expected: ${result.expected}, Got: ${result.actual}`);
            }
        });
    });

    console.log('\n' + '='.repeat(80));
    console.log('\n📊 Summary:');
    console.log(`   Total Tests: ${summary.total}`);
    console.log(`   Passed: ${summary.passed} ✅`);
    console.log(`   Failed: ${summary.failed} ❌`);
    console.log(`   Pass Rate: ${summary.passRate.toFixed(2)}%`);
    console.log('\n' + '='.repeat(80) + '\n');
}

/**
 * Generate RBAC report
 */
export function generateRBACReport(): string {
    const { results, summary } = runRBACTests();
    
    let report = '# RBAC Test Report\n\n';
    report += `Generated: ${new Date().toISOString()}\n\n`;
    
    report += '## Summary\n\n';
    report += `- Total Tests: ${summary.total}\n`;
    report += `- Passed: ${summary.passed} ✅\n`;
    report += `- Failed: ${summary.failed} ❌\n`;
    report += `- Pass Rate: ${summary.passRate.toFixed(2)}%\n\n`;
    
    report += '## Results by Role\n\n';
    
    const roles: UserRole[] = ['super_admin', 'company_admin', 'developer', 'supervisor', 'worker'];
    
    roles.forEach(role => {
        const roleResults = results.filter(r => r.role === role);
        const rolePassed = roleResults.filter(r => r.passed).length;
        const roleTotal = roleResults.length;
        
        report += `### ${getRoleDisplayName(role)}\n\n`;
        report += `${getRoleDescription(role)}\n\n`;
        report += `**Tests:** ${rolePassed}/${roleTotal} passed\n\n`;
        
        report += '| Test | Expected | Actual | Status |\n';
        report += '|------|----------|--------|--------|\n';
        
        roleResults.forEach(result => {
            const status = result.passed ? '✅ PASS' : '❌ FAIL';
            report += `| ${result.test} | ${result.expected} | ${result.actual} | ${status} |\n`;
        });
        
        report += '\n';
    });
    
    return report;
}

/**
 * Run tests and log to console
 */
export function testRBAC(): void {
    const { results, summary } = runRBACTests();
    printTestResults(results, summary);
}

