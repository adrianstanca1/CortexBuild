/**
 * Database Viewer Component
 * View tables, run queries, inspect data
 */

import React, { useState } from 'react';
import {
    Database,
    Table,
    Search,
    Play,
    Download,
    RefreshCw,
    Eye,
    Filter
} from 'lucide-react';
import toast from 'react-hot-toast';

interface TableInfo {
    name: string;
    rows: number;
    size: string;
}

interface DatabaseViewerProps {
    isDarkMode: boolean;
}

const MOCK_TABLES: TableInfo[] = [
    { name: 'users', rows: 1247, size: '2.4 MB' },
    { name: 'projects', rows: 523, size: '1.8 MB' },
    { name: 'tasks', rows: 3891, size: '5.2 MB' },
    { name: 'companies', rows: 156, size: '0.9 MB' },
    { name: 'invoices', rows: 892, size: '3.1 MB' }
];

const MOCK_QUERY_RESULTS = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'developer', created_at: '2024-01-15' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'admin', created_at: '2024-01-16' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'user', created_at: '2024-01-17' }
];

const DatabaseViewer: React.FC<DatabaseViewerProps> = ({ isDarkMode }) => {
    const [selectedTable, setSelectedTable] = useState<string | null>(null);
    const [sqlQuery, setSqlQuery] = useState('SELECT * FROM users LIMIT 10;');
    const [queryResults, setQueryResults] = useState<any[]>([]);
    const [isExecuting, setIsExecuting] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const executeQuery = async () => {
        if (!sqlQuery.trim()) {
            toast.error('Please enter a SQL query');
            return;
        }

        setIsExecuting(true);
        // Simulate query execution
        await new Promise(resolve => setTimeout(resolve, 800));
        setQueryResults(MOCK_QUERY_RESULTS);
        setIsExecuting(false);
        toast.success('Query executed successfully');
    };

    const handleTableClick = (tableName: string) => {
        setSelectedTable(tableName);
        setSqlQuery(`SELECT * FROM ${tableName} LIMIT 10;`);
        toast.success(`Selected table: ${tableName}`);
    };

    const exportResults = () => {
        toast.success('Results exported to CSV');
    };

    const filteredTables = MOCK_TABLES.filter(table =>
        table.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const bgClass = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
    const inputClass = isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300';

    return (
        <div className={`${bgClass} border rounded-xl shadow-lg h-full flex flex-col`}>
            {/* Header */}
            <div className="p-4 border-b border-gray-700">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Database className="h-5 w-5 text-blue-500" />
                        <h3 className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            Database Viewer
                        </h3>
                    </div>
                    <button
                        type="button"
                        className={`p-2 rounded-lg transition-colors ${
                            isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                        }`}
                        title="Refresh"
                    >
                        <RefreshCw className="h-4 w-4" />
                    </button>
                </div>

                {/* Connection Info */}
                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Connected to PostgreSQL
                    </span>
                    <span className={`ml-auto text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {MOCK_TABLES.length} tables
                    </span>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Tables Sidebar */}
                <div className={`w-64 border-r ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} flex flex-col`}>
                    <div className="p-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search tables..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className={`w-full pl-10 pr-3 py-2 rounded-lg border ${inputClass} focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm`}
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-2">
                        {filteredTables.map((table) => (
                            <div
                                key={table.name}
                                onClick={() => handleTableClick(table.name)}
                                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all mb-1 ${
                                    selectedTable === table.name
                                        ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white'
                                        : isDarkMode
                                        ? 'hover:bg-gray-700 text-gray-300'
                                        : 'hover:bg-gray-100 text-gray-700'
                                }`}
                            >
                                <Table className="h-4 w-4 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{table.name}</p>
                                    <p className={`text-xs ${selectedTable === table.name ? 'text-white/70' : 'text-gray-500'}`}>
                                        {table.rows.toLocaleString()} rows
                                    </p>
                                </div>
                                <span className={`text-xs ${selectedTable === table.name ? 'text-white/70' : 'text-gray-500'}`}>
                                    {table.size}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Query Editor & Results */}
                <div className="flex-1 flex flex-col">
                    {/* SQL Editor */}
                    <div className="p-4 border-b border-gray-700">
                        <div className="flex items-center justify-between mb-2">
                            <label className={`text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                SQL Query
                            </label>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={executeQuery}
                                    disabled={isExecuting}
                                    className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-lg text-sm transition-all disabled:opacity-50"
                                >
                                    <Play className="h-4 w-4" />
                                    {isExecuting ? 'Running...' : 'Run Query'}
                                </button>
                            </div>
                        </div>
                        <textarea
                            value={sqlQuery}
                            onChange={(e) => setSqlQuery(e.target.value)}
                            className={`w-full px-3 py-2 rounded-lg border ${inputClass} focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm resize-none`}
                            rows={4}
                            placeholder="Enter SQL query..."
                        />
                    </div>

                    {/* Results */}
                    <div className="flex-1 overflow-auto p-4">
                        {queryResults.length > 0 ? (
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className={`text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                        Results ({queryResults.length} rows)
                                    </h4>
                                    <button
                                        type="button"
                                        onClick={exportResults}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                                            isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                                        }`}
                                    >
                                        <Download className="h-4 w-4" />
                                        Export CSV
                                    </button>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className={isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}>
                                                {Object.keys(queryResults[0]).map((key) => (
                                                    <th
                                                        key={key}
                                                        className={`px-4 py-2 text-left font-semibold ${
                                                            isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                                        }`}
                                                    >
                                                        {key}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {queryResults.map((row, idx) => (
                                                <tr
                                                    key={idx}
                                                    className={`border-b ${
                                                        isDarkMode ? 'border-gray-700 hover:bg-gray-700/50' : 'border-gray-200 hover:bg-gray-50'
                                                    }`}
                                                >
                                                    {Object.values(row).map((value: any, i) => (
                                                        <td
                                                            key={i}
                                                            className={`px-4 py-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                                                        >
                                                            {String(value)}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-center">
                                <Eye className={`h-12 w-12 mb-3 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    Run a query to see results
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DatabaseViewer;

