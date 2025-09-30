import React from 'react';

// Minimal test component to check if React is working
const TestApp = () => {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🔥 Test App - React is Working!</h1>
      <p>If you can see this, React is running successfully.</p>
      <div style={{ backgroundColor: '#f0f0f0', padding: '10px', marginTop: '20px' }}>
        <h3>System Status:</h3>
        <ul>
          <li>✅ React: Loaded</li>
          <li>✅ Vite: Running</li>
          <li>✅ TypeScript: Compiled</li>
        </ul>
      </div>
    </div>
  );
};

export default TestApp;