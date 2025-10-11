import React, { useState, useEffect } from 'react';
// Fix: Added .ts extension to import
import { User, Screen, Task, ActivityEvent, Project } from '../../../types';
// Fix: Added .ts extension to import
import * as api from '../../../api';
// Fix: Added .tsx extension to widget imports
import QuickActionsWidget from '../../widgets/QuickActionsWidget';
import MyTasksWidget from '../../widgets/MyTasksWidget';
import NotificationsWidget from '../../widgets/NotificationsWidget';
import ProjectsOverviewWidget from '../../widgets/ProjectsOverviewWidget';
import RecentActivityWidget from '../../widgets/RecentActivityWidget';
import SmartMetricsWidget from '../../widgets/SmartMetricsWidget';
import SmartInsightsWidget from '../../widgets/SmartInsightsWidget';
import { processDashboardData, DashboardData } from '../../../utils/dashboardLogic';

interface SupervisorDashboardProps {
    currentUser: User;
    navigateTo: (screen: Screen, params?: any) => void;
    onDeepLink: (projectId: string, screen: Screen, params: any) => void;
    onQuickAction: (action: Screen, projectId?: string) => void;
    onSuggestAction: () => void;
}

const SupervisorDashboard: React.FC<SupervisorDashboardProps> = (props) => {
    const { currentUser, navigateTo, onDeepLink, onQuickAction, onSuggestAction } = props;
    const [tasks, setTasks] = useState<Task[]>([]);
    const [activities, setActivities] = useState<ActivityEvent[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadDashboardData = async () => {
            setIsLoading(true);
            try {
                const [fetchedTasks, fetchedActivities, fetchedProjects] = await Promise.all([
                    api.fetchTasksForUser(currentUser),
                    api.fetchRecentActivity(currentUser),
                    api.fetchAllProjects(currentUser)
                ]);
                setTasks(fetchedTasks);
                setActivities(fetchedActivities);
                setProjects(fetchedProjects);

                // Process dashboard data with ML integration
                const processedData = await processDashboardData(fetchedProjects, fetchedTasks, currentUser);
                setDashboardData(processedData);
            } catch (error) {
                console.error('Error loading supervisor dashboard:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadDashboardData();
        api.checkAndCreateDueDateNotifications(currentUser);
    }, [currentUser]);

    const handleNavigateToProject = (projectId: string) => {
        navigateTo('project-detail', { projectId });
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
                <div className="h-32 bg-gray-200 rounded-lg"></div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        <div className="h-64 bg-gray-200 rounded-lg"></div>
                        <div className="h-96 bg-gray-200 rounded-lg"></div>
                    </div>
                    <div className="lg:col-span-1 space-y-8">
                        <div className="h-96 bg-gray-200 rounded-lg"></div>
                        <div className="h-64 bg-gray-200 rounded-lg"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <header className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Supervisor Dashboard</h1>
                    <p className="text-md text-gray-500">Welcome, {currentUser.name}! 👷</p>
                </div>
                <img src={currentUser.avatar} alt="User Avatar" className="w-12 h-12 rounded-full shadow-lg border-2 border-purple-200" />
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

                    <MyTasksWidget tasks={tasks} onDeepLink={onDeepLink} />
                    <RecentActivityWidget activities={activities} onDeepLink={onDeepLink} />
                </div>
                <div className="lg:col-span-1 space-y-8">
                    <NotificationsWidget currentUser={currentUser} onDeepLink={onDeepLink} />
                    <ProjectsOverviewWidget projects={projects} navigateTo={navigateTo} onDeepLink={onDeepLink} />
                </div>
            </main>
        </div>
    );
};

export default SupervisorDashboard;