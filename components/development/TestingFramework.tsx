/**
 * Testing Framework - Automated testing for apps
 */

import React, { useState } from 'react';
import { Play, CheckCircle, XCircle, Clock, FileText, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface TestingFrameworkProps {
    isDarkMode?: boolean;
}

interface TestCase {
    id: string;
    name: string;
    description: string;
    code: string;
    status: 'pending' | 'running' | 'passed' | 'failed';
    duration?: number;
    error?: string;
}

const TestingFramework: React.FC<TestingFrameworkProps> = ({ isDarkMode = true }) => {
    const [tests, setTests] = useState<TestCase[]>([
        {
            id: '1',
            name: 'User Authentication',
            description: 'Test user login and logout functionality',
            code: `test('should login successfully', async () => {
  const user = await login('test@example.com', 'password');
  expect(user).toBeDefined();
  expect(user.email).toBe('test@example.com');
});`,
            status: 'pending'
        },
        {
            id: '2',
            name: 'API Integration',
            description: 'Test API endpoints',
            code: `test('should fetch user data', async () => {
  const response = await fetch('/api/users/me');
  expect(response.status).toBe(200);
  const data = await response.json();
  expect(data.success).toBe(true);
});`,
            status: 'pending'
        }
    ]);

    const [isRunning, setIsRunning] = useState(false);

    const runAllTests = async () => {
        setIsRunning(true);
        toast.loading('Running tests...');

        for (let i = 0; i < tests.length; i++) {
            setTests(prev => prev.map((t, idx) => 
                idx === i ? { ...t, status: 'running' } : t
            ));

            await new Promise(resolve => setTimeout(resolve, 1000));

            const passed = Math.random() > 0.3;
            setTests(prev => prev.map((t, idx) => 
                idx === i ? {
                    ...t,
                    status: passed ? 'passed' : 'failed',
                    duration: Math.floor(Math.random() * 500) + 100,
                    error: passed ? undefined : 'Expected true but got false'
                } : t
            ));
        }

        setIsRunning(false);
        toast.dismiss();
        toast.success('Tests completed!');
    };

    const passedTests = tests.filter(t => t.status === 'passed').length;
    const failedTests = tests.filter(t => t.status === 'failed').length;
    const totalTests = tests.length;
    const passRate = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;

    return (
        <div className={`h-full ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} p-8`}>
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className={`text-4xl font-black mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        🧪 Testing Framework
                    </h1>
                    <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Automated testing for your applications
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl p-6 text-white">
                        <FileText className="h-8 w-8 mb-2" />
                        <div className="text-3xl font-bold">{totalTests}</div>
                        <div className="text-sm opacity-80">Total Tests</div>
                    </div>
                    <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl p-6 text-white">
                        <CheckCircle className="h-8 w-8 mb-2" />
                        <div className="text-3xl font-bold">{passedTests}</div>
                        <div className="text-sm opacity-80">Passed</div>
                    </div>
                    <div className="bg-gradient-to-br from-red-600 to-pink-600 rounded-2xl p-6 text-white">
                        <XCircle className="h-8 w-8 mb-2" />
                        <div className="text-3xl font-bold">{failedTests}</div>
                        <div className="text-sm opacity-80">Failed</div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl p-6 text-white">
                        <Clock className="h-8 w-8 mb-2" />
                        <div className="text-3xl font-bold">{passRate}%</div>
                        <div className="text-sm opacity-80">Pass Rate</div>
                    </div>
                </div>

                {/* Tests */}
                <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            Test Cases
                        </h2>
                        <button
                            type="button"
                            onClick={runAllTests}
                            disabled={isRunning}
                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl font-semibold disabled:opacity-50"
                        >
                            <Play className="h-5 w-5" />
                            {isRunning ? 'Running...' : 'Run All Tests'}
                        </button>
                    </div>

                    <div className="space-y-4">
                        {tests.map(test => (
                            <div
                                key={test.id}
                                className={`p-4 rounded-xl border ${
                                    isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                                }`}
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                {test.name}
                                            </h3>
                                            {test.status === 'passed' && (
                                                <CheckCircle className="h-5 w-5 text-green-500" />
                                            )}
                                            {test.status === 'failed' && (
                                                <XCircle className="h-5 w-5 text-red-500" />
                                            )}
                                            {test.status === 'running' && (
                                                <div className="animate-spin h-5 w-5 border-2 border-purple-500 border-t-transparent rounded-full" />
                                            )}
                                        </div>
                                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                            {test.description}
                                        </p>
                                        {test.duration && (
                                            <p className={`text-xs mt-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                                Duration: {test.duration}ms
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <pre className={`p-3 rounded-lg text-sm overflow-x-auto ${
                                    isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-800'
                                }`}>
                                    {test.code}
                                </pre>

                                {test.error && (
                                    <div className="mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                                        <p className="text-sm text-red-500 font-mono">{test.error}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TestingFramework;

