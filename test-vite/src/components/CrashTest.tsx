import { useState } from 'react';

const CrashTest = () => {
  const [shouldCrash, setShouldCrash] = useState(false);

  if (shouldCrash) {
    throw new Error('This is a test crash to demonstrate error boundary functionality');
  }

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h2>Error Boundary Test</h2>
      <p>Click the button below to test the error boundary:</p>
      <button
        onClick={() => setShouldCrash(true)}
        style={{
          padding: '0.5rem 1rem',
          backgroundColor: '#dc2626',
          color: 'white',
          border: 'none',
          borderRadius: '0.375rem',
          cursor: 'pointer',
          margin: '1rem'
        }}
      >
        Test Crash
      </button>
      <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
        This will trigger an error that should be caught by the ErrorBoundary
      </p>
    </div>
  );
};

export default CrashTest;