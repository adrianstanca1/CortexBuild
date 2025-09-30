import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

// Simple Dashboard Component
const Dashboard = () => (
  <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
    <h1>🚀 ASAgents Ultimate v2.0.0</h1>
    <h2>Enhanced Construction Management Platform</h2>
    
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginTop: '30px' }}>
      
      <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px' }}>
        <h3>📊 Projects Overview</h3>
        <p><strong>Active Projects:</strong> 12</p>
        <p><strong>Total Budget:</strong> £8.4M</p>
        <p><strong>Avg Progress:</strong> 67%</p>
        <a href="/api/projects" target="_blank" style={{ color: '#0066cc' }}>→ Test Projects API</a>
      </div>

      <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px' }}>
        <h3>💰 Financial Status</h3>
        <p><strong>Total Revenue:</strong> £5.2M</p>
        <p><strong>Outstanding:</strong> £850K</p>
        <p><strong>Collection Rate:</strong> 94%</p>
        <a href="/api/invoices" target="_blank" style={{ color: '#0066cc' }}>→ Test Invoices API</a>
      </div>

      <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px' }}>
        <h3>👥 Team Performance</h3>
        <p><strong>Team Members:</strong> 45</p>
        <p><strong>Avg Utilization:</strong> 87%</p>
        <p><strong>Active Projects:</strong> 8</p>
        <a href="/api/team" target="_blank" style={{ color: '#0066cc' }}>→ Test Team API</a>
      </div>

      <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px' }}>
        <h3>📈 Analytics</h3>
        <p><strong>Completion Rate:</strong> 96%</p>
        <p><strong>On-Time Delivery:</strong> 89%</p>
        <p><strong>Client Satisfaction:</strong> 4.8/5</p>
        <a href="/api/analytics/dashboard" target="_blank" style={{ color: '#0066cc' }}>→ Test Analytics API</a>
      </div>

    </div>

    <div style={{ marginTop: '40px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
      <h3>🛠️ Enhanced Backend APIs</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px', marginTop: '20px' }}>
        
        <div>
          <h4>Projects API</h4>
          <ul>
            <li>Advanced filtering & pagination</li>
            <li>Real construction project data</li>
            <li>Progress tracking & analytics</li>
            <li>Team assignments & milestones</li>
          </ul>
        </div>

        <div>
          <h4>Invoices API</h4>
          <ul>
            <li>Complete invoice management</li>
            <li>Line item tracking</li>
            <li>Payment status monitoring</li>
            <li>Financial metrics & summaries</li>
          </ul>
        </div>

        <div>
          <h4>Team API</h4>
          <ul>
            <li>Comprehensive team profiles</li>
            <li>Skills & certification tracking</li>
            <li>Performance metrics</li>
            <li>Workload analysis</li>
          </ul>
        </div>

        <div>
          <h4>Analytics API</h4>
          <ul>
            <li>Real-time dashboard data</li>
            <li>Project performance metrics</li>
            <li>Financial analytics</li>
            <li>Team productivity insights</li>
          </ul>
        </div>

      </div>
    </div>

    <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#e8f5e8', borderRadius: '8px' }}>
      <h3>✅ Deployment Success</h3>
      <p><strong>Version:</strong> 2.0.0 Enhanced Edition</p>
      <p><strong>Status:</strong> Production Ready</p>
      <p><strong>Features:</strong> Enhanced Backend APIs, Modern React Frontend, Serverless Architecture</p>
      <p><strong>Performance:</strong> Optimized for construction management workflows</p>
    </div>

  </div>
);

// Health Check Component
const HealthCheck = () => {
  const [health, setHealth] = React.useState(null);
  
  React.useEffect(() => {
    fetch('/api/health')
      .then(res => res.json())
      .then(data => setHealth(data))
      .catch(err => setHealth({ error: err.message }));
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h2>🔍 Health Check</h2>
      <pre style={{ backgroundColor: '#f5f5f5', padding: '15px', borderRadius: '5px' }}>
        {JSON.stringify(health, null, 2)}
      </pre>
      <Link to="/" style={{ color: '#0066cc' }}>← Back to Dashboard</Link>
    </div>
  );
};

// Main App Component
const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/health" element={<HealthCheck />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;