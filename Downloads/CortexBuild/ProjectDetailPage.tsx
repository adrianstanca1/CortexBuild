/**
 * Project Detail Page - Individual project view with comprehensive information
 */

import React, { useState } from 'react';

interface ProjectDetailProps {
    projectId: string;
    onBack: () => void;
}

interface ProjectDetail {
    id: string;
    name: string;
    client: string;
    location: string;
    budget: number;
    spent: number;
    progress: number;
    status: 'planning' | 'in progress' | 'approved' | 'completed';
    priority: 'low' | 'medium' | 'high';
    startDate: string;
    endDate: string;
    description: string;
    team: TeamMember[];
    tasks: Task[];
    milestones: Milestone[];
    documents: Document[];
    recentActivity: Activity[];
}

interface TeamMember {
    id: string;
    name: string;
    role: string;
    avatar: string;
}

interface Task {
    id: string;
    title: string;
    status: 'todo' | 'in-progress' | 'completed';
    assignee: string;
    dueDate: string;
    priority: 'low' | 'medium' | 'high';
}

interface Milestone {
    id: string;
    title: string;
    date: string;
    status: 'upcoming' | 'completed' | 'overdue';
}

interface Document {
    id: string;
    name: string;
    type: string;
    size: string;
    uploadedBy: string;
    uploadedAt: string;
}

interface Activity {
    id: string;
    type: string;
    description: string;
    user: string;
    timestamp: string;
}

