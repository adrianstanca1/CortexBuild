import React, { useState, useEffect } from 'react';
import { User, Screen, Project, Task } from '../../../types';
import * as api from '../../../api';
import { processDashboardData, DashboardData } from '../../../utils/dashboardLogic';
import { DashboardLayout } from '../../layout/DashboardLayout';
import { MetricCard } from '../../cards/MetricCard';
import { ProjectCard } from '../../cards/ProjectCard';
import { AIInsightCard } from '../../cards/AIInsightCard';
import { AlertCard } from '../../cards/AlertCard';
import { Card } from '../../ui/Card';
import { supabase } from '../../../lib/supabase/client';

interface CompanyAdminDashboardNewProps {
    currentUser: User;
    navigateTo: (screen: Screen, params?: any) => void;
    onDeepLink: (projectId: string, screen: Screen, params: any) => void;
    onQuickAction: (action: Screen, projectId?: string) => void;
    onSuggestAction: () => void;
    selectProject: (id: string) => void;
}

const CompanyAdminDashboardNew: React.FC<CompanyAdminDashboardNewProps> = (props) => {
    const { currentUser, navigateTo, onDeepLink, onQuickAction, onSuggestAction, selectProject } = props;
    const [projects, setProjects] = useState<Project[]>([]);
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [teamMembersCount, setTeamMembersCount] = useState(0);
    const [subscriptionStatus, setSubscriptionStatus] = useState<any>(null);

    useEffect(() => {
        const loadDashboardData = async () => {
            setIsLoading(true);
            try {
                const [fetchedProjects, teamData, subData] = await Promise.all([
                    api.fetchAllProjects(currentUser),
                    supabase
                        .from('users')
                        .select('id')
                        .eq('company_id', currentUser.companyId),
                    supabase
                        .from('subscriptions')
                        .select('*')
                        .eq('company_id', currentUser.companyId)
                        .single()
                ]);

                setProjects(fetchedProjects);
                setTeamMembersCount(teamData.data?.length || 0);
                if (subData.data) setSubscriptionStatus(subData.data);

                // Process dashboard data with ML integration (without tasks)
                const processedData = await processDashboardData(fetchedProjects, [], currentUser);
                setDashboardData(processedData);
            } catch (error: any) {
                console.error('Error loading dashboard data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadDashboardData();
        api.checkAndCreateDueDateNotifications(currentUser);
    }, [currentUser]);

    const handleNavigateToProject = (projectId: string) => {
        selectProject(projectId);
        navigateTo('project-detail');
    };

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="space-y-6 animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="grid grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
                        ))}
                    </div>
                    <div className="h-64 bg-gray-200 rounded-lg"></div>
                </div>
            </DashboardLayout>
        );
    }

    const activeProjects = projects.filter(p => p.status === 'in_progress').length;
    const totalRevenue = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
    const completionRate = projects.length > 0
        ? Math.round((projects.filter(p => p.status === 'completed').length / projects.length) * 100)
        : 0;

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        Welcome back, {currentUser.name?.split(' ')[0] || 'User'}
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Here's what's happening with your construction projects today
                    </p>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <MetricCard
                        icon={
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                        }
                        title="Active Projects"
                        value={activeProjects}
                        subtitle={`of ${projects.length} total`}
                        color="blue"
                        onClick={() => navigateTo('projects')}
                    />

                    <MetricCard
                        icon={
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        }
                        title="Total Revenue"
                        value={`$${(totalRevenue / 1000000).toFixed(1)}M`}
                        trend={dashboardData?.trends?.revenue ? {
                            value: `${dashboardData.trends.revenue}% vs last month`,
                            isPositive: dashboardData.trends.revenue > 0
                        } : undefined}
                        color="green"
                    />

                    <MetricCard
                        icon={
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        }
                        title="Completion Rate"
                        value={`${completionRate}%`}
                        subtitle="Projects on track"
                        color="purple"
                    />

                    <MetricCard
                        icon={
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-2a6 6 0 0112 0v2zm0 0h6v-2a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        }
                        title="Team Members"
                        value={teamMembersCount}
                        subtitle="Active members"
                        color="indigo"
                        onClick={() => navigateTo('team-management')}
                    />
                </div>

                {/* AI Business Insights */}
                {dashboardData && dashboardData.insights && dashboardData.insights.length > 0 && (
                    <Card padding="md">
                        <div className="flex items-center gap-2 mb-4">
                            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                            <h3 className="text-lg font-semibold text-gray-900">AI Business Insights</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {dashboardData.insights.slice(0, 3).map((insight, index) => (
                                <AIInsightCard
                                    key={index}
                                    icon={
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                    }
                                    title={insight.title}
                                    description={insight.description}
                                    actionLabel={insight.action || 'View Details'}
                                    variant={insight.priority === 'high' ? 'warning' : 'info'}
                                    onAction={() => {
                                        if (insight.projectId) {
                                            handleNavigateToProject(insight.projectId);
                                        }
                                    }}
                                />
                            ))}
                        </div>
                    </Card>
                )}

                {/* Subscription Status Alert */}
                {subscriptionStatus && (
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg shadow-md p-6 mb-6">
                        <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                                <svg className="w-6 h-6 text-blue-600 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div>
                                    <h4 className="font-semibold text-gray-900">Subscription Status</h4>
                                    <p className="text-sm text-gray-600 mt-1">
                                        Plan: <span className="font-medium">{subscriptionStatus.name}</span>
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        Renewal: <span className="font-medium">{new Date(subscriptionStatus.renewal_date).toLocaleDateString()}</span>
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => navigateTo('company-billing')}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium whitespace-nowrap"
                            >
                                Manage Billing
                            </button>
                        </div>
                    </div>
                )}

                {/* Recent Projects */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                            <h3 className="text-lg font-semibold text-gray-900">Recent Projects</h3>
                        </div>
                        <button
                            type="button"
                            onClick={() => navigateTo('projects')}
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                        >
                            View All →
                        </button>
                    </div>

                    <div className="space-y-3">
                        {projects.slice(0, 5).map(project => (
                            <ProjectCard
                                key={project.id}
                                project={{
                                    id: project.id,
                                    name: project.name,
                                    status: project.status as any,
                                    client: project.client,
                                    budget: project.budget,
                                    progress: project.progress
                                }}
                                onClick={() => handleNavigateToProject(project.id)}
                            />
                        ))}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    <Card padding="md">
                        <div className="flex items-center gap-2 mb-4">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
                        </div>

                        <div className="space-y-2">
                            <button
                                type="button"
                                onClick={() => onQuickAction('projects')}
                                className="w-full flex items-center gap-3 px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-left"
                            >
                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                <span className="text-sm font-medium text-blue-900">New Project</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => navigateTo('team-management')}
                                className="w-full flex items-center gap-3 px-4 py-3 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors text-left"
                            >
                                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-2a6 6 0 0112 0v2zm0 0h6v-2a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                                <span className="text-sm font-medium text-indigo-900">Manage Team</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => navigateTo('company-settings')}
                                className="w-full flex items-center gap-3 px-4 py-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors text-left"
                            >
                                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span className="text-sm font-medium text-green-900">Company Settings</span>
                            </button>
                        </div>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default CompanyAdminDashboardNew;

