import React, { useState, useEffect } from 'react';
import { Zap, Send, Copy, Check, Download } from 'lucide-react';

interface APIEndpoint {
  method: string;
  path: string;
  description: string;
}

export const DeveloperAPIExplorer: React.FC = () => {
  const [endpoints, setEndpoints] = useState<APIEndpoint[]>([]);
  const [selectedMethod, setSelectedMethod] = useState('GET');
  const [url, setUrl] = useState('http://localhost:3001/api/');
  const [headers, setHeaders] = useState<Record<string, string>>({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  });
  const [body, setBody] = useState('{\n  \n}');
  const [response, setResponse] = useState('');
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchEndpoints();
  }, []);

  const fetchEndpoints = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3001/api/developer/endpoints', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setEndpoints(data.endpoints || []);
      }
    } catch (error) {
      console.error('Failed to fetch endpoints:', error);
      // Demo endpoints
      setEndpoints([
        { method: 'GET', path: '/api/projects', description: 'Get all projects' },
        { method: 'POST', path: '/api/projects', description: 'Create new project' },
        { method: 'GET', path: '/api/users', description: 'Get all users' },
        { method: 'POST', path: '/api/auth/login', description: 'User login' },
        { method: 'GET', path: '/api/developer/stats', description: 'Get developer stats' }
      ]);
    }
  };

  const sendRequest = async () => {
    setIsLoading(true);
    setResponse('');
    setResponseStatus(null);

    try {
      const options: RequestInit = {
        method: selectedMethod,
        headers: headers
      };

      if (['POST', 'PUT', 'PATCH'].includes(selectedMethod)) {
        options.body = body;
      }

      const res = await fetch(url, options);
      setResponseStatus(res.status);
      
      const contentType = res.headers.get('content-type');
      let responseData;
      
      if (contentType?.includes('application/json')) {
        responseData = await res.json();
        setResponse(JSON.stringify(responseData, null, 2));
      } else {
        responseData = await res.text();
        setResponse(responseData);
      }
    } catch (error: any) {
      setResponse(`Error: ${error.message}`);
      setResponseStatus(0);
    } finally {
      setIsLoading(false);
    }
  };

  const selectEndpoint = (endpoint: APIEndpoint) => {
    setSelectedMethod(endpoint.method);
    setUrl(`http://localhost:3001${endpoint.path}`);
  };

  const copyResponse = () => {
    navigator.clipboard.writeText(response);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadResponse = () => {
    const blob = new Blob([response], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `api-response-${Date.now()}.json`;
    a.click();
  };

  const addHeader = () => {
    const key = prompt('Header name:');
    const value = prompt('Header value:');
    if (key && value) {
      setHeaders(prev => ({ ...prev, [key]: value }));
    }
  };

  return (
    <div className="grid grid-cols-12 gap-4">
      {/* Endpoints List */}
      <div className="col-span-3 bg-[#252526] rounded-lg border border-[#3e3e42] overflow-hidden">
        <div className="bg-[#2d2d30] px-4 py-3 border-b border-[#3e3e42]">
          <h3 className="text-sm font-semibold text-white">API Endpoints</h3>
        </div>
        <div className="p-2 max-h-[600px] overflow-y-auto">
          {endpoints.map((endpoint, index) => (
            <button
              key={index}
              type="button"
              onClick={() => selectEndpoint(endpoint)}
              className="w-full text-left px-3 py-2 rounded hover:bg-[#2a2d2e] transition-colors mb-1"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                  endpoint.method === 'GET' ? 'bg-blue-600' :
                  endpoint.method === 'POST' ? 'bg-green-600' :
                  endpoint.method === 'PUT' ? 'bg-yellow-600' :
                  endpoint.method === 'DELETE' ? 'bg-red-600' :
                  'bg-gray-600'
                }`}>
                  {endpoint.method}
                </span>
                <span className="text-xs text-gray-400 truncate">{endpoint.path}</span>
              </div>
              <p className="text-xs text-gray-500">{endpoint.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Request Builder */}
      <div className="col-span-9 space-y-4">
        {/* Request Configuration */}
        <div className="bg-[#252526] rounded-lg border border-[#3e3e42] p-4">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-semibold text-white">API Request Builder</h3>
          </div>

          {/* Method & URL */}
          <div className="flex gap-2 mb-4">
            <select
              value={selectedMethod}
              onChange={(e) => setSelectedMethod(e.target.value)}
              className="px-3 py-2 bg-[#1e1e1e] text-white rounded border border-[#3e3e42] outline-none"
            >
              <option>GET</option>
              <option>POST</option>
              <option>PUT</option>
              <option>PATCH</option>
              <option>DELETE</option>
            </select>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter API URL"
              className="flex-1 px-3 py-2 bg-[#1e1e1e] text-white rounded border border-[#3e3e42] outline-none"
            />
            <button
              type="button"
              onClick={sendRequest}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded text-white transition-colors"
            >
              <Send className="w-4 h-4" />
              {isLoading ? 'Sending...' : 'Send'}
            </button>
          </div>

          {/* Headers */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-400">Headers</label>
              <button
                type="button"
                onClick={addHeader}
                className="text-xs text-blue-400 hover:text-blue-300"
              >
                + Add Header
              </button>
            </div>
            <div className="space-y-2">
              {Object.entries(headers).map(([key, value]) => (
                <div key={key} className="flex gap-2">
                  <input
                    type="text"
                    value={key}
                    readOnly
                    className="flex-1 px-3 py-1.5 bg-[#1e1e1e] text-gray-400 rounded border border-[#3e3e42] text-sm"
                  />
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => setHeaders(prev => ({ ...prev, [key]: e.target.value }))}
                    className="flex-1 px-3 py-1.5 bg-[#1e1e1e] text-white rounded border border-[#3e3e42] text-sm outline-none"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Body */}
          {['POST', 'PUT', 'PATCH'].includes(selectedMethod) && (
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Request Body (JSON)</label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full h-32 px-3 py-2 bg-[#1e1e1e] text-white rounded border border-[#3e3e42] font-mono text-sm outline-none resize-none"
                style={{ fontFamily: 'Fira Code, JetBrains Mono, monospace' }}
              />
            </div>
          )}
        </div>

        {/* Response */}
        <div className="bg-[#252526] rounded-lg border border-[#3e3e42] overflow-hidden">
          <div className="bg-[#2d2d30] px-4 py-3 border-b border-[#3e3e42] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-white">Response</span>
              {responseStatus !== null && (
                <span className={`text-xs px-2 py-1 rounded ${
                  responseStatus >= 200 && responseStatus < 300 ? 'bg-green-600' :
                  responseStatus >= 400 ? 'bg-red-600' :
                  'bg-yellow-600'
                }`}>
                  {responseStatus}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={copyResponse}
                disabled={!response}
                className="p-1.5 hover:bg-[#3e3e42] rounded transition-colors disabled:opacity-50"
                title="Copy response"
              >
                {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-gray-400" />}
              </button>
              <button
                type="button"
                onClick={downloadResponse}
                disabled={!response}
                className="p-1.5 hover:bg-[#3e3e42] rounded transition-colors disabled:opacity-50"
                title="Download response"
              >
                <Download className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>
          <div className="p-4 max-h-96 overflow-y-auto">
            <pre className="text-sm text-gray-300 font-mono whitespace-pre-wrap" style={{ fontFamily: 'Fira Code, JetBrains Mono, monospace' }}>
              {response || 'No response yet. Send a request to see the response.'}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

