import React, { useState, useEffect, lazy, Suspense } from 'react';
import { User, Project } from '../../types';
import { schedulingService, ProjectSchedule, Milestone, ScheduleConflict } from '../../services/schedulingService';
import { dataService } from '../../services/dataService';

// Lazy load Phase 1 components
const GanttChart = lazy(() => import('../projects/GanttChart'));
const WBSBuilder = lazy(() => import('../projects/WBSBuilder'));
const BudgetManager = lazy(() => import('../financial/BudgetManager'));

interface ProjectPlanningScreenProps {
  currentUser: User;
  project?: Project;
  onNavigate: (screen: string, params?: any) => void;
}

const ProjectPlanningScreen: React.FC<ProjectPlanningScreenProps> = ({ currentUser, project, onNavigate }) => {
  const [schedule, setSchedule] = useState<ProjectSchedule | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [conflicts, setConflicts] = useState<ScheduleConflict[]>([]);
  const [ganttData, setGanttData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'gantt' | 'wbs' | 'budget' | 'milestones' | 'conflicts'>('overview');
  const [selectedProject, setSelectedProject] = useState<string>(project?.id || '');
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    loadProjects();
  }, [currentUser]);

  useEffect(() => {
    if (selectedProject) {
      loadProjectData();
    }
  }, [selectedProject]);

  const loadProjects = async () => {
    try {
      const projectsData = await dataService.getProjects(
        currentUser.role === 'super_admin' ? undefined : currentUser.companyId
      );
      setProjects(projectsData);
      
      if (!selectedProject && projectsData.length > 0) {
        setSelectedProject(projectsData[0].id);
      }
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

  const loadProjectData = async () => {
    try {
      setLoading(true);
      
      // Load project schedule
      const scheduleData = await schedulingService.getProjectSchedule(selectedProject);
      setSchedule(scheduleData);

      // Load milestones
      const milestonesData = await schedulingService.getProjectMilestones(selectedProject);
      setMilestones(milestonesData);

      // Load conflicts
      const conflictsData = await schedulingService.detectScheduleConflicts(selectedProject);
      setConflicts(conflictsData);

      // Load Gantt data
      if (scheduleData) {
        const gantt = await schedulingService.generateGanttData(selectedProject);
        setGanttData(gantt);
      }
    } catch (error) {
      console.error('Error loading project data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'delayed': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateDaysUntil = (dateString: string) => {
    const targetDate = new Date(dateString);
    const now = new Date();
    const diffTime = targetDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Project Planning</h1>
          <p className="text-gray-600 mt-1">Schedule management and timeline optimization</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Project</option>
            {projects.map(proj => (
              <option key={proj.id} value={proj.id}>{proj.name}</option>
            ))}
          </select>
          
          <button
            onClick={() => onNavigate('schedule-optimizer', { projectId: selectedProject })}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Optimize Schedule
          </button>
        </div>
      </div>

      {!schedule ? (
        <div className="bg-white rounded-lg shadow border p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Schedule Found</h3>
          <p className="text-gray-500 mb-6">Create a project schedule to start planning</p>
          <button
            onClick={() => onNavigate('create-schedule', { projectId: selectedProject })}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Create Schedule
          </button>
        </div>
      ) : (
        <>
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', name: 'Overview', icon: '📊' },
                { id: 'gantt', name: 'Gantt Chart', icon: '📅' },
                { id: 'wbs', name: 'WBS', icon: '🗂️' },
                { id: 'budget', name: 'Budget', icon: '💰' },
                { id: 'milestones', name: 'Milestones', icon: '🎯' },
                { id: 'conflicts', name: 'Conflicts', icon: '⚠️', badge: conflicts.length }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.icon} {tab.name}
                  {tab.badge && tab.badge > 0 && (
                    <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
                      {tab.badge}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Schedule Summary */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg shadow border">
                  <div className="text-2xl font-bold text-blue-600">{schedule.totalDuration}</div>
                  <div className="text-sm text-gray-600">Total Days</div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow border">
                  <div className="text-2xl font-bold text-green-600">{schedule.phases.length}</div>
                  <div className="text-sm text-gray-600">Phases</div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow border">
                  <div className="text-2xl font-bold text-purple-600">{milestones.length}</div>
                  <div className="text-sm text-gray-600">Milestones</div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow border">
                  <div className="text-2xl font-bold text-orange-600">{schedule.bufferTime}</div>
                  <div className="text-sm text-gray-600">Buffer Days</div>
                </div>
              </div>

              {/* Project Timeline */}
              <div className="bg-white rounded-lg shadow border p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Project Timeline</h2>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Start Date</span>
                    <span className="font-medium">{formatDate(schedule.startDate)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">End Date</span>
                    <span className="font-medium">{formatDate(schedule.endDate)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Risk Level</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      schedule.riskLevel === 'high' ? 'bg-red-100 text-red-800' :
                      schedule.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {schedule.riskLevel}
                    </span>
                  </div>
                </div>
              </div>

              {/* Phases Overview */}
              <div className="bg-white rounded-lg shadow border">
                <div className="p-6 border-b">
                  <h2 className="text-lg font-bold text-gray-900">Project Phases</h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {schedule.phases.map((phase, index) => (
                      <div key={phase.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-medium text-gray-900">
                              Phase {index + 1}: {phase.name}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">{phase.description}</p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(phase.status)}`}>
                            {phase.status}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Duration</span>
                            <div className="font-medium">{phase.duration} days</div>
                          </div>
                          <div>
                            <span className="text-gray-600">Start</span>
                            <div className="font-medium">{formatDate(phase.startDate)}</div>
                          </div>
                          <div>
                            <span className="text-gray-600">End</span>
                            <div className="font-medium">{formatDate(phase.endDate)}</div>
                          </div>
                          <div>
                            <span className="text-gray-600">Progress</span>
                            <div className="font-medium">{phase.progress}%</div>
                          </div>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="mt-3">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full"
                              style={{ width: `${phase.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Gantt Chart Tab */}
          {activeTab === 'gantt' && (
            <Suspense fallback={
              <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            }>
              <GanttChart projectId={selectedProject} />
            </Suspense>
          )}

          {/* WBS Tab */}
          {activeTab === 'wbs' && (
            <Suspense fallback={
              <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            }>
              <WBSBuilder projectId={selectedProject} />
            </Suspense>
          )}

          {/* Budget Tab */}
          {activeTab === 'budget' && (
            <Suspense fallback={
              <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            }>
              <BudgetManager projectId={selectedProject} />
            </Suspense>
          )}

          {/* Milestones Tab */}
          {activeTab === 'milestones' && (
            <div className="bg-white rounded-lg shadow border">
              <div className="p-6 border-b">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-bold text-gray-900">Project Milestones</h2>
                  <button
                    onClick={() => onNavigate('create-milestone', { projectId: selectedProject })}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Add Milestone
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                {milestones.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-lg mb-2">No milestones defined</div>
                    <div className="text-sm">Add milestones to track key project deliverables</div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {milestones.map(milestone => (
                      <div key={milestone.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-medium text-gray-900">{milestone.name}</h3>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(milestone.status)}`}>
                                {milestone.status}
                              </span>
                              {milestone.criticalPath && (
                                <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                                  Critical Path
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mb-3">{milestone.description}</p>
                            
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                              <div>
                                <span className="text-gray-600">Target Date</span>
                                <div className="font-medium">{formatDate(milestone.targetDate)}</div>
                              </div>
                              <div>
                                <span className="text-gray-600">Days Until</span>
                                <div className={`font-medium ${
                                  calculateDaysUntil(milestone.targetDate) < 0 ? 'text-red-600' :
                                  calculateDaysUntil(milestone.targetDate) < 30 ? 'text-yellow-600' :
                                  'text-green-600'
                                }`}>
                                  {calculateDaysUntil(milestone.targetDate)} days
                                </div>
                              </div>
                              <div>
                                <span className="text-gray-600">Progress</span>
                                <div className="font-medium">{milestone.progress}%</div>
                              </div>
                            </div>
                          </div>
                          
                          <button
                            onClick={() => onNavigate('milestone-detail', { milestoneId: milestone.id })}
                            className="px-3 py-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            View Details
                          </button>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="mt-3">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full"
                              style={{ width: `${milestone.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Conflicts Tab */}
          {activeTab === 'conflicts' && (
            <div className="bg-white rounded-lg shadow border">
              <div className="p-6 border-b">
                <h2 className="text-lg font-bold text-gray-900">Schedule Conflicts</h2>
                <p className="text-sm text-gray-600 mt-1">Issues that may impact project timeline</p>
              </div>
              
              <div className="p-6">
                {conflicts.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div className="text-lg mb-2">No conflicts detected</div>
                    <div className="text-sm">Your project schedule looks good!</div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {conflicts.map(conflict => (
                      <div key={conflict.id} className={`border rounded-lg p-4 ${getSeverityColor(conflict.severity)}`}>
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-medium text-gray-900">{conflict.description}</h3>
                            <p className="text-sm text-gray-600 mt-1">Type: {conflict.type}</p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            conflict.severity === 'critical' ? 'bg-red-100 text-red-800' :
                            conflict.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                            conflict.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {conflict.severity}
                          </span>
                        </div>
                        
                        <div className="bg-white bg-opacity-50 rounded p-3 mb-3">
                          <div className="text-sm font-medium text-gray-900 mb-1">Suggested Resolution:</div>
                          <div className="text-sm text-gray-700">{conflict.suggestedResolution}</div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Timeline Impact</span>
                            <div className="font-medium">{conflict.impact.timeline} days</div>
                          </div>
                          <div>
                            <span className="text-gray-600">Budget Impact</span>
                            <div className="font-medium">${conflict.impact.budget.toLocaleString()}</div>
                          </div>
                          <div>
                            <span className="text-gray-600">Quality Impact</span>
                            <div className="font-medium">{conflict.impact.quality}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProjectPlanningScreen;
