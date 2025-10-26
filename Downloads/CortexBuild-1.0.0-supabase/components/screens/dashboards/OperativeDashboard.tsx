import React, { useState, useEffect } from 'react';
import { User, Screen, Task, SiteInstruction, DailyLog, Project } from '../../../types';
import * as api from '../../../api';
import { ListBulletIcon, ClipboardDocumentListIcon, AlertTriangleIcon } from '../../Icons';
import DailyFocusWidget from '../../widgets/DailyFocusWidget';
import { calculateDashboardMetrics } from '../../../utils/dashboardLogic';

interface OperativeDashboardProps {
    currentUser: User;
    navigateTo: (screen: Screen, params?: any) => void;
    onDeepLink: (projectId: string, screen: Screen, params: any) => void;
}

const OperativeDashboard: React.FC<OperativeDashboardProps> = ({ currentUser, navigateTo, onDeepLink }) => {
    const [firstTask, setFirstTask] = useState<Task | null>(null);
    const [allTasks, setAllTasks] = useState<Task[]>([]);
    const [siteInstructions, setSiteInstructions] = useState<SiteInstruction[]>([]);
    const [dailyLog, setDailyLog] = useState<DailyLog | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadDashboardData = async () => {
            setIsLoading(true);
            const todayStr = new Date().toISOString().split('T')[0];
            const [userTasks, instructions, log] = await Promise.all([
                api.fetchTasksForUser(currentUser),
                api.fetchSiteInstructions(),
                api.fetchDailyLogForUser(currentUser.id, todayStr)
            ]);

            const openTasks = userTasks
                .filter(t => t.status !== 'Done')
                .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

            setAllTasks(userTasks);
            setFirstTask(openTasks.length > 0 ? openTasks[0] : null);
            setSiteInstructions(instructions);
            setDailyLog(log);
            setIsLoading(false);
        };
        loadDashboardData();
    }, [currentUser]);

    // Calculate metrics for DailyFocusWidget
    const metrics = calculateDashboardMetrics([], allTasks);

    const handleDailyLogClick = () => {
        const projectId = firstTask?.projectId;
        if (projectId) {
            onDeepLink(projectId, 'daily-log', {});
        }
    };


    return (
        <div className="space-y-8">
            {/* Daily Focus Widget - Replaces header */}
            {!isLoading && (
                <DailyFocusWidget
                    firstTask={firstTask}
                    metrics={metrics}
                    userName={currentUser.name}
                />
            )}

            {isLoading ? (
                <div className="text-center p-8 text-gray-500">Loading your workday...</div>
            ) : (
                <main className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-8">
                        {firstTask ? (
                            <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-100">
                                <h2 className="text-lg font-bold text-gray-800 mb-3">First Task Up</h2>
                                <div
                                    onClick={() => onDeepLink(firstTask.projectId, 'task-detail', { taskId: firstTask.id })}
                                    className="p-4 bg-blue-50 border border-blue-200 rounded-lg cursor-pointer hover:bg-blue-100"
                                >
                                    <p className="font-bold text-blue-800">{firstTask.title}</p>
                                    <p className="text-sm text-red-600 font-semibold mt-1">Due: {new Date(firstTask.dueDate).toLocaleDateString()}</p>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-100">
                                <h2 className="text-lg font-bold text-gray-800 mb-3">First Task Up</h2>
                                <div className="p-4 bg-green-50 text-green-800 text-center rounded-lg">
                                    <p>No open tasks. Great job!</p>
                                    <button onClick={() => navigateTo('my-tasks')} className="mt-4 px-4 py-2 bg-green-600 text-white font-bold rounded-md hover:bg-green-700">
                                        View All Tasks
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-100">
                            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <ListBulletIcon className="w-6 h-6 text-gray-500" /> All My Tasks
                            </h2>
                            <button onClick={() => navigateTo('my-tasks')} className="w-full px-4 py-3 bg-blue-600 text-white font-bold rounded-md hover:bg-blue-700">
                                View All My Tasks
                            </button>
                        </div>
                    </div>
                    <div className="space-y-8">
                        <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-100">
                            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <ClipboardDocumentListIcon className="w-6 h-6 text-gray-500" /> Daily Log
                            </h2>
                            <button
                                onClick={handleDailyLogClick}
                                disabled={!firstTask}
                                title={!firstTask ? 'You must have an active task on a project to create a daily log' : (dailyLog ? "View or edit today's log" : "Start a new daily log")}
                                className={`w-full px-4 py-3 font-bold rounded-md transition-colors ${dailyLog ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-yellow-400 text-yellow-900 hover:bg-yellow-500'} disabled:bg-gray-300 disabled:cursor-not-allowed`}
                            >
                                {dailyLog ? "View/Edit Today's Log" : `Start Daily Log for ${firstTask?.projectName || 'Project'}`}
                            </button>
                        </div>

                        {siteInstructions.length > 0 && (
                            <div className="bg-orange-50 rounded-lg shadow-lg border border-orange-200 p-6">
                                <h2 className="text-lg font-bold text-orange-800 mb-4 flex items-center gap-2">
                                    <AlertTriangleIcon className="w-6 h-6 text-orange-600" /> Recent Site Instructions
                                </h2>
                                <ul className="space-y-3">
                                    {siteInstructions.map(inst => (
                                        <li key={inst.id} className="p-4 bg-white/70 backdrop-blur-sm border-l-4 border-orange-500 rounded-r-md shadow-sm">
                                            <p className="text-gray-800 font-medium">{inst.text}</p>
                                            <p className="text-xs text-gray-500 mt-2 text-right">- {inst.author}</p>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </main>
            )}
        </div>
    );
};

export default OperativeDashboard;