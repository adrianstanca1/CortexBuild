import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
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

// React DevTools integration for development
if (import.meta.env.DEV) {
  // Enable React DevTools profiler
  if (typeof window !== 'undefined' && (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__) {
    console.log('🔧 [DevTools] React DevTools detected and enabled');
  } else {
    console.log('💡 [DevTools] Install React DevTools browser extension for enhanced debugging');
    console.log('   Chrome: https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi');
    console.log('   Firefox: https://addons.mozilla.org/en-US/firefox/addon/react-devtools/');
  }
}