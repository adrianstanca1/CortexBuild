/**
 * Projects Page - Connected to CortexBuild API
 * Version: 1.1.0 GOLDEN
 */

import { NotificationBell } from '../../notifications/NotificationBell';
import { NotificationCenter } from '../../notifications/NotificationCenter';
import { CreateProjectModal } from '../modals/CreateProjectModal';

interface Project {
    id: number;
    name: string;
    client_name?: string;
    location?: string;
    budget?: number;
    spent?: number;
    progress?: number;
    status: string;
    priority?: string;
    start_date?: string;
    end_date?: string;
}

export const ProjectsPage: React.FC = () => {
    const [showNotificationCenter, setShowNotificationCenter] = useState(false);
    const [currentUserId, setCurrentUserId] = useState<string>('user-2'); // Mock user ID
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [showCreateModal, setShowCreateModal] = useState(false);

    // Fetch projects from API
    useEffect(() => {
        if (!selectedProjectId) {
            fetchProjects();
        }
    }, [searchQuery, statusFilter, page, selectedProjectId]);

    const fetchProjects = async () => {
        try {
            setLoading(true);
            setError(null);

            const params = new URLSearchParams({
                page: page.toString(),
                limit: '20'
            });

            if (searchQuery) params.append('search', searchQuery);
            if (statusFilter !== 'all') params.append('status', statusFilter);

            const response = await fetch(`/api/projects?${params}`);
            const data = await response.json();

            if (data.success) {
                setProjects(data.data);
                setTotalPages(data.pagination?.totalPages || 1);
            } else {
                setError(data.error || 'Failed to fetch projects');
            }
        } catch (err: any) {
            setError(err.message || 'Failed to fetch projects');
            // Fallback to mock data
            setProjects(mockProjects);
        } finally {
            setLoading(false);
        }
    };

    // If a project is selected, show the detail page
    if (selectedProjectId) {
        return <ProjectDetailPage projectId={selectedProjectId} onBack={() => setSelectedProjectId(null)} />;
    }

    // Mock data as fallback
    const mockProjects: Project[] = [
        {
            id: '1',
            name: 'ASasdad',
            client: 'Green Valley Homes',
            location: 'rm82ul',
            budget: 123333,
            spent: 0,
            progress: 0,
            status: 'planning',
            priority: 'medium',
            startDate: null,
            endDate: null
        },
        {
            id: '2',
            name: 'Downtown Office Complex',
            client: 'Metro Construction Group',
            location: 'Manhattan, NY',
            budget: 12500000,
            spent: 5200000,
            progress: 45,
            status: 'in progress',
            priority: 'high',
            startDate: 'Jan 15, 2024',
            endDate: 'Jun 30, 2025'
        },
        {
            id: '3',
            name: 'Riverside Luxury Apartments',
            client: 'Green Valley Homes',
            location: 'Los Angeles, CA',
            budget: 8900000,
            spent: 2100000,
            progress: 28,
            status: 'in progress',
            priority: 'medium',
            startDate: 'Mar 1, 2024',
            endDate: 'Aug 31, 2025'
        },
        {
            id: '4',
            name: 'Manufacturing Facility Expansion',
            client: 'Industrial Partners LLC',
            location: 'Chicago, IL',
            budget: 15000000,
            spent: 0,
            progress: 0,
            status: 'planning',
            priority: 'critical',
            startDate: 'Jun 1, 2024',
            endDate: 'Dec 31, 2025'
        },
        {
            id: '5',
            name: 'Riverside Apartments',
            client: 'Green Valley Homes',
            location: '456 River Rd',
            budget: 3200000,
            spent: 1800000,
            progress: 56,
            status: 'in progress',
            priority: 'medium',
            startDate: 'Mar 1, 2024',
            endDate: 'Dec 15, 2024'
        },
        {
            id: '6',
            name: 'City Bridge Renovation',
            client: 'Metro City Council',
            location: 'Old Town Bridge',
            budget: 1800000,
            spent: 0,
            progress: 0,
            status: 'approved',
            priority: 'critical',
            startDate: 'Jul 1, 2024',
            endDate: 'Mar 31, 2025'
        },
        {
            id: '7',
            name: 'Downtown Office Complex',
            client: 'Sunset Developments',
            location: '123 Main St, Downtown',
            budget: 5500000,
            spent: 2100000,
            progress: 38,
            status: 'in progress',
            priority: 'high',
            startDate: 'Jan 15, 2024',
            endDate: 'Jun 30, 2025'
        }
    ];

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
            'medium': 'bg-blue-100 text-blue-800',
            'high': 'bg-orange-100 text-orange-800',
            'critical': 'bg-red-100 text-red-800'
        };
        return colors[priority] || 'bg-gray-100 text-gray-800';
    };

    return (
        <div className="p-8">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Projects</h1>
                        {/* Notification Bell */}
                        <NotificationBell
                            userId={currentUserId}
                            onOpenNotifications={() => setShowNotificationCenter(true)}
                            showUnreadCount={true}
                            maxCount={99}
                        />

                    </div>
                    <div className="flex items-center space-x-4">
                        {/* Search */}
                        <div className="relative">
                            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Search projects..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                            />
                        </div>

                        {/* Status Filter */}
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="all">All Status</option>
                            <option value="planning">Planning</option>
                            <option value="in progress">In Progress</option>
                            <option value="approved">Approved</option>
                            <option value="completed">Completed</option>
                        </select>

                        {/* Type Filter */}
                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="all">All Types</option>
                            <option value="residential">Residential</option>
                            <option value="commercial">Commercial</option>
                            <option value="industrial">Industrial</option>
                        </select>

                        {/* New Project Button */}
                        <button
                            type="button"
                            onClick={() => setShowCreateModal(true)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            <span>New Project</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Projects Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => (
                    <div
                        key={project.id}
                        onClick={() => setSelectedProjectId(project.id)}
                        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all cursor-pointer hover:scale-105"
                    >
                        {/* Header */}
                        <div className="mb-4">
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(project.status)}`}>
                                        {project.status}
                                    </span>
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(project.priority)}`}>
                                        {project.priority}
                                    </span>
                                </div>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">{project.name}</h3>
                            <p className="text-sm text-gray-600">{project.client}</p>
                        </div>

                        {/* Details */}
                        <div className="space-y-2 mb-4">
                            <p className="text-sm text-gray-600">{project.location}</p>

                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">Budget:</span>
                                <span className="font-semibold text-gray-900">{formatCurrency(project.budget)}</span>
                            </div>

                            {project.spent > 0 && (
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">Spent:</span>
                                    <span className="font-semibold text-gray-900">{formatCurrency(project.spent)}</span>
                                </div>
                            )}

                            {project.progress > 0 && (
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">Progress:</span>
                                    <span className="font-semibold text-gray-900">{project.progress}%</span>
                                </div>
                            )}

                            {project.startDate && project.endDate && (
                                <div className="flex items-center text-xs text-gray-500 mt-2">
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <span>{project.startDate}</span>
                                    <span className="mx-1">→</span>
                                    <span>{project.endDate}</span>
                                </div>
                            )}
                        </div>

                        {/* View Details Button */}
                        <button
                            type="button"
                            className="w-full bg-gray-50 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center space-x-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                            <span>View Details</span>
                        </button>
                    </div>
                ))}
            </div>

            {/* Notification Center Modal */}
            <NotificationCenter
                userId={currentUserId}
                isOpen={showNotificationCenter}
                onClose={() => setShowNotificationCenter(false)}
            />

            <CreateProjectModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSuccess={() => {
                    fetchProjects();
                    setShowCreateModal(false);
                }}
            />
        </div>
    );
};

