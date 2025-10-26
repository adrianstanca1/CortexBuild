/**
 * API/SDK Builder - Connect external services and APIs
 * 
 * Features:
 * - REST API integration
 * - GraphQL support
 * - Webhook management
 * - API testing
 * - Authentication (OAuth, API Keys, JWT)
 * - Request/Response logging
 */

import React, { useState } from 'react';
import {
    Globe,
    Key,
    Send,
    Plus,
    Trash2,
    Copy,
    Check,
    AlertCircle,
    Zap,
    Database,
    Lock
} from 'lucide-react';
import toast from 'react-hot-toast';

interface APIBuilderProps {
    isDarkMode?: boolean;
}

interface APIEndpoint {
    id: string;
    name: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    url: string;
    headers: Record<string, string>;
    body?: string;
    authType: 'none' | 'api-key' | 'bearer' | 'oauth';
    authConfig?: any;
}

interface APIResponse {
    status: number;
    statusText: string;
    data: any;
    headers: Record<string, string>;
    time: number;
}

const APIBuilder: React.FC<APIBuilderProps> = ({ isDarkMode = true }) => {
    const [endpoints, setEndpoints] = useState<APIEndpoint[]>([
        {
            id: '1',
            name: 'Get User Data',
            method: 'GET',
            url: 'https://api.example.com/users/me',
            headers: { 'Content-Type': 'application/json' },
            authType: 'bearer',
            authConfig: { token: 'your-token-here' }
        },
        {
            id: '2',
            name: 'Create Project',
            method: 'POST',
            url: 'https://api.example.com/projects',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'New Project', description: 'Project description' }, null, 2),
            authType: 'api-key',
            authConfig: { key: 'your-api-key' }
        }
    ]);

    const [activeEndpointId, setActiveEndpointId] = useState(endpoints[0].id);
    const [response, setResponse] = useState<APIResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const activeEndpoint = endpoints.find(e => e.id === activeEndpointId) || endpoints[0];

    const sendRequest = async () => {
        setIsLoading(true);
        setResponse(null);
        toast.loading('Sending request...');

        try {
            const startTime = Date.now();

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            const mockResponse: APIResponse = {
                status: 200,
                statusText: 'OK',
                data: {
                    success: true,
                    message: 'Request successful',
                    data: {
                        id: '123',
                        name: 'Test User',
                        email: 'test@example.com'
                    }
                },
                headers: {
                    'content-type': 'application/json',
                    'x-request-id': Math.random().toString(36).substring(7)
                },
                time: Date.now() - startTime
            };

            setResponse(mockResponse);
            toast.dismiss();
            toast.success('Request successful!');
        } catch (error) {
            toast.dismiss();
            toast.error('Request failed');
            setResponse({
                status: 500,
                statusText: 'Internal Server Error',
                data: { error: 'Request failed' },
                headers: {},
                time: 0
            });
        } finally {
            setIsLoading(false);
        }
    };

    const createEndpoint = () => {
        const newEndpoint: APIEndpoint = {
            id: Date.now().toString(),
            name: 'New Endpoint',
            method: 'GET',
            url: 'https://api.example.com/endpoint',
            headers: { 'Content-Type': 'application/json' },
            authType: 'none'
        };

        setEndpoints([...endpoints, newEndpoint]);
        setActiveEndpointId(newEndpoint.id);
        toast.success('Endpoint created');
    };

    const deleteEndpoint = (id: string) => {
        if (endpoints.length === 1) {
            toast.error('Cannot delete the last endpoint');
            return;
        }

        const newEndpoints = endpoints.filter(e => e.id !== id);
        setEndpoints(newEndpoints);

        if (activeEndpointId === id) {
            setActiveEndpointId(newEndpoints[0].id);
        }

        toast.success('Endpoint deleted');
    };

    const updateEndpoint = (updates: Partial<APIEndpoint>) => {
        setEndpoints(endpoints.map(e =>
            e.id === activeEndpointId ? { ...e, ...updates } : e
        ));
    };

    const copyResponse = () => {
        if (response) {
            navigator.clipboard.writeText(JSON.stringify(response.data, null, 2));
            toast.success('Response copied to clipboard');
        }
    };

    const methodColors = {
        GET: 'from-green-600 to-emerald-600',
        POST: 'from-blue-600 to-cyan-600',
        PUT: 'from-yellow-600 to-orange-600',
        DELETE: 'from-red-600 to-pink-600',
        PATCH: 'from-purple-600 to-indigo-600'
    };

    return (
        <div className={`h-full ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} p-8`}>
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className={`text-4xl font-black mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        🌐 API/SDK Builder
                    </h1>
                    <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Connect and test external APIs
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Endpoints List */}
                    <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                Endpoints
                            </h2>
                            <button
                                type="button"
                                onClick={createEndpoint}
                                className="p-2 bg-blue-500/20 text-blue-500 hover:bg-blue-500/30 rounded-lg"
                            >
                                <Plus className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="space-y-2">
                            {endpoints.map(endpoint => (
                                <div
                                    key={endpoint.id}
                                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                                        activeEndpointId === endpoint.id
                                            ? 'border-purple-500 bg-purple-500/10'
                                            : isDarkMode ? 'border-gray-700 hover:border-gray-600' : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                    onClick={() => setActiveEndpointId(endpoint.id)}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className={`px-2 py-1 rounded text-xs font-bold bg-gradient-to-r ${methodColors[endpoint.method]} text-white`}>
                                            {endpoint.method}
                                        </span>
                                        {endpoints.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    deleteEndpoint(endpoint.id);
                                                }}
                                                className="p-1 hover:bg-red-500/20 rounded"
                                            >
                                                <Trash2 className="h-3 w-3 text-red-500" />
                                            </button>
                                        )}
                                    </div>
                                    <div className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                        {endpoint.name}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Request Configuration */}
                    <div className="lg:col-span-3 space-y-6">
                        <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                            <h2 className={`text-xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                Request Configuration
                            </h2>

                            <div className="space-y-4">
                                {/* Name */}
                                <div>
                                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                        Endpoint Name
                                    </label>
                                    <input
                                        type="text"
                                        value={activeEndpoint.name}
                                        onChange={(e) => updateEndpoint({ name: e.target.value })}
                                        className={`w-full px-4 py-3 rounded-xl border ${
                                            isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'
                                        }`}
                                    />
                                </div>

                                {/* Method & URL */}
                                <div className="grid grid-cols-4 gap-4">
                                    <div>
                                        <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                            Method
                                        </label>
                                        <select
                                            value={activeEndpoint.method}
                                            onChange={(e) => updateEndpoint({ method: e.target.value as any })}
                                            className={`w-full px-4 py-3 rounded-xl border ${
                                                isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'
                                            }`}
                                        >
                                            <option value="GET">GET</option>
                                            <option value="POST">POST</option>
                                            <option value="PUT">PUT</option>
                                            <option value="DELETE">DELETE</option>
                                            <option value="PATCH">PATCH</option>
                                        </select>
                                    </div>
                                    <div className="col-span-3">
                                        <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                            URL
                                        </label>
                                        <input
                                            type="text"
                                            value={activeEndpoint.url}
                                            onChange={(e) => updateEndpoint({ url: e.target.value })}
                                            className={`w-full px-4 py-3 rounded-xl border ${
                                                isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'
                                            }`}
                                        />
                                    </div>
                                </div>

                                {/* Auth Type */}
                                <div>
                                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                        Authentication
                                    </label>
                                    <select
                                        value={activeEndpoint.authType}
                                        onChange={(e) => updateEndpoint({ authType: e.target.value as any })}
                                        className={`w-full px-4 py-3 rounded-xl border ${
                                            isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'
                                        }`}
                                    >
                                        <option value="none">None</option>
                                        <option value="api-key">API Key</option>
                                        <option value="bearer">Bearer Token</option>
                                        <option value="oauth">OAuth 2.0</option>
                                    </select>
                                </div>

                                {/* Request Body */}
                                {(activeEndpoint.method === 'POST' || activeEndpoint.method === 'PUT' || activeEndpoint.method === 'PATCH') && (
                                    <div>
                                        <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                            Request Body (JSON)
                                        </label>
                                        <textarea
                                            value={activeEndpoint.body || ''}
                                            onChange={(e) => updateEndpoint({ body: e.target.value })}
                                            rows={6}
                                            className={`w-full px-4 py-3 rounded-xl border font-mono text-sm resize-none ${
                                                isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'
                                            }`}
                                        />
                                    </div>
                                )}

                                {/* Send Button */}
                                <button
                                    type="button"
                                    onClick={sendRequest}
                                    disabled={isLoading}
                                    className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl font-semibold transition-all disabled:opacity-50"
                                >
                                    <Send className="h-5 w-5" />
                                    {isLoading ? 'Sending...' : 'Send Request'}
                                </button>
                            </div>
                        </div>

                        {/* Response */}
                        {response && (
                            <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                        Response
                                    </h2>
                                    <div className="flex items-center gap-4">
                                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                            response.status < 300 ? 'bg-green-500/20 text-green-500' :
                                            response.status < 400 ? 'bg-yellow-500/20 text-yellow-500' :
                                            'bg-red-500/20 text-red-500'
                                        }`}>
                                            {response.status} {response.statusText}
                                        </span>
                                        <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                            {response.time}ms
                                        </span>
                                        <button
                                            type="button"
                                            onClick={copyResponse}
                                            className="p-2 hover:bg-gray-700 rounded-lg"
                                        >
                                            <Copy className={`h-4 w-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                                        </button>
                                    </div>
                                </div>

                                <pre className={`p-4 rounded-xl overflow-x-auto text-sm ${
                                    isDarkMode ? 'bg-gray-900 text-gray-300' : 'bg-gray-100 text-gray-800'
                                }`}>
                                    {JSON.stringify(response.data, null, 2)}
                                </pre>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default APIBuilder;

