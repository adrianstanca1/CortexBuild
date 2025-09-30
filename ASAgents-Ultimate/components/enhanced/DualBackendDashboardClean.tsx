// Dual Backend Multimodal Dashboard Component
import React, { useState, useEffect, useMemo } from 'react';
import { useEnhancedAuth } from '../../hooks/useEnhancedAuth';
import { dualBackendService } from '../../services/dualBackendService';
import './DualBackendDashboard.css';

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

    // Memoized computed values to avoid lint issues with nested ternaries
    const { nodejs: nodeStatus, java: javaStatus } = dashboardData.backendStatus;
    const bothAvailable = useMemo(() => nodeStatus.available && javaStatus.available, [nodeStatus.available, javaStatus.available]);
    const anyAvailable = useMemo(() => nodeStatus.available || javaStatus.available, [nodeStatus.available, javaStatus.available]);

    const capabilityStatus = useMemo(() => {
        if (bothAvailable) return { class: 'full', icon: '🌟', text: 'Full Enhanced Capabilities Available' };
        if (anyAvailable) return { class: 'partial', icon: '⚡', text: 'Partial Capabilities - Limited Backend Access' };
        return { class: 'limited', icon: '🔧', text: 'Basic Mode - No Backend Connection' };
    }, [bothAvailable, anyAvailable]);

    const systemAvailability = useMemo(() => {
        if (bothAvailable) return '100%';
        if (anyAvailable) return '50%';
        return '0%';
    }, [bothAvailable, anyAvailable]);

    const activeBackends = useMemo(() => {
        if (bothAvailable) return '2';
        if (anyAvailable) return '1';
        return '0';
    }, [bothAvailable, anyAvailable]);

    const uploadCapabilityText = useMemo(() => {
        if (bothAvailable) return 'AI processing + Enterprise compliance analysis';
        if (nodeStatus.available) return 'AI processing available';
        if (javaStatus.available) return 'Enterprise analysis available';
        return 'Basic upload only';
    }, [bothAvailable, nodeStatus.available, javaStatus.available]);

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

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) handleMultimodalUpload(file);
    };

    const handleHealthCheck = async () => {
        await loadDashboardData();
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
                                {Boolean(nodeStatus.responseTime) && ` (${nodeStatus.responseTime}ms)`}
                            </span>
                        </div>
                    </div>
                    <div className={`backend-indicator java ${javaStatus.available ? 'online' : 'offline'}`}>
                        <div className="backend-icon">☕</div>
                        <div className="backend-info">
                            <span className="backend-name">Java Enterprise</span>
                            <span className="backend-status">
                                {javaStatus.available ? 'Online' : 'Offline'}
                                {Boolean(javaStatus.responseTime) && ` (${javaStatus.responseTime}ms)`}
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
                <div className={`capability-indicator ${capabilityStatus.class}`}>
                    <span className="capability-icon">{capabilityStatus.icon}</span>
                    <span className="capability-text">{capabilityStatus.text}</span>
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
                                        <span className="stat-value">{systemAvailability}</span>
                                        <span className="stat-label">System Availability</span>
                                    </div>
                                    <div className="stat-item">
                                        <span className="stat-value">{activeBackends}</span>
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
                                        onChange={handleFileUpload}
                                        accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt,.csv"
                                        className="upload-input"
                                    />
                                    <label htmlFor="dual-backend-upload" className="upload-button">
                                        <div className="upload-icon">📤</div>
                                        <div className="upload-text">
                                            <strong>Upload for Enhanced Analysis</strong>
                                            <p>{uploadCapabilityText}</p>
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
                                                <div key={`project-${project.id || index}`} className="project-summary-item">
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
                                                <li key={`recommendation-${index}`}>{rec}</li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="insights-card predictions">
                                        <h3>🔮 Predictions</h3>
                                        <div className="predictions-list">
                                            {dashboardData.aiInsights.predictions.length > 0 ? (
                                                dashboardData.aiInsights.predictions.map((pred, index) => (
                                                    <div key={`prediction-${index}`} className="prediction-item">{JSON.stringify(pred)}</div>
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
                                                {Boolean(nodeStatus.responseTime) && (
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
                                                {Boolean(javaStatus.responseTime) && (
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
                                            onClick={handleHealthCheck}
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
        </div>
    );
}