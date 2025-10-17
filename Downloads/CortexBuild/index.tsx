
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import ErrorBoundary from './components/ErrorBoundary';

console.log('🚀 [index.tsx] Starting React app...');

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('❌ [index.tsx] Root element not found!');
  throw new Error("Could not find root element to mount to");
}

console.log('✅ [index.tsx] Root element found:', rootElement);

const root = ReactDOM.createRoot(rootElement);
console.log('✅ [index.tsx] React root created');

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);

console.log('✅ [index.tsx] React app rendered');