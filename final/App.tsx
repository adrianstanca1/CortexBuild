import React from 'react';

function App() {
  return (
    <div style={{
      padding: '50px',
      textAlign: 'center',
      fontFamily: 'Arial, sans-serif',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh',
      color: 'white'
    }}>
      <h1 style={{ fontSize: '48px', marginBottom: '30px' }}>
        🎉 SUCCESS!
      </h1>
      
      <div style={{
        background: 'rgba(255,255,255,0.1)',
        padding: '30px',
        borderRadius: '15px',
        maxWidth: '600px',
        margin: '0 auto',
        backdropFilter: 'blur(10px)'
      }}>
        <h2 style={{ color: '#4ade80', marginBottom: '20px' }}>
          ✅ ASAgents Final is Working!
        </h2>
        
        <div style={{ fontSize: '18px', lineHeight: '1.6' }}>
          <p>🚀 React is loading correctly</p>
          <p>⚡ Vite dev server is running</p>
          <p>💻 TypeScript is compiling</p>
          <p>🔥 Hot reload is active</p>
        </div>
        
        <div style={{
          background: 'rgba(34, 197, 94, 0.2)',
          border: '2px solid #22c55e',
          padding: '20px',
          borderRadius: '10px',
          margin: '30px 0'
        }}>
          <h3>🎯 Current Status:</h3>
          <p>Development server running on http://localhost:5173/</p>
          <p>Time: {new Date().toLocaleTimeString()}</p>
        </div>
        
        <button 
          onClick={() => alert('React is working perfectly!')}
          style={{
            background: '#3b82f6',
            color: 'white',
            padding: '15px 30px',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            cursor: 'pointer',
            margin: '10px'
          }}
        >
          Test React Click
        </button>
        
        <button 
          onClick={() => window.location.reload()}
          style={{
            background: '#10b981',
            color: 'white',
            padding: '15px 30px',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            cursor: 'pointer',
            margin: '10px'
          }}
        >
          Reload App
        </button>
      </div>
    </div>
  );
}

export default App;
            </Card>
          </div>
        </div>
      );
    }
    return (
      <div className="min-h-screen grid place-items-center p-6">
        <div className="w-full max-w-md">
          <Card className="mb-6">
            <div className="p-4">
              <h1 className="text-xl font-bold">AS Agents CMS</h1>
              <p className="text-sm text-muted-foreground mt-1">Sign in to continue</p>
            </div>
          </Card>
          <Login
            onSwitchToRegister={() => setMode('register')}
            onSwitchToForgotPassword={() => setMode('forgot')}
          />
        </div>
      </div>
    );
  }

  // Authenticated: render app shell with sidebar and main content
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-6 w-6 text-primary" aria-hidden>
            <path fill="currentColor" d="M12 2l9.196 5.31a1 1 0 01.5.866v10.648a1 1 0 01-.5.866L12 24l-9.196-4.31a1 1 0 01-.5-.866V8.176a1 1 0 01.5-.866L12 2z" opacity={0.12} />
            <path fill="currentColor" d="M12 4.5l-6.5 3.752v7.496L12 19.5l6.5-3.752V8.252L12 4.5zm0 1.732l5 2.886v5.764l-5 2.886-5-2.886V9.118l5-2.886z" />
          </svg>
          <h1 className="text-lg font-semibold">AS Agents</h1>
        </div>
        <button type="button" onClick={logout} className="text-sm text-red-600 hover:underline">Logout</button>
      </div>

      <div className="flex flex-1 min-h-0">
        <SidebarLite
          user={user}
          activeView={activeView}
          setActiveView={setActiveView}
          onLogout={logout}
          pendingTimesheetCount={0}
          openIncidentCount={0}
          unreadMessageCount={0}
          companyName={undefined}
        />
        <main className="flex-1 p-4 overflow-auto">
          {activeView === 'tools' ? (
            <ToolsView user={user} addToast={addToast} setActiveView={setActiveView} />
          ) : (
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-foreground">Coming soon</h2>
              <p className="text-sm text-muted-foreground mt-1">The "{activeView}" view will be restored next.</p>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
};

const App: React.FC = () => (
  <AuthProvider>
    <AppInner />
  </AuthProvider>
);

export default App;

