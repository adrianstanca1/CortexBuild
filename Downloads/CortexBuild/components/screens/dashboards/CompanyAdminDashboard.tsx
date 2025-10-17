import React, { useState, useEffect } from 'react';
import { User, Screen, Project, Task } from '../../../types';
// Fix: Added .ts extension to import
import * as api from '../../../api';
// Fix: Added .tsx extension to widget imports
import QuickActionsWidget from '../../widgets/QuickActionsWidget';
import NotificationsWidget from '../../widgets/NotificationsWidget';
import ProjectsOverviewWidget from '../../widgets/ProjectsOverviewWidget';
import GlobalStatsWidget from '../../widgets/GlobalStatsWidget';
import UpcomingDeadlinesWidget from '../../widgets/UpcomingDeadlinesWidget';
import AIAgentsWidget from '../../widgets/AIAgentsWidget';
import SmartMetricsWidget from '../../widgets/SmartMetricsWidget';
import SmartInsightsWidget from '../../widgets/SmartInsightsWidget';
import { processDashboardData, DashboardData } from '../../../utils/dashboardLogic';

interface CompanyAdminDashboardProps {
    currentUser: User;
    navigateTo: (screen: Screen, params?: any) => void;
    onDeepLink: (projectId: string, screen: Screen, params: any) => void;
    onQuickAction: (action: Screen, projectId?: string) => void;
    onSuggestAction: () => void;
    selectProject: (id: string) => void;
}

const CompanyAdminDashboard: React.FC<CompanyAdminDashboardProps> = (props) => {
    const { currentUser, navigateTo, onDeepLink, onQuickAction, onSuggestAction, selectProject } = props;
    const [projects, setProjects] = useState<Project[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadDashboardData = async () => {
            setIsLoading(true);
            try {
                const [fetchedProjects, fetchedTasks] = await Promise.all([
                    api.fetchAllProjects(currentUser),
                    api.fetchTasksForUser(currentUser)
                ]);
                setProjects(fetchedProjects);
                setTasks(fetchedTasks);

                // Process dashboard data with ML integration
                const processedData = await processDashboardData(fetchedProjects, fetchedTasks, currentUser);
                setDashboardData(processedData);
            } catch (error) {
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
            <div className="space-y-8 animate-pulse">
                <header className="flex justify-between items-start">
                    <div>
                        <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-gray-200"></div>
                </header>
                <div className="h-24 bg-gray-200 rounded-lg"></div>
                <div className="h-32 bg-gray-200 rounded-lg"></div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        <div className="h-64 bg-gray-200 rounded-lg"></div>
                        <div className="h-48 bg-gray-200 rounded-lg"></div>
                    </div>
                    <div className="lg:col-span-1 space-y-8">
                        <div className="h-72 bg-gray-200 rounded-lg"></div>
                        <div className="h-96 bg-gray-200 rounded-lg"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <header className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Company Dashboard</h1>
                    <p className="text-md text-gray-500">Welcome, {currentUser.name}! 🚀</p>
                </div>
                <img src={currentUser.avatar} alt="User Avatar" className="w-12 h-12 rounded-full shadow-lg border-2 border-blue-200" />
            </header>

            {/* Smart Metrics Widget - ML-Powered */}
            {dashboardData && (
                <SmartMetricsWidget
                    metrics={dashboardData.metrics}
                    trends={dashboardData.trends}
                />
            )}

            <QuickActionsWidget
                onQuickAction={onQuickAction}
                onSuggestAction={onSuggestAction}
                isGlobal={true}
                currentUser={currentUser}
            />

            <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Smart Insights - AI Recommendations */}
                    {dashboardData && (
                        <SmartInsightsWidget
                            insights={dashboardData.insights}
                            onNavigate={handleNavigateToProject}
                        />
                    )}

                    <ProjectsOverviewWidget projects={projects} navigateTo={navigateTo} onDeepLink={onDeepLink} />
                    <UpcomingDeadlinesWidget tasks={tasks} onDeepLink={onDeepLink} />
                </div>
                <div className="lg:col-span-1 space-y-8">
                    <AIAgentsWidget currentUser={currentUser} navigateTo={navigateTo} />
                    <NotificationsWidget currentUser={currentUser} onDeepLink={onDeepLink} />
                </div>
            </main>
        </div>
    );
};

export default CompanyAdminDashboard;