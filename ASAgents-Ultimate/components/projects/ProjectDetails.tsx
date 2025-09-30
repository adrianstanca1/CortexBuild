// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Project, User, Todo } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Tag } from '../ui/Tag';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Calendar, 
  DollarSign, 
  Users, 
  MapPin, 
  TrendingUp,
  CheckCircle,
  Clock,
  AlertTriangle,
  Plus,
  FileText,
  MessageSquare,
  Settings
} from 'lucide-react';
import { format, differenceInDays, isAfter } from 'date-fns';

interface ProjectDetailsProps {
  project: Project;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
  user: User;
  addToast: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

interface ProjectTab {
  id: string;
  label: string;
  icon: React.ReactNode;
}

export const ProjectDetails: React.FC<ProjectDetailsProps> = ({
  project,
  onBack,
  onEdit,
  onDelete,
  user,
  addToast,
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [tasks, setTasks] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(false);

  const daysUntilDeadline = differenceInDays(project.endDate, new Date());
  const isOverdue = isAfter(new Date(), project.endDate) && project.status !== 'completed';
  const budgetUsed = (project.spent / project.budget) * 100;
  const completedMilestones = project.milestones?.filter(m => m.completed).length || 0;
  const totalMilestones = project.milestones?.length || 0;

  const tabs: ProjectTab[] = [
    { id: 'overview', label: 'Overview', icon: <FileText size={16} /> },
    { id: 'tasks', label: 'Tasks', icon: <CheckCircle size={16} /> },
    { id: 'timeline', label: 'Timeline', icon: <Calendar size={16} /> },
    { id: 'team', label: 'Team', icon: <Users size={16} /> },
    { id: 'budget', label: 'Budget', icon: <DollarSign size={16} /> },
    { id: 'files', label: 'Files', icon: <FileText size={16} /> },
    { id: 'activity', label: 'Activity', icon: <MessageSquare size={16} /> },
  ];

  // Load project tasks
  useEffect(() => {
    const loadTasks = async () => {
      try {
        setLoading(true);
        // Simulate API call - replace with actual API
        const mockTasks: Todo[] = [
          {
            id: '1',
            title: 'Foundation Inspection',
            description: 'Complete foundation inspection and documentation',
            status: 'completed',
            priority: 'high',
            assigneeId: user.id,
            projectId: project.id,
            dueDate: new Date('2024-03-01'),
            createdAt: new Date('2024-02-15'),
            updatedAt: new Date('2024-03-01'),
          },
          {
            id: '2',
            title: 'Structural Framework',
            description: 'Install main structural framework',
            status: 'in-progress',
            priority: 'high',
            assigneeId: user.id,
            projectId: project.id,
            dueDate: new Date('2024-04-15'),
            createdAt: new Date('2024-03-01'),
            updatedAt: new Date('2024-03-10'),
          },
          {
            id: '3',
            title: 'Electrical Rough-in',
            description: 'Complete electrical rough-in work',
            status: 'pending',
            priority: 'medium',
            assigneeId: user.id,
            projectId: project.id,
            dueDate: new Date('2024-05-01'),
            createdAt: new Date('2024-03-15'),
            updatedAt: new Date('2024-03-15'),
          },
        ];
        setTasks(mockTasks);
      } catch (error) {
        console.error('Failed to load tasks:', error);
        addToast('Failed to load project tasks', 'error');
      } finally {
        setLoading(false);
      }
    };

    loadTasks();
  }, [project.id, user.id, addToast]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'on-hold':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'planning':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Project Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="text-blue-600" size={24} />
            <div>
              <div className="text-2xl font-bold text-foreground">{project.progress}%</div>
              <div className="text-sm text-muted-foreground">Progress</div>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <DollarSign className="text-green-600" size={24} />
            <div>
              <div className="text-2xl font-bold text-foreground">
                ${(project.spent / 1000).toFixed(0)}K
              </div>
              <div className="text-sm text-muted-foreground">
                of ${(project.budget / 1000).toFixed(0)}K
              </div>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="text-purple-600" size={24} />
            <div>
              <div className="text-2xl font-bold text-foreground">
                {completedMilestones}/{totalMilestones}
              </div>
              <div className="text-sm text-muted-foreground">Milestones</div>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Clock className={isOverdue ? 'text-red-600' : 'text-blue-600'} size={24} />
            <div>
              <div className="text-2xl font-bold text-foreground">
                {Math.abs(daysUntilDeadline)}
              </div>
              <div className="text-sm text-muted-foreground">
                {isOverdue ? 'Days overdue' : 'Days remaining'}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Progress Bars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Project Progress</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Overall Progress</span>
                <span className="text-sm text-muted-foreground">{project.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-blue-500 h-3 rounded-full transition-all"
                  style={{ width: `${project.progress}%` }}
                />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Budget Used</span>
                <span className="text-sm text-muted-foreground">{budgetUsed.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all ${
                    budgetUsed > 90 ? 'bg-red-500' : budgetUsed > 75 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(budgetUsed, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Milestones</h3>
          <div className="space-y-3">
            {project.milestones?.map(milestone => (
              <div key={milestone.id} className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full ${
                  milestone.completed ? 'bg-green-500' : 'bg-gray-300'
                }`} />
                <div className="flex-1">
                  <div className={`text-sm font-medium ${
                    milestone.completed ? 'text-foreground' : 'text-muted-foreground'
                  }`}>
                    {milestone.name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {format(milestone.date, 'MMM dd, yyyy')}
                  </div>
                </div>
                {milestone.completed && (
                  <CheckCircle size={16} className="text-green-500" />
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Description and Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6">
          <h3 className="text-lg font-semibold mb-4">Description</h3>
          <p className="text-muted-foreground leading-relaxed">
            {project.description}
          </p>
          
          {project.tags && project.tags.length > 0 && (
            <div className="mt-6">
              <h4 className="text-sm font-medium mb-3">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {project.tags.map(tag => (
                  <Tag key={tag} label={tag} />
                ))}
              </div>
            </div>
          )}
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Project Details</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Calendar size={16} className="text-muted-foreground" />
              <div>
                <div className="text-sm font-medium">Duration</div>
                <div className="text-sm text-muted-foreground">
                  {format(project.startDate, 'MMM dd')} - {format(project.endDate, 'MMM dd, yyyy')}
                </div>
              </div>
            </div>
            
            {project.location && (
              <div className="flex items-center gap-3">
                <MapPin size={16} className="text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium">Location</div>
                  <div className="text-sm text-muted-foreground">{project.location}</div>
                </div>
              </div>
            )}
            
            <div className="flex items-center gap-3">
              <Users size={16} className="text-muted-foreground" />
              <div>
                <div className="text-sm font-medium">Team Size</div>
                <div className="text-sm text-muted-foreground">
                  {project.teamIds.length} members
                </div>
              </div>
            </div>
            
            {project.clientId && (
              <div className="flex items-center gap-3">
                <FileText size={16} className="text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium">Client</div>
                  <div className="text-sm text-muted-foreground">{project.clientId}</div>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );

  const renderTasks = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Project Tasks</h3>
        <Button size="sm">
          <Plus size={16} className="mr-2" />
          Add Task
        </Button>
      </div>
      
      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map(task => (
            <Card key={task.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    task.status === 'completed' ? 'bg-green-500' :
                    task.status === 'in-progress' ? 'bg-blue-500' : 'bg-gray-300'
                  }`} />
                  <div>
                    <div className="font-medium">{task.title}</div>
                    <div className="text-sm text-muted-foreground">{task.description}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-medium ${getPriorityColor(task.priority)}`}>
                    {task.priority} priority
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Due: {format(task.dueDate, 'MMM dd')}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'tasks':
        return renderTasks();
      case 'timeline':
        return <div className="text-center py-12 text-muted-foreground">Timeline view coming soon</div>;
      case 'team':
        return <div className="text-center py-12 text-muted-foreground">Team management coming soon</div>;
      case 'budget':
        return <div className="text-center py-12 text-muted-foreground">Budget details coming soon</div>;
      case 'files':
        return <div className="text-center py-12 text-muted-foreground">File management coming soon</div>;
      case 'activity':
        return <div className="text-center py-12 text-muted-foreground">Activity feed coming soon</div>;
      default:
        return renderOverview();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft size={16} className="mr-2" />
            Back to Projects
          </Button>
          
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-foreground">{project.name}</h1>
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(project.status)}`}>
                {project.status}
              </span>
              {project.priority && (
                <span className={`text-sm font-medium ${getPriorityColor(project.priority)}`}>
                  {project.priority} priority
                </span>
              )}
              {isOverdue && (
                <div className="flex items-center gap-1 text-red-600">
                  <AlertTriangle size={16} />
                  <span className="text-sm">Overdue</span>
                </div>
              )}
            </div>
            <p className="text-muted-foreground">{project.description}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onEdit}>
            <Edit size={16} className="mr-2" />
            Edit
          </Button>
          <Button variant="outline" onClick={onDelete}>
            <Trash2 size={16} className="mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <div className="flex space-x-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {renderTabContent()}
      </div>
    </div>
  );
};
