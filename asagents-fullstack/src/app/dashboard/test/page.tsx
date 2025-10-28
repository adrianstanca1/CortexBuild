'use client';

import Link from 'next/link';

export default function TestPage() {
  return (
    <div className="space-y-6">
      <div className="card">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">🔧 Debug Test Page</h1>
        
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Navigation Tests</h2>
            <div className="space-y-2">
              <div>
                <Link 
                  href="/dashboard/projects/1" 
                  className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  🔗 Test Project #1 Details (Link Component)
                </Link>
              </div>
              
              <div>
                <a 
                  href="/dashboard/projects/1" 
                  className="inline-block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  🔗 Test Project #1 Details (Anchor Tag)
                </a>
              </div>
              
              <div>
                <button 
                  onClick={() => window.location.href = '/dashboard/projects/1'}
                  className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
                >
                  🔗 Test Project #1 Details (JavaScript)
                </button>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">All Project Links</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4, 5].map(id => (
                <Link 
                  key={id}
                  href={`/dashboard/projects/${id}`}
                  className="block p-4 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <h3 className="font-medium">Project #{id}</h3>
                  <p className="text-sm text-gray-600">Click to view details</p>
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Current Status</h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p><strong>Current URL:</strong> {typeof window !== 'undefined' ? window.location.href : 'Loading...'}</p>
              <p><strong>User Agent:</strong> {typeof window !== 'undefined' ? navigator.userAgent : 'Loading...'}</p>
              <p><strong>JavaScript:</strong> ✅ Working (you can see this page)</p>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Quick Actions</h2>
            <div className="flex space-x-4">
              <Link href="/dashboard" className="btn-secondary">
                ← Back to Dashboard
              </Link>
              <Link href="/dashboard/projects" className="btn-primary">
                → Go to Projects
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
