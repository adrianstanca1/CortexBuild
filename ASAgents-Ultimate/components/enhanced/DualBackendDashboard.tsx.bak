// Dual Backend Multimodal Dashboard Component
import React, { useState, useEffect } from 'react';
import { useEnhancedAuth } from '../../hooks/useEnhancedAuth';
import { dualBackendService } from '../../services/dualBackendService';

interface DualBackendDashboardData {
    projects: any[];
    aiInsights?: {
        recommendations: string[];
        predictions: any[];
        analysis: any;
    };
    enterpriseMetrics?: {
        projectStatistics: any;
        performanceMetrics: any;
        complianceStatus: any;
        systemHealth: any;
    };
    backendStatus: {
        nodejs: { available: boolean; lastCheck: Date; responseTime?: number };
        java: { available: boolean; lastCheck: Date; responseTime?: number };
    };
}

export function DualBackendDashboard() {
    const auth = useEnhancedAuth();
    const [dashboardData, setDashboardData] = useState<DualBackendDashboardData>({
        projects: [],
        backendStatus: {
            nodejs: { available: false, lastCheck: new Date() },
            java: { available: false, lastCheck: new Date() }
        }
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'overview' | 'ai' | 'enterprise' | 'system'>('overview');

    useEffect(() => {
        loadDashboardData();
        const interval = setInterval(loadDashboardData, 30000); // Refresh every 30 seconds
        return () => clearInterval(interval);
    }, [auth.user?.id]);

    const loadDashboardData = async () => {
        if (!auth.user?.id) {
            setLoading(false);
            return;
        }

        try {
            setError(null);

            // Check backend availability
            const systemHealthResponse = await dualBackendService.getSystemHealth();
            const backendHealth = {
                nodejs: {
                    available: systemHealthResponse.success && systemHealthResponse.data?.nodejsHealth?.available || false,
                    responseTime: systemHealthResponse.data?.nodejsHealth?.responseTime
                },
                java: {
                    available: systemHealthResponse.success && systemHealthResponse.data?.javaHealth?.available || false,
                    responseTime: systemHealthResponse.data?.javaHealth?.responseTime
                }
            };

            const newDashboardData: DualBackendDashboardData = {
                projects: [],
                backendStatus: {
                    nodejs: {
                        available: backendHealth.nodejs.available,
                        lastCheck: new Date(),
                        responseTime: backendHealth.nodejs.responseTime
                    },
                    java: {
                        available: backendHealth.java.available,
                        lastCheck: new Date(),
                        responseTime: backendHealth.java.responseTime
                    }
                }
            };

            // Load unified dashboard if both backends are available
            if (backendHealth.nodejs.available && backendHealth.java.available) {
                try {
                    const unifiedResponse = await dualBackendService.getUnifiedDashboard(auth.user.id);
                    if (unifiedResponse.success && unifiedResponse.data) {
                        newDashboardData.projects = unifiedResponse.data.aiProjects || [];
                        newDashboardData.aiInsights = unifiedResponse.data.aiInsights;
                        newDashboardData.enterpriseMetrics = unifiedResponse.data.enterpriseData;
                    }
                } catch (unifiedError) {
                    console.warn('Unified dashboard failed, falling back to individual calls:', unifiedError);
                    await loadIndividualBackendData(newDashboardData, backendHealth);
                }
            } else {
                await loadIndividualBackendData(newDashboardData, backendHealth);
            }

            setDashboardData(newDashboardData);
        } catch (err) {
            console.error('Dashboard loading error:', err);
            setError(`Failed to load dashboard: ${err}`);
        } finally {
            setLoading(false);
        }
    };

    const loadIndividualBackendData = async (
        dashboardData: DualBackendDashboardData,
        backendHealth: any
    ) => {
        // Load projects from available backends
        try {
            const projectsResponse = await dualBackendService.getProjects();
            if (projectsResponse.success) {
                dashboardData.projects = projectsResponse.data || [];
            }
        } catch (err) {
            console.warn('Failed to load projects:', err);
        }

        // Load AI insights if Node.js backend is available
        if (backendHealth.nodejs.available) {
            try {
                const aiResponse = await dualBackendService.processAiRequest('user-insights', {
                    userId: auth.user?.id,
                    requestType: 'dashboard-insights'
                });
                if (aiResponse.success) {
                    dashboardData.aiInsights = {
                        recommendations: aiResponse.data?.recommendations || [],
                        predictions: aiResponse.data?.predictions || [],
                        analysis: aiResponse.data?.analysis || null
                    };
                }
            } catch (err) {
                console.warn('Failed to load AI insights:', err);
            }
        }

        // Load enterprise metrics if Java backend is available
        if (backendHealth.java.available) {
            try {
                const enterpriseResponse = await dualBackendService.processEnterpriseRequest('analytics', { userId: auth.user.id });
                if (enterpriseResponse.success) {
                    dashboardData.enterpriseMetrics = enterpriseResponse.data;
                }
            } catch (err) {
                console.warn('Failed to load enterprise metrics:', err);
            }
        }
    };

    const handleMultimodalUpload = async (file: File) => {
        if (!auth.user?.id) return;

        try {
            setLoading(true);
            const response = await dualBackendService.processMultimodal({
                projectId: 'dashboard-analysis',
                file,
                analysisType: 'full',
                enterpriseAnalysis: dashboardData.backendStatus.java.available
            });

            if (response.success) {
                console.log('Multimodal processing complete:', response);
                // Refresh dashboard to show new insights
                await loadDashboardData();
            } else {
                setError('Multimodal processing failed');
            }
        } catch (err) {
            setError(`Upload processing failed: ${err}`);
        } finally {
            setLoading(false);
        }
    };

    if (loading && dashboardData.projects.length === 0) {
        return (
            <div className="dual-backend-dashboard loading-state">
                <div className="loading-container">
                    <div className="dual-spinner">
                        <div className="spinner nodejs-spinner"></div>
                        <div className="spinner java-spinner"></div>
                    </div>
                    <p>Loading dual backend dashboard...</p>
                    <div className="loading-details">
                        <span>Connecting to Node.js AI backend...</span>
                        <span>Connecting to Java enterprise backend...</span>
                    </div>
                </div>
            </div>
        );
    }

    const { nodejs: nodeStatus, java: javaStatus } = dashboardData.backendStatus;
    const bothAvailable = nodeStatus.available && javaStatus.available;
    const anyAvailable = nodeStatus.available || javaStatus.available;

    return (
        <div className="dual-backend-dashboard">
            {/* Header with Backend Status */}
            <div className="dashboard-header">
                <div className="title-section">
                    <h1>🚀 Dual Backend Multimodal Dashboard</h1>
                    <p>Powered by Node.js AI + Java Enterprise backends</p>
                </div>
                <div className="backend-status-header">
                    <div className={`backend-indicator nodejs ${nodeStatus.available ? 'online' : 'offline'}`}>
                        <div className="backend-icon">🤖</div>
                        <div className="backend-info">
                            <span className="backend-name">Node.js AI</span>
                            <span className="backend-status">
                                {nodeStatus.available ? 'Online' : 'Offline'}
                                {nodeStatus.responseTime && ` (${nodeStatus.responseTime}ms)`}
                            </span>
                        </div>
                    </div>
                    <div className={`backend-indicator java ${javaStatus.available ? 'online' : 'offline'}`}>
                        <div className="backend-icon">☕</div>
                        <div className="backend-info">
                            <span className="backend-name">Java Enterprise</span>
                            <span className="backend-status">
                                {javaStatus.available ? 'Online' : 'Offline'}
                                {javaStatus.responseTime && ` (${javaStatus.responseTime}ms)`}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Error Banner */}
            {error && (
                <div className="error-banner">
                    <span className="error-icon">⚠️</span>
                    <span className="error-message">{error}</span>
                    <button onClick={() => setError(null)} className="error-dismiss">×</button>
                </div>
            )}

            {/* Capability Status */}
            <div className="capability-status">
                <div className={`capability-indicator ${bothAvailable ? 'full' : anyAvailable ? 'partial' : 'limited'}`}>
                    <span className="capability-icon">
                        {bothAvailable ? '🌟' : anyAvailable ? '⚡' : '🔧'}
                    </span>
                    <span className="capability-text">
                        {bothAvailable
                            ? 'Full Enhanced Capabilities Available'
                            : anyAvailable
                                ? 'Partial Capabilities - Limited Backend Access'
                                : 'Basic Mode - No Backend Connection'
                        }
                    </span>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="tab-navigation">
                <button
                    className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
                    onClick={() => setActiveTab('overview')}
                >
                    📊 Overview
                </button>
                <button
                    className={`tab ${activeTab === 'ai' ? 'active' : ''} ${!nodeStatus.available ? 'disabled' : ''}`}
                    onClick={() => nodeStatus.available && setActiveTab('ai')}
                >
                    🤖 AI Insights
                </button>
                <button
                    className={`tab ${activeTab === 'enterprise' ? 'active' : ''} ${!javaStatus.available ? 'disabled' : ''}`}
                    onClick={() => javaStatus.available && setActiveTab('enterprise')}
                >
                    📈 Enterprise
                </button>
                <button
                    className={`tab ${activeTab === 'system' ? 'active' : ''}`}
                    onClick={() => setActiveTab('system')}
                >
                    🔍 System
                </button>
            </div>

            {/* Tab Content */}
            <div className="tab-content">
                {activeTab === 'overview' && (
                    <div className="overview-tab">
                        <div className="overview-grid">
                            {/* Quick Stats */}
                            <div className="stats-card">
                                <h3>📋 Quick Statistics</h3>
                                <div className="stats-grid">
                                    <div className="stat-item">
                                        <span className="stat-value">{dashboardData.projects.length}</span>
                                        <span className="stat-label">Projects</span>
                                    </div>
                                    <div className="stat-item">
                                        <span className="stat-value">{bothAvailable ? '100%' : anyAvailable ? '50%' : '0%'}</span>
                                        <span className="stat-label">System Availability</span>
                                    </div>
                                    <div className="stat-item">
                                        <span className="stat-value">{nodeStatus.available && javaStatus.available ? '2' : (nodeStatus.available || javaStatus.available) ? '1' : '0'}</span>
                                        <span className="stat-label">Active Backends</span>
                                    </div>
                                </div>
                            </div>

                            {/* Enhanced Upload */}
                            <div className="upload-card">
                                <h3>🚀 Enhanced Multimodal Upload</h3>
                                <div className="upload-zone">
                                    <input
                                        type="file"
                                        id="dual-backend-upload"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) handleMultimodalUpload(file);
                                        }}
                                        accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt,.csv"
                                        style={{ display: 'none' }}
                                    />
                                    <label htmlFor="dual-backend-upload" className="upload-button">
                                        <div className="upload-icon">📤</div>
                                        <div className="upload-text">
                                            <strong>Upload for Enhanced Analysis</strong>
                                            <p>
                                                {bothAvailable
                                                    ? 'AI processing + Enterprise compliance analysis'
                                                    : nodeStatus.available
                                                        ? 'AI processing available'
                                                        : javaStatus.available
                                                            ? 'Enterprise analysis available'
                                                            : 'Basic upload only'
                                                }
                                            </p>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            {/* Projects Overview */}
                            <div className="projects-card">
                                <h3>📊 Projects Overview</h3>
                                <div className="projects-summary">
                                    {dashboardData.projects.length > 0 ? (
                                        <div className="projects-list">
                                            {dashboardData.projects.slice(0, 3).map((project, index) => (
                                                <div key={project.id || index} className="project-summary-item">
                                                    <div className="project-basic-info">
                                                        <h4>{project.name || `Project ${index + 1}`}</h4>
                                                        <p>{project.description || 'No description available'}</p>
                                                    </div>
                                                    <div className="project-enhancements">
                                                        {project.aiEnhanced && <span className="enhancement-badge ai">AI Enhanced</span>}
                                                        {project.enterpriseFeatures && <span className="enhancement-badge enterprise">Enterprise</span>}
                                                    </div>
                                                </div>
                                            ))}
                                            {dashboardData.projects.length > 3 && (
                                                <div className="projects-more">
                                                    +{dashboardData.projects.length - 3} more projects
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="no-projects">
                                            <div className="no-projects-icon">📝</div>
                                            <p>No projects available</p>
                                            <small>Create your first project to see enhanced analytics</small>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'ai' && nodeStatus.available && (
                    <div className="ai-tab">
                        <div className="ai-content">
                            <h2>🤖 AI-Powered Insights</h2>
                            {dashboardData.aiInsights ? (
                                <div className="ai-insights-grid">
                                    <div className="insights-card recommendations">
                                        <h3>💡 Recommendations</h3>
                                        <ul>
                                            {dashboardData.aiInsights.recommendations.map((rec, index) => (
                                                <li key={index}>{rec}</li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="insights-card predictions">
                                        <h3>🔮 Predictions</h3>
                                        <div className="predictions-list">
                                            {dashboardData.aiInsights.predictions.length > 0 ? (
                                                dashboardData.aiInsights.predictions.map((pred, index) => (
                                                    <div key={index} className="prediction-item">{JSON.stringify(pred)}</div>
                                                ))
                                            ) : (
                                                <p>No predictions available</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="insights-card analysis">
                                        <h3>📊 Analysis</h3>
                                        <pre>{JSON.stringify(dashboardData.aiInsights.analysis, null, 2)}</pre>
                                    </div>
                                </div>
                            ) : (
                                <div className="loading-insights">
                                    <div className="loading-spinner"></div>
                                    <p>Loading AI insights...</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'enterprise' && javaStatus.available && (
                    <div className="enterprise-tab">
                        <div className="enterprise-content">
                            <h2>📈 Enterprise Analytics</h2>
                            {dashboardData.enterpriseMetrics ? (
                                <div className="enterprise-metrics-grid">
                                    <div className="metric-card project-stats">
                                        <h3>📊 Project Statistics</h3>
                                        <div className="metrics">
                                            <div className="metric">
                                                <span className="metric-label">Total Projects:</span>
                                                <span className="metric-value">
                                                    {dashboardData.enterpriseMetrics.projectStatistics?.totalProjects || 0}
                                                </span>
                                            </div>
                                            <div className="metric">
                                                <span className="metric-label">Active:</span>
                                                <span className="metric-value">
                                                    {dashboardData.enterpriseMetrics.projectStatistics?.activeProjects || 0}
                                                </span>
                                            </div>
                                            <div className="metric">
                                                <span className="metric-label">Completed:</span>
                                                <span className="metric-value">
                                                    {dashboardData.enterpriseMetrics.projectStatistics?.completedProjects || 0}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="metric-card performance">
                                        <h3>⚡ Performance</h3>
                                        <div className="metrics">
                                            <div className="metric">
                                                <span className="metric-label">Efficiency:</span>
                                                <span className="metric-value">
                                                    {((dashboardData.enterpriseMetrics.performanceMetrics?.efficiency || 0) * 100).toFixed(1)}%
                                                </span>
                                            </div>
                                            <div className="metric">
                                                <span className="metric-label">Quality Score:</span>
                                                <span className="metric-value">
                                                    {((dashboardData.enterpriseMetrics.performanceMetrics?.qualityScore || 0) * 100).toFixed(1)}%
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="metric-card compliance">
                                        <h3>✅ Compliance</h3>
                                        <div className="metrics">
                                            <div className="metric">
                                                <span className="metric-label">Overall Score:</span>
                                                <span className="metric-value">
                                                    {((dashboardData.enterpriseMetrics.complianceStatus?.overallScore || 0) * 100).toFixed(1)}%
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="loading-metrics">
                                    <div className="loading-spinner"></div>
                                    <p>Loading enterprise metrics...</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'system' && (
                    <div className="system-tab">
                        <div className="system-content">
                            <h2>🔍 System Status & Health</h2>
                            <div className="system-grid">
                                <div className="system-card backend-health">
                                    <h3>🖥️ Backend Health</h3>
                                    <div className="backend-health-grid">
                                        <div className={`health-item nodejs ${nodeStatus.available ? 'healthy' : 'unhealthy'}`}>
                                            <div className="health-header">
                                                <span className="health-icon">🤖</span>
                                                <span className="health-name">Node.js AI Backend</span>
                                            </div>
                                            <div className="health-details">
                                                <span className="health-status">{nodeStatus.available ? 'Online' : 'Offline'}</span>
                                                {nodeStatus.responseTime && (
                                                    <span className="response-time">{nodeStatus.responseTime}ms</span>
                                                )}
                                                <span className="last-check">
                                                    Last check: {nodeStatus.lastCheck.toLocaleTimeString()}
                                                </span>
                                            </div>
                                        </div>
                                        <div className={`health-item java ${javaStatus.available ? 'healthy' : 'unhealthy'}`}>
                                            <div className="health-header">
                                                <span className="health-icon">☕</span>
                                                <span className="health-name">Java Enterprise Backend</span>
                                            </div>
                                            <div className="health-details">
                                                <span className="health-status">{javaStatus.available ? 'Online' : 'Offline'}</span>
                                                {javaStatus.responseTime && (
                                                    <span className="response-time">{javaStatus.responseTime}ms</span>
                                                )}
                                                <span className="last-check">
                                                    Last check: {javaStatus.lastCheck.toLocaleTimeString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="system-card capabilities">
                                    <h3>⚙️ Available Capabilities</h3>
                                    <div className="capabilities-grid">
                                        <div className={`capability-item ${nodeStatus.available ? 'available' : 'unavailable'}`}>
                                            <span className="capability-icon">🧠</span>
                                            <div className="capability-info">
                                                <span className="capability-name">AI Processing</span>
                                                <span className="capability-description">
                                                    {nodeStatus.available
                                                        ? 'Multimodal AI analysis, predictions, recommendations'
                                                        : 'Unavailable - Node.js backend offline'
                                                    }
                                                </span>
                                            </div>
                                        </div>
                                        <div className={`capability-item ${javaStatus.available ? 'available' : 'unavailable'}`}>
                                            <span className="capability-icon">📊</span>
                                            <div className="capability-info">
                                                <span className="capability-name">Enterprise Analytics</span>
                                                <span className="capability-description">
                                                    {javaStatus.available
                                                        ? 'Advanced analytics, compliance, reporting'
                                                        : 'Unavailable - Java backend offline'
                                                    }
                                                </span>
                                            </div>
                                        </div>
                                        <div className={`capability-item ${bothAvailable ? 'available' : 'unavailable'}`}>
                                            <span className="capability-icon">🚀</span>
                                            <div className="capability-info">
                                                <span className="capability-name">Enhanced Features</span>
                                                <span className="capability-description">
                                                    {bothAvailable
                                                        ? 'Full dual-backend integration and advanced processing'
                                                        : 'Requires both backends online'
                                                    }
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="system-card actions">
                                    <h3>🔄 System Actions</h3>
                                    <div className="actions-grid">
                                        <button
                                            onClick={loadDashboardData}
                                            className="action-button refresh"
                                            disabled={loading}
                                        >
                                            🔄 Refresh Dashboard
                                        </button>
                                        <button
                                            onClick={() => dualBackendService.checkBackendHealth()}
                                            className="action-button health-check"
                                        >
                                            🩺 Check Backend Health
                                        </button>
                                        <button
                                            onClick={() => setError(null)}
                                            className="action-button clear-errors"
                                            disabled={!error}
                                        >
                                            🧹 Clear Errors
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <style>{`
        .dual-backend-dashboard {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 2rem;
        }

        .loading-state {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .loading-container {
          text-align: center;
          color: white;
        }

        .dual-spinner {
          display: flex;
          justify-content: center;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .nodejs-spinner {
          border-top-color: #68d391;
        }

        .java-spinner {
          border-top-color: #f6ad55;
        }

        .loading-details {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          font-size: 0.9rem;
          opacity: 0.8;
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 1rem;
          padding: 2rem;
          margin-bottom: 2rem;
          color: white;
        }

        .title-section h1 {
          margin: 0;
          font-size: 2rem;
          font-weight: bold;
        }

        .title-section p {
          margin: 0.5rem 0 0 0;
          opacity: 0.8;
        }

        .backend-status-header {
          display: flex;
          gap: 1rem;
        }

        .backend-indicator {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem;
          border-radius: 0.75rem;
          backdrop-filter: blur(10px);
        }

        .backend-indicator.online {
          background: rgba(104, 211, 145, 0.2);
          border: 1px solid rgba(104, 211, 145, 0.4);
        }

        .backend-indicator.offline {
          background: rgba(248, 113, 113, 0.2);
          border: 1px solid rgba(248, 113, 113, 0.4);
        }

        .backend-icon {
          font-size: 1.5rem;
        }

        .backend-info {
          display: flex;
          flex-direction: column;
        }

        .backend-name {
          font-weight: 600;
          font-size: 0.9rem;
        }

        .backend-status {
          font-size: 0.8rem;
          opacity: 0.8;
        }

        .error-banner {
          background: rgba(248, 113, 113, 0.1);
          border: 1px solid rgba(248, 113, 113, 0.3);
          backdrop-filter: blur(10px);
          color: white;
          padding: 1rem;
          border-radius: 0.75rem;
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .error-dismiss {
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          font-size: 1.25rem;
          margin-left: auto;
        }

        .capability-status {
          margin-bottom: 2rem;
        }

        .capability-indicator {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem 2rem;
          border-radius: 0.75rem;
          backdrop-filter: blur(10px);
          color: white;
          font-weight: 500;
        }

        .capability-indicator.full {
          background: rgba(104, 211, 145, 0.2);
          border: 1px solid rgba(104, 211, 145, 0.4);
        }

        .capability-indicator.partial {
          background: rgba(246, 173, 85, 0.2);
          border: 1px solid rgba(246, 173, 85, 0.4);
        }

        .capability-indicator.limited {
          background: rgba(248, 113, 113, 0.2);
          border: 1px solid rgba(248, 113, 113, 0.4);
        }

        .capability-icon {
          font-size: 1.25rem;
        }

        .tab-navigation {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 2rem;
        }

        .tab {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 0.75rem;
          background: rgba(255, 255, 255, 0.1);
          color: white;
          cursor: pointer;
          transition: all 0.2s;
          font-weight: 500;
        }

        .tab:hover:not(.disabled) {
          background: rgba(255, 255, 255, 0.2);
        }

        .tab.active {
          background: rgba(255, 255, 255, 0.2);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
        }

        .tab.disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .tab-content {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(20px);
          border-radius: 1rem;
          padding: 2rem;
          min-height: 500px;
        }

        .overview-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 2rem;
        }

        .stats-card,
        .upload-card,
        .projects-card {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 1rem;
          padding: 1.5rem;
          color: white;
        }

        .stats-card h3,
        .upload-card h3,
        .projects-card h3 {
          margin: 0 0 1rem 0;
          font-size: 1.25rem;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
        }

        .stat-item {
          text-align: center;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 0.5rem;
        }

        .stat-value {
          display: block;
          font-size: 2rem;
          font-weight: bold;
          margin-bottom: 0.5rem;
        }

        .stat-label {
          font-size: 0.9rem;
          opacity: 0.8;
        }

        .upload-zone {
          margin-top: 1rem;
        }

        .upload-button {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 2rem;
          border: 2px dashed rgba(255, 255, 255, 0.3);
          border-radius: 0.75rem;
          cursor: pointer;
          transition: all 0.2s;
          width: 100%;
        }

        .upload-button:hover {
          border-color: rgba(255, 255, 255, 0.5);
          background: rgba(255, 255, 255, 0.05);
        }

        .upload-icon {
          font-size: 2rem;
        }

        .upload-text strong {
          display: block;
          font-size: 1.1rem;
          margin-bottom: 0.5rem;
        }

        .upload-text p {
          margin: 0;
          font-size: 0.9rem;
          opacity: 0.8;
        }

        .projects-summary {
          margin-top: 1rem;
        }

        .projects-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .project-summary-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 0.5rem;
        }

        .project-basic-info h4 {
          margin: 0 0 0.25rem 0;
        }

        .project-basic-info p {
          margin: 0;
          font-size: 0.9rem;
          opacity: 0.8;
        }

        .project-enhancements {
          display: flex;
          gap: 0.5rem;
        }

        .enhancement-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 1rem;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .enhancement-badge.ai {
          background: rgba(104, 211, 145, 0.2);
          color: #68d391;
        }

        .enhancement-badge.enterprise {
          background: rgba(139, 92, 246, 0.2);
          color: #a78bfa;
        }

        .projects-more {
          text-align: center;
          padding: 1rem;
          font-style: italic;
          opacity: 0.8;
        }

        .no-projects {
          text-align: center;
          padding: 2rem;
        }

        .no-projects-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .ai-content,
        .enterprise-content,
        .system-content {
          color: white;
        }

        .ai-content h2,
        .enterprise-content h2,
        .system-content h2 {
          margin: 0 0 2rem 0;
          text-align: center;
        }

        .ai-insights-grid,
        .enterprise-metrics-grid,
        .system-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
        }

        .insights-card,
        .metric-card,
        .system-card {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 1rem;
          padding: 1.5rem;
        }

        .insights-card h3,
        .metric-card h3,
        .system-card h3 {
          margin: 0 0 1rem 0;
        }

        .loading-insights,
        .loading-metrics {
          text-align: center;
          padding: 4rem;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 1rem;
        }

        .metrics {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .metric {
          display: flex;
          justify-content: space-between;
          padding: 0.75rem;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 0.5rem;
        }

        .metric-value {
          font-weight: bold;
        }

        .backend-health-grid {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .health-item {
          padding: 1rem;
          border-radius: 0.75rem;
        }

        .health-item.healthy {
          background: rgba(104, 211, 145, 0.1);
          border: 1px solid rgba(104, 211, 145, 0.3);
        }

        .health-item.unhealthy {
          background: rgba(248, 113, 113, 0.1);
          border: 1px solid rgba(248, 113, 113, 0.3);
        }

        .health-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.5rem;
        }

        .health-details {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          font-size: 0.9rem;
          opacity: 0.8;
        }

        .response-time {
          color: #68d391;
          font-weight: 500;
        }

        .capabilities-grid {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .capability-item {
          display: flex;
          gap: 1rem;
          padding: 1rem;
          border-radius: 0.75rem;
        }

        .capability-item.available {
          background: rgba(104, 211, 145, 0.1);
          border: 1px solid rgba(104, 211, 145, 0.3);
        }

        .capability-item.unavailable {
          background: rgba(248, 113, 113, 0.1);
          border: 1px solid rgba(248, 113, 113, 0.3);
        }

        .capability-icon {
          font-size: 1.5rem;
          margin-top: 0.25rem;
        }

        .capability-info {
          flex: 1;
        }

        .capability-name {
          display: block;
          font-weight: 600;
          margin-bottom: 0.25rem;
        }

        .capability-description {
          font-size: 0.9rem;
          opacity: 0.8;
        }

        .actions-grid {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .action-button {
          padding: 0.75rem;
          border: none;
          border-radius: 0.5rem;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s;
        }

        .action-button.refresh {
          background: rgba(104, 211, 145, 0.2);
          color: #68d391;
        }

        .action-button.health-check {
          background: rgba(96, 165, 250, 0.2);
          color: #60a5fa;
        }

        .action-button.clear-errors {
          background: rgba(248, 113, 113, 0.2);
          color: #f87171;
        }

        .action-button:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .action-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
        </div>
    );
}