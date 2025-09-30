import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import CrashTest from './components/CrashTest'

function App() {
  const [count, setCount] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [showCrashTest, setShowCrashTest] = useState(false)

  useEffect(() => {
    // Add global error handler for unhandled promises
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason);
      setError(`Promise rejection: ${event.reason}`);
    };

    // Add global error handler for JavaScript errors
    const handleError = (event: ErrorEvent) => {
      console.error('Global error:', event.error);
      setError(`Global error: ${event.error?.message || event.message}`);
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
    };
  }, []);

  const handleCountClick = () => {
    try {
      setCount((count) => count + 1);
    } catch (err) {
      console.error('Error in count click:', err);
      setError(`Count error: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  if (error) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '2rem',
        backgroundColor: '#fef2f2',
        border: '1px solid #fecaca',
        borderRadius: '0.5rem',
        margin: '2rem'
      }}>
        <h2 style={{ color: '#dc2626' }}>Application Error</h2>
        <p style={{ color: '#6b7280' }}>{error}</p>
        <button 
          onClick={() => setError(null)}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#dc2626',
            color: 'white',
            border: 'none',
            borderRadius: '0.375rem',
            cursor: 'pointer',
            marginTop: '1rem'
          }}
        >
          Clear Error
        </button>
      </div>
    );
  }

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={handleCountClick}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
      
      <div style={{ marginTop: '2rem', padding: '1rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}>
        <button 
          onClick={() => setShowCrashTest(!showCrashTest)}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: showCrashTest ? '#059669' : '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '0.375rem',
            cursor: 'pointer',
            marginBottom: '1rem'
          }}
        >
          {showCrashTest ? 'Hide' : 'Show'} Error Boundary Test
        </button>
        {showCrashTest && <CrashTest />}
      </div>
    </>
  )
}

export default App
