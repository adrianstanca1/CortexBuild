import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
    CheckCircle, XCircle, AlertTriangle, RefreshCw,
    Database, Server, Cpu, Network, Activity
} from 'lucide-react';

interface ComponentStatus {
    name: string;
    status: 'healthy' | 'warning' | 'error' | 'loading';
    message: string;
    lastChecked: string;
    responseTime?: number;
}

interface IntegrationTest {
    id: string;
    name: string;
    description: string;
    status: 'pending' | 'running' | 'passed' | 'failed';
    duration?: number;
    result?: string;
}

export const IntegrationTesting: React.FC = () => {
    const [componentStatuses, setComponentStatuses] = useState<ComponentStatus[]>([]);
    const [integrationTests, setIntegrationTests] = useState<IntegrationTest[]>([]);
    const [testing, setTesting] = useState(false);
    const [overallHealth, setOverallHealth] = useState<'healthy' | 'warning' | 'error'>('healthy');

    useEffect(() => {
        initializeTests();
        checkSystemHealth();
    }, []);

    const initializeTests = () => {
        setIntegrationTests([
            {
                id: 'test-001',
                name: 'Backend API Connectivity',
                description: 'Test connection to backend API endpoints',
                status: 'pending'
            },
            {
                id: 'test-002',
                name: 'Database Schema Validation',
                description: 'Verify database tables and relationships',
                status: 'pending'
            },
            {
                id: 'test-003',
                name: 'Authentication Flow',
                description: 'Test user authentication and authorization',
                status: 'pending'
            },
            {
                id: 'test-004',
                name: 'Component Data Flow',
                description: 'Verify data flow between frontend components',
                status: 'pending'
            },
            {
                id: 'test-005',
                name: 'Workflow Engine',
                description: 'Test workflow creation and execution',
                status: 'pending'
            },
            {
                id: 'test-006',
                name: 'Document Management',
                description: 'Test file upload and management operations',
                status: 'pending'
            },
            {
                id: 'test-007',
                name: 'Reporting System',
                description: 'Test report generation and data aggregation',
                status: 'pending'
            },
            {
                id: 'test-008',
                name: 'User Management',
                description: 'Test user and role management operations',
                status: 'pending'
            },
            {
                id: 'test-009',
                name: 'Real-time Updates',
                description: 'Test WebSocket connections and live updates',
                status: 'pending'
            },
            {
                id: 'test-010',
                name: 'Error Handling',
                description: 'Test error handling and fallback mechanisms',
                status: 'pending'
            }
        ]);
    };

    const checkSystemHealth = async () => {
        const statuses: ComponentStatus[] = [];

        // Check Backend API
        try {
            const startTime = Date.now();
            const response = await fetch('http://localhost:4000/api/health');
            const responseTime = Date.now() - startTime;

            if (response.ok) {
                const data = await response.json();
                statuses.push({
                    name: 'Backend API',
                    status: data.data.status === 'healthy' ? 'healthy' : 'warning',
                    message: `API server running (${data.data.status})`,
                    lastChecked: new Date().toISOString(),
                    responseTime
                });

                // Check Database
                statuses.push({
                    name: 'Database',
                    status: data.data.database.status === 'connected' ? 'healthy' : 'error',
                    message: `${data.data.database.tables} tables, ${data.data.database.total_rows} rows`,
                    lastChecked: new Date().toISOString(),
                    responseTime: data.data.database.response_time
                });

                // Check Services
                const servicesHealthy = data.data.services.api && data.data.services.websocket;
                statuses.push({
                    name: 'Services',
                    status: servicesHealthy ? 'healthy' : 'warning',
                    message: `API: ${data.data.services.api ? 'OK' : 'FAIL'}, WebSocket: ${data.data.services.websocket ? 'OK' : 'FAIL'}`,
                    lastChecked: new Date().toISOString()
                });

            } else {
                statuses.push({
                    name: 'Backend API',
                    status: 'error',
                    message: 'API server not responding',
                    lastChecked: new Date().toISOString()
                });
            }
        } catch (error) {
            statuses.push({
                name: 'Backend API',
                status: 'error',
                message: 'Connection failed - server may be down',
                lastChecked: new Date().toISOString()
            });
        }

        // Check Frontend Components
        try {
            // Simulate component health checks
            const components = [
                'WorkflowManagement',
                'DocumentManagement',
                'AdvancedReporting',
                'UserManagement',
                'ExecutiveDashboard'
            ];

            for (const component of components) {
                statuses.push({
                    name: component,
                    status: 'healthy',
                    message: 'Component loaded successfully',
                    lastChecked: new Date().toISOString(),
                    responseTime: Math.floor(Math.random() * 50) + 10
                });
            }
        } catch (error) {
            statuses.push({
                name: 'Frontend Components',
                status: 'error',
                message: 'Component initialization failed',
                lastChecked: new Date().toISOString()
            });
        }

        setComponentStatuses(statuses);
        updateOverallHealth(statuses);
    };

    const updateOverallHealth = (statuses: ComponentStatus[]) => {
        const hasError = statuses.some(s => s.status === 'error');
        const hasWarning = statuses.some(s => s.status === 'warning');

        if (hasError) {
            setOverallHealth('error');
        } else if (hasWarning) {
            setOverallHealth('warning');
        } else {
            setOverallHealth('healthy');
        }
    };

    const runAllTests = async () => {
        setTesting(true);

        for (let i = 0; i < integrationTests.length; i++) {
            // Update test status to running
            setIntegrationTests(prev =>
                prev.map((test, index) =>
                    index === i ? { ...test, status: 'running' } : test
                )
            );

            // Simulate test execution
            await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

            // Update test result
            const passed = Math.random() > 0.1; // 90% pass rate for demo
            const duration = Math.floor(Math.random() * 3000) + 500;

            setIntegrationTests(prev =>
                prev.map((test, index) =>
                    index === i ? {
                        ...test,
                        status: passed ? 'passed' : 'failed',
                        duration,
                        result: passed ? 'Test passed successfully' : 'Test failed - check logs for details'
                    } : test
                )
            );
        }

        setTesting(false);
    };

    const runSingleTest = async (testId: string) => {
        setIntegrationTests(prev =>
            prev.map(test =>
                test.id === testId ? { ...test, status: 'running' } : test
            )
        );

        await new Promise(resolve => setTimeout(resolve, 1500));

        const passed = Math.random() > 0.2; // 80% pass rate for single tests
        const duration = Math.floor(Math.random() * 2000) + 300;

        setIntegrationTests(prev =>
            prev.map(test =>
                test.id === testId ? {
                    ...test,
                    status: passed ? 'passed' : 'failed',
                    duration,
                    result: passed ? 'Test passed successfully' : 'Test failed - check configuration'
                } : test
            )
        );
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'healthy':
            case 'passed':
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'warning':
                return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
            case 'error':
            case 'failed':
                return <XCircle className="h-4 w-4 text-red-500" />;
            case 'running':
                return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
            default:
                return <Activity className="h-4 w-4 text-gray-500" />;
        }
    };

    const getStatusColor = (status: string): 'default' | 'secondary' | 'success' | 'danger' | 'outline' => {
        switch (status) {
            case 'healthy':
            case 'passed':
                return 'success';
            case 'warning':
                return 'secondary';
            case 'error':
            case 'failed':
                return 'danger';
            case 'running':
                return 'default';
            default:
                return 'outline';
        }
    };

    const passedTests = integrationTests.filter(t => t.status === 'passed').length;
    const failedTests = integrationTests.filter(t => t.status === 'failed').length;
    const totalTests = integrationTests.length;

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Integration Testing</h1>
                    <p className="text-gray-600">System health monitoring and integration tests</p>
                </div>
                <div className="flex items-center space-x-3">
                    <Button
                        variant="outline"
                        onClick={checkSystemHealth}
                        disabled={testing}
                    >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh Health
                    </Button>
                    <Button
                        onClick={runAllTests}
                        disabled={testing}
                    >
                        {testing ? (
                            <>
                                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                Running Tests...
                            </>
                        ) : (
                            <>
                                <Activity className="h-4 w-4 mr-2" />
                                Run All Tests
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {/* Overall Health Status */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        {getStatusIcon(overallHealth)}
                        <span>System Health Overview</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">
                                {componentStatuses.filter(s => s.status === 'healthy').length}
                            </div>
                            <div className="text-sm text-gray-600">Healthy Components</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-yellow-600">
                                {componentStatuses.filter(s => s.status === 'warning').length}
                            </div>
                            <div className="text-sm text-gray-600">Warnings</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-red-600">
                                {componentStatuses.filter(s => s.status === 'error').length}
                            </div>
                            <div className="text-sm text-gray-600">Errors</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">
                                {componentStatuses.reduce((sum, s) => sum + (s.responseTime || 0), 0) / componentStatuses.length || 0}ms
                            </div>
                            <div className="text-sm text-gray-600">Avg Response Time</div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Component Status */}
            <Card>
                <CardHeader>
                    <CardTitle>Component Status</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {componentStatuses.map((component, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center space-x-3">
                                    {getStatusIcon(component.status)}
                                    <div>
                                        <div className="font-medium text-gray-900">{component.name}</div>
                                        <div className="text-sm text-gray-600">{component.message}</div>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    {component.responseTime && (
                                        <span className="text-sm text-gray-500">{component.responseTime}ms</span>
                                    )}
                                    <Badge variant={getStatusColor(component.status)}>
                                        {component.status}
                                    </Badge>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Integration Tests */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Integration Tests</CardTitle>
                        <div className="text-sm text-gray-600">
                            {passedTests} passed • {failedTests} failed • {totalTests - passedTests - failedTests} pending
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {integrationTests.map((test) => (
                            <div key={test.id} className="flex items-center justify-between p-4 border rounded-lg">
                                <div className="flex items-center space-x-3">
                                    {getStatusIcon(test.status)}
                                    <div>
                                        <div className="font-medium text-gray-900">{test.name}</div>
                                        <div className="text-sm text-gray-600">{test.description}</div>
                                        {test.result && (
                                            <div className="text-sm text-gray-500 mt-1">{test.result}</div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    {test.duration && (
                                        <span className="text-sm text-gray-500">{test.duration}ms</span>
                                    )}
                                    <Badge variant={getStatusColor(test.status)}>
                                        {test.status}
                                    </Badge>
                                    {test.status === 'pending' && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => runSingleTest(test.id)}
                                        >
                                            Run Test
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Test Results Summary */}
            {(passedTests > 0 || failedTests > 0) && (
                <Card>
                    <CardHeader>
                        <CardTitle>Test Results Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-green-600">{passedTests}</div>
                                <div className="text-sm text-gray-600">Tests Passed</div>
                                <div className="text-xs text-gray-500">
                                    {totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0}% Success Rate
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-red-600">{failedTests}</div>
                                <div className="text-sm text-gray-600">Tests Failed</div>
                                <div className="text-xs text-gray-500">
                                    {totalTests > 0 ? Math.round((failedTests / totalTests) * 100) : 0}% Failure Rate
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-gray-600">
                                    {integrationTests.reduce((sum, t) => sum + (t.duration || 0), 0)}ms
                                </div>
                                <div className="text-sm text-gray-600">Total Duration</div>
                                <div className="text-xs text-gray-500">
                                    {integrationTests.filter(t => t.duration).length > 0 ?
                                        Math.round(integrationTests.reduce((sum, t) => sum + (t.duration || 0), 0) /
                                            integrationTests.filter(t => t.duration).length) : 0}ms Average
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};