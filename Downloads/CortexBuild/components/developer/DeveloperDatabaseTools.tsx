import React, { useState, useEffect } from 'react';
import { Database, Play, Table, Download } from 'lucide-react';

export const DeveloperDatabaseTools: React.FC = () => {
  const [query, setQuery] = useState('SELECT * FROM users LIMIT 10;');
  const [results, setResults] = useState<any[]>([]);
  const [tables, setTables] = useState<string[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/developer/database/tables', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setTables(data.tables || []);
      }
    } catch (error) {
      console.error('Failed to fetch tables:', error);
      setTables(['users', 'companies', 'projects', 'tasks', 'clients']);
    }
  };

  const executeQuery = async () => {
    setIsExecuting(true);
    setError('');
    setResults([]);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/developer/database/query', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query })
      });

      const data = await response.json();

      if (data.success) {
        setResults(data.results || []);
      } else {
        setError(data.error || 'Query failed');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsExecuting(false);
    }
  };

  const selectTable = (table: string) => {
    setQuery(`SELECT * FROM ${table} LIMIT 10;`);
  };

  const exportResults = () => {
    const csv = convertToCSV(results);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `query-results-${Date.now()}.csv`;
    a.click();
  };

  const convertToCSV = (data: any[]) => {
    if (data.length === 0) return '';
    const headers = Object.keys(data[0]);
    const rows = data.map(row => headers.map(h => row[h]).join(','));
    return [headers.join(','), ...rows].join('\n');
  };

  return (
    <div className="grid grid-cols-12 gap-4">
      {/* Tables List */}
      <div className="col-span-3 bg-[#252526] rounded-lg border border-[#3e3e42] overflow-hidden">
        <div className="bg-[#2d2d30] px-4 py-3 border-b border-[#3e3e42]">
          <h3 className="text-sm font-semibold text-white">Database Tables</h3>
        </div>
        <div className="p-2">
          {tables.map(table => (
            <button
              key={table}
              type="button"
              onClick={() => selectTable(table)}
              className="w-full text-left px-3 py-2 rounded hover:bg-[#2a2d2e] transition-colors mb-1 flex items-center gap-2"
            >
              <Table className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-gray-300">{table}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Query Editor & Results */}
      <div className="col-span-9 space-y-4">
        {/* Query Editor */}
        <div className="bg-[#252526] rounded-lg border border-[#3e3e42] overflow-hidden">
          <div className="bg-[#2d2d30] px-4 py-3 border-b border-[#3e3e42] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-semibold text-white">SQL Query Editor</span>
            </div>
            <button
              type="button"
              onClick={executeQuery}
              disabled={isExecuting}
              className="flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 rounded text-sm text-white transition-colors"
            >
              <Play className="w-4 h-4" />
              {isExecuting ? 'Executing...' : 'Execute'}
            </button>
          </div>
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full h-32 px-4 py-3 bg-[#1e1e1e] text-white font-mono text-sm resize-none outline-none"
            style={{ fontFamily: 'Fira Code, JetBrains Mono, monospace' }}
            placeholder="Enter SQL query..."
          />
        </div>

        {/* Results */}
        <div className="bg-[#252526] rounded-lg border border-[#3e3e42] overflow-hidden">
          <div className="bg-[#2d2d30] px-4 py-3 border-b border-[#3e3e42] flex items-center justify-between">
            <span className="text-sm font-semibold text-white">
              Results {results.length > 0 && `(${results.length} rows)`}
            </span>
            {results.length > 0 && (
              <button
                type="button"
                onClick={exportResults}
                className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded text-sm text-white transition-colors"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            )}
          </div>
          <div className="p-4 max-h-96 overflow-auto">
            {error && (
              <div className="text-red-400 text-sm mb-4">{error}</div>
            )}
            {results.length > 0 ? (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#3e3e42]">
                    {Object.keys(results[0]).map(key => (
                      <th key={key} className="text-left px-3 py-2 text-gray-400 font-semibold">
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {results.map((row, i) => (
                    <tr key={i} className="border-b border-[#3e3e42] hover:bg-[#2a2d2e]">
                      {Object.values(row).map((value: any, j) => (
                        <td key={j} className="px-3 py-2 text-gray-300">
                          {value === null ? <span className="text-gray-500">NULL</span> : String(value)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : !error && (
              <p className="text-gray-400 text-center py-8">No results yet. Execute a query to see results.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

