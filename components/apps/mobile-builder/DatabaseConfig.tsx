/**
 * Database Configuration Components
 * Handles 3 database options: Free, Company, Custom
 */

import React, { useState } from 'react';
import { Database, CheckCircle, AlertCircle, Loader, Link, Key, Server } from 'lucide-react';
import toast from 'react-hot-toast';

interface DatabaseConfigProps {
    databaseType: 'free' | 'company' | 'custom';
    config: any;
    onConfigChange: (config: any) => void;
    isDarkMode?: boolean;
}

export const FreeDatabase: React.FC<{ isDarkMode?: boolean }> = ({ isDarkMode = true }) => {
    const [isProvisioning, setIsProvisioning] = useState(false);
    const [isProvisioned, setIsProvisioned] = useState(false);

    const provisionDatabase = async () => {
        setIsProvisioning(true);
        // Simulate database provisioning
        await new Promise(resolve => setTimeout(resolve, 2000));
        setIsProvisioning(false);
        setIsProvisioned(true);
        toast.success('Database provisioned successfully!');
    };

    return (
        <div className="space-y-6">
            <div className={`p-6 rounded-xl border ${
                isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
            }`}>
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-green-500/20 rounded-lg">
                        <Database className="h-6 w-6 text-green-500" />
                    </div>
                    <div className="flex-1">
                        <h3 className={`text-lg font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            Free Built-in Database
                        </h3>
                        <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Your app will use a pre-configured Supabase database with automatic provisioning.
                            Perfect for prototyping and small-scale applications.
                        </p>

                        {!isProvisioned ? (
                            <button
                                type="button"
                                onClick={provisionDatabase}
                                disabled={isProvisioning}
                                className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg font-semibold flex items-center gap-2 transition-all disabled:opacity-50"
                            >
                                {isProvisioning ? (
                                    <>
                                        <Loader className="h-5 w-5 animate-spin" />
                                        Provisioning...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="h-5 w-5" />
                                        Provision Database
                                    </>
                                )}
                            </button>
                        ) : (
                            <div className="flex items-center gap-2 text-green-500">
                                <CheckCircle className="h-5 w-5" />
                                <span className="font-semibold">Database Ready!</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {isProvisioned && (
                <div className={`p-6 rounded-xl border ${
                    isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                }`}>
                    <h4 className={`font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Database Details
                    </h4>
                    <div className="space-y-3">
                        <div>
                            <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                Database URL
                            </label>
                            <div className={`mt-1 px-4 py-2 rounded-lg font-mono text-sm ${
                                isDarkMode ? 'bg-gray-800 text-green-400' : 'bg-white text-green-600'
                            }`}>
                                https://supabase.cortexbuild.io/db-{Date.now()}
                            </div>
                        </div>
                        <div>
                            <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                API Key
                            </label>
                            <div className={`mt-1 px-4 py-2 rounded-lg font-mono text-sm ${
                                isDarkMode ? 'bg-gray-800 text-purple-400' : 'bg-white text-purple-600'
                            }`}>
                                eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export const CompanyDatabase: React.FC<{ isDarkMode?: boolean; onConfigChange: (config: any) => void }> = ({ 
    isDarkMode = true,
    onConfigChange 
}) => {
    const [connectionString, setConnectionString] = useState('');
    const [isTesting, setIsTesting] = useState(false);
    const [isConnected, setIsConnected] = useState(false);

    const testConnection = async () => {
        if (!connectionString.trim()) {
            toast.error('Please enter a connection string');
            return;
        }

        setIsTesting(true);
        // Simulate connection test
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsTesting(false);
        setIsConnected(true);
        onConfigChange({ connectionString });
        toast.success('Connected to company database!');
    };

    return (
        <div className="space-y-6">
            <div className={`p-6 rounded-xl border ${
                isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
            }`}>
                <div className="flex items-start gap-4 mb-6">
                    <div className="p-3 bg-blue-500/20 rounded-lg">
                        <Server className="h-6 w-6 text-blue-500" />
                    </div>
                    <div className="flex-1">
                        <h3 className={`text-lg font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            Company Database Connection
                        </h3>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Connect to your existing company database infrastructure.
                        </p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            Database Connection String
                        </label>
                        <input
                            type="text"
                            value={connectionString}
                            onChange={(e) => setConnectionString(e.target.value)}
                            placeholder="postgresql://user:password@host:port/database"
                            className={`w-full px-4 py-3 rounded-xl border font-mono text-sm ${
                                isDarkMode 
                                    ? 'bg-gray-800 text-white border-gray-600' 
                                    : 'bg-white text-gray-900 border-gray-300'
                            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        />
                    </div>

                    <button
                        type="button"
                        onClick={testConnection}
                        disabled={isTesting}
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-lg font-semibold flex items-center gap-2 transition-all disabled:opacity-50"
                    >
                        {isTesting ? (
                            <>
                                <Loader className="h-5 w-5 animate-spin" />
                                Testing Connection...
                            </>
                        ) : isConnected ? (
                            <>
                                <CheckCircle className="h-5 w-5" />
                                Connected
                            </>
                        ) : (
                            <>
                                <Link className="h-5 w-5" />
                                Test Connection
                            </>
                        )}
                    </button>
                </div>
            </div>

            {isConnected && (
                <div className={`p-4 rounded-xl border ${
                    isDarkMode ? 'bg-green-500/10 border-green-500/30' : 'bg-green-50 border-green-200'
                }`}>
                    <div className="flex items-center gap-2 text-green-500">
                        <CheckCircle className="h-5 w-5" />
                        <span className="font-semibold">Successfully connected to company database</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export const CustomDatabase: React.FC<{ isDarkMode?: boolean; onConfigChange: (config: any) => void }> = ({ 
    isDarkMode = true,
    onConfigChange 
}) => {
    const [apiEndpoint, setApiEndpoint] = useState('');
    const [apiKey, setApiKey] = useState('');
    const [mcpConnection, setMcpConnection] = useState('');
    const [customConfig, setCustomConfig] = useState('');
    const [isTesting, setIsTesting] = useState(false);
    const [isValid, setIsValid] = useState(false);

    const validateConfig = async () => {
        if (!apiEndpoint.trim()) {
            toast.error('Please enter an API endpoint');
            return;
        }

        setIsTesting(true);
        // Simulate validation
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsTesting(false);
        setIsValid(true);
        onConfigChange({ apiEndpoint, apiKey, mcpConnection, customConfig });
        toast.success('Configuration validated!');
    };

    return (
        <div className="space-y-6">
            <div className={`p-6 rounded-xl border ${
                isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
            }`}>
                <div className="flex items-start gap-4 mb-6">
                    <div className="p-3 bg-purple-500/20 rounded-lg">
                        <Key className="h-6 w-6 text-purple-500" />
                    </div>
                    <div className="flex-1">
                        <h3 className={`text-lg font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            Custom Database Configuration
                        </h3>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Configure a completely custom database connection with API endpoints, MCP, or custom credentials.
                        </p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            API Endpoint *
                        </label>
                        <input
                            type="text"
                            value={apiEndpoint}
                            onChange={(e) => setApiEndpoint(e.target.value)}
                            placeholder="https://api.example.com/v1"
                            className={`w-full px-4 py-3 rounded-xl border ${
                                isDarkMode 
                                    ? 'bg-gray-800 text-white border-gray-600' 
                                    : 'bg-white text-gray-900 border-gray-300'
                            } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                        />
                    </div>

                    <div>
                        <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            API Key / Token
                        </label>
                        <input
                            type="password"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            placeholder="Enter your API key or authentication token"
                            className={`w-full px-4 py-3 rounded-xl border ${
                                isDarkMode 
                                    ? 'bg-gray-800 text-white border-gray-600' 
                                    : 'bg-white text-gray-900 border-gray-300'
                            } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                        />
                    </div>

                    <div>
                        <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            MCP Connection (Optional)
                        </label>
                        <input
                            type="text"
                            value={mcpConnection}
                            onChange={(e) => setMcpConnection(e.target.value)}
                            placeholder="mcp://connection-string"
                            className={`w-full px-4 py-3 rounded-xl border ${
                                isDarkMode 
                                    ? 'bg-gray-800 text-white border-gray-600' 
                                    : 'bg-white text-gray-900 border-gray-300'
                            } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                        />
                    </div>

                    <div>
                        <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            Custom Configuration (JSON)
                        </label>
                        <textarea
                            value={customConfig}
                            onChange={(e) => setCustomConfig(e.target.value)}
                            placeholder='{"host": "localhost", "port": 5432, ...}'
                            rows={4}
                            className={`w-full px-4 py-3 rounded-xl border resize-none font-mono text-sm ${
                                isDarkMode 
                                    ? 'bg-gray-800 text-white border-gray-600' 
                                    : 'bg-white text-gray-900 border-gray-300'
                            } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                        />
                    </div>

                    <button
                        type="button"
                        onClick={validateConfig}
                        disabled={isTesting}
                        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-semibold flex items-center gap-2 transition-all disabled:opacity-50"
                    >
                        {isTesting ? (
                            <>
                                <Loader className="h-5 w-5 animate-spin" />
                                Validating...
                            </>
                        ) : isValid ? (
                            <>
                                <CheckCircle className="h-5 w-5" />
                                Validated
                            </>
                        ) : (
                            <>
                                <AlertCircle className="h-5 w-5" />
                                Validate Configuration
                            </>
                        )}
                    </button>
                </div>
            </div>

            {isValid && (
                <div className={`p-4 rounded-xl border ${
                    isDarkMode ? 'bg-green-500/10 border-green-500/30' : 'bg-green-50 border-green-200'
                }`}>
                    <div className="flex items-center gap-2 text-green-500">
                        <CheckCircle className="h-5 w-5" />
                        <span className="font-semibold">Configuration validated successfully</span>
                    </div>
                </div>
            )}
        </div>
    );
};

const DatabaseConfig: React.FC<DatabaseConfigProps> = ({ databaseType, config, onConfigChange, isDarkMode = true }) => {
    switch (databaseType) {
        case 'free':
            return <FreeDatabase isDarkMode={isDarkMode} />;
        case 'company':
            return <CompanyDatabase isDarkMode={isDarkMode} onConfigChange={onConfigChange} />;
        case 'custom':
            return <CustomDatabase isDarkMode={isDarkMode} onConfigChange={onConfigChange} />;
        default:
            return null;
    }
};

export default DatabaseConfig;

