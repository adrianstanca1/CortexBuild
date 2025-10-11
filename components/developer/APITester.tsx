/**
 * API Testing Tool
 * Test REST APIs with different methods, headers, and body
 */

import React, { useState } from 'react';
import {
    Send,
    Plus,
    Trash2,
    Copy,
    Check,
    Globe,
    Clock,
    AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Header {
    key: string;
    value: string;
}

interface APITesterProps {
    isDarkMode: boolean;
}

const APITester: React.FC<APITesterProps> = ({ isDarkMode }) => {
    const [method, setMethod] = useState<'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'>('GET');
    const [url, setUrl] = useState('https://api.example.com/users');
    const [headers, setHeaders] = useState<Header[]>([
        { key: 'Content-Type', value: 'application/json' }
    ]);
    const [body, setBody] = useState('{\n  "name": "John Doe",\n  "email": "john@example.com"\n}');
    const [response, setResponse] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [responseTime, setResponseTime] = useState<number | null>(null);
    const [copied, setCopied] = useState(false);

    const addHeader = () => {
        setHeaders([...headers, { key: '', value: '' }]);
    };

    const removeHeader = (index: number) => {
        setHeaders(headers.filter((_, i) => i !== index));
    };

    const updateHeader = (index: number, field: 'key' | 'value', value: string) => {
        const newHeaders = [...headers];
        newHeaders[index][field] = value;
        setHeaders(newHeaders);
    };

    const sendRequest = async () => {
        setIsLoading(true);
        const startTime = Date.now();

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        const mockResponse = {
            status: 200,
            statusText: 'OK',
            data: {
                id: 1,
                name: 'John Doe',
                email: 'john@example.com',
                role: 'developer',
                created_at: '2024-01-15T10:30:00Z'
            },
            headers: {
                'content-type': 'application/json',
                'x-request-id': 'abc-123-def-456'
            }
        };

        setResponse(mockResponse);
        setResponseTime(Date.now() - startTime);
        setIsLoading(false);
        toast.success('Request completed');
    };

    const copyResponse = () => {
        if (response) {
            navigator.clipboard.writeText(JSON.stringify(response.data, null, 2));
            setCopied(true);
            toast.success('Response copied to clipboard');
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const getMethodColor = (m: string) => {
        switch (m) {
            case 'GET': return 'bg-blue-600 hover:bg-blue-700';
            case 'POST': return 'bg-green-600 hover:bg-green-700';
            case 'PUT': return 'bg-yellow-600 hover:bg-yellow-700';
            case 'DELETE': return 'bg-red-600 hover:bg-red-700';
            case 'PATCH': return 'bg-purple-600 hover:bg-purple-700';
            default: return 'bg-gray-600 hover:bg-gray-700';
        }
    };

    const bgClass = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
    const inputClass = isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300';

    return (
        <div className={`${bgClass} border rounded-xl shadow-lg h-full flex flex-col`}>
            {/* Header */}
            <div className="p-4 border-b border-gray-700">
                <div className="flex items-center gap-2 mb-4">
                    <Globe className="h-5 w-5 text-green-500" />
                    <h3 className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        API Tester
                    </h3>
                </div>

                {/* Request Builder */}
                <div className="space-y-3">
                    {/* Method & URL */}
                    <div className="flex gap-2">
                        <select
                            value={method}
                            onChange={(e) => setMethod(e.target.value as any)}
                            className={`px-4 py-2 rounded-lg border ${inputClass} focus:outline-none focus:ring-2 focus:ring-green-500 font-semibold`}
                        >
                            <option value="GET">GET</option>
                            <option value="POST">POST</option>
                            <option value="PUT">PUT</option>
                            <option value="DELETE">DELETE</option>
                            <option value="PATCH">PATCH</option>
                        </select>
                        <input
                            type="text"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://api.example.com/endpoint"
                            className={`flex-1 px-4 py-2 rounded-lg border ${inputClass} focus:outline-none focus:ring-2 focus:ring-green-500`}
                        />
                        <button
                            type="button"
                            onClick={sendRequest}
                            disabled={isLoading}
                            className={`flex items-center gap-2 px-6 py-2 ${getMethodColor(method)} text-white rounded-lg transition-colors disabled:opacity-50 font-semibold`}
                        >
                            <Send className="h-4 w-4" />
                            {isLoading ? 'Sending...' : 'Send'}
                        </button>
                    </div>

                    {/* Headers */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className={`text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                Headers
                            </label>
                            <button
                                type="button"
                                onClick={addHeader}
                                className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
                                    isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                                }`}
                            >
                                <Plus className="h-3 w-3" />
                                Add Header
                            </button>
                        </div>
                        <div className="space-y-2">
                            {headers.map((header, index) => (
                                <div key={index} className="flex gap-2">
                                    <input
                                        type="text"
                                        value={header.key}
                                        onChange={(e) => updateHeader(index, 'key', e.target.value)}
                                        placeholder="Header name"
                                        className={`flex-1 px-3 py-2 rounded-lg border ${inputClass} focus:outline-none focus:ring-2 focus:ring-green-500 text-sm`}
                                    />
                                    <input
                                        type="text"
                                        value={header.value}
                                        onChange={(e) => updateHeader(index, 'value', e.target.value)}
                                        placeholder="Header value"
                                        className={`flex-1 px-3 py-2 rounded-lg border ${inputClass} focus:outline-none focus:ring-2 focus:ring-green-500 text-sm`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeHeader(index)}
                                        className={`p-2 rounded-lg transition-colors ${
                                            isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                                        }`}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Body (for POST/PUT/PATCH) */}
                    {['POST', 'PUT', 'PATCH'].includes(method) && (
                        <div>
                            <label className={`text-sm font-semibold mb-2 block ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                Request Body (JSON)
                            </label>
                            <textarea
                                value={body}
                                onChange={(e) => setBody(e.target.value)}
                                className={`w-full px-3 py-2 rounded-lg border ${inputClass} focus:outline-none focus:ring-2 focus:ring-green-500 font-mono text-sm resize-none`}
                                rows={6}
                                placeholder='{\n  "key": "value"\n}'
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Response */}
            <div className="flex-1 overflow-auto p-4">
                {response ? (
                    <div className="space-y-4">
                        {/* Response Status */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`px-3 py-1 rounded-lg font-semibold ${
                                    response.status < 300 ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                                }`}>
                                    {response.status} {response.statusText}
                                </div>
                                {responseTime && (
                                    <div className="flex items-center gap-1 text-sm text-gray-500">
                                        <Clock className="h-4 w-4" />
                                        {responseTime}ms
                                    </div>
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={copyResponse}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                                    isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                                }`}
                            >
                                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                {copied ? 'Copied!' : 'Copy'}
                            </button>
                        </div>

                        {/* Response Body */}
                        <div>
                            <h4 className={`text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                Response Body
                            </h4>
                            <pre className={`p-4 rounded-lg overflow-auto text-sm ${isDarkMode ? 'bg-gray-900 text-green-400' : 'bg-gray-50 text-gray-800'}`}>
                                {JSON.stringify(response.data, null, 2)}
                            </pre>
                        </div>

                        {/* Response Headers */}
                        <div>
                            <h4 className={`text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                Response Headers
                            </h4>
                            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                                {Object.entries(response.headers).map(([key, value]) => (
                                    <div key={key} className="flex gap-2 text-sm mb-1">
                                        <span className={`font-semibold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                                            {key}:
                                        </span>
                                        <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                                            {String(value)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <Send className={`h-12 w-12 mb-3 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Send a request to see the response
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default APITester;

