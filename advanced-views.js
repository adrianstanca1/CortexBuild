// Advanced CortexBuild Views and Components
// This file contains all the advanced view components for the CortexBuild platform

// Advanced Projects View with Kanban Board
const ProjectsView = () => {
    const [viewMode, setViewMode] = useState('grid');
    const [filterStatus, setFilterStatus] = useState('all');
    const [sortBy, setSortBy] = useState('name');
    const [showCreateModal, setShowCreateModal] = useState(false);

    const filteredProjects = mockDatabase.projects
        .filter(project => filterStatus === 'all' || project.status === filterStatus)
        .sort((a, b) => {
            switch (sortBy) {
                case 'name': return a.name.localeCompare(b.name);
                case 'progress': return b.progress - a.progress;
                case 'budget': return b.budget - a.budget;
                case 'dueDate': return new Date(a.endDate) - new Date(b.endDate);
                default: return 0;
            }
        });

    const KanbanBoard = () => {
        const columns = [
            { id: 'Planning', title: 'Planning', projects: filteredProjects.filter(p => p.status === 'Planning') },
            { id: 'In Progress', title: 'In Progress', projects: filteredProjects.filter(p => p.status === 'In Progress') },
            { id: 'Completed', title: 'Completed', projects: filteredProjects.filter(p => p.status === 'Completed') }
        ];

        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {columns.map(column => (
                    <div key={column.id} className="glass-effect rounded-xl p-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-gray-700">{column.title}</h3>
                            <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-sm">
                                {column.projects.length}
                            </span>
                        </div>
                        <div className="kanban-column space-y-3">
                            {column.projects.map(project => (
                                <div key={project.id} className="draggable bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                                    <h4 className="font-medium mb-2">{project.name}</h4>
                                    <p className="text-sm text-gray-600 mb-3">{project.description}</p>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm text-gray-500">Progress</span>
                                        <span className="text-sm font-medium">{project.progress}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                                        <div 
                                            className="bg-blue-500 h-2 rounded-full" 
                                            style={{width: `${project.progress}%`}}
                                        ></div>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-500">Budget</span>
                                        <span className="font-medium">{DataManager.transform.currency(project.budget)}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm mt-1">
                                        <span className="text-gray-500">Due</span>
                                        <span className="font-medium">{DataManager.transform.date(project.endDate)}</span>
                                    </div>
                                    <div className="flex items-center space-x-2 mt-3">
                                        {project.tags.map(tag => (
                                            <span key={tag} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const GridView = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map(project => {
                const health = BusinessLogic.projects.getProjectHealth(project);
                const healthColors = {
                    excellent: 'border-green-500 bg-green-50',
                    good: 'border-blue-500 bg-blue-50',
                    warning: 'border-yellow-500 bg-yellow-50',
                    critical: 'border-red-500 bg-red-50'
                };
                
                return (
                    <div key={project.id} className={`glass-effect p-6 rounded-xl card-hover border-l-4 ${healthColors[health]}`}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">{project.name}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                project.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                project.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                                'bg-yellow-100 text-yellow-800'
                            }`}>
                                {project.status}
                            </span>
                        </div>
                        
                        <p className="text-gray-600 mb-4 text-sm">{project.description}</p>
                        
                        <div className="space-y-3">
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span>Progress</span>
                                    <span>{project.progress}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div 
                                        className="bg-blue-500 h-2 rounded-full" 
                                        style={{width: `${project.progress}%`}}
                                    ></div>
                                </div>
                            </div>
                            
                            <div className="flex justify-between text-sm">
                                <span>Budget</span>
                                <span className="font-medium">{DataManager.transform.currency(project.budget)}</span>
                            </div>
                            
                            <div className="flex justify-between text-sm">
                                <span>Spent</span>
                                <span className="font-medium">{DataManager.transform.currency(project.spent)}</span>
                            </div>
                            
                            <div className="flex justify-between text-sm">
                                <span>Due Date</span>
                                <span className="font-medium">{DataManager.transform.date(project.endDate)}</span>
                            </div>
                            
                            <div className="flex justify-between text-sm">
                                <span>Manager</span>
                                <span className="font-medium">
                                    {mockDatabase.users.find(u => u.id === project.managerId)?.name}
                                </span>
                            </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-1 mt-4">
                            {project.tags.map(tag => (
                                <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                                    {tag}
                                </span>
                            ))}
                        </div>
                        
                        <div className="flex space-x-2 mt-4">
                            <button className="flex-1 bg-blue-100 text-blue-800 py-2 rounded-lg hover:bg-blue-200 transition-colors text-sm">
                                View Details
                            </button>
                            <button className="flex-1 bg-gray-100 text-gray-800 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm">
                                Edit
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    );

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
                <div>
                    <h2 className="text-2xl font-bold">🏗️ Projects</h2>
                    <p className="text-gray-600">Manage and track your construction projects</p>
                </div>
                <button 
                    onClick={() => setShowCreateModal(true)}
                    className="gradient-bg text-white px-4 py-2 rounded-lg hover:opacity-90 transition-all"
                >
                    + New Project
                </button>
            </div>
            
            {/* Filters and Controls */}
            <div className="glass-effect p-4 rounded-xl">
                <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                            <label className="text-sm font-medium text-gray-700">View:</label>
                            <select
                                value={viewMode}
                                onChange={(e) => setViewMode(e.target.value)}
                                className="px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="grid">Grid</option>
                                <option value="kanban">Kanban</option>
                                <option value="list">List</option>
                            </select>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                            <label className="text-sm font-medium text-gray-700">Status:</label>
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">All</option>
                                <option value="Planning">Planning</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Completed">Completed</option>
                            </select>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                            <label className="text-sm font-medium text-gray-700">Sort by:</label>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="name">Name</option>
                                <option value="progress">Progress</option>
                                <option value="budget">Budget</option>
                                <option value="dueDate">Due Date</option>
                            </select>
                        </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                        <input
                            type="text"
                            placeholder="Search projects..."
                            className="px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors">
                            🔍
                        </button>
                    </div>
                </div>
            </div>
            
            {/* Projects Display */}
            {viewMode === 'grid' && <GridView />}
            {viewMode === 'kanban' && <KanbanBoard />}
            
            {/* Create Project Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 modal-overlay flex items-center justify-center z-50">
                    <div className="glass-effect rounded-xl p-6 w-full max-w-md mx-4">
                        <h3 className="text-lg font-semibold mb-4">Create New Project</h3>
                        <form className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter project name"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows="3"
                                    placeholder="Enter project description"
                                ></textarea>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Budget</label>
                                    <input
                                        type="number"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="0"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                        <option value="Low">Low</option>
                                        <option value="Medium">Medium</option>
                                        <option value="High">High</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 gradient-bg text-white py-2 rounded-lg hover:opacity-90 transition-all"
                                >
                                    Create Project
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

// Advanced Tasks View with Gantt Chart
const TasksView = () => {
    const [viewMode, setViewMode] = useState('table');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterPriority, setFilterPriority] = useState('all');
    const [selectedTask, setSelectedTask] = useState(null);

    const filteredTasks = mockDatabase.tasks.filter(task => {
        const statusMatch = filterStatus === 'all' || task.status === filterStatus;
        const priorityMatch = filterPriority === 'all' || task.priority === filterPriority;
        return statusMatch && priorityMatch;
    });

    const GanttChart = () => {
        const today = new Date();
        const startDate = new Date(Math.min(...mockDatabase.projects.map(p => new Date(p.startDate))));
        const endDate = new Date(Math.max(...mockDatabase.projects.map(p => new Date(p.endDate))));
        const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));

        return (
            <div className="glass-effect rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4">📊 Project Timeline</h3>
                <div className="overflow-x-auto">
                    <div className="min-w-full">
                        {mockDatabase.projects.map(project => {
                            const projectStart = new Date(project.startDate);
                            const projectEnd = new Date(project.endDate);
                            const projectDuration = Math.ceil((projectEnd - projectStart) / (1000 * 60 * 60 * 24));
                            const startOffset = Math.ceil((projectStart - startDate) / (1000 * 60 * 60 * 24));
                            const widthPercentage = (projectDuration / totalDays) * 100;
                            const leftPercentage = (startOffset / totalDays) * 100;

                            return (
                                <div key={project.id} className="mb-4">
                                    <div className="flex items-center mb-2">
                                        <div className="w-48 text-sm font-medium truncate">{project.name}</div>
                                        <div className="flex-1 relative h-8 bg-gray-100 rounded">
                                            <div
                                                className={`gantt-bar absolute top-1 ${
                                                    project.status === 'Completed' ? 'bg-green-500' :
                                                    project.status === 'In Progress' ? 'bg-blue-500' :
                                                    'bg-yellow-500'
                                                } rounded`}
                                                style={{
                                                    left: `${leftPercentage}%`,
                                                    width: `${widthPercentage}%`
                                                }}
                                            >
                                                <div className="text-white text-xs px-2 py-1 truncate">
                                                    {project.progress}%
                                                </div>
                                            </div>
                                        </div>
                                        <div className="w-24 text-sm text-gray-600 text-right">
                                            {DataManager.transform.date(project.endDate)}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
                <div>
                    <h2 className="text-2xl font-bold">📋 Tasks</h2>
                    <p className="text-gray-600">Manage and track project tasks</p>
                </div>
                <button className="gradient-bg text-white px-4 py-2 rounded-lg hover:opacity-90 transition-all">
                    + New Task
                </button>
            </div>
            
            {/* Filters */}
            <div className="glass-effect p-4 rounded-xl">
                <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                            <label className="text-sm font-medium text-gray-700">View:</label>
                            <select
                                value={viewMode}
                                onChange={(e) => setViewMode(e.target.value)}
                                className="px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="table">Table</option>
                                <option value="gantt">Gantt Chart</option>
                                <option value="calendar">Calendar</option>
                            </select>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                            <label className="text-sm font-medium text-gray-700">Status:</label>
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">All</option>
                                <option value="Pending">Pending</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Completed">Completed</option>
                            </select>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                            <label className="text-sm font-medium text-gray-700">Priority:</label>
                            <select
                                value={filterPriority}
                                onChange={(e) => setFilterPriority(e.target.value)}
                                className="px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">All</option>
                                <option value="High">High</option>
                                <option value="Medium">Medium</option>
                                <option value="Low">Low</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Tasks Display */}
            {viewMode === 'gantt' && <GanttChart />}
            
            {viewMode === 'table' && (
                <div className="glass-effect rounded-xl overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assignee</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredTasks.map(task => {
                                const project = mockDatabase.projects.find(p => p.id === task.projectId);
                                const assignee = mockDatabase.users.find(u => u.id === task.assigneeId);
                                const efficiency = BusinessLogic.tasks.calculateEfficiency(task);
                                
                                return (
                                    <tr key={task.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedTask(task)}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div className="font-medium text-gray-900">{task.title}</div>
                                                <div className="text-sm text-gray-500 truncate max-w-xs">{task.description}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {project?.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <span className="text-lg mr-2">{assignee?.avatar}</span>
                                                <span className="text-sm text-gray-900">{assignee?.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                task.priority === 'High' ? 'bg-red-100 text-red-800' :
                                                task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-green-100 text-green-800'
                                            }`}>
                                                {task.priority}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {DataManager.transform.date(task.dueDate)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                task.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                                task.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                                                'bg-gray-100 text-gray-800'
                                            }`}>
                                                {task.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                                    <div 
                                                        className="bg-blue-500 h-2 rounded-full" 
                                                        style={{width: `${(task.actualHours / task.estimatedHours) * 100}%`}}
                                                    ></div>
                                                </div>
                                                <span className="text-sm text-gray-600">
                                                    {task.actualHours}h / {task.estimatedHours}h
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button className="text-blue-600 hover:text-blue-900 mr-2">Edit</button>
                                            <button className="text-red-600 hover:text-red-900">Delete</button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};