export const ProjectDetailPage: React.FC<ProjectDetailProps> = ({ projectId, onBack }) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'team' | 'documents' | 'activity'>('overview');

    // Mock project data - in real app, this would come from API
    const project: ProjectDetail = {
        id: projectId,
        name: 'Riverside Residential Complex',
        client: 'ABC Construction Ltd',
        location: '456 River Road, Riverside',
        budget: 3500000,
        spent: 1750000,
        progress: 50,
        status: 'in progress',
        priority: 'high',
        startDate: 'Mar 1, 2024',
        endDate: 'Dec 31, 2024',
        description: 'A modern residential complex featuring 120 units across 4 buildings with underground parking, green spaces, and community amenities.',
        team: [
            { id: '1', name: 'John Smith', role: 'Project Manager', avatar: '👨‍💼' },
            { id: '2', name: 'Sarah Johnson', role: 'Site Engineer', avatar: '👩‍🔧' },
            { id: '3', name: 'Mike Davis', role: 'Safety Officer', avatar: '🦺' },
            { id: '4', name: 'Emily Brown', role: 'Architect', avatar: '👩‍🎨' },
        ],
        tasks: [
            { id: '1', title: 'Foundation inspection', status: 'completed', assignee: 'Sarah Johnson', dueDate: 'Apr 15, 2024', priority: 'high' },
            { id: '2', title: 'Electrical rough-in', status: 'in-progress', assignee: 'Mike Davis', dueDate: 'May 20, 2024', priority: 'medium' },
            { id: '3', title: 'Plumbing installation', status: 'todo', assignee: 'John Smith', dueDate: 'Jun 10, 2024', priority: 'high' },
        ],
        milestones: [
            { id: '1', title: 'Foundation Complete', date: 'Apr 30, 2024', status: 'completed' },
            { id: '2', title: 'Framing Complete', date: 'Jun 15, 2024', status: 'upcoming' },
            { id: '3', title: 'MEP Rough-in', date: 'Aug 1, 2024', status: 'upcoming' },
        ],
        documents: [
            { id: '1', name: 'Site Plan.pdf', type: 'PDF', size: '2.4 MB', uploadedBy: 'Emily Brown', uploadedAt: '2 days ago' },
            { id: '2', name: 'Building Permit.pdf', type: 'PDF', size: '1.1 MB', uploadedBy: 'John Smith', uploadedAt: '1 week ago' },
            { id: '3', name: 'Safety Report.docx', type: 'DOCX', size: '856 KB', uploadedBy: 'Mike Davis', uploadedAt: '3 days ago' },
        ],
        recentActivity: [
            { id: '1', type: 'task', description: 'Foundation inspection completed', user: 'Sarah Johnson', timestamp: '2 hours ago' },
            { id: '2', type: 'document', description: 'Site Plan.pdf uploaded', user: 'Emily Brown', timestamp: '5 hours ago' },
            { id: '3', type: 'comment', description: 'Added comment on electrical work', user: 'Mike Davis', timestamp: '1 day ago' },
        ],
    };

    const formatCurrency = (amount?: number) => {
        if (amount === undefined || amount === null) return '£0';
        return `£${amount.toLocaleString()}`;
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            'planning': 'bg-yellow-100 text-yellow-800',
            'in progress': 'bg-blue-100 text-blue-800',
            'approved': 'bg-green-100 text-green-800',
            'completed': 'bg-gray-100 text-gray-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const getPriorityColor = (priority: string) => {
        const colors: Record<string, string> = {
            'low': 'bg-gray-100 text-gray-800',
            'medium': 'bg-orange-100 text-orange-800',
            'high': 'bg-red-100 text-red-800'
        };
        return colors[priority] || 'bg-gray-100 text-gray-800';
    };

    const getTaskStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            'todo': 'bg-gray-100 text-gray-800',
            'in-progress': 'bg-blue-100 text-blue-800',
            'completed': 'bg-green-100 text-green-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const getMilestoneStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            'upcoming': 'bg-blue-100 text-blue-800',
            'completed': 'bg-green-100 text-green-800',
            'overdue': 'bg-red-100 text-red-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    return (
        <div className="p-8">
            {/* Header */}
            <div className="mb-8">
                <button
                    onClick={onBack}
                    className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Projects
                </button>

                <div className="flex items-start justify-between">
                    <div>
                        <div className="flex items-center space-x-3 mb-2">
                            <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.status)}`}>
                                {project.status}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(project.priority)}`}>
                                {project.priority} priority
                            </span>
                        </div>
                        <p className="text-gray-600">{project.client} • {project.location}</p>
                    </div>
                    <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                        Edit Project
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="text-sm text-gray-600 mb-1">Budget</div>
                    <div className="text-2xl font-bold text-gray-900">{formatCurrency(project.budget)}</div>
                    <div className="text-sm text-gray-500 mt-1">Total allocated</div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="text-sm text-gray-600 mb-1">Spent</div>
                    <div className="text-2xl font-bold text-gray-900">{formatCurrency(project.spent)}</div>
                    <div className="text-sm text-gray-500 mt-1">{((project.spent / project.budget) * 100).toFixed(1)}% of budget</div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="text-sm text-gray-600 mb-1">Progress</div>
                    <div className="text-2xl font-bold text-gray-900">{project.progress}%</div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${project.progress}%` }}></div>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="text-sm text-gray-600 mb-1">Timeline</div>
                    <div className="text-lg font-bold text-gray-900">{project.startDate}</div>
                    <div className="text-sm text-gray-500 mt-1">to {project.endDate}</div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
                <div className="border-b border-gray-200">
                    <nav className="flex space-x-8 px-6" aria-label="Tabs">
                        {(['overview', 'tasks', 'team', 'documents', 'activity'] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${activeTab === tab
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Tab Content */}
                <div className="p-6">
                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">Project Description</h3>
                                <p className="text-gray-600">{project.description}</p>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">Milestones</h3>
                                <div className="space-y-3">
                                    {project.milestones.map((milestone) => (
                                        <div key={milestone.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                            <div className="flex items-center space-x-3">
                                                <div className={`w-3 h-3 rounded-full ${milestone.status === 'completed' ? 'bg-green-500' :
                                                        milestone.status === 'overdue' ? 'bg-red-500' : 'bg-blue-500'
                                                    }`}></div>
                                                <div>
                                                    <div className="font-medium text-gray-900">{milestone.title}</div>
                                                    <div className="text-sm text-gray-500">{milestone.date}</div>
                                                </div>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getMilestoneStatusColor(milestone.status)}`}>
                                                {milestone.status}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'tasks' && (
                        <div className="space-y-3">
                            {project.tasks.map((task) => (
                                <div key={task.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-3 mb-2">
                                            <h4 className="font-medium text-gray-900">{task.title}</h4>
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${getTaskStatusColor(task.status)}`}>
                                                {task.status}
                                            </span>
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(task.priority)}`}>
                                                {task.priority}
                                            </span>
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            Assigned to: {task.assignee} • Due: {task.dueDate}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'team' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {project.team.map((member) => (
                                <div key={member.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                                    <div className="text-4xl">{member.avatar}</div>
                                    <div>
                                        <div className="font-medium text-gray-900">{member.name}</div>
                                        <div className="text-sm text-gray-600">{member.role}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'documents' && (
                        <div className="space-y-3">
                            {project.documents.map((doc) => (
                                <div key={doc.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <div className="font-medium text-gray-900">{doc.name}</div>
                                            <div className="text-sm text-gray-600">{doc.size} • Uploaded by {doc.uploadedBy} • {doc.uploadedAt}</div>
                                        </div>
                                    </div>
                                    <button className="text-blue-600 hover:text-blue-700">Download</button>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'activity' && (
                        <div className="space-y-4">
                            {project.recentActivity.map((activity) => (
                                <div key={activity.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${activity.type === 'task' ? 'bg-blue-100' :
                                            activity.type === 'document' ? 'bg-green-100' : 'bg-purple-100'
                                        }`}>
                                        {activity.type === 'task' && '✓'}
                                        {activity.type === 'document' && '📄'}
                                        {activity.type === 'comment' && '💬'}
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-medium text-gray-900">{activity.description}</div>
                                        <div className="text-sm text-gray-600">{activity.user} • {activity.timestamp}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

