// Enhanced App Component with Dual Backend Integration
import React, { useState, useEffect } from 'react';
// Corrected import paths to use existing hook/provider implementation
import { EnhancedAuthProvider, useEnhancedAuth } from '../../hooks/useEnhancedAuth';
import { DualBackendDashboard } from './DualBackendDashboardClean';
import { dualBackendService } from '../../services/dualBackendService';
import './EnhancedApp.css';

// Login Component
function LoginPage() {
    const auth = useEnhancedAuth();
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await auth.login(credentials);
        } catch (err) {
            setError(`Login failed: ${err}`);
        } finally {
            setLoading(false);
        }
    };

    const handleDemoLogin = async () => {
        setLoading(true);
        setError(null);

        try {
            await auth.login({
                email: 'demo@asagents.com',
                password: 'demo123'
            });
        } catch (err) {
            setError(`Demo login failed: ${err}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-container">
                <div className="login-header">
                    <h1>🚀 ASAgents Enhanced Platform</h1>
                    <p>Experience the power of dual backend AI + Enterprise integration</p>
                </div>

                <form onSubmit={handleLogin} className="login-form">
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={credentials.email}
                            onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                            required
                            placeholder="Enter your email"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={credentials.password}
                            onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                            required
                            placeholder="Enter your password"
                        />
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <div className="login-buttons">
                        <button type="submit" disabled={loading} className="login-button primary">
                            {loading ? '🔄 Logging in...' : '🚀 Login'}
                        </button>
                        <button type="button" onClick={handleDemoLogin} disabled={loading} className="login-button demo">
                            {loading ? '🔄 Connecting...' : '🎯 Try Demo'}
                        </button>
                    </div>

                    <div className="login-info">
                        <h3>🌟 Enhanced Features Available:</h3>
                        <ul>
                            <li>🤖 AI-powered multimodal analysis</li>
                            <li>📊 Enterprise-grade analytics</li>
                            <li>🔄 Dual backend architecture</li>
                            <li>⚡ Real-time processing</li>
                            <li>🔒 Advanced security & compliance</li>
                        </ul>
                    </div>
                </form>
            </div>

        </div>
    );
}

// Main App Content
function AppContent() {
    const auth = useEnhancedAuth();
    const [systemStatus, setSystemStatus] = useState<any>(null);

    useEffect(() => {
        if (auth.isAuthenticated) {
            checkSystemStatus();
        }
    }, [auth.isAuthenticated]);

    const checkSystemStatus = async () => {
        try {
            const status = await dualBackendService.getSystemHealth();
            setSystemStatus(status);
        } catch (error) {
            console.warn('System status check failed:', error);
        }
    };

    if (!auth.isAuthenticated) {
        return <LoginPage />;
    }

    return (
        <div className="app-content">
            {/* Navigation Header */}
            <nav className="app-nav">
                <div className="nav-brand">
                    <span className="nav-logo">🚀</span>
                    <span className="nav-title">ASAgents Enhanced</span>
                </div>
                <div className="nav-actions">
                    <div className="user-info">
                        <span className="user-name">{(auth.user?.firstName || auth.user?.lastName) ? `${auth.user?.firstName || ''} ${auth.user?.lastName || ''}`.trim() : (auth.user?.email || 'User')}</span>
                        <span className="user-role">{auth.user?.role || 'Member'}</span>
                    </div>
                    <button onClick={auth.logout} className="logout-button">
                        🚪 Logout
                    </button>
                </div>
            </nav>

            {/* System Status Banner */}
            {systemStatus && (
                <div className="system-status-banner">
                    <div className="status-info">
                        <span className="status-icon">
                            {systemStatus.success ? '✅' : '⚠️'}
                        </span>
                        <span className="status-text">
                            System Status: {systemStatus.success ? 'All backends operational' : 'Limited functionality'}
                        </span>
                    </div>
                    <button onClick={checkSystemStatus} className="status-refresh">
                        🔄 Refresh
                    </button>
                </div>
            )}

            {/* Main Dashboard */}
            <main className="app-main">
                <DualBackendDashboard />
            </main>

        </div>
    );
}

// Main Enhanced App
export function EnhancedApp() {
    return (
        <EnhancedAuthProvider>
            <AppContent />
        </EnhancedAuthProvider>
    );
}