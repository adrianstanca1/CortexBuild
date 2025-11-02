/**
 * API Documentation Component
 * Task 3.3: API Documentation
 * 
 * Interactive API documentation with code examples and try-it-out functionality
 */

import React, { useState } from 'react';
import { Book, Code, Play, Copy, Check, ChevronDown, ChevronRight, Lock, Zap } from 'lucide-react';

interface APIDocumentationProps {
    isDarkMode?: boolean;
}

interface Endpoint {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    path: string;
    summary: string;
    description: string;
    auth: boolean;
    parameters?: Parameter[];
    requestBody?: RequestBody;
    responses: Response[];
    examples: CodeExample[];
}

interface Parameter {
    name: string;
    in: 'path' | 'query' | 'header';
    required: boolean;
    type: string;
    description: string;
}

interface RequestBody {
    required: boolean;
    schema: any;
    example: any;
}

interface Response {
    status: number;
    description: string;
    example: any;
}

interface CodeExample {
    language: string;
    code: string;
}

const APIDocumentation: React.FC<APIDocumentationProps> = ({ isDarkMode = true }) => {
    const [activeCategory, setActiveCategory] = useState<string>('authentication');
    const [expandedEndpoint, setExpandedEndpoint] = useState<string | null>(null);
    const [copiedCode, setCopiedCode] = useState<string | null>(null);

    const categories = [
        { id: 'authentication', name: 'Authentication', icon: Lock },
        { id: 'projects', name: 'Projects', icon: Book },
        { id: 'tasks', name: 'Tasks', icon: Check },
        { id: 'notifications', name: 'Notifications', icon: Zap },
    ];

    const endpoints: Record<string, Endpoint[]> = {
        authentication: [
            {
                method: 'POST',
                path: '/api/auth/login',
                summary: 'User login',
                description: 'Authenticate user and receive JWT token',
                auth: false,
                requestBody: {
                    required: true,
                    schema: {
                        email: 'string',
                        password: 'string'
                    },
                    example: {
                        email: 'user@example.com',
                        password: 'password123'
                    }
                },
                responses: [
                    {
                        status: 200,
                        description: 'Login successful',
                        example: {
                            token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                            user: {
                                id: 'user_123',
                                email: 'user@example.com',
                                name: 'John Doe',
                                role: 'developer'
                            }
                        }
                    },
                    {
                        status: 401,
                        description: 'Invalid credentials',
                        example: {
                            error: 'Invalid credentials',
                            message: 'Email or password is incorrect'
                        }
                    }
                ],
                examples: [
                    {
                        language: 'JavaScript',
                        code: `const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
});
const data = await response.json();`
                    },
                    {
                        language: 'cURL',
                        code: `curl -X POST https://api.cortexbuild.com/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"email":"user@example.com","password":"password123"}'`
                    }
                ]
            },
            {
                method: 'GET',
                path: '/api/auth/me',
                summary: 'Get current user',
                description: 'Get authenticated user information',
                auth: true,
                responses: [
                    {
                        status: 200,
                        description: 'User information',
                        example: {
                            id: 'user_123',
                            email: 'user@example.com',
                            name: 'John Doe',
                            role: 'developer'
                        }
                    }
                ],
                examples: [
                    {
                        language: 'JavaScript',
                        code: `const response = await fetch('/api/auth/me', {
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN_HERE'
  }
});
const user = await response.json();`
                    }
                ]
            }
        ],
        projects: [
            {
                method: 'GET',
                path: '/api/projects',
                summary: 'List projects',
                description: 'Get all projects for the authenticated user',
                auth: true,
                responses: [
                    {
                        status: 200,
                        description: 'List of projects',
                        example: [
                            {
                                id: 'proj_789',
                                name: 'My Project',
                                description: 'Project description',
                                owner_id: 'user_123',
                                created_at: '2025-01-01T00:00:00Z'
                            }
                        ]
                    }
                ],
                examples: [
                    {
                        language: 'JavaScript',
                        code: `const response = await fetch('/api/projects', {
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN_HERE'
  }
});
const projects = await response.json();`
                    }
                ]
            },
            {
                method: 'POST',
                path: '/api/projects',
                summary: 'Create project',
                description: 'Create a new project',
                auth: true,
                requestBody: {
                    required: true,
                    schema: {
                        name: 'string',
                        description: 'string'
                    },
                    example: {
                        name: 'New Project',
                        description: 'Project description'
                    }
                },
                responses: [
                    {
                        status: 201,
                        description: 'Project created',
                        example: {
                            id: 'proj_789',
                            name: 'New Project',
                            description: 'Project description',
                            owner_id: 'user_123',
                            created_at: '2025-01-01T00:00:00Z'
                        }
                    }
                ],
                examples: [
                    {
                        language: 'JavaScript',
                        code: `const response = await fetch('/api/projects', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN_HERE',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'New Project',
    description: 'Project description'
  })
});
const project = await response.json();`
                    }
                ]
            }
        ],
        tasks: [
            {
                method: 'GET',
                path: '/api/tasks',
                summary: 'List tasks',
                description: 'Get tasks filtered by project or user',
                auth: true,
                parameters: [
                    {
                        name: 'projectId',
                        in: 'query',
                        required: false,
                        type: 'string',
                        description: 'Filter by project ID'
                    },
                    {
                        name: 'userId',
                        in: 'query',
                        required: false,
                        type: 'string',
                        description: 'Filter by user ID'
                    }
                ],
                responses: [
                    {
                        status: 200,
                        description: 'List of tasks',
                        example: [
                            {
                                id: 'task_101',
                                title: 'Implement feature',
                                status: 'in_progress',
                                priority: 'high',
                                project_id: 'proj_789'
                            }
                        ]
                    }
                ],
                examples: [
                    {
                        language: 'JavaScript',
                        code: `const response = await fetch('/api/tasks?projectId=proj_789', {
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN_HERE'
  }
});
const tasks = await response.json();`
                    }
                ]
            }
        ],
        notifications: [
            {
                method: 'GET',
                path: '/api/notifications',
                summary: 'List notifications',
                description: 'Get all notifications for the authenticated user',
                auth: true,
                responses: [
                    {
                        status: 200,
                        description: 'List of notifications',
                        example: [
                            {
                                id: 'notif_202',
                                type: 'task_assigned',
                                message: 'You have been assigned a new task',
                                read: false,
                                created_at: '2025-01-01T00:00:00Z'
                            }
                        ]
                    }
                ],
                examples: [
                    {
                        language: 'JavaScript',
                        code: `const response = await fetch('/api/notifications', {
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN_HERE'
  }
});
const notifications = await response.json();`
                    }
                ]
            }
        ]
    };

    const copyCode = (code: string, id: string) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(id);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    const getMethodColor = (method: string) => {
        switch (method) {
            case 'GET': return 'text-blue-500 bg-blue-500/10';
            case 'POST': return 'text-green-500 bg-green-500/10';
            case 'PUT': return 'text-yellow-500 bg-yellow-500/10';
            case 'DELETE': return 'text-red-500 bg-red-500/10';
            default: return 'text-gray-500 bg-gray-500/10';
        }
    };

    return (
        <div className={`p-6 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                    <Book className="h-8 w-8 text-blue-500" />
                    <h1 className="text-2xl font-bold">API Documentation</h1>
                </div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Complete API reference with interactive examples
                </p>
            </div>

            <div className="grid grid-cols-12 gap-6">
                {/* Sidebar */}
                <div className="col-span-3">
                    <div className={`rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} p-4`}>
                        <h3 className="text-sm font-semibold mb-3">Categories</h3>
                        <div className="space-y-1">
                            {categories.map((category) => {
                                const Icon = category.icon;
                                return (
                                    <button
                                        key={category.id}
                                        onClick={() => setActiveCategory(category.id)}
                                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                                            activeCategory === category.id
                                                ? 'bg-blue-600 text-white'
                                                : isDarkMode
                                                ? 'hover:bg-gray-700 text-gray-300'
                                                : 'hover:bg-gray-200 text-gray-700'
                                        }`}
                                    >
                                        <Icon className="h-4 w-4" />
                                        <span className="text-sm">{category.name}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Main Content - Will continue in next part */}
                <div className="col-span-9">
                    <div className="space-y-4">
                        {endpoints[activeCategory]?.map((endpoint, index) => {
                            const endpointId = `${endpoint.method}-${endpoint.path}`;
                            const isExpanded = expandedEndpoint === endpointId;

                            return (
                                <div
                                    key={endpointId}
                                    className={`rounded-lg border ${
                                        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                                    }`}
                                >
                                    {/* Endpoint Header - Clickable */}
                                    <button
                                        onClick={() => setExpandedEndpoint(isExpanded ? null : endpointId)}
                                        className="w-full p-4 flex items-center justify-between hover:bg-gray-700/50 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className={`px-2 py-1 rounded text-xs font-mono font-bold ${getMethodColor(endpoint.method)}`}>
                                                {endpoint.method}
                                            </span>
                                            <code className="text-sm font-mono">{endpoint.path}</code>
                                            {endpoint.auth && <Lock className="h-4 w-4 text-yellow-500" />}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                                {endpoint.summary}
                                            </span>
                                            {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                                        </div>
                                    </button>

                                    {/* Endpoint Details - Expandable */}
                                    {isExpanded && (
                                        <div className={`border-t p-4 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                                            <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                {endpoint.description}
                                            </p>

                                            {/* Parameters */}
                                            {endpoint.parameters && endpoint.parameters.length > 0 && (
                                                <div className="mb-4">
                                                    <h4 className="text-sm font-semibold mb-2">Parameters</h4>
                                                    <div className="space-y-2">
                                                        {endpoint.parameters.map((param) => (
                                                            <div key={param.name} className={`p-2 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                                                                <div className="flex items-center gap-2">
                                                                    <code className="text-sm font-mono text-blue-400">{param.name}</code>
                                                                    <span className="text-xs text-gray-500">({param.in})</span>
                                                                    {param.required && <span className="text-xs text-red-500">required</span>}
                                                                </div>
                                                                <p className="text-xs text-gray-400 mt-1">{param.description}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Request Body */}
                                            {endpoint.requestBody && (
                                                <div className="mb-4">
                                                    <h4 className="text-sm font-semibold mb-2">Request Body</h4>
                                                    <pre className={`p-3 rounded text-xs overflow-x-auto ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                                                        <code>{JSON.stringify(endpoint.requestBody.example, null, 2)}</code>
                                                    </pre>
                                                </div>
                                            )}

                                            {/* Responses */}
                                            <div className="mb-4">
                                                <h4 className="text-sm font-semibold mb-2">Responses</h4>
                                                <div className="space-y-2">
                                                    {endpoint.responses.map((response) => (
                                                        <div key={response.status}>
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className={`px-2 py-1 rounded text-xs font-mono ${
                                                                    response.status < 300 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                                                                }`}>
                                                                    {response.status}
                                                                </span>
                                                                <span className="text-sm">{response.description}</span>
                                                            </div>
                                                            <pre className={`p-3 rounded text-xs overflow-x-auto ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                                                                <code>{JSON.stringify(response.example, null, 2)}</code>
                                                            </pre>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Code Examples */}
                                            <div>
                                                <h4 className="text-sm font-semibold mb-2">Code Examples</h4>
                                                <div className="space-y-2">
                                                    {endpoint.examples.map((example, exIdx) => {
                                                        const codeId = `${endpointId}-${exIdx}`;
                                                        return (
                                                            <div key={exIdx}>
                                                                <div className="flex items-center justify-between mb-1">
                                                                    <span className="text-xs font-semibold">{example.language}</span>
                                                                    <button
                                                                        onClick={() => copyCode(example.code, codeId)}
                                                                        className="flex items-center gap-1 px-2 py-1 rounded text-xs hover:bg-gray-700 transition-colors"
                                                                    >
                                                                        {copiedCode === codeId ? (
                                                                            <>
                                                                                <Check className="h-3 w-3" />
                                                                                Copied!
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <Copy className="h-3 w-3" />
                                                                                Copy
                                                                            </>
                                                                        )}
                                                                    </button>
                                                                </div>
                                                                <pre className={`p-3 rounded text-xs overflow-x-auto ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                                                                    <code>{example.code}</code>
                                                                </pre>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default APIDocumentation;

